from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict

app = FastAPI(title="PM Health Effects API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class HealthEffect(BaseModel):
    name: str
    desc: str
    severity: int

class BodyPartData(BaseModel):
    part: str
    pm25_effects: List[HealthEffect]
    pm10_effects: List[HealthEffect]

# Complete health effects database
health_database = {
    "Brain & Head": {
        "PM2.5": [
            {"name": "Neuroinflammation", "desc": "Microglia activation leading to brain inflammation", "severity": 4},
            {"name": "Cognitive decline", "desc": "Reduced memory and concentration", "severity": 3},
            {"name": "Headaches", "desc": "Frequent headaches and migraines", "severity": 3},
            {"name": "Neurodegenerative risk", "desc": "Associated with Alzheimer's and Parkinson's", "severity": 3}
        ],
        "PM10": [
            {"name": "Sinus irritation", "desc": "Nasal congestion and sinus inflammation", "severity": 2},
            {"name": "Mild cognitive effect", "desc": "Temporary focus issues", "severity": 2},
            {"name": "Headaches", "desc": "Occasional headaches", "severity": 1}
        ]
    },
    "Throat & Neck": {
        "PM2.5": [
            {"name": "Pharyngitis", "desc": "Throat inflammation and irritation", "severity": 3},
            {"name": "Laryngitis", "desc": "Voice hoarseness and difficulty speaking", "severity": 2},
            {"name": "Persistent cough", "desc": "Chronic throat cough reflex", "severity": 3}
        ],
        "PM10": [
            {"name": "Throat dryness", "desc": "Irritated throat and coughing", "severity": 2},
            {"name": "Swelling", "desc": "Mild throat swelling", "severity": 1}
        ]
    },
    "Lungs & Respiratory": {
        "PM2.5": [
            {"name": "Asthma exacerbation", "desc": "Severe airway inflammation and bronchospasm", "severity": 5},
            {"name": "Chronic bronchitis", "desc": "Persistent cough and mucus production", "severity": 4},
            {"name": "Reduced lung function", "desc": "Decreased FEV1 (forced expiratory volume)", "severity": 4},
            {"name": "Pulmonary fibrosis risk", "desc": "Long-term scarring of lung tissue", "severity": 4}
        ],
        "PM10": [
            {"name": "Acute bronchitis", "desc": "Temporary airway inflammation", "severity": 3},
            {"name": "Coughing", "desc": "Persistent dry or wet cough", "severity": 3},
            {"name": "Shortness of breath", "desc": "Temporary breathing difficulty", "severity": 2}
        ]
    },
    "Heart & Cardiovascular": {
        "PM2.5": [
            {"name": "Systemic inflammation", "desc": "Elevated CRP and inflammatory markers", "severity": 4},
            {"name": "Blood pressure increase", "desc": "Acute and chronic hypertension", "severity": 4},
            {"name": "Arrhythmias", "desc": "Abnormal heart rhythms", "severity": 3},
            {"name": "MI risk", "desc": "Increased myocardial infarction risk", "severity": 5}
        ],
        "PM10": [
            {"name": "Palpitations", "desc": "Irregular heartbeat sensation", "severity": 2},
            {"name": "Blood pressure rise", "desc": "Temporary BP elevation", "severity": 2},
            {"name": "Chest discomfort", "desc": "Mild chest tightness", "severity": 1}
        ]
    },
    "Liver & Metabolism": {
        "PM2.5": [
            {"name": "Hepatic inflammation", "desc": "Liver tissue inflammation", "severity": 3},
            {"name": "Metabolic syndrome", "desc": "Insulin resistance and glucose dysregulation", "severity": 4},
            {"name": "Lipid accumulation", "desc": "Fat deposition in liver cells", "severity": 3},
            {"name": "Enzyme elevation", "desc": "Elevated liver enzyme levels", "severity": 2}
        ],
        "PM10": [
            {"name": "Mild inflammation", "desc": "Temporary liver enzyme elevation", "severity": 2},
            {"name": "Metabolic changes", "desc": "Temporary glucose changes", "severity": 1}
        ]
    },
    "Stomach & Digestive": {
        "PM2.5": [
            {"name": "GI inflammation", "desc": "Gut barrier dysfunction and inflammation", "severity": 3},
            {"name": "Dysbiosis", "desc": "Altered gut microbiome composition", "severity": 2},
            {"name": "Digestive issues", "desc": "Bloating, constipation, diarrhea", "severity": 2},
            {"name": "Nausea", "desc": "Feeling of nausea and stomach upset", "severity": 2}
        ],
        "PM10": [
            {"name": "Mild gastric upset", "desc": "Temporary stomach discomfort", "severity": 1},
            {"name": "Bloating", "desc": "Mild abdominal bloating", "severity": 1}
        ]
    },
    "Kidneys & Renal": {
        "PM2.5": [
            {"name": "Kidney dysfunction", "desc": "Reduced glomerular filtration rate (GFR)", "severity": 3},
            {"name": "Proteinuria", "desc": "Protein leakage in urine", "severity": 3},
            {"name": "Oxidative stress", "desc": "Systemic ROS production in kidney", "severity": 3},
            {"name": "Urinary changes", "desc": "Changes in urinary output and color", "severity": 2}
        ],
        "PM10": [
            {"name": "Mild dysfunction", "desc": "Temporary kidney enzyme changes", "severity": 1},
            {"name": "Dehydration", "desc": "Increased fluid loss", "severity": 1}
        ]
    },
    "Intestines & GI": {
        "PM2.5": [
            {"name": "Intestinal barrier damage", "desc": "Increased intestinal permeability (leaky gut)", "severity": 3},
            {"name": "Gut dysbiosis", "desc": "Altered beneficial bacteria composition", "severity": 3},
            {"name": "Inflammation", "desc": "Systemic and local GI inflammation", "severity": 3},
            {"name": "Diarrhea", "desc": "Loose stools and digestive distress", "severity": 2}
        ],
        "PM10": [
            {"name": "Temporary discomfort", "desc": "Mild digestive upset", "severity": 1},
            {"name": "Gas", "desc": "Increased gas and bloating", "severity": 1}
        ]
    },
    "Skin & Dermal": {
        "PM2.5": [
            {"name": "Dermatitis", "desc": "Skin inflammation and irritation", "severity": 3},
            {"name": "Acne exacerbation", "desc": "Increased pore clogging and breakouts", "severity": 2},
            {"name": "Photoaging", "desc": "Accelerated skin aging and wrinkles", "severity": 2},
            {"name": "Allergic reactions", "desc": "Increased skin sensitivity", "severity": 2}
        ],
        "PM10": [
            {"name": "Eye irritation", "desc": "Conjunctivitis and eye discomfort", "severity": 2},
            {"name": "Skin irritation", "desc": "Redness and itching", "severity": 1},
            {"name": "Dryness", "desc": "Dry, flaky skin", "severity": 1}
        ]
    },
    "Bones & Muscles": {
        "PM2.5": [
            {"name": "Systemic inflammation", "desc": "Inflammation affecting muscles and joints", "severity": 3},
            {"name": "Muscle weakness", "desc": "Reduced muscle strength and fatigue", "severity": 2},
            {"name": "Joint pain", "desc": "Exacerbation of arthritis and joint pain", "severity": 3},
            {"name": "Bone density loss", "desc": "Decreased calcium absorption", "severity": 2}
        ],
        "PM10": [
            {"name": "Muscle soreness", "desc": "Post-exercise muscle pain", "severity": 1},
            {"name": "Joint stiffness", "desc": "Morning joint stiffness", "severity": 1}
        ]
    }
}

state_pollution_data = {
    "Delhi": {"PM2.5": 180, "PM10": 250},
    "Maharashtra": {"PM2.5": 95, "PM10": 150},
    "Uttar Pradesh": {"PM2.5": 140, "PM10": 200},
    "Punjab": {"PM2.5": 110, "PM10": 170},
    "Rajasthan": {"PM2.5": 125, "PM10": 185},
    "Tamil Nadu": {"PM2.5": 65, "PM10": 95},
    "Karnataka": {"PM2.5": 58, "PM10": 88},
    "Gujarat": {"PM2.5": 85, "PM10": 135},
    "West Bengal": {"PM2.5": 92, "PM10": 148}
}

@app.get("/")
def read_root():
    return {"message": "PM2.5 & PM10 Health Effects API", "version": "1.0"}

@app.get("/health-effects/{body_part}")
def get_health_effects(body_part: str, pm_type: str = "PM2.5"):
    """Get health effects for a specific body part and PM type"""
    if body_part not in health_database:
        return {"error": f"Body part '{body_part}' not found"}
    
    if pm_type not in ["PM2.5", "PM10"]:
        return {"error": "PM type must be PM2.5 or PM10"}
    
    effects = health_database[body_part].get(pm_type, [])
    return {
        "body_part": body_part,
        "pm_type": pm_type,
        "effects": effects,
        "count": len(effects)
    }

@app.get("/body-parts")
def get_all_body_parts():
    """Get list of all body parts"""
    return {"body_parts": list(health_database.keys())}

@app.get("/state-pollution/{state}")
def get_state_pollution(state: str):
    """Get pollution data for a state"""
    if state not in state_pollution_data:
        return {"error": f"State '{state}' not found"}
    
    return {
        "state": state,
        "pollution": state_pollution_data[state]
    }

@app.get("/states")
def get_all_states():
    """Get list of all states"""
    return {"states": list(state_pollution_data.keys())}

@app.get("/assessment")
def get_assessment(name: str, age: str, state: str, pm_type: str):
    """Get personalized health assessment"""
    vulnerability_levels = {
        "Children (0-12)": 5,
        "Adolescents (13-19)": 3,
        "Adults (20-65)": 3,
        "Elderly (65+)": 5
    }
    
    if age not in vulnerability_levels:
        return {"error": "Invalid age group"}
    
    vuln = vulnerability_levels.get(age, 3)
    pollution = state_pollution_data.get(state, {}).get(pm_type, 100)
    risk_score = (vuln * pollution) / 100
    
    return {
        "name": name,
        "age": age,
        "state": state,
        "pm_type": pm_type,
        "vulnerability": vuln,
        "pollution_level": pollution,
        "risk_score": round(risk_score, 2),
        "recommendation": "Wear N95 mask and limit outdoor activities" if risk_score > 10 else "Maintain normal precautions"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
