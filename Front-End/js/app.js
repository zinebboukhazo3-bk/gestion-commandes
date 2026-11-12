
/* =========================================================
   1. IMPORTATION DES FONCTIONS
========================================================= */

// Fonctions d'inscription, de connexion, de session et de déconnexion.
import {
    inscrireUtilisateur,
    connecterUtilisateur,
    obtenirUtilisateurConnecte,
    deconnecterUtilisateur
} from "./auth.js";

// Fonction qui récupère les produits depuis Laravel.
import { obtenirProduits } from "./produits.js";

// Fonction qui envoie les requêtes HTTP à l'API Laravel.
import { apiRequest } from "./api.js";


/* =========================================================
   2. RÉCUPÉRATION DES ÉLÉMENTS HTML
========================================================= */

// Éléments généraux et authentification.
const authArea = document.getElementById("authArea");
const pageHeader = document.getElementById("pageHeader");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");

// Informations du compte connecté.
const userSection = document.getElementById("userSection");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const userRole = document.getElementById("userRole");
const logoutButton = document.getElementById("logoutButton");

// Navigation du client.
const clientNavigation = document.getElementById("clientNavigation");
const navProduits = document.getElementById("navProduits");
const navPanier = document.getElementById("navPanier");
const mesCommandesButton = document.getElementById("mesCommandesButton");

// Catalogue.
const produitsSection = document.getElementById("produitsSection");
const produitsMessage = document.getElementById("produitsMessage");
const listeProduits = document.getElementById("listeProduits");

// Panier.
const panierSection = document.getElementById("panierSection");
const listePanier = document.getElementById("listePanier");
const totalPanier = document.getElementById("totalPanier");
const confirmerCommande = document.getElementById("confirmerCommande");
const messageCommande = document.getElementById("messageCommande");

// Historique des commandes du client.
const mesCommandesSection = document.getElementById("mesCommandesSection");
const listeCommandes = document.getElementById("listeCommandes");
const messageMesCommandes = document.getElementById("messageMesCommandes");

// Espace administrateur.
const adminSection = document.getElementById("adminSection");
const adminSidebarName = document.getElementById("adminSidebarName");

// Vues de l'administrateur.
const adminDashboardView = document.getElementById("adminDashboardView");
const adminProduitsView = document.getElementById("adminProduitsView");
const adminCommandesView = document.getElementById("adminCommandesView");

// Boutons de navigation de l'administrateur.
const navAdminDashboard = document.getElementById("navAdminDashboard");
const navAdminProduits = document.getElementById("navAdminProduits");
const navAdminCommandes = document.getElementById("navAdminCommandes");

// Tableau de bord.
const statTotalCommandes = document.getElementById("statTotalCommandes");
const statChiffreAffaires = document.getElementById("statChiffreAffaires");
const statCommandesAttente = document.getElementById("statCommandesAttente");
const statTotalProduits = document.getElementById("statTotalProduits");
const dernieresCommandesAdmin = document.getElementById("dernieresCommandesAdmin");
const messageDashboard = document.getElementById("messageDashboard");
const voirToutesCommandes = document.getElementById("voirToutesCommandes");

// Gestion des produits.
const formAjoutProduit = document.getElementById("formAjoutProduit");
const nomProduit = document.getElementById("nomProduit");
const prixProduit = document.getElementById("prixProduit");
const quantiteProduit = document.getElementById("quantiteProduit");
const messageAjoutProduit = document.getElementById("messageAjoutProduit");
const listeProduitsAdmin = document.getElementById("listeProduitsAdmin");
const messageGestionProduits = document.getElementById("messageGestionProduits");

// Gestion des commandes.
const formRechercheCommandes = document.getElementById("formRechercheCommandes");
const rechercheClient = document.getElementById("rechercheClient");
const filtreStatut = document.getElementById("filtreStatut");
const reinitialiserRechercheCommandes =
    document.getElementById("reinitialiserRechercheCommandes");
const messageCommandesAdmin = document.getElementById("messageCommandesAdmin");
const listeCommandesAdmin = document.getElementById("listeCommandesAdmin");
const paginationCommandesAdmin =
    document.getElementById("paginationCommandesAdmin");


/* =========================================================
   3. VARIABLES ET CONSTANTES
========================================================= */

// Tableau contenant les produits ajoutés au panier.
let panier = [];

// Mémoriser la page actuellement affichée pour la pagination.
let pageCommandesAdmin = 1;

// Nombre de commandes affichées par page dans l'espace administrateur.
const COMMANDES_PAR_PAGE = 2;

// Libellés lisibles des statuts de commande.
const libellesStatuts = {
    en_attente: "En attente",
    confirmee: "Confirmée",
    en_preparation: "En préparation",
    expediee: "Expédiée",
    livree: "Livrée",
    annulee: "Annulée"
};

// Liste des statuts autorisés dans l'interface.
const statutsDisponibles = [
    { valeur: "en_attente", texte: "En attente" },
    { valeur: "confirmee", texte: "Confirmée" },
    { valeur: "en_preparation", texte: "En préparation" },
    { valeur: "expediee", texte: "Expédiée" },
    { valeur: "livree", texte: "Livrée" },
    { valeur: "annulee", texte: "Annulée" }
];


/* =========================================================
   4. FONCTIONS UTILITAIRES
========================================================= */

// Formater un montant en dirhams marocains.
function formaterMontant(montant) {
    const valeur = Number(montant);

    return `${(Number.isFinite(valeur) ? valeur : 0).toFixed(2)} DH`;
}

// Afficher un message avec une couleur adaptée.
function afficherMessage(texte, succes = false) {
    if (!message) return;

    message.textContent = texte;
    message.style.backgroundColor = succes ? "#dcfce7" : "#fee2e2";
    message.style.color = succes ? "#166534" : "#991b1b";
}

// Afficher un message dans une zone particulière.
function afficherMessageZone(element, texte, succes = false) {
    if (!element) return;

    element.textContent = texte;
    element.style.color = succes ? "#166534" : "#b42318";
}

