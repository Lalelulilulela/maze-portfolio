import React from 'react'

const MiniMap = ({ maze, playerPos, roomPositions, currentRoom }) => {
  if (!maze || maze.length === 0) return null

  const renderMiniCell = (cellValue, x, y) => {
    const isPlayer = playerPos.x === x && playerPos.y === y
    const isRoom = Object.values(roomPositions).some(pos => pos && pos.x === x && pos.y === y)
    const roomType = Object.entries(roomPositions).find(([_, pos]) => pos && pos.x === x && pos.y === y)?.[0]
    
    let cellClass = 'mini-cell '
    if (cellValue === 1) {
      cellClass += 'mini-wall'
    } else {
      cellClass += 'mini-path'
      if (isRoom) {
        cellClass += ` mini-room mini-room-${roomType}`
      }
    }
    
    return (
      <div key={`mini-${x}-${y}`} className={cellClass}>
        {isPlayer && <div className="mini-player"></div>}
      </div>
    )
  }

  return (
    <div className="mini-map">
      <div className="mini-map-header">
        <h3>Map</h3>
        {currentRoom && <span className="current-room">In: {currentRoom}</span>}
      </div>
      <div 
        className="mini-maze"
        style={{
          gridTemplateColumns: `repeat(${maze[0]?.length || 0}, 1fr)`,
          gridTemplateRows: `repeat(${maze.length}, 1fr)`
        }}
      >
        {maze.map((row, y) =>
          row.map((cell, x) => renderMiniCell(cell, x, y))
        )}
      </div>
      <div className="mini-map-legend">
        <div className="legend-item">
          <div className="legend-color mini-player"></div>
          <span>You</span>
        </div>
        <div className="legend-item">
          <div className="legend-color mini-room mini-room-profile"></div>
          <span>Rooms</span>
        </div>
      </div>
    </div>
  )
}

export default MiniMap

