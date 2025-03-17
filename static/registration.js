document.addEventListener('DOMContentLoaded', function() {
    const loginSection = document.getElementById('login-section');
    if (!loginSection) return;
    
    const switchLink = document.getElementById('register-link').querySelector('a');
    
    switchLink.addEventListener('click', function(e) {
      e.preventDefault();
      
      loginSection.classList.add('page-exit-active');
      
      setTimeout(() => {
        window.location.href = switchLink.getAttribute('href');
      }, 400);
    });
    
    loginSection.classList.add('page-enter');
    
    setTimeout(() => {
      loginSection.classList.add('page-enter-active');
      loginSection.classList.remove('page-enter');
    }, 50);
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', function() {
        this.classList.add('submitting');
      });
    }
  });