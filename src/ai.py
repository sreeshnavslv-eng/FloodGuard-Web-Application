

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.metrics import mean_squared_error


df = pd.read_excel("the_excel.xlsx", engine="openpyxl")

#drop rows with time_slice ='equilibrium'
df = df[df['Time_Slice'] != 'Equilibrium']



X = df[['BLS Region', 'CO2 effects','Time_Slice','Adapt- ation']]  # BLS Region, Scenario, Time_Slice, CO2 effects, CO2 ppm
# Targets: last 4 columns
y = df[['wheat', 'rice', 'coarse grains', 'protein feed']]

# Convert Time_Slice to numerical
X['Time_Slice'] = pd.to_numeric(X['Time_Slice'], errors='coerce')

# Handle missing values in Time_Slice
X['Time_Slice'] = X['Time_Slice'].fillna(X['Time_Slice'].median())

# Clean adaptation levels - standardize the values
X['Adapt- ation'] = X['Adapt- ation'].str.strip()  # Remove whitespace
X['Adapt- ation'] = X['Adapt- ation'].replace({
    'Level 2': 'Level 2',
    'Level 1': 'Level 1', 
    'No Adaptation': 'No Adaptation',
    'No Adaption': 'No Adaptation',  # Fix typo
    'Level2': 'Level 2',  # Fix spacing
    'Level1': 'Level 1'   # Fix spacing
})

categorical_features = ['BLS Region', 'CO2 effects', 'Adapt- ation']
numerical_features = ['Time_Slice']  # Time_Slice is now numerical

preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features),
        ('num', StandardScaler(), numerical_features)
    ]
)


# MultiOutputRegressor allows predicting multiple targets at once
model = Pipeline([
    ('preprocessor', preprocessor),
    ('regressor', MultiOutputRegressor(RandomForestRegressor(n_estimators=100, random_state=42)))
])

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)



# Update preprocessor to exclude 'Scenario'
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features),
        ('num', StandardScaler(), numerical_features)
    ]
)

# Update model pipeline with new preprocessor
model = Pipeline([
    ('preprocessor', preprocessor),
    ('regressor', MultiOutputRegressor(RandomForestRegressor(n_estimators=100, random_state=42)))
])

model.fit(X_train, y_train)



y_pred = model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
print("Mean Squared Error:", mse)


sample_input = pd.DataFrame({
    'BLS Region': ['Brazil'],
    'Time_Slice': [2050],  # Numerical value
    'CO2 effects': ['Yes'],
    'Adapt- ation': ['Level 1']
})

prediction = model.predict(sample_input)
print("Predicted crop changes:", prediction)

# Function to make predictions with proper data handling
def make_prediction(country, time_slice, co2_effects, adaptation):
    """
    Make a prediction with proper data preprocessing
    """
    try:
        # Create input DataFrame with proper formatting
        input_data = pd.DataFrame({
            'BLS Region': [country],
            'Time_Slice': [int(time_slice)],  # Ensure it's an integer
            'CO2 effects': [co2_effects],
            'Adapt- ation': [adaptation]
        })
        
        # Make prediction
        prediction = model.predict(input_data)
        
        # Format results
        crops = ['wheat', 'rice', 'coarse grains', 'protein feed']
        results = {}
        for i, crop in enumerate(crops):
            results[crop] = round(prediction[0][i], 2)
        
        return results
        
    except Exception as e:
        print(f"Error making prediction: {e}")
        return None

# Test the function
test_results = make_prediction('Brazil', 2050, 'Yes', 'Level 1')
if test_results:
    print("Test prediction results:", test_results)

