document.addEventListener('DOMContentLoaded', function() {
    if (window.innerWidth < 768) {
        // Asegúrate de que el modal no se muestre al recargar
        const modal = document.getElementById('video-modal');
        modal.style.display = 'none';
    }
});

// Variables globales para navegación y filtrado
let currentCandidateIndex = 0;
let filteredCandidates = [];
let isTransitioning = false; // Variable para controlar la transición

document.addEventListener('DOMContentLoaded', function() {
    const candidaturaSelector = document.querySelector('.custom-select-candidature');
    const cargoSelector = document.querySelector('.custom-select-cargo');
    const candidaturaOptions = document.getElementById('candidatura-options');
    const cargoOptions = document.getElementById('cargo-options');
    const candidaturaSelected = candidaturaSelector.querySelector('.selected-option span');
    const cargoSelected = cargoSelector.querySelector('.selected-option span');
    
    // Estado actual de los filtros
    let currentFilters = {
        candidatura: null,
        cargo: null
    };
    
    // Mapeo de valores de candidatura a IDs en la base de datos
    const candidaturaToId = {
        'ministro': 1,
        'magistrado': 2,
        'juez': 3
    };
    
    // Mapeo de valores de cargo a IDs en la base de datos
    const cargoToId = {
        'suprema-corte': 1,
        'tribunal-disciplina': 2,
        'sala-superior': 3,
        'sala-regional': 4,
        'magistratura-circuito': 5,
        'juez-distrito': 6,
    };
    
    // Opciones de cargos por cada candidatura
    const cargos = {
        ministro: [
            { value: 'suprema-corte', text: 'Suprema Corte de Justicia de la Nación', tooltip: 'Máximo tribunal del país.' }
        ],
        magistrado: [
            { value: 'tribunal-disciplina', text: 'Tribunal de Disciplina Judicial', tooltip: 'Órgano que vigila la conducta de los jueces y magistrados.' },
            { value: 'sala-superior', text: 'Sala Superior del Tribunal Electoral', tooltip: 'Resuelve controversias electorales a nivel nacional.' },
            { value: 'sala-regional', text: 'Sala Regional del Tribunal Electoral', tooltip: 'Atiende asuntos electorales en la región.' },
            { value: 'magistratura-circuito', text: 'Magistraturas de Circuito', tooltip: 'Magistrados que revisan sentencias y apelaciones.' },
        ],
        juez: [
            { value: 'juez-distrito', text: 'Jueces de Distrito', tooltip: 'Atienden juicios de amparo y otros asuntos federales.' }
        ]
    };
    
    // Estilos CSS para los tooltips
    if (!document.getElementById('tooltip-styles')) {
        const tooltipStyles = document.createElement('style');
        tooltipStyles.id = 'tooltip-styles';
        tooltipStyles.textContent = `
            .option {
                position: relative;
            }
            
            .tooltip {
                position: absolute;
                background-color: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 5px 10px;
                border-radius: 5px;
                font-size: 12px;
                white-space: nowrap;
                z-index: 1000;
                top: -30px;
                left: 50%;
                transform: translateX(-50%);
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s, visibility 0.3s;
                pointer-events: none;
            }
            
            .option:hover .tooltip {
                opacity: 1;
                visibility: visible;
            }
            
            /* Flecha del tooltip */
            .tooltip::after {
                content: '';
                position: absolute;
                top: 100%;
                left: 50%;
                margin-left: -5px;
                border-width: 5px;
                border-style: solid;
                border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
            }
        `;
        document.head.appendChild(tooltipStyles);
    }
    
    // Función para actualizar los cargos según la candidatura seleccionada
    function updateCargos(candidatura) {
        cargoOptions.innerHTML = '';  // Limpiar opciones previas
        
        if (candidatura in cargos) {
            cargos[candidatura].forEach(cargo => {
                const option = document.createElement('div');
                option.classList.add('option');
                option.setAttribute('data-value', cargo.value);
                option.innerHTML = `
                    ${cargo.text}
                    <div class="tooltip">${cargo.tooltip}</div>
                `;
                cargoOptions.appendChild(option);
            });
            
            // Actualizar el evento click para las nuevas opciones
            addClickEventToCargoOptions();
        }
    }
    
    // Función para agregar evento click a las opciones de cargo
    function addClickEventToCargoOptions() {
        const options = cargoOptions.querySelectorAll('.option');
        options.forEach(option => {
            option.addEventListener('click', function() {
                const selectedValue = this.getAttribute('data-value');
                const selectedText = this.querySelector('.tooltip') ? this.childNodes[0].textContent.trim() : this.textContent.trim();
                cargoSelected.textContent = selectedText;
                cargoSelector.classList.remove('active');
                
                // Actualizar filtro de cargo y cargar candidatos
                currentFilters.cargo = selectedValue;
                console.log('Cargo seleccionado:', selectedValue);
                loadFilteredCandidates();
            });
        });
    }
    
    // Toggle para mostrar/ocultar opciones de candidatura
    candidaturaSelector.querySelector('.selected-option').addEventListener('click', function() {
        candidaturaSelector.classList.toggle('active');
        // Cerrar el otro selector si está abierto
        if (cargoSelector.classList.contains('active')) {
            cargoSelector.classList.remove('active');
        }
    });
    
    // Toggle para mostrar/ocultar opciones de cargo
    cargoSelector.querySelector('.selected-option').addEventListener('click', function() {
        cargoSelector.classList.toggle('active');
        // Cerrar el otro selector si está abierto
        if (candidaturaSelector.classList.contains('active')) {
            candidaturaSelector.classList.remove('active');
        }
    });
    
    // Manejar la selección de candidatura
    const candidaturaOptionElements = candidaturaOptions.querySelectorAll('.option');
    candidaturaOptionElements.forEach(option => {
        option.addEventListener('click', function() {
            const selectedValue = this.getAttribute('data-value');
            const selectedText = this.textContent.trim();
            candidaturaSelected.textContent = selectedText;
            candidaturaSelector.classList.remove('active');
            
            // Actualizar las opciones de cargo basadas en la candidatura seleccionada
            updateCargos(selectedValue);
            
            // Resetear el filtro de cargo y actualizar el filtro de candidatura
            currentFilters.cargo = null;
            currentFilters.candidatura = selectedValue;
            cargoSelected.textContent = 'CARGO/S';
            
            // Cargar candidatos con el nuevo filtro
            loadFilteredCandidates();
        });
    });
    
    // Función para cargar candidatos según los filtros actuales
    function loadFilteredCandidates() {
        const candidatesSection = document.querySelector('.candidates');
        candidatesSection.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner"></i>
            </div>
        `;
        
        let url = 'php/get_candidates.php';
        const queryParams = [];
        
        // Agregar parámetros de filtro según lo seleccionado
        if (currentFilters.candidatura && !currentFilters.cargo) {
            const candidaturaId = candidaturaToId[currentFilters.candidatura];
            if (candidaturaId) {
                queryParams.push(`id_candidatura=${candidaturaId}`);
            }
        }
        
        if (currentFilters.cargo) {
            const cargoId = cargoToId[currentFilters.cargo];
            if (cargoId) {
                queryParams.push(`id_cargo=${cargoId}`);
            }
        }
        
        if (queryParams.length > 0) {
            url += '?' + queryParams.join('&');
        }
        
        console.log('Requesting URL:', url);
        
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('Error en la respuesta del servidor');
                return response.json();
            })
            .then(data => {
                console.log('Received data:', data);
                // Guardar candidatos filtrados para la navegación
                filteredCandidates = data;
                displayCandidates(data);
            })
            .catch(error => {
                console.error('Error cargando candidatos:', error);
                candidatesSection.innerHTML = `
                    <div class="error-message">
                        <p>Ocurrió un error al cargar los candidatos. Por favor, intenta nuevamente.</p>
                    </div>
                `;
            });
    }
    
    // Cerrar los selectores si se hace clic fuera de ellos
    document.addEventListener('click', function(event) {
        if (!candidaturaSelector.contains(event.target)) {
            candidaturaSelector.classList.remove('active');
        }
        if (!cargoSelector.contains(event.target)) {
            cargoSelector.classList.remove('active');
        }
    });
    
    // Inicializar con la opción por defecto (Ministro)
    updateCargos('ministro');
    
    // Cargar todos los candidatos al inicio
    loadCandidates();
    
    // Configurar los eventos del modal al cargar la página
    setupModalEvents();
});

// Función para cargar inicialmente todos los candidatos
function loadCandidates() {
    const candidatesSection = document.querySelector('.candidates');
    candidatesSection.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner"></i>
        </div>
    `;
    
    fetch('php/get_candidates.php')
        .then(response => {
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            return response.json();
        })
        .then(data => {
            // Guardar todos los candidatos para la navegación
            filteredCandidates = data;
            displayCandidates(data);
        })
        .catch(error => {
            console.error('Error cargando candidatos:', error);
            candidatesSection.innerHTML = `
                <div class="error-message">
                    <p>Ocurrió un error al cargar los candidatos. Por favor, intenta nuevamente.</p>
                </div>
            `;
        });
}

function displayCandidates(candidates) {
    const candidatesSection = document.querySelector('.candidates');

    if (!candidates || candidates.length === 0) {
        candidatesSection.innerHTML = `
            <div class="no-results">
                <p>No se encontraron candidatos con los criterios seleccionados.</p>
            </div>
        `;
        return;
    }

    candidatesSection.innerHTML = '';

    candidates.forEach(candidate => {
        const candidateCard = document.createElement('div');
        candidateCard.classList.add('candidate-card');
        candidateCard.setAttribute('data-id', candidate.id_candidato);

        // Imagen con fallback
        const imgSrc = candidate.foto_url && candidate.foto_url.trim() !== ''
            ? candidate.foto_url
            : 'resources/images/default-profile.png';

        // Determinar el tipo de candidatura
        let tipoTexto = '';
        switch (candidate.candidatura) {
            case 'Ministros': tipoTexto = 'Ministro'; break;
            case 'Magistrados': tipoTexto = 'Magistratura'; break;
            case 'Jueces': tipoTexto = 'Juez'; break;
            default: tipoTexto = candidate.candidatura || 'Candidato';
        }

        // Formatear cargo completo
        let cargoCompleto = candidate.cargo
            ? `Candidato a ${tipoTexto} ${candidate.cargo}`
            : `Candidato a ${tipoTexto}`;

        // Número de lista (con fallback)
        const numeroLista = candidate.numero_lista || 'N/A';

            candidateCard.innerHTML = `
            <div class="img-container">
                <img src="${imgSrc}" alt="${candidate.nombre} ${candidate.apellidos}" onerror="this.src='resources/images/default-profile.png'">
            </div>
            <div class="info-container">
                <div class="numero-circle">
                    Numero de Lista: <span>${numeroLista}</span>
                </div>
                <div class="candidate-data">
                    <h2 class="name">${candidate.nombre} ${candidate.apellidos}</h2>
                    <h2 class="type" style="display: none;">${tipoTexto}</h2>
                    <p class="cargo">${cargoCompleto}</p>
                </div>
            </div>
        `;

        candidateCard.addEventListener('click', function () {
            const pdfUrl = candidate.documentos && candidate.documentos.length > 0
                ? candidate.documentos[0].archivo_url
                : '';

            const data = {
                getAttribute: function(attr) {
                    switch (attr) {
                        case 'data-id': return candidate.id_candidato;
                        case 'data-name': return `${candidate.nombre} ${candidate.apellidos}`;
                        case 'data-type': return candidate.candidatura;
                        case 'data-pdf': return pdfUrl;
                        default: return null;
                    }
                }
            };

            openCandidateModal(data);
        });

        candidatesSection.appendChild(candidateCard);
    });
}

function setupModalEvents() {
    const toggleBtn = document.getElementById('showIframeButton');
    const closeBtn = document.querySelector('.close-btn');
    const modal = document.getElementById('video-modal');
    const pdfContainer = document.querySelector('.pdf-container');
    const videoWrapper = document.querySelector('.video-wrapper');

    // Evento para alternar entre video e información
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            if (pdfContainer.style.display === 'none' || !pdfContainer.style.display) {
                pdfContainer.style.display = 'flex';
                videoWrapper.style.display = 'none';
                this.textContent = 'Video';
            } else {
                pdfContainer.style.display = 'none';
                videoWrapper.style.display = 'block';
                this.textContent = 'Info Candidato';
            }
        });
    }

    // Evento para cerrar el modal
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            if (pdfContainer) {
                pdfContainer.innerHTML = '';
                pdfContainer.style.display = 'none';
            }
            if (videoWrapper) {
                videoWrapper.style.display = 'block';
            }
            if (toggleBtn) {
                toggleBtn.textContent = 'Info Candidato';
            }
            
            // Pausar el video si está reproduciéndose
            const video = document.getElementById('candidate-video');
            if (video) {
                video.pause();
            }
        });
    }

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            if (pdfContainer) {
                pdfContainer.style.display = 'none';
            }
            if (videoWrapper) {
                videoWrapper.style.display = 'block';
            }
            if (toggleBtn) {
                toggleBtn.textContent = 'Info Candidato';
            }
            
            // Pausar el video si está reproduciéndose
            const video = document.getElementById('candidate-video');
            if (video) {
                video.pause();
            }
        }
    });
    
    // Configurar eventos para los botones de navegación
    const prevButton = document.getElementById('prev-candidate');
    const nextButton = document.getElementById('next-candidate');
    
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            if (!this.classList.contains('disabled') && !isTransitioning) {
                goToPreviousCandidate();
            }
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            if (!this.classList.contains('disabled') && !isTransitioning) {
                goToNextCandidate();
            }
        });
    }
    
    // Configurar navegación con teclado
    document.addEventListener('keydown', function(event) {
        if (modal && modal.style.display === 'flex' && !isTransitioning) {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                goToPreviousCandidate();
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                goToNextCandidate();
            } else if (event.key === 'Escape') {
                if (closeBtn) closeBtn.click();
            }
        }
    });
}

