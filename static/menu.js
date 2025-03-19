// menu.js
document.addEventListener('DOMContentLoaded', function() {
    // Get all menu buttons
    const startGameBtn = document.getElementById('start-game');
    const leaderboardBtn = document.getElementById('view-leaderboard');
    const profileBtn = document.getElementById('profile');
    const menuButtons = document.querySelectorAll('#game-menu button');
    
    // Add button hover sound effect
    menuButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            playSound('hover');
        });
        
        // Add button click animations and sounds
        button.addEventListener('click', function(e) {
            // Don't apply to logout button which has a direct link
            if (!this.querySelector('a')) {
                e.preventDefault();
                
                // Add click animation
                this.classList.add('clicked');
                playSound('click');
                
                // Remove animation class after animation completes
                setTimeout(() => {
                    this.classList.remove('clicked');
                }, 200);
            }
        });
    });
    
    // Button click handlers
    if (startGameBtn) {
        startGameBtn.addEventListener('click', function() {
            // Add some animation before redirecting
            document.getElementById('menu').style.transform = 'translateY(-20px)';
            document.getElementById('menu').style.opacity = '0';
            
            // Redirect to game page after animation
            setTimeout(() => {
                window.location.href = '/game';
            }, 500);
        });
    }
    
    if (leaderboardBtn) {
        leaderboardBtn.addEventListener('click', function() {
            // Redirect to leaderboard page
            window.location.href = '/leaderboard';
        });
    }
    
    if (profileBtn) {
        profileBtn.addEventListener('click', function() {
            // Redirect to profile page
            window.location.href = '/user';
        });
    }
    
    // Function to play sound effects
    function playSound(type) {
        // Here you would implement actual sound playing
        // For now, this is just a placeholder
        // You could add actual audio elements and play them:
        /*
        const sound = new Audio();
        if (type === 'hover') {
            sound.src = '/static/sounds/hover.mp3';
        } else if (type === 'click') {
            sound.src = '/static/sounds/click.mp3';
        }
        sound.volume = 0.3;
        sound.play();
        */
        
        console.log(`Playing ${type} sound`);
    }
    
    // Add a simple animation when the page loads
    animateMenuEntrance();
    
    function animateMenuEntrance() {
        const menu = document.getElementById('menu');
        menu.style.opacity = '0';
        menu.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            menu.style.opacity = '1';
            menu.style.transform = 'translateY(0)';
        }, 200);
        
        // Stagger button animations
        const buttons = document.querySelectorAll('#game-menu button');
        buttons.forEach((button, index) => {
            button.style.opacity = '0';
            button.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                button.style.opacity = '1';
                button.style.transform = 'translateY(0)';
            }, 300 + (index * 100));
        });
    }
    
    // Add keypress support for menu navigation
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
                }
                break;
            case 'ArrowUp':
                event.preventDefault();
                if (currentIndex > 0) {
                    buttons[currentIndex - 1].focus();
                    playSound('hover');
                } else if (currentIndex === -1) {
                    // If nothing is focused, focus the first button
                    buttons[0].focus();
                    playSound('hover');
                }
                break;
            case 'Enter':
                if (currentIndex !== -1) {
                    buttons[currentIndex].click();
                }
                break;
        }
    });
    
    // Focus the first button when the page loads
    setTimeout(() => {
        const firstButton = document.querySelector('#game-menu button');
        if (firstButton) {
            firstButton.focus();
        }
    }, 1000);
});