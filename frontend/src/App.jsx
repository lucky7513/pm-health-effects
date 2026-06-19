import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_BASE_URL = 'http://localhost:8000'

function App() {
  const [page, setPage] = useState('login')
  const [user, setUser] = useState(null)
  const [states, setStates] = useState([])
  const [selectedState, setSelectedState] = useState('Delhi')
  const [pmType, setPmType] = useState('PM2.5')
  const [selectedPart, setSelectedPart] = useState(null)
  const [effects, setEffects] = useState([])
  const [bodyParts, setBodyParts] = useState([])
  const [loading, setLoading] = useState(false)

  const bodyPartIcons = {
    "Brain & Head": "🧠",
    "Throat & Neck": "🔴",
    "Lungs & Respiratory": "🫁",
    "Heart & Cardiovascular": "❤️",
    "Liver & Metabolism": "🫘",
    "Stomach & Digestive": "🍽️",
    "Kidneys & Renal": "🫘",
    "Intestines & GI": "🌊",
    "Skin & Dermal": "👁️",
    "Bones & Muscles": "💪"
  }

  useEffect(() => {
    fetchStates()
    fetchBodyParts()
  }, [])

  const fetchStates = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/states`)
      setStates(response.data.states)
    } catch (error) {
      console.error('Error fetching states:', error)
    }
  }

  const fetchBodyParts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/body-parts`)
      setBodyParts(response.data.body_parts)
    } catch (error) {
      console.error('Error fetching body parts:', error)
    }
  }

  const fetchEffects = async (part, pm) => {
    setLoading(true)
    try {
      const response = await axios.get(
        `${API_BASE_URL}/health-effects/${encodeURIComponent(part)}?pm_type=${pm}`
      )
      setEffects(response.data.effects)
    } catch (error) {
      console.error('Error fetching effects:', error)
      setEffects([])
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    const name = e.target.name.value
    const age = e.target.age.value

    if (!name || !age) {
      alert('Please fill in all fields')
      return
    }

    setUser({ name, age })
    setPage('dashboard')
    e.target.reset()
  }

  const handleSelectBodyPart = (part) => {
    setSelectedPart(part)
    fetchEffects(part, pmType)
  }

  const handlePMChange = (pm) => {
    setPmType(pm)
    if (selectedPart) {
      fetchEffects(selectedPart, pm)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setSelectedPart(null)
    setEffects([])
    setPage('login')
  }

  if (page === 'login') {
    return (
      <div className="app">
        <div className="login-page">
          <div className="login-card">
            <h1>Health Risk Assessment</h1>
            <p>Enter your details to check PM2.5 & PM10 health impacts</p>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., Rahul"
                  required
                />
              </div>

              <div className="form-group">
                <label>Age Group</label>
                <select name="age" required>
                  <option value="">Select age group</option>
                  <option value="Children (0-12)">Children (0-12)</option>
                  <option value="Adolescents (13-19)">Adolescents (13-19)</option>
                  <option value="Adults (20-65)">Adults (20-65)</option>
                  <option value="Elderly (65+)">Elderly (65+)</option>
                </select>
              </div>

              <button type="submit" className="login-btn">
                Continue
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="dashboard">
        <div className="header">
          <div className="header-left">
            <h2>Welcome, {user?.name}</h2>
            <p>{user?.age}</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="controls-section">
          <div className="control-box">
            <label>Select State</label>
            <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div className="control-box">
            <label>Pollution Type</label>
            <div className="pm-toggle">
              <button
                className={`pm-btn ${pmType === 'PM2.5' ? 'active' : ''}`}
                onClick={() => handlePMChange('PM2.5')}
              >
                PM2.5
              </button>
              <button
                className={`pm-btn ${pmType === 'PM10' ? 'active' : ''}`}
                onClick={() => handlePMChange('PM10')}
              >
                PM10
              </button>
            </div>
          </div>
        </div>

        <div className="body-section">
          <div className="body-diagram-card">
            <h3>Select Body Part</h3>
            <div className="body-parts-grid">
              {bodyParts.map((part) => (
                <button
                  key={part}
                  className={`body-part-btn ${selectedPart === part ? 'active' : ''}`}
                  onClick={() => handleSelectBodyPart(part)}
                >
                  <span className="icon">{bodyPartIcons[part] || '⚕️'}</span>
                  <span className="text">{part}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="problems-card">
            <h3>Health Problems</h3>
            {!selectedPart ? (
              <div className="no-selection">Click on a body part to see health risks</div>
            ) : loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <>
                <div className="selected-part-info">
                  <div className="part-name">
                    {bodyPartIcons[selectedPart]} {selectedPart}
                  </div>
                  <div className="part-state">
                    Showing effects for {pmType} in {selectedState} for {user?.age}
                  </div>
                </div>
                <div className="problems-list">
                  {effects.length > 0 ? (
                    effects.map((effect, idx) => (
                      <div key={idx} className="problem-item">
                        <div className="problem-title">{effect.name}</div>
                        <div className="problem-desc">{effect.desc}</div>
                        <div className="severity">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`severity-dot ${i < effect.severity ? 'filled' : ''}`}
                            ></div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-selection">No effects found</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
