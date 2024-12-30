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

// Fonction pour extraire les loyers depuis le conteneur
function extraireLoyers() {
    let cumulLoyers = 0;
    const loyersContainer = document.getElementById('loyers-container');
    const loyerContainers = loyersContainer.querySelectorAll('.loyer-container');

    if (loyerContainers.length === 0) {
        console.log('Il n\'y a pas de loyers.');
        return cumulLoyers;
    }

    loyerContainers.forEach(container => {
        let loyer = parseFloat(container.querySelector('input[name^="loyer"]').value);
        let dureeLocation = parseFloat(container.querySelector('input[name^="duree-location"]').value);
        cumulLoyers += loyer * (dureeLocation / 100) * 12;
    });
    console.log('Cumul annuel loyers: ', cumulLoyers);
    return cumulLoyers;
}

// Fonction pour trouver l'année de croisement des pertes entre achat et location
function trouverAnneePertesInferieures(prix, fraisNotaire, fraisCommission, apport, mensualite, taxeFonciere, tauxAppreciation, duree, dureePret, loyer, tauxLoyerFictif, cumulLoyers) {
    const coutInitial = prix + fraisNotaire + fraisCommission - apport;
    for (let t = 1; t <= duree; t++) {
        // achat
        const valeurRevente = prix * Math.pow(1 + tauxAppreciation, t);
        const cumulMensualites = t <= dureePret ? mensualite * 12 * t : mensualite * 12 * dureePret;
        const cumulTaxeFonciere = taxeFonciere * t;
        const pertesNettes = coutInitial + cumulMensualites + cumulTaxeFonciere - valeurRevente - cumulLoyers;
        // location
        const cumulLoyer = (loyer * Math.pow(1 + tauxLoyerFictif, t)) * 12 * t;
        console.log('Cumul loyer: ', cumulLoyer, '\nCumul achat: ', pertesNettes);
        if (cumulLoyer > pertesNettes) {
            return t - 1; // Croisement des pertes
        }
    }
    console.log('Pas de croisement des pertes avant ', duree, ' ans');
    return duree; // Pas de croisement des pertes
}

// Fonction pour calculer les pertes en cas d'achat avec revente
function calculPertesAchat(prix, fraisNotaire, fraisCommission, apport, mensualite, taxeFonciere, tauxAppreciation, duree, dureePret, cumulLoyers) {
    const pertesAchat = [];
    const coutInitial = prix + fraisNotaire + fraisCommission - apport;
    for (let t = 1; t <= duree; t++) {
        const valeurRevente = prix * Math.pow(1 + tauxAppreciation, t);
        const cumulMensualites = t <= dureePret ? mensualite * 12 * t : mensualite * 12 * dureePret;
        const cumulTaxeFonciere = taxeFonciere * t;
        const pertesNettes = coutInitial + cumulMensualites + cumulTaxeFonciere - valeurRevente - cumulLoyers;
        pertesAchat.push(pertesNettes);
    }

    return pertesAchat;
}

// Fonction pour calculer les pertes en cas de location
function calculPertesLocation(loyer, duree, tauxLoyerFictif) {
    const pertesLocation = [];
    for (let t = 1; t <= duree; t++) {
        const cumulLoyer = (loyer * Math.pow(1 + tauxLoyerFictif, t)) * 12 * t;
        pertesLocation.push(cumulLoyer);
    }
    return pertesLocation;
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
    const tauxLoyerFictif = parseFloat(document.getElementById('taux-loyer-fictif').value) / 100;
    const dureeMax = 500;

    const fraisNotaire = prix * notaire;
    const fraisCommission = prix * commission;
    const totalAchat = prix + fraisNotaire + fraisCommission;
    const montantEmprunte = totalAchat - apport;
    const mensualite = taux === 0 ? montantEmprunte / (dureePret * 12) : (montantEmprunte * taux / 12) / (1 - Math.pow(1 + taux / 12, -dureePret * 12));
    const coutTotalEmprunt = mensualite * dureePret * 12;
    const coutTotalInterets = coutTotalEmprunt - montantEmprunte;

    const cumulLoyers = extraireLoyers();
    const anneeRemboursement = trouverAnneePertesInferieures(prix, fraisNotaire, fraisCommission, apport, mensualite, taxeFonciere, tauxAppreciation, dureeMax, dureePret, loyerFictif, tauxLoyerFictif, cumulLoyers);
    const maxDuree = Math.max(dureePret, anneeRemboursement) + 5; // 5 ans de plus pour voir les évolutions après amortissement
    const cumulLocation = calculPertesLocation(loyerFictif, maxDuree, tauxLoyerFictif);
    const cumulAchat = calculPertesAchat(prix, fraisNotaire, fraisCommission, apport, mensualite, taxeFonciere, tauxAppreciation, maxDuree, dureePret, cumulLoyers);

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
    // 3. Create the new chart
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { 
                    label: 'Cumul dépenses en Location',
                    data: cumulLocation, 
                    borderColor: 'rgb(255, 99, 132)', 
                    fill: false 
                },
                { 
                    label: 'Cumul dépenses en Achat',
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
    const tauxLoyerFictif = parseFloat(document.getElementById('taux-loyer-fictif').value) / 100;
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
            ['Taux d\'évolution du loyer fictif', `${tauxLoyerFictif.toFixed(2)} %`],
            ['Taxe d\'habitation annuelle', `${taxeHabitation.toFixed(2)} €`],
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