document.addEventListener('DOMContentLoaded', function() {
    const selectElement = document.querySelector('.custom-select');
    const selectedOption = selectElement.querySelector('.selected-option');
    const optionsContainer = selectElement.querySelector('.options');
    const options = optionsContainer.querySelectorAll('.option');
    const videoPlayer = document.getElementById('videoPlayer');
    
    // Función para mostrar/ocultar las opciones
    selectedOption.addEventListener('click', function() {
        optionsContainer.style.display = optionsContainer.style.display === 'block' ? 'none' : 'block';
    });
    
    // Cerrar el menú de opciones si se hace clic fuera de él
    document.addEventListener('click', function(e) {
        if (!selectElement.contains(e.target)) {
            optionsContainer.style.display = 'none';
        }
    });
    
    // Manejar la selección de una opción
    options.forEach(option => {
        option.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            const videoSrc = this.getAttribute('data-video');
            
            // Actualizar el texto seleccionado
            selectedOption.querySelector('span').textContent = this.textContent.trim();
            
            // Cambiar el video según la opción seleccionada
            if (videoSrc) {
                videoPlayer.querySelector('source').src ='resources/Cómo votar.mp4';
                videoPlayer.load(); // Recargar el video con la nueva fuente
                videoPlayer.play(); // Reproducir automáticamente
            }
            
            // Aplicar el color de fondo específico al selector
            selectedOption.className = 'selected-option';
            selectedOption.classList.add(`${value}-color`);
            
            // Cerrar el menú desplegable
            optionsContainer.style.display = 'none';
        });
    });
    
    // Inicialmente, establecer el primer elemento como seleccionado
    if (options.length > 0) {
        const firstOption = options[0];
        selectedOption.querySelector('span').textContent = firstOption.textContent.trim();
        
        const value = firstOption.getAttribute('data-value');
        selectedOption.classList.add(`${value}-color`);
    }
});