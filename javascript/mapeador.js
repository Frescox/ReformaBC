document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el mapa centrado en Baja California
    const map = L.map('map').setView([32.5149, -115.5866], 8);
    
    // Añadir capa de mapa base de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Datos de muestra para distritos (en una aplicación real, usarías GeoJSON completo)
    const districtLocalData = {
        local: [
            { id: 1, name: "Distrito Local 01", center: [32.6435, -115.4688], polygon: [] },
            { id: 2, name: "Distrito Local 02", center: [32.6044, -115.3911], polygon: [] },
            { id: 3, name: "Distrito Local 03", center: [32.5525, -117.0442], polygon: [] },
            { id: 4, name: "Distrito Local 04", center: [32.5194, -117.0381], polygon: [] },
            { id: 5, name: "Distrito Local 05", center: [32.4811, -116.9931], polygon: [] },
            { id: 6, name: "Distrito Local 06", center: [32.4700, -116.9200], polygon: [] },
            { id: 7, name: "Distrito Local 07", center: [32.4978, -116.9464], polygon: [] },
            { id: 8, name: "Distrito Local 08", center: [31.8686, -116.6239], polygon: [] },
            { id: 9, name: "Distrito Local 09", center: [31.8556, -116.6050], polygon: [] },
            { id: 10, name: "Distrito Local 10", center: [32.0389, -116.0131], polygon: [] },
            { id: 11, name: "Distrito Local 11", center: [32.3853, -116.8606], polygon: [] },
            { id: 12, name: "Distrito Local 12", center: [30.7161, -115.9911], polygon: [] },
            { id: 13, name: "Distrito Local 13", center: [31.3344, -115.4517], polygon: [] },
            { id: 14, name: "Distrito Local 14", center: [32.0589, -116.5956], polygon: [] },
            { id: 15, name: "Distrito Local 15", center: [32.1064, -116.6106], polygon: [] },
            { id: 16, name: "Distrito Local 16", center: [32.5361, -115.3122], polygon: [] },
            { id: 17, name: "Distrito Local 17", center: [32.3789, -115.1889], polygon: [] }
        ]
    };
    
    // Crear marcadores para los distritos y añadirlos al mapa
    let districtLayers = {
        local: L.layerGroup()
    };
    
    // Función para crear marcadores de distritos
    function createDistrictMarkers(type) {

        districtLocalData[type].forEach(district => {
            const marker = L.marker(district.center, {
                icon: L.divIcon({
                    className: 'district-marker',
                    html: `<div style="background-color: #00897B; width: 10px; height: 10px; border-radius: 50%;"></div>`,
                    iconSize: [10, 10]
                })
            });
            
            const popupContent = `
                <div class="district-popup">
                    <h3>${district.name}</h3>
                    <p>ID: ${district.id}</p>
                    <div class="badge local">Local</div>
                </div>
            `;
            
            marker.bindPopup(popupContent);
            districtLayers[type].addLayer(marker);
        });
        
        map.addLayer(districtLayers[type]);
    }
    
    // Inicialmente mostrar distritos locales
    createDistrictMarkers('local');
    
    // Botón para localizar el distrito
    document.getElementById('locateBtn').addEventListener('click', function() {
        const loading = document.getElementById('loading');
        const resultPanel = document.getElementById('resultPanel');
        const alertElement = document.getElementById('locationAlert');
        
        // Mostrar cargando y ocultar resultados
        loading.classList.add('active');
        resultPanel.classList.remove('active');
        alertElement.className = 'alert';
        alertElement.textContent = '';
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    // Obtener ubicación
                    const userLocation = [position.coords.latitude, position.coords.longitude];
                    
                    // Añadir marcador de ubicación del usuario
                    const userMarker = L.marker(userLocation, {
                        icon: L.divIcon({
                            className: 'user-marker',
                            html: '<div style="background-color: #F44336; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white;"></div>',
                            iconSize: [14, 14]
                        })
                    }).addTo(map);
                    
                    userMarker.bindPopup('Tu ubicación actual').openPopup();
                    
                    // Centrar mapa en la ubicación del usuario
                    map.setView(userLocation, 10);
                    
                    // Determinar el distrito más cercano
                    const type = document.getElementById('districtType').value;
                    const closestDistrict = findClosestDistrict(userLocation, districtLocalData[type]);
                    
                    // Actualizar y mostrar el panel de resultados
                    setTimeout(() => {
                        document.getElementById('districtName').textContent = closestDistrict.name;
                        document.getElementById('districtType').textContent = "Tipo: Federal";
                        
                        loading.classList.remove('active');
                        resultPanel.classList.add('active');
                        
                        // Mostrar mensaje de éxito
                        alertElement.className = 'alert success';
                        alertElement.textContent = '¡Ubicación determinada correctamente!';
                        
                        // Resaltar el distrito encontrado
                        districtLayers[type].eachLayer(layer => {
                            if (layer._popup._content.includes(closestDistrict.name)) {
                                layer.openPopup();
                            }
                        });
                    }, 1500);
                },
                function(error) {
                    loading.classList.remove('active');
                    
                    // Mostrar mensaje de error
                    alertElement.className = 'alert error';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            alertElement.textContent = 'No se concedió permiso para acceder a tu ubicación.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            alertElement.textContent = 'La información de ubicación no está disponible.';
                            break;
                        case error.TIMEOUT:
                            alertElement.textContent = 'Se agotó el tiempo para obtener la ubicación.';
                            break;
                        default:
                            alertElement.textContent = 'Ocurrió un error desconocido al obtener la ubicación.';
                    }
                }
            );
        } else {
            loading.classList.remove('active');
            alertElement.className = 'alert error';
            alertElement.textContent = 'La geolocalización no es compatible con este navegador.';
        }
    });
    
    // Función para encontrar el distrito más cercano
    function findClosestDistrict(userLocation, districts) {
        let closestDistrict = null;
        let minDistance = Infinity;
        
        districts.forEach(district => {
            const distance = calculateDistance(userLocation, district.center);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestDistrict = district;
            }
        });
        
        return closestDistrict;
    }
    
    // Función para calcular la distancia entre dos puntos (Haversine)
    function calculateDistance(point1, point2) {
        const R = 6371; // Radio de la Tierra en km
        const dLat = deg2rad(point2[0] - point1[0]);
        const dLon = deg2rad(point2[1] - point1[1]);
        
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(point1[0])) * Math.cos(deg2rad(point2[0])) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        const distance = R * c;
        
        return distance;
    }
    
    function deg2rad(deg) {
        return deg * (Math.PI/180);
    }
});