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
    if (selectedPart && user) {
      fetchEffects(selectedPart, pmType, user.age, selectedState)
    }
    // eslint-disable-next-line
  }, [pmType, selectedState, user, selectedPart])

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

  const fetchEffects = async (part, pm, age, state) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        pm_type: pm,
        age: age || '',
        state: state || ''
      })
      
      const response = await axios.get(
        `${API_BASE_URL}/health-effects/${encodeURIComponent(part)}?${params}`
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
    if (user) {
      fetchEffects(part, pmType, user.age, selectedState)
    }
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
              <svg viewBox="0 0 240 520" xmlns="http://www.w3.org/2000/svg">

                {/* HEAD */}
                <ellipse cx="120" cy="38" rx="28" ry="32" fill="#f5d9b8" stroke="#d9a876" strokeWidth="1"/>
                {/* Hair */}
                <ellipse cx="120" cy="16" rx="28" ry="15" fill="#7a4a2a"/>
                <ellipse cx="95" cy="26" rx="9" ry="14" fill="#7a4a2a"/>
                <ellipse cx="145" cy="26" rx="9" ry="14" fill="#7a4a2a"/>
                {/* Eyes */}
                <ellipse cx="110" cy="36" rx="5" ry="4" fill="#e8c89a" stroke="#c9966a" strokeWidth="0.7"/>
                <ellipse cx="130" cy="36" rx="5" ry="4" fill="#e8c89a" stroke="#c9966a" strokeWidth="0.7"/>
                {/* Nose */}
                <path d="M117 42 Q120 48 123 42" fill="none" stroke="#c9966a" strokeWidth="0.7"/>
                {/* Mouth */}
                <path d="M113 52 Q120 57 127 52" fill="none" stroke="#c9966a" strokeWidth="0.8"/>
                {/* Ears */}
                <ellipse cx="92" cy="42" rx="4" ry="7" fill="#f5d9b8" stroke="#d9a876" strokeWidth="0.7"/>
                <ellipse cx="148" cy="42" rx="4" ry="7" fill="#f5d9b8" stroke="#d9a876" strokeWidth="0.7"/>

                {/* NECK */}
                <rect x="109" y="68" width="22" height="18" rx="3" fill="#f5d9b8" stroke="#d9a876" strokeWidth="0.8"/>

                {/* TORSO */}
                <path d="M60 86 Q48 92 46 120 L44 185 Q43 205 54 210 L74 214 L72 265 L168 265 L166 214 L186 210 Q197 205 196 185 L194 120 Q192 92 180 86 Z" fill="#f0c9a0" stroke="#d9a876" strokeWidth="1.2"/>
                {/* Rib lines left */}
                <path d="M62 105 Q85 100 110 102" fill="none" stroke="#d9a876" strokeWidth="0.6" opacity="0.5"/>
                <path d="M61 117 Q85 112 110 114" fill="none" stroke="#d9a876" strokeWidth="0.6" opacity="0.5"/>
                <path d="M60 129 Q85 125 110 126" fill="none" stroke="#d9a876" strokeWidth="0.6" opacity="0.5"/>
                <path d="M60 141 Q85 137 110 138" fill="none" stroke="#d9a876" strokeWidth="0.6" opacity="0.5"/>
                <path d="M61 153 Q85 150 110 151" fill="none" stroke="#d9a876" strokeWidth="0.6" opacity="0.5"/>
                {/* Rib lines right */}
                <path d="M178 105 Q155 100 130 102" fill="none" stroke="#d9a876" strokeWidth="0.6" opacity="0.5"/>
                <path d="M179 117 Q155 112 130 114" fill="none" stroke="#d9a876" strokeWidth="0.6" opacity="0.5"/>
                <path d="M180 129 Q155 125 130 126" fill="none" stroke="#d9a876" strokeWidth="0.6" opacity="0.5"/>
                <path d="M180 141 Q155 137 130 138" fill="none" stroke="#d9a876" strokeWidth="0.6" opacity="0.5"/>
                <path d="M179 153 Q155 150 130 151" fill="none" stroke="#d9a876" strokeWidth="0.6" opacity="0.5"/>
                {/* Sternum */}
                <line x1="120" y1="88" x2="120" y2="172" stroke="#d9a876" strokeWidth="0.8" opacity="0.4"/>
                {/* Belly button */}
                <circle cx="120" cy="232" r="3" fill="none" stroke="#c9966a" strokeWidth="1"/>

                {/* ARMS */}
                {/* Left arm */}
                <path d="M49 90 Q32 95 28 130 Q26 155 32 165 Q38 173 46 170 Q54 166 54 148 L54 110" fill="#f0c9a0" stroke="#d9a876" strokeWidth="0.9"/>
                <path d="M32 165 Q26 185 24 210 Q22 228 28 236 Q34 242 40 238 Q46 234 46 220 L46 188" fill="#f0c9a0" stroke="#d9a876" strokeWidth="0.9"/>
                <ellipse cx="30" cy="244" rx="9" ry="11" fill="#f5d9b8" stroke="#d9a876" strokeWidth="0.8"/>
                {/* Right arm */}
                <path d="M191 90 Q208 95 212 130 Q214 155 208 165 Q202 173 194 170 Q186 166 186 148 L186 110" fill="#f0c9a0" stroke="#d9a876" strokeWidth="0.9"/>
                <path d="M208 165 Q214 185 216 210 Q218 228 212 236 Q206 242 200 238 Q194 234 194 220 L194 188" fill="#f0c9a0" stroke="#d9a876" strokeWidth="0.9"/>
                <ellipse cx="210" cy="244" rx="9" ry="11" fill="#f5d9b8" stroke="#d9a876" strokeWidth="0.8"/>

                {/* PELVIS */}
                <path d="M54 210 Q44 220 44 245 Q44 260 62 264 L178 264 Q196 260 196 245 Q196 220 186 210 Z" fill="#e8b890" stroke="#d9a876" strokeWidth="0.9"/>

                {/* LEGS */}
                {/* Left leg */}
                <path d="M76 262 Q68 282 68 315 Q67 338 76 344 Q84 348 90 342 Q96 336 94 312 L92 275" fill="#f0c9a0" stroke="#d9a876" strokeWidth="0.9"/>
                <ellipse cx="82" cy="350" rx="12" ry="8" fill="#e8c89a" stroke="#d9a876" strokeWidth="0.7"/>
                <path d="M72 356 Q68 382 68 408 Q67 424 76 428 Q84 431 90 425 Q95 419 94 406 L92 372" fill="#f0c9a0" stroke="#d9a876" strokeWidth="0.9"/>
                <ellipse cx="80" cy="436" rx="13" ry="7" fill="#f5d9b8" stroke="#d9a876" strokeWidth="0.8"/>
                {/* Right leg */}
                <path d="M164 262 Q172 282 172 315 Q173 338 164 344 Q156 348 150 342 Q144 336 146 312 L148 275" fill="#f0c9a0" stroke="#d9a876" strokeWidth="0.9"/>
                <ellipse cx="158" cy="350" rx="12" ry="8" fill="#e8c89a" stroke="#d9a876" strokeWidth="0.7"/>
                <path d="M168 356 Q172 382 172 408 Q173 424 164 428 Q156 431 150 425 Q145 419 146 406 L148 372" fill="#f0c9a0" stroke="#d9a876" strokeWidth="0.9"/>
                <ellipse cx="160" cy="436" rx="13" ry="7" fill="#f5d9b8" stroke="#d9a876" strokeWidth="0.8"/>

                {/* ===== CLICKABLE ORGANS ===== */}

                {/* BRAIN */}
                <g className={`organ ${selectedPart === 'Brain & Head' ? 'selected' : ''}`} onClick={() => handleSelectBodyPart('Brain & Head')}>
                  <ellipse cx="120" cy="30" rx="18" ry="14" fill="#c4a8e8" stroke="#8b5cf6" strokeWidth="1.2" opacity="0.9"/>
                  <path d="M108 28 Q114 22 120 25 Q126 22 132 28" fill="none" stroke="#7c3aed" strokeWidth="0.7"/>
                  <path d="M106 34 Q112 28 120 31 Q128 28 134 34" fill="none" stroke="#7c3aed" strokeWidth="0.7"/>
                  <line x1="120" y1="18" x2="120" y2="42" stroke="#7c3aed" strokeWidth="0.6"/>
                </g>

                {/* LUNGS */}
                <g className={`organ ${selectedPart === 'Lungs & Respiratory' ? 'selected' : ''}`} onClick={() => handleSelectBodyPart('Lungs & Respiratory')}>
                  {/* Left lung */}
                  <path d="M68 92 Q56 98 55 122 Q54 146 62 156 Q70 163 78 158 Q85 151 84 128 Q83 102 76 92 Z" fill="#7eb8e8" stroke="#2563eb" strokeWidth="1.2" opacity="0.9"/>
                  {/* Right lung */}
                  <path d="M172 92 Q184 98 185 122 Q186 146 178 156 Q170 163 162 158 Q155 151 156 128 Q157 102 164 92 Z" fill="#7eb8e8" stroke="#2563eb" strokeWidth="1.2" opacity="0.9"/>
                  {/* Trachea/bronchi */}
                  <line x1="120" y1="84" x2="120" y2="100" stroke="#1d4ed8" strokeWidth="1.2"/>
                  <path d="M120 100 Q100 106 80 116" fill="none" stroke="#1d4ed8" strokeWidth="1.1"/>
                  <path d="M120 100 Q140 106 160 116" fill="none" stroke="#1d4ed8" strokeWidth="1.1"/>
                </g>

                {/* HEART */}
                <g className={`organ ${selectedPart === 'Heart & Cardiovascular' ? 'selected' : ''}`} onClick={() => handleSelectBodyPart('Heart & Cardiovascular')}>
                  <path d="M120 130 C115 120 100 120 100 134 C100 148 120 164 120 164 C120 164 140 148 140 134 C140 120 125 120 120 130 Z" fill="#e8615f" stroke="#b91c1c" strokeWidth="1.2"/>
                  <path d="M114 123 Q110 114 116 108" fill="none" stroke="#b91c1c" strokeWidth="1.2"/>
                </g>

                {/* LIVER */}
                <g className={`organ ${selectedPart === 'Liver & Metabolism' ? 'selected' : ''}`} onClick={() => handleSelectBodyPart('Liver & Metabolism')}>
                  <path d="M122 172 Q140 167 150 175 Q158 184 155 196 Q151 206 140 208 Q128 209 122 200 Q117 190 118 180 Z" fill="#c97a3a" stroke="#92400e" strokeWidth="1.2" opacity="0.92"/>
                </g>

                {/* STOMACH */}
                <g className={`organ ${selectedPart === 'Stomach & Digestive' ? 'selected' : ''}`} onClick={() => handleSelectBodyPart('Stomach & Digestive')}>
                  <path d="M90 175 Q76 177 74 190 Q72 204 80 210 Q90 215 100 210 Q108 203 106 190 Q104 176 92 175 Z" fill="#f0b860" stroke="#b45309" strokeWidth="1.2" opacity="0.92"/>
                </g>

                {/* KIDNEYS */}
                <g className={`organ ${selectedPart === 'Kidneys & Renal' ? 'selected' : ''}`} onClick={() => handleSelectBodyPart('Kidneys & Renal')}>
                  <path d="M64 213 Q54 216 52 226 Q51 236 60 239 Q69 241 74 233 Q77 224 73 214 Z" fill="#9d7fd1" stroke="#6d28d9" strokeWidth="1.2" opacity="0.92"/>
                  <path d="M176 213 Q186 216 188 226 Q189 236 180 239 Q171 241 166 233 Q163 224 167 214 Z" fill="#9d7fd1" stroke="#6d28d9" strokeWidth="1.2" opacity="0.92"/>
                </g>

                {/* INTESTINES */}
                <g className={`organ ${selectedPart === 'Intestines & GI' ? 'selected' : ''}`} onClick={() => handleSelectBodyPart('Intestines & GI')}>
                  <path d="M88 218 Q76 222 75 232 Q74 242 82 246 Q92 249 100 244 Q108 238 106 228 Q104 218 92 218 Z" fill="#e07a9c" stroke="#be185d" strokeWidth="1.2" opacity="0.88"/>
                  <path d="M108 220 Q118 222 120 232 Q120 242 112 246 Q102 249 96 244" fill="none" stroke="#be185d" strokeWidth="1"/>
                  <path d="M120 232 Q132 234 140 244 Q146 252 138 258 Q130 262 122 256" fill="none" stroke="#be185d" strokeWidth="1"/>
                  <path d="M80 248 Q78 256 86 260 Q100 264 120 262 Q140 260 148 254" fill="none" stroke="#be185d" strokeWidth="1"/>
                </g>

                {/* SKIN dots */}
                <g className={`organ ${selectedPart === 'Skin & Dermal' ? 'selected' : ''}`} onClick={() => handleSelectBodyPart('Skin & Dermal')}>
                  <circle cx="50" cy="100" r="8" fill="#5cc99a" stroke="#059669" strokeWidth="1.2" opacity="0.9"/>
                  <circle cx="190" cy="100" r="8" fill="#5cc99a" stroke="#059669" strokeWidth="1.2" opacity="0.9"/>
                </g>

                {/* BONES/MUSCLES */}
                <g className={`organ ${selectedPart === 'Bones & Muscles' ? 'selected' : ''}`} onClick={() => handleSelectBodyPart('Bones & Muscles')}>
                  <rect x="74" y="358" width="14" height="62" rx="5" fill="#c9bba0" stroke="#92835a" strokeWidth="1.2" opacity="0.9"/>
                  <rect x="152" y="358" width="14" height="62" rx="5" fill="#c9bba0" stroke="#92835a" strokeWidth="1.2" opacity="0.9"/>
                </g>

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