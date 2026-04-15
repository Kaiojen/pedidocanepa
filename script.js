let isMusicUnavailable = false;

function getMusicElements() {
    return {
        music: document.getElementById('background-music'),
        toggle: document.getElementById('music-toggle')
    };
}

function updateMusicToggle(isPlaying = false) {
    const { toggle } = getMusicElements();
    if (!toggle) return;

    toggle.classList.toggle('is-playing', isPlaying);
    toggle.classList.toggle('is-unavailable', isMusicUnavailable);
    toggle.textContent = isPlaying ? '❚❚' : '♪';

    if (isMusicUnavailable) {
        toggle.setAttribute('aria-label', 'Música indisponível');
        toggle.title = 'Música indisponível';
        return;
    }

    const label = isPlaying ? 'Pausar música' : 'Tocar música';
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
}

async function playMusic() {
    const { music } = getMusicElements();
    if (!music || isMusicUnavailable) return;

    music.volume = 0.45;

    try {
        await music.play();
        updateMusicToggle(true);
    } catch (err) {
        updateMusicToggle(false);
        console.warn('Não foi possível iniciar a música:', err.message);
    }
}

function pauseMusic() {
    const { music } = getMusicElements();
    if (!music) return;

    music.pause();
    updateMusicToggle(false);
}

function toggleMusic() {
    const { music } = getMusicElements();
    if (!music || isMusicUnavailable) return;

    if (music.paused) {
        playMusic();
    } else {
        pauseMusic();
    }
}

function initMusic() {
    const { music, toggle } = getMusicElements();
    if (!music) return;

    updateMusicToggle(false);

    if (toggle) {
        toggle.addEventListener('click', toggleMusic);
    }

    music.addEventListener('play', () => updateMusicToggle(true));
    music.addEventListener('pause', () => updateMusicToggle(false));
    music.addEventListener('error', () => {
        isMusicUnavailable = true;
        updateMusicToggle(false);
        console.warn('Arquivo de música não encontrado ou não pôde ser carregado.');
    });
}

function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal-on-scroll');
    if (!elements.length) return;

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        elements.forEach(element => element.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add('is-visible');
            currentObserver.unobserve(entry.target);
        });
    }, {
        threshold: 0.22,
        rootMargin: '0px 0px -8% 0px'
    });

    elements.forEach((element, index) => {
        element.style.setProperty('--reveal-delay', `${Math.min(index % 3, 2) * 70}ms`);
        observer.observe(element);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initMusic();
    initScrollReveal();

    // Conectar botão "Ver nossa história" para tocar música e fazer scroll
    const heroBtn = document.querySelector('.btn-scroll');
    if (heroBtn) {
        heroBtn.addEventListener('click', (e) => {
            e.preventDefault();
            playMusic();
            scrollToSection();
        });
    }

    // Botão "Não" foge sem sair da área visível da tela.
    const btnNo = document.getElementById('btn-no');
    if (btnNo) {
        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const moveButton = () => {
            const margin = 16;
            const maxX = Math.max(margin, window.innerWidth - btnNo.offsetWidth - margin);
            const maxY = Math.max(margin, window.innerHeight - btnNo.offsetHeight - margin);
            const x = randomInRange(margin, maxX);
            const y = randomInRange(margin, maxY);
            
            btnNo.style.position = 'fixed';
            btnNo.style.left = `${x}px`;
            btnNo.style.top = `${y}px`;
            btnNo.style.zIndex = '9999';
        };

        btnNo.addEventListener('mouseover', moveButton);
        btnNo.addEventListener('touchstart', (e) => {
            e.preventDefault();
            moveButton();
        }, { passive: false });
        
        btnNo.addEventListener('click', (e) => {
            e.preventDefault();
            alert("Ops! O botão 'Não' fugiu... tente o outro! 😉");
        });
    }
});

// Smooth scroll for the hero button
function scrollToSection() {
    const timeline = document.getElementById('timeline');
    if (timeline) {
        timeline.scrollIntoView({ behavior: 'smooth' });
    }
}

// Celebration function for the proposal buttons
function celebrate() {
    const overlay = document.getElementById('celebration-overlay');
    if (!overlay) return;
    
    playMusic();

    // Show overlay
    overlay.classList.remove('hidden');
    
    // Confetti effect
    if (typeof confetti === 'function') {
        const duration = 15 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1100 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    }

    // Add floating hearts
    createHearts();
}

function closeCelebration() {
    const overlay = document.getElementById('celebration-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

// Function to create floating hearts in the celebration overlay
function createHearts() {
    const heartSymbols = ['💖', '❤️', '✨', '🌸', '💕'];
    
    for (let i = 0; i < 40; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.innerText = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
            heart.style.left = Math.random() * 100 + 'vw';
            heart.style.position = 'fixed';
            heart.style.bottom = '-50px';
            heart.style.zIndex = '1050';
            heart.style.opacity = '0.8';
            heart.style.pointerEvents = 'none';
            heart.style.fontSize = (Math.random() * 20 + 20) + 'px';
            
            document.body.appendChild(heart);

            // Custom animation for floating
            heart.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(-110vh) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: Math.random() * 3000 + 4000,
                easing: 'ease-out'
            });

            // Remove heart after animation
            setTimeout(() => {
                heart.remove();
            }, 7000);
        }, i * 100);
    }
}
