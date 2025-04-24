import os
import joblib
import pickle
from scipy.sparse import load_npz

BASE_DIR = os.path.dirname(__file__)

def test_pickle_model(path):
    try:
        model = pickle.load(open(path, "rb"))
        print(f"✅ Successfully loaded pickle model: {os.path.basename(path)}")
        return model
    except Exception as e:
        print(f"❌ Failed to load pickle model: {os.path.basename(path)} - {e}")

def test_joblib_model(path):
    try:
        model = joblib.load(path)
        print(f"✅ Successfully loaded joblib model: {os.path.basename(path)}")
        return model
    except Exception as e:
        print(f"❌ Failed to load joblib model: {os.path.basename(path)} - {e}")

def test_sparse_matrix(path):
    try:
        matrix = load_npz(path)
        print(f"✅ Successfully loaded sparse matrix: {os.path.basename(path)}")
        return matrix
    except Exception as e:
        print(f"❌ Failed to load sparse matrix: {os.path.basename(path)} - {e}")

if __name__ == "__main__":
    test_pickle_model(os.path.join(BASE_DIR, "svdpp_model.pkl"))
    test_joblib_model(os.path.join(BASE_DIR, "tfidf_vectorizer.pkl"))
    test_joblib_model(os.path.join(BASE_DIR, "nn_model.pkl"))
    test_sparse_matrix(os.path.join(BASE_DIR, "tfidf_matrix.npz"))
    test_joblib_model(os.path.join(BASE_DIR, "movies_df.pkl"))
    test_joblib_model(os.path.join(BASE_DIR, "title_indices.pkl"))
