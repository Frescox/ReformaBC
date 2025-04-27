document.addEventListener('DOMContentLoaded', function () {
    const candidates = document.querySelectorAll('.candidate');
    const videoModal = document.getElementById('video-modal');
    const candidateVideo = document.getElementById('candidate-video');
    const candidateName = document.getElementById('candidate-name');
    const candidateType = document.getElementById('candidate-type');
    const closeBtn = document.querySelector('.close-btn');
    const candidateData = document.querySelector('.candidate_data');
    const showIframeButton = document.getElementById('showIframeButton');
    const pdfContainer = document.querySelector('.pdf-container');

    // Diccionarios de videos y PDFs por nombre
    const videoSources = {
        'Hugo Ortiz Aguilar': './resources/0313.mp4',
        'Ariadna Camacho Contreras': './resources/0313.mp4',
        'Cesar Lorenzo Wong Meraz': './resources/0313.mp4',
    };

    const candidatesData = {
        'Hugo Ortiz Aguilar': './resources/Hugo_candidate_data.pdf',
        'Ariadna Camacho Contreras': './resources/Ariadna_candidate_data.pdf',
        'Cesar Lorenzo Wong Meraz': './resources/Cesar_candidate_data.pdf',
        'Juna Hera Andromeda': './resources/Juna_candidate_data.png',
        'Sergio Artura Guerrero Olvera': './resources/Sergio_candidate_data.png',
    };

    // Mostrar/ocultar PDF
    showIframeButton.addEventListener('click', function () {
        if (pdfContainer.style.display === 'none' || pdfContainer.style.display === '') {
            pdfContainer.style.display = 'block';
            this.textContent = 'Ocultar Info';
        } else {
            pdfContainer.style.display = 'none';
            this.textContent = 'Info Candidato';
        }
    });

    // Cerrar modal
    closeBtn.addEventListener('click', function () {
        videoModal.style.display = 'none';

        candidateVideo.pause();
        candidateVideo.currentTime = 0;

        pdfContainer.style.display = 'none';
        showIframeButton.textContent = 'Info Candidato';
    });

    // Click fuera del contenedor para cerrar modal
    videoModal.addEventListener('click', function (event) {
        if (event.target === videoModal) {
            videoModal.style.display = 'none';
            candidateVideo.pause();
            candidateVideo.currentTime = 0;

            pdfContainer.style.display = 'none';
            showIframeButton.textContent = 'Info Candidato';
        }
    });

    // Escape para cerrar
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && videoModal.style.display === 'flex') {
            videoModal.style.display = 'none';
            candidateVideo.pause();
            candidateVideo.currentTime = 0;

            pdfContainer.style.display = 'none';
            showIframeButton.textContent = 'Info Candidato';
        }
    });

    // Clic en candidato
    candidates.forEach(candidate => {
        candidate.addEventListener('click', function () {
            const nameElem = this.querySelector('.name');
            const typeElem = this.querySelector('.type');
            if (!nameElem || !typeElem) return;

            const name = nameElem.textContent.trim();
            const type = typeElem.textContent.trim();

            candidateName.textContent = name;
            candidateType.textContent = type;

            // Carga video y PDF
            candidateVideo.src = videoSources[name] || '';
            candidateData.src = candidatesData[name] || '';
            candidateVideo.load();

            // Mostrar modal y resetear visor PDF
            videoModal.style.display = 'flex';
            pdfContainer.style.display = 'none';
            showIframeButton.textContent = 'Info Candidato';
        });
    });
});



    document.addEventListener('DOMContentLoaded', function () {
        const customSelects = document.querySelectorAll('.custom-select');
    
        customSelects.forEach(customSelect => {
            const selectedText = customSelect.querySelector('.selected-option span');
            const options = customSelect.querySelector('.options');
    
            // Abrir o cerrar el menú
            customSelect.querySelector('.selected-option').addEventListener('click', function () {
                customSelect.classList.toggle('active');
            });
    
            // Seleccionar una opción
            options.querySelectorAll('.option').forEach(option => {
                option.addEventListener('click', function () {
                    const text = this.firstChild.textContent.trim(); // Solo texto visible
                    selectedText.textContent = text;
                    customSelect.classList.remove('active');
                });
            });
    
            // Cerrar el menú al hacer clic fuera
            document.addEventListener('click', function (event) {
                if (!customSelect.contains(event.target)) {
                    customSelect.classList.remove('active');
                }
            });
        });
    });
    
    
    
    


    
