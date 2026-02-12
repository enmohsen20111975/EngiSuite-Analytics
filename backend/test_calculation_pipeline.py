#!/usr/bin/env python3
"""
Test script for calculation pipeline system.
"""

import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import asyncio
import httpx
from calculation_pipeline.migration import main as migration_main
from calculation_pipeline.engine import CalculationEngine
from workflow_database import get_workflow_db


async def test_pipeline_api():
    """Test the calculation pipeline API endpoints"""
    base_url = "http://localhost:8000"
    
    try:
        # Test 1: Get all pipelines
        print("1. Testing GET /calculation-pipelines/")
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{base_url}/calculation-pipelines/")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Success: Found {len(data['pipelines'])} pipelines")
                for pipeline in data['pipelines']:
                    print(f"   - {pipeline['name']} ({pipeline['domain']})")
            else:
                print(f"   ❌ Failed: {response.status_code} - {response.text}")
        
        # Test 2: Get domains
        print("\n2. Testing GET /calculation-pipelines/domains")
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{base_url}/calculation-pipelines/domains")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Success: Available domains: {', '.join(data['domains'])}")
            else:
                print(f"   ❌ Failed: {response.status_code} - {response.text}")
        
        # Test 3: Get standards
        print("\n3. Testing GET /calculation-pipelines/standards")
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{base_url}/calculation-pipelines/standards")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Success: Found {len(data['standards'])} standards")
                for std in data['standards']:
                    print(f"   - {std['name']} ({std['domain']})")
            else:
                print(f"   ❌ Failed: {response.status_code} - {response.text}")
        
        # Test 4: Test pipeline execution (requires a running server)
        print("\n4. Testing POST /calculation-pipelines/[pipeline-id]/execute")
        # This test will fail if the server isn't running
        try:
            async with httpx.AsyncClient() as client:
                # Try to execute a pipeline (will fail if server isn't running)
                response = await client.post(
                    f"{base_url}/calculation-pipelines/electrical_load_analysis/execute",
                    json={"inputs": {"voltage": 220, "power": 1000, "power_factor": 0.85}}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"   ✅ Success: Pipeline executed")
                    print(f"   - Execution ID: {data['execution_id']}")
                    print(f"   - Status: {data['status']}")
                else:
                    print(f"   ❌ Failed: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"   ℹ️  Server not reachable: {e}")
        
        print("\n✅ API tests completed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Error in API tests: {e}")
        return False


def test_engine():
    """Test the calculation engine directly"""
    print("Testing CalculationEngine...")
    
    try:
        # Create a test engine instance
        db = next(get_workflow_db())
        engine = CalculationEngine(db)
        
        # Test pipeline loading
        print("\n1. Testing pipeline loading")
        pipeline = engine.load_pipeline("electrical_load_analysis")
        if pipeline:
            print(f"   ✅ Found pipeline: {pipeline.name}")
            print(f"   - Domain: {pipeline.domain}")
            print(f"   - Standard: {pipeline.standard.standard_code if pipeline.standard else 'None'}")
        else:
            print("   ❌ Pipeline not found")
        
        # Test dependency graph building
        print("\n2. Testing dependency graph")
        if pipeline:
            try:
                G = engine.build_dependency_graph(pipeline)
                print(f"   ✅ Graph built with {len(G.nodes)} steps and {len(G.edges)} dependencies")
                
                # Check if it's a DAG
                if engine._is_dag(G):
                    print(f"   ✅ Graph is a valid DAG")
                else:
                    print(f"   ❌ Graph has cycles")
            except Exception as e:
                print(f"   ❌ Error building graph: {e}")
        
        print("\n✅ Engine tests completed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Error in engine tests: {e}")
        return False


def test_migration():
    """Test the migration process"""
    print("Testing migration...")
    
    try:
        print("\nRunning migration...")
        migration_main()
        print("\n✅ Migration completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        return False


async def run_tests():
    """Run all tests"""
    print("=" * 60)
    print("CALCULATION PIPELINE SYSTEM TESTING")
    print("=" * 60)
    
    all_passed = True
    
    # Test migration
    print("\n" + "=" * 60)
    print("1. MIGRATION TESTS")
    print("=" * 60)
    if not test_migration():
        all_passed = False
        return
    
    # Test engine
    print("\n" + "=" * 60)
    print("2. ENGINE TESTS")
    print("=" * 60)
    if not test_engine():
        all_passed = False
    
    # Test API
    print("\n" + "=" * 60)
    print("3. API TESTS")
    print("=" * 60)
    if not await test_pipeline_api():
        all_passed = False
    
    print("\n" + "=" * 60)
    if all_passed:
        print("✅ ALL TESTS PASSED!")
    else:
        print("❌ SOME TESTS FAILED!")
    print("=" * 60)
    
    return all_passed


def print_usage():
    """Print usage information"""
    print("Usage: python test_calculation_pipeline.py [options]")
    print("\nOptions:")
    print("  -m, --migrate  Run migration only")
    print("  -e, --engine   Run engine tests only")
    print("  -a, --api      Run API tests only")
    print("  -h, --help     Show this help message")
    print("\nExamples:")
    print("  python test_calculation_pipeline.py       # Run all tests")
    print("  python test_calculation_pipeline.py -m    # Run migration only")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Test calculation pipeline system")
    parser.add_argument("-m", "--migrate", action="store_true", help="Run migration only")
    parser.add_argument("-e", "--engine", action="store_true", help="Run engine tests only")
    parser.add_argument("-a", "--api", action="store_true", help="Run API tests only")
    
    args = parser.parse_args()
    
    if args.migrate:
        test_migration()
    elif args.engine:
        test_engine()
    elif args.api:
        asyncio.run(test_pipeline_api())
    else:
        # Run all tests
        asyncio.run(run_tests())
