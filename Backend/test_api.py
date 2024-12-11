import requests
import json
from datetime import datetime, timedelta

def test_prediction_api(start_datetime, end_datetime):
    """
    Test the prediction API by sending a POST request with start and end datetimes.
    
    Parameters:
    - start_datetime: Start datetime in ISO format
    - end_datetime: End datetime in ISO format
    """
    
    # API endpoint URL (local)
    url = "http://localhost:5000/predict"
    
    # Prepare the request payload
    payload = {
        "startDateTime": start_datetime,
        "endDateTime": end_datetime
    }
    
    # Set headers for JSON content
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        # Send POST request to the API
        print(f"\nSending request with payload: {json.dumps(payload, indent=2)}")
        response = requests.post(url, json=payload, headers=headers)
        
        # Check if request was successful
        if response.status_code == 200:
            result = response.json()
            print("\nSuccessful Response:")
            print(json.dumps(result, indent=2))
            
            # Print number of predictions received
            if 'predictions' in result:
                print(f"\nNumber of predictions: {len(result['predictions'])}")
        else:
            print(f"\nError Response (Status Code: {response.status_code}):")
            print(json.dumps(response.json(), indent=2))
            
    except requests.exceptions.ConnectionError:
        print("\nError: Could not connect to the server. Make sure the Flask app is running.")
    except Exception as e:
        print(f"\nError occurred: {str(e)}")

def main():
    # Test case 1: Test with a known date range from your dataset
    print("\nTest Case 1: Known date range from dataset")
    test_prediction_api(
        "2023-01-01T00:00:00",
        "2023-01-01T23:00:00"
    )
    
    
    # Test case 3: Test with invalid date range
    print("\nTest Case 3: Invalid date range (future dates)")
    test_prediction_api(
        "2024-06-01T00:00:00",
        "2024-06-02T00:00:00"
    )

if __name__ == "__main__":
    print("Starting API Tests...")
    main() 