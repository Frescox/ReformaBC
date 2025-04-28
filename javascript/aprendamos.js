document.addEventListener("DOMContentLoaded", () => {
    // Custom select functionality
    const customSelect = document.querySelector('.aprendamos-lenguage-custom-select');
    const selectedOption = document.querySelector('.aprendamos-lenguage-selected-option');
    const optionsContainer = document.querySelector('.aprendamos-lenguage-options');
    const options = document.querySelectorAll('.aprendamos-lenguage-option');
    const selectedText = selectedOption.querySelector('span');
    
    // Video and audio elements
    const video1 = document.getElementById('video1');
    const video2 = document.getElementById('video2');
    const audio1 = document.getElementById('audio1');
    const audio2 = document.getElementById('audio2');
    const video1Source = document.getElementById('video1-source');
    const video2Source = document.getElementById('video2-source');
    const videoOverlays = document.querySelectorAll('.aprendamos-video-overlay');
    const kumiaiTextContainer1 = document.getElementById('kumiai-text-container-1');
    const kumiaiTextContainer2 = document.getElementById('kumiai-text-container-2');
    
    let currentLanguage = 'es'; // Default language

    const mediaResources = {
        'es': {
            'video1': 'resources/0313-mute.mp4',
            'video2': 'resources/0313-mute.mp4',
            'audio1': 'resources/0313.mp3',
            'audio2': 'resources/0313.mp3',
        },
        'ku': {
            'video1': 'resources/0313-mute.mp4',
            'video2': 'resources/0313-mute.mp4',
            'audio1': 'resources/kumi.opus',
            'audio2': 'resources/kumi.opus',
        },
        'mix': {
            'video1': 'resources/0313-mute.mp4',
            'video2': 'resources/0313-mute.mp4',
            'audio1': 'resources/0313.mp3', // Default to Spanish audio for mixteco
            'audio2': 'resources/0313.mp3',
        }
    };

    // Toggle dropdown
    selectedOption.addEventListener('click', () => {
        customSelect.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) {
            customSelect.classList.remove('active');
        }
    });

    // Select option
    options.forEach(option => {
        option.addEventListener('click', () => {
            selectedText.textContent = option.textContent.trim();
            customSelect.classList.remove('active');
            const selectedValue = option.getAttribute('data-value');
            changeLanguage(selectedValue);
        });
    });

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

    function changeLanguage(languageCode) {
        currentLanguage = languageCode;

        // Show Kumiai text only when Kumiai language is selected
        if (languageCode === 'ku') {
            kumiaiTextContainer1.style.display = 'block';
            kumiaiTextContainer2.style.display = 'block';
        } else {
            kumiaiTextContainer1.style.display = 'none';
            kumiaiTextContainer2.style.display = 'none';
        }

        // If mixteco is selected, use Spanish audio by default
        if (languageCode === 'mix') {
            // Use Spanish audio resources for mixteco
            const resources = mediaResources['es'];
            
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
        else if (mediaResources[languageCode]) {
            const resources = mediaResources[languageCode];

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

    // Configure videos
    setupVideoSync(video1, audio1, videoOverlays[0]);
    setupVideoSync(video2, audio2, videoOverlays[1]);

    // Set default language to Spanish and hide Kumiai text
    kumiaiTextContainer1.style.display = 'none';
    kumiaiTextContainer2.style.display = 'none';
    
    // Initialize with Spanish
    changeLanguage('es');
    selectedText.textContent = 'Español';
});