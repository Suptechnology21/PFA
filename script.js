// Liste des images pour les cartes selon le thème
const themes = {
    animals: ['c', 'html', 'html', 'js', 'node', 'php'],
    nature: ['tree', 'flower', 'sun', 'cloud', 'mountain', 'river'],
    objects: ['phone', 'laptop', 'book', 'pen', 'watch', 'chair']
};

// Variables globales
const images = [];
let shuffledCards = [];
let isSoloMode = false; // Par défaut, mode Duo
let difficulty = 'easy'; // Par défaut, facile
let matrixSize = localStorage.getItem('matrixSize') || '4x4'; // Taille de la matrice
let timerInterval;
let startTime;

// Temps limite en fonction de la difficulté (en secondes)
const difficultyTimes = {
    easy: 180,   // 3 minutes
    medium: 120, // 2 minutes
    hard: 60     // 1 minute
};

let timeRemaining; // Temps restant
let isGameOver = false; // Flag pour vérifier si le jeu est terminé

// Sélection des éléments HTML
const welcomeScreen = document.querySelector('.welcome-screen');
const gameScreen = document.querySelector('.game-screen');
const gameContainer = document.querySelector('.game-container');
const restartButton = document.getElementById('restart-btn');
const player1ScoreDisplay = document.getElementById('score-player1');
const player2ScoreDisplay = document.getElementById('score-player2');
const winnerMessage = document.getElementById('winner');
const timerDisplay = document.getElementById('timer');

// Variables d'état du jeu
let firstCard = null;
let secondCard = null;
let player1Score = 0;
let player2Score = 0;
let currentPlayer = 1; // 1 pour Joueur 1, 2 pour Joueur 2
let isFlipping = false;

// Récupérer les préférences depuis le localStorage
document.addEventListener('DOMContentLoaded', initGame);

function initGame() {
    isSoloMode = localStorage.getItem('gameMode') === 'solo';
    const selectedTheme = localStorage.getItem('theme');
    difficulty = localStorage.getItem('difficulty') || 'easy';

    if (themes[selectedTheme]) {
        images.push(...themes[selectedTheme], ...themes[selectedTheme]);
        shuffledCards = images.sort(() => Math.random() - 0.5);
    }

    if (isSoloMode) {
        player2ScoreDisplay.parentElement.classList.add('hidden');
    }

    startGame();
}

function startGame() {
    resetGame();
    timeRemaining = difficultyTimes[difficulty]; // Initialiser le temps restant en fonction de la difficulté
    resetTimer(); // Réinitialise le chronomètre avant de démarrer
    startTimer(); // Démarre le chronomètre
}

function resetGame() {
    player1Score = 0;
    player2Score = 0;
    currentPlayer = 1;
    firstCard = null;
    secondCard = null;
    isFlipping = false;
    shuffledCards = shuffledCards.sort(() => Math.random() - 0.5);
    updateScore();
    toggleActivePlayer();
    winnerMessage.style.display = 'none';
    gameContainer.style.pointerEvents = 'auto';
    gameContainer.innerHTML = '';
    createCards();
}

function createCards() {
    const fragment = document.createDocumentFragment();
    const [rows, cols] = matrixSize.split('x').map(Number); // Récupère les dimensions de la matrice
    const totalCards = rows * cols;

    // Sélectionne un sous-ensemble d'images en fonction du nombre de cartes nécessaires
    const selectedImages = images.slice(0, totalCards / 2);
    const pairedImages = [...selectedImages, ...selectedImages]; // Duplique les images pour les paires
    shuffledCards = pairedImages.sort(() => Math.random() - 0.5); // Mélange les cartes

    // Crée les cartes
    shuffledCards.forEach(image => {
        const card = document.createElement('div');
        card.classList.add('card');
        const imageElement = document.createElement('img');
        imageElement.src = `images/${image}.jpeg`;
        card.classList.add('image');
        card.appendChild(imageElement);
        card.addEventListener('click', () => flipCard(card));
        fragment.appendChild(card);
    });

    // Applique la grille CSS en fonction de la taille de la matrice
    gameContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gameContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    gameContainer.appendChild(fragment);
}