// Modificar la función para abrir el modal con soporte para navegación
function openCandidateModal(button) {
    const modal = document.getElementById('video-modal');
    if (!modal) return;
    
    const id = button.getAttribute('data-id');
    
    // Encontrar el índice del candidato actual en la lista filtrada
    currentCandidateIndex = filteredCandidates.findIndex(candidate => candidate.id_candidato == id);
    
    // Si no se encuentra el candidato, simplemente salir
    if (currentCandidateIndex === -1) {
        console.error('Candidato no encontrado en la lista filtrada');
        return;
    }
    
    // Crear contenedor para el contenido actual (necesario para la transición)
    prepareModalContentContainer();
    
    // Mostrar el candidato en el modal
    displayCandidateInModal(currentCandidateIndex);
    
    // Mostrar el modal
    modal.style.display = 'flex';
    
    // Asegurarse de que los botones de navegación estén configurados correctamente
    updateNavigationButtonsState();
}

// Función para preparar el contenedor de contenido para las transiciones
function prepareModalContentContainer() {
    const modal = document.getElementById('video-modal');
    let contentArea = modal.querySelector('.content-area');
    
    // Si ya tiene la clase para transiciones, no hacer nada
    if (contentArea.classList.contains('with-transitions')) {
        return;
    }
    
    // Añadir estilos para transiciones
    contentArea.classList.add('with-transitions');
    
    // Agregar estilos para transiciones si no existen
    if (!document.getElementById('transition-styles')) {
        const style = document.createElement('style');
        style.id = 'transition-styles';
        style.textContent = `
            .content-area.with-transitions {
                transition: transform 0.5s ease, opacity 0.5s ease;
                position: relative;
                transform: translateY(0);
                opacity: 1;
            }
            .content-area.slide-up {
                transform: translateY(-20px);
                opacity: 0;
            }
            .content-area.slide-down {
                transform: translateY(20px);
                opacity: 0;
            }
        `;
        document.head.appendChild(style);
    }
}

