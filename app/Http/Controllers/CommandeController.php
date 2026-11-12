<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Commande;
use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

class CommandeController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'details' => 'required|array|min:1',
            'details.*.produit_id' => 'required|integer|distinct|exists:produits,id',
            'details.*.quantite' => 'required|integer|min:1',
        ]);

        $user = $request->user();

        // Retrouver le profil client associé au compte connecté
        $client = Client::where('user_id', $user->id)->first();

        if (!$client) {
            return response()->json([
                'message' => 'Aucun profil client associé à ce compte.'
            ], 403);
        }

        $commande = DB::transaction(function () use ($validated, $client) {

            $total = 0;
            $lignes = [];

            // Vérifier le stock et calculer les prix
            foreach ($validated['details'] as $detail) {

                $produit = Produit::whereKey($detail['produit_id'])
                    ->lockForUpdate()
                    ->firstOrFail();

                $quantite = $detail['quantite'];

                if ($produit->quantite < $quantite) {
                    throw ValidationException::withMessages([
                        'details' => [
                            "Stock insuffisant pour le produit : {$produit->nom}."
                        ]
                    ]);
                }

                $prix = $produit->prix;

                $total += $prix * $quantite;

                $lignes[] = [
                    'produit' => $produit,
                    'quantite' => $quantite,
                    'prix' => $prix,
                ];
            }

            // Créer la commande
            $commande = Commande::create([
                'client_id' => $client->id,
                'statut' => 'en_attente',
                'total' => $total,
            ]);

            // Enregistrer les produits et diminuer le stock
            foreach ($lignes as $ligne) {

                $commande->details()->create([
                    'produit_id' => $ligne['produit']->id,
                    'quantite' => $ligne['quantite'],
                    'prix' => $ligne['prix'],
                ]);

                $ligne['produit']->decrement(
                    'quantite',
                    $ligne['quantite']
                );
            }

            return $commande;
        });

        return response()->json([
            'message' => 'Commande créée avec succès.',
            'commande' => $commande->load('details.produit'),
        ], 201);
    }

    // Afficher les commandes du client connecté
public function index(Request $request)
{
    $client = Client::where('user_id', $request->user()->id)
        ->firstOrFail();

    $commandes = Commande::where('client_id', $client->id)
        ->with('details.produit')
        ->orderByDesc('id')
        ->get();

    return response()->json($commandes);
}

// Afficher une commande appartenant au client connecté
public function show(Request $request, Commande $commande)
{
    $client = Client::where('user_id', $request->user()->id)
        ->firstOrFail();

    if ($commande->client_id !== $client->id) {
        return response()->json([
            'message' => 'Accès refusé à cette commande.'
        ], 403);
    }

    return response()->json(
        $commande->load('details.produit')
    );
}

// Afficher toutes les commandes pour l'admin
public function indexAdmin(Request $request)
{
    $validated = $request->validate([
        'per_page' => 'sometimes|integer|min:1|max:50',
        'statut' => [
            'sometimes',
            'string',
            Rule::in([
                'en_attente',
                'confirmee',
                'en_preparation',
                'expediee',
                'livree',
                'annulee',
            ]),
        ],
        'search' => 'sometimes|string|max:100',
    ]);

    $query = Commande::with([
        'client.user',
        'details.produit',
    ]);

    // Filtrer par statut
    if (!empty($validated['statut'])) {
        $query->where('statut', $validated['statut']);
    }

    // Rechercher par nom ou email du client
    if (!empty($validated['search'])) {
        $search = $validated['search'];

        $query->whereHas('client', function ($clientQuery) use ($search) {
            $clientQuery->where('nom', 'like', "%{$search}%")
                ->orWhereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
        });
    }

    $perPage = $validated['per_page'] ?? 10;

    return response()->json(
        $query->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString()
    );
}

// Afficher une commande précise pour l'admin
public function showAdmin(Commande $commande)
{
    $commande->load([
        'client.user',
        'details.produit'
    ]);

    return response()->json($commande);
}


// Modifier le statut d'une commande (admin)
public function updateStatut(Request $request, Commande $commande)
{
    $validated = $request->validate([
        'statut' => [
            'required',
            'string',
            Rule::in([
                'en_attente',
                'confirmee',
                'en_preparation',
                'expediee',
                'livree',
                'annulee',
            ]),
        ],
    ]);

    DB::transaction(function () use ($commande, $validated) {
        $commande = Commande::whereKey($commande->id)
            ->lockForUpdate()
            ->firstOrFail();

        $nouveauStatut = $validated['statut'];

        if ($commande->statut === 'annulee'
            && $nouveauStatut !== 'annulee') {
            throw ValidationException::withMessages([
                'statut' => [
                    'Une commande annulée ne peut pas être réactivée.',
                ],
            ]);
        }

        if ($commande->statut === 'livree'
            && $nouveauStatut !== 'livree') {
            throw ValidationException::withMessages([
                'statut' => [
                    'Une commande livrée ne peut pas changer de statut.',
                ],
            ]);
        }

        if ($nouveauStatut === 'annulee'
            && $commande->statut !== 'annulee') {

            $commande->load('details');

            foreach ($commande->details as $detail) {
                $produit = Produit::whereKey($detail->produit_id)
                    ->lockForUpdate()
                    ->first();

                if ($produit) {
                    $produit->increment(
                        'quantite',
                        $detail->quantite
                    );
                }
            }
        }

        $commande->update([
            'statut' => $nouveauStatut,
        ]);
    });

    return response()->json([
        'message' => 'Statut de la commande modifié avec succès.',
        'commande' => $commande->fresh()->load('details.produit'),
    ]);
}
}