// Récupérer le token Sanctum enregistré dans le navigateur.
function obtenirToken() {
    return localStorage.getItem("token");
}

// Construire les en-têtes d'une requête authentifiée.
function obtenirEntetesAuthentification() {
    const token = obtenirToken();

    if (!token) {
        throw new Error("Votre session a expiré. Veuillez vous reconnecter.");
    }

    return {
        Authorization: `Bearer ${token}`
    };
}

// Récupérer un tableau de produits, y compris si l'API renvoie
// une réponse paginée contenant une propriété data.
function extraireListe(reponse) {
    if (Array.isArray(reponse)) {
        return reponse;
    }

    if (Array.isArray(reponse?.data)) {
        return reponse.data;
    }

    return [];
}

// Créer un élément HTML sans insérer de contenu HTML fourni par l'API.
function creerElement(balise, texte, classe = "") {
    const element = document.createElement(balise);
    element.textContent = texte;

    if (classe) {
        element.className = classe;
    }

    return element;
}


/* =========================================================
   5. NAVIGATION DU CLIENT
========================================================= */

// Afficher une seule section du client à la fois.
function afficherVueClient(vue) {
    if (produitsSection) {
        produitsSection.hidden = vue !== "produits";
    }

    if (panierSection) {
        panierSection.hidden = vue !== "panier";
    }

    if (mesCommandesSection) {
        mesCommandesSection.hidden = vue !== "commandes";
    }

    // Mettre à jour l'apparence du bouton sélectionné.
    const boutons = [
        [navProduits, "produits"],
        [navPanier, "panier"],
        [mesCommandesButton, "commandes"]
    ];

    boutons.forEach(([bouton, nomVue]) => {
        if (!bouton) return;

        bouton.classList.toggle("active", nomVue === vue);

        if (nomVue === vue) {
            bouton.setAttribute("aria-current", "page");
        } else {
            bouton.removeAttribute("aria-current");
        }
    });
}

// Afficher le catalogue lorsque le client clique sur Produits.
navProduits?.addEventListener("click", async () => {
    afficherVueClient("produits");
    await afficherProduits();
});

// Afficher le panier lorsque le client clique sur Panier.
navPanier?.addEventListener("click", () => {
    afficherVueClient("panier");
    afficherPanier();
});

// Afficher l'historique des commandes du client.
mesCommandesButton?.addEventListener("click", async () => {
    afficherVueClient("commandes");
    await afficherMesCommandes();
});


/* =========================================================
   6. NAVIGATION DE L'ADMINISTRATEUR
========================================================= */

// Afficher une seule vue de l'espace administrateur.
function afficherVueAdmin(vue) {
    const vues = [
        [adminDashboardView, "dashboard"],
        [adminProduitsView, "produits"],
        [adminCommandesView, "commandes"]
    ];

    vues.forEach(([section, nomVue]) => {
        if (section) {
            section.hidden = nomVue !== vue;
        }
    });

    // Mettre en évidence le bouton correspondant à la vue active.
    const boutons = [
        [navAdminDashboard, "dashboard"],
        [navAdminProduits, "produits"],
        [navAdminCommandes, "commandes"]
    ];

    boutons.forEach(([bouton, nomVue]) => {
        if (!bouton) return;

        bouton.classList.toggle("active", nomVue === vue);

        if (nomVue === vue) {
            bouton.setAttribute("aria-current", "page");
        } else {
            bouton.removeAttribute("aria-current");
        }
    });
}

// Ouvrir le tableau de bord et actualiser ses statistiques.
navAdminDashboard?.addEventListener("click", async () => {
    afficherVueAdmin("dashboard");
    await chargerDashboardAdmin();
});

// Ouvrir la gestion des produits.
navAdminProduits?.addEventListener("click", async () => {
    afficherVueAdmin("produits");
    await afficherProduitsAdmin();
});

// Ouvrir la gestion des commandes.
navAdminCommandes?.addEventListener("click", async () => {
    afficherVueAdmin("commandes");
    await afficherCommandesAdmin(1);
});

// Depuis le tableau de bord, ouvrir la liste complète des commandes.
voirToutesCommandes?.addEventListener("click", async () => {
    afficherVueAdmin("commandes");
    await afficherCommandesAdmin(1);
});


/* =========================================================
   7. AFFICHER LE COMPTE CONNECTÉ
========================================================= */

function afficherUtilisateur(utilisateur) {
    // Mettre à jour les informations personnelles.
    if (userName) userName.textContent = utilisateur.name ?? "";
    if (userEmail) userEmail.textContent = utilisateur.email ?? "";
    if (userRole) userRole.textContent = utilisateur.role ?? "Non défini";

    // Masquer les formulaires d'authentification.
    if (authArea) {
        authArea.hidden = true;
    } else {
        loginForm?.closest(".auth-section")?.setAttribute("hidden", "");
        registerForm?.closest(".auth-section")?.setAttribute("hidden", "");
    }

    if (pageHeader) pageHeader.hidden = true;
    if (userSection) userSection.hidden = false;

    const estAdmin = utilisateur.role === "admin";

    // Afficher les espaces correspondant au rôle de l'utilisateur.
    if (adminSection) adminSection.hidden = !estAdmin;
    if (clientNavigation) clientNavigation.hidden = estAdmin;

    // Masquer les sections client avant de choisir l'espace adapté.
    if (produitsSection) produitsSection.hidden = true;
    if (panierSection) panierSection.hidden = true;
    if (mesCommandesSection) mesCommandesSection.hidden = true;

    if (estAdmin) {
        // Préparer le nom dans la barre latérale.
        if (adminSidebarName) {
            adminSidebarName.textContent = utilisateur.name ?? "Administrateur";
        }

        // Ouvrir le tableau de bord par défaut.
        afficherVueAdmin("dashboard");

        // Charger les statistiques depuis Laravel.
        chargerDashboardAdmin();
    } else {
        // Afficher le catalogue par défaut pour un client.
        afficherVueClient("produits");
        afficherProduits();
    }
}


