import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Chart from 'chart.js/auto'
import './App.css'

const API_BASE_URL = 'https://pm-health-effects.onrender.com'

const bodyPartIcons = {
  "Brain & Head": "🧠",
  "Lungs & Respiratory": "🫁",
  "Heart & Cardiovascular": "❤️",
  "Liver & Metabolism": "🫘",
  "Stomach & Digestive": "🍽️",
  "Kidneys & Renal": "🫘",
  "Intestines & GI": "🌊",
  "Skin & Dermal": "👁️",
  "Bones & Muscles": "💪"
}

function App() {
  const [page, setPage] = useState('login')
  const [user, setUser] = useState(null)
  const [states, setStates] = useState([])
  const [selectedState, setSelectedState] = useState('Delhi')
  const [pmType, setPmType] = useState('PM2.5')
  const [selectedPart, setSelectedPart] = useState(null)
  const [effects, setEffects] = useState([])
  const [statePollution, setStatePollution] = useState({})
  const [loading, setLoading] = useState(false)

  const sevChartRef = useRef(null)
  const stateChartRef = useRef(null)
  const sevChartInstance = useRef(null)
  const stateChartInstance = useRef(null)

  useEffect(() => {
    fetchStates()
    fetchAllStatePollution()
  }, [])

  useEffect(() => {
    if (page === 'dashboard') {
      renderStateChart()
    }
    // eslint-disable-next-line
  }, [page, pmType, selectedState, statePollution])

  useEffect(() => {
    if (selectedPart) {
      fetchEffects(selectedPart, pmType)
    }
    // eslint-disable-next-line
  }, [pmType])

  const fetchStates = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/states`)
      setStates(response.data.states)
    } catch (error) {
      console.error('Error fetching states:', error)
    }
  }

  const fetchAllStatePollution = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/states`)
      const stateList = response.data.states
      const pollutionData = {}
      await Promise.all(
        stateList.map(async (s) => {
          const res = await axios.get(`${API_BASE_URL}/state-pollution/${encodeURIComponent(s)}`)
          pollutionData[s] = res.data.pollution
        })
      )
      setStatePollution(pollutionData)
    } catch (error) {
      console.error('Error fetching pollution data:', error)
    }
  }

  const fetchEffects = async (part, pm) => {
    setLoading(true)
    try {
      const response = await axios.get(
        `${API_BASE_URL}/health-effects/${encodeURIComponent(part)}?pm_type=${pm}`
      )
      setEffects(response.data.effects)
      setTimeout(() => renderSevChart(response.data.effects), 50)
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
  }

  const handleSelectBodyPart = (part) => {
    setSelectedPart(part)
    fetchEffects(part, pmType)
  }

  const handlePMChange = (pm) => {
    setPmType(pm)
  }

  const handleLogout = () => {
    setUser(null)
    setSelectedPart(null)
    setEffects([])
    setPage('login')
  }

  const renderSevChart = (effectsData) => {
    if (!sevChartRef.current) return
    if (sevChartInstance.current) sevChartInstance.current.destroy()
    sevChartInstance.current = new Chart(sevChartRef.current, {
      type: 'bar',
      data: {
        labels: effectsData.map(e => e.name.length > 14 ? e.name.slice(0, 13) + '…' : e.name),
        datasets: [{
          label: 'Severity',
          data: effectsData.map(e => e.severity),
          backgroundColor: '#d97706',
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { beginAtZero: true, max: 5, ticks: { color: '#5a7a68', stepSize: 1 }, grid: { color: '#e7f3ec' } },
          y: { ticks: { color: '#5a7a68', font: { size: 11 } }, grid: { display: false } }
        },
        plugins: { legend: { display: false } }
      }
    })
  }

  const renderStateChart = () => {
    if (!stateChartRef.current) return
    const statesList = Object.keys(statePollution)
    if (statesList.length === 0) return
    const key = pmType === 'PM2.5' ? 'PM2.5' : 'PM10'
    const values = statesList.map(s => statePollution[s][key])
    const colors = statesList.map(s => s === selectedState ? '#15803d' : '#bfe0cc')

    if (stateChartInstance.current) stateChartInstance.current.destroy()
    stateChartInstance.current = new Chart(stateChartRef.current, {
      type: 'bar',
      data: {
        labels: statesList.map(s => s.length > 8 ? s.slice(0, 7) + '…' : s),
        datasets: [{
          label: pmType + ' level',
          data: values,
          backgroundColor: colors,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: '#5a7a68', font: { size: 10 }, maxRotation: 45, autoSkip: false }, grid: { display: false } },
          y: { beginAtZero: true, ticks: { color: '#5a7a68' }, grid: { color: '#e7f3ec' } }
        },
        plugins: { legend: { display: false } }
      }
    })
  }

  const MAX_EFFECTS_TRACKED = 5
  const WHO_SAFE_LIMIT = { 'PM2.5': 60, 'PM10': 100 }

  const avgSeverity = effects.length
    ? (effects.reduce((s, e) => s + e.severity, 0) / effects.length).toFixed(1)
    : 0

  const currentPMLevel = statePollution[selectedState]
    ? (pmType === 'PM2.5' ? statePollution[selectedState]['PM2.5'] : statePollution[selectedState]['PM10'])
    : '-'

  if (page === 'login') {
    return (
      <div className="app">
        <div className="login-page">
          <div className="login-card">
            <h1>Health risk assessment</h1>
            <p>Enter your details to check PM2.5 & PM10 health impacts</p>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Your name</label>
                <input type="text" name="name" placeholder="e.g., Rahul" required />
              </div>
              <div className="form-group">
                <label>Age group</label>
                <select name="age" required>
                  <option value="">Select age group</option>
                  <option value="Children (0-12)">Children (0-12)</option>
                  <option value="Adolescents (13-19)">Adolescents (13-19)</option>
                  <option value="Adults (20-65)">Adults (20-65)</option>
                  <option value="Elderly (65+)">Elderly (65+)</option>
                </select>
              </div>
              <button type="submit" className="login-btn">Continue</button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="dash">
        <div className="top-row">
          <div className="welcome">
            <h2>Welcome, {user?.name}</h2>
            <p>{user?.age}</p>
          </div>
          <div className="controls">
            <select
              className="state-select"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              {states.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <div className="pm-toggle">
              <button
                className={`pm-btn pm25 ${pmType === 'PM2.5' ? 'active' : ''}`}
                onClick={() => handlePMChange('PM2.5')}
              >
                PM2.5
              </button>
              <button
                className={`pm-btn pm10 ${pmType === 'PM10' ? 'active' : ''}`}
                onClick={() => handlePMChange('PM10')}
              >
                PM10
              </button>
            </div>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div className="main-grid">
          <div className="body-panel">
            <h3>Select organ</h3>
            <div className="body-svg-wrap">
              <svg viewBox="0 0 240 560" xmlns="http://www.w3.org/2000/svg">
                <circle cx="120" cy="36" r="26" fill="#e8b890" />
                <rect x="108" y="58" width="24" height="18" fill="#e8b890" />
                <path d="M 120 76
                  Q 75 78 65 95
                  L 30 105
                  Q 22 108 22 118
                  L 26 175
                  Q 28 182 36 180
                  L 55 175
                  L 60 230
                  Q 58 245 62 250
                  L 70 252
                  L 66 340
                  Q 65 350 72 352
                  L 90 354
                  L 86 480
                  Q 85 492 95 494
                  L 112 494
                  L 116 360
                  L 124 360
                  L 128 494
                  L 145 494
                  Q 155 492 154 480
                  L 150 354
                  L 168 352
                  Q 175 350 174 340
                  L 170 252
                  L 178 250
                  Q 182 245 180 230
                  L 185 175
                  L 204 180
                  Q 212 182 214 175
                  L 218 118
                  Q 218 108 210 105
                  L 175 95
                  Q 165 78 120 76 Z"
                  fill="#f0c9a0" stroke="#d9a876" strokeWidth="1.5" />

                <ellipse
                  className={`organ ${selectedPart === 'Lungs & Respiratory' ? 'selected' : ''}`}
                  onClick={() => handleSelectBodyPart('Lungs & Respiratory')}
                  cx="95" cy="140" rx="20" ry="46" fill="#7eb8e8" />
                <ellipse
                  className={`organ ${selectedPart === 'Lungs & Respiratory' ? 'selected' : ''}`}
                  onClick={() => handleSelectBodyPart('Lungs & Respiratory')}
                  cx="145" cy="140" rx="20" ry="46" fill="#7eb8e8" />

                <circle
                  className={`organ ${selectedPart === 'Brain & Head' ? 'selected' : ''}`}
                  onClick={() => handleSelectBodyPart('Brain & Head')}
                  cx="120" cy="32" r="18" fill="#b8a3e8" opacity="0.9" />

                <path
                  className={`organ ${selectedPart === 'Heart & Cardiovascular' ? 'selected' : ''}`}
                  onClick={() => handleSelectBodyPart('Heart & Cardiovascular')}
                  d="M 120 122 C 113 110 96 113 96 129 C 96 146 120 166 120 166 C 120 166 144 146 144 129 C 144 113 127 110 120 122 Z"
                  fill="#e8615f" />

                <path
                  className={`organ ${selectedPart === 'Liver & Metabolism' ? 'selected' : ''}`}
                  onClick={() => handleSelectBodyPart('Liver & Metabolism')}
                  d="M 140 178 Q 165 173 168 192 Q 169 209 152 213 Q 134 215 127 203 Q 125 184 140 178 Z"
                  fill="#c97a3a" />

                <ellipse
                  className={`organ ${selectedPart === 'Stomach & Digestive' ? 'selected' : ''}`}
                  onClick={() => handleSelectBodyPart('Stomach & Digestive')}
                  cx="92" cy="185" rx="16" ry="22" fill="#f0b860" />

                <ellipse
                  className={`organ ${selectedPart === 'Kidneys & Renal' ? 'selected' : ''}`}
                  onClick={() => handleSelectBodyPart('Kidneys & Renal')}
                  cx="74" cy="218" rx="10" ry="17" fill="#9d7fd1" />
                <ellipse
                  className={`organ ${selectedPart === 'Kidneys & Renal' ? 'selected' : ''}`}
                  onClick={() => handleSelectBodyPart('Kidneys & Renal')}
                  cx="166" cy="218" rx="10" ry="17" fill="#9d7fd1" />

                <path
                  className={`organ ${selectedPart === 'Intestines & GI' ? 'selected' : ''}`}
                  onClick={() => handleSelectBodyPart('Intestines & GI')}
                  d="M 88 238 Q 82 246 90 252 Q 82 259 91 266 Q 83 273 93 279
                     Q 104 282 110 275 Q 116 282 127 279
                     Q 137 273 129 266 Q 138 259 130 252 Q 138 246 132 238
                     Q 110 247 88 238 Z"
                  fill="#e07a9c" />

                <circle
                  className={`organ ${selectedPart === 'Skin & Dermal' ? 'selected' : ''}`}
                  onClick={() => handleSelectBodyPart('Skin & Dermal')}
                  cx="50" cy="140" r="8" fill="#5cc99a" />
                <circle
                  className={`organ ${selectedPart === 'Skin & Dermal' ? 'selected' : ''}`}
                  onClick={() => handleSelectBodyPart('Skin & Dermal')}
                  cx="190" cy="140" r="8" fill="#5cc99a" />

                <rect
                  className={`organ ${selectedPart === 'Bones & Muscles' ? 'selected' : ''}`}
                  onClick={() => handleSelectBodyPart('Bones & Muscles')}
                  x="96" y="365" width="16" height="128" rx="7" fill="#c9bba0" />
                <rect
                  className={`organ ${selectedPart === 'Bones & Muscles' ? 'selected' : ''}`}
                  onClick={() => handleSelectBodyPart('Bones & Muscles')}
                  x="128" y="365" width="16" height="128" rx="7" fill="#c9bba0" />
              </svg>
            </div>
            <div className="legend-hint">Tap an organ on the body<br />to view PM2.5/PM10 effects</div>
          </div>

          <div className="right-panel">
            <div className="detail-card">
              {!selectedPart ? (
                <div className="no-sel">Click an organ on the body diagram to see health effects</div>
              ) : loading ? (
                <div className="no-sel">Loading...</div>
              ) : (
                <>
                  <div className="part-header">
                    <div className="part-icon">{bodyPartIcons[selectedPart]}</div>
                    <div>
                      <div className="part-title">{selectedPart}</div>
                      <div className="part-sub">{pmType} effects in {selectedState}</div>
                    </div>
                  </div>
                  <div className="stats-row">
                    <div className="stat-box">
                      <div className="stat-label">Effects</div>
                      <div className="stat-value">{effects.length}/{MAX_EFFECTS_TRACKED}</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-label">Avg severity</div>
                      <div className="stat-value">{avgSeverity}/5</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-label">PM level</div>
                      <div className="stat-value">{currentPMLevel} <span className="stat-unit">µg/m³</span></div>
                    </div>
                  </div>
                  <div className="who-note">
                    WHO safe annual limit for {pmType}: <strong>{WHO_SAFE_LIMIT[pmType]} µg/m³</strong>
                    {currentPMLevel > WHO_SAFE_LIMIT[pmType] && (
                      <span className="who-exceeded"> — exceeded by {(currentPMLevel - WHO_SAFE_LIMIT[pmType])} µg/m³</span>
                    )}
                  </div>
                  <div className="effects-list">
                    {effects.map((e, idx) => (
                      <div key={idx} className="effect-row">
                        <div className="effect-name">{e.name}</div>
                        <div className="effect-desc">{e.desc}</div>
                        <div className="sev-dots">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className={`sev-dot ${i < e.severity ? 'on' : ''}`}></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="charts-row" style={{ display: selectedPart ? 'grid' : 'none' }}>
              <div className="chart-card">
                <h4>Severity breakdown</h4>
                <div className="chart-wrap">
                  <canvas ref={sevChartRef} role="img" aria-label="Bar chart of severity ratings"></canvas>
                </div>
              </div>
              <div className="chart-card">
                <h4>State pollution levels</h4>
                <div className="chart-wrap">
                  <canvas ref={stateChartRef} role="img" aria-label="Bar chart comparing pollution across states"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App