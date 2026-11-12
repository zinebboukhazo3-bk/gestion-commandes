<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Client;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
   
       public function register(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email',
        'password' => 'required|string|min:8',
    ]);
    // DB::transaction() garantit que si la création du profil échoue, 
    // la création du compte est annulée aussi. 
    // On évite ainsi d'avoir un utilisateur sans profil client.
    $user = DB::transaction(function () use ($validated) {

        // 1. Créer le compte utilisateur
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'client',
        ]);

        // 2. Créer le profil client associé
        Client::create([
            'user_id' => $user->id,
            'nom' => $user->name,
        ]);

        return $user;
    });

    // 3. Générer le token de connexion
    $token = $user->createToken('api-token')->plainTextToken;

    return response()->json([
        'message' => 'Inscription réussie.',
        'user' => $user,
        'token' => $token,
    ], 201);

    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Email ou mot de passe incorrect.'
            ], 401);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie.',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie.'
        ]);
    }
}