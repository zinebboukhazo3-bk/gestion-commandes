<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommandeSecurityTest extends TestCase
{
    use RefreshDatabase;

   public function test_un_client_ne_peut_pas_voir_la_commande_d_un_autre_client(): void
{
    $user1 = User::factory()->create([
        'role' => 'client',
    ]);

    $client1 = \App\Models\Client::create([
        'user_id' => $user1->id,
        'nom' => $user1->name,
    ]);

    $user2 = User::factory()->create([
        'role' => 'client',
    ]);

    $client2 = \App\Models\Client::create([
        'user_id' => $user2->id,
        'nom' => $user2->name,
    ]);

    $commande = \App\Models\Commande::create([
        'client_id' => $client2->id,
        'statut' => 'en_attente',
        'total' => 700,
    ]);

    $response = $this->actingAs($user1, 'sanctum')
        ->getJson('/api/commandes/' . $commande->id);

    $response->assertForbidden();
}
    
}