// Get DOM elements
const toggleRegisterLink = document.querySelector('.register-link');
const formTitle = document.getElementById('form-title');
const confirmBox = document.getElementById('confirm-box');
const emailInput = document.querySelector('input[type="email"]');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const form = document.querySelector('form');

let isLoginMode = true;

// Function to update form mode
function updateFormMode() {
    if (isLoginMode) {
        formTitle.textContent = 'Login';
        confirmBox.style.display = 'none';
        toggleRegisterLink.innerHTML = '<p>Don\'t have an account? <a href="#">Register</a></p>';
    } else {
        formTitle.textContent = 'Register';
        confirmBox.style.display = 'block';
        toggleRegisterLink.innerHTML = '<p>Already have an account? <a href="#">Login</a></p>';
    }
}

// Event delegation for toggle links
toggleRegisterLink.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        updateFormMode();
        form.reset();
    }
});

// Form submission handler
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = emailInput.value;
    const password = passwordInput.value;
    
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }
    
    if (!isLoginMode) {
        const confirmPassword = confirmPasswordInput.value;
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
    }
    
    // Here you would typically send the data to a server
    console.log('Form submitted:', {
        mode: isLoginMode ? 'login' : 'register',
        email: email,
        password: password
    });
});

// Email validation helper function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}