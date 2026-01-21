# Electric Vehicle Data API

## Overview

This project implements a RESTful API for querying and analyzing the Washington State Electric Vehicle Population dataset. Built with FastAPI and MongoDB, it provides endpoints for vehicle summaries, county-based queries, manufacturer analysis, and custom aggregations.

This corresponds to **Phase 2: REST API** of the assignment.

---

## API Endpoints

### 1. GET `/api/v1/vehicles/summary`

Returns overall statistics about the EV population.

**Response:**

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
    { "_id": "Clean Alternative Fuel Vehicle Eligible", "count": 150000 },
    { "_id": "Not eligible", "count": 121113 }
  ]
}
```

---

### 2. GET `/api/v1/vehicles/county/{county_name}`

Returns paginated vehicle records for a specific county.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| county_name | string | Yes | County name (case-insensitive) |
| page | int | No | Page number (default: 1) |
| per_page | int | No | Results per page (default: 20) |
| model_year | int | No | Filter by model year |
| sort_by | string | No | Field to sort by |

**Example:**

```bash
curl "http://127.0.0.1:8000/api/v1/vehicles/county/King?page=1&per_page=20&model_year=2023"
```

**Response:**

```json
{
  "total": 133815,
  "vehicles": [
    {
      "_id": "64abc123...",
      "vin_prefix": "5YJ3E1EB9J",
      "location": {
        "state": "WA",
        "county": "KING",
        "city": "Seattle"
      },
      "vehicle": {
        "model_year": 2023,
        "make": "TESLA",
        "model": "MODEL 3",
        "ev_type": "Battery Electric Vehicle (BEV)",
        "electric_range": 272
      }
    }
  ]
}
```

---

### 3. GET `/api/v1/vehicles/make/{make}`

Returns all models for a specific manufacturer with statistics.

**Example:**

```bash
curl "http://127.0.0.1:8000/api/v1/vehicles/make/tesla"
```

**Response:**

```json
{
  "models": [
    { "_id": "MODEL 3", "count": 45000, "avg_electric_range": 272.5 },
    { "_id": "MODEL Y", "count": 30000, "avg_electric_range": 303.0 },
    { "_id": "MODEL S", "count": 15000, "avg_electric_range": 348.0 }
  ],
  "most_popular": "MODEL 3"
}
```

---

### 4. POST `/api/v1/vehicles/analyze`

Custom aggregation endpoint for flexible data analysis.

**Request Body:**

```json
{
  "filters": {
    "makes": ["TESLA", "NISSAN"],
    "model_years": { "start": 2020, "end": 2024 },
    "min_electric_range": 100,
    "vehicle_type": "Battery Electric Vehicle (BEV)"
  },
  "group_by": "county"
}
```

**Group By Options:**

- `make` - Group by manufacturer
- `model_year` - Group by year
- `county` - Group by county

**Response:**

```json
[
  {
    "_id": "KING",
    "count": 45000,
    "avg_electric_range": 285.5,
    "most_common_vehicle": "MODEL 3"
  },
  {
    "_id": "SNOHOMISH",
    "count": 12000,
    "avg_electric_range": 275.2,
    "most_common_vehicle": "MODEL Y"
  }
]
```

---

## Project Structure

```
Phase-2/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI app and routes
│   ├── database.py      # MongoDB connection
│   ├── crud.py          # Database operations
│   ├── models.py        # Pydantic models
│   └── .env             # Environment variables
├── requirements.txt
└── README.md
```

---

## Data Schema

The API expects data in the following MongoDB schema (from Phase 1):

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
    "model_year": 2022,
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

---

## Requirements

### Python

- Python 3.12+

### Dependencies

```ini
fastapi==0.115.0
uvicorn==0.30.0
pymongo==4.6.1
python-dotenv==1.0.0
pydantic==2.5.0
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

---

## Running the API

1. **Ensure MongoDB is running:**

   ```bash
   docker exec -it mongodb mongosh
   ```

2. **Ensure Phase 1 data is loaded:**

   ```bash
   cd ../Phase-1
   python main.py
   ```

3. **Start the API server:**

   ```bash
   cd Phase-2
   uvicorn app.main:app --reload
   ```

4. **Access the API:**
   - API: http://127.0.0.1:8000
   - Swagger Docs: http://127.0.0.1:8000/docs
   - ReDoc: http://127.0.0.1:8000/redoc

---

## Testing with cURL

### Get Summary

```bash
curl -X GET http://127.0.0.1:8000/api/v1/vehicles/summary
```

### Get Vehicles by County

```bash
curl -X GET "http://127.0.0.1:8000/api/v1/vehicles/county/King?page=1&per_page=10"
```

### Get Models by Make

```bash
curl -X GET http://127.0.0.1:8000/api/v1/vehicles/make/tesla
```

### Custom Analysis

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

## Error Handling

| Status Code | Description                      |
| ----------- | -------------------------------- |
| 200         | Success                          |
| 400         | Bad Request (invalid parameters) |
| 404         | Not Found                        |
| 500         | Internal Server Error            |

**Error Response Format:**

```json
{
  "detail": "Error message description"
}
```

---

## Performance Considerations

- Uses MongoDB aggregation pipelines for efficient data processing
- Pagination support for large result sets
- Indexes from Phase 1 optimize query performance
- NaN values are cleaned before JSON serialization

---

## Known Limitations

- County names are case-insensitive (converted to uppercase)
- Make names are case-insensitive (converted to uppercase)
- Maximum 1000 results per page recommended
- Some documents may have null location fields (filtered in analysis)
