<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\CommandeController ; 

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Produits consultables par tous les utilisateurs connectés
Route::get('/produits', [ProduitController::class, 'index'])
    ->middleware('auth:sanctum');

Route::get('/produits/{produit}', [ProduitController::class, 'show'])
    ->middleware('auth:sanctum');

// Gestion des produits réservée à l'admin
Route::post('/produits', [ProduitController::class, 'store'])
    ->middleware(['auth:sanctum', 'role:admin']);

Route::put('/produits/{produit}', [ProduitController::class, 'update'])
    ->middleware(['auth:sanctum', 'role:admin']);

Route::delete('/produits/{produit}', [ProduitController::class, 'destroy'])
    ->middleware(['auth:sanctum', 'role:admin']);


    // Gestion des clients réservée à l'admin
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/clients', [ClientController::class, 'index']);
    Route::get('/clients/{client}', [ClientController::class, 'show']);
    Route::post('/clients', [ClientController::class, 'store']);
    Route::put('/clients/{client}', [ClientController::class, 'update']);
    Route::delete('/clients/{client}', [ClientController::class, 'destroy']);
});

// routes pour les commandes 

Route::post('/commandes', [CommandeController::class, 'store'])
    ->middleware(['auth:sanctum', 'role:client']);

Route::get('/commandes', [CommandeController::class, 'index'])
    ->middleware(['auth:sanctum', 'role:client']);

Route::get('/commandes/{commande}', [CommandeController::class, 'show'])
    ->middleware(['auth:sanctum', 'role:client']);

// Routes réservées à l'admin
Route::get('/admin/commandes', [CommandeController::class, 'indexAdmin'])
    ->middleware(['auth:sanctum', 'role:admin']);

Route::get('/admin/commandes/{commande}', [CommandeController::class, 'showAdmin'])
    ->middleware(['auth:sanctum', 'role:admin']);    

    //
Route::patch('/admin/commandes/{commande}/statut',
[CommandeController::class, 'updateStatut']
)->middleware(['auth:sanctum', 'role:admin']);