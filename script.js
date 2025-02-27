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
const movesDisplay = document.getElementById('moves-count');
const currentPlayerDisplay = document.getElementById('current-player');
const turnIndicator = document.getElementById('turn-indicator');

// Variables d'état du jeu
let firstCard = null;
let secondCard = null;
let player1Score = 0;
let player2Score = 0;
let currentPlayer = 1; // 1 pour Joueur 1, 2 pour Joueur 2
let isFlipping = false;
let moves = 0;

// Récupérer les préférences depuis le localStorage
document.addEventListener('DOMContentLoaded', initGame);

function initGame() {
    isSoloMode = localStorage.getItem('gameMode') === 'solo';
    const selectedTheme = localStorage.getItem('theme') || 'animals';
    difficulty = localStorage.getItem('difficulty') || 'easy';

    if (themes[selectedTheme]) {
        images.length = 0; // Videz le tableau images
        images.push(...themes[selectedTheme], ...themes[selectedTheme]);
        shuffledCards = images.sort(() => Math.random() - 0.5);
    }

    if (isSoloMode) {
        player2ScoreDisplay.parentElement.classList.add('hidden');
        if (turnIndicator) turnIndicator.classList.add('hidden');
    } else {
        player2ScoreDisplay.parentElement.classList.remove('hidden');
        if (turnIndicator) turnIndicator.classList.remove('hidden');
    }

    // Ajustez la hauteur maximale du conteneur de jeu pour éviter le scroll
    adjustGameContainerHeight();
    
    startGame();
}

// Nouvelle fonction pour ajuster la hauteur du conteneur de jeu
function adjustGameContainerHeight() {
    if (!gameContainer) return;
    
    // Obtenir la hauteur de la fenêtre
    const windowHeight = window.innerHeight;
    
    // Calculer les hauteurs des autres éléments
    const gameWrapperHeight = document.querySelector('.game-wrapper').offsetHeight;
    const titleHeight = document.querySelector('h1').offsetHeight;
    const scoreContainerHeight = document.querySelector('.score-container').offsetHeight;
    const gameInfoHeight = document.querySelector('.game-info') ? document.querySelector('.game-info').offsetHeight : 0;
    const turnIndicatorHeight = turnIndicator ? turnIndicator.offsetHeight : 0;
    const gameControlsHeight = document.querySelector('.game-controls') ? document.querySelector('.game-controls').offsetHeight : 0;
    const padding = 80; // Padding supplémentaire
    
    // Calculer la hauteur maximale disponible pour le conteneur de jeu
    const availableHeight = windowHeight - (titleHeight + scoreContainerHeight + gameInfoHeight + turnIndicatorHeight + gameControlsHeight + padding);
    
    // Limiter la hauteur du conteneur de jeu
    gameContainer.style.maxHeight = `${availableHeight}px`;
}

function startGame() {
    resetGame();
    timeRemaining = difficultyTimes[difficulty]; // Initialiser le temps restant en fonction de la difficulté
    resetTimer(); // Réinitialise le chronomètre avant de démarrer
    startTimer(); // Démarre le chronomètre
    moves = 0;
    updateMoves();
}

function resetGame() {
    player1Score = 0;
    player2Score = 0;
    currentPlayer = 1;
    firstCard = null;
    secondCard = null;
    isFlipping = false;
    isGameOver = false;
    moves = 0;
    shuffledCards = shuffledCards.sort(() => Math.random() - 0.5);
    updateScore();
    updateMoves();
    toggleActivePlayer();
    if (winnerMessage) winnerMessage.style.display = 'none';
    gameContainer.style.pointerEvents = 'auto';
    gameContainer.innerHTML = '';
    createCards();
}

