document.addEventListener("DOMContentLoaded", function () {
    const toggleSwitch = document.getElementById("dark-mode-toggle");
    const currentTheme = localStorage.getItem("theme") ? localStorage.getItem("theme") : null;

    if (currentTheme) {
        document.body.classList.add(currentTheme);

        if (currentTheme === "dark-mode") {
            toggleSwitch.checked = true;
        }
    }

    toggleSwitch.addEventListener("change", function () {
        if (toggleSwitch.checked) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light-mode");
        }
    });
});