document.addEventListener('DOMContentLoaded', function () {
    const menuButtons = document.querySelectorAll('#game-menu button');
    const menuMusic = document.getElementById('menu-music');
    const startGameBtn = document.getElementById('start-game');
    const leaderboardBtn = document.getElementById('view-leaderboard');
    const profileBtn = document.getElementById('profile');
    const referenceBtn = document.getElementById('references');

    // Set the volume of the menu music
    if (menuMusic) {
        menuMusic.volume = 0.2; // Set volume to 20% (adjust as needed)
        const playPromise = menuMusic.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log("Menu music started.");
            }).catch(error => {
                console.warn("Menu music autoplay prevented:", error);
            });
        }
    } else {
        console.error("Menu music element not found!");
    }

    // Enhance buttons with hover and click effects
    menuButtons.forEach(button => {
        if (!button.querySelector('a')) {
            const buttonText = button.textContent;
            button.innerHTML = `<span>${buttonText}</span>`;
        }

        button.addEventListener('mouseenter', () => {
            addButtonGlow(button);
        });

        button.addEventListener('mouseleave', () => {
            removeButtonGlow(button);
        });

        button.addEventListener('click', function (e) {
            if (!this.querySelector('a')) {
                e.preventDefault();
                this.classList.add('clicked');
                setTimeout(() => {
                    this.classList.remove('clicked');
                }, 200);
            }
        });
    });

    // Start Game button functionality
    if (startGameBtn) {
        startGameBtn.addEventListener('click', function () {
            if (menuMusic) {
                menuMusic.pause();
                menuMusic.currentTime = 0; // Reset music
            }
            createFlashEffect();
            document.getElementById('menu').style.transform = 'translateY(-50px) scale(0.95)';
            document.getElementById('menu').style.opacity = '0';
            document.getElementById('menu').style.filter = 'blur(10px)';
            setTimeout(() => {
                window.location.href = '/game';
            }, 700);
        });
    }

    // Leaderboard button functionality
    if (leaderboardBtn) {
        leaderboardBtn.addEventListener('click', function () {
            document.getElementById('menu').style.transform = 'translateX(-50px)';
            document.getElementById('menu').style.opacity = '0';
            document.getElementById('menu').style.filter = 'blur(5px)';
            setTimeout(() => {
                window.location.href = '/leaderboard';
            }, 500);
        });
    }

    // Profile button functionality
    if (profileBtn) {
        profileBtn.addEventListener('click', function () {
            document.getElementById('menu').style.transform = 'translateX(50px)';
            document.getElementById('menu').style.opacity = '0';
            document.getElementById('menu').style.filter = 'blur(5px)';
            setTimeout(() => {
                window.location.href = '/user';
            }, 500);
        });
    }

    // References button functionality
    if (referenceBtn) {
        referenceBtn.addEventListener('click', function () {
            document.getElementById('menu').style.transform = 'translateX(-50px)';
            document.getElementById('menu').style.opacity = '0';
            document.getElementById('menu').style.filter = 'blur(5px)';
            setTimeout(() => {
                window.location.href = '/references';
            }, 500);
        });
    }

    // Add glow effect to buttons on hover
    function addButtonGlow(button) {
        button.style.boxShadow = 'var(--shadow-md), 0 0 15px rgba(110, 231, 183, 0.4)';
        if (button.id === 'start-game') {
            button.style.boxShadow = 'var(--shadow-lg), 0 0 25px rgba(45, 0, 247, 0.6)';
        }
    }

    // Remove glow effect from buttons
    function removeButtonGlow(button) {
        button.style.boxShadow = 'var(--shadow-sm)';
        if (button.id === 'start-game') {
            button.style.boxShadow = 'var(--shadow-md), 0 0 15px rgba(45, 0, 247, 0.3)';
        }
    }

    // Create flash effect for game start
    function createFlashEffect() {
        const flash = document.createElement('div');
        flash.className = 'screen-flash';
        document.body.appendChild(flash);

        const style = document.createElement('style');
        style.textContent = `
            .screen-flash {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(110, 231, 183, 0.3);
                z-index: 9999;
                pointer-events: none;
                animation: flashFade 0.7s forwards ease-out;
            }
            @keyframes flashFade {
                0% { opacity: 0; }
                20% { opacity: 1; }
                100% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            document.body.removeChild(flash);
        }, 700);
    }

    // Cursor trail effect
    document.addEventListener('mousemove', function (e) {
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        trail.style.left = `${e.pageX}px`;
        trail.style.top = `${e.pageY}px`;
        document.body.appendChild(trail);

        setTimeout(() => {
            trail.remove();
        }, 500); // Adjust the duration of the trail
    });

    // Add styles for the cursor trail
    const trailStyle = document.createElement('style');
    trailStyle.textContent = `
        .cursor-trail {
            position: absolute;
            width: 10px;
            height: 10px;
            background-color: rgba(45, 0, 247, 0.6);
            border-radius: 50%;
            pointer-events: none;
            animation: fadeOut 0.5s forwards ease-out;
        }
        @keyframes fadeOut {
            0% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0.5); }
        }
    `;
    document.head.appendChild(trailStyle);
});