import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Chart from 'chart.js/auto'
import jsPDF from 'jspdf'
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
  const [expandedEffect, setExpandedEffect] = useState(null)
  const [loginState, setLoginState] = useState('')

  const citiesByState = {
    "Delhi": ["New Delhi", "Dwarka", "Rohini", "Saket", "Noida (NCR)", "Gurgaon (NCR)"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Allahabad", "Meerut", "Ghaziabad"],
    "Punjab": ["Amritsar", "Ludhiana", "Chandigarh", "Jalandhar", "Patiala", "Bathinda"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Bhavnagar"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli", "Tirunelveli"],
    "Karnataka": ["Bengaluru", "Mysuru", "Hubli", "Mangaluru", "Belagavi", "Kalaburagi"],
  }

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
      const params = new URLSearchParams({ pm_type: pm, age: age || '', state: state || '' })
      const response = await axios.get(`${API_BASE_URL}/health-effects/${encodeURIComponent(part)}?${params}`)
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
    const ageNum = parseInt(e.target.age.value)
    const state = e.target.state.value
    const gender = e.target.gender.value
    const city = e.target.city.value
    const activity = e.target.activity.value
    if (!name || !ageNum || !state || !gender || !city || !activity) {
      alert('Please fill in all fields')
      return
    }
    let ageGroup = 'Adults (20-65)'
    if (ageNum <= 12) ageGroup = 'Children (0-12)'
    else if (ageNum <= 19) ageGroup = 'Adolescents (13-19)'
    else if (ageNum >= 66) ageGroup = 'Elderly (65+)'
    setSelectedState(state)
    setUser({ name, age: ageGroup, ageNum, gender, city, activity })
    setPage('dashboard')
  }

  const handleSelectBodyPart = (part) => {
    setSelectedPart(part)
    setExpandedEffect(null)
    if (user) fetchEffects(part, pmType, user.age, selectedState)
  }

  const handlePMChange = (pm) => setPmType(pm)

  const handleLogout = () => {
    setUser(null)
    setSelectedPart(null)
    setEffects([])
    setPage('login')
  }

  const downloadReport = () => {
    const doc = new jsPDF()
    const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const whoLimit = pmType === 'PM2.5' ? 60 : 100
    const exceeded = aqiVal - whoLimit

    // Header background
    doc.setFillColor(21, 128, 61)
    doc.rect(0, 0, 210, 40, 'F')

    // Title
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('PM Health Effects Report', 15, 18)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('Air Pollution Health Risk Assessment', 15, 28)
    doc.text(`Generated: ${date}`, 15, 36)

    // User details box
    doc.setFillColor(244, 250, 246)
    doc.setDrawColor(215, 236, 223)
    doc.roundedRect(10, 48, 190, 35, 3, 3, 'FD')
    doc.setTextColor(20, 83, 45)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Patient Details', 15, 58)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(90, 122, 104)
    doc.text(`Name: ${user?.name}`, 15, 67)
    doc.text(`Age: ${user?.ageNum} years  |  Group: ${user?.age}  |  Gender: ${user?.gender}`, 15, 74)
    doc.text(`City: ${user?.city}  |  State: ${selectedState}  |  PM Type: ${pmType}`, 15, 81)
    doc.text(`Activity Level: ${user?.activity}  |  Organ: ${selectedPart || 'Not selected'}`, 15, 88)

    // AQI box
    doc.setFillColor(244, 250, 246)
    doc.setDrawColor(215, 236, 223)
    doc.roundedRect(10, 90, 190, 30, 3, 3, 'FD')
    doc.setTextColor(20, 83, 45)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Air Quality Index', 15, 100)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(90, 122, 104)
    doc.text(`${pmType} Level: ${aqiVal} µg/m³  |  Category: ${aqiLabel}`, 15, 108)
    doc.text(`WHO Safe Limit: ${whoLimit} µg/m³${exceeded > 0 ? `  |  Exceeded by: ${exceeded} µg/m³` : '  |  Within safe limit'}`, 15, 115)

    // Effects section
    if (effects.length > 0) {
      doc.setFillColor(21, 128, 61)
      doc.rect(10, 127, 190, 10, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(`Health Effects — ${selectedPart}`, 15, 134)

      let y = 145
      effects.forEach((effect, idx) => {
        // Check if we need a new page
        if (y > 260) {
          doc.addPage()
          y = 20
        }

        // Effect card background
        doc.setFillColor(249, 253, 251)
        doc.setDrawColor(215, 236, 223)
        const cardHeight = 12 + (effect.symptoms?.length || 0) * 5 + (effect.precautions?.length || 0) * 5 + 20
        doc.roundedRect(10, y - 5, 190, Math.min(cardHeight, 60), 2, 2, 'FD')

        // Effect name and severity
        doc.setTextColor(20, 83, 45)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text(`${idx + 1}. ${effect.name}`, 15, y + 3)

        // Severity dots
        const filled = effect.severity
        const empty = 5 - effect.severity
        const dots = '[' + '★'.repeat(0) + '*'.repeat(filled) + '-'.repeat(empty) + ']  Severity: ' + filled + '/5'
        doc.setTextColor(217, 119, 6)
        doc.setFontSize(10)
        doc.text(`Severity: ${filled}/5`, 160, y + 3)

        // Description
        doc.setTextColor(90, 122, 104)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.text(effect.desc, 15, y + 10)
        y += 16

        // Symptoms
        if (effect.symptoms?.length > 0) {
          doc.setTextColor(20, 83, 45)
          doc.setFontSize(9)
          doc.setFont('helvetica', 'bold')
          doc.text('Symptoms:', 15, y)
          y += 5
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(90, 122, 104)
          effect.symptoms.slice(0, 3).forEach(s => {
            if (y > 270) { doc.addPage(); y = 20 }
            doc.text(`• ${s}`, 18, y)
            y += 5
          })
        }

        // Precautions
        if (effect.precautions?.length > 0) {
          doc.setTextColor(21, 128, 61)
          doc.setFontSize(9)
          doc.setFont('helvetica', 'bold')
          doc.text('Precautions:', 15, y)
          y += 5
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(90, 122, 104)
          effect.precautions.slice(0, 3).forEach(p => {
            if (y > 270) { doc.addPage(); y = 20 }
            doc.text(`>> ${p}`, 18, y)
            y += 5
          })
        }
        y += 8
      })
    }

    // Footer on last page
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFillColor(244, 250, 246)
      doc.rect(0, 285, 210, 15, 'F')
      doc.setTextColor(90, 122, 104)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text('Data Source: CPCB 2023 | PM Health Effects App', 15, 292)
      doc.text(`Page ${i} of ${pageCount}`, 185, 292)
    }

    // Save
    const filename = `PM-Health-Report-${user?.name}-${selectedState}-${date}.pdf`
    doc.save(filename)
  }

  const renderSevChart = (effectsData) => {
    if (!sevChartRef.current) return
    if (sevChartInstance.current) sevChartInstance.current.destroy()
    sevChartInstance.current = new Chart(sevChartRef.current, {
      type: 'bar',
      data: {
        labels: effectsData.map(e => e.name.length > 14 ? e.name.slice(0, 13) + '…' : e.name),
        datasets: [{ label: 'Severity', data: effectsData.map(e => e.severity), backgroundColor: '#d97706', borderRadius: 4 }]
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
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
        datasets: [{ label: pmType + ' level', data: values, backgroundColor: colors, borderRadius: 4 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: '#5a7a68', font: { size: 10 }, maxRotation: 45, autoSkip: false }, grid: { display: false } },
          y: { beginAtZero: true, ticks: { color: '#5a7a68' }, grid: { color: '#e7f3ec' } }
        },
        plugins: { legend: { display: false } }
      }
    })
  }

  const getAQIInfo = (v, type) => {
    const thresholds = type === 'PM2.5' ? [30, 60, 90, 120, 250] : [50, 100, 150, 200, 400]
    const labels = ['Good', 'Satisfactory', 'Moderate', 'Poor', 'Very Poor', 'Severe']
    const colors = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444', '#7c3aed']
    for (let i = 0; i < thresholds.length; i++) {
      if (v <= thresholds[i]) return { label: labels[i], color: colors[i] }
    }
    return { label: 'Severe', color: '#7c3aed' }
  }

  const MAX_EFFECTS_TRACKED = 5
  const WHO_SAFE_LIMIT = { 'PM2.5': 60, 'PM10': 100 }
  const avgSeverity = effects.length ? (effects.reduce((s, e) => s + e.severity, 0) / effects.length).toFixed(1) : 0
  const currentPMLevel = statePollution[selectedState]
    ? (pmType === 'PM2.5' ? statePollution[selectedState]['PM2.5'] : statePollution[selectedState]['PM10']) : '-'

  // AQI meter values
  const aqiVal = statePollution[selectedState]?.[pmType] || 0
  const aqiPct = Math.min((aqiVal / (pmType === 'PM2.5' ? 500 : 600)) * 100, 100)
  const { label: aqiLabel, color: aqiColor } = getAQIInfo(aqiVal, pmType)

  if (page === 'login') {
    return (
      <div className="app">
        <div className="login-page">
          <div className="login-card">
            <div className="login-logo">🌬️</div>
            <h1>PM Health Effects</h1>
            <p>Enter your details to assess air pollution health risks</p>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Your name</label>
                <input type="text" name="name" placeholder="e.g., Rahul Sharma" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Your age</label>
                  <input type="number" name="age" placeholder="e.g., 25" min="1" max="120" required />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" required>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Your state</label>
                <select name="state" required onChange={(e) => setLoginState(e.target.value)}>
                  <option value="">Select your state</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Your city</label>
                <select name="city" required disabled={!loginState}>
                  <option value="">{loginState ? 'Select your city' : 'Select state first'}</option>
                  {loginState && citiesByState[loginState]?.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Physical activity level</label>
                <select name="activity" required>
                  <option value="">Select activity level</option>
                  <option value="Low">🪑 Low (mostly indoors/sedentary)</option>
                  <option value="Medium">🚶 Medium (moderate outdoor activity)</option>
                  <option value="High">🏃 High (frequent outdoor exercise)</option>
                </select>
              </div>
              <button type="submit" className="login-btn">Check My Health Risk →</button>
            </form>
            <div className="login-footer">🇮🇳 Covers 9 major Indian states · WHO guidelines</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="dash">

        {/* TOP ROW */}
        <div className="top-row">
          <div className="welcome">
            <h2>Welcome, {user?.name}</h2>
            <p>{user?.age} · {user?.gender} · {user?.city}</p>
            <p style={{fontSize:'11px', color:'#7a9988', marginTop:'2px'}}>Activity: {user?.activity}</p>
          </div>
          <div className="controls">
            <select className="state-select" value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
              {states.map((state) => <option key={state} value={state}>{state}</option>)}
            </select>
            <div className="pm-toggle">
              <button className={`pm-btn pm25 ${pmType === 'PM2.5' ? 'active' : ''}`} onClick={() => handlePMChange('PM2.5')}>PM2.5</button>
              <button className={`pm-btn pm10 ${pmType === 'PM10' ? 'active' : ''}`} onClick={() => handlePMChange('PM10')}>PM10</button>
            </div>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {/* AQI METER */}
        <div className="aqi-card">
          <div className="aqi-left">
            <div className="aqi-title">Air Quality — {selectedState}</div>
            <div className="aqi-value" style={{ color: aqiColor }}>{aqiVal} <span className="aqi-unit">µg/m³</span></div>
            <div className="aqi-badge" style={{ background: aqiColor + '22', color: aqiColor, border: `1px solid ${aqiColor}` }}>
              ● {aqiLabel}
            </div>
          </div>
          <div className="aqi-right">
            <div className="aqi-bar-wrap">
              <div className="aqi-bar-track">
                <div className="aqi-bar-marker" style={{ left: `${aqiPct}%`, borderColor: aqiColor }}></div>
              </div>
              <div className="aqi-bar-labels">
                {[
                  { label: 'Good', color: '#22c55e' },
                  { label: 'Satisfactory', color: '#84cc16' },
                  { label: 'Moderate', color: '#eab308' },
                  { label: 'Poor', color: '#f97316' },
                  { label: 'Very Poor', color: '#ef4444' },
                  { label: 'Severe', color: '#7c3aed' },
                ].map((item) => (
                  <div key={item.label} className="aqi-bar-label-item">
                    <div className="aqi-bar-label-dot" style={{ background: item.color }}></div>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="aqi-who">
              WHO safe limit for {pmType}: <strong>{WHO_SAFE_LIMIT[pmType]} µg/m³</strong>
              {aqiVal > WHO_SAFE_LIMIT[pmType] && (
                <span className="who-exceeded"> · exceeded by {aqiVal - WHO_SAFE_LIMIT[pmType]} µg/m³</span>
              )}
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="main-grid">
          <div className="body-panel">
            <h3>Select organ</h3>
            <div className="body-svg-wrap">
              <svg viewBox="0 0 240 530" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="skinHead" cx="45%" cy="38%" r="55%"><stop offset="0%" stopColor="#f5d0a0"/><stop offset="60%" stopColor="#e8b87a"/><stop offset="100%" stopColor="#c9904a"/></radialGradient>
                  <radialGradient id="skinTorso" cx="40%" cy="30%" r="65%"><stop offset="0%" stopColor="#f0c48a"/><stop offset="55%" stopColor="#e0a860"/><stop offset="100%" stopColor="#c08040"/></radialGradient>
                  <radialGradient id="skinLimb" cx="30%" cy="25%" r="65%"><stop offset="0%" stopColor="#f0c48a"/><stop offset="70%" stopColor="#d49850"/><stop offset="100%" stopColor="#b07830"/></radialGradient>
                  <radialGradient id="gradBrain" cx="35%" cy="30%" r="60%"><stop offset="0%" stopColor="#d4baff"/><stop offset="60%" stopColor="#9d6fe8"/><stop offset="100%" stopColor="#6b3fbb"/></radialGradient>
                  <radialGradient id="gradLung" cx="30%" cy="25%" r="65%"><stop offset="0%" stopColor="#a8d8f8"/><stop offset="60%" stopColor="#4fa8e8"/><stop offset="100%" stopColor="#1a6fbb"/></radialGradient>
                  <radialGradient id="gradHeart" cx="35%" cy="30%" r="60%"><stop offset="0%" stopColor="#ff9090"/><stop offset="55%" stopColor="#e84040"/><stop offset="100%" stopColor="#aa1010"/></radialGradient>
                  <radialGradient id="gradLiver" cx="30%" cy="28%" r="60%"><stop offset="0%" stopColor="#e8a860"/><stop offset="55%" stopColor="#b86820"/><stop offset="100%" stopColor="#804010"/></radialGradient>
                  <radialGradient id="gradStomach" cx="30%" cy="28%" r="60%"><stop offset="0%" stopColor="#ffe090"/><stop offset="55%" stopColor="#e8a820"/><stop offset="100%" stopColor="#a07010"/></radialGradient>
                  <radialGradient id="gradKidney" cx="30%" cy="28%" r="60%"><stop offset="0%" stopColor="#c8a8f8"/><stop offset="55%" stopColor="#8050d0"/><stop offset="100%" stopColor="#5030a0"/></radialGradient>
                  <radialGradient id="gradIntestine" cx="30%" cy="28%" r="60%"><stop offset="0%" stopColor="#f8a8c8"/><stop offset="55%" stopColor="#d84888"/><stop offset="100%" stopColor="#a02060"/></radialGradient>
                  <radialGradient id="gradSkin" cx="30%" cy="25%" r="60%"><stop offset="0%" stopColor="#80f0c0"/><stop offset="55%" stopColor="#20a870"/><stop offset="100%" stopColor="#107040"/></radialGradient>
                  <radialGradient id="gradBone" cx="30%" cy="25%" r="60%"><stop offset="0%" stopColor="#e8dfc0"/><stop offset="55%" stopColor="#b8a870"/><stop offset="100%" stopColor="#887840"/></radialGradient>
                </defs>
                <path d="M55 102 Q34 108 30 142 Q28 162 34 172 Q40 178 48 173 L52 130 Z" fill="#c08040" opacity="0.45"/>
                <path d="M53 100 Q32 106 28 140 Q26 160 32 170 Q38 176 46 171 L50 128 Z" fill="url(#skinLimb)"/>
                <path d="M34 172 Q28 190 26 212 Q25 228 30 234 Q36 240 42 236 L44 220 L44 195 Z" fill="#c08040" opacity="0.4"/>
                <path d="M32 170 Q26 188 24 210 Q23 226 28 232 Q34 238 40 234 Q46 229 44 216 L44 192 Z" fill="url(#skinLimb)"/>
                <ellipse cx="30" cy="242" rx="9" ry="12" fill="url(#skinHead)" stroke="#c08040" strokeWidth="0.7"/>
                <path d="M187 102 Q208 108 212 142 Q214 162 208 172 Q202 178 194 173 L190 130 Z" fill="#c08040" opacity="0.45"/>
                <path d="M185 100 Q206 106 210 140 Q212 160 206 170 Q200 176 192 171 L188 128 Z" fill="url(#skinLimb)"/>
                <path d="M206 170 Q212 188 214 210 Q215 226 210 232 Q204 238 198 234 Q192 229 194 216 L194 192 Z" fill="url(#skinLimb)"/>
                <ellipse cx="208" cy="242" rx="9" ry="12" fill="url(#skinHead)" stroke="#c08040" strokeWidth="0.7"/>
                <path d="M126 88 Q162 92 170 110 L174 188 Q172 212 162 218 L152 222 L154 258 L132 264 Z" fill="#c08040" opacity="0.3"/>
                <path d="M60 106 Q50 112 50 136 L50 192 Q52 214 64 220 L78 224 L80 260 L160 260 L162 224 L176 220 Q188 214 190 192 L190 136 Q190 112 180 106 Q155 98 120 96 Q85 98 60 106 Z" fill="url(#skinTorso)" stroke="#c08040" strokeWidth="0.8"/>
                <path d="M62 118 Q90 112 120 114 Q150 112 178 118" fill="none" stroke="#c08040" strokeWidth="0.6" opacity="0.45"/>
                <path d="M61 130 Q90 124 120 126 Q150 124 179 130" fill="none" stroke="#c08040" strokeWidth="0.6" opacity="0.45"/>
                <path d="M61 142 Q90 136 120 138 Q150 136 179 142" fill="none" stroke="#c08040" strokeWidth="0.6" opacity="0.45"/>
                <path d="M61 154 Q90 149 120 150 Q150 149 179 154" fill="none" stroke="#c08040" strokeWidth="0.6" opacity="0.45"/>
                <path d="M62 166 Q90 162 120 163 Q150 162 178 166" fill="none" stroke="#c08040" strokeWidth="0.6" opacity="0.45"/>
                <line x1="120" y1="104" x2="120" y2="184" stroke="#c08040" strokeWidth="0.8" opacity="0.35"/>
                <ellipse cx="120" cy="228" rx="4" ry="3" fill="none" stroke="#b07030" strokeWidth="1"/>
                <path d="M74 220 Q56 230 56 252 Q57 266 72 270 L168 270 Q183 266 184 252 Q184 230 166 220 Z" fill="url(#skinTorso)" stroke="#c08040" strokeWidth="0.8"/>
                <path d="M106 268 Q100 288 100 322 Q99 344 108 350 L114 344 L114 284 Z" fill="#b07030" opacity="0.4"/>
                <path d="M96 266 Q86 288 86 324 Q85 348 96 354 Q106 358 112 350 Q118 342 116 320 L118 280 Z" fill="url(#skinLimb)"/>
                <ellipse cx="100" cy="360" rx="13" ry="9" fill="url(#skinHead)" stroke="#c08040" strokeWidth="0.7"/>
                <path d="M88 368 Q84 398 84 428 Q83 444 92 448 Q100 452 106 444 Q111 436 108 422 L110 382 Z" fill="url(#skinLimb)"/>
                <ellipse cx="96" cy="456" rx="15" ry="7" fill="url(#skinHead)" stroke="#c08040" strokeWidth="0.7"/>
                <path d="M136 268 Q142 288 142 322 Q143 344 134 350 L128 344 L128 284 Z" fill="#b07030" opacity="0.4"/>
                <path d="M144 266 Q154 288 154 324 Q155 348 144 354 Q134 358 128 350 Q122 342 124 320 L122 280 Z" fill="url(#skinLimb)"/>
                <ellipse cx="142" cy="360" rx="13" ry="9" fill="url(#skinHead)" stroke="#c08040" strokeWidth="0.7"/>
                <path d="M152 368 Q156 398 156 428 Q157 444 148 448 Q140 452 134 444 Q129 436 132 422 L130 382 Z" fill="url(#skinLimb)"/>
                <ellipse cx="146" cy="456" rx="15" ry="7" fill="url(#skinHead)" stroke="#c08040" strokeWidth="0.7"/>
                <rect x="110" y="80" width="20" height="20" rx="4" fill="url(#skinLimb)" stroke="#c08040" strokeWidth="0.7"/>
                <line x1="116" y1="82" x2="114" y2="98" stroke="#b07030" strokeWidth="0.7" opacity="0.5"/>
                <line x1="124" y1="82" x2="126" y2="98" stroke="#b07030" strokeWidth="0.7" opacity="0.5"/>
                <ellipse cx="124" cy="52" rx="28" ry="30" fill="#c08040" opacity="0.35"/>
                <ellipse cx="120" cy="50" rx="30" ry="32" fill="url(#skinHead)" stroke="#c08040" strokeWidth="0.8"/>
                <ellipse cx="120" cy="24" rx="30" ry="14" fill="#4a2e10"/>
                <ellipse cx="94" cy="32" rx="10" ry="14" fill="#4a2e10"/>
                <ellipse cx="146" cy="32" rx="10" ry="14" fill="#4a2e10"/>
                <ellipse cx="90" cy="52" rx="5" ry="8" fill="url(#skinHead)" stroke="#c08040" strokeWidth="0.7"/>
                <ellipse cx="150" cy="52" rx="5" ry="8" fill="url(#skinHead)" stroke="#c08040" strokeWidth="0.7"/>
                <ellipse cx="110" cy="46" rx="6" ry="4" fill="#2a1a0a"/>
                <ellipse cx="130" cy="46" rx="6" ry="4" fill="#2a1a0a"/>
                <circle cx="108" cy="45" r="1.5" fill="white" opacity="0.7"/>
                <circle cx="128" cy="45" r="1.5" fill="white" opacity="0.7"/>
                <path d="M117 54 Q120 60 123 54" fill="none" stroke="#b07030" strokeWidth="0.9"/>
                <path d="M113 64 Q120 69 127 64" fill="none" stroke="#b07030" strokeWidth="0.9"/>

                {/* BRAIN */}
                <g className={`organ ${selectedPart === 'Brain & Head' ? 'selected' : ''}`} onClick={() => handleSelectBodyPart('Brain & Head')}>
                  <ellipse cx="122" cy="34" rx="17" ry="13" fill="#6b3fbb" opacity="0.3"/>
                  <ellipse cx="120" cy="32" rx="18" ry="14" fill="url(#gradBrain)" stroke="#7030c0" strokeWidth="1"/>
                  <path d="M108 29 Q114 22 120 26 Q126 22 132 29" fill="none" stroke="#6030b0" strokeWidth="0.8"/>
                  <path d="M106 35 Q112 28 120 32 Q128 28 134 35" fill="none" stroke="#6030b0" strokeWidth="0.8"/>
                  <line x1="120" y1="19" x2="120" y2="44" stroke="#6030b0" strokeWidth="0.7"/>
                  <ellipse cx="113" cy="24" rx="6" ry="4" fill="white" opacity="0.18"/>
                </g>

                {/* LUNGS */}
                <g className={`organ ${selectedPart === 'Lungs & Respiratory' ? 'selected' : ''}`} onClick={() => handleSelectBodyPart('Lungs & Respiratory')}>
                  <path d="M72 116 Q62 122 61 148 Q60 170 70 178 Q80 184 86 174 Q90 162 88 138 Q86 114 78 110 Z" fill="url(#gradLung)" stroke="#2060c0" strokeWidth="1"/>
                  <ellipse cx="70" cy="136" rx="7" ry="13" fill="white" opacity="0.14"/>
                  <path d="M170 116 Q180 122 181 148 Q182 170 172 178 Q162 184 156 174 Q152 162 154 138 Q156 114 164 110 Z" fill="url(#gradLung)" stroke="#2060c0" strokeWidth="1"/>
                  <ellipse cx="170" cy="136" rx="7" ry="13" fill="white" opacity="0.14"/>
                  <line x1="120" y1="100" x2="120" y2="114" stroke="#1850a0" strokeWidth="1.8"/>
                  <path d="M120 114 Q102 122 88 132" fill="none" stroke="#1850a0" strokeWidth="1.4"/>
                  <path d="M120 114 Q138 122 154 132" fill="none" stroke="#1850a0" strokeWidth="1.4"/>
                </g>

                {/* HEART */}
                <g className={`organ ${selectedPart === 'Heart & Cardiovascular' ? 'selected' : ''}`} onClick={() => handleSelectBodyPart('Heart & Cardiovascular')}>
                  <path d="M123 145 C119 133 104 133 104 149 C104 165 123 181 123 181 C123 181 142 165 142 149 C142 133 127 133 123 145 Z" fill="#aa1010" opacity="0.3"/>
                  <path d="M120 141 C116 129 100 129 100 146 C100 163 120 180 120 180 C120 180 140 163 140 146 C140 129 124 129 120 141 Z" fill="url(#gradHeart)" stroke="#c01010" strokeWidth="1"/>
                  <ellipse cx="112" cy="140" rx="6" ry="8" fill="white" opacity="0.18"/>
                  <path d="M115 134 Q110 124 116 116 Q122 110 128 116" fill="none" stroke="#c01010" strokeWidth="1.4"/>
                </g>

                {/* LIVER */}
                <g className={`organ ${selectedPart === 'Liver & Metabolism' ? 'selected' : ''}`} onClick={() => handleSelectBodyPart('Liver & Metabolism')}>
                  <path d="M126 188 Q148 182 160 192 Q170 204 166 220 Q162 232 146 234 Q130 235 124 224 Q118 212 120 200 Z" fill="url(#gradLiver)" stroke="#904820" strokeWidth="1"/>
                  <ellipse cx="138" cy="198" rx="11" ry="6" fill="white" opacity="0.16"/>
                </g>

                {/* STOMACH */}
                <g className={`organ ${selectedPart === 'Stomach & Digestive' ? 'selected' : ''}`} onClick={() => handleSelectBodyPart('Stomach & Digestive')}>
                  <path d="M82 186 Q68 188 66 204 Q64 220 74 226 Q86 230 96 224 Q104 216 102 202 Q100 186 86 186 Z" fill="url(#gradStomach)" stroke="#b07810" strokeWidth="1"/>
                  <ellipse cx="82" cy="198" rx="9" ry="6" fill="white" opacity="0.18"/>
                </g>

                {/* KIDNEYS */}
                <g className={`organ ${selectedPart === 'Kidneys & Renal' ? 'selected' : ''}`} onClick={() => handleSelectBodyPart('Kidneys & Renal')}>
                  <path d="M56 212 Q46 215 44 226 Q43 238 52 241 Q62 243 67 234 Q70 224 66 213 Z" fill="url(#gradKidney)" stroke="#5828b0" strokeWidth="1"/>
                  <ellipse cx="55" cy="222" rx="5" ry="7" fill="white" opacity="0.18"/>
                  <path d="M184 212 Q194 215 196 226 Q197 238 188 241 Q178 243 173 234 Q170 224 174 213 Z" fill="url(#gradKidney)" stroke="#5828b0" strokeWidth="1"/>
                  <ellipse cx="185" cy="222" rx="5" ry="7" fill="white" opacity="0.18"/>
                </g>

                {/* INTESTINES */}
                <g className={`organ ${selectedPart === 'Intestines & GI' ? 'selected' : ''}`} onClick={() => handleSelectBodyPart('Intestines & GI')}>
                  <path d="M82 238 Q68 243 68 256 Q68 267 80 271 Q92 273 98 264 Q104 255 98 244 Q92 236 82 238 Z" fill="url(#gradIntestine)" stroke="#c02870" strokeWidth="0.9"/>
                  <path d="M100 240 Q112 242 114 254 Q114 266 104 270 Q94 272 90 264" fill="none" stroke="#c02870" strokeWidth="1.1"/>
                  <path d="M114 252 Q124 255 126 265 Q126 273 118 276 Q110 278 104 270" fill="none" stroke="#c02870" strokeWidth="1.1"/>
                  <path d="M72 268 Q78 274 100 276 Q122 274 130 268" fill="none" stroke="#c02870" strokeWidth="1.1"/>
                  <ellipse cx="80" cy="248" rx="7" ry="5" fill="white" opacity="0.14"/>
                </g>

                {/* SKIN */}
                <g className={`organ ${selectedPart === 'Skin & Dermal' ? 'selected' : ''}`} onClick={() => handleSelectBodyPart('Skin & Dermal')}>
                  <circle cx="46" cy="118" r="10" fill="#107050" opacity="0.3"/>
                  <circle cx="44" cy="116" r="10" fill="url(#gradSkin)" stroke="#108040" strokeWidth="1"/>
                  <circle cx="40" cy="112" r="3" fill="white" opacity="0.22"/>
                  <circle cx="196" cy="118" r="10" fill="#107050" opacity="0.3"/>
                  <circle cx="194" cy="116" r="10" fill="url(#gradSkin)" stroke="#108040" strokeWidth="1"/>
                  <circle cx="190" cy="112" r="3" fill="white" opacity="0.22"/>
                </g>

                {/* BONES */}
                <g className={`organ ${selectedPart === 'Bones & Muscles' ? 'selected' : ''}`} onClick={() => handleSelectBodyPart('Bones & Muscles')}>
                  <rect x="88" y="370" width="13" height="60" rx="5" fill="#887840" opacity="0.35"/>
                  <rect x="86" y="368" width="13" height="60" rx="5" fill="url(#gradBone)" stroke="#908050" strokeWidth="1"/>
                  <ellipse cx="91" cy="378" rx="4" ry="5" fill="white" opacity="0.18"/>
                  <rect x="140" y="370" width="13" height="60" rx="5" fill="#887840" opacity="0.35"/>
                  <rect x="142" y="368" width="13" height="60" rx="5" fill="url(#gradBone)" stroke="#908050" strokeWidth="1"/>
                  <ellipse cx="147" cy="378" rx="4" ry="5" fill="white" opacity="0.18"/>
                </g>
              </svg>
            </div>
            <div className="legend-hint">Tap an organ on the body<br />to view PM2.5/PM10 effects</div>
          </div>

          <div className="right-panel">
            <div className="detail-card">
              {!selectedPart ? (
                <div className="no-sel">
                  <span className="no-sel-icon">🫀</span>
                  Click an organ on the body diagram to see health effects
                </div>
              ) : loading ? (
                <div className="loading-skeleton">
                  <div className="skeleton-line" style={{width:'60%'}}></div>
                  <div className="skeleton-line" style={{width:'90%'}}></div>
                  <div className="skeleton-line" style={{width:'75%'}}></div>
                  <div className="skeleton-line" style={{width:'85%'}}></div>
                  <div className="skeleton-line" style={{width:'55%'}}></div>
                </div>
              ) : (
                <>
                  <div className="part-header">
                    <div className="part-icon">{bodyPartIcons[selectedPart]}</div>
                    <div style={{flex:1}}>
                      <div className="part-title">{selectedPart}</div>
                      <div className="part-sub">{pmType} effects in {selectedState}</div>
                    </div>
                    <button className="download-btn" onClick={downloadReport}>
                      ⬇️ Download Report
                    </button>
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
                      <span className="who-exceeded"> — exceeded by {currentPMLevel - WHO_SAFE_LIMIT[pmType]} µg/m³</span>
                    )}
                  </div>
                  <div className="effects-list">
                    {effects.map((e, idx) => (
                      <div key={idx} className={`effect-row ${expandedEffect === idx ? 'expanded' : ''}`} onClick={() => setExpandedEffect(expandedEffect === idx ? null : idx)}>
                        <div className="effect-row-header">
                          <div>
                            <div className="effect-name">{e.name}</div>
                            <div className="effect-desc">{e.desc}</div>
                          </div>
                          <span className="effect-toggle">{expandedEffect === idx ? '▲' : '▼'}</span>
                        </div>
                        <div className="sev-dots">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className={`sev-dot ${i < e.severity ? 'on' : ''}`}></div>
                          ))}
                        </div>
                        {expandedEffect === idx && (
                          <div className="effect-expanded">
                            {e.details && <div className="effect-detail-text">{e.details}</div>}
                            {e.symptoms?.length > 0 && (
                              <div className="effect-section">
                                <div className="effect-section-title">🩺 Symptoms</div>
                                <ul className="effect-list">{e.symptoms.map((s, i) => <li key={i}>{s}</li>)}</ul>
                              </div>
                            )}
                            {e.precautions?.length > 0 && (
                              <div className="effect-section">
                                <div className="effect-section-title">🛡️ Precautions</div>
                                <ul className="effect-list precaution-list">{e.precautions.map((p, i) => <li key={i}>{p}</li>)}</ul>
                              </div>
                            )}
                          </div>
                        )}
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
                  <canvas ref={sevChartRef} role="img" aria-label="Severity chart"></canvas>
                </div>
              </div>
              <div className="chart-card">
                <h4>State pollution levels</h4>
                <div className="chart-wrap">
                  <canvas ref={stateChartRef} role="img" aria-label="State pollution chart"></canvas>
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