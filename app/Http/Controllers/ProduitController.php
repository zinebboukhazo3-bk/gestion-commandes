<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use Illuminate\Http\Request;

class ProduitController extends Controller
{
    // Afficher tous les produits
    public function index()
    {
        return response()->json(
            Produit::orderBy('id', 'desc')->get()
        );
    }

    // Afficher un produit
    public function show(Produit $produit)
    {
        return response()->json($produit);
    }

    // Créer un produit
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prix' => 'required|numeric|min:0',
            'quantite' => 'required|integer|min:0',
        ]);

        $produit = Produit::create($validated);

        return response()->json([
            'message' => 'Produit créé avec succès.',
            'produit' => $produit,
        ], 201);
    }

    // Modifier un produit
    public function update(Request $request, Produit $produit)
    {
        $validated = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'prix' => 'sometimes|required|numeric|min:0',
            'quantite' => 'sometimes|required|integer|min:0',
        ]);

        $produit->update($validated);

        return response()->json([
            'message' => 'Produit modifié avec succès.',
            'produit' => $produit,
        ]);
    }

    // Supprimer un produit
    public function destroy(Produit $produit)
    {
        $produit->delete();

        return response()->json([
            'message' => 'Produit supprimé avec succès.',
        ]);
    }
}