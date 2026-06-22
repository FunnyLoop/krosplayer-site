let inscriptions = [];
let filtreActuel = "Tous";
let groupes = [];

const tbody = document.getElementById("tableBody");
const rechercheInput = document.getElementById("recherchePerso");
const boutonRecherche = document.getElementById("btnRecherche");
const boutonParticipants = document.getElementById("btnParticipants");
const boutonJours = document.getElementById("btnJours");
const participantsCheckboxes = document.getElementById("participantsCheckboxes");
const joursGroupeCheckboxes = document.getElementById("joursGroupeCheckboxes");

const STORAGE_KEYS = {
    inscriptions: "inscriptions_data",
    groupes: "groupes_data"
};

function genererId() {
    if (window.crypto && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function chargerDepuisStorage(key, valeurParDefaut = []) {
    try {
        const donnees = localStorage.getItem(key);
        return donnees ? JSON.parse(donnees) : valeurParDefaut;
    } catch (error) {
        console.error("Erreur lors du chargement du stockage local", error);
        return valeurParDefaut;
    }
}

function sauvegarderDansStorage(key, valeur) {
    try {
        localStorage.setItem(key, JSON.stringify(valeur));
    } catch (error) {
        console.error("Erreur lors de la sauvegarde du stockage local", error);
    }
}

function sauvegarderDonnees() {
    sauvegarderDansStorage(STORAGE_KEYS.inscriptions, inscriptions);
    sauvegarderDansStorage(STORAGE_KEYS.groupes, groupes);
}

inscriptions = chargerDepuisStorage(STORAGE_KEYS.inscriptions, []);
groupes = chargerDepuisStorage(STORAGE_KEYS.groupes, []);

function ajouterInscription() {
    const nom = document.getElementById("nom").value.trim();
    const personnage = document.getElementById("personnage").value.trim();
    const jours = document.querySelectorAll('.formulaire input[type="checkbox"]:checked');

    if (!nom || !personnage) {
        alert("Remplis tous les champs");
        return;
    }

    if (jours.length === 0) {
        alert("Choisis au moins un jour");
        return;
    }

    jours.forEach(jour => {
        inscriptions.push({
            id: genererId(),
            nom: nom,
            personnage: personnage,
            jour: jour.value
        });
    });

    sauvegarderDonnees();

    document.getElementById("nom").value = "";
    document.getElementById("personnage").value = "";
    jours.forEach(j => j.checked = false);

    afficherJour(filtreActuel);
}

function appliquerRecherche() {
    if (!tbody) return;

    const recherche = rechercheInput
        ? rechercheInput.value.trim().toLowerCase()
        : "";

    let resultat = inscriptions;

    if (filtreActuel !== "Tous") {
        resultat = resultat.filter(
            inscription => inscription.jour === filtreActuel
        );
    }

    if (recherche) {
        resultat = resultat.filter(
            inscription =>
                inscription.personnage.toLowerCase().includes(recherche)
        );
    }

    tbody.innerHTML = "";

    resultat.forEach(inscription => {
        const index = inscriptions.indexOf(inscription);

        tbody.innerHTML += `
            <tr>
                <td>${inscription.nom}</td>
                <td>${inscription.personnage}</td>
                <td>${inscription.jour}</td>
                <td>
                    <button class="supprimer-btn" data-index="${index}" type="button">✖</button>
                </td>
            </tr>
        `;
    });

    chargerParticipants();
}

function afficherJour(jourChoisi) {
    filtreActuel = jourChoisi;
    appliquerRecherche();
}

if (rechercheInput) {
    rechercheInput.addEventListener("input", () => {
        appliquerRecherche();
    });

    rechercheInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            appliquerRecherche();
        }
    });
}

if (boutonRecherche) {
    boutonRecherche.addEventListener("click", () => {
        appliquerRecherche();
    });
}

if (boutonParticipants && participantsCheckboxes) {
    boutonParticipants.addEventListener("click", () => {
        participantsCheckboxes.classList.toggle("hidden");
    });
}

if (boutonJours && joursGroupeCheckboxes) {
    boutonJours.addEventListener("click", () => {
        joursGroupeCheckboxes.classList.toggle("hidden");
    });
}

if (tbody) {
    tbody.addEventListener("click", (event) => {
        const bouton = event.target.closest(".supprimer-btn");

        if (!bouton) return;

        const index = Number(bouton.dataset.index);

        if (Number.isInteger(index) && index >= 0 && index < inscriptions.length) {
            inscriptions.splice(index, 1);
            sauvegarderDonnees();
            appliquerRecherche();
        }
    });
}

function chargerParticipants() {
    const conteneur = document.getElementById("participantsCheckboxes");
    if (!conteneur) return;

    conteneur.innerHTML = "";

    inscriptions.forEach((inscription) => {
        const label = document.createElement("label");
        label.innerHTML = `
            <input type="checkbox" value="${inscription.id}">
            ${inscription.nom} (${inscription.personnage})
        `;
        conteneur.appendChild(label);
    });
}

function creerGroupe() {
    const nom = document.getElementById("nomGroupe").value.trim();
    const checksParticipants = document.querySelectorAll("#participantsCheckboxes input:checked");
    const checksJours = document.querySelectorAll("#joursGroupeCheckboxes input:checked");

    if (!nom) {
        alert("Nom de groupe obligatoire");
        return;
    }

    const membres = Array.from(checksParticipants)
        .map(checkbox => inscriptions.find(inscription => inscription.id === checkbox.value))
        .filter(Boolean);

    const joursChoisis = Array.from(checksJours).map(
        checkbox => checkbox.value
    );

    if (membres.length === 0) {
        alert("Choisis au moins un participant");
        return;
    }

    if (joursChoisis.length === 0) {
        alert("Choisis au moins un jour");
        return;
    }

    groupes.push({
        nom: nom,
        membres: membres,
        jours: joursChoisis
    });

    sauvegarderDonnees();

    document.getElementById("nomGroupe").value = "";
    checksParticipants.forEach(checkbox => checkbox.checked = false);
    checksJours.forEach(checkbox => checkbox.checked = false);

    afficherGroupes();
}

function afficherGroupes() {
    const zone = document.getElementById("listeGroupes");
    if (!zone) return;

    zone.innerHTML = "";

    groupes.forEach((groupe, index) => {
        zone.innerHTML += `
            <div class="carte-groupe">
                <button
                    class="supprimer-groupe-btn"
                    data-index="${index}"
                    type="button"
                    aria-label="Supprimer le groupe ${groupe.nom}"
                >✖</button>
                <h3>${groupe.nom}</h3>
                <p><strong>Membres :</strong></p>
                <ul>
                    ${groupe.membres.map(membre =>
                        `<li>${membre.nom} (${membre.personnage})</li>`
                    ).join("")}
                </ul>
                <p><strong>Jours :</strong> ${groupe.jours.join(", ")}</p>
            </div>
        `;
    });
}

const zoneGroupes = document.getElementById("listeGroupes");

if (zoneGroupes) {
    zoneGroupes.addEventListener("click", (event) => {
        const bouton = event.target.closest(".supprimer-groupe-btn");

        if (!bouton) return;

        const index = Number(bouton.dataset.index);

        if (!Number.isInteger(index) || index < 0 || index >= groupes.length) return;

        const groupe = groupes[index];
        const message = `Voulez-vous vraiment supprimer le groupe "${groupe.nom}" ?`;

        if (window.confirm(message)) {
            groupes.splice(index, 1);
            sauvegarderDonnees();
            afficherGroupes();
        }
    });
}

chargerParticipants();
afficherGroupes();
afficherJour(filtreActuel);