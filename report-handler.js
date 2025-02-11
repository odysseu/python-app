let myChart = null; // Déclarer une variable pour contenir l'instance du graphique globalement ou dans la portée appropriée

function genererRapport() {
    // Récupérer les valeurs du formulaire
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
    const fraisCopropriete = parseFloat(document.getElementById('copropriete').value);
    const dureeMax = 500;

    const fraisNotaire = prix * notaire;
    const fraisCommission = prix * commission;
    const totalAchat = prix + fraisNotaire + fraisCommission;
    const montantEmprunte = totalAchat - apport;
    const mensualite = taux === 0 ? montantEmprunte / (dureePret * 12) : (montantEmprunte * taux / 12) / (1 - Math.pow(1 + taux / 12, -dureePret * 12));
    const coutTotalEmprunt = mensualite * dureePret * 12;
    const coutTotalInterets = coutTotalEmprunt - montantEmprunte;
    const cumulLoyers = extraireLoyers();
    const cumulMensuelLoyers = cumulLoyers / 12;

    const anneeRemboursement = trouverAnneePertesInferieures(prix, fraisNotaire, fraisCommission, apport, mensualite, taxeFonciere, tauxAppreciation, dureeMax, dureePret, loyerFictif, tauxLoyerFictif, cumulLoyers, fraisCopropriete);
    const maxDuree = Math.max(dureePret, anneeRemboursement) + 1; // 1 more year to see after meeting year
    const cumulLocation = calculerPertesLocation(loyerFictif, maxDuree, tauxLoyerFictif);
    const cumulAchat = calculerPertesAchat(prix, fraisNotaire, fraisCommission, apport, mensualite, taxeFonciere, tauxAppreciation, maxDuree, dureePret, cumulLoyers, fraisCopropriete);

    // Concaténer les résultats et le graphique
    let resultat = `
        <h2>${translations.reportTitle}</h2>

        <div>
            <h3>${translations.reportAchat}</h3>
            <table>
                <tr>
                    <td>${translations.reportPrix}:</td>
                    <td style="text-align: right;">${prix.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportFraisNotaire}:</td>
                    <td style="text-align: right;">${fraisNotaire.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportTauxAppreciation}:</td>
                    <td style="text-align: right;">${(tauxAppreciation * 100).toFixed(2)} %</td>
                </tr>
                <tr>
                    <td>${translations.reportCommission}:</td>
                    <td style="text-align: right;">${fraisCommission.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportTotalAchat}:</td>
                    <td style="text-align: right;">${totalAchat.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.copropriete}:</td>
                    <td style="text-align: right;">${fraisCopropriete.toFixed(2)} €</td>
                </tr>
            </table>
        </div>
        <div>
            <h3>${translations.reportEmprunt}</h3>
            <table>
                <tr>
                    <td>${translations.reportMontantEmprunte}:</td>
                    <td style="text-align: right;">${montantEmprunte.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportTauxInteret}:</td>
                    <td style="text-align: right;">${(taux * 100).toFixed(2)} %</td>
                </tr>
                <tr>
                    <td>${translations.reportMensualite}:</td>
                    <td style="text-align: right;">${mensualite.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportInteretsTotaux}:</td>
                    <td style="text-align: right;">${coutTotalInterets.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportCoutTotalEmprunt}:</td>
                    <td style="text-align: right;">${coutTotalEmprunt.toFixed(2)} €</td>
                </tr>
            </table>
        </div>
        <div>
            <h3>${translations.reportFinancement}</h3>
            <table>
                <tr>
                    <td>${translations.reportLoyerFictifMensuel}:</td>
                    <td style="text-align: right;">${loyerFictif.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportTauxEvolutionLoyerFictif}:</td>
                    <td style="text-align: right;">${(tauxLoyerFictif * 100).toFixed(2)} %</td>
                </tr>
                <tr>
                    <td>${translations.reportTaxeHabitationAnnuelle}:</td>
                    <td style="text-align: right;">${taxeHabitation.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportTaxeFonciereAnnuelle}:</td>
                    <td style="text-align: right;">${taxeFonciere.toFixed(2)} €</td>
                </tr>
    `;

    // Ajouter les loyers au résultat
    if (cumulMensuelLoyers > 0) {
        resultat += `
                <tr>
                    <td>${translations.reportLoyerMoyenTouche}:</td>
                    <td style="text-align: right;">${cumulMensuelLoyers.toFixed(2)} €</td>
                </tr>
        `;
    }

    resultat += `
            </table>
        </div>
        <div>
            <h3>${translations.reportAmortissement}</h3>
            <p>${translations.reportAnneeRemboursement}: ${anneeRemboursement}</p>
        </div>
    `;

    document.getElementById('resultat').innerHTML = resultat;
    // Générer le graphique
    genererGraphique(cumulLocation, cumulAchat, maxDuree);

    const rapportBouton = `
        <label for="pdf-filename">${translations.pdfFilename}</label>
        <input type="text" id="pdf-filename" name="pdf-filename" placeholder="rapport-immobilier.pdf" required>
        <button id="telecharger-button">${translations.downloadPDF}</button>
    `;

    document.getElementById('rapport-bouton').innerHTML = rapportBouton;

    // Attacher l'événement de téléchargement au bouton
    document.getElementById('telecharger-button').addEventListener('click', telechargerPDF);
}

