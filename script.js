// Fonction pour réinitialiser le formulaire et le graphique
function resetForm() {
    document.getElementById("calculette-form").reset();
    document.getElementById("resultat").innerHTML = "";
    const canvas = document.getElementById("myChart");
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
}

// Fonction pour ajouter un nouveau loyer
let loyerCount = 1;
function ajouterLoyer() {
    const container = document.getElementById('loyers-container');
    const newLoyer = document.createElement('div');
    newLoyer.className = 'loyer-container';
    newLoyer.innerHTML = `
        <input type="number" id="loyer-${loyerCount}" name="loyer-${loyerCount}" placeholder="Loyer mensuel (€)" required>
        <input type="number" step="0.01" id="duree-location-${loyerCount}" name="duree-location-${loyerCount}" placeholder="Durée (% de l'année)" required>
        <button type="button" onclick="supprimerLoyer(this)">-</button>
    `;
    container.appendChild(newLoyer);
    loyerCount++;
}

// Fonction pour supprimer un loyer
function supprimerLoyer(button) {
    const container = document.getElementById('loyers-container');
    container.removeChild(button.parentElement);
}

// Fonction pour trouver l'année de rentabilité
function trouverAnneeCroisement(prix, tauxAppreciation, mensualite, taxeFonciere, loyerFictif, tauxRendement, dureeMax, dureePret) {
    for (let t = 1; t <= dureeMax; t++) {
        // Calcul du patrimoine achat
        const valeurBien = prix * Math.pow(1 + tauxAppreciation, t);
        const cumulMensualites = t <= dureePret ? mensualite * 12 : 0;
        const cumulTaxeFonciere = taxeFonciere * t;
        const patrimoineAchat = valeurBien - cumulMensualites - cumulTaxeFonciere;

        // Calcul du patrimoine location
        const economiesAnnuelles = loyerFictif * 12;
        const cumulEconomies = economiesAnnuelles * t;
        const patrimoineLocation = cumulEconomies * Math.pow(1 + tauxRendement, t);

        // Vérification du croisement
        if (patrimoineLocation > patrimoineAchat) {
            return t - 1;
        }
    }

    // Aucun croisement trouvé dans la durée spécifiée
    return null;
}

// Fonction pour calculer le cumul de patrimoine en cas d'achat
function calculCumulAchat(prix, tauxAppreciation, mensualite, taxeFonciere, duree, dureePret) {
    const cumulAchat = [];

    for (let t = 1; t <= duree; t++) {
        // Calcul du patrimoine achat
        const valeurBien = prix * Math.pow(1 + tauxAppreciation, t);
        const cumulMensualites = t <= dureePret ? mensualite * 12 : 0;
        const cumulTaxeFonciere = taxeFonciere * t;
        const patrimoineAchat = valeurBien - cumulMensualites - cumulTaxeFonciere;
        cumulAchat.push(patrimoineAchat);
    }

    return cumulAchat;
}

// Fonction pour calculer le cumul de patrimoine en cas de location
function calculCumulLocation(loyerFictif, duree, taxeHabitation, tauxRendement) {
    const cumulLocation = [];

    for (let t = 1; t <= duree; t++) {
        // Calcul du patrimoine location
        const depenseAnnuelles = (loyerFictif * 12) - taxeHabitation;
        const cumulDepenses = depenseAnnuelles * t;
        const patrimoineLocation = cumulDepenses * Math.pow(1 + tauxRendement, t);

        cumulLocation.push(patrimoineLocation);
    }

    return cumulLocation;
}