// Nueva función para mostrar un candidato específico en el modal con transición
function displayCandidateInModal(index) {
    if (index < 0 || index >= filteredCandidates.length) return;
    
    const candidate = filteredCandidates[index];
    const candidateName = document.getElementById('candidate-name');
    const candidateType = document.getElementById('candidate-type');
    const pdfContainer = document.getElementById('pdfContainer');
    const toggleBtn = document.getElementById('showIframeButton');
    const videoWrapper = document.querySelector('.video-wrapper');
    const video = document.getElementById('candidate-video');
    const contentArea = document.querySelector('.content-area');
    
    // Si no existe algún elemento necesario, salir
    if (!contentArea || !candidateName || !candidateType) {
        console.error('Elementos del modal no encontrados');
        return;
    }
    
    // Aplicar la transición de salida
    isTransitioning = true;
    contentArea.classList.add('slide-up');
    
    // Esperar a que la transición termine antes de actualizar el contenido
    setTimeout(() => {
        // Actualizar nombre y tipo
        candidateName.textContent = `${candidate.nombre} ${candidate.apellidos}`;
        
        let tipoTexto = '';
        switch (candidate.candidatura) {
            case 'Ministros': tipoTexto = 'Ministro'; break;
            case 'Magistrados': tipoTexto = 'Magistratura'; break;
            case 'Jueces': tipoTexto = 'Juez'; break;
            default: tipoTexto = candidate.candidatura || 'Candidato';
        }
        
        candidateType.textContent = tipoTexto;
        
        // Resetear el video si existe
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
        
        // Limpiar contenido anterior del PDF/imagen
        if (pdfContainer) {
            pdfContainer.innerHTML = '';
        }
        
        // Obtener el documento principal si existe
        const fileUrl = candidate.documentos && candidate.documentos.length > 0 ? candidate.documentos[0].archivo_url : '';
        
        if (fileUrl && fileUrl !== 'null' && fileUrl !== 'undefined') {
            let contentElement;
        
            if (/\.(pdf)$/i.test(fileUrl)) {
                contentElement = document.createElement('iframe');
                contentElement.src = fileUrl;
                contentElement.style.width = '100%';
                contentElement.style.height = '100%';
                contentElement.style.border = 'none';
                if (pdfContainer) pdfContainer.appendChild(contentElement);
            } else if (/\.(jpg|jpeg|png|webp)$/i.test(fileUrl)) {
                contentElement = document.createElement('img');
                contentElement.src = fileUrl;
                contentElement.style.maxWidth = '100%';
                contentElement.style.height = 'auto';
                contentElement.classList.add('zoomable');
                
                // Añadir evento de zoom con clic
                contentElement.addEventListener('click', () => {
                    contentElement.classList.toggle('zoomed');
                });
                
                // Crear el botón de descarga solo si es una imagen
                const downloadBtn = document.createElement('a');
                downloadBtn.href = fileUrl;
                downloadBtn.download = `candidato-${candidate.id_candidato}-imagen`; 
                downloadBtn.textContent = 'Descargar';
                downloadBtn.style.display = 'block';
                downloadBtn.style.marginTop = '2px';
                downloadBtn.style.padding = '8px 12px';
                downloadBtn.style.textAlign = 'center';
                downloadBtn.style.backgroundColor = 'rgb(48, 110, 59)';
                downloadBtn.style.color = 'white';
                downloadBtn.style.borderRadius = '15px';
                downloadBtn.style.textDecoration = 'none';
                
                // Añadir el botón de descarga después de la imagen
                if (pdfContainer) {
                    pdfContainer.appendChild(contentElement);
                    pdfContainer.appendChild(downloadBtn);
                }
            }
            
            if (toggleBtn) {
                toggleBtn.style.display = 'inline-block';
                toggleBtn.textContent = 'Video';
            }
            
            if (pdfContainer) pdfContainer.style.display = 'flex';
            if (videoWrapper) videoWrapper.style.display = 'none';
        } else {
            if (toggleBtn) toggleBtn.style.display = 'none';
            if (pdfContainer) pdfContainer.style.display = 'none';
            if (videoWrapper) videoWrapper.style.display = 'block';
        }
        
        // Aplicar la transición de entrada con un pequeño retraso
        setTimeout(() => {
            contentArea.classList.remove('slide-up');
            contentArea.classList.add('slide-down');
            
            // Después de un corto tiempo, se quita la clase slide-down para completar la transición
            setTimeout(() => {
                contentArea.classList.remove('slide-down');
                isTransitioning = false;
            }, 50);
        }, 50);
    }, 300); 
}

