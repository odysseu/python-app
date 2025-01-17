
document.addEventListener('DOMContentLoaded', function() {
    const welcomeMessage = document.getElementById('welcome-message');
    const closeButton = document.getElementById('close-welcome');
    const languageSelect = document.getElementById('language-select');
    
    // Initial call to set the language based on the default selection
    const defaultLanguage = languageSelect.value;
    loadTranslations(defaultLanguage);

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
});