// Fonction pour générer le rapport
function genererRapport() {
    const prix = parseFloat(document.getElementById('prix').value);
    const notaire = parseFloat(document.getElementById('notaire').value) / 100;
    const tauxAppreciation = parseFloat(document.getElementById('taux-appreciation').value) / 100;
    const commission = parseFloat(document.getElementById('commission').value) / 100;
    const apport = parseFloat(document.getElementById('apport').value);
    const taux = parseFloat(document.getElementById('taux').value) / 100;
    const dureePret = parseInt(document.getElementById('duree-pret').value);
    const loyerFictif = parseFloat(document.getElementById('loyer-fictif').value);
    const taxeHabitation = parseFloat(document.getElementById('taxe-habitation').value);
    const taxeFonciere = parseFloat(document.getElementById('taxe-fonciere').value);
    const tauxRendement = parseFloat(document.getElementById('taux-rendement').value) / 100;
    const dureeMax = 500;

    const fraisNotaire = prix * notaire;
    const fraisCommission = prix * commission;
    const totalAchat = prix + fraisNotaire + fraisCommission;
    const montantEmprunte = totalAchat - apport;
    const mensualite = taux === 0 ? montantEmprunte / (dureePret * 12) : (montantEmprunte * taux / 12) / (1 - Math.pow(1 + taux / 12, -dureePret * 12));
    const coutTotalEmprunt = mensualite * dureePret * 12;
    const coutTotalInterets = coutTotalEmprunt - montantEmprunte;

    const anneeRemboursement = trouverAnneeCroisement(
        prix,       // Valeur initiale du bien immobilier
        tauxAppreciation,  // Taux annuel d'appréciation du bien
        mensualite,        // Mensualité du crédit
        taxeFonciere,      // Taxe foncière annuelle
        loyerFictif,       // Loyer fictif mensuel
        taxeHabitation,    // Taxe d'habitation annuelle
        tauxRendement,     // Taux de rendement annuel des investissements
        dureeMax           // Durée maximale pour rechercher le croisement
    );
    const maxDuree = Math.max(dureePret, anneeRemboursement) + 5; // 5 ans de plus pour voir les évolutions après amortissement
    const cumulLocation = calculCumulLocation(loyerFictif, maxDuree, taxeHabitation, tauxRendement);
    const cumulAchat = calculCumulAchat(prix, tauxAppreciation, mensualite, taxeFonciere, maxDuree, dureePret);


    // Concaténer les résultats et le graphique
    const resultat = `
        <h2>Résultat de la simulation</h2>
        <div>
            <h3>Achat</h3>
            <p>Prix du bien : ${prix.toFixed(2)} €</p>
            <p>Frais de notaire : ${fraisNotaire.toFixed(2)} €</p>
            <p>Taux d'appréciation : ${tauxAppreciation.toFixed(2)} %</p>
            <p>Commission d'agence : ${fraisCommission.toFixed(2)} €</p>
            <p>Total achat : ${totalAchat.toFixed(2)} €</p>
        </div>
        <div>
            <h3>Emprunt</h3>
            <p>Montant emprunté : ${montantEmprunte.toFixed(2)} €</p>
            <p>Taux d'intérêt : ${(taux * 100).toFixed(2)} %</p>
            <p>Mensualité : ${mensualite.toFixed(2)} €</p>
            <p>Intérêts totaux : ${coutTotalInterets.toFixed(2)} €</p>
            <p>Coût total emprunt : ${coutTotalEmprunt.toFixed(2)} €</p>
        </div>
        <div>
            <h3>Financement</h3>
            <p>Loyer fictif mensuel : ${loyerFictif.toFixed(2)} €</p>
            <p>Taxe d'habitation annuelle : ${taxeHabitation.toFixed(2)} €</p>
            <p>Taxe foncière annuelle : ${taxeFonciere.toFixed(2)} €</p>
        </div>
        <div>
            <h3>Amortissement</h3>
            <p>Achat amorti à partir de l'année : ${anneeRemboursement}</p>
        </div>
    `;

    document.getElementById('resultat').innerHTML = resultat;
    // Générer le graphique
    genererGraphique(cumulLocation, cumulAchat, maxDuree);

    const rapportBouton = 
        `
        <button type="button" id="telecharger-button">Télécharger PDF</button>
        `;

    document.getElementById('rapportBouton').innerHTML = rapportBouton;
    
    // Attacher l'événement de téléchargement au bouton
    document.getElementById('telecharger-button').addEventListener('click', telechargerPDF);

}

let myChart = null; // Declare a variable to hold the chart instance globally or in the appropriate scope

// Fonction pour générer le graphique
function genererGraphique(cumulLocation, cumulAchat, maxDuree) {
    // 1. Destroy the existing chart if it exists
    if (myChart) {
        myChart.destroy();
    }

    // 2. Get the canvas element
    const ctx = document.getElementById('myChart').getContext('2d');
    const labels = Array.from({ length: maxDuree + 1 }, (_, i) => `Année ${i}`);
    const maxY = Math.round(Math.max(Math.max(...cumulLocation), Math.max(...cumulAchat)) * 1.01, -2);
    console.log("maxY :", maxY);
    // 3. Create the new chart
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { 
                    label: 'Cumul Patrimoine en Location', 
                    data: cumulLocation, 
                    borderColor: 'rgb(255, 99, 132)', 
                    fill: false 
                },
                { 
                    label: 'Cumul Patrimoine en Achat', 
                    data: cumulAchat, 
                    borderColor: 'rgb(54, 162, 235)', 
                    fill: false 
                }
            ]
        },
        options: {
            responsive: true,
            devicePixelRatio: 2,
            scales: {
                y: {
                    suggestedMax: maxY,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
                        }
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Cumul de Patrimoine dans le temps'
                }
            }
        }
    });
    // 4. Update the HTML content of the canvas element
    document.getElementById('myChart').innerHTML = myChart;
}