/* =========================================================
   8. CONNEXION
========================================================= */

loginForm?.addEventListener("submit", async (event) => {
    // Empêcher le rechargement automatique de la page.
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
        // Envoyer les identifiants à Laravel.
        const reponse = await connecterUtilisateur(email, password);

        // Récupérer le profil à partir de la route protégée.
        const utilisateur = await obtenirUtilisateurConnecte();

        // Afficher l'espace adapté au rôle reçu du serveur.
        afficherUtilisateur(utilisateur);

        afficherMessage(reponse.message || "Connexion réussie !", true);
        loginForm.reset();
    } catch (erreur) {
        afficherMessage(erreur.message || "Échec de la connexion.");
    }
});


/* =========================================================
   9. INSCRIPTION
========================================================= */

registerForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nom = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    try {
        // Créer le compte client dans Laravel.
        const reponse = await inscrireUtilisateur(nom, email, password);

        afficherMessage(
            reponse.message || "Inscription réussie ! Vous pouvez vous connecter.",
            true
        );

        registerForm.reset();
    } catch (erreur) {
        afficherMessage(erreur.message || "Échec de l'inscription.");
    }
});


/* =========================================================
   10. RESTAURER LA SESSION
========================================================= */

async function restaurerSession() {
    // Sans token, conserver l'écran d'authentification.
    if (!obtenirToken()) {
        return;
    }

    try {
        // Vérifier le token auprès de Laravel.
        const utilisateur = await obtenirUtilisateurConnecte();

        // Restaurer l'espace correspondant au rôle de l'utilisateur.
        afficherUtilisateur(utilisateur);
    } catch (erreur) {
        // Supprimer un token invalide ou expiré.
        localStorage.removeItem("token");

        if (userSection) userSection.hidden = true;
        if (adminSection) adminSection.hidden = true;
        if (clientNavigation) clientNavigation.hidden = true;

        if (authArea) {
            authArea.hidden = false;
        } else {
            loginForm?.closest(".auth-section")?.removeAttribute("hidden");
            registerForm?.closest(".auth-section")?.removeAttribute("hidden");
        }

        if (pageHeader) pageHeader.hidden = false;

        afficherMessage("Votre session a expiré. Veuillez vous reconnecter.");
    }
}


/* =========================================================
   11. DÉCONNEXION
========================================================= */

logoutButton?.addEventListener("click", async () => {
    let messageDeconnexion = "Déconnexion réussie.";

    try {
        // Demander à Laravel de révoquer le token courant.
        await deconnecterUtilisateur();
    } catch (erreur) {
        // La fonction de déconnexion peut échouer côté serveur.
        // Le nettoyage de l'interface sera tout de même effectué.
        console.error("Erreur de déconnexion :", erreur);
        messageDeconnexion =
            "La session locale est fermée, mais le serveur a signalé une erreur.";
    } finally {
        // Vider les données temporaires du client.
        panier = [];

        // Masquer les espaces connectés.
        if (userSection) userSection.hidden = true;
        if (adminSection) adminSection.hidden = true;
        if (clientNavigation) clientNavigation.hidden = true;

        if (produitsSection) produitsSection.hidden = true;
        if (panierSection) panierSection.hidden = true;
        if (mesCommandesSection) mesCommandesSection.hidden = true;

        // Réinitialiser les listes et les messages.
        if (listeProduits) listeProduits.replaceChildren();
        if (listePanier) listePanier.replaceChildren();
        if (listeCommandes) listeCommandes.replaceChildren();
        if (listeProduitsAdmin) listeProduitsAdmin.replaceChildren();
        if (listeCommandesAdmin) listeCommandesAdmin.replaceChildren();
        if (dernieresCommandesAdmin) dernieresCommandesAdmin.replaceChildren();

        if (totalPanier) totalPanier.textContent = "0.00 DH";

        if (produitsMessage) produitsMessage.textContent = "";
        if (messageCommande) messageCommande.textContent = "";
        if (messageMesCommandes) messageMesCommandes.textContent = "";
        if (messageAjoutProduit) messageAjoutProduit.textContent = "";
        if (messageGestionProduits) messageGestionProduits.textContent = "";
        if (messageCommandesAdmin) messageCommandesAdmin.textContent = "";
        if (messageDashboard) messageDashboard.textContent = "";

        // Réafficher les formulaires d'authentification.
        if (authArea) {
            authArea.hidden = false;
        } else {
            loginForm?.closest(".auth-section")?.removeAttribute("hidden");
            registerForm?.closest(".auth-section")?.removeAttribute("hidden");
        }

        if (pageHeader) pageHeader.hidden = false;

        afficherMessage(messageDeconnexion, true);
    }
});


/* =========================================================
   12. CHARGER ET AFFICHER LE CATALOGUE
========================================================= */