function createCards() {
    const fragment = document.createDocumentFragment();
    const [rows, cols] = matrixSize.split('x').map(Number); // Récupère les dimensions de la matrice
    const totalCards = rows * cols;

    // Sélectionne un sous-ensemble d'images en fonction du nombre de cartes nécessaires
    const selectedImages = shuffledCards.slice(0, totalCards / 2);
    const pairedImages = [...selectedImages, ...selectedImages]; // Duplique les images pour les paires
    const shuffledPairedImages = pairedImages.sort(() => Math.random() - 0.5); // Mélange les cartes
    
    // Crée les cartes avec la structure front/back
    shuffledPairedImages.forEach(image => {
        const card = document.createElement('div');
        card.classList.add('card');
        
        // Créer la face avant (dos de la carte)
        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front');
        
        // Créer la face arrière (image de la carte)
        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');
        
        // Ajouter l'image à la face arrière
        const imageElement = document.createElement('img');
        imageElement.src = `images/${image}.jpeg`;
        cardBack.appendChild(imageElement);
        
        // Assembler la carte
        card.appendChild(cardFront);
        card.appendChild(cardBack);
        
        // Ajouter l'écouteur d'événement
        card.addEventListener('click', () => flipCard(card));
        
        fragment.appendChild(card);
    });

    // Applique la grille CSS en fonction de la taille de la matrice
    gameContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gameContainer.appendChild(fragment);
    
    // Ajuster la taille des cartes pour éviter le scroll
    adjustCardSize(rows, cols);
}

// Nouvelle fonction pour ajuster la taille des cartes
function adjustCardSize(rows, cols) {
    if (!gameContainer) return;
    
    // Obtenir les dimensions du conteneur de jeu
    const containerWidth = gameContainer.clientWidth;
    const containerHeight = gameContainer.clientHeight;
    
    // Calculer la taille idéale pour chaque carte
    const cardWidth = Math.floor((containerWidth / cols) - 12); // 12px = gap
    const cardHeight = Math.floor((containerHeight / rows) - 12); // 12px = gap
    
    // Appliquer ces dimensions à toutes les cartes
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.style.width = `${cardWidth}px`;
        card.style.height = `${cardHeight}px`;
        card.style.paddingBottom = '0'; // Remplace le padding-bottom en %
    });
}

function flipCard(card) {
    if (card.classList.contains('flip') || isFlipping || secondCard || card === firstCard || isGameOver) return;

    card.classList.add('flip');
    
    // Incrémenter le compteur de mouvements
    if (!firstCard) {
        firstCard = card;
    } else {
        secondCard = card;
        isFlipping = true;
        moves++;
        updateMoves();
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
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    
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
    isGameOver = true;
    
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000); // Temps écoulé en secondes
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    let winner;
    if (isSoloMode) {
        winner = `Vous avez terminé en ${formattedTime} avec ${moves} mouvements!`;
    } else if (player1Score > player2Score) {
        winner = `Joueur 1 gagne avec ${player1Score} paires! Temps: ${formattedTime}`;
    } else if (player2Score > player1Score) {
        winner = `Joueur 2 gagne avec ${player2Score} paires! Temps: ${formattedTime}`;
    } else {
        winner = `Égalité ${player1Score}-${player2Score}! Temps: ${formattedTime}`;
    }

    winnerMessage.textContent = winner;
    winnerMessage.style.display = 'block';
    winnerMessage.classList.add('winner-animation');
    gameContainer.style.pointerEvents = 'none';
}

function updateScore() {
    player1ScoreDisplay.textContent = player1Score;
    if (!isSoloMode) {
        player2ScoreDisplay.textContent = player2Score;
    }
}

function updateMoves() {
    if (movesDisplay) {
        movesDisplay.textContent = moves;
    }
}

function toggleActivePlayer() {
    if (currentPlayerDisplay) {
        currentPlayerDisplay.textContent = `Joueur ${currentPlayer}`;
    }
    
    if (currentPlayer === 1) {
        player1ScoreDisplay.parentElement.classList.add('active');
        player2ScoreDisplay.parentElement.classList.remove('active');
    } else {
        player2ScoreDisplay.parentElement.classList.remove('active');
        player1ScoreDisplay.parentElement.classList.add('active');
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
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Affichage du message "temps écoulé"
function displayTimeUpMessage() {
    isGameOver = true;
    winnerMessage.textContent = "Le temps est écoulé ! Game Over.";
    winnerMessage.style.display = 'block';
    winnerMessage.classList.add('time-up-animation');
    gameContainer.style.pointerEvents = 'none'; // Désactive les clics
}

// Gestion du bouton de redémarrage
restartButton.addEventListener('click', () => {
    resetGame();
    startGame();
});

// Ajouter un écouteur pour le redimensionnement de la fenêtre
window.addEventListener('resize', () => {
    const [rows, cols] = matrixSize.split('x').map(Number);
    adjustGameContainerHeight();
    adjustCardSize(rows, cols);
});

// Initialiser le joueur actif
toggleActivePlayer();