// Fonction pour forcer le mode clair
function forcerModeClair() {
    const body = document.body;
    const wasDarkMode = body.classList.contains('dark-mode');
    if (wasDarkMode) {
        body.classList.remove('dark-mode');
    }
    return wasDarkMode;
}

// Fonction pour restaurer le mode après la génération du PDF
function restaurerMode(wasDarkMode) {
    if (wasDarkMode) {
        document.body.classList.add('dark-mode');
    }
}

// Fonction pour télécharger le PDF
function telechargerPDF() {
    const wasDarkMode = forcerModeClair();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text(20, 20, 'Rapport de Simulation du Projet Immobilier');

    const prix = parseFloat(document.getElementById('prix').value);
    const notaire = parseFloat(document.getElementById('notaire').value) / 100;
    const tauxAppreciation = parseFloat(document.getElementById('taux-appreciation').value) / 100;
    const tauxRendement = parseFloat(document.getElementById('taux-rendement').value) / 100;
    const commission = parseFloat(document.getElementById('commission').value) / 100;
    const apport = parseFloat(document.getElementById('apport').value);
    const taux = parseFloat(document.getElementById('taux').value) / 100;
    const dureePret = parseInt(document.getElementById('duree-pret').value);
    const loyerFictif = parseFloat(document.getElementById('loyer-fictif').value);
    const taxeHabitation = parseFloat(document.getElementById('taxe-habitation').value);
    const taxeFonciere = parseFloat(document.getElementById('taxe-fonciere').value);

    const fraisNotaire = prix * notaire;
    const fraisCommission = prix * commission;
    const totalAchat = prix + fraisNotaire + fraisCommission;
    const montantEmprunte = totalAchat - apport;
    const mensualite = taux === 0 ? montantEmprunte / (dureePret * 12) : (montantEmprunte * taux / 12) / (1 - Math.pow(1 + taux / 12, -dureePret * 12));
    const coutTotalEmprunt = mensualite * dureePret * 12;
    const coutTotalInterets = coutTotalEmprunt - montantEmprunte;

    // Tableau Achat
    doc.autoTable({
        head: [['Achat', 'Valeur']],
        body: [
            ['Prix du bien', `${prix.toFixed(2)} €`],
            ['Frais de notaire', `${fraisNotaire.toFixed(2)} €`],
            [`Taux d'appréciation`, `${tauxAppreciation.toFixed(2)} %`],
            [`Commission d'agence`, `${fraisCommission.toFixed(2)} €`],
            ['Total achat', `${totalAchat.toFixed(2)} €`]
        ],
        startY: 20
    });

    // Tableau Emprunt
    doc.autoTable({
        head: [['Emprunt', 'Valeur']],
        body: [
            ['Montant emprunté', `${montantEmprunte.toFixed(2)} €`],
            [`Taux d'intérêt`, `${(taux * 100).toFixed(2)} %`],
            ['Mensualité', `${mensualite.toFixed(2)} €`],
            ['Intérêts totaux', `${coutTotalInterets.toFixed(2)} €`],
            ['Coût total emprunt', `${coutTotalEmprunt.toFixed(2)} €`]
        ],
        startY: doc.previousAutoTable.finalY + 10
    });

    // Tableau Financement
    doc.autoTable({
        head: [['Financement', 'Valeur']],
        body: [
            ['Loyer fictif mensuel', `${loyerFictif.toFixed(2)} €`],
            ['Taxe d\'habitation annuelle', `${taxeHabitation.toFixed(2)} €`],
            ['Taux de rendement', `${tauxRendement.toFixed(2)} %`],
            ['Taxe foncière annuelle', `${taxeFonciere.toFixed(2)} €`]
        ],
        startY: doc.previousAutoTable.finalY + 10
    });

    // Ajouter le graphique au PDF
    const chart = document.getElementById('myChart');
    const chartImage = chart.toDataURL('image/png');
    doc.addImage(chartImage, 'PNG', 15, 200, 180, 90);

    doc.save('rapport-immobilier.pdf');

    restaurerMode(wasDarkMode);
}

// Attacher l'événement de génération de rapport au bouton "Calculer"
document.getElementById('calculer-button').addEventListener('click', genererRapport);