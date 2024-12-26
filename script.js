function genererRapport() {
    const prix = parseFloat(document.getElementById('prix').value);
    const notaire = parseFloat(document.getElementById('notaire').value) / 100;
    const commission = parseFloat(document.getElementById('commission').value) / 100;
    const apport = parseFloat(document.getElementById('apport').value);
    const taux = parseFloat(document.getElementById('taux').value) / 100;
    const duree = parseInt(document.getElementById('duree').value);
    const loyer = parseFloat(document.getElementById('loyer').value);
    const dureeLocation = parseFloat(document.getElementById('duree-location').value) / 100;

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

    const coutTotalInterets = mensualite * duree * 12 - montantEmprunte;
    const coutTotalEmprunt = mensualite * duree * 12 + apport;
    const revenusLoyers = loyer * dureeLocation * 12 * duree;
    const coutNet = coutTotalEmprunt - revenusLoyers;

    // Calculer quand l'achat devient rentable
    let cumulEmprunt = 0;
    let cumulLoyers = 0;
    let anneeRentable = null;
    for (let i = 0; i <= duree; i++) {
        cumulEmprunt += mensualite * 12;
        cumulLoyers += loyer * dureeLocation * 12;
        if (cumulLoyers >= cumulEmprunt && anneeRentable === null) {
            anneeRentable = i;
        }
    }

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
            <p>Loyer mensuel : ${loyer.toFixed(2)} €</p>
            <p>Durée de location : ${(dureeLocation * 100).toFixed(2)} % de l'année</p>
            <p>Revenus totaux des loyers : ${revenusLoyers.toFixed(2)} €</p>
            <p>Coût net après loyers : ${coutNet.toFixed(2)} €</p>
            <p>Achat rentable après : ${anneeRentable !== null ? anneeRentable + ' ans' : 'Non rentable'}</p>
        </div>
        <button onclick="telechargerPDF(${prix}, ${fraisNotaire}, ${fraisCommission}, ${totalAchat}, ${montantEmprunte}, ${(taux * 100).toFixed(2)}, ${mensualite.toFixed(2)}, ${coutTotalInterets.toFixed(2)}, ${coutTotalEmprunt.toFixed(2)}, ${loyer}, ${(dureeLocation * 100).toFixed(2)}, ${revenusLoyers.toFixed(2)}, ${coutNet.toFixed(2)}, ${anneeRentable})">Télécharger PDF</button>
    `;

    document.getElementById('resultat').innerHTML = resultat;

    // Générer le graphique
    genererGraphique(mensualite, loyer, duree, dureeLocation);
}

function genererGraphique(mensualite, loyer, duree, dureeLocation) {
    const ctx = document.getElementById('myChart').getContext('2d');
    const labels = [];
    const dataEmprunt = [];
    const dataLoyers = [];
    let cumulEmprunt = 0;
    let cumulLoyers = 0;

    for (let i = 0; i <= duree; i++) {
        labels.push(`Année ${i}`);
        cumulEmprunt += mensualite * 12;
        cumulLoyers += loyer * dureeLocation * 12;
        dataEmprunt.push(cumulEmprunt);
        dataLoyers.push(cumulLoyers);
    }

    const chart = new Chart(ctx, {
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

    // Convertir le graphique en image et générer le PDF
    chart.toBase64Image();
}

function telechargerPDF(prix, fraisNotaire, fraisCommission, totalAchat, montantEmprunte, taux, mensualite, coutTotalInterets, coutTotalEmprunt, loyer, dureeLocation, revenusLoyers, coutNet, anneeRentable) {
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
    doc.text(20, 150, `Loyer mensuel : ${loyer.toFixed(2)} €`);
    doc.text(20, 160, `Durée de location : ${dureeLocation} % de l'année`);
    doc.text(20, 170, `Revenus totaux des loyers : ${revenusLoyers} €`);
    doc.text(20, 180, `Coût net après loyers : ${coutNet} €`);
    doc.text(20, 190, `Achat rentable après : ${anneeRentable !== null ? anneeRentable + ' ans' : 'Non rentable'}`);

    // Ajouter le graphique au PDF
    const chart = document.getElementById('myChart');
    const chartImage = chart.toDataURL('image/png');
    doc.addImage(chartImage, 'PNG', 15, 200, 180, 90);

    doc.save('rapport-immobilier.pdf');
}