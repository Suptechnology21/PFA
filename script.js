// Liste des images pour les cartes selon le thème
const themes = {
    animals: ['c', 'html', 'html', 'js', 'node', 'php'],
    nature: ['tree', 'flower', 'sun', 'cloud', 'mountain', 'river'],
    objects: ['phone', 'laptop', 'book', 'pen', 'watch', 'chair']
};

// Sons pour le jeu
const flipSound = new Audio('sounds/flip.mp3');
const matchSound = new Audio('sounds/match.mp3');
const mismatchSound = new Audio('sounds/miss.mp3');
const backgroundMusic = new Audio('sounds/background.mp3'); // Nouveau son de fond
backgroundMusic.loop = true; // Répéter la musique en boucle

// Variables globales
const images = [];
let shuffledCards = [];
let isSoloMode = false; // Par défaut, mode Duo
let difficulty = 'easy'; // Par défaut, facile
let matrixSize = localStorage.getItem('matrixSize') || '4x4'; // Taille de la matrice
let timerInterval;
let startTime;
let isMusicPlaying = false;
const musicToggle = document.getElementById('sound-btn');

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
function tryAutoPlayMusic() {
    backgroundMusic.volume = 0.3; // Volume à 30%
    const playPromise = backgroundMusic.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            isMusicPlaying = true;
            updateMusicIcon();
        }).catch(error => {
            console.log('Lecture automatique bloquée', error);
            isMusicPlaying = false;
            updateMusicIcon();
        });
    }
}
function updateMusicIcon() {
    const soundIcon = document.getElementById('sound-icon');
    if (isMusicPlaying) {
        soundIcon.classList.remove('fa-volume-mute');
        soundIcon.classList.add('fa-volume-up');
    } else {
        soundIcon.classList.remove('fa-volume-up');
        soundIcon.classList.add('fa-volume-mute');
    }
}

// Modifiez votre écouteur d'événement de son existant
musicToggle.addEventListener('click', () => {
    if (isMusicPlaying) {
        // Arrêter la musique
        backgroundMusic.pause();
        isMusicPlaying = false;
    } else {
        // Essayer de jouer la musique
        tryAutoPlayMusic();
    }
    updateMusicIcon();
});
function initGame() {
    isSoloMode = localStorage.getItem('gameMode') === 'solo';
    const selectedTheme = localStorage.getItem('theme') || 'animals';
    difficulty = localStorage.getItem('difficulty') || 'easy';

    // Modification ici pour générer plus d'images si nécessaire
    if (themes[selectedTheme]) {
        images.length = 0; // Videz le tableau images
        const themeImages = themes[selectedTheme];
        
        // Calculer combien de paires sont nécessaires pour la matrice
        const [rows, cols] = matrixSize.split('x').map(Number);
        const totalCards = rows * cols;
        const pairsNeeded = totalCards / 2;
        
        // Répéter les images suffisamment de fois pour avoir assez de paires
        while (images.length < totalCards) {
            images.push(...themeImages);
        }
        
        // Tronquer au nombre exact de cartes nécessaires
        shuffledCards = images.slice(0, totalCards).sort(() => Math.random() - 0.5);
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
    toggleActivePlayer();

    
    // Démarrer la musique de fond
    backgroundMusic.play().catch(error => {
        console.log('Erreur lors de la lecture de la musique de fond:', error);
    });
}
document.addEventListener('DOMContentLoaded', () => {
    // Vos initialisations existantes...
    
    // Ajouter une vérification de la lecture automatique
    if (localStorage.getItem('musicEnabled') !== 'false') {
        tryAutoPlayMusic();
    }
});

// Modification de la fonction de volume
function setBackgroundMusicVolume(volume) {
    backgroundMusic.volume = volume;
    if (volume > 0) {
        isMusicPlaying = true;
    } else {
        isMusicPlaying = false;
    }
    updateMusicIcon();
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
    
    // Arrêter et redémarrer la musique de fond
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}

function createCards() {
    const fragment = document.createDocumentFragment();
    const [rows, cols] = matrixSize.split('x').map(Number); // Récupère les dimensions de la matrice
    const totalCards = rows * cols;
    
    // Modification ici : nous utilisons directement shuffledCards qui est déjà configuré 
    // dans initGame() pour avoir le bon nombre de cartes
    const gameDeck = [...shuffledCards];
    
    // Crée les cartes avec la structure front/back
    gameDeck.forEach(image => {
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

    // Jouer le son de flip
    flipSound.play();

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
    // Jouer le son de match
    matchSound.play();

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
    // Désactiver temporairement les clics
    gameContainer.style.pointerEvents = 'none';
    
    // Créer une nouvelle instance du son pour chaque mismatch
    // Cela évite les problèmes quand les sons se chevauchent
    const mismatchSoundInstance = new Audio('sounds/miss.mp3');
    mismatchSoundInstance.volume = mismatchSound.volume; // Conserver le même volume
    
    setTimeout(() => {
        // Jouer le son de différence avec la nouvelle instance
        mismatchSoundInstance.play().catch(error => {
            console.log('Erreur lors de la lecture du son de mismatch:', error);
        });
    }, 400); // Délai de 400 millisecondes après le retournement des cartes

    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        resetCards();
        isFlipping = false;

        // Réactiver les clics
        gameContainer.style.pointerEvents = 'auto';

        if (!isSoloMode) {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            toggleActivePlayer();
        }
    }, 1000); // Même durée qu'avant
}
function resetCards() {
    firstCard = null;
    secondCard = null;
}

function displayWinner() {
    stopTimer(); // Arrête le chronomètre à la fin du jeu
    backgroundMusic.pause(); // Arrêter la musique de fond
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
    backgroundMusic.pause(); // Arrêter la musique de fond
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
    backgroundMusic.pause(); // Arrêter la musique de fond
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

// Ajout d'une fonction pour contrôler le volume des sons (optionnel)
function setSoundVolume(volume) {
    // Volume doit être entre 0 et 1
    flipSound.volume = volume;
    matchSound.volume = volume;
    mismatchSound.volume = volume;
}

// Ajouter une fonction pour contrôler le volume de la musique de fond
function setBackgroundMusicVolume(volume) {
    // Volume doit être entre 0 et 1
    backgroundMusic.volume = volume;
}

// Initialiser le joueur actif
toggleActivePlayer();