function genererGraphique(cumulLocation, cumulAchat, maxDuree) {
    // 1. Détruire le graphique existant s'il existe
    if (myChart) {
        myChart.destroy();
    }

    // 2. Obtenir l'élément canvas
    const ctx = document.getElementById('myChart').getContext('2d');
    const labels = Array.from({ length: maxDuree + 1 }, (_, i) => `${translations.annee} ${i}`);
    // 3. Créer le nouveau graphique
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: `${translations.reportCumulDepensesLocation}`,
                    data: cumulLocation,
                    borderColor: 'rgb(255, 99, 132)',
                    fill: false,
                    borderWidth: 2, // Default border width
                    pointRadius: 4, // Default point radius
                    pointBorderWidth: 1, // Default point border width
                    pointHoverRadius: 6, // Default point hover radius
                    pointHoverBorderWidth: 2, // Default point hover border width
                    tension: 0.4 // Default tension for curves
                },
                {
                    label: `${translations.reportCumulDepensesAchat}`,
                    data: cumulAchat,
                    borderColor: 'rgb(54, 162, 235)',
                    fill: false,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBorderWidth: 1,
                    pointHoverRadius: 6,
                    pointHoverBorderWidth: 2,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true, // Default aspect ratio maintenance
            devicePixelRatio: 2,
            interaction: {
                mode: 'index', // Default interaction mode
                intersect: false // Default intersect setting
            },
            scales: {
                x: {
                    beginAtZero: true, // Default start at zero
                    title: {
                        display: true,
                        text: `${translations.annee}`
                    },
                    ticks: {
                        autoSkip: true, // Default auto skip
                        maxRotation: 0, // Default max rotation
                        minRotation: 0 // Default min rotation
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: `${translations.reportPrix}`
                    },
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
                    text: `${translations.reportTitle}`,
                    font: {
                        size: 16 // Default font size
                    },
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                },
                legend: {
                    display: true,
                    position: 'top', // Default legend position
                    align: 'center', // Default legend alignment
                    labels: {
                        boxWidth: 40, // Default box width
                        padding: 10, // Default padding
                        font: {
                            size: 12 // Default font size
                        }
                    }
                },
                tooltip: {
                    enabled: true, // Default tooltip enabled
                    mode: 'index', // Default tooltip mode
                    intersect: false, // Default intersect setting
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
    // 4. Mettre à jour le contenu HTML de l'élément canvas
    document.getElementById('myChart').innerHTML = myChart;
}

function telechargerPDF() {
    const wasDarkMode = forcerModeClair();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text(20, 20, `${translations.reportTitle}`);

    const prix = parseFloat(document.getElementById('prix').value);
    const notaire = parseFloat(document.getElementById('notaire').value) / 100;
    const copropriete = parseFloat(document.getElementById('copropriete').value);
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
        head: [[`${translations.reportAchat}`, `${translations.reportPrix}`]],
        body: [
            [`${translations.reportPrix}`, `${prix.toFixed(2)} €`],
            [`${translations.reportFraisNotaire}`, `${fraisNotaire.toFixed(2)} €`],
            [`${translations.reportTauxAppreciation}`, `${(tauxAppreciation * 100).toFixed(2)} %`],
            [`${translations.reportCommission}`, `${fraisCommission.toFixed(2)} €`],
            [`${translations.reportTotalAchat}`, `${totalAchat.toFixed(2)} €`],
            [`${translations.copropriete}`, `${copropriete.toFixed(2)} €`]
        ],
        startY: 20,
        margin: { left: 20, top: 10, right: 20, bottom: 10 }, // Default margin
        theme: 'striped', // Default theme
        styles: {
            fontSize: 12, // Default font size
            cellPadding: 4, // Default cell padding
            overflow: 'linebreak', // Default overflow handling
            halign: 'left', // Default horizontal alignment
            valign: 'top', // Default vertical alignment
            fillColor: false, // Default background color
            textColor: 20, // Default text color
            lineColor: 200, // Default line color
            lineWidth: 0.2 // Default line width
        },
        headStyles: {}, // Custom styles for the header
        bodyStyles: {}, // Custom styles for the body
        footStyles: {}, // Custom styles for the footer
        columnStyles: {}, // Custom styles for individual columns
        alternateRowStyles: {}, // Custom styles for alternating rows
        didDrawCell: () => {}, // Hook after drawing a cell
        didDrawPage: () => {}, // Hook after drawing a page
        willDrawCell: () => {}, // Hook before drawing a cell
        createdHeaderCell: () => {}, // Hook when a header cell is created
        createdCell: () => {}, // Hook when a cell is created
        drawHeaderRow: () => {}, // Custom header row drawing
        drawRow: () => {}, // Custom row drawing
        drawCell: () => {}, // Custom cell drawing
        pageBreak: 'auto', // Default page break behavior
        showHead: 'everyPage', // Show header on every page
        tableWidth: 'auto', // Default table width
        tableLineWidth: 0, // Default table line width
        tableLineColor: 200 // Default table line color
    });

    // Tableau Emprunt
    doc.autoTable({
        head: [[`${translations.reportEmprunt}`, `${translations.reportPrix}`]],
        body: [
            [`${translations.reportMontantEmprunte}`, `${montantEmprunte.toFixed(0)} €`],
            [`${translations.reportTauxInteret}`, `${(taux * 100).toFixed(2)} %`],
            [`${translations.reportMensualite}`, `${mensualite.toFixed(0)} €`],
            [`${translations.reportInteretsTotaux}`, `${coutTotalInterets.toFixed(0)} €`],
            [`${translations.reportCoutTotalEmprunt}`, `${coutTotalEmprunt.toFixed(0)} €`]
        ],
        startY: doc.previousAutoTable.finalY + 10,
        margin: { left: 40, top: 10, right: 40, bottom: 10 },
        theme: 'striped',
        styles: {
            fontSize: 12,
            cellPadding: 4,
            overflow: 'linebreak',
            halign: 'left',
            valign: 'top',
            fillColor: false,
            textColor: 20,
            lineColor: 200,
            lineWidth: 0.2
        },
        headStyles: {},
        bodyStyles: {},
        footStyles: {},
        columnStyles: {},
        alternateRowStyles: {},
        didDrawCell: () => {},
        didDrawPage: () => {},
        willDrawCell: () => {},
        createdHeaderCell: () => {},
        createdCell: () => {},
        drawHeaderRow: () => {},
        drawRow: () => {},
        drawCell: () => {},
        pageBreak: 'auto',
        showHead: 'everyPage',
        tableWidth: 'auto',
        tableLineWidth: 0,
        tableLineColor: 200
    });

    // Tableau Financement
    doc.autoTable({
        head: [[`${translations.reportFinancement}`, `${translations.reportPrix}`]],
        body: [
            [`${translations.reportLoyerFictifMensuel}`, `${loyerFictif.toFixed(0)} €`],
            [`${translations.reportTauxEvolutionLoyerFictif}`, `${(tauxLoyerFictif * 100).toFixed(2)} %`],
            [`${translations.reportTaxeHabitationAnnuelle}`, `${taxeHabitation.toFixed(0)} €`],
            [`${translations.reportTaxeFonciereAnnuelle}`, `${taxeFonciere.toFixed(0)} €`]
        ],
        startY: doc.previousAutoTable.finalY + 10,
        margin: { left: 20, top: 10, right: 20, bottom: 10 },
        theme: 'striped',
        styles: {
            fontSize: 12,
            cellPadding: 4,
            overflow: 'linebreak',
            halign: 'left',
            valign: 'top',
            fillColor: false,
            textColor: 20,
            lineColor: 200,
            lineWidth: 10
        },
        headStyles: {},
        bodyStyles: {},
        footStyles: {},
        columnStyles: {},
        alternateRowStyles: {},
        didDrawCell: () => {},
        didDrawPage: () => {},
        willDrawCell: () => {},
        createdHeaderCell: () => {},
        createdCell: () => {},
        drawHeaderRow: () => {},
        drawRow: () => {},
        drawCell: () => {},
        pageBreak: 'auto',
        showHead: 'everyPage',
        tableWidth: 'auto',
        tableLineWidth: 0,
        tableLineColor: 200
    });

    // Ajouter le graphique au PDF
    const chart = document.getElementById('myChart');
    const chartImage = chart.toDataURL('image/png');
    doc.addImage(chartImage, 'PNG', 15, 200, 180, 90, undefined, 'NONE', 0);

    const filename = document.getElementById('pdf-filename').value || translations.pdfFilenamePlaceHolder;
    const pdfFilename = filename.endsWith('.pdf') ? filename : filename + ".pdf";
    doc.save(pdfFilename);

    restaurerMode(wasDarkMode);
}
