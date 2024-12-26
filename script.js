function genererRapport() {
    const prix = parseFloat(document.getElementById('prix').value);
    const apport = parseFloat(document.getElementById('apport').value);
    const taux = parseFloat(document.getElementById('taux').value) / 100;
    const duree = parseInt(document.getElementById('duree').value);
    const loyer = parseFloat(document.getElementById('loyer').value);
    const dureeLocation = parseInt(document.getElementById('duree-location').value);

    const montantEmprunte = prix - apport;
    let mensualite;

    if (taux === 0) {
        mensualite = montantEmprunte / (duree * 12);
    } else {
        mensualite = (montantEmprunte * taux / 12) / (1 - Math.pow(1 + taux / 12, -duree * 12));
    }

    const coutTotal = mensualite * duree * 12 + apport;
    const revenusLoyers = loyer * dureeLocation * 12;
    const coutNet = coutTotal - revenusLoyers;

    const resultat = `
        <h2>Résultat de la simulation</h2>
        <p>Montant emprunté : ${montantEmprunte.toFixed(2)} €</p>
        <p>Mensualité : ${mensualite.toFixed(2)} €</p>
        <p>Coût total : ${coutTotal.toFixed(2)} €</p>
        <p>Revenus des loyers : ${revenusLoyers.toFixed(2)} €</p>
        <p>Coût net après loyers : ${coutNet.toFixed(2)} €</p>
        <button onclick="telechargerPDF(${prix}, ${apport}, ${taux * 100}, ${duree}, ${montantEmprunte.toFixed(2)}, ${mensualite.toFixed(2)}, ${coutTotal.toFixed(2)}, ${loyer}, ${dureeLocation}, ${revenusLoyers.toFixed(2)}, ${coutNet.toFixed(2)})">Télécharger PDF</button>
    `;

    document.getElementById('resultat').innerHTML = resultat;
}

function telechargerPDF(prix, apport, taux, duree, montantEmprunte, mensualite, coutTotal, loyer, dureeLocation, revenusLoyers, coutNet) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text(20, 20, 'Rapport de Simulation du Projet Immobilier');
    doc.text(20, 30, `Prix du bien : ${prix.toFixed(2)} €`);
    doc.text(20, 40, `Apport personnel : ${apport.toFixed(2)} €`);
    doc.text(20, 50, `Taux d'intérêt : ${taux.toFixed(2)} %`);
    doc.text(20, 60, `Durée du prêt : ${duree} années`);
    doc.text(20, 70, `Loyer mensuel : ${loyer.toFixed(2)} €`);
    doc.text(20, 80, `Durée de location : ${dureeLocation} années`);
    doc.text(20, 90, `Montant emprunté : ${montantEmprunte} €`);
    doc.text(20, 100, `Mensualité : ${mensualite} €`);
    doc.text(20, 110, `Coût total : ${coutTotal} €`);
    doc.text(20, 120, `Revenus des loyers : ${revenusLoyers} €`);
    doc.text(20, 130, `Coût net après loyers : ${coutNet} €`);

    doc.save('rapport-immobilier.pdf');
}