from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import numpy as np
import pickle
import pandas as pd
from datetime import datetime, timedelta

# Load the CSV data once when the app starts
historical_data = pd.read_csv('./final_test.csv')
historical_data["datetime"] = pd.to_datetime(historical_data["datetime"])
historical_data.set_index("datetime", inplace=True)

def create_input_sequences(timestamp, feature_scaler, sequence_length=24):
    """
    Create input sequences for a model from a given timestamp.
    
    Parameters:
    - timestamp (str): The input timestamp in ISO format
    - feature_scaler: The scaler used to normalize the features
    - sequence_length (int): The length of each input sequence
    
    Returns:
    - X_sequences (np.ndarray): The array of input sequences for the model
    """
    # Convert timestamp to datetime
    end_time = pd.to_datetime(timestamp)
    
    # Calculate start time (24 hours before the input timestamp)
    start_time = end_time - timedelta(hours=sequence_length)
    
    # Get the data for the 24-hour window from historical data
    mask = (historical_data.index >= start_time) & (historical_data.index <= end_time)
    sequence_data = historical_data[mask]
    
    # Check if we have enough data
    if len(sequence_data) < sequence_length:
        raise ValueError(f"Not enough historical data available for the requested time period. Need {sequence_length} hours of data.")
    
    # Ensure we have the correct features
    sequence_data = sequence_data[feature_scaler.feature_names_in_]
    
    # Scale the data
    scaled_data = feature_scaler.transform(sequence_data)
    
    # Convert to array and reshape for model input
    X_sequences = np.array([scaled_data])
    
    return X_sequences

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
        if not data or 'datetime' not in data:
            print("Error: No datetime provided in input data.")
            return jsonify({'error': 'Please provide datetime in the request'}), 400

        try:
            # Create input sequences using the provided datetime
            input_data = create_input_sequences(data['datetime'], feature_scalar)
            
            # Make prediction
            print("Making predictions...")
            prediction = model.predict(input_data)
            prediction = target_scalar.inverse_transform(prediction)
            
            # Get the timestamp for the prediction
            prediction_timestamp = pd.to_datetime(data['datetime'])
            
            return jsonify({
                'success': True,
                'timestamp': prediction_timestamp.isoformat(),
                'prediction': prediction.tolist() if isinstance(prediction, np.ndarray) else prediction
            })
            
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
