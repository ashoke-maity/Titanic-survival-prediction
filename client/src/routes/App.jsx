import { useEffect, useRef } from 'react'
import { GameManager } from '../pages/GameManager.jsx'
import './App.css'

function App() {
  const gameContainerRef = useRef(null);
  const gameManagerRef = useRef(null);

  useEffect(() => {
    if (gameContainerRef.current && !gameManagerRef.current) {
      // Initialize the game
      gameManagerRef.current = new GameManager(gameContainerRef.current);
      gameManagerRef.current.init();
    }

    // Cleanup on unmount
    return () => {
      if (gameManagerRef.current) {
        gameManagerRef.current.dispose();
        gameManagerRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={gameContainerRef} 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        overflow: 'hidden',
        background: '#000033'
      }}
    />
  )
}

export default App
