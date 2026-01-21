# Electric Vehicle Population Data Platform

A full-stack application for analyzing Washington State's Electric Vehicle Population dataset. The platform includes a data pipeline, REST API, and interactive dashboard for exploring EV adoption trends.

---

## 🚀 Project Overview

This project consists of three main components:

| Component                  | Description                     | Technology              |
| -------------------------- | ------------------------------- | ----------------------- |
| **Phase 1: Data Pipeline** | ETL pipeline for data ingestion | Python, Pandas, MongoDB |
| **Phase 2: REST API**      | Backend API for data access     | FastAPI, PyMongo        |
| **Phase 3: Dashboard**     | Interactive visualization       | React, Vite, Chart.js   |

---

## 📊 Dataset

**Source:** Washington State Electric Vehicle Population Data  
**Records:** ~271,000 vehicles  
**Geography:** Washington State, USA

### Key Fields

- Vehicle Information (Make, Model, Year, Type)
- Location Data (County, City, State, Postal Code)
- Electric Range
- CAFV Eligibility
- Electric Utility Provider

---

## 🏗️ Project Structure

```
UnifiedAI/
├── Phase-1/                    # Data Pipeline
│   ├── main.py                 # Pipeline script
│   ├── Electric_Vehicle_Population_Data.csv
│   ├── requirements.txt
│   ├── .env
│   └── README.md
│
├── Phase-2/                    # REST API
│   ├── app/
│   │   ├── main.py             # FastAPI routes
│   │   ├── crud.py             # Database operations
│   │   ├── database.py         # MongoDB connection
│   │   ├── models.py           # Pydantic schemas
│   │   └── .env
│   ├── requirements.txt
│   └── README.md
│
├── frontend/                   # React Dashboard
│   ├── src/
│   │   ├── App.jsx             # Main application
│   │   ├── api.js              # API client
│   │   └── components/
│   │       ├── SummaryCards.jsx
│   │       ├── EVTypeChart.jsx
│   │       ├── TopMakesChart.jsx
│   │       ├── CAFVChart.jsx
│   │       ├── CountySearch.jsx
│   │       ├── MakeModels.jsx
│   │       └── AnalyzePanel.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md                   # This file
```

---

## 🛠️ Prerequisites

- **Python** 3.12+
- **Node.js** 18+
- **MongoDB** 6.0+ (local or Docker)
- **Docker** (optional, for MongoDB)

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/karan5772/UnifiedAI
cd UnifiedAI
```

### 2. Start MongoDB

**Using Docker**

```bash
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

### 3. Setup Phase 1 (Data Pipeline)

```bash
cd Phase-1

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run data pipeline
python main.py
```

### 4. Setup Phase 2 (API)

```bash
cd ../Phase-2

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn app.main:app --reload
```

### 5. Setup Frontend (Dashboard)

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🔧 Environment Variables

### Phase-1 & Phase-2 (.env)

```env
Ther are there in the .env files
```

---

## 🌐 API Endpoints

### Base URL: `http://127.0.0.1:8000`

| Method | Endpoint                              | Description            |
| ------ | ------------------------------------- | ---------------------- |
| GET    | `/api/v1/vehicles/summary`            | Overall EV statistics  |
| GET    | `/api/v1/vehicles/county/{name}`      | Vehicles by county     |
| GET    | `/api/v1/vehicles/make/{make}/models` | Models by manufacturer |
| POST   | `/api/v1/vehicles/analyze`            | Custom aggregation     |

### Example Requests

**Get Summary:**

```bash
curl http://127.0.0.1:8000/api/v1/vehicles/summary
```

**Get Vehicles by County:**

```bash
curl "http://127.0.0.1:8000/api/v1/vehicles/county/King?page=1&per_page=20"
```

**Get Models by Make:**

```bash
curl http://127.0.0.1:8000/api/v1/vehicles/make/tesla/models
```

**Custom Analysis:**

```bash
curl -X POST http://127.0.0.1:8000/api/v1/vehicles/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {
      "makes": ["TESLA"],
      "model_years": {"start": 2020, "end": 2024}
    },
    "group_by": "model_year"
  }'
```

---

## 📈 Dashboard Features

### Summary Cards

- Total Vehicles
- Average Electric Range
- BEV vs PHEV counts

### Interactive Charts

