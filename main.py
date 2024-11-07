from flask import Flask, request, jsonify
import requests
from config import DevelopmentConfig
from application.models import db
from application.secondry import datastore
from flask_security import Security
from application.resources import api

# Hugging Face API details
HF_MODEL_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"
HF_API_KEY = ""  # Replace with your Hugging Face API token

headers = {
    "Authorization": f"Bearer {HF_API_KEY}",
    "Content-Type": "application/json"
}

# Create the Flask app
def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)  # Load the configuration from the DevelopmentConfig class

    # Initialize SQLAlchemy with the Flask app
    db.init_app(app)

    # Initialize Flask_Security
    app.security = Security(app, datastore)

    # Initialize Flask-RESTful with the Flask app
    api.init_app(app)

    with app.app_context():
        import application.views  # Import views or other components here

    return app

# Create Flask app instance
app = create_app()

# Add the Hugging Face analysis route
@app.route('/api/genai', methods=['POST'])
def genai_analysis():
    data = request.get_json()
    file_content = data.get('file_content')
    user_prompt = data.get('user_prompt')

    if not file_content:
        return jsonify({"error": "No file content provided"}), 400

    # Combine user prompt and file content for the model
    inputs = f"{user_prompt}\n\n{file_content}"

    try:
        print(f"Sending request to Hugging Face with inputs: {inputs}")

        response = requests.post(
            HF_MODEL_URL,
            headers=headers,
            json={"inputs": inputs}
        )

        print(f"Received response: {response.status_code} - {response.text}")


        if response.status_code == 200:
            # Extract result from response
            result = response.json()[0].get("summary_text", "No result generated.")
            return jsonify({"result": result})

        else:
            return jsonify({"error": "Error with Hugging Face API"}), 500

    except Exception as e:
        print(f"Error during analysis: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True)
