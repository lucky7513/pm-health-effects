# PM2.5 & PM10 Health Effects Assessment Platform

A comprehensive web application that shows the harmful effects of PM2.5 and PM10 pollution on different human body parts, tailored by Indian states and age groups.

## Features

✅ **User Authentication** - Login with name and age group
✅ **State Selection** - Choose from major Indian states
✅ **Pollution Type Toggle** - Switch between PM2.5 and PM10
✅ **Interactive Body Parts** - Click on different body parts to see health effects
✅ **Severity Ratings** - Visual severity indicators for each health problem
✅ **Age-Based Assessment** - Different health risks for different age groups
✅ **Responsive Design** - Works on desktop and mobile devices
✅ **Real Health Data** - Based on scientific research about air pollution

## Tech Stack

**Backend:**
- Python 3.8+
- FastAPI (high-performance web framework)
- Uvicorn (ASGI server)

**Frontend:**
- React 18
- Vite (modern build tool)
- Axios (HTTP client)

**Database:**
- JSON-based data structure (can upgrade to PostgreSQL)

**Deployment:**
- Render (Backend)
- Vercel (Frontend)

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+

### Quick Start (Windows)

1. **Backend Setup:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

2. **Frontend Setup (in new terminal):**
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to see the app!

See `SETUP_GUIDE.txt` for detailed instructions.

## Project Structure

```
pm-health-project/
├── backend/
│   ├── main.py              # FastAPI application
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main React component
│   │   ├── App.css          # Component styles
│   │   ├── index.css        # Global styles
│   │   └── main.jsx         # Entry point
│   ├── index.html           # HTML template
│   ├── package.json         # Node dependencies
│   └── vite.config.js       # Vite configuration
├── SETUP_GUIDE.txt          # Setup instructions
└── README.md                # This file
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API root |
| GET | `/states` | List all states |
| GET | `/body-parts` | List all body parts |
| GET | `/health-effects/{part}?pm_type=PM2.5` | Get health effects |
| GET | `/state-pollution/{state}` | Get pollution levels |
| GET | `/assessment` | Get personalized assessment |

## Body Parts Covered

🧠 Brain & Head
🔴 Throat & Neck
🫁 Lungs & Respiratory
❤️ Heart & Cardiovascular
🫘 Liver & Metabolism
🍽️ Stomach & Digestive
🫘 Kidneys & Renal
🌊 Intestines & GI
👁️ Skin & Dermal
💪 Bones & Muscles

## States Included

- Delhi
- Maharashtra
- Uttar Pradesh
- Punjab
- Rajasthan
- Tamil Nadu
- Karnataka
- Gujarat
- West Bengal

## Age Groups

- Children (0-12)
- Adolescents (13-19)
- Adults (20-65)
- Elderly (65+)

## Future Enhancements

- [ ] User authentication & login history
- [ ] PDF report export
- [ ] Dark mode
- [ ] Database integration (PostgreSQL)
- [ ] Real-time pollution data from APIs
- [ ] Data visualization charts
- [ ] Share results on social media
- [ ] Mobile app (React Native)
- [ ] Multiple languages
- [ ] Admin dashboard

## Deployment

### Deploy Backend to Render
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repo
4. Deploy automatically

### Deploy Frontend to Vercel
1. Push code to GitHub
2. Import project on Vercel
3. Select "Vite" as framework
4. Deploy

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For issues or questions:
- Check SETUP_GUIDE.txt
- Review API documentation at `/docs`
- Contact the development team

---

Built with ❤️ for better air quality awareness in India
 