async function afficherProduits() {
    if (!listeProduits || !produitsMessage) return;

    produitsMessage.textContent = "Chargement des produits...";
    listeProduits.replaceChildren();

    try {
        // Récupérer les produits depuis l'API.
        const reponse = await obtenirProduits();
        const produits = extraireListe(reponse);

        if (produits.length === 0) {
            produitsMessage.textContent = "Aucun produit disponible.";
            return;
        }

        produits.forEach((produit) => {
            const stockDisponible = Number(produit.quantite) || 0;

            // Créer la carte du produit.
            const carte = document.createElement("article");
            carte.className = "produit-card";

            const titre = creerElement("h3", produit.nom ?? "Produit sans nom");
            const prix = creerElement(
                "p",
                `Prix : ${formaterMontant(produit.prix)}`,
                "produit-prix"
            );
            const stock = creerElement(
                "p",
                `Stock disponible : ${stockDisponible}`,
                "produit-stock"
            );

            // Permettre au client de choisir une quantité.
            const champQuantite = document.createElement("input");
            champQuantite.type = "number";
            champQuantite.min = "1";
            champQuantite.max = String(stockDisponible);
            champQuantite.value = stockDisponible > 0 ? "1" : "0";
            champQuantite.disabled = stockDisponible <= 0;
            champQuantite.setAttribute(
                "aria-label",
                `Quantité pour ${produit.nom}`
            );

            // Ajouter le produit au panier au clic.
            const boutonPanier = document.createElement("button");
            boutonPanier.type = "button";
            boutonPanier.textContent =
                stockDisponible > 0 ? "Ajouter au panier" : "Rupture de stock";
            boutonPanier.disabled = stockDisponible <= 0;

            boutonPanier.addEventListener("click", () => {
                const quantite = Number(champQuantite.value);

                // Vérifier la validité de la quantité saisie.
                if (!Number.isInteger(quantite) || quantite < 1) {
                    afficherMessage("Veuillez choisir une quantité valide.");
                    return;
                }

                // Comparer des nombres et non un élément HTML.
                const quantiteDansPanier =
                    panier.find((element) => element.id === produit.id)?.quantite ?? 0;

                if (quantite + quantiteDansPanier > stockDisponible) {
                    afficherMessage(
                        "La quantité demandée dépasse le stock disponible."
                    );
                    return;
                }

                ajouterAuPanier(produit, quantite);
                afficherMessage(`${produit.nom} ajouté au panier !`, true);
            });

            carte.append(titre, prix, stock, champQuantite, boutonPanier);
            listeProduits.appendChild(carte);
        });

        produitsMessage.textContent = "";
    } catch (erreur) {
        produitsMessage.textContent =
            erreur.message || "Impossible de charger les produits.";
    }
}


/* =========================================================
   13. AJOUTER UN PRODUIT AU PANIER
========================================================= */

function ajouterAuPanier(produit, quantite) {
    // Vérifier si le produit existe déjà dans le panier.
    const produitExistant = panier.find(
        (element) => element.id === produit.id
    );

    if (produitExistant) {
        // Augmenter sa quantité si le produit est déjà présent.
        produitExistant.quantite += quantite;
    } else {
        // Sinon, créer une nouvelle ligne de panier.
        panier.push({
            id: produit.id,
            nom: produit.nom,
            prix: Number(produit.prix),
            quantite
        });
    }

    // Actualiser le contenu du panier.
    afficherPanier();
}


/* =========================================================
   14. AFFICHER LE PANIER
========================================================= */

function afficherPanier() {
    if (!listePanier || !totalPanier) return;

    listePanier.replaceChildren();

    let total = 0;

    panier.forEach((produit) => {
        const sousTotal = produit.prix * produit.quantite;
        total += sousTotal;

        const ligne = document.createElement("div");
        ligne.className = "panier-ligne";

        const description = creerElement(
            "p",
            `${produit.nom} — Quantité : ${produit.quantite} — ` +
            `${formaterMontant(produit.prix)} / unité — ` +
            `Sous-total : ${formaterMontant(sousTotal)}`
        );

        const boutonSupprimer = document.createElement("button");
        boutonSupprimer.type = "button";
        boutonSupprimer.textContent = "Supprimer";

        boutonSupprimer.addEventListener("click", () => {
            // Retirer uniquement le produit sélectionné.
            panier = panier.filter((element) => element.id !== produit.id);
            afficherPanier();
        });

        ligne.append(description, boutonSupprimer);
        listePanier.appendChild(ligne);
    });

    totalPanier.textContent = formaterMontant(total);
}


/* =========================================================
   15. CRÉER UNE COMMANDE
========================================================= */

confirmerCommande?.addEventListener("click", async () => {
    if (!messageCommande) return;

    messageCommande.textContent = "";

    // Empêcher la création d'une commande vide.
    if (panier.length === 0) {
        afficherMessageZone(
            messageCommande,
            "Votre panier est vide. Ajoutez des produits avant de continuer."
        );
        return;
    }

    // Vérifier toutes les quantités avant d'envoyer la requête.
    const panierInvalide = panier.some(
        (produit) =>
            !Number.isInteger(produit.quantite) || produit.quantite < 1
    );

    if (panierInvalide) {
        afficherMessageZone(
            messageCommande,
            "Erreur : vérifiez les quantités de votre panier."
        );
        return;
    }

    try {
        // Préparer les détails au format attendu par Laravel.
        const details = panier.map((produit) => ({
            produit_id: produit.id,
            quantite: produit.quantite
        }));

        // Envoyer la commande à l'API protégée.
        const reponse = await apiRequest("/commandes", {
            method: "POST",
            headers: obtenirEntetesAuthentification(),
            body: JSON.stringify({ details })
        });

        // Lire les données de la commande renvoyée par le serveur.
        const commande = reponse.commande;

        if (!commande) {
            throw new Error("La réponse du serveur ne contient pas la commande.");
        }

        // Confirmer la création de la commande.
        afficherMessageZone(
            messageCommande,
            `Commande n° ${commande.id} créée avec succès ! ` +
            `Montant total : ${formaterMontant(commande.total)}.`,
            true
        );

        // Vider le panier seulement après la réussite de la requête.
        panier = [];
        afficherPanier();

        // Actualiser le stock affiché dans le catalogue.
        await afficherProduits();

        // Ouvrir l'historique et afficher la nouvelle commande.
        afficherVueClient("commandes");
        await afficherMesCommandes();
    } catch (erreur) {
        afficherMessageZone(
            messageCommande,
            erreur.message || "Une erreur est survenue lors de la commande."
        );
    }
});


/* =========================================================
   16. HISTORIQUE DES COMMANDES DU CLIENT
========================================================= */

