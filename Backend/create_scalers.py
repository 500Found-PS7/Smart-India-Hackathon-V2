import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import pickle

# Load your training data
df = pd.read_csv('./final_testing_data.csv')
df['datetime'] = pd.to_datetime(df['datetime'])

# Separate features and target
target_columns = ['DELHI', 'BRPL', 'BYPL', 'NDPL', 'NDMC', 'MES']
excluded_columns = target_columns + ['datetime']
feature_columns = [col for col in df.columns if col not in excluded_columns]

# Create and fit feature scaler
feature_scaler = MinMaxScaler()
feature_scaler.fit(df[feature_columns])

# Create and fit target scaler
target_scaler = MinMaxScaler()
target_data = df[['DELHI']]  # Using DELHI as target
target_scaler.fit(target_data)

# Save the scalers
with open('40fs.pkl', 'wb') as f:
    pickle.dump(feature_scaler, f)

with open('40ts.pkl', 'wb') as f:
    pickle.dump(target_scaler, f)

print("Scalers have been created and saved as '40fs.pkl' and '40ts.pkl'")

# Print some information about the scalers
print("\nFeature columns used:", feature_columns)
print("Number of features:", len(feature_columns))
print("\nTarget column used: DELHI")

# Verify the scalers work
test_features = df[feature_columns].iloc[0:1]
test_target = df[['DELHI']].iloc[0:1]

scaled_features = feature_scaler.transform(test_features)
scaled_target = target_scaler.transform(test_target)

print("\nTest scaling:")
print("Original features shape:", test_features.shape)
print("Scaled features shape:", scaled_features.shape)
print("Original target shape:", test_target.shape)
print("Scaled target shape:", scaled_target.shape) 