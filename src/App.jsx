import { useState, useEffect, useCallback } from 'react'
import TouchControls from './components/TouchControls'
import MiniMap from './components/MiniMap'
import './App.css'

// Maze generation using recursive backtracking
function generateMaze(width, height) {
  const maze = Array(height).fill().map(() => Array(width).fill(1)) // 1 = wall, 0 = path
  const stack = []
  
  // Start from top-left corner
  const startX = 1
  const startY = 1
  maze[startY][startX] = 0
  stack.push([startX, startY])
  
  const directions = [[0, 2], [2, 0], [0, -2], [-2, 0]] // Right, Down, Left, Up
  
  while (stack.length > 0) {
    const [x, y] = stack[stack.length - 1]
    const neighbors = []
    
    // Find unvisited neighbors
    for (const [dx, dy] of directions) {
      const nx = x + dx
      const ny = y + dy
      
      if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && maze[ny][nx] === 1) {
        neighbors.push([nx, ny, x + dx/2, y + dy/2])
      }
    }
    
    if (neighbors.length > 0) {
      const [nx, ny, wallX, wallY] = neighbors[Math.floor(Math.random() * neighbors.length)]
      maze[ny][nx] = 0 // Mark as path
      maze[wallY][wallX] = 0 // Remove wall between current and neighbor
      stack.push([nx, ny])
    } else {
      stack.pop()
    }
  }
  
  return maze
}

// Room types and their positions
const ROOM_TYPES = {
  PROFILE: 'profile',
  EDUCATION: 'education', 
  PROJECTS: 'projects',
  EXPERIENCE: 'experience',
  CONTACT: 'contact'
}

