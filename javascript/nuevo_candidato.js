document.addEventListener('DOMContentLoaded', function() {
    // Manejar la carga de la imagen para previsualización
    const fotoInput = document.getElementById('foto');
    const imagePreview = document.getElementById('imagePreview');
    
    fotoInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const fileType = file.type;
            // Verifica que sea una imagen PNG, JPG, JPEG
            if (fileType === 'image/png' || fileType === 'image/jpeg' || fileType === 'image/jpg') {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                }
                reader.readAsDataURL(file);
            } else {
                // Si no es una imagen válida, muestra un mensaje de error
                alert("Por favor, sube una imagen en formato PNG, JPG o JPEG.");
                imagePreview.style.display = 'none';
                fotoInput.value = '';  // Limpia el input
            }
        } else {
            imagePreview.style.display = 'none';
        }
    });
    
    // Manejar la carga de documentos (acepta PNG, JPG, JPEG y PDF)
    const documentoInput = document.getElementById('documento');
    
    documentoInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const fileType = file.type;
            // Verifica que sea una imagen o PDF
            if (fileType === 'application/pdf' || fileType === 'image/png' || fileType === 'image/jpeg' || fileType === 'image/jpg') {
            } else {
                // Si el archivo no es válido, muestra un mensaje de error
                alert("Por favor, sube un archivo en formato PNG, JPG, JPEG o PDF.");
                documentoInput.value = '';  // Limpia el input
            }
        }
    });
    
    // Cargar cargos según la candidatura seleccionada
    const candidaturaSelect = document.getElementById('candidatura');
    const cargoSelect = document.getElementById('cargo');
    
    candidaturaSelect.addEventListener('change', function() {
        const candidaturaId = this.value;
        cargoSelect.disabled = true;
        cargoSelect.innerHTML = '<option value="" selected disabled>Cargando...</option>';
        
        // Solicitud AJAX para obtener los cargos relacionados con la candidatura
        fetch('php/get_cargos.php?candidatura_id=' + candidaturaId)
            .then(response => response.json())
            .then(data => {
                cargoSelect.innerHTML = '<option value="" selected disabled>Seleccione cargo</option>';
                data.forEach(cargo => {
                    const option = document.createElement('option');
                    option.value = cargo.id_cargo;
                    option.textContent = cargo.nombre;
                    cargoSelect.appendChild(option);
                });
                cargoSelect.disabled = false;
            })
            .catch(error => {
                console.error('Error:', error);
                cargoSelect.innerHTML = '<option value="" selected disabled>Error al cargar cargos</option>';
            });
    });
    
    // Manejar el envío del formulario
    const form = document.getElementById('candidateForm');
    const statusMessage = document.getElementById('statusMessage');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        
        fetch('php/register_candidate.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                statusMessage.className = 'status-message status-success';
                statusMessage.textContent = data.message;
                form.reset();
                imagePreview.style.display = 'none';
                cargoSelect.innerHTML = '<option value="" selected disabled>Primero seleccione candidatura</option>';
                cargoSelect.disabled = true;
            } else {
                statusMessage.className = 'status-message status-error';
                statusMessage.textContent = data.message;
            }
            statusMessage.style.display = 'block';
            
            // Ocultar el mensaje después de 5 segundos
            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 5000);
        })
        .catch(error => {
            console.error('Error:', error);
            statusMessage.className = 'status-message status-error';
            statusMessage.textContent = 'Error al procesar la solicitud';
            statusMessage.style.display = 'block';
        });
    });
    
    // Botón para resetear el formulario
    const resetButton = document.getElementById('resetButton');
    resetButton.addEventListener('click', function() {
        form.reset();
        imagePreview.style.display = 'none';
        cargoSelect.innerHTML = '<option value="" selected disabled>Primero seleccione candidatura</option>';
        cargoSelect.disabled = true;
        statusMessage.style.display = 'none';
    });
});