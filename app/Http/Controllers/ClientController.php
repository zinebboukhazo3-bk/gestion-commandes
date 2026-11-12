<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    // Afficher tous les clients
    public function index()
    {
        return response()->json(
            Client::with('user')->orderBy('id', 'desc')->get()
        );
    }

    // Afficher un client
    public function show(Client $client)
    {
        return response()->json($client->load('user'));
    }

    // Créer un client
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'nom' => 'required|string|max:255',
            'ville' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:30',
        ]);

        if (Client::where('user_id', $validated['user_id'])->exists()) {
            return response()->json([
                'message' => 'Cet utilisateur possède déjà un profil client.'
            ], 422);
        }

        $client = Client::create($validated);

        return response()->json([
            'message' => 'Client créé avec succès.',
            'client' => $client,
        ], 201);
    }

    // Modifier un client
    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'ville' => 'sometimes|nullable|string|max:255',
            'telephone' => 'sometimes|nullable|string|max:30',
        ]);

        $client->update($validated);

        return response()->json([
            'message' => 'Client modifié avec succès.',
            'client' => $client,
        ]);
    }

    // Supprimer un client
    public function destroy(Client $client)
    {
        $client->delete();

        return response()->json([
            'message' => 'Client supprimé avec succès.',
        ]);
    }
}