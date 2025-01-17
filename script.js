let translations = {};

document.addEventListener('DOMContentLoaded', function() {
    const welcomeMessage = document.getElementById('welcome-message');
    const closeButton = document.getElementById('close-welcome');
    const languageSelect = document.getElementById('language-select');

    closeButton.addEventListener('click', function() {
        welcomeMessage.style.display = 'none';
    });

    document.addEventListener('click', function(event) {
        if (!welcomeMessage.contains(event.target) && event.target !== closeButton) {
            welcomeMessage.style.display = 'none';
        }
    });

    languageSelect.addEventListener('change', function() {
        const selectedLanguage = languageSelect.value;
        loadTranslations(selectedLanguage);
    });

    // Initial call to set the language based on the default selection
    const defaultLanguage = languageSelect.value;
    loadTranslations(defaultLanguage);

    document.getElementById('calculer-button').addEventListener('click', genererRapport);
});

function loadTranslations(language) {
    fetch(`translations_${language}.json`)
        .then(response => response.json())
        .then(data => {
            translations = data;
            updateContent();
        })
        .catch(error => console.error('Error loading translations:', error));
}

function updateContent() {
    document.getElementById('welcome-message').querySelector('p').innerHTML = translations.welcomeMessage;
    document.getElementById('close-welcome').textContent = translations.closeButton;
    document.getElementById('section-title').textContent = translations.sectionTitle;
    document.getElementById('section-achat').textContent = translations.sectionAchat;
    document.getElementById('section-emprunt').textContent = translations.sectionEmprunt;
    document.getElementById('section-financement').textContent = translations.sectionFinancement;
    document.querySelector('label[for="prix"]').innerHTML = `${translations.prix} <span class="help-icon">? <span class="help-text">${translations.helpPrix}</span></span>`;
    document.querySelector('label[for="notaire"]').innerHTML = `${translations.notaire} <span class="help-icon">? <span class="help-text">${translations.helpNotaire}</span></span>`;
    document.querySelector('label[for="taux-appreciation"]').innerHTML = `${translations.tauxAppreciation} <span class="help-icon">? <span class="help-text">${translations.helpTauxAppreciation}</span></span>`;
    document.querySelector('label[for="commission"]').innerHTML = `${translations.commission} <span class="help-icon">? <span class="help-text">${translations.helpCommission}</span></span>`;
    document.querySelector('label[for="apport"]').innerHTML = `${translations.apport} <span class="help-icon">? <span class="help-text">${translations.helpApport}</span></span>`;
    document.querySelector('label[for="taux"]').innerHTML = `${translations.taux} <span class="help-icon">? <span class="help-text">${translations.helpTaux}</span></span>`;
    document.querySelector('label[for="duree-pret"]').innerHTML = `${translations.dureePret} <span class="help-icon">? <span class="help-text">${translations.helpDureePret}</span></span>`;
    document.querySelector('label[for="loyer-fictif"]').innerHTML = `${translations.loyerFictif} <span class="help-icon">? <span class="help-text">${translations.helpLoyerFictif}</span></span>`;
    document.querySelector('label[for="taux-loyer-fictif"]').innerHTML = `${translations.tauxLoyerFictif} <span class="help-icon">? <span class="help-text">${translations.helpTauxLoyerFictif}</span></span>`;
    document.querySelector('label[for="taxe-habitation"]').innerHTML = `${translations.taxeHabitation} <span class="help-icon">? <span class="help-text">${translations.helpTaxeHabitation}</span></span>`;
    document.querySelector('label[for="taxe-fonciere"]').innerHTML = `${translations.taxeFonciere} <span class="help-icon">? <span class="help-text">${translations.helpTaxeFonciere}</span></span>`;
    document.getElementById('calculer-button').textContent = translations.generateReport;
    document.querySelector('label[for="pdf-filename"]').textContent = translations.pdfFilename;
    document.querySelector('#telecharger-button button').textContent = translations.downloadPDF;
    document.getElementById('loyer-0').placeholder = translations.helpLoyerMensuel;
    document.getElementById('duree-location-0').placeholder = translations.helpDureeLocation;
}