async function afficherMesCommandes() {
    if (!mesCommandesSection || !listeCommandes || !messageMesCommandes) return;

    messageMesCommandes.textContent = "";
    listeCommandes.replaceChildren();

    try {
        // Récupérer les commandes du client connecté.
        const commandes = await apiRequest("/commandes", {
            method: "GET",
            headers: obtenirEntetesAuthentification()
        });

        if (!Array.isArray(commandes) || commandes.length === 0) {
            messageMesCommandes.textContent =
                "Vous n'avez pas encore passé de commande.";
            return;
        }

        commandes.forEach((commande) => {
            const carte = document.createElement("article");
            carte.className = "commande-card";

            const titre = creerElement("h3", `Commande n° ${commande.id}`);
            const montant = creerElement(
                "p",
                `Montant total : ${formaterMontant(commande.total)}`
            );

            const libelleStatut =
                libellesStatuts[commande.statut] ?? commande.statut;

            const statut = creerElement("p", `Statut : ${libelleStatut}`);

            carte.append(titre, montant, statut);

            // Afficher les produits associés à cette commande.
            const titreDetails = creerElement("h4", "Produits commandés");
            carte.appendChild(titreDetails);

            if (Array.isArray(commande.details)) {
                commande.details.forEach((detail) => {
                    const nom = detail.produit?.nom ?? "Produit inconnu";
                    const quantite = Number(detail.quantite) || 0;
                    const prix = Number(detail.prix) || 0;
                    const sousTotal = prix * quantite;

                    const ligne = creerElement(
                        "p",
                        `${nom} — Quantité : ${quantite} — ` +
                        `${formaterMontant(prix)} / unité — ` +
                        `Sous-total : ${formaterMontant(sousTotal)}`
                    );

                    carte.appendChild(ligne);
                });
            }

            listeCommandes.appendChild(carte);
        });
    } catch (erreur) {
        messageMesCommandes.textContent =
            erreur.message || "Impossible de récupérer vos commandes.";
    }
}


/* =========================================================
   17. AJOUTER UN PRODUIT — ADMINISTRATEUR
========================================================= */

formAjoutProduit?.addEventListener("submit", async (event) => {
    event.preventDefault();

    afficherMessageZone(messageAjoutProduit, "");

    // Récupérer et contrôler les données saisies.
    const nom = nomProduit.value.trim();
    const prix = Number(prixProduit.value);
    const quantite = Number(quantiteProduit.value);

    if (
        nom === "" ||
        prixProduit.value.trim() === "" ||
        !Number.isFinite(prix) ||
        prix <= 0 ||
        quantiteProduit.value.trim() === "" ||
        !Number.isInteger(quantite) ||
        quantite < 0
    ) {
        afficherMessageZone(
            messageAjoutProduit,
            "Veuillez vérifier le nom, le prix et la quantité."
        );
        return;
    }

    try {
        // Envoyer le nouveau produit à Laravel.
        const reponse = await apiRequest("/produits", {
            method: "POST",
            headers: obtenirEntetesAuthentification(),
            body: JSON.stringify({ nom, prix, quantite })
        });

        afficherMessageZone(
            messageAjoutProduit,
            reponse.message || "Produit ajouté avec succès.",
            true
        );

        formAjoutProduit.reset();

        // Actualiser la liste des produits et les statistiques.
        await afficherProduitsAdmin();
        await chargerDashboardAdmin();
    } catch (erreur) {
        afficherMessageZone(
            messageAjoutProduit,
            erreur.message || "Impossible d'ajouter le produit."
        );
    }
});



/* =========================================================
   18. GESTION DES PRODUITS — ADMINISTRATEUR
   ========================================================= */

