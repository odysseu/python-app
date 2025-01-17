function resetForm() {
    document.getElementById('calculette-form').reset();
    document.getElementById('resultat').innerHTML = '';
    const canvas = document.getElementById('myChart');
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    const languageSelect = document.getElementById('language-select');
    loadTranslations(languageSelect.value);
    changeLanguage(); // Initial call to set the language based on the default selection
}

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

function extraireLoyers() {
    let cumulLoyers = 0;
    const loyersContainer = document.getElementById('loyers-container');
    const loyerContainers = loyersContainer.querySelectorAll('.loyer-container');

    if (loyerContainers.length === 0) {
        console.log('Il n\'y a pas de loyers.');
        return cumulLoyers;
    }

    loyerContainers.forEach(container => {
        let loyer = parseFloat(container.querySelector('input[name^="loyer"]').value) || 0;
        let dureeLocation = parseFloat(container.querySelector('input[name^="duree-location"]').value) || 100;
        cumulLoyers += loyer * (dureeLocation / 100) * 12;
    });
    console.log('Cumul annuel loyers: ', cumulLoyers);
    return cumulLoyers;
}

function trouverAnneePertesInferieures(prix, fraisNotaire, fraisCommission, apport, mensualite, taxeFonciere, tauxAppreciation, duree, dureePret, loyerFictif, tauxLoyerFictif, cumulLoyers) {
    const coutInitial = prix + fraisNotaire + fraisCommission - apport;
    for (let t = 1; t <= duree; t++) {
        // achat
        const valeurRevente = prix * Math.pow(1 + tauxAppreciation, t);
        const cumulMensualites = t <= dureePret ? mensualite * 12 * t : mensualite * 12 * dureePret;
        const cumulTaxeFonciere = taxeFonciere * t;
        const pertesNettesAchat = coutInitial + cumulMensualites + cumulTaxeFonciere - valeurRevente - cumulLoyers;
        // location
        const pertesNettesLocation = (loyerFictif * Math.pow(1 + tauxLoyerFictif, t)) * 12 * t;
        if (pertesNettesLocation > pertesNettesAchat) {
            return t - 1; // Croisement des pertes
        }
    }
    console.log('Pas de croisement des pertes avant ', duree, ' ans');
    return duree; // Pas de croisement des pertes
}

function calculerPertesAchat(prix, fraisNotaire, fraisCommission, apport, mensualite, taxeFonciere, tauxAppreciation, duree, dureePret, cumulLoyers) {
    const pertesAchat = [];
    const coutInitial = prix + fraisNotaire + fraisCommission;
    for (let t = 1; t <= duree; t++) {
        const valeurRevente = prix * Math.pow(1 + tauxAppreciation, t);
        const cumulMensualites = t <= dureePret ? mensualite * 12 * t : mensualite * 12 * dureePret;
        const cumulTaxeFonciere = taxeFonciere * t;
        const pertesNettesAchat = coutInitial + cumulMensualites + cumulTaxeFonciere - valeurRevente - cumulLoyers;
        pertesAchat.push(pertesNettesAchat);
    }

    return pertesAchat;
}

function calculerPertesLocation(loyer, duree, tauxLoyerFictif) {
    const pertesLocation = [];
    for (let t = 1; t <= duree; t++) {
        const cumulLoyer = (loyer * Math.pow(1 + tauxLoyerFictif, t)) * 12 * t;
        pertesLocation.push(cumulLoyer);
    }
    return pertesLocation;
}
