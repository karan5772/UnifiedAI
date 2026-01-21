import os
import logging
from typing import Optional


import pandas as pd
from pymongo import MongoClient, ASCENDING
from pymongo.errors import BulkWriteError

from dotenv import load_dotenv
load_dotenv() 


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

REQUIRED_COLUMNS = [
    "VIN (1-10)",
    "State",
    "Model Year",
    "Make",
    "Model",
    "Electric Vehicle Type"
]

NUMERIC_COLUMNS = [
    "Model Year",
    "Electric Range",
    "Legislative District",
    "DOL Vehicle ID"
]

def load_csv(csv_path: str) -> pd.DataFrame:
   
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"CSV file not found: {csv_path}")

    logger.info(f"Loading CSV from {csv_path}")
    df = pd.read_csv(csv_path)
    logger.info(f"Loaded {len(df)} rows")
    return df


def validate_and_transform(df: pd.DataFrame) -> pd.DataFrame:
    logger.info("Validating and transforming data")

    for col in REQUIRED_COLUMNS:
        if col not in df.columns:
            raise ValueError(f"Missing required column: {col}")

    # i have dropped the rows that miss required fields
    df = df.dropna(subset=REQUIRED_COLUMNS)

    # fill missing or Nan numeric fields with 0
    for col in NUMERIC_COLUMNS:
        if col in df.columns:
            if col == "Electric Range":
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)
            else:
                df[col] = pd.to_numeric(df[col], errors="coerce")

    df["Make"] = df["Make"].str.strip().str.upper()
    df["Model"] = df["Model"].str.strip()
    df["State"] = df["State"].str.strip().str.upper()
    df["County"] = df["County"].str.strip().str.upper()



    records = []
    for _, row in df.iterrows():
        doc = {
            "vin_prefix": row["VIN (1-10)"],

            "location": {
                "state": row["State"],
                "county": row.get("County"),
                "city": row.get("City"),
                "postal_code": row.get("Postal Code"),
                "census_tract_2020": row.get("2020 Census Tract"),
                "legislative_district": row.get("Legislative District")
            },

            "vehicle": {
                "model_year": int(row["Model Year"]),
                "make": row["Make"],
                "model": row["Model"],
                "ev_type": row["Electric Vehicle Type"],
                "cafv_eligibility": row.get(
                    "Clean Alternative Fuel Vehicle (CAFV) Eligibility"
                ),
                "electric_range": row.get("Electric Range"),
                "vehicle_location": row.get("Vehicle Location")
            },

            "electric_utility": row.get("Electric Utility"),
            "dol_vehicle_id": row.get("DOL Vehicle ID")
        }

        records.append(doc)

    logger.info(f"Transformed {len(records)} records")
    return records



def load_to_mongo(
    records: list[dict],
    mongo_uri: str,
    db_name: str = "ev_data",
    collection_name: str = "vehicles"
):
    logger.info("Connecting to MongoDB")
    client = MongoClient(mongo_uri)
    collection = client[db_name][collection_name]

    try:
        collection.insert_many(records, ordered=False)
        logger.info(f"Inserted {len(records)} records")
    except BulkWriteError as e:
        logger.warning("Bulk insert completed with some duplicate errors")

    logger.info("Creating indexes")

    collection.create_index("location.state")
    collection.create_index("location.county")
    collection.create_index("location.city")
    collection.create_index("vehicle.model_year")
    collection.create_index("vehicle.make")
    collection.create_index("vehicle.ev_type")
    collection.create_index(
        [("location.state", ASCENDING), ("vehicle.model_year", ASCENDING)]
    )

    logger.info("Indexes created")

def run_pipeline(
    csv_path: str,
    mongo_uri: str = os.getenv("MONGO_URL")
):
    df = load_csv(csv_path)
    records = validate_and_transform(df)
    load_to_mongo(records, mongo_uri)


if __name__ == "__main__":
    run_pipeline("Electric_Vehicle_Population_Data.csv")
