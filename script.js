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

// Fonction pour calculer le cumul mensuel de patrimoine en location
function calculCumulLocation(loyerFictif, duree, taxeHabitation) {
    const cumulLocation = [];
    for (let i = 0; i <= duree; i++) {
        cumulLocation.push(loyerFictif * 12 * i + taxeHabitation);
    }
    return cumulLocation;
}

// Fonction pour calculer le cumul mensuel de patrimoine en achat
function calculCumulAchat(mensualite, taxeFonciere, duree) {
    const cumulAchat = [];
    let cumul = 0;
    for (let i = 0; i <= duree; i++) {
        cumul += mensualite * 12  + taxeFonciere;
        cumulAchat.push(cumul);
    }
    return cumulAchat;
}

// Fonction pour générer le rapport
function genererRapport() {
    const prix = parseFloat(document.getElementById('prix').value);
    const notaire = parseFloat(document.getElementById('notaire').value) / 100;
    const commission = parseFloat(document.getElementById('commission').value) / 100;
    const apport = parseFloat(document.getElementById('apport').value);
    const taux = parseFloat(document.getElementById('taux').value) / 100;
    const duree = parseInt(document.getElementById('duree').value);
    const loyerFictif = parseFloat(document.getElementById('loyer-fictif').value);
    const taxeHabitation = parseFloat(document.getElementById('taxe_habitation').value);
    const taxeFonciere = parseFloat(document.getElementById('taxe_fonciere').value);

    const fraisNotaire = prix * notaire;
    const fraisCommission = prix * commission;
    const totalAchat = prix + fraisNotaire + fraisCommission;
    const montantEmprunte = totalAchat - apport;
    const mensualite = taux === 0 ? montantEmprunte / (duree * 12) : (montantEmprunte * taux / 12) / (1 - Math.pow(1 + taux / 12, -duree * 12));
    const coutTotalEmprunt = mensualite * duree * 12;
    const coutTotalInterets = coutTotalEmprunt - montantEmprunte;

    const cumulLocation = calculCumulLocation(loyerFictif, duree, taxeHabitation);
    const cumulAchat = calculCumulAchat(mensualite, taxeFonciere, duree);

    const resultat = `
        <h2>Résultat de la simulation</h2>
        <div>
            <h3>Achat</h3>
            <p>Prix du bien : ${prix.toFixed(2)} €</p>
            <p>Frais de notaire : ${fraisNotaire.toFixed(2)} €</p>
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
        <button type="button" id="telecharger-button">Télécharger PDF</button>
    `;

    document.getElementById('resultat').innerHTML = resultat;

    // Attacher l'événement de téléchargement au bouton
    document.getElementById('telecharger-button').addEventListener('click', telechargerPDF);

    // Générer le graphique
    genererGraphique(cumulLocation, cumulAchat, duree);
}

// Fonction pour générer le graphique
function genererGraphique(cumulLocation, cumulAchat, duree) {
    const ctx = document.getElementById('myChart').getContext('2d');
    const labels = Array.from({ length: duree + 1 }, (_, i) => `Année ${i}`);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: 'Cumul Patrimoine en Location', data: cumulLocation, borderColor: 'rgb(255, 99, 132)', fill: false },
                { label: 'Cumul Patrimoine en Achat', data: cumulAchat, borderColor: 'rgb(54, 162, 235)', fill: false }
            ]
        },
        options: {
            responsive: true,
            title: { display: true, text: 'Cumul de Patrimoine dans le Temps' }
        }
    });
}

// Fonction pour télécharger le PDF
function telechargerPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text(20, 20, 'Rapport de Simulation du Projet Immobilier');

    const prix = parseFloat(document.getElementById('prix').value);
    const notaire = parseFloat(document.getElementById('notaire').value) / 100;
    const commission = parseFloat(document.getElementById('commission').value) / 100;
    const apport = parseFloat(document.getElementById('apport').value);
    const taux = parseFloat(document.getElementById('taux').value) / 100;
    const duree = parseInt(document.getElementById('duree').value);
    const loyerFictif = parseFloat(document.getElementById('loyer-fictif').value);
    const taxeHabitation = parseFloat(document.getElementById('taxe_habitation').value);
    const taxeFonciere = parseFloat(document.getElementById('taxe_fonciere').value);

    const fraisNotaire = prix * notaire;
    const fraisCommission = prix * commission;
    const totalAchat = prix + fraisNotaire + fraisCommission;
    const montantEmprunte = totalAchat - apport;
    const mensualite = taux === 0 ? montantEmprunte / (duree * 12) : (montantEmprunte * taux / 12) / (1 - Math.pow(1 + taux / 12, -duree * 12));
    const coutTotalEmprunt = mensualite * duree * 12;
    const coutTotalInterets = coutTotalEmprunt - montantEmprunte;

    doc.text(20, 30, 'Achat');
    doc.text(20, 40, `Prix du bien : ${prix.toFixed(2)} €`);
    doc.text(20, 50, `Frais de notaire : ${fraisNotaire.toFixed(2)} €`);
    doc.text(20, 60, `Commission d'agence : ${fraisCommission.toFixed(2)} €`);
    doc.text(20, 70, `Total achat : ${totalAchat.toFixed(2)} €`);

    doc.text(20, 80, 'Emprunt');
    doc.text(20, 90, `Montant emprunté : ${montantEmprunte.toFixed(2)} €`);
    doc.text(20, 100, `Taux d'intérêt : ${(taux * 100).toFixed(2)} %`);
    doc.text(20, 110, `Mensualité : ${mensualite.toFixed(2)} €`);
    doc.text(20, 120, `Intérêts totaux : ${coutTotalInterets.toFixed(2)} €`);
    doc.text(20, 130, `Coût total emprunt : ${coutTotalEmprunt.toFixed(2)} €`);

    doc.text(20, 140, 'Financement');
    doc.text(20, 150, `Loyer fictif mensuel : ${loyerFictif.toFixed(2)} €`);
    doc.text(20, 160, `Taxe d'habitation annuelle : ${taxeHabitation.toFixed(2)} €`);
    doc.text(20, 170, `Taxe foncière annuelle : ${taxeFonciere.toFixed(2)} €`);

    // Ajouter le graphique au PDF
    const chart = document.getElementById('myChart');
    const chartImage = chart.toDataURL('image/png');
    doc.addImage(chartImage, 'PNG', 15, 180, 180, 90);

    doc.save('rapport-immobilier.pdf');
}

// Attacher l'événement de génération de rapport au bouton "Calculer"
document.getElementById('calculer-button').addEventListener('click', genererRapport);