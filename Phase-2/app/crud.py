from .database import vehicles_collection
from pymongo import ASCENDING, DESCENDING
from bson.son import SON
import math

def get_summary():
    bev_phev = list(vehicles_collection.aggregate(
        [
        {
            "$group": {
                "_id": "$vehicle.ev_type", "count": {
                    "$sum": 1
                }
            }
        },
    ]
    ))

    top_makes = list(vehicles_collection.aggregate(
        [
            {
                "$group": {
                    "_id": "$vehicle.make", "count": {
                        "$sum": 1
                    }
                }
            },
            {
                "$sort": {
                    "count": -1
                }
            },
            {
                "$limit": 10
            }
    ]))

    avg_range_val = list(vehicles_collection.aggregate([
        {
            "$group": {
                "_id": None, "avg_range": {
                    "$avg": "$vehicle.electric_range"
                }
            }
        }
    ]))[0]["avg_range"]

    cafv_counts = list(vehicles_collection.aggregate([
        {
            "$group": {
                "_id": "$vehicle.cafv_eligibility", 
                "count": {
                    "$sum": 1
                }
            }
        },
        {
            "$sort":{
                "count": -1
            }
        }
    ])) or []

    total_vehicles = vehicles_collection.count_documents({})

    return {
        "total_vehicles": total_vehicles,
        "ev_type_counts": bev_phev,
        "top_makes": top_makes,
        "average_electric_range": avg_range_val,
        "cafv_counts": cafv_counts
    }

def get_vehicles_by_county(county_name, page=1, per_page=20, model_year=None, sort_by=None):
    county_name = county_name.upper()
    query = {"location.county": county_name}
    if model_year:
        query["vehicle.model_year"] = model_year

    sort_list = []
    if sort_by:
        for field in sort_by:
            sort_list.append((f"vehicle.{field}", ASCENDING))

    cursor = vehicles_collection.find(query)
    if sort_list:
        cursor = cursor.sort(sort_list)
    total = vehicles_collection.count_documents(query)
    cursor = cursor.skip((page-1)*per_page).limit(per_page)
    
    vehicles = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        vehicles.append(doc)
    
    return {"total": total, "vehicles": vehicles}

def get_models_by_make(make):
    make = make.upper()
    pipeline = [
        {
            "$match": {
                "vehicle.make": make
            }
        },
        {
            "$group": {
                "_id": "$vehicle.model",
                "count": {
                    "$sum": 1
                },
                "avg_electric_range": {
                    "$avg": "$vehicle.electric_range"
                }
            }
        },
        {
            "$sort": {
                "count": -1
            }
        }
    ]
    results = list(vehicles_collection.aggregate(pipeline))
    most_popular = results[0]["_id"] if results else None
    return {"models": results, "most_popular": most_popular}

def analyze_vehicles(filters, group_by):
    match_stage = {}
    if filters:
        if filters.makes:
            filters.makes = [m.upper() for m in filters.makes]
            match_stage["vehicle.make"] = {"$in": filters.makes}
        if filters.model_years:
            start = filters.model_years.get("start")
            end = filters.model_years.get("end")
            match_stage["vehicle.model_year"] = {"$gte": start, "$lte": end}
        if filters.min_electric_range:
            match_stage["vehicle.electric_range"] = {"$gte": filters.min_electric_range}
        if filters.vehicle_type:
            match_stage["vehicle.ev_type"] = filters.vehicle_type

    # Map group_by to correct nested path

    field_mapping = {
        "make": "vehicle.make",
        "model": "vehicle.model",
        "ev_type": "vehicle.ev_type",
        "model_year": "vehicle.model_year",
        "county": "location.county",
        "city": "location.city",
        "state": "location.state"
    }
    group_field = field_mapping.get(group_by, f"vehicle.{group_by}")

    pipeline = [
        {
            "$match": match_stage
        },
        {
            "$group": {
                "_id": f"${group_field}",
                "count": {"$sum": 1},
                "avg_electric_range": {"$avg": "$vehicle.electric_range"},
                "most_common_vehicle": {"$first": "$vehicle.model"}
            }
        },
        {
            "$sort": {
                "count": -1
            }
        }
    ]

    results = list(vehicles_collection.aggregate(pipeline))
    cleanedres = []
    for r in results:
        id_val = r.get("_id")
        if id_val is None:
            continue
        if isinstance(id_val, float) and math.isnan(id_val):
            continue
        
        cleanedres.append(r)
    
    return cleanedres
