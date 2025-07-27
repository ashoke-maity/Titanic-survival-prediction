import { GameManager } from './pages/GameManager.jsx';

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('root');
    const gameManager = new GameManager(gameContainer);
    gameManager.init();
});
