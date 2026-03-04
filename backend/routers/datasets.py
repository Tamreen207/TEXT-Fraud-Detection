import os
import random
import csv
import logging
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, Path

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/datasets", tags=["datasets"])

# Define paths to existing datasets
DATASETS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "Datasets")

DATASET_MAP = {
    "jobs": {
        "path": os.path.join(DATASETS_DIR, "archive", "fake_real_job_postings_3000x25.csv"),
    },
    "spam": {
        "path": os.path.join(DATASETS_DIR, "archive (1)", "spam_ham_india.csv"),
    },
    "phishing": {
        "path": os.path.join(DATASETS_DIR, "archive (3)", "Phishing_Legitimate_full.csv"),
    }
}

@router.get("/")
async def list_datasets():
    """Returns a list of available configured datasets"""
    available = []
    for k, v in DATASET_MAP.items():
        exists = os.path.exists(v["path"])
        available.append({
            "id": k,
            "available": exists,
            "path": v["path"] if exists else "File not found"
        })
    return {"datasets": available}

@router.get("/{dataset_type}/sample")
async def get_dataset_sample(dataset_type: str = Path(..., description="The type of dataset to sample from")):
    """Returns a random row sample formatted as text from the specified dataset CSV."""
    
    if dataset_type not in DATASET_MAP:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_type}' not configured. Available: {list(DATASET_MAP.keys())}")
        
    config = DATASET_MAP[dataset_type]
    file_path = config["path"]
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Data file not found at {file_path}")

    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            reader = csv.reader(f)
            headers = next(reader, None)
            
            if not headers:
                raise HTTPException(status_code=500, detail="Empty CSV file")
                
            rows = list(reader)
            if not rows:
                raise HTTPException(status_code=500, detail="No data rows in CSV file")
                
            random_row = random.choice(rows)
            text_content = ""
            
            # Smart text extraction
            if dataset_type == "jobs":
                # idx 2 is description
                text_content = random_row[2] if len(random_row) > 3 else " | ".join(random_row)
            elif dataset_type == "spam":
                # India spam is generally text in col index 1
                text_content = random_row[1] if len(random_row) > 1 else random_row[0]
            else:
                # Phishing URLs might be in col 0 or 1
                text_content = random_row[1] if len(random_row) > 1 else " | ".join(random_row)
            
            row_dict = dict(zip(headers, random_row))
            
            if len(text_content) > 1000:
                text_content = text_content[:1000] + "... [truncated]"

            result = {
                "dataset": dataset_type,
                "text": text_content,
                "metadata": row_dict
            }
            return result
            
    except Exception as e:
        logger.error(f"Error reading dataset {dataset_type}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