function App() {
  const [mazeSize] = useState({ width: 21, height: 15 }) // Odd numbers for proper maze generation
  const [maze, setMaze] = useState([])
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 })
  const [currentRoom, setCurrentRoom] = useState(null)
  const [roomPositions, setRoomPositions] = useState({})
  const [isMazeFlattened, setIsMazeFlattened] = useState(false)
  
  // Generate maze and place rooms
  useEffect(() => {
    const newMaze = generateMaze(mazeSize.width, mazeSize.height)
    setMaze(newMaze)
    
    // Find suitable positions for rooms (dead ends or corners)
    const pathCells = []
    for (let y = 1; y < mazeSize.height - 1; y++) {
      for (let x = 1; x < mazeSize.width - 1; x++) {
        if (newMaze[y][x] === 0) {
          pathCells.push({ x, y })
        }
      }
    }
    
    // Place rooms at strategic locations
    const rooms = Object.values(ROOM_TYPES)
    const newRoomPositions = {}
    
    // Distribute rooms across the maze
    const roomSpacing = Math.floor(pathCells.length / rooms.length)
    rooms.forEach((room, index) => {
      const cellIndex = Math.min(index * roomSpacing + Math.floor(Math.random() * roomSpacing), pathCells.length - 1)
      const cell = pathCells[cellIndex]
      newRoomPositions[room] = cell
    })
    
    setRoomPositions(newRoomPositions)
  }, [mazeSize])
  
  // Handle keyboard input for movement
  const handleKeyPress = useCallback((event) => {
    if (currentRoom || isMazeFlattened) return // Don't move while in a room or when maze is flattened
    
    const { key } = event
    let newX = playerPos.x
    let newY = playerPos.y
    
    switch (key.toLowerCase()) {
      case 'arrowup':
      case 'w':
        newY = Math.max(0, playerPos.y - 1)
        break
      case 'arrowdown':
      case 's':
        newY = Math.min(mazeSize.height - 1, playerPos.y + 1)
        break
      case 'arrowleft':
      case 'a':
        newX = Math.max(0, playerPos.x - 1)
        break
      case 'arrowright':
      case 'd':
        newX = Math.min(mazeSize.width - 1, playerPos.x + 1)
        break
      case 'escape':
        setCurrentRoom(null)
        return
      default:
        return
    }
    
    // Check if new position is valid (not a wall)
    if (maze[newY] && maze[newY][newX] === 0) {
      setPlayerPos({ x: newX, y: newY })
      
      // Check if player entered a room
      for (const [roomType, roomPos] of Object.entries(roomPositions)) {
        if (roomPos && roomPos.x === newX && roomPos.y === newY) {
          setCurrentRoom(roomType)
          break
        }
      }
    }
  }, [playerPos, maze, mazeSize, currentRoom, roomPositions, isMazeFlattened])
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])
  
  // Render maze cell
  const renderCell = (cellValue, x, y) => {
    const isPlayer = playerPos.x === x && playerPos.y === y
    const isRoom = Object.values(roomPositions).some(pos => pos.x === x && pos.y === y)
    const roomType = Object.entries(roomPositions).find(([_, pos]) => pos.x === x && pos.y === y)?.[0]
    
    let cellClass = 'maze-cell '
    if (cellValue === 1) {
      cellClass += 'wall'
    } else {
      cellClass += 'path'
      if (isRoom) {
        cellClass += ` room room-${roomType}`
      }
    }
    
    return (
      <div key={`${x}-${y}`} className={cellClass}>
        {isPlayer && <div className="player">🐥</div>}
        {isRoom && !isPlayer && (
          <div className="room-indicator">
            {roomType === ROOM_TYPES.PROFILE && '👤'}
            {roomType === ROOM_TYPES.EDUCATION && '🎓'}
            {roomType === ROOM_TYPES.PROJECTS && '💻'}
            {roomType === ROOM_TYPES.EXPERIENCE && '💼'}
            {roomType === ROOM_TYPES.CONTACT && '📧'}
          </div>
        )}
      </div>
    )
  }
  
  // Room content components
  const renderRoomContent = () => {
    if (!currentRoom) return null
    
    return (
      <div className="room-overlay">
        <div className="room-content">
          <button 
            className="close-button"
            onClick={() => setCurrentRoom(null)}
          >
            ✕
          </button>
          
          {currentRoom === ROOM_TYPES.PROFILE && (
            <div className="room-profile">
              <h2>👤 Profile</h2>
              <div className="profile-content">
                <div className="avatar">🐣</div>
                <h3>Computer Science Student</h3>
                <p>Welcome to my interactive portfolio! Navigate through the maze to discover my education, projects, experience, and contact information.</p>
                <p>Use arrow keys or WASD to move around the maze. Press ESC to close this room.</p>
              </div>
            </div>
          )}
          
          {currentRoom === ROOM_TYPES.EDUCATION && (
            <div className="room-education">
              <h2>🎓 Education</h2>
              <div className="education-content">
                <div className="education-item">
                  <h3>National University of Singapore</h3>
                  <p className="duration">Aug 2022 - Present</p>
                  <p className="degree">Bachelor of Computing in Computer Science</p>
                  
                  <h4>Relevant Modules:</h4>
                  <ul>
                    <li>Programming Methodology (Java)</li>
                    <li>Data Structures and Algorithms (Java)</li>
                    <li>Computer Organisation (C)</li>
                    <li>Introduction to Computer Networks (Python)</li>
                    <li>Introduction to AI and Machine Learning (Python, PyTorch)</li>
                    <li>Introduction to Software Engineering (Java)</li>
                  </ul>
                  
                  <h4>RVRC Ridge View Residential College Programme</h4>
                  <p><strong>College Students' Committee (Events), Sub-committee Member</strong></p>
                  <p>Led and collaborated with members as 1 of the 4 Project Directors in charge of a Halloween event. Strategically organized inclusive and captivating events catering to approximately 400 students within the residential college.</p>
                </div>
                
                <div className="education-item">
                  <h3>Dunman High School</h3>
                  <p className="duration">Jan 2016 - Dec 2021</p>
                  
                  <h4>Guitar Ensemble, Section Leader</h4>
                  <p className="duration">Jan 2020 - Dec 2021</p>
                  <p>Fostered stronger bonds among section members by designing engaging and interactive games during strategic breaks, optimizing practice sessions for maximum effectiveness, attaining Distinction for the Singapore Youth Festival (SYF) in 2021.</p>
                </div>
              </div>
            </div>
          )}
          
          {currentRoom === ROOM_TYPES.PROJECTS && (
            <div className="room-projects">
              <h2>💻 Projects</h2>
              <div className="projects-content">
                <div className="project-item">
                  <h3>Maple Syrup && Pancake</h3>
                  <p className="duration">Apr 2023 - Jul 2023</p>
                  <p className="role">Co-Developer</p>
                  <p className="description">2-player, 2D puzzle platformer game</p>
                  <p>Designed and developed Maple Syrup && Pancake using Unity, implementing game mechanics (e.g., player movement, respawn, enemies, end-game conditions, etc.) with C# scripts to enhance gameplay and adjust overall difficulty.</p>
                  <img src="maple-syrup-pancake.png" alt="Maple Syrup && Pancake Game" className="project-image" />
                  <a href="https://drive.google.com/drive/folders/1Iv1H2mZSauZ9XhfRLWHbFT2JZIdauiV5" target="_blank" rel="noopener noreferrer" className="project-link">
                    View Demo, Poster, and Prototype →
                  </a>
                </div>
                
                <div className="project-item">
                  <h3>Lelu Chatbot</h3>
                  <p className="duration">Feb 2024 - Mar 2024</p>
                  <p className="role">Software Engineer</p>
                  <p className="description">Simple task manager</p>
                  <p>Built incrementally while integrating comprehensive Java and Software Engineering techniques (such as Object-oriented design, Exception Handling, Unit Testing, code quality etc.) to perform basic functions such as adding, viewing, finding, deleting and saving of tasks managed by Lelu Bot.</p>
                  <a href="https://github.com/Lalelulilulela/ip/releases" target="_blank" rel="noopener noreferrer" className="project-link">
                    View Project →
                  </a>
                </div>
              </div>
            </div>
          )}
          
          {currentRoom === ROOM_TYPES.EXPERIENCE && (
            <div className="room-experience">
              <h2>💼 Work Experience</h2>
              <div className="experience-content">
                <div className="experience-item">
                  <h3>KABAM ROBOTICS</h3>
                  <p className="duration">Software Intern Sep 2024 - Mar 2025</p>
                  <ul>
                    <li>Trained a YOLO-based object detection model for a new module and integrated it into the existing video analytics engine.</li>
                    <li>Conducted a proof of concept by containerising and deploying a video-analytics software (Frigate) on NVIDIA Jetson to evaluate its potential as a replacement and tested integration with the existing backend system.</li>
                    <li>Experimented with NVIDIA DeepStream to evaluate approaches for efficient real-time video processing on edge hardware.</li>
                    <li>Gained hands-on experience in computer vision, edge AI deployment, containerisation (Docker), and backend integration within a collaborative engineering environment.</li>
                  </ul>
                </div>
                <div className="experience-item">
                  <h3>MIRACLE MATH</h3>
                  <p className="duration">Math Tuition Teacher Jul 2023 - Present</p>
                  <ul>
                    <li>Teaching 2 classes of at most 7 Primary 5 students Mathematics.</li>
                    <li>Create and implement lesson plans twice a week, catered to the average capabilities of all of students in the same class.</li>
                    <li>Engage students by constantly asking questions every 15 mins for capturing and sustaining attention.</li>
                    <li>Looked after the mental well-being of all 7 students by giving frequent encouragement every lesson.</li>
                  </ul>
                </div>
                <div className="experience-item">
                  <h3>ACALYT EDUCATION</h3>
                  <p className="duration">Online Tutor Jul 2022 - Present</p>
                  <ul>
                    <li>Conduct one-to-one personalised online lessons for each student every once or twice a week.</li>
                    <li>Plan one interactive segment each lesson to engage younger students, especially in an online setting.</li>
                    <li>Deliver timely feedback at the end of every lesson for parents and students to gauge students' performance in class.</li>
                  </ul>
                </div>
                <div className="experience-item">
                  <h3>EDUFIRST LEARNING CENTRE</h3>
                  <p className="duration">Tuition Teacher May 2022 - Dec 2022</p>
                  <ul>
                    <li>Supervised groups of 2 to 8 students in 4 different classes, ensuring good behaviour and discipline.</li>
                    <li>Allocated around 10-15 mins each lesson for personalised tutoring of each of the students.</li>
                    <li>Looked after the mental well-being of students by giving frequent encouragement every lesson.</li>
                  </ul>
                </div>
                <div className="experience-item">
                  <h3>PT. GO-JEK</h3>
                  <p className="duration">Booth Promoter Apr 2022 - May 2022</p>
                  <ul>
                  </ul>
                  <div className="gojek-flex-container">
                    <div className="gojek-text-content">
                      <p>Encouraged more than 10 groups of travellers arriving at Changi Airport per day to quickly disperse from the airport and prevent crowds (during the start of the pandemic) through ride-hailing services.</p>
                      <p>Developed interpersonal skills while persuading diverse groups of people to employ the ride-hailing services.</p>
                    </div>
                    <img src="gojek-promo.jpg" alt="PT. GO-JEK Promotion" className="gojek-image" />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {currentRoom === ROOM_TYPES.CONTACT && (
            <div className="room-contact">
              <h2>📧 Contact</h2>
              <div className="contact-content">
                <p>Let\'s connect! Here\'s how you can reach me:</p>
                <div className="contact-methods">
                  <div className="contact-item">
                    <span className="contact-icon">📞</span>
                    <span>Mobile: +65 8652 1826</span>
                  </div>
                  <div className="contact-item">
                    <span className="contact-icon">📧</span>
                    <span>Email: tan.y.j.2003@gmail.com</span>
                  </div>
                  <div className="contact-item">
                    <span className="contact-icon">💼</span>
                    <span>LinkedIn: www.linkedin.com/in/tyj-lalelulilulela</span>
                  </div>
                  <div className="contact-item">
                    <span className="contact-icon">🐙</span>
                    <span>GitHub: https://github.com/Lalelulilulela</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
  
  // Render flattened room buttons
  const renderFlattenedRooms = () => {
    return (
      <div className="flattened-rooms">
        <div className="room-buttons-grid">
          <button 
            className="room-button room-button-profile"
            onClick={() => setCurrentRoom(ROOM_TYPES.PROFILE)}
          >
            <span className="room-button-icon">👤</span>
            <span className="room-button-text">Profile</span>
          </button>
          <button 
            className="room-button room-button-education"
            onClick={() => setCurrentRoom(ROOM_TYPES.EDUCATION)}
          >
            <span className="room-button-icon">🎓</span>
            <span className="room-button-text">Education</span>
          </button>
          <button 
            className="room-button room-button-projects"
            onClick={() => setCurrentRoom(ROOM_TYPES.PROJECTS)}
          >
            <span className="room-button-icon">💻</span>
            <span className="room-button-text">Projects</span>
          </button>
          <button 
            className="room-button room-button-experience"
            onClick={() => setCurrentRoom(ROOM_TYPES.EXPERIENCE)}
          >
            <span className="room-button-icon">💼</span>
            <span className="room-button-text">Experience</span>
          </button>
          <button 
            className="room-button room-button-contact"
            onClick={() => setCurrentRoom(ROOM_TYPES.CONTACT)}
          >
            <span className="room-button-icon">📧</span>
            <span className="room-button-text">Contact</span>
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="app">
      <div className="header">
        <h1>Portfolio Maze</h1>
        <p>Navigate with arrow keys or WASD • Find the rooms to explore my portfolio</p>
        <button 
          className="flatten-button"
          onClick={() => setIsMazeFlattened(!isMazeFlattened)}
        >
          {isMazeFlattened ? '🧩 Show Maze' : '📋 Flatten Maze'}
        </button>
      </div>
      
      <div className="main-content">
        <div className="maze-section">
          {!isMazeFlattened ? (
            <>
              <div className="maze-container">
                <div 
                  className="maze"
                  style={{
                    gridTemplateColumns: `repeat(${mazeSize.width}, 1fr)`,
                    gridTemplateRows: `repeat(${mazeSize.height}, 1fr)`
                  }}
                >
                  {maze.map((row, y) =>
                    row.map((cell, x) => renderCell(cell, x, y))
                  )}
                </div>
              </div>
              
              <div className="controls">
                <div className="desktop-controls">
                  <p>Use ↑↓←→ or WASD to move • ESC to close rooms</p>
                </div>
                <div className="mobile-controls">
                  <TouchControls disabled={!!currentRoom} />
                </div>
              </div>
            </>
          ) : (
            renderFlattenedRooms()
          )}
        </div>
      </div>
      
      {renderRoomContent()}
    </div>
  )
}

export default App