async function afficherProduitsAdmin() {
    // Vérifier que la zone d'affichage existe dans le HTML.
    if (!listeProduitsAdmin) return;

    // Effacer la liste précédente avant de charger les produits.
    listeProduitsAdmin.replaceChildren();

    try {
        // Récupérer les produits depuis l'API Laravel.
        const reponse = await obtenirProduits();
        const produits = extraireListe(reponse);

        // Afficher un message si aucun produit n'existe.
        if (produits.length === 0) {
            listeProduitsAdmin.textContent = "Aucun produit disponible.";
            return;
        }

        // Créer une carte pour chaque produit.
        produits.forEach((produit) => {
            const carte = document.createElement("article");
            carte.className = "produit-card";

            // Afficher les informations actuelles du produit.
            const nom = creerElement("h3", produit.nom ?? "Produit sans nom");
            const prix = creerElement(
                "p",
                `Prix : ${formaterMontant(produit.prix)}`
            );
            const stock = creerElement(
                "p",
                `Stock : ${Number(produit.quantite) || 0}`
            );

            // Créer le bouton de modification.
            const boutonModifier = document.createElement("button");
            boutonModifier.type = "button";
            boutonModifier.textContent = "Modifier";

            boutonModifier.addEventListener("click", () => {
                // Empêcher d'ouvrir plusieurs formulaires sur la même carte.
                if (carte.querySelector(".form-modification-produit")) return;

                // Préparer le formulaire directement dans la carte.
                const formulaire = document.createElement("form");
                formulaire.className = "form-modification-produit";

                // Créer un champ avec son label et sa valeur initiale.
                function creerChamp(labelTexte, type, valeur, nomChamp) {
                    const groupe = document.createElement("div");
                    groupe.className = "champ-formulaire";

                    const label = document.createElement("label");
                    label.textContent = labelTexte;

                    const input = document.createElement("input");
                    input.type = type;
                    input.name = nomChamp;
                    input.value = valeur ?? "";
                    input.required = true;

                    // Ajouter les règles adaptées aux nombres.
                    if (type === "number" && nomChamp === "prix") {
                        input.min = "0.01";
                        input.step = "0.01";
                    }

                    if (type === "number" && nomChamp === "quantite") {
                        input.min = "0";
                        input.step = "1";
                    }

                    // Relier le label au champ pour l'accessibilité.
                    label.htmlFor = `produit-${produit.id}-${nomChamp}`;
                    input.id = label.htmlFor;

                    groupe.append(label, input);

                    return { groupe, input };
                }

                // Créer les trois champs préremplis.
                const champNom = creerChamp(
                    "Nom du produit",
                    "text",
                    produit.nom,
                    "nom"
                );

                const champPrix = creerChamp(
                    "Prix (DH)",
                    "number",
                    produit.prix,
                    "prix"
                );

                const champQuantite = creerChamp(
                    "Quantité en stock",
                    "number",
                    produit.quantite,
                    "quantite"
                );

                // Zone qui affichera les erreurs ou le succès.
                const messageFormulaire = creerElement("p", "");
                messageFormulaire.setAttribute("role", "status");

                // Bouton pour enregistrer les modifications.
                const boutonEnregistrer = document.createElement("button");
                boutonEnregistrer.type = "submit";
                boutonEnregistrer.textContent = "Enregistrer";

                // Bouton pour abandonner la modification.
                const boutonAnnuler = document.createElement("button");
                boutonAnnuler.type = "button";
                boutonAnnuler.textContent = "Annuler";

                boutonAnnuler.addEventListener("click", async () => {
                    // Recharger la carte sans envoyer de requête à Laravel.
                    await afficherProduitsAdmin();
                });

                // Ajouter tous les éléments au formulaire.
                formulaire.append(
                    champNom.groupe,
                    champPrix.groupe,
                    champQuantite.groupe,
                    messageFormulaire,
                    boutonEnregistrer,
                    boutonAnnuler
                );

                // Remplacer les informations par le formulaire.
                carte.replaceChildren(formulaire);

                // Traiter l'enregistrement du formulaire.
                formulaire.addEventListener("submit", async (event) => {
                    // Empêcher le rechargement de la page.
                    event.preventDefault();

                    // Récupérer les valeurs saisies.
                    const nouveauNom = champNom.input.value.trim();
                    const nouveauPrix = Number(champPrix.input.value);
                    const nouvelleQuantite = Number(
                        champQuantite.input.value
                    );

                    // Vérifier les valeurs avant l'envoi à Laravel.
                    if (
                        nouveauNom === "" ||
                        champPrix.input.value.trim() === "" ||
                        !Number.isFinite(nouveauPrix) ||
                        nouveauPrix <= 0 ||
                        champQuantite.input.value.trim() === "" ||
                        !Number.isInteger(nouvelleQuantite) ||
                        nouvelleQuantite < 0
                    ) {
                        messageFormulaire.textContent =
                            "Vérifiez le nom, le prix et la quantité.";
                        messageFormulaire.style.color = "#b42318";
                        return;
                    }

                    try {
                        // Désactiver les boutons pendant l'enregistrement.
                        boutonEnregistrer.disabled = true;
                        boutonAnnuler.disabled = true;
                        messageFormulaire.textContent =
                            "Enregistrement en cours...";

                        // Envoyer les nouvelles données à l'API Laravel.
                        await apiRequest(`/produits/${produit.id}`, {
                            method: "PUT",
                            headers: obtenirEntetesAuthentification(),
                            body: JSON.stringify({
                                nom: nouveauNom,
                                prix: nouveauPrix,
                                quantite: nouvelleQuantite
                            })
                        });

                        // Afficher un message de réussite.
                        afficherMessageZone(
                            messageGestionProduits,
                            "Produit modifié avec succès.",
                            true
                        );

                        // Recharger la liste et les statistiques.
                        await afficherProduitsAdmin();
                        await chargerDashboardAdmin();

                    } catch (erreur) {
                        // Afficher l'erreur et permettre une nouvelle tentative.
                        messageFormulaire.textContent =
                            erreur.message ||
                            "Impossible de modifier le produit.";
                        messageFormulaire.style.color = "#b42318";

                        boutonEnregistrer.disabled = false;
                        boutonAnnuler.disabled = false;
                    }
                });
            });

            // Créer le bouton de suppression.
            const boutonSupprimer = document.createElement("button");
            boutonSupprimer.type = "button";
            boutonSupprimer.textContent = "Supprimer";

            boutonSupprimer.addEventListener("click", async () => {
                // Demander confirmation avant une suppression définitive.
                const confirmation = confirm(
                    `Voulez-vous vraiment supprimer le produit "${produit.nom}" ?`
                );

                if (!confirmation) return;

                try {
                    // Envoyer la demande de suppression à Laravel.
                    await apiRequest(`/produits/${produit.id}`, {
                        method: "DELETE",
                        headers: obtenirEntetesAuthentification()
                    });

                    // Confirmer la suppression et actualiser l'interface.
                    afficherMessageZone(
                        messageGestionProduits,
                        "Produit supprimé avec succès.",
                        true
                    );

                    await afficherProduitsAdmin();
                    await chargerDashboardAdmin();

                } catch (erreur) {
                    // Afficher l'erreur si la suppression échoue.
                    afficherMessageZone(
                        messageGestionProduits,
                        erreur.message ||
                        "Impossible de supprimer le produit."
                    );
                }
            });

            // Ajouter les informations et les boutons à la carte.
            carte.append(
                nom,
                prix,
                stock,
                boutonModifier,
                boutonSupprimer
            );

            // Ajouter la carte à la liste des produits administrateur.
            listeProduitsAdmin.appendChild(carte);
        });

    } catch (erreur) {
        // Afficher une erreur si la récupération des produits échoue.
        afficherMessageZone(
            messageGestionProduits,
            erreur.message || "Impossible de charger les produits."
        );
    }
}

/* =========================================================
   19. RÉCUPÉRER LES COMMANDES DE L'ADMINISTRATEUR
========================================================= */

