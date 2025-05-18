document.addEventListener('DOMContentLoaded', function() {
    // Éléments du formulaire
    const formTitle = document.getElementById('form-title');
    const confirmBox = document.getElementById('confirm-box');
    const submitButton = document.getElementById('submit-button');
    const toggleRegister = document.getElementById('toggle-register');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm-password');
    
    // Ajouter dynamiquement des particules
    createParticles(20);
    
    // Basculer entre connexion et inscription
    let isLoginMode = true;
    
    toggleRegister.addEventListener('click', function(e) {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        
        if (isLoginMode) {
            // Basculer vers le mode connexion
            formTitle.textContent = 'Login';
            confirmBox.style.display = 'none';
            submitButton.textContent = 'Login';
            toggleRegister.innerHTML = 'Don\'t have an account? <a href="#">Register</a>';
        } else {
            // Basculer vers le mode inscription
            formTitle.textContent = 'Register';
            confirmBox.style.display = 'block';
            submitButton.textContent = 'Register';
            toggleRegister.innerHTML = 'Already have an account? <a href="#">Login</a>';
        }
    });
    
    // Soumission du formulaire
    document.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!isLoginMode) {
            // Vérifier si les mots de passe correspondent en mode inscription
            if (password.value !== confirmPassword.value) {
                alert('Passwords do not match!');
                return;
            }
        }
        
        // Ici vous enverriez normalement les données du formulaire à votre serveur
        console.log(isLoginMode ? 'Logging in...' : 'Registering...');
    });
    
    // Fonction pour créer des particules
    function createParticles(count) {
        const body = document.body;
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Position aléatoire
            particle.style.top = Math.random() * 100 + '%';
            particle.style.left = Math.random() * 100 + '%';
            
            // Animation delay aléatoire
            particle.style.animationDelay = (Math.random() * 10) + 's';
            
            body.appendChild(particle);
        }
    }
    
    // Rendre les cartes de memory game interactives
    const memoryCards = document.querySelectorAll('.memory-card');
    
    memoryCards.forEach(card => {
        card.addEventListener('click', function() {
            // Permettre l'interaction avec les cartes
            this.style.pointerEvents = 'auto';
            
            // Effet de retournement
            this.classList.toggle('flipped');
            
            // Animation au survol
            setTimeout(() => {
                this.classList.remove('flipped');
            }, 1500);
        });
    });
    
    // Basculer entre les modes jour et nuit
    const inputCheck = document.getElementById('input-check');
    const loginBox = document.querySelector('.login-box');
    
    inputCheck.addEventListener('change', function() {
        // Animation spéciale lorsque le switch est activé
        if (this.checked) {
            document.body.style.background = '#0a4c80';
            
            // Ajouter des classes pour les animations
            document.querySelectorAll('.memory-card').forEach(card => {
                card.style.color = '#ff7700';
                card.style.textShadow = '0 0 10px #ff7700';
                card.style.borderColor = 'rgba(255, 119, 0, 0.3)';
            });
        } else {
            document.body.style.background = '#0a4c80';
            
            // Réinitialiser les classes
            document.querySelectorAll('.memory-card').forEach(card => {
                card.style.color = '#87ceeb';
                card.style.textShadow = '0 0 10px #87ceeb';
                card.style.borderColor = 'rgba(135, 206, 250, 0.3)';
            });
        }
    });
});
// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function() {
    // Éléments du DOM
    const loginForm = document.getElementById('login-form');
    const formTitle = document.getElementById('form-title');
    const toggleRegisterLink = document.getElementById('toggle-register');
    const submitButton = document.getElementById('submit-button');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const inputCheck = document.getElementById('input-check');
    
    // État initial du formulaire (login par défaut)
    let isLoginMode = true;
    
    // Fonction pour basculer entre le mode login et register
    function toggleMode() {
        isLoginMode = !isLoginMode;
        
        if (isLoginMode) {
            formTitle.textContent = 'Login';
            submitButton.textContent = 'Login';
            toggleRegisterLink.innerHTML = 'Don\'t have an account? <a href="#">Register</a>';
            // Si vous souhaitez réactiver la case de confirmation de mot de passe:
            // document.getElementById('confirm-box').style.display = 'none';
        } else {
            formTitle.textContent = 'Register';
            submitButton.textContent = 'Register';
            toggleRegisterLink.innerHTML = 'Already have an account? <a href="#">Login</a>';
            // Si vous souhaitez réactiver la case de confirmation de mot de passe:
            // document.getElementById('confirm-box').style.display = 'block';
        }
    }
    
    // Animation des cartes mémoire
    const cards = document.querySelectorAll('.memory-card');
    cards.forEach((card, index) => {
        card.style.animation = `float 3s infinite alternate ${index * 0.2}s`;
    });
    
    // Animation des particules
    const particles = document.querySelectorAll('.particle');
    particles.forEach((particle, index) => {
        particle.style.animation = `floatParticle 5s infinite alternate ${index * 0.3}s`;
    });
    
    // Gestion de l'interrupteur ON/OFF
    inputCheck.addEventListener('change', function() {
        const loginBox = document.querySelector('.login-box');
        if (this.checked) {
            loginBox.classList.add('active');
            document.body.classList.add('active');
        } else {
            loginBox.classList.remove('active');
            document.body.classList.remove('active');
        }
    });
    
    // Basculer entre login et register quand on clique sur le lien
    toggleRegisterLink.addEventListener('click', function(e) {
        e.preventDefault();
        toggleMode();
    });
    
    // Gestion de la soumission du formulaire
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const pseudo = emailInput.value;
        const mot_de_passe = passwordInput.value;
        
        try {
            // URL de l'endpoint selon le mode
            const endpoint = isLoginMode ? '/login' : '/register';
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ pseudo, mot_de_passe })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Redirection vers la page du jeu en cas de succès
                window.location.href = 'index.html';
            } else {
                // Afficher un message d'erreur
                alert(data.message || 'Une erreur est survenue');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Problème de connexion au serveur');
        }
    });
    
    // Animation du titre du jeu
    const titleLetters = document.querySelectorAll('.game-title span:not(.space)');
    titleLetters.forEach((letter, index) => {
        letter.style.animation = `glow 2s infinite alternate ${index * 0.1}s`;
    });
});