// Función para ir al candidato anterior con verificación de filtro
function goToPreviousCandidate() {
    if (currentCandidateIndex > 0 && !isTransitioning) {
        currentCandidateIndex--;
        displayCandidateInModal(currentCandidateIndex);
        updateNavigationButtonsState();
    }
}

// Función para ir al siguiente candidato con verificación de filtro
function goToNextCandidate() {
    if (currentCandidateIndex < filteredCandidates.length - 1 && !isTransitioning) {
        currentCandidateIndex++;
        displayCandidateInModal(currentCandidateIndex);
        updateNavigationButtonsState();
    }
}

// Función para actualizar el estado de los botones de navegación
function updateNavigationButtonsState() {
    const prevButton = document.getElementById('prev-candidate');
    const nextButton = document.getElementById('next-candidate');
    
    if (prevButton && nextButton) {
        // Deshabilitar el botón anterior si estamos en el primer candidato
        if (currentCandidateIndex <= 0) {
            prevButton.classList.add('disabled');
        } else {
            prevButton.classList.remove('disabled');
        }
        
        // Deshabilitar el botón siguiente si estamos en el último candidato
        if (currentCandidateIndex >= filteredCandidates.length - 1) {
            nextButton.classList.add('disabled');
        } else {
            nextButton.classList.remove('disabled');
        }
    }
}

// Código que debe ejecutarse al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    setupModalEvents();
    
    // Añadir estilos adicionales para zoom y transiciones
    if (!document.getElementById('additional-styles')) {
        const additionalStyles = document.createElement('style');
        additionalStyles.id = 'additional-styles';
        additionalStyles.textContent = `
            /* Estilos para zoom de imágenes */
            .zoomable {
                cursor: zoom-in;
                transition: transform 0.3s ease;
            }
            
            .zoomable.zoomed {
                transform: scale(1.5);
                cursor: zoom-out;
                z-index: 1000;
            }
            
            /* Estilos para botones de navegación */
            .nav-btn {
                transition: all 0.3s ease, background-color 0.3s ease, transform 0.3s ease;
            }
            
            .nav-btn:not(.disabled):hover {
                background-color: rgba(47, 106, 58, 1);
                transform: scale(1.1);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }
            
            .nav-btn.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `;
        document.head.appendChild(additionalStyles);
    }
});