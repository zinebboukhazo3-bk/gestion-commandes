<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Client;
use App\Models\Produit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommandeTest extends TestCase
{
    use RefreshDatabase;

    public function test_un_client_peut_creer_une_commande(): void
    {
        // Créer un utilisateur client
        $user = User::factory()->create([
            'role' => 'client',
        ]);

        // Créer son profil client
        $client = Client::create([
            'user_id' => $user->id,
            'nom' => $user->name,
            'ville' => 'Marrakech',
        ]);

        // Créer un produit avec 10 unités en stock
        $produit = Produit::create([
            'nom' => 'Clavier',
            'prix' => 350,
            'quantite' => 10,
        ]);

        // Simuler l'authentification du client et créer la commande
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/commandes', [
                'details' => [
                    [
                        'produit_id' => $produit->id,
                        'quantite' => 2,
                    ],
                ],
            ]);

        // Vérifier la réponse HTTP
        $response->assertCreated();

        // Vérifier le total de la commande
        $this->assertDatabaseHas('commandes', [
            'client_id' => $client->id,
            'total' => 700,
        ]);

        // Vérifier le détail de la commande
        $this->assertDatabaseHas('commande_details', [
            'produit_id' => $produit->id,
            'quantite' => 2,
            'prix' => 350,
        ]);

        // Vérifier que le stock est passé de 10 à 8
        $this->assertDatabaseHas('produits', [
            'id' => $produit->id,
            'quantite' => 8,
        ]);
    }

    public function test_une_commande_avec_une_quantite_invalide_est_refusee(): void
{
    $user = User::factory()->create([
        'role' => 'client',
    ]);

    Client::create([
        'user_id' => $user->id,
        'nom' => $user->name,
        'ville' => 'Marrakech',
    ]);

    $produit = Produit::create([
        'nom' => 'Clavier',
        'prix' => 350,
        'quantite' => 10,
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/commandes', [
            'details' => [
                [
                    'produit_id' => $produit->id,
                    'quantite' => 0,
                ],
            ],
        ]);

    $response->assertUnprocessable();

    $this->assertDatabaseCount('commandes', 0);

    $this->assertDatabaseHas('produits', [
        'id' => $produit->id,
        'quantite' => 10,
    ]);
}
}