import { apiRequest } from "./api.js";

// Inscription d'un nouvel utilisateur
export async function inscrireUtilisateur(nom, email, password) {
    return await apiRequest("/register", {
        method: "POST",
        body: JSON.stringify({
            name: nom,
            email: email,
            password: password,
            password_confirmation: password
        })
    });
}

// Connexion d'un utilisateur existant
export async function connecterUtilisateur(email, password) {
    const data = await apiRequest("/login", {
        method: "POST",
        body: JSON.stringify({
            email: email,
            password: password
        })
    });

    
if (!data.token) {
    throw new Error("Le serveur n'a pas retourné de token.");
}

localStorage.setItem("token", data.token);

return data;


}

// Récupérer l'utilisateur connecté
export async function obtenirUtilisateurConnecte() {
    const token = localStorage.getItem("token");

    
if (!token) {
    throw new Error("Vous devez vous connecter.");
}

return await apiRequest("/user", {
    method: "GET",
    headers: {
        Authorization: `Bearer ${ token } `
    }
});


}

// Déconnexion
export async function deconnecterUtilisateur() {
    const token = localStorage.getItem("token");

    
try {
    if (token) {
        await apiRequest("/logout", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${ token } `
            }
        });
    }
} finally {
    localStorage.removeItem("token");
}


}