- **EV Type Distribution** - Pie chart showing BEV vs PHEV
- **Top 10 Makes** - Bar chart of most popular manufacturers
- **CAFV Eligibility** - Doughnut chart of eligibility status

### Search & Analysis

- **County Search** - Find vehicles by county with pagination
- **Make/Model Search** - Explore models by manufacturer
- **Custom Analysis** - Group by make, model year, or county with filters

---

## 🖥️ Running the Application

### Start All Services

**Terminal 1 - MongoDB:**

```bash
docker start mongodb
```

**Terminal 2 - API:**

```bash
cd Phase-2
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 3 - Frontend:**

```bash
cd frontend
npm run dev
```

### Access Points

| Service            | URL                         |
| ------------------ | --------------------------- |
| Frontend Dashboard | http://localhost:5173       |
| API                | http://127.0.0.1:8000       |
| API Documentation  | http://127.0.0.1:8000/docs  |
| ReDoc              | http://127.0.0.1:8000/redoc |

---

## 📊 Data Schema

### MongoDB Document Structure

```json
{
  "vin_prefix": "5YJ3E1EB9J",
  "location": {
    "state": "WA",
    "county": "King",
    "city": "Seattle",
    "postal_code": 98101,
    "census_tract_2020": 53033005302,
    "legislative_district": 43
  },
  "vehicle": {
    "model_year": 2023,
    "make": "TESLA",
    "model": "MODEL 3",
    "ev_type": "Battery Electric Vehicle (BEV)",
    "cafv_eligibility": "Clean Alternative Fuel Vehicle Eligible",
    "electric_range": 272,
    "vehicle_location": "POINT (-122.335167 47.608013)"
  },
  "electric_utility": "Seattle City Light",
  "dol_vehicle_id": 123456789
}
```

### Indexes

- `location.county` - For county-based queries
- `vehicle.make` - For manufacturer lookups
- `vehicle.model_year` - For year-based filtering

---

## 🧪 Testing

### API Testing

```bash
# Using the Swagger UI
open http://127.0.0.1:8000/docs

# Using cURL
curl http://127.0.0.1:8000/api/v1/vehicles/summary
```

### Frontend Testing

```bash
cd frontend
npm run test
```

---

## 📝 API Response Examples

### Summary Response

```json
{
  "total_vehicles": 271113,
  "ev_type_counts": [
    { "_id": "Battery Electric Vehicle (BEV)", "count": 212345 },
    { "_id": "Plug-in Hybrid Electric Vehicle (PHEV)", "count": 58768 }
  ],
  "top_makes": [
    { "_id": "TESLA", "count": 95000 },
    { "_id": "NISSAN", "count": 25000 }
  ],
  "average_electric_range": 39.89,
  "cafv_counts": [
    { "_id": "Clean Alternative Fuel Vehicle Eligible", "count": 150000 }
  ]
}
```

### Analyze Response

```json
[
  {
    "_id": "KING",
    "count": 133815,
    "avg_electric_range": 42.5,
    "most_common_vehicle": "MODEL 3"
  },
  {
    "_id": "SNOHOMISH",
    "count": 33766,
    "avg_electric_range": 38.2,
    "most_common_vehicle": "MODEL Y"
  }
]
```

---

## 🔒 CORS Configuration

The API allows requests from:

- `http://localhost:5173`
- `http://127.0.0.1:5173`

To add more origins, update `app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://your-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## ⚠️ Known Limitations

- County and Make names are case-insensitive (converted to uppercase)
- Maximum recommended results per page: 1000
- Some documents may have null location fields
- Electric range of 0 indicates data not available

---

## 🛠️ Troubleshooting

### MongoDB Connection Failed

```bash
# Check if MongoDB is running
docker ps | grep mongodb

# Start MongoDB
docker start mongodb
```

### API Not Responding

```bash
# Check if port 8000 is in use
lsof -i :8000

# Restart the API
pkill -f uvicorn
uvicorn app.main:app --reload
```

### Frontend Can't Connect to API

1. Ensure API is running on port 8000
2. Check CORS settings in `app/main.py`
3. Verify the API URL in `frontend/src/api.js`

---

## 📄 License

This project is for educational purposes as part of the UnifiedAI assignment.

---

## 👤 Author

Karan Choudhary

---

## 🙏 Acknowledgments

- Washington State Department of Licensing for the dataset
- FastAPI documentation
- React and Vite communities