// Cette fonction récupère toutes les pages de commandes.
// Elle sert au tableau de bord et ne remplace pas la pagination
// de la liste de gestion des commandes.
async function obtenirToutesLesCommandesAdmin() {
    const toutesLesCommandes = [];
    let page = 1;
    let dernierePage = 1;

    do {
        const params = new URLSearchParams();

        // Demander jusqu'à 50 commandes par requête.
        params.set("per_page", "50");
        params.set("page", String(page));

        const reponse = await apiRequest(
            `/admin/commandes?${params.toString()}`,
            { headers: obtenirEntetesAuthentification() }
        );

        // Vérifier que Laravel renvoie un tableau paginé.
        if (!Array.isArray(reponse.data)) {
            throw new Error("Format de réponse des commandes inattendu.");
        }

        toutesLesCommandes.push(...reponse.data);

        dernierePage = Number(reponse.last_page) || 1;
        page += 1;
    } while (page <= dernierePage);

    return toutesLesCommandes;
}


/* =========================================================
   20. TABLEAU DE BORD ADMINISTRATEUR
========================================================= */

async function chargerDashboardAdmin() {
    if (!statTotalCommandes || !dernieresCommandesAdmin) return;

    if (messageDashboard) {
        messageDashboard.textContent = "Chargement du tableau de bord...";
    }

    try {
        // Charger les produits et toutes les commandes depuis Laravel.
        const [reponseProduits, commandes] = await Promise.all([
            obtenirProduits(),
            obtenirToutesLesCommandesAdmin()
        ]);

        const produits = extraireListe(reponseProduits);

        // Calculer le nombre total de commandes et de produits.
        statTotalCommandes.textContent = String(commandes.length);
        if (statTotalProduits) {
            statTotalProduits.textContent = String(
                Number(reponseProduits?.total) || produits.length
            );
        }

        // Compter les commandes qui attendent encore un traitement.
        const commandesEnAttente = commandes.filter(
            (commande) => commande.statut === "en_attente"
        );

        if (statCommandesAttente) {
            statCommandesAttente.textContent = String(commandesEnAttente.length);
        }

        // Le chiffre d'affaires affiché correspond ici aux commandes livrées.
        // Une commande annulée ou non livrée n'est donc pas comptabilisée.
        const chiffreAffaires = commandes
            .filter((commande) => commande.statut === "livree")
            .reduce(
                (total, commande) => total + (Number(commande.total) || 0),
                0
            );

        if (statChiffreAffaires) {
            statChiffreAffaires.textContent = formaterMontant(chiffreAffaires);
        }

        // Trier les commandes par date décroissante pour trouver les plus récentes.
        const commandesRecentes = [...commandes].sort((a, b) => {
            const dateA = new Date(a.created_at ?? 0).getTime();
            const dateB = new Date(b.created_at ?? 0).getTime();

            // En cas de date manquante ou identique, utiliser l'identifiant.
            if (dateA === dateB || !Number.isFinite(dateA) || !Number.isFinite(dateB)) {
                return Number(b.id) - Number(a.id);
            }

            return dateB - dateA;
        }).slice(0, 5);

        // Vider l'ancien tableau avant d'afficher les nouvelles lignes.
        dernieresCommandesAdmin.replaceChildren();

        if (commandesRecentes.length === 0) {
            const ligne = document.createElement("tr");
            const cellule = creerElement("td", "Aucune commande pour le moment.");
            cellule.colSpan = 5;
            ligne.appendChild(cellule);
            dernieresCommandesAdmin.appendChild(ligne);
        } else {
            commandesRecentes.forEach((commande) => {
                const ligne = document.createElement("tr");

                const nomClient =
                    commande.client?.user?.name ??
                    commande.client?.nom ??
                    "Client inconnu";

                const date = commande.created_at
                    ? new Date(commande.created_at).toLocaleDateString("fr-FR")
                    : "Non disponible";

                const statut =
                    libellesStatuts[commande.statut] ?? commande.statut;

                // Créer chaque cellule sans injecter de HTML non fiable.
                ligne.append(
                    creerElement("td", `#${commande.id}`),
                    creerElement("td", nomClient),
                    creerElement("td", formaterMontant(commande.total)),
                    creerElement("td", statut),
                    creerElement("td", date)
                );

                dernieresCommandesAdmin.appendChild(ligne);
            });
        }

        if (messageDashboard) {
            messageDashboard.textContent = "";
        }
    } catch (erreur) {
        if (messageDashboard) {
            messageDashboard.textContent =
                erreur.message || "Impossible de charger le tableau de bord.";
        }

        console.error("Erreur du tableau de bord :", erreur);
    }
}


/* =========================================================
   21. LISTE PAGINÉE DES COMMANDES — ADMINISTRATEUR
========================================================= */

