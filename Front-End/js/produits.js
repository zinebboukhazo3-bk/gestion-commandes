// Importer la fonction commune qui communique avec l'API Laravel.
import { apiRequest } from "./api.js";

// Récupérer la liste des produits depuis le Back-End.
export async function obtenirProduits() {
    // Lire le token Sanctum enregistré après la connexion.
    const token = localStorage.getItem("token");

    
// Empêcher l'appel si aucun utilisateur n'est connecté.
if (!token) {
    throw new Error("Vous devez vous connecter pour consulter les produits.");
}

// Envoyer une requête GET à la route protégée des produits.
const reponse = await apiRequest("/produits", {
    method: "GET",

    // Transmettre le token pour que Laravel identifie l'utilisateur.
    headers: {
        Authorization: `Bearer ${ token } `
    }
});

// Laravel peut retourner une liste simple ou une réponse paginée.
// Dans une réponse paginée, les produits se trouvent dans reponse.data.
if (Array.isArray(reponse)) {
    return reponse;
}

if (Array.isArray(reponse.data)) {
    return reponse.data;
}

// Signaler une réponse inattendue plutôt que masquer le problème.
throw new Error("Le format de la réponse des produits est incorrect.");


}
