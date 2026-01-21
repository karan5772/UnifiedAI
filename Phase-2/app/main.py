from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from .models import VehicleAnalyzeRequest, PaginationParams
from .crud import get_summary, get_vehicles_by_county, get_models_by_make, analyze_vehicles

app = FastAPI(title="EV Data API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/vehicles/summary")
def summary():
    try:
        return get_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/vehicles/county/{county_name}")
def vehicles_county(county_name: str, page: int = 1, per_page: int = 20,
                    model_year: int = Query(None),
                    sort_by: list[str] = Query(None)):
    try:
        return get_vehicles_by_county(county_name, page, per_page, model_year, sort_by)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/vehicles/make/{make}/models")
def models_by_make(make: str):
    try:
        return get_models_by_make(make)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/vehicles/analyze")
def analyze(request: VehicleAnalyzeRequest):
    try:
        return analyze_vehicles(request.filters, request.group_by)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
