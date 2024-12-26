function genererRapport() {
    const prix = parseFloat(document.getElementById('prix').value);
    const apport = parseFloat(document.getElementById('apport').value);
    const taux = parseFloat(document.getElementById('taux').value) / 100;
    const duree = parseInt(document.getElementById('duree').value);

    const montantEmprunte = prix - apport;
    const mensualite = (montantEmprunte * taux / 12) / (1 - Math.pow(1 + taux / 12, -duree * 12));
    const coutTotal = mensualite * duree * 12 + apport;

    const resultat = `
        <h2>Résultat de la simulation</h2>
        <p>Montant emprunté : ${montantEmprunte.toFixed(2)} €</p>
        <p>Mensualité : ${mensualite.toFixed(2)} €</p>
        <p>Coût total : ${coutTotal.toFixed(2)} €</p>
        <button onclick="telechargerPDF()">Télécharger PDF</button>
    `;

    document.getElementById('resultat').innerHTML = resultat;
}

function telechargerPDF() {
    const prix = document.getElementById('prix').value;
    const apport = document.getElementById('apport').value;
    const taux = document.getElementById('taux').value;
    const duree = document.getElementById('duree').value;

    const doc = new jsPDF();
    doc.text(20, 20, 'Rapport de Simulation du Projet Immobilier');
    doc.text(20, 30, `Prix du bien : ${prix} €`);
    doc.text(20, 40, `Apport personnel : ${apport} €`);
    doc.text(20, 50, `Taux d'intérêt : ${taux} %`);
    doc.text(20, 60, `Durée du prêt : ${duree} années`);

    // Ajoutez d'autres détails et calculs si nécessaire
    doc.save('rapport-immobilier.pdf');
}