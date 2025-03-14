    document.addEventListener('DOMContentLoaded', function() {
        const candidates = document.querySelectorAll('.candidate');
        const videoModal = document.getElementById('video-modal');
        const candidateVideo = document.getElementById('candidate-video');
        const candidateName = document.getElementById('candidate-name');
        const candidateType = document.getElementById('candidate-type');
        const closeBtn = document.querySelector('.close-btn');
        
        const videoSources = {
            'Lic. Alejandro Ortega': './resources/0313.mp4',
            'Lic. Natalia Juárez': './resources/0313.mp4',
            'Lic. Valeria Sánchez': './resources/0313.mp4',
        };
        
        // Add click event to each candidate
        candidates.forEach(candidate => {
            candidate.addEventListener('click', function() {
                // Get candidate name
                const name = this.querySelector('.name').textContent;
                const type = this.querySelector('.type').textContent;
                console.log(type);
                
                // Set video source and name
                candidateVideo.src = videoSources[name] || '';
                candidateName.textContent = name;
                candidateType.textContent = type;
                
                // Show modal
                videoModal.style.display = 'flex';
                candidateVideo.load();
            });
        });
        
        // Close modal when clicking close button
        closeBtn.addEventListener('click', function() {
            videoModal.style.display = 'none';
            candidateVideo.pause();
        });
        
        // Close modal when clicking outside the video container
        videoModal.addEventListener('click', function(event) {
            if (event.target === videoModal) {
                videoModal.style.display = 'none';
                candidateVideo.pause();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && videoModal.style.display === 'flex') {
                videoModal.style.display = 'none';
                candidateVideo.pause();
            }
        });
        
    });

    document.addEventListener('DOMContentLoaded', function () {
        const customSelect = document.querySelector('.custom-select');
        const selectedText = document.getElementById('selected-text'); // Seleccionamos el span
        const options = customSelect.querySelector('.options');
    
        // Abrir o cerrar el menú
        customSelect.querySelector('.selected-option').addEventListener('click', function () {
            customSelect.classList.toggle('active');
        });
    
        // Seleccionar una opción
        options.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', function () {
                // Obtener solo el texto visible (sin tooltips)
                const text = this.firstChild.textContent.trim(); // Solo el texto visible de la opción
                selectedText.textContent = text; // Actualizamos el texto en el span
                customSelect.classList.remove('active'); // Cerramos el menú
            });
        });
    
        // Cerrar el menú al hacer clic fuera
        document.addEventListener('click', function (event) {
            if (!customSelect.contains(event.target)) {
                customSelect.classList.remove('active');
            }
        });
    });
    
    
    


    
