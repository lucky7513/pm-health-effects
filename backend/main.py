from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="PM Health Effects API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthEffect(BaseModel):
    name: str
    desc: str
    severity: int
    details: Optional[str] = None
    symptoms: Optional[List[str]] = None
    precautions: Optional[List[str]] = None

health_database = {
    "Brain & Head": {
        "PM2.5": [
            {
                "name": "Neuroinflammation",
                "desc": "Microglia activation leading to brain inflammation",
                "severity": 4,
                "details": "PM2.5 particles cross the blood-brain barrier, activating microglia (brain immune cells) and triggering chronic neuroinflammation. This can lead to long-term structural brain changes.",
                "symptoms": ["Persistent brain fog", "Memory lapses", "Difficulty concentrating", "Mood swings", "Fatigue even after rest"],
                "precautions": ["Wear N95 mask outdoors", "Use air purifier at home", "Take omega-3 supplements (anti-inflammatory)", "Avoid outdoor exercise on high AQI days", "Keep windows closed on polluted days"]
            },
            {
                "name": "Cognitive decline",
                "desc": "Reduced memory and concentration",
                "severity": 3,
                "details": "Long-term PM2.5 exposure is linked to accelerated cognitive aging, reduced IQ in children, and higher dementia risk. Even short-term exposure impairs working memory and attention.",
                "symptoms": ["Forgetfulness", "Slow thinking", "Difficulty multitasking", "Poor decision making", "Mental exhaustion"],
                "precautions": ["Limit outdoor time when AQI > 150", "Exercise indoors on bad air days", "Eat antioxidant-rich foods (berries, leafy greens)", "Stay hydrated", "Get adequate sleep for brain recovery"]
            },
            {
                "name": "Headaches & Migraines",
                "desc": "Frequent headaches triggered by air pollutants",
                "severity": 3,
                "details": "Pollutants cause vascular changes in cerebral blood vessels and trigger trigeminal nerve activation, resulting in tension headaches and migraines. People with existing migraines are especially vulnerable.",
                "symptoms": ["Throbbing head pain", "Sensitivity to light/sound", "Nausea with headache", "Visual disturbances", "Neck stiffness"],
                "precautions": ["Track AQI daily using apps", "Wear mask during commute", "Stay indoors during peak pollution hours (morning/evening)", "Keep pain relief medication handy", "Use air purifier in bedroom"]
            },
            {
                "name": "Neurodegenerative risk",
                "desc": "Associated with Alzheimer's and Parkinson's disease",
                "severity": 3,
                "details": "Studies show that long-term PM2.5 exposure increases risk of Alzheimer's by 138% and Parkinson's by 56%. Ultrafine particles deposit in the olfactory nerve and travel directly to the brain.",
                "symptoms": ["Progressive memory loss", "Tremors (Parkinson's)", "Personality changes", "Loss of smell (early sign)", "Balance problems"],
                "precautions": ["Use HEPA air purifiers", "Avoid living near highways or industrial areas", "Regular neurological check-ups if over 50", "Mediterranean diet reduces risk", "Regular physical and mental exercise"]
            }
        ],
        "PM10": [
            {
                "name": "Sinus irritation",
                "desc": "Nasal congestion and sinus inflammation",
                "severity": 2,
                "details": "PM10 particles deposit in the upper airways and nasal passages, causing inflammation of the sinus lining, increased mucus production, and nasal congestion.",
                "symptoms": ["Blocked nose", "Runny nose", "Facial pressure", "Reduced sense of smell", "Post-nasal drip"],
                "precautions": ["Use saline nasal spray to clear passages", "Wear a basic dust mask outdoors", "Keep indoor humidity between 40-60%", "Avoid dusty environments", "Rinse face after being outdoors"]
            },
            {
                "name": "Mild cognitive effect",
                "desc": "Temporary focus and attention issues",
                "severity": 2,
                "details": "Short-term PM10 exposure can temporarily reduce attention span and reaction time. Effects are reversible once air quality improves.",
                "symptoms": ["Difficulty focusing", "Slower reaction time", "Mild irritability", "Eye strain", "Fatigue"],
                "precautions": ["Take breaks indoors on high dust days", "Ventilate rooms properly", "Use air purifier during work/study", "Drink more water to flush toxins", "Avoid strenuous outdoor activity"]
            },
            {
                "name": "Headaches",
                "desc": "Occasional headaches from sinus pressure",
                "severity": 1,
                "details": "Sinus congestion from PM10 creates pressure in the nasal cavities, leading to tension-type headaches. Usually mild and resolves after moving to clean air.",
                "symptoms": ["Dull head pressure", "Sinus pain around eyes", "Nasal congestion with headache"],
                "precautions": ["Stay hydrated", "Apply warm compress on forehead", "Use decongestant if prescribed", "Avoid dusty areas", "Rest in well-ventilated spaces"]
            }
        ]
    },
    "Lungs & Respiratory": {
        "PM2.5": [
            {
                "name": "Asthma exacerbation",
                "desc": "Severe airway inflammation and bronchospasm",
                "severity": 5,
                "details": "PM2.5 is the #1 trigger for asthma attacks. Particles penetrate deep into bronchioles, triggering IgE-mediated immune response, mast cell degranulation, and severe airway narrowing. Can be life-threatening.",
                "symptoms": ["Sudden wheezing", "Chest tightness", "Severe shortness of breath", "Coughing fits", "Blue lips (severe cases)"],
                "precautions": ["Always carry rescue inhaler", "Monitor AQI before going out", "Wear N95 mask outdoors", "Take preventive inhaler as prescribed", "Install HEPA air purifier at home", "Avoid outdoor exercise when AQI > 100"]
            },
            {
                "name": "Chronic bronchitis",
                "desc": "Persistent cough and mucus production",
                "severity": 4,
                "details": "Repeated PM2.5 exposure causes permanent changes to the bronchial lining — goblet cells overproduce mucus, cilia are damaged, and inflammatory cells permanently infiltrate the airway walls.",
                "symptoms": ["Daily productive cough (3+ months)", "Thick yellow/green mucus", "Morning coughing fits", "Frequent respiratory infections", "Breathlessness during activity"],
                "precautions": ["Quit smoking immediately", "Use air purifier 24/7", "Stay hydrated to thin mucus", "Steam inhalation for relief", "Annual flu vaccination", "Pulmonologist check-up every 6 months"]
            },
            {
                "name": "Reduced lung function",
                "desc": "Decreased FEV1 — lung capacity falls over time",
                "severity": 4,
                "details": "Long-term PM2.5 exposure causes a measurable decline in FEV1 (forced expiratory volume) of 1-3% per year. Children exposed early in life never reach their full lung development potential.",
                "symptoms": ["Getting winded easily", "Cannot climb stairs without breathlessness", "Reduced exercise capacity", "Frequent sighing", "Shallow breathing"],
                "precautions": ["Spirometry test annually", "Practice deep breathing exercises (pranayama)", "Avoid second-hand smoke", "Wear mask during commute", "Children should play indoors on high AQI days"]
            },
            {
                "name": "Pulmonary fibrosis risk",
                "desc": "Long-term scarring of lung tissue",
                "severity": 4,
                "details": "Chronic PM2.5 exposure triggers TGF-β pathways causing fibroblast activation and irreversible collagen deposition in lung tissue. The scarred tissue cannot exchange oxygen, causing progressive breathing failure.",
                "symptoms": ["Progressive breathlessness", "Dry persistent cough", "Fatigue", "Clubbing of fingertips", "Crackling breath sounds"],
                "precautions": ["Relocate away from heavily polluted areas if possible", "HEPA purifier mandatory", "Regular chest CT scans if exposed occupationally", "Antioxidant-rich diet", "Avoid all lung irritants including cooking smoke"]
            }
        ],
        "PM10": [
            {
                "name": "Acute bronchitis",
                "desc": "Temporary airway inflammation",
                "severity": 3,
                "details": "PM10 deposits in the bronchi causing acute inflammation. Usually self-limiting but can lead to secondary bacterial infection especially in children and elderly.",
                "symptoms": ["Chest soreness", "Wet cough with mucus", "Low fever", "Whistling breath sounds", "Fatigue"],
                "precautions": ["Rest and increase fluid intake", "Use humidifier", "Honey-ginger tea for soothing effect", "Wear mask in dusty areas", "See doctor if symptoms last more than 10 days"]
            },
            {
                "name": "Coughing",
                "desc": "Persistent dry or wet cough from irritation",
                "severity": 3,
                "details": "PM10 stimulates irritant receptors in the trachea and bronchi, triggering the cough reflex. Persistent coughing can strain respiratory muscles and disturb sleep.",
                "symptoms": ["Persistent cough", "Throat tickle", "Worse at night", "Hoarse voice", "Chest muscle soreness from coughing"],
                "precautions": ["Drink warm fluids", "Use honey and turmeric", "Avoid cold drinks", "Wear mask outdoors", "Use air purifier at night"]
            },
            {
                "name": "Shortness of breath",
                "desc": "Temporary breathing difficulty during exposure",
                "severity": 2,
                "details": "PM10 causes transient bronchospasm in sensitive individuals. Breathing difficulty is usually mild and resolves after moving indoors or the dust settles.",
                "symptoms": ["Laboured breathing", "Chest heaviness", "Need to breathe faster", "Anxiety from breathing difficulty"],
                "precautions": ["Move indoors immediately", "Sit upright to open airways", "Use inhaler if prescribed", "Drink water slowly", "Seek medical help if persists"]
            }
        ]
    },
    "Heart & Cardiovascular": {
        "PM2.5": [
            {
                "name": "Systemic inflammation",
                "desc": "Elevated CRP and inflammatory markers in blood",
                "severity": 4,
                "details": "PM2.5 entering the bloodstream triggers systemic release of IL-6, TNF-α, and CRP. This chronic low-grade inflammation damages arterial walls and accelerates atherosclerosis.",
                "symptoms": ["Fatigue", "General body aches", "Elevated blood tests (CRP)", "Swollen joints", "Feeling unwell generally"],
                "precautions": ["Anti-inflammatory diet (turmeric, ginger, fish)", "Regular blood tests (CRP levels)", "Avoid outdoor exertion on bad air days", "Use N95 mask during commute", "Daily 30-min indoor exercise"]
            },
            {
                "name": "Blood pressure increase",
                "desc": "Acute and chronic hypertension from pollution",
                "severity": 4,
                "details": "PM2.5 activates the autonomic nervous system, causing vasoconstriction and BP spikes within hours of exposure. Chronic exposure leads to permanent arterial stiffening and sustained hypertension.",
                "symptoms": ["Headache at the back of neck", "Dizziness", "Blurred vision", "Chest pain", "Nosebleeds"],
                "precautions": ["Monitor BP daily with home device", "Reduce salt intake", "Yoga and meditation to reduce stress", "Antihypertensive medication as prescribed", "Avoid outdoor activity on high AQI mornings"]
            },
            {
                "name": "Arrhythmias",
                "desc": "Abnormal heart rhythms triggered by pollutants",
                "severity": 3,
                "details": "PM2.5 affects cardiac autonomic control — reducing heart rate variability and triggering atrial fibrillation. Oxidative stress from particles directly damages cardiac conduction cells.",
                "symptoms": ["Palpitations", "Irregular heartbeat", "Fluttering in chest", "Dizziness with heartbeat changes", "Sudden fatigue"],
                "precautions": ["ECG check-up if you feel palpitations", "Avoid caffeine on high pollution days", "Magnesium-rich foods (bananas, nuts)", "Stress management", "Cardiologist review for high-risk individuals"]
            },
            {
                "name": "Heart attack risk",
                "desc": "Increased myocardial infarction risk within hours",
                "severity": 5,
                "details": "Studies show heart attack risk rises 48% within 2 hours of high PM2.5 exposure. Particles trigger plaque rupture in coronary arteries by promoting oxidative stress and inflammatory cascade.",
                "symptoms": ["Chest pain radiating to arm/jaw", "Cold sweats", "Nausea", "Extreme fatigue", "Shortness of breath"],
                "precautions": ["Know the nearest cardiac emergency hospital", "Take aspirin as preventive if cardiologist advises", "Never exercise outdoors when AQI > 200", "Wear N95 mask strictly", "Cardiac patients must check AQI daily"]
            }
        ],
        "PM10": [
            {
                "name": "Palpitations",
                "desc": "Irregular heartbeat sensation",
                "severity": 2,
                "details": "PM10 exposure causes mild autonomic nervous system changes leading to transient heart rate irregularities. Usually benign but concerning for those with existing heart conditions.",
                "symptoms": ["Racing heart", "Skipped beats", "Fluttering sensation", "Brief dizziness"],
                "precautions": ["Reduce caffeine", "Practice deep breathing", "Rest if palpitations occur", "See doctor if frequent", "Avoid strenuous activity outdoors"]
            },
            {
                "name": "Blood pressure rise",
                "desc": "Temporary BP elevation",
                "severity": 2,
                "details": "Short-term dust exposure can cause mild BP elevation due to stress response activation. Usually resolves after exposure ends.",
                "symptoms": ["Mild headache", "Slight dizziness", "Flushed face"],
                "precautions": ["Monitor BP if you have hypertension", "Drink water and rest", "Stay indoors", "Deep breathing exercises", "Avoid physical exertion"]
            },
            {
                "name": "Chest discomfort",
                "desc": "Mild chest tightness from dust inhalation",
                "severity": 1,
                "details": "Upper airway irritation from PM10 can cause referred discomfort in the chest. Usually resolves quickly after moving to clean air.",
                "symptoms": ["Mild chest tightness", "Feeling of pressure", "Slight breathlessness"],
                "precautions": ["Move to clean air immediately", "Sit and relax", "Drink warm water", "Seek help if pain is severe", "Use mask in dusty areas"]
            }
        ]
    },
    "Liver & Metabolism": {
        "PM2.5": [
            {
                "name": "Hepatic inflammation",
                "desc": "Liver tissue inflammation from oxidative stress",
                "severity": 3,
                "details": "PM2.5 reaches the liver via the bloodstream and triggers Kupffer cell activation. Oxidative stress damages hepatocytes and elevates liver enzymes (ALT, AST).",
                "symptoms": ["Right-side abdominal discomfort", "Fatigue", "Nausea after meals", "Elevated liver enzymes in blood tests", "Loss of appetite"],
                "precautions": ["Avoid alcohol during high pollution periods", "Milk thistle supplement supports liver", "Regular liver function tests", "Eat antioxidant-rich foods", "Stay hydrated to help liver detoxify"]
            },
            {
                "name": "Metabolic syndrome",
                "desc": "Insulin resistance and glucose dysregulation",
                "severity": 4,
                "details": "PM2.5 disrupts adipokine signaling, impairs insulin receptor function, and promotes visceral fat accumulation. Studies show 15-20% higher diabetes risk in high-pollution areas.",
                "symptoms": ["Unexplained weight gain", "Increased thirst", "Fatigue after meals", "High fasting blood sugar", "Increased waist circumference"],
                "precautions": ["Regular HbA1c and fasting glucose tests", "Low-glycemic diet", "Indoor exercise to maintain metabolism", "Reduce processed food intake", "Annual metabolic panel blood test"]
            },
            {
                "name": "Lipid accumulation",
                "desc": "Fat deposition in liver cells (fatty liver)",
                "severity": 3,
                "details": "PM2.5 activates SREBP-1c transcription factor, promoting lipid synthesis in liver cells and inhibiting fatty acid oxidation — leading to non-alcoholic fatty liver disease (NAFLD).",
                "symptoms": ["Mild right-side discomfort", "Bloating", "Fatigue", "Elevated triglycerides in blood test", "Feeling heavy after eating"],
                "precautions": ["Avoid high-fat processed foods", "Regular liver ultrasound", "Increase dietary fiber", "Regular physical activity", "Limit fructose intake (sugary drinks)"]
            },
            {
                "name": "Enzyme elevation",
                "desc": "Elevated ALT/AST liver enzymes",
                "severity": 2,
                "details": "Even moderate PM2.5 exposure raises serum ALT and AST enzymes, indicating hepatocellular stress. Long-term elevation may progress to liver fibrosis.",
                "symptoms": ["Detected in blood test", "May have no symptoms initially", "General fatigue", "Mild nausea"],
                "precautions": ["6-monthly liver function tests if in high-pollution area", "Avoid hepatotoxic drugs", "Vitamin E has liver-protective effects", "Reduce alcohol", "Plant-based diet helps"]
            }
        ],
        "PM10": [
            {
                "name": "Mild inflammation",
                "desc": "Temporary liver enzyme elevation",
                "severity": 2,
                "details": "Short-term PM10 exposure causes transient hepatic stress, usually reversible once exposure ends.",
                "symptoms": ["Mild fatigue", "Slight nausea", "Detected in blood tests"],
                "precautions": ["Drink plenty of water", "Eat light, easy-to-digest meals", "Avoid alcohol", "Rest adequately", "Monitor if symptoms persist"]
            },
            {
                "name": "Metabolic changes",
                "desc": "Temporary glucose and lipid changes",
                "severity": 1,
                "details": "Brief PM10 exposure can cause mild transient changes in blood sugar and lipid metabolism. Usually resolves quickly.",
                "symptoms": ["Mild fatigue", "Slight energy fluctuations"],
                "precautions": ["Balanced diet", "Avoid sugary snacks", "Regular meals", "Stay active indoors", "Monitor blood sugar if diabetic"]
            }
        ]
    },
    "Stomach & Digestive": {
        "PM2.5": [
            {
                "name": "GI inflammation",
                "desc": "Gut barrier dysfunction and intestinal inflammation",
                "severity": 3,
                "details": "Swallowed PM2.5 from mucociliary clearance reaches the GI tract and triggers NF-κB inflammatory pathway in intestinal epithelial cells, increasing gut permeability.",
                "symptoms": ["Abdominal cramps", "Irregular bowel movements", "Bloating after meals", "Stomach sensitivity", "Mucus in stool"],
                "precautions": ["Eat probiotic foods (yogurt, buttermilk)", "Avoid spicy food during high pollution days", "Drink filtered water", "Fiber-rich diet to support gut barrier", "Wash hands and food thoroughly"]
            },
            {
                "name": "Dysbiosis",
                "desc": "Altered gut microbiome from pollution exposure",
                "severity": 2,
                "details": "PM2.5 reduces diversity of beneficial gut bacteria (Lactobacillus, Bifidobacterium) and promotes growth of pathogenic strains. This gut-brain axis disruption affects mood and immunity.",
                "symptoms": ["Frequent bloating", "Gas and flatulence", "Variable stool consistency", "Food sensitivities", "Mood changes linked to gut"],
                "precautions": ["Daily probiotic supplementation", "Prebiotic foods (onion, garlic, banana)", "Reduce antibiotic use", "Stress management (affects gut bacteria)", "Fermented foods like idli, dosa, pickles"]
            },
            {
                "name": "Digestive issues",
                "desc": "Bloating, constipation, and diarrhea episodes",
                "severity": 2,
                "details": "Gut motility disruption from autonomic nervous system changes caused by PM2.5 leads to alternating constipation and diarrhea, similar to IBS patterns.",
                "symptoms": ["Unpredictable bowel habits", "Abdominal distension", "Cramping before bowel movement", "Incomplete evacuation feeling", "Discomfort after eating"],
                "precautions": ["High-fiber diet (fruits, vegetables, whole grains)", "Regular meal timing", "8-10 glasses of water daily", "Light outdoor walk when AQI is acceptable", "Avoid processed/fast food"]
            },
            {
                "name": "Nausea",
                "desc": "Nausea and stomach upset from systemic inflammation",
                "severity": 2,
                "details": "Systemic inflammatory cytokines from PM2.5 exposure stimulate the chemoreceptor trigger zone in the brain, causing nausea. Often accompanied by loss of appetite.",
                "symptoms": ["Queasy stomach feeling", "Loss of appetite", "Occasional vomiting", "Stomach discomfort", "Aversion to food smells"],
                "precautions": ["Ginger tea for nausea relief", "Eat small frequent meals", "Avoid strong food smells", "Stay in ventilated areas", "Oral rehydration if vomiting occurs"]
            }
        ],
        "PM10": [
            {
                "name": "Mild gastric upset",
                "desc": "Temporary stomach discomfort",
                "severity": 1,
                "details": "PM10 swallowed through mucociliary clearance can mildly irritate the stomach lining.",
                "symptoms": ["Mild stomach discomfort", "Occasional nausea", "Reduced appetite"],
                "precautions": ["Drink warm water", "Light easy-to-digest meals", "Avoid spicy food", "Rest after meals", "Ginger tea"]
            },
            {
                "name": "Bloating",
                "desc": "Mild abdominal bloating and gas",
                "severity": 1,
                "details": "Minor gut irritation from PM10 can cause temporary increased gas production and abdominal bloating.",
                "symptoms": ["Abdominal fullness", "Gas", "Slight discomfort"],
                "precautions": ["Eat slowly", "Avoid carbonated drinks", "Fennel seeds after meals", "Light abdominal massage", "Stay hydrated"]
            }
        ]
    },
    "Kidneys & Renal": {
        "PM2.5": [
            {
                "name": "Kidney dysfunction",
                "desc": "Reduced glomerular filtration rate (GFR)",
                "severity": 3,
                "details": "PM2.5 causes oxidative stress in glomerular cells, reducing filtration efficiency. Studies show 25% higher CKD risk in high-pollution areas. Progression is silent until significant damage occurs.",
                "symptoms": ["Reduced urine output", "Leg swelling (oedema)", "Fatigue", "High blood pressure", "Elevated creatinine in blood test"],
                "precautions": ["Annual kidney function test (creatinine, GFR)", "Stay well hydrated", "Avoid NSAIDs (ibuprofen) during high pollution", "Low sodium diet", "Blood pressure control is critical"]
            },
            {
                "name": "Proteinuria",
                "desc": "Protein leakage in urine from kidney damage",
                "severity": 3,
                "details": "PM2.5 damages the glomerular filtration barrier, allowing albumin to leak into urine. Proteinuria is an early sign of kidney damage and a cardiovascular risk marker.",
                "symptoms": ["Foamy or frothy urine", "Swelling in ankles/feet", "Puffiness around eyes in morning", "Fatigue", "Detected in routine urine test"],
                "precautions": ["Annual urine albumin test", "Low-protein diet if kidneys are damaged", "Control blood sugar and blood pressure", "Adequate hydration", "Avoid contrast dye procedures if kidneys are weak"]
            },
            {
                "name": "Oxidative stress",
                "desc": "Free radical damage to kidney cells",
                "severity": 3,
                "details": "PM2.5 components (metals, PAHs) generate reactive oxygen species in renal tubular cells, causing DNA damage, mitochondrial dysfunction, and accelerated cell death.",
                "symptoms": ["Generally no early symptoms", "Fatigue", "Later: reduced urine output", "Detected in blood/urine tests"],
                "precautions": ["Vitamin C and E rich foods", "Green tea (antioxidant)", "Avoid environmental toxins", "Regular kidney ultrasound", "Stay away from industrial smoke"]
            },
            {
                "name": "Urinary changes",
                "desc": "Changes in urinary output, color and frequency",
                "severity": 2,
                "details": "Inflammatory changes in the renal tubules affect urine concentration ability, leading to changes in urine color, frequency, and volume.",
                "symptoms": ["Dark yellow urine", "Increased or decreased frequency", "Urgency", "Mild burning sensation", "Frothy urine"],
                "precautions": ["Drink 2-3 litres of water daily", "Monitor urine color", "Urine test if changes persist", "Reduce caffeine intake", "See doctor if blood in urine"]
            }
        ],
        "PM10": [
            {
                "name": "Mild dysfunction",
                "desc": "Temporary kidney enzyme changes",
                "severity": 1,
                "details": "Short-term PM10 exposure causes minor transient renal stress, usually fully reversible.",
                "symptoms": ["Mild fatigue", "Slightly reduced urine", "Detected in blood tests"],
                "precautions": ["Stay hydrated", "Reduce salt intake", "Avoid strenuous activity", "Monitor if you have existing kidney issues", "Rest adequately"]
            },
            {
                "name": "Dehydration risk",
                "desc": "Increased fluid loss from respiratory irritation",
                "severity": 1,
                "details": "Increased breathing rate and mucus production from PM10 inhalation increases fluid loss from the respiratory tract.",
                "symptoms": ["Dry mouth", "Thirst", "Dark urine", "Fatigue"],
                "precautions": ["Drink extra water on dusty days", "Avoid caffeine and alcohol", "Oral rehydration salts if needed", "Rest in cool environment", "Monitor urine color"]
            }
        ]
    },
    "Intestines & GI": {
        "PM2.5": [
            {
                "name": "Intestinal barrier damage",
                "desc": "Leaky gut from PM2.5 induced permeability",
                "severity": 3,
                "details": "PM2.5 disrupts tight junction proteins (claudin, occludin) in intestinal epithelium, increasing paracellular permeability. This allows bacterial endotoxins to enter bloodstream, causing systemic inflammation.",
                "symptoms": ["Food sensitivities", "Bloating", "Abdominal pain", "Fatigue after eating", "Skin rashes linked to gut"],
                "precautions": ["L-glutamine supplement supports gut lining", "Bone broth (traditional remedy)", "Avoid alcohol and NSAIDs", "Zinc-rich foods", "Reduce refined sugar intake"]
            },
            {
                "name": "Gut dysbiosis",
                "desc": "Altered beneficial bacteria composition",
                "severity": 3,
                "details": "PM2.5 reduces populations of Bacteroidetes and Firmicutes beneficial bacteria while promoting pathogenic strains. This microbiome imbalance has far-reaching effects on immunity and mental health.",
                "symptoms": ["Unpredictable digestion", "Frequent illness (low immunity)", "Mood changes", "Sugar cravings", "Fatigue"],
                "precautions": ["Daily probiotics (Lactobacillus, Bifidobacterium)", "High-fiber diet", "Reduce processed foods", "Diverse plant-based diet", "Avoid unnecessary antibiotics"]
            },
            {
                "name": "Intestinal inflammation",
                "desc": "Systemic and local GI inflammatory response",
                "severity": 3,
                "details": "PM2.5 activates TLR4 receptors in intestinal macrophages, triggering an IL-6 and TNF-α inflammatory cascade. Can worsen existing conditions like Crohn's disease and ulcerative colitis.",
                "symptoms": ["Abdominal cramps", "Diarrhea with mucus", "Blood in stool (severe cases)", "Fever", "Weight loss"],
                "precautions": ["Anti-inflammatory diet (turmeric, ginger)", "Monitor symptoms if you have IBD", "Avoid trigger foods", "Stay indoors on high AQI days", "Gastroenterologist follow-up"]
            },
            {
                "name": "Diarrhea",
                "desc": "Loose stools from gut motility disruption",
                "severity": 2,
                "details": "Gut inflammation from PM2.5 accelerates intestinal motility, reducing water absorption and causing loose, frequent stools. Can lead to dehydration if prolonged.",
                "symptoms": ["Loose or watery stools", "Urgency", "Abdominal cramping", "Nausea", "Dehydration signs"],
                "precautions": ["ORS (oral rehydration solution)", "BRAT diet (banana, rice, apple, toast)", "Probiotics to restore flora", "Avoid dairy and spicy food temporarily", "See doctor if persists beyond 3 days"]
            }
        ],
        "PM10": [
            {
                "name": "Temporary discomfort",
                "desc": "Mild digestive upset from swallowed particles",
                "severity": 1,
                "details": "PM10 swallowed from mucociliary clearance causes mild, transient GI irritation that resolves quickly.",
                "symptoms": ["Mild stomach discomfort", "Occasional nausea", "Gas"],
                "precautions": ["Drink warm water", "Light diet", "Rest", "Avoid spicy food", "Ginger or chamomile tea"]
            },
            {
                "name": "Gas and bloating",
                "desc": "Increased intestinal gas production",
                "severity": 1,
                "details": "Minor gut irritation from PM10 slightly disrupts normal digestion, causing temporary increased gas.",
                "symptoms": ["Flatulence", "Abdominal fullness", "Mild discomfort"],
                "precautions": ["Eat slowly", "Avoid carbonated drinks", "Fennel seeds", "Light walk after meals", "Peppermint tea"]
            }
        ]
    },
    "Skin & Dermal": {
        "PM2.5": [
            {
                "name": "Dermatitis",
                "desc": "Skin inflammation, redness and irritation",
                "severity": 3,
                "details": "PM2.5 particles deposit on skin, activate Th2 immune response, and deplete natural moisturizing factors. This disrupts the skin barrier function leading to eczema-like inflammation.",
                "symptoms": ["Red, itchy patches", "Dry, flaky skin", "Burning sensation on skin", "Skin sensitivity to products", "Rash-like appearance"],
                "precautions": ["Wash face thoroughly after going out", "Use gentle moisturizer with ceramides", "Avoid harsh soaps", "Antioxidant serums (Vitamin C)", "Keep skin barrier healthy with sunscreen"]
            },
            {
                "name": "Acne exacerbation",
                "desc": "Increased pore clogging and acne breakouts",
                "severity": 2,
                "details": "PM2.5 deposits block pores, increase sebum oxidation, and promote Cutibacterium acnes growth. Pollution-induced inflammation worsens acne severity especially on the face.",
                "symptoms": ["More frequent breakouts", "Clogged pores (blackheads)", "Inflamed pimples", "Uneven skin texture", "Oilier skin"],
                "precautions": ["Double cleanse on high pollution days", "Non-comedogenic moisturizer", "Niacinamide serum reduces inflammation", "Avoid touching face outdoors", "Change pillowcase frequently"]
            },
            {
                "name": "Photoaging",
                "desc": "Accelerated skin aging, wrinkles and dark spots",
                "severity": 2,
                "details": "PM2.5 generates reactive oxygen species that degrade collagen and elastin fibers, increase matrix metalloproteinases, and cause DNA damage in skin cells — accelerating visible aging.",
                "symptoms": ["Premature wrinkles", "Dark spots and uneven tone", "Dull complexion", "Loss of skin firmness", "Rough texture"],
                "precautions": ["SPF 50 sunscreen every day", "Vitamin C serum (antioxidant protection)", "Retinol at night to boost collagen", "Antioxidant-rich diet", "Sleep 7-8 hours for skin repair"]
            },
            {
                "name": "Allergic reactions",
                "desc": "Increased skin sensitivity and allergic rashes",
                "severity": 2,
                "details": "PM2.5 acts as a hapten, binding to skin proteins and triggering type IV hypersensitivity reactions. Pre-existing allergies are significantly worsened.",
                "symptoms": ["Hives or urticaria", "Contact dermatitis", "Itching without visible rash", "Swollen skin areas", "Watery eyes with skin symptoms"],
                "precautions": ["Identify and avoid allergen triggers", "Antihistamine if severe", "Cool compress for relief", "Hypoallergenic skincare products", "Consult dermatologist"]
            }
        ],
        "PM10": [
            {
                "name": "Eye irritation",
                "desc": "Conjunctivitis and eye discomfort from particles",
                "severity": 2,
                "details": "PM10 particles directly contact the conjunctiva causing mechanical irritation and allergic conjunctivitis with redness, tearing, and itching.",
                "symptoms": ["Red eyes", "Watery eyes", "Gritty feeling in eyes", "Itching", "Light sensitivity"],
                "precautions": ["Wear wraparound sunglasses outdoors", "Use lubricating eye drops", "Don't rub eyes", "Wash eyes with clean water", "See eye doctor if persists"]
            },
            {
                "name": "Skin irritation",
                "desc": "Redness and itching from particle contact",
                "severity": 1,
                "details": "Large PM10 particles on skin cause physical irritation and mild contact dermatitis.",
                "symptoms": ["Redness", "Itching", "Mild rash", "Skin dryness"],
                "precautions": ["Shower after being outdoors in dusty areas", "Moisturize daily", "Wear full-sleeve clothing", "Use calamine lotion if itchy", "Avoid scratching"]
            },
            {
                "name": "Skin dryness",
                "desc": "Dry, flaky skin from barrier disruption",
                "severity": 1,
                "details": "PM10 particles absorb moisture from the skin surface and disrupt the lipid barrier, causing dryness.",
                "symptoms": ["Tight dry feeling", "Flaking", "Rough texture", "Mild itching"],
                "precautions": ["Apply moisturizer twice daily", "Use humidifier indoors", "Drink plenty of water", "Avoid hot showers", "Gentle fragrance-free cleanser"]
            }
        ]
    },
    "Bones & Muscles": {
        "PM2.5": [
            {
                "name": "Systemic inflammation",
                "desc": "Inflammation affecting muscles and joints",
                "severity": 3,
                "details": "PM2.5-induced systemic cytokine elevation (IL-1β, TNF-α) directly targets synovial tissue in joints and skeletal muscle, worsening inflammatory arthritis and causing myalgia.",
                "symptoms": ["Joint pain and swelling", "Morning stiffness", "Muscle aches", "Reduced grip strength", "Fatigue with movement"],
                "precautions": ["Anti-inflammatory diet (omega-3 rich fish)", "Turmeric supplement (curcumin)", "Indoor swimming or yoga on high AQI days", "Warm compress for joint pain", "Rheumatologist follow-up"]
            },
            {
                "name": "Muscle weakness",
                "desc": "Reduced muscle strength and chronic fatigue",
                "severity": 2,
                "details": "Oxidative stress from PM2.5 damages mitochondria in muscle cells, reducing ATP production and causing chronic muscle fatigue and weakness even without exertion.",
                "symptoms": ["Feeling weak", "Fatigue during normal activities", "Difficulty carrying objects", "Muscle soreness at rest", "Reduced stamina"],
                "precautions": ["Resistance exercise indoors", "Protein-rich diet for muscle repair", "Vitamin D and B12 supplementation", "Adequate sleep", "CoQ10 supplement supports mitochondria"]
            },
            {
                "name": "Joint pain",
                "desc": "Worsening of arthritis and joint inflammation",
                "severity": 3,
                "details": "PM2.5 worsens rheumatoid arthritis by activating synovial fibroblasts and promoting cartilage degradation. Studies show arthritis flares increase 20% on high pollution days.",
                "symptoms": ["Painful swollen joints", "Stiffness especially in morning", "Reduced range of motion", "Warmth over joints", "Clicking or grinding sounds"],
                "precautions": ["Monitor AQI and stay indoors during flares", "Hot and cold therapy for joints", "Physiotherapy exercises", "Disease-modifying drugs as prescribed", "Weight management reduces joint load"]
            },
            {
                "name": "Bone density loss",
                "desc": "Decreased calcium absorption and bone weakening",
                "severity": 2,
                "details": "PM2.5 disrupts vitamin D metabolism and directly inhibits osteoblast activity while promoting osteoclast activity, leading to reduced bone mineral density and osteoporosis risk.",
                "symptoms": ["No early symptoms", "Back pain from vertebral changes", "Fractures from minor trauma (severe)", "Height loss over years", "Detected in DEXA scan"],
                "precautions": ["Vitamin D3 + K2 supplementation", "Calcium-rich diet (dairy, sesame, ragi)", "Weight-bearing indoor exercise", "Sun exposure in morning (if AQI permits)", "Bone density scan after 45 years"]
            }
        ],
        "PM10": [
            {
                "name": "Muscle soreness",
                "desc": "Muscle pain after outdoor activity in dusty air",
                "severity": 1,
                "details": "Breathing harder to compensate for PM10 irritation puts extra load on respiratory muscles, causing soreness.",
                "symptoms": ["Muscle aches", "Chest muscle soreness", "Fatigue after outdoor activity"],
                "precautions": ["Avoid strenuous outdoor exercise on dusty days", "Stretch after activity", "Warm bath for muscle relief", "Stay hydrated", "Rest adequately"]
            },
            {
                "name": "Joint stiffness",
                "desc": "Morning joint stiffness from mild inflammation",
                "severity": 1,
                "details": "Mild systemic inflammation from PM10 can slightly worsen joint stiffness, particularly in those with existing arthritis.",
                "symptoms": ["Morning stiffness", "Mild joint discomfort", "Reduced flexibility"],
                "precautions": ["Gentle morning stretching", "Warm shower in morning", "Stay active indoors", "Anti-inflammatory diet", "Consult doctor if worsens"]
            }
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
    return {"message": "PM2.5 & PM10 Health Effects API", "version": "2.0"}

@app.get("/health-effects/{body_part}")
def get_health_effects(body_part: str, pm_type: str = "PM2.5", age: str = None, state: str = None):
    if body_part not in health_database:
        return {"error": f"Body part '{body_part}' not found"}
    if pm_type not in ["PM2.5", "PM10"]:
        return {"error": "PM type must be PM2.5 or PM10"}

    effects = health_database[body_part].get(pm_type, [])

    age_multiplier = {
        "Children (0-12)": 1.5,
        "Adolescents (13-19)": 1.0,
        "Adults (20-65)": 1.0,
        "Elderly (65+)": 1.5
    }.get(age, 1.0)

    state_multiplier = 1.0
    if state and state in state_pollution_data:
        pollution_level = state_pollution_data[state].get(pm_type, 100)
        state_multiplier = min(pollution_level / 100, 1.5)

    adjusted_effects = []
    for effect in effects:
        adjusted_severity = min(int(effect["severity"] * age_multiplier * state_multiplier), 5)
        adjusted_effects.append({
            "name": effect["name"],
            "desc": effect["desc"],
            "severity": adjusted_severity,
            "details": effect.get("details", ""),
            "symptoms": effect.get("symptoms", []),
            "precautions": effect.get("precautions", [])
        })

    return {
        "body_part": body_part,
        "pm_type": pm_type,
        "age": age,
        "state": state,
        "effects": adjusted_effects,
        "count": len(adjusted_effects)
    }

@app.get("/body-parts")
def get_all_body_parts():
    return {"body_parts": list(health_database.keys())}

@app.get("/state-pollution/{state}")
def get_state_pollution(state: str):
    if state not in state_pollution_data:
        return {"error": f"State '{state}' not found"}
    return {"state": state, "pollution": state_pollution_data[state]}

@app.get("/states")
def get_all_states():
    return {"states": list(state_pollution_data.keys())}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)