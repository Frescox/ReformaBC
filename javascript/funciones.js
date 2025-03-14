document.addEventListener('DOMContentLoaded', function() {
    const logo = document.querySelector('.logo'); // Asegúrate de que el selector sea correcto
    if (logo) {
        logo.addEventListener("click", function() {
            location.reload(); // Recarga la página
        });
    } else {
        console.error("El elemento con el selector '#logo' no se encontró.");
    }
});