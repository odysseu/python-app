function resetForm() {
    document.getElementById("calculette-form").reset();
    document.getElementById("resultat").innerHTML = "";
    const canvas = document.getElementById("myChart");
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
}

// Existing JavaScript code for the calculator
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

function supprimerLoyer(button) {
    const container = document.getElementById('loyers-container');
    container.removeChild(button.parentElement);
}

function genererRapport() {
    const prix = parseFloat(document.getElementById('prix').value);
    const notaire = parseFloat(document.getElementById('notaire').value) / 100;
    const commission = parseFloat(document.getElementById('commission').value) / 100;
    const apport = parseFloat(document.getElementById('apport').value);
    const taux = parseFloat(document.getElementById('taux').value) / 100;
    const duree = parseInt(document.getElementById('duree').value);
    const loyerFictif = parseFloat(document.getElementById('loyer-fictif').value);

    const fraisNotaire = prix * notaire;
    const fraisCommission = prix * commission;
    const totalAchat = prix + fraisNotaire + fraisCommission;
    const montantEmprunte = totalAchat - apport;
    let mensualite;

    if (taux === 0) {
        mensualite = montantEmprunte / (duree * 12);
    } else {
        mensualite = (montantEmprunte * taux / 12) / (1 - Math.pow(1 + taux / 12, -duree * 12));
    }

    const coutTotalEmprunt = mensualite * duree * 12;
    const coutTotalInterets = coutTotalEmprunt - montantEmprunte;

    // Collecter les loyers
    const loyers = [];
    for (let i = 0; i < loyerCount; i++) {
        const loyer = parseFloat(document.getElementById(`loyer-${i}`).value);
        const dureeLocation = parseFloat(document.getElementById(`duree-location-${i}`).value) / 100;
        loyers.push({ loyer, dureeLocation });
    }

    // Calculer le total des loyers éventuels
    const totalLoyers = loyers.reduce((acc, cur) => acc + (cur.loyer * cur.dureeLocation * 12), 0);

    // Calculer l'année de remboursement
    const revenusMensuels = totalLoyers / 12;
    const depensesMensuelles = mensualite - loyerFictif;
    const coutOperation = coutTotalEmprunt;

    // Année où l'achat sera remboursé
    const anneeRemboursement = Math.max(Math.ceil(coutOperation / ((revenusMensuels - depensesMensuelles) * 12)), 0);

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
            <p>Remboursement après : ${anneeRemboursement} ans</p>
        </div>
        <button onclick="telechargerPDF(${prix}, ${fraisNotaire}, ${fraisCommission}, ${totalAchat}, ${montantEmprunte}, ${(taux * 100).toFixed(2)}, ${mensualite.toFixed(2)}, ${coutTotalInterets.toFixed(2)}, ${coutTotalEmprunt.toFixed(2)}, ${loyerFictif}, ${anneeRemboursement}, ${JSON.stringify(loyers)})">Télécharger PDF</button>
    `;

    document.getElementById('resultat').innerHTML = resultat;

    // Générer le graphique
    genererGraphique(mensualite, loyerFictif, duree, loyers, anneeRemboursement);
}

function genererGraphique(mensualite, loyerFictif, duree, loyers, anneeRemboursement) {
    const ctx = document.getElementById('myChart').getContext('2d');
    const labels = [];
    const dataEmprunt = [];
    const dataLoyers = [];
    const dataLoyersCumules = [];
    let cumulEmprunt = 0;
    let cumulLoyers = 0;
    let cumulInvestissement = 0;

    for (let i = 0; i <= anneeRemboursement; i++) {
        labels.push(`Année ${i}`);
        cumulEmprunt += mensualite * 12;
        cumulInvestissement += loyerFictif * 12;
        cumulLoyers = loyers.reduce((acc, cur) => acc + (cur.loyer * cur.dureeLocation * 12), 0);
        dataEmprunt.push(cumulEmprunt);
        dataLoyers.push(cumulLoyers);
        dataLoyersCumules.push(cumulInvestissement);
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Cumul Emprunt',
                    data: dataEmprunt,
                    borderColor: 'rgb(255, 99, 132)',
                    fill: false,
                },
                {
                    label: 'Cumul Loyers',
                    data: dataLoyers,
                    borderColor: 'rgb(54, 162, 235)',
                    fill: false,
                },
                {
                    label: 'Cumul Investissement',
                    data: dataLoyersCumules,
                    borderColor: 'rgb(75, 192, 192)',
                    fill: false,
                },
            ],
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Volumes d\'argent dans le temps',
            },
        },
    });
}

function telechargerPDF(prix, fraisNotaire, fraisCommission, totalAchat, montantEmprunte, taux, mensualite, coutTotalInterets, coutTotalEmprunt, loyerFictif, anneeRemboursement, loyers) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text(20, 20, 'Rapport de Simulation du Projet Immobilier');

    doc.text(20, 30, 'Achat');
    doc.text(20, 40, `Prix du bien : ${prix.toFixed(2)} €`);
    doc.text(20, 50, `Frais de notaire : ${fraisNotaire.toFixed(2)} €`);
    doc.text(20, 60, `Commission d'agence : ${fraisCommission.toFixed(2)} €`);
    doc.text(20, 70, `Total achat : ${totalAchat.toFixed(2)} €`);

    doc.text(20, 80, 'Emprunt');
    doc.text(20, 90, `Montant emprunté : ${montantEmprunte.toFixed(2)} €`);
    doc.text(20, 100, `Taux d'intérêt : ${taux} %`);
    doc.text(20, 110, `Mensualité : ${mensualite} €`);
    doc.text(20, 120, `Intérêts totaux : ${coutTotalInterets} €`);
    doc.text(20, 130, `Coût total emprunt : ${coutTotalEmprunt} €`);

    doc.text(20, 140, 'Financement');
    doc.text(20, 150, `Loyer fictif mensuel : ${loyerFictif} €`);
    doc.text(20, 160, `Remboursement après : ${anneeRemboursement} ans`);

    loyers.forEach((loyer, index) => {
        doc.text(20, 170 + index * 10, `Loyer ${index + 1} : ${loyer.loyer} €, Durée : ${(loyer.dureeLocation * 100).toFixed(2)} % de l'année`);
    });

    // Ajouter le graphique au PDF
    const chart = document.getElementById('myChart');
    const chartImage = chart.toDataURL('image/png');
    doc.addImage(chartImage, 'PNG', 15, 210, 180, 90);

    doc.save('rapport-immobilier.pdf');
}