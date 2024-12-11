import pickle

with open('40fs.pkl', 'rb') as file:
        model = pickle.load(file)
    
with open('40model.pkl', 'rb') as sfile:
    scalar = pickle.load(sfile)

with open('40ts.pkl', 'rb') as sfile:
    scalar = pickle.load(sfile)