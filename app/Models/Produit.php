<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Produit extends Model
{
    protected $fillable = [
        'nom',
        'prix',
        'quantite',
    ];

    public function commandeDetails(): HasMany
    {
        return $this->hasMany(CommandeDetail::class);
    }
}