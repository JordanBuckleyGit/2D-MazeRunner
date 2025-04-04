// Modern menu.js with enhanced interactions
document.addEventListener('DOMContentLoaded', function() {
    const menuButtons = document.querySelectorAll('#game-menu button');
    menuButtons.forEach(button => {
        if (!button.querySelector('a')) {
            const buttonText = button.textContent;
            button.innerHTML = `<span>${buttonText}</span>`;
        }
    });
    
    const startGameBtn = document.getElementById('start-game');
    const leaderboardBtn = document.getElementById('view-leaderboard');
    const profileBtn = document.getElementById('profile');
    
    createCursorTrail();
    
    menuButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            playSound('hover');
            addButtonGlow(button);
        });
        
        button.addEventListener('mouseleave', () => {
            removeButtonGlow(button);
        });
        
        button.addEventListener('click', function(e) {
            if (!this.querySelector('a')) {
                e.preventDefault();
                
                this.classList.add('clicked');
                playSound('click');
                
                setTimeout(() => {
                    this.classList.remove('clicked');
                }, 200);
            }
        });
    });
    
    if (startGameBtn) {
        startGameBtn.addEventListener('click', function() {
            createFlashEffect();
            
            document.getElementById('menu').style.transform = 'translateY(-50px) scale(0.95)';
            document.getElementById('menu').style.opacity = '0';
            document.getElementById('menu').style.filter = 'blur(10px)';
            
            setTimeout(() => {
                window.location.href = '/game';
            }, 700);
        });
    }
    
    if (leaderboardBtn) {
        leaderboardBtn.addEventListener('click', function() {
            document.getElementById('menu').style.transform = 'translateX(-50px)';
            document.getElementById('menu').style.opacity = '0';
            document.getElementById('menu').style.filter = 'blur(5px)';
            
            setTimeout(() => {
                window.location.href = '/leaderboard';
            }, 500);
        });
    }
    
    if (profileBtn) {
        profileBtn.addEventListener('click', function() {
            document.getElementById('menu').style.transform = 'translateX(50px)';
            document.getElementById('menu').style.opacity = '0';
            document.getElementById('menu').style.filter = 'blur(5px)';
            
            setTimeout(() => {
                window.location.href = '/user';
            }, 500);
        });
    }
    
    function playSound(type) {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            if (type === 'hover') {
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
                gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.1);
            } else if (type === 'click') {
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                oscillator.start();
                oscillator.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.2);
                oscillator.stop(audioCtx.currentTime + 0.2);
            }
        } catch (e) {
            console.log('Audio context not supported or user interaction required first');
        }
    }
    
    function createCursorTrail() {
        const cursor = document.createElement('div');
        cursor.className = 'cursor-trail';
        document.body.appendChild(cursor);
    
        const trail = document.createElement('div');
        trail.className = 'cursor-trail-glow';
        document.body.appendChild(trail);
    
        let cursorX = 0;
        let cursorY = 0;
        let trailX = 0;
        let trailY = 0;
    
        document.addEventListener('mousemove', (e) => {
            const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
            cursorX = e.clientX + scrollX;
            cursorY = e.clientY + scrollY;
        });
    
        function animate() {
            const dx = cursorX - trailX;
            const dy = cursorY - trailY;
            
            trailX += dx * 0.15; // Increased smoothing factor
            trailY += dy * 0.15;
    
            cursor.style.transform = `translate3d(${cursorX - scrollX}px, ${cursorY - scrollY}px, 0)`;
            trail.style.transform = `translate3d(${trailX - scrollX}px, ${trailY - scrollY}px, 0)`;
    
            requestAnimationFrame(animate);
        }
    
        animate();
    
        window.addEventListener('scroll', () => {
            const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;
            
            cursor.style.transform = `translate3d(${cursorX - scrollX}px, ${cursorY - scrollY}px, 0)`;
            trail.style.transform = `translate3d(${trailX - scrollX}px, ${trailY - scrollY}px, 0)`;
        });
    }
    
    // Create flash effect for game start
    function createFlashEffect() {
        const flash = document.createElement('div');
        flash.className = 'screen-flash';
        document.body.appendChild(flash);
        
        // Add CSS for flash effect
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
        
        // Remove flash after animation
        setTimeout(() => {
            document.body.removeChild(flash);
        }, 700);
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
    
    // Add staggered reveal animation for menu items
    function animateMenuEntrance() {
        const menu = document.getElementById('menu');
        const heading = menu.querySelector('h1');
        const buttons = document.querySelectorAll('#game-menu button');
        
        // Animate heading with delay
        setTimeout(() => {
            heading.style.opacity = '1';
            heading.style.transform = 'translateY(0)';
        }, 300);
        
        // Stagger button animations
        buttons.forEach((button, index) => {
            button.style.opacity = '0';
            button.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                button.style.opacity = '1';
                button.style.transform = 'translateY(0)';
            }, 500 + (index * 100));
        });
    }
    
    // Set initial state for animations
    const menu = document.getElementById('menu');
    const heading = menu.querySelector('h1');
    heading.style.opacity = '0';
    heading.style.transform = 'translateY(20px)';
    heading.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    
    // Run entrance animation
    animateMenuEntrance();
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(event) {
        const buttons = Array.from(document.querySelectorAll('#game-menu button'));
        const currentFocus = document.activeElement;
        const currentIndex = buttons.indexOf(currentFocus);
        
        switch(event.key) {
            case 'ArrowDown':
                event.preventDefault();
                if (currentIndex < buttons.length - 1) {
                    buttons[currentIndex + 1].focus();
                    playSound('hover');
                    addButtonGlow(buttons[currentIndex + 1]);
                    if (currentIndex >= 0) {
                        removeButtonGlow(buttons[currentIndex]);
                    }
                }
                break;
            case 'ArrowUp':
                event.preventDefault();
                if (currentIndex > 0) {
                    buttons[currentIndex - 1].focus();
                    playSound('hover');
                    addButtonGlow(buttons[currentIndex - 1]);
                    removeButtonGlow(buttons[currentIndex]);
                } else if (currentIndex === -1) {
                    buttons[0].focus();
                    playSound('hover');
                    addButtonGlow(buttons[0]);
                }
                break;
            case 'Enter':
                if (currentIndex !== -1) {
                    buttons[currentIndex].click();
                }
                break;
        }
    });
    
    setTimeout(() => {
        const firstButton = document.querySelector('#game-menu button');
        if (firstButton) {
            firstButton.focus();
        }
    }, 1500);
});