async function afficherCommandesAdmin(page = 1) {
    if (!listeCommandesAdmin || !paginationCommandesAdmin) return;

    pageCommandesAdmin = page;

    try {
        if (messageCommandesAdmin) {
            messageCommandesAdmin.textContent = "Chargement des commandes...";
        }

        // Construire les paramètres de pagination et de recherche.
        const params = new URLSearchParams();
        params.set("per_page", String(COMMANDES_PAR_PAGE));
        params.set("page", String(page));

        if (rechercheClient?.value.trim()) {
            params.set("search", rechercheClient.value.trim());
        }

        if (filtreStatut?.value) {
            params.set("statut", filtreStatut.value);
        }

        // Récupérer la page demandée depuis Laravel.
        const reponse = await apiRequest(
            `/admin/commandes?${params.toString()}`,
            { headers: obtenirEntetesAuthentification() }
        );

        const commandes = Array.isArray(reponse.data) ? reponse.data : [];

        listeCommandesAdmin.replaceChildren();
        paginationCommandesAdmin.replaceChildren();

        if (commandes.length === 0) {
            if (messageCommandesAdmin) {
                messageCommandesAdmin.textContent = "Aucune commande trouvée.";
            }
            return;
        }

        commandes.forEach((commande) => {
            const carte = document.createElement("article");
            carte.className = "commande-card";

            const titre = creerElement("h3", `Commande n° ${commande.id}`);

            const client = creerElement(
                "p",
                `Client : ${commande.client?.user?.name ??
                commande.client?.nom ??
                "Nom non disponible"
                }`
            );

            const email = creerElement(
                "p",
                `Email : ${commande.client?.user?.email ??
                commande.client?.email ??
                "Non disponible"
                }`
            );

            const libelleStatut =
                libellesStatuts[commande.statut] ?? commande.statut;

            const statut = creerElement("p", `Statut actuel : ${libelleStatut}`);

            const total = creerElement(
                "p",
                `Total : ${formaterMontant(commande.total)}`
            );

            const date = commande.created_at
                ? new Date(commande.created_at).toLocaleString("fr-FR")
                : "Non disponible";

            const dateCommande = creerElement("p", `Date : ${date}`);

            // Créer le menu permettant de choisir un autre statut.
            const selectStatut = document.createElement("select");
            selectStatut.setAttribute(
                "aria-label",
                `Statut de la commande ${commande.id}`
            );

            statutsDisponibles.forEach((element) => {
                const option = document.createElement("option");
                option.value = element.valeur;
                option.textContent = element.texte;
                option.selected = element.valeur === commande.statut;
                selectStatut.appendChild(option);
            });

            const boutonStatut = document.createElement("button");
            boutonStatut.type = "button";
            boutonStatut.textContent = "Modifier le statut";

            const messageStatut = creerElement("p", "");
            messageStatut.setAttribute("role", "status");

            boutonStatut.addEventListener("click", async () => {
                const nouveauStatut = selectStatut.value;

                // Ne rien envoyer si le statut est inchangé.
                if (nouveauStatut === commande.statut) {
                    messageStatut.textContent = "Le statut n'a pas changé.";
                    return;
                }

                const confirmation = confirm(
                    `Voulez-vous changer le statut de la commande n° ` +
                    `${commande.id} en "${libellesStatuts[nouveauStatut]}" ?`
                );

                if (!confirmation) {
                    messageStatut.textContent = "Modification annulée.";
                    return;
                }

                boutonStatut.disabled = true;
                messageStatut.textContent = "Modification en cours...";

                try {
                    // Envoyer le nouveau statut à la route protégée de Laravel.
                    await apiRequest(
                        `/admin/commandes/${commande.id}/statut`,
                        {
                            method: "PATCH",
                            headers: obtenirEntetesAuthentification(),
                            body: JSON.stringify({ statut: nouveauStatut })
                        }
                    );

                    messageStatut.textContent = "Statut modifié avec succès.";

                    // Actualiser la liste et les statistiques.
                    await afficherCommandesAdmin(pageCommandesAdmin);
                    await chargerDashboardAdmin();
                } catch (erreur) {
                    messageStatut.textContent =
                        erreur.message || "La modification du statut a échoué.";
                } finally {
                    boutonStatut.disabled = false;
                }
            });

            // Afficher les produits contenus dans la commande.
            const titreDetails = creerElement("h4", "Produits commandés");
            const listeDetails = document.createElement("ul");

            (commande.details ?? []).forEach((detail) => {
                const nomProduit = detail.produit?.nom ?? "Produit inconnu";
                const quantite = Number(detail.quantite) || 0;
                const prix = Number(detail.prix) || 0;
                const sousTotal = quantite * prix;

                const element = creerElement(
                    "li",
                    `${nomProduit} — Quantité : ${quantite} — ` +
                    `${formaterMontant(prix)} / unité — ` +
                    `Sous-total : ${formaterMontant(sousTotal)}`
                );

                listeDetails.appendChild(element);
            });

            carte.append(
                titre,
                client,
                email,
                statut,
                total,
                dateCommande,
                titreDetails,
                listeDetails,
                selectStatut,
                boutonStatut,
                messageStatut
            );

            listeCommandesAdmin.appendChild(carte);
        });

        // Afficher les informations de pagination.
        const pageActuelle = Number(reponse.current_page) || page;
        const dernierePage = Number(reponse.last_page) || 1;
        const nombreTotal = Number(reponse.total) || commandes.length;

        if (messageCommandesAdmin) {
            messageCommandesAdmin.textContent =
                `Page ${pageActuelle} sur ${dernierePage} — ` +
                `${nombreTotal} commande(s) au total.`;
        }

        // Ajouter le bouton Précédent uniquement si nécessaire.
        if (pageActuelle > 1) {
            const precedent = document.createElement("button");
            precedent.type = "button";
            precedent.textContent = "Précédent";

            precedent.addEventListener("click", () => {
                afficherCommandesAdmin(pageActuelle - 1);
            });

            paginationCommandesAdmin.appendChild(precedent);
        }

        // Ajouter le bouton Suivant uniquement si une autre page existe.
        if (pageActuelle < dernierePage) {
            const suivant = document.createElement("button");
            suivant.type = "button";
            suivant.textContent = "Suivant";

            suivant.addEventListener("click", () => {
                afficherCommandesAdmin(pageActuelle + 1);
            });

            paginationCommandesAdmin.appendChild(suivant);
        }
    } catch (erreur) {
        if (messageCommandesAdmin) {
            messageCommandesAdmin.textContent =
                erreur.message || "Impossible de charger les commandes.";
        }

        listeCommandesAdmin.replaceChildren();
        paginationCommandesAdmin.replaceChildren();

        console.error("Erreur de chargement des commandes :", erreur);
    }
}


/* =========================================================
   22. RECHERCHE ET FILTRAGE DES COMMANDES
========================================================= */

// Rechercher par nom ou email et filtrer par statut.
formRechercheCommandes?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await afficherCommandesAdmin(1);
});

// Réinitialiser les filtres.
reinitialiserRechercheCommandes?.addEventListener("click", async () => {
    if (rechercheClient) rechercheClient.value = "";
    if (filtreStatut) filtreStatut.value = "";

    await afficherCommandesAdmin(1);
});


/* =========================================================
   23. DÉMARRAGE DE L'APPLICATION
========================================================= */

// Vérifier la session au chargement de la page.
restaurerSession();