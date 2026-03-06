import os
import random
import csv
import logging
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, Path

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/datasets", tags=["datasets"])

# Define path to Datasets directory
DATASETS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "Datasets")

# Fallback sample data if no CSV datasets found
FALLBACK_SAMPLES = {
    "spam": [
        "URGENT!!! Your account is BLOCKED. Verify now: bit.ly/verify-account. Limited time!",
        "Congratulations! You won £1000! Claim now: http://prize-claim.xyz/winner?id=123",
        "Free money waiting for you. Click here: tinyurl.com/free-cash",
        "Hey, how are you doing? Haven't talked in a while!",
        "Thanks for sending the documents. I'll review them by tomorrow.",
    ],
    "phishing": [
        "ALERT: Suspicious login from unknown device. Confirm your password: secure-sbi-verify.com/login",
        "Your Amazon order is ready. Track here: bit.ly/amazon-track",
        "PayPal security update required. Verify account: paypa1-secure.com",
        "SBI Bank: Your account will be closed. Update details: quick-sbi-update.xyz",
        "Google Security Alert. Confirm identity: accounts-google-verify.com",
    ],
    "jobs": [
        "You've been selected for a HIGH PAYING JOB! Work from home, earn Rs.50,000/month with no experience needed. Register now: quickjob-money.com",
        "Part time job opportunity! Earn daily. No investment required. WhatsApp: wa.me/919999999999",
        "Urgent: Hiring for work-from-home. Rs 30,000 weekly. Click: job-quick-earn.com",
        "Job opening: Senior Developer needed. Salary: $100k-120k. Please send resume to careers@techcompany.com",
        "Internship position open for engineering students. Apply at: company.com/careers",
    ]
}

def get_all_datasets() -> Dict[str, Dict[str, str]]:
    """Dynamically scan the Datasets directory for all CSV files."""
    dataset_map = {}
    if not os.path.exists(DATASETS_DIR):
        return dataset_map
        
    for root, _, files in os.walk(DATASETS_DIR):
        for file in files:
            if file.endswith('.csv'):
                # Extract clean name for ID (e.g. from 'spam_ham_india.csv' to 'spam_ham_india')
                dataset_id = os.path.splitext(file)[0].lower()
                # Create a readable name path 
                rel_dir = os.path.relpath(root, DATASETS_DIR)
                if rel_dir == ".": rel_dir = "root"
                
                dataset_map[dataset_id] = {
                    "path": os.path.join(root, file),
                    "folder": rel_dir
                }
    return dataset_map

@router.get("/")
async def list_datasets():
    """Returns a list of all dynamically discovered datasets + fallback samples"""
    dataset_map = get_all_datasets()
    available = []
    
    # Add CSV datasets
    for k, v in dataset_map.items():
        available.append({
            "id": k,
            "folder": v["folder"],
            "available": True,
            "path": v["path"],
            "source": "csv"
        })
    
    # Add fallback samples
    for k in FALLBACK_SAMPLES.keys():
        available.append({
            "id": k,
            "folder": "fallback",
            "available": True,
            "path": "memory",
            "source": "fallback"
        })
    
    return {"datasets": available, "total": len(available)}

@router.get("/{dataset_type}/sample")
async def get_dataset_sample(dataset_type: str = Path(..., description="The ID (filename without extension) of dataset to sample from")):
    """Returns a random row sample formatted as text from the dynamically discovered CSV or fallback data."""
    
    dataset_map = get_all_datasets()
    
    # Try to load from CSV first, fallback to sample data
    if dataset_type in dataset_map:
        config = dataset_map[dataset_type]
        file_path = config["path"]
        
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
                
                # Smart text extraction logic: find the longest text field in the row
                valid_texts = [str(cell) for cell in random_row if len(str(cell).strip()) > 3]
                if valid_texts:
                    text_content = max(valid_texts, key=len)
                else:
                    text_content = " | ".join(random_row)
                
                row_dict = dict(zip(headers, random_row))
                
                if len(text_content) > 1000:
                    text_content = text_content[:1000] + "... [truncated]"

                result = {
                    "dataset": dataset_type,
                    "text": text_content,
                    "metadata": row_dict,
                    "source": "csv"
                }
                return result
        except FileNotFoundError:
            logger.warning(f"CSV file not found for {dataset_type}, using fallback data")
        except Exception as e:
            logger.error(f"Error reading dataset {dataset_type} at {file_path}: {e}")
    
    # Use fallback sample data if CSV not available or for known types
    if dataset_type in FALLBACK_SAMPLES:
        text_content = random.choice(FALLBACK_SAMPLES[dataset_type])
        result = {
            "dataset": dataset_type,
            "text": text_content,
            "metadata": {"source": "fallback_sample"},
            "source": "fallback"
        }
        return result
    
    # If dataset not found anywhere, return error with available types
    available_types = list(FALLBACK_SAMPLES.keys())
    if dataset_map:
        available_types.extend(list(dataset_map.keys()))
    
    raise HTTPException(
        status_code=404, 
        detail=f"Dataset '{dataset_type}' not found. Available: {', '.join(available_types)}"
    )
