document.addEventListener("DOMContentLoaded", function () {
    const toggleSwitch = document.getElementById("dark-mode-toggle");
    const currentTheme = localStorage.getItem("theme") ? localStorage.getItem("theme") : null;
    const homeLogo = document.getElementById("home-logo");
    const favicon = document.getElementById("favicon");
    const githubLogo = document.getElementById("github-logo");

    // Function to switch logos and favicons
    function switchTheme(theme) {
        if (theme === "dark-mode") {
            document.body.classList.add("dark-mode");
            homeLogo.src = "logos/home-logo-dark.png";
            favicon.href = "logos/favicon-dark.ico";
            githubLogo.src = "logos/github-logo-dark.png";
        } else {
            document.body.classList.remove("dark-mode");
            homeLogo.src = "logos/home-logo-light.png";
            favicon.href = "logos/favicon-light.ico";
            githubLogo.src = "logos/github-logo-light.png";
        }
    }

    if (currentTheme) {
        switchTheme(currentTheme);
        if (currentTheme === "dark-mode") {
            toggleSwitch.checked = true;
        }
    }

    toggleSwitch.addEventListener("change", function () {
        const theme = toggleSwitch.checked ? "dark-mode" : "light-mode";
        switchTheme(theme);
        localStorage.setItem("theme", theme);
    });
});