from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import numpy as np
import pickle
import pandas as pd
from datetime import datetime, timedelta

# Load the CSV data once when the app starts
historical_data = pd.read_csv('./final_testing_data.csv')
historical_data["datetime"] = pd.to_datetime(historical_data["datetime"])

# Exclude specified columns
excluded_columns = ['DELHI', 'BRPL', 'BYPL', 'NDPL', 'NDMC', 'MES', 'datetime']
feature_columns = [col for col in historical_data.columns if col not in excluded_columns]

# Set datetime as index after selecting required columns
historical_data = historical_data[['datetime'] + feature_columns]
historical_data.set_index("datetime", inplace=True)

def create_input_sequences(start_datetime, end_datetime, feature_scaler):
    """
    Create input sequences for a model from a given date range.
    
    Parameters:
    - start_datetime (str): The start timestamp in ISO format
    - end_datetime (str): The end timestamp in ISO format
    - feature_scaler: The scaler used to normalize the features
    
    Returns:
    - X_sequences (np.ndarray): The array of input sequences for the model
    """
    # Convert timestamps to datetime
    start_time = pd.to_datetime(start_datetime)
    end_time = pd.to_datetime(end_datetime)
    
    # Get the data for the specified time window from historical data
    mask = (historical_data.index >= start_time) & (historical_data.index <= end_time)
    sequence_data = historical_data[mask]
    
    # Check if we have data
    if len(sequence_data) == 0:
        raise ValueError(f"No data available for the requested time period between {start_time} and {end_time}")
    
    # Since we're using a Sequential model, we need to manually specify the features
    # These should match the features used during training
    model_features = [col for col in sequence_data.columns if col not in excluded_columns]
    sequence_data = sequence_data[model_features]
    
    # Scale the data
    scaled_data = feature_scaler.transform(sequence_data)
    
    # Convert to array and reshape for model input
    X_sequences = np.array([scaled_data])
    
    # Print debug information
    print(f"Sequence data shape: {sequence_data.shape}")
    print(f"Features used: {sequence_data.columns.tolist()}")
    print(f"Time range: {start_time} to {end_time}")
    
    return X_sequences, sequence_data.index

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains

# Load the model and scalers
try:
    with open('40fs.pkl', 'rb') as file:
        model = pickle.load(file)
    
    with open('40model.pkl', 'rb') as sfile:
        feature_scalar = pickle.load(sfile)

    with open('40ts.pkl', 'rb') as tfile:
        target_scalar = pickle.load(tfile)
        
except Exception as e:
    model = None
    print(f"Error loading model or scaler: {str(e)}")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        print("Received a request to the /predict endpoint.")

        # Check if model is loaded
        if model is None:
            print("Error: Model not loaded properly.")
            return jsonify({'error': 'Model not loaded properly'}), 500

        # Get input data from request
        data = request.get_json()
        print(f"Input data received: {data}")

        # Validate input data
        if not data or 'startDateTime' not in data or 'endDateTime' not in data:
            print("Error: Start or end datetime not provided in input data.")
            return jsonify({'error': 'Please provide both startDateTime and endDateTime in the request'}), 400

        try:
            # Create input sequences using the provided datetime range
            input_data, timestamps = create_input_sequences(
                data['startDateTime'], 
                data['endDateTime'], 
                feature_scalar
            )
            
            # Make prediction
            print("Making predictions...")
            predictions = model.predict(input_data)
            predictions = target_scalar.inverse_transform(predictions)
            
            # Create response with predictions for each timestamp
            response_data = {
                'success': True,
                'predictions': [
                    {
                        'timestamp': ts.isoformat(),
                        'value': float(pred)
                    }
                    for ts, pred in zip(timestamps, predictions[0])
                ]
            }
            
            return jsonify(response_data)
            
        except ValueError as ve:
            print(f"Value Error: {str(ve)}")
            return jsonify({'error': str(ve)}), 400
        except Exception as e:
            print(f"Error processing input: {str(e)}")
            return jsonify({'error': f'Error processing input: {str(e)}'}), 400

    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
