from flask import Flask, request, jsonify
from config import DevelopmentConfig
from application.models import db
from application.secondry import datastore
from flask_security import Security
from application.resources import api
import requests
from groq import Groq  # Import Groq for integrating the Groq API

# Groq API details
GROQ_API_KEY = "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"  # Replace with your Groq API token

# Initialize the Groq client
client = Groq(api_key=GROQ_API_KEY)

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
        db.create_all()

    return app

app = create_app()

# Add the Groq analysis route (replacing Hugging Face)
@app.route('/api/genai', methods=['POST'])
def genai_analysis():
    data = request.get_json()
    file_content = data.get('file_content')
    user_prompt = data.get('user_prompt')

    if not file_content:
        return jsonify({"error": "No file content provided"}), 400

    # Combine user prompt and file content for Groq model input
    inputs = f"{user_prompt}\n\n{file_content}"

    try:
        print(f"Sending request to Groq with inputs: {inputs}")

        # Send the request to Groq API to get feedback on the code
        completion = client.chat.completions.create(
            model="llama3-8b-8192",  # You can replace this with your desired model
            messages=[
                {"role": "system", "content": "You are a system which gives suggestions on how to improve the code based on the input code"},
                {"role": "user", "content": inputs}
            ],
            temperature=1,
            max_tokens=1024,
            top_p=1,
            stream=False,
            stop=None,
        )

        # Extract the feedback from the Groq API response
        feedback = completion.choices[0].message.content  # Access feedback content

        print(f"Received feedback: {feedback}")

        # Return the feedback as a JSON response
        return jsonify({"result": feedback})

    except Exception as e:
        print(f"Error during analysis: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True)
