# Electric Vehicle Population Data Pipeline

## Overview

This project implements a data ingestion pipeline for the Washington State
Electric Vehicle Population dataset. The pipeline reads a local CSV file,
validates and transforms the data, and loads it into MongoDB with an
analytics-friendly schema and indexes.

This corresponds to **Phase 1: Data Pipeline** of the assignment.

---

## Dataset

**File:** `Electric_Vehicle_Population_Data.csv`  
**Records:** ~270,000  
**Geography:** Washington State

### Source Columns

- VIN (1-10)
- County
- City
- State
- Postal Code
- Model Year
- Make
- Model
- Electric Vehicle Type
- Clean Alternative Fuel Vehicle (CAFV) Eligibility
- Electric Range
- Legislative District
- DOL Vehicle ID
- Vehicle Location
- Electric Utility
- 2020 Census Tract

---

## Pipeline Flow

CSV (Local File)
→
Validation & Cleaning (Pandas)
→
Transformation
→
MongoDB Collection + Indexes

---

## Validation & Transformation

### Required Fields

Rows missing any of the following are dropped:

- VIN (1-10)
- State
- Model Year
- Make
- Model
- Electric Vehicle Type

### Data Type Handling

- Numeric fields are coerced using `pd.to_numeric(errors="coerce")`
- Invalid numeric values are converted to null
- String fields are trimmed and normalized

### Normalization Rules

- Make → uppercased
- State → uppercased
- Model → trimmed

---

## MongoDB Schema

Each document represents one registered electric vehicle.

```json
{
  "vin_prefix": "1N4BZ0",
  "location": {
    "state": "WA",
    "county": "King",
    "city": "Seattle",
    "postal_code": "98101",
    "census_tract_2020": "53033005302",
    "legislative_district": 43
  },
  "vehicle": {
    "model_year": 2022,
    "make": "TESLA",
    "model": "Model 3",
    "ev_type": "Battery Electric Vehicle (BEV)",
    "cafv_eligibility": "Clean Alternative Fuel Vehicle Eligible",
    "electric_range": 272,
    "vehicle_location": "POINT (-122.335167 47.608013)"
  },
  "electric_utility": "Seattle City Light",
  "dol_vehicle_id": 123456789
}
```

// ...existing code...

## Schema Design Rationale

- Nested structure groups related attributes
- Optimized for aggregation queries
- Easy to extend with additional fields

---

## Indexing Strategy

The following indexes are created:

```
location.state
location.county
location.city
vehicle.model_year
vehicle.make
vehicle.ev_type
(location.state, vehicle.model_year)
```

These indexes support:

- EV adoption trends by year
- City / county level aggregation
- Manufacturer and vehicle-type analysis

---

## Requirements

### Python

- Python 3.9+

### Dependencies

```ini
pandas==2.1.4
pymongo==4.6.1
python-dotenv==1.0.0
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## Running the Pipeline

1. **Start MongoDB:**

   ```bash
   mongod
   ```

2. **Ensure the CSV file is present:**

   ```
   Electric_Vehicle_Population_Data.csv
   ```

3. **Run the pipeline:**

   ```bash
   python pipeline.py
   ```

The default MongoDB connection is:

```
mongodb://localhost:27017
```

---

## Error Handling & Logging

- Missing required columns cause the pipeline to fail fast
- Invalid numeric values are safely coerced
- Bulk insert errors are logged without stopping execution
- Logging reports row counts and index creation

---

## Assumptions

- Each row represents one EV registration
- VIN (1-10) is sufficient for analytics purposes
- Some location fields may be missing
- Data is append-only for Phase 1

---

## Future Enhancements

- FastAPI analytics endpoints
- MongoDB aggregation pipelines
- Dockerized deployment
- Data quality metrics and reporting
