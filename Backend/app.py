<<<<<<< HEAD
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

def create_input_sequences(start_datetime, end_datetime, feature_scaler, sequence_length=12):
    """
    Create input sequences for the model from a given date range with 5-minute intervals.
    
    Parameters:
        start_datetime (str): The start datetime in 'YYYY-MM-DD HH:MM:SS' format.
        end_datetime (str): The end datetime in 'YYYY-MM-DD HH:MM:SS' format.
        feature_scaler (scaler object): Scaler to normalize the feature data.
        sequence_length (int): Number of 5-minute intervals to form a sequence (default: 12 for 1 hour).
    
    Returns:
        np.array: Input sequences for the model.
        pd.DatetimeIndex: Corresponding timestamps for sequences.
    """
    # Convert timestamps to datetime
    start_time = pd.to_datetime(start_datetime)
    end_time = pd.to_datetime(end_datetime)
    
    # Get the data for the specified time window
    mask = (historical_data.index >= start_time) & (historical_data.index <= end_time)
    sequence_data = historical_data.loc[mask]
    
    # Check if we have enough data
    if len(sequence_data) < sequence_length:
        raise ValueError(f"Insufficient data: At least {sequence_length} rows are required, but found {len(sequence_data)}.")

    # Handle missing timestamps by forward-filling or interpolating
    sequence_data = sequence_data.resample('5T').mean().interpolate()
    
    # Get features for the model
    sequence_data = sequence_data[feature_columns]  # Ensure 'feature_columns' are predefined
    
    # Scale the data
    scaled_data = feature_scaler.transform(sequence_data)
    
    # Create sequences
    X_sequences = []
    timestamps = []
    for i in range(len(scaled_data) - sequence_length + 1):
        X_sequences.append(scaled_data[i:i + sequence_length])
        timestamps.append(sequence_data.index[i + sequence_length - 1])  # Timestamp for the last step in the sequence

    X_sequences = np.array(X_sequences)
    
    # Debug information
    print(f"Processed sequence data shape: {sequence_data.shape}")
    print(f"Number of sequences created: {len(X_sequences)}")
    print(f"Sequence input shape for model: {X_sequences.shape}")
    
    return X_sequences, pd.DatetimeIndex(timestamps)

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains

# Load the model and scalers
try:
    # Load model and scalers from pkl files
    with open('40model.pkl', 'rb') as file:
        model = pickle.load(file)
    
    with open('40fs.pkl', 'rb') as f_file:
        feature_scalar = pickle.load(f_file)
    
    with open('40ts.pkl', 'rb') as t_file:
        target_scalar = pickle.load(t_file)
        
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
        print("////////////////////////////////////")
        # Validate input data
        if not data or 'startDateTime' not in data or 'endDateTime' not in data:
            print("Error: Start or end datetime not provided in input data.")
            return jsonify({'error': 'Please provide both startDateTime and endDateTime in the request'}), 400

        try:
            # Create input sequences using the provided datetime range
            input_sequences, timestamps = create_input_sequences(
                data['startDateTime'], 
                data['endDateTime'], 
                feature_scalar
            )
            
            # Make predictions
            print("Making predictions...")
            predictions = model.predict(input_sequences)
            
            # Inverse transform predictions
            predictions = target_scalar.inverse_transform(predictions.reshape(-1, 1))
            
            # Create response with predictions for each timestamp
            response_data = {
                'success': True,
                'predictions': [
                    {
                        'timestamp': ts.isoformat(),
                        'value': float(pred[0])  # Extract single value from prediction
                    }
                    for ts, pred in zip(timestamps, predictions)
                ],
                'metadata': {
                    'number_of_predictions': len(predictions),
                    'features_used': feature_columns,
                    'time_range': {
                        'start': timestamps[0].isoformat(),
                        'end': timestamps[-1].isoformat()
                    }
                }
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
=======
<<<<<<< HEAD
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import numpy as np
import pickle

import numpy as np
import pandas as pd


testing_data=pd.read_csv('./final_test.csv')
testing_data["datetime"]=pd.to_datetime(testing_data["datetime"])
testing_data.set_index("datetime",inplace=True)

def create_input_sequences(mydata, scaler, sequence_length=24):
    """
    Create input sequences for a model from scaled data.

    Parameters:
    - mydata (pd.DataFrame): The input data containing features and datetime index.
    - scaler (sklearn.preprocessing object): The scaler used to normalize the data.
    - sequence_length (int): The length of each input sequence.

    Returns:
    - X_sequences (np.ndarray): The array of input sequences for the model.
    """
    # Ensure the datetime column is the index
    if not isinstance(mydata.index, pd.DatetimeIndex):
        raise ValueError("The data must have a datetime index.")

    # Ensure filtered data matches scaler's expected features
    if not set(scaler.feature_names_in_).issubset(mydata.columns):
        raise ValueError("The data contains unexpected features not seen during training.")

    mydata = mydata[scaler.feature_names_in_]

    # Scale the data
    scaled_data = scaler.transform(mydata)

    # Create sequences
    X_sequences = []

    for i in range(len(scaled_data) - sequence_length + 1):
        X_sequences.append(scaled_data[i:i + sequence_length])

    # Convert to NumPy array
    X_sequences = np.array(X_sequences)

    return X_sequences

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains

# Load the model from pickle file
try:
    
    with open('model1.pkl', 'rb') as file:
        model = pickle.load(file)
    
    with open('feature_scaler.pkl', 'rb') as sfile:
        feature_scalar = pickle.load(sfile)

    with open('target_scaler.pkl', 'rb') as tfile:
        target_scalar = pickle.load(tfile)
        
except Exception as e:
    model = None
    print(f"Error loading model or scaler")


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

        # # Validate input data
        # if not data or 'input' not in data:
        #     print("Error: No input data provided.")
        #     return jsonify({'error': 'No input data provided'}), 400

        # Convert input data to appropriate format
        try:
            print("Creating input sequences...")
            input_data = create_input_sequences(testing_data, feature_scalar, 24)
            print("Input sequences created successfully.")

            print("Making predictions...")
            prediction = model.predict(input_data)
            prediction = target_scalar.inverse_transform(prediction)
            print(f"Prediction: {prediction}")

            # Return prediction as JSON
            return jsonify({
                'success': True,
                'prediction': prediction.tolist() if isinstance(prediction, np.ndarray) else prediction
            })
        except Exception as e:
            print(f"Error processing input: {str(e)}")
            return jsonify({'error': f'Error processing input: {str(e)}'}), 400

    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
=======
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
>>>>>>> 0f171d97c0f322672f5e2ad7b4f192dcf785d24e
>>>>>>> 415b7381d67c1838a4dab422fd2264effeb2d6d3
