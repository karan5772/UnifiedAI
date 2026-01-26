import os
import logging
import subprocess
import tempfile
from multiprocessing import Pool, cpu_count
import math


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


LINES_PER_SPLIT = 100_000  # for records
BATCH_SIZE = 10_000        # for mongo

def get_csv_header(csv_path: str) -> str:
    with open(csv_path, 'r') as f:
        return f.readline()


def count_lines(csv_path: str) -> int:
    result = subprocess.run(
        ['wc', '-l', csv_path],
        capture_output=True,
        text=True
    )
    return int(result.stdout.strip().split()[0])

def split_csv_file(csv_path: str, output_dir: str, lines_per_file: int = LINES_PER_SPLIT) -> list[str]:
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"CSV file not found: {csv_path}")

    os.makedirs(output_dir, exist_ok=True)

    header = get_csv_header(csv_path)
    
    
    total_lines = count_lines(csv_path) - 1 
    total_splits = math.ceil(total_lines / lines_per_file)
    
    logger.info(f"Total rows: {total_lines}")
    logger.info(f"Splitting into {total_splits} files with {lines_per_file} rows each")

    # Use tail to skip header, then split
    split_prefix = os.path.join(output_dir, "chunk_")
    
    # Create split files without header first
    subprocess.run(
        f'tail -n +2 "{csv_path}" | split -l {lines_per_file} -d -a 4 - "{split_prefix}"',
        shell=True,
        check=True
    )

    # Get all split files and add headers
    split_files = sorted([
        os.path.join(output_dir, f) 
        for f in os.listdir(output_dir) 
        if f.startswith("chunk_")
    ])

    for split_file in split_files:
        with open(split_file, 'r') as f:
            content = f.read()
        with open(split_file + '.csv', 'w') as f:
            f.write(header)
            f.write(content)
        
        os.remove(split_file)


    split_files = sorted([
        os.path.join(output_dir, f)
        for f in os.listdir(output_dir)
        if f.endswith('.csv')
    ])

    logger.info(f"Created {len(split_files)} split files")
    return split_files



def transform_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    # logger.info("Validating and transforming data")

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

def process_and_insert(args: tuple) -> dict:
    file_path, mongo_uri, db_name, collection_name = args
    
    logger.info(f"Processing: {os.path.basename(file_path)}")
    
    try:
        df = pd.read_csv(file_path)
        records = transform_dataframe(df)
        
        client = MongoClient(mongo_uri)
        collection = client[db_name][collection_name]
        
        inserted = 0
        for i in range(0, len(records), BATCH_SIZE):
            batch = records[i:i + BATCH_SIZE]
            try:
                collection.insert_many(batch, ordered=False)
                inserted += len(batch)
            except BulkWriteError as e:
                inserted += e.details.get('nInserted', 0)
        
        client.close()
        
        return {
            "file": os.path.basename(file_path),
            "status": "success",
            "processed": len(records),
            "inserted": inserted
        }
        
    except Exception as e:
        logger.error(f"Failed: {file_path} - {e}")
        return {
            "file": os.path.basename(file_path),
            "status": "error",
            "error": str(e)
        }
    

def create_indexes(mongo_uri: str, db_name: str, collection_name: str):
    logger.info("Creating indexes...")
    
    client = MongoClient(mongo_uri)
    collection = client[db_name][collection_name]
    
    collection.create_index("location.state")
    collection.create_index("location.county")
    collection.create_index("location.city")
    collection.create_index("vehicle.model_year")
    collection.create_index("vehicle.make")
    collection.create_index("vehicle.ev_type")
    collection.create_index([
        ("location.state", ASCENDING),
        ("vehicle.model_year", ASCENDING)
    ])
    
    client.close()
    logger.info("Indexes created")

def run_pipeline_parallel(
    csv_path: str,
    mongo_uri: str = os.getenv("MONGO_URI"),
    db_name: str = "ev_data",
    collection_name: str = "vehicles",
    num_workers: int = None,
):
    if num_workers is None:
        num_workers = cpu_count()

    logger.info(f"Starting parallel pipeline with {num_workers} workers")

    # temprary dir
    temp_dir = tempfile.mkdtemp(prefix="csv_splits_")
    logger.info(f"Temp directory: {temp_dir}")

    split_files = split_csv_file(csv_path, temp_dir)

    # process and insert to mongo
    args_list = [
        (f, mongo_uri, db_name, collection_name)
        for f in split_files
    ]
    results = []
    with Pool(processes=num_workers) as pool:
        results = pool.map(process_and_insert, args_list)

    total_processed = sum(r.get("processed", 0) for r in results)
    total_inserted = sum(r.get("inserted", 0) for r in results)
    failed = [r for r in results if r["status"] == "error"]

    logger.info(f"Processed: {total_processed} records")
    logger.info(f"Inserted: {total_inserted} records")
        
    if failed:
        logger.warning(f"Failed files: {len(failed)}")
        for f in failed:
            logger.warning(f"  - {f['file']}: {f.get('error')}")

    create_indexes(mongo_uri, db_name, collection_name)


if __name__ == "__main__":
    run_pipeline_parallel(
        csv_path="Electric_Vehicle_Population_Data.csv",
        num_workers=2
    )