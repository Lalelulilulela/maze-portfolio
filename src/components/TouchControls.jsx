import React from 'react'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

const TouchControls = ({ onMove, disabled }) => {
  const handleMove = (direction) => {
    if (disabled) return
    
    const keyMap = {
      up: 'ArrowUp',
      down: 'ArrowDown', 
      left: 'ArrowLeft',
      right: 'ArrowRight'
    }
    
    // Simulate keyboard event
    const event = new KeyboardEvent('keydown', {
      key: keyMap[direction],
      code: keyMap[direction],
      bubbles: true
    })
    
    window.dispatchEvent(event)
  }

  return (
    <div className="touch-controls">
      <div className="touch-controls-grid">
        <div></div>
        <button 
          className="touch-btn touch-btn-up"
          onTouchStart={() => handleMove('up')}
          onClick={() => handleMove('up')}
          disabled={disabled}
        >
          <ChevronUp size={24} />
        </button>
        <div></div>
        
        <button 
          className="touch-btn touch-btn-left"
          onTouchStart={() => handleMove('left')}
          onClick={() => handleMove('left')}
          disabled={disabled}
        >
          <ChevronLeft size={24} />
        </button>
        <div className="touch-center">
          <div className="player-indicator">🐣</div>
        </div>
        <button 
          className="touch-btn touch-btn-right"
          onTouchStart={() => handleMove('right')}
          onClick={() => handleMove('right')}
          disabled={disabled}
        >
          <ChevronRight size={24} />
        </button>
        
        <div></div>
        <button 
          className="touch-btn touch-btn-down"
          onTouchStart={() => handleMove('down')}
          onClick={() => handleMove('down')}
          disabled={disabled}
        >
          <ChevronDown size={24} />
        </button>
        <div></div>
      </div>
    </div>
  )
}

export default TouchControls