function flipCard(card) {
    if (card.classList.contains('flip') || isFlipping || secondCard || card === firstCard || isGameOver) return;

    card.classList.add('flip');

    if (!firstCard) {
        firstCard = card;
    } else {
        secondCard = card;
        isFlipping = true;
        checkMatch();
    }
}

function checkMatch() {
    const firstImage = firstCard.querySelector('img')?.src;
    const secondImage = secondCard.querySelector('img')?.src;

    if (firstImage === secondImage) {
        handleMatch();
    } else {
        handleMismatch();
    }
}

function handleMatch() {
    currentPlayer === 1 ? player1Score++ : !isSoloMode && player2Score++;
    updateScore();
    resetCards();
    isFlipping = false;

    const totalPairs = (matrixSize.split('x')[0] * matrixSize.split('x')[1]) / 2;
    if (player1Score + player2Score === totalPairs) {
        stopTimer();
        displayWinner();
    }
}

function handleMismatch() {
    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        resetCards();
        isFlipping = false;

        if (!isSoloMode) {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            toggleActivePlayer();
        }
    }, 1000);
}

function resetCards() {
    firstCard = null;
    secondCard = null;
}

function displayWinner() {
    stopTimer(); // Arrête le chronomètre à la fin du jeu
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000); // Temps écoulé en secondes
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    let winner;
    if (isSoloMode) {
        winner = `Vous avez terminé en ${formattedTime}.`;
    } else if (player1Score > player2Score) {
        winner = `Player 1 wins! Time: ${formattedTime}`;
    } else if (player2Score > player1Score) {
        winner = `Player 2 wins! Time: ${formattedTime}`;
    } else {
        winner = `It's a tie! Time: ${formattedTime}`;
    }

    winnerMessage.textContent = winner;
    winnerMessage.style.display = 'block';
    winnerMessage.classList.add('winner-animation');
    gameContainer.style.pointerEvents = 'none';
    isGameOver = true; // Marquer la fin du jeu
}

function updateScore() {
    player1ScoreDisplay.textContent = player1Score;
    if (!isSoloMode) {
        player2ScoreDisplay.textContent = player2Score;
    }
}

function toggleActivePlayer() {
    if (currentPlayer === 1) {
        player1ScoreDisplay.parentElement.classList.add('active');
        player2ScoreDisplay.parentElement.classList.remove('active');
    } else {
        player2ScoreDisplay.parentElement.classList.add('active');
        player1ScoreDisplay.parentElement.classList.remove('active');
    }
}

// Fonctions pour le chronomètre
function startTimer() {
    startTime = Date.now(); // Enregistre l'heure de début
    timerInterval = setInterval(updateTimer, 1000); // Met à jour toutes les secondes
}

function updateTimer() {
    if (isGameOver) return; // Ne met pas à jour si le jeu est terminé

    const elapsedTime = Math.floor((Date.now() - startTime) / 1000); // Temps écoulé en secondes
    const timeLeft = timeRemaining - elapsedTime; // Temps restant

    const minutes = Math.floor(timeLeft / 60); // Convertit en minutes
    const seconds = timeLeft % 60; // Secondes restantes

    if (timeLeft <= 0) {
        stopTimer();
        displayTimeUpMessage(); // Affiche "Le temps est écoulé"
        return;
    }

    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function stopTimer() {
    clearInterval(timerInterval); // Arrête l'intervalle
}

function resetTimer() {
    stopTimer(); // Arrête le chronomètre
    timerDisplay.textContent = "0:00"; // Réinitialise l'affichage
}

// Affichage du message "temps écoulé"
function displayTimeUpMessage() {
    winnerMessage.textContent = "Le temps est écoulé ! Game Over.";
    winnerMessage.style.display = 'block';
    winnerMessage.classList.add('time-up-animation');
    gameContainer.style.pointerEvents = 'none'; // Désactive les clics
    isGameOver = true; // Marquer la fin du jeu
    resetTimer(); // Réinitialise le chronomètre
}

// Gestion du bouton de redémarrage
restartButton.addEventListener('click', () => {
    resetGame();
    startGame();
});

toggleActivePlayer();
