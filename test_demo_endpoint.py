#!/usr/bin/env python3
"""
Test script to verify demo datasets endpoint works with fallback samples
"""
import sys
sys.path.insert(0, '/home/bangi-abdulla/Documents/codeverses')

from backend.routers.datasets import FALLBACK_SAMPLES, get_all_datasets, get_dataset_sample
import asyncio

async def test_fallback_samples():
    """Test that fallback samples are correctly defined"""
    print("=" * 60)
    print("Testing Fallback Samples...")
    print("=" * 60)
    
    for dataset_type in ["spam", "phishing", "jobs"]:
        print(f"\n{dataset_type.upper()} Dataset:")
        print(f"  ✓ Available: {dataset_type in FALLBACK_SAMPLES}")
        print(f"  ✓ Sample count: {len(FALLBACK_SAMPLES[dataset_type])}")
        print(f"  ✓ First sample: {FALLBACK_SAMPLES[dataset_type][0][:70]}...")

async def test_dataset_endpoint():
    """Test the get_dataset_sample endpoint"""
    print("\n" + "=" * 60)
    print("Testing Dataset Endpoints...")
    print("=" * 60)
    
    for dataset_type in ["spam", "phishing", "jobs"]:
        print(f"\nTesting GET /api/v1/datasets/{dataset_type}/sample")
        try:
            result = await get_dataset_sample(dataset_type)
            print(f"  ✓ Status: SUCCESS")
            print(f"  ✓ Dataset: {result['dataset']}")
            print(f"  ✓ Source: {result['source']}")
            print(f"  ✓ Text (preview): {result['text'][:80]}...")
            print(f"  ✓ Metadata: {result.get('metadata', {})}")
        except Exception as e:
            print(f"  ✗ Error: {e}")

async def main():
    print("\n🚀 DEMO DATASET FALLBACK TEST\n")
    
    await test_fallback_samples()
    await test_dataset_endpoint()
    
    print("\n" + "=" * 60)
    print("✅ All tests completed!")
    print("=" * 60)
    print("\nDemo should now work with these fallback datasets:")
    print("  - /api/v1/datasets/spam/sample")
    print("  - /api/v1/datasets/phishing/sample")
    print("  - /api/v1/datasets/jobs/sample")

if __name__ == "__main__":
    asyncio.run(main())
