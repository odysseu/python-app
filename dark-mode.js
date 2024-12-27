document.addEventListener("DOMContentLoaded", function () {
    const toggleSwitch = document.getElementById("dark-mode-toggle");
    const currentTheme = localStorage.getItem("theme") ? localStorage.getItem("theme") : null;
    const logo = document.getElementById("logo");
    const favicon = document.getElementById("favicon");

    // Function to switch logos and favicons
    function switchTheme(theme) {
        if (theme === "dark-mode") {
            document.body.classList.add("dark-mode");
            logo.src = "logos/logo-dark.png";
            favicon.href = "logos/favicon-dark.ico";
        } else {
            document.body.classList.remove("dark-mode");
            logo.src = "logos/logo-light.png";
            favicon.href = "logos/favicon-light.ico";
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