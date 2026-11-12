const API_URL = "http://127.0.0.1:8000/api";

/**

* Fonction générale pour envoyer des requêtes à l'API Laravel.
  */
export async function apiRequest(endpoint, options = {}) {
    const config = {
        ...options,
        headers: {
            Accept: "application/json",
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers
        }
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);

    let data;

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (!response.ok) {
        const message =
            data.message ||
            "Une erreur est survenue lors de la communication avec le serveur.";
        
   throw new Error(message);
  

    }

    return data;
}
