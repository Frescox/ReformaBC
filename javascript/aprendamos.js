document.addEventListener('DOMContentLoaded', function() {
    const chatToggle = document.getElementById('chat-toggle');
    const chatContainer = document.getElementById('chat-container');
    
    chatToggle.addEventListener('click', function() {
        chatContainer.classList.toggle('active');
        
        const icon = chatToggle.querySelector('i');
        if (chatContainer.classList.contains('active')) {
            icon.classList.remove('fa-comments');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-comments');
        }
    });
    
    document.addEventListener('click', function(event) {
        if (!chatContainer.contains(event.target) && 
            !chatToggle.contains(event.target) &&
            chatContainer.classList.contains('active')) {
            chatContainer.classList.remove('active');
            
            const icon = chatToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-comments');
        }
    });
    
    chatContainer.addEventListener('click', function(event) {
        event.stopPropagation();
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const languageSelector = document.getElementById('language-selector');
    const video1 = document.getElementById('video1');
    const video2 = document.getElementById('video2');
    const audio1 = document.getElementById('audio1');
    const audio2 = document.getElementById('audio2');
    const video1Source = document.getElementById('video1-source');
    const video2Source = document.getElementById('video2-source');
    const videoOverlays = document.querySelectorAll('.video-overlay');
    const kumiaiTextContainer1 = document.getElementById('kumiai-text-container-1'); // Contenedor 1
    const kumiaiTextContainer2 = document.getElementById('kumiai-text-container-2'); // Contenedor 2

    const mediaResources = {
        'es': {
            'video1': 'resources/0313-mute.mp4',
            'video2': 'resources/0313-mute.mp4',
            'audio1': 'resources/0313.mp3',
            'audio2': 'resources/0313.mp3',
        },
        'en': {
            'video1': 'resources/0313-mute.mp4',
            'video2': 'resources/0313-mute.mp4',
            'audio1': 'resources/kumi.opus',
            'audio2': 'resources/kumi.opus',
        },
        /*
        'fr': {
            'video1': 'videos/video1-frances.mp4',
            'video2': 'videos/video2-frances.mp4',
            'audio1': 'audios/audio1-frances.mp3',
            'audio2': 'audios/audio2-frances.mp3'
        }*/
    };

    function setupVideoSync(video, audio, overlay) {
        video.controls = false;

        overlay.addEventListener('click', () => {
            overlay.style.display = 'none';
            video.controls = true;
            video.play();
            audio.play();
        });

        video.addEventListener('pause', () => audio.pause());
        video.addEventListener('play', () => audio.play());

        video.addEventListener('seeked', () => {
            audio.currentTime = video.currentTime;
        });

        video.addEventListener('ended', () => {
            overlay.style.display = 'flex';
            video.controls = false;
            video.currentTime = 0;
        });
    }

    function changeLanguage(idioma) {
        const selectedLanguage = idioma || languageSelector.value;

        // Mostrar u ocultar los contenedores del texto en Kumiai
        if (selectedLanguage === 'en') {
            kumiaiTextContainer1.style.display = 'block'; // Mostrar el contenedor 1
            kumiaiTextContainer2.style.display = 'block'; // Mostrar el contenedor 2
        } else {
            kumiaiTextContainer1.style.display = 'none'; // Ocultar el contenedor 1
            kumiaiTextContainer2.style.display = 'none'; // Ocultar el contenedor 2
        }

        if (mediaResources[selectedLanguage]) {
            const resources = mediaResources[selectedLanguage];

            video1Source.src = resources.video1;
            video2Source.src = resources.video2;
            audio1.src = resources.audio1;
            audio2.src = resources.audio2;

            video1.load();
            video2.load();
            audio1.load();
            audio2.load();

            videoOverlays.forEach(overlay => overlay.style.display = 'flex');
        }
    }

    // Configurar videos
    setupVideoSync(video1, audio1, videoOverlays[0]);
    setupVideoSync(video2, audio2, videoOverlays[1]);

    // Establecer español por defecto
    languageSelector.value = "es";
    changeLanguage("es");

    languageSelector.addEventListener('change', () => changeLanguage());
});