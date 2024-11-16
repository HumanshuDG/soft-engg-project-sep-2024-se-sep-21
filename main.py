from flask import Flask, request, jsonify, redirect
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
    task = data.get('task')  # New task parameter

    if not file_content:
        return jsonify({"error": "No file content provided"}), 400

    # Set up task-specific instructions
    if task == "summarize":
        system_prompt = (
            "Summarize the code in no more than 100 words and provide a brief overview of what it does."
        )
    elif task == "analyze":
        # New instructions for analysis to return a score first
        system_prompt = (
            "Analyze the code and provide a rating out of 10 considering the following factors: "
            "1. Functionality (Are the features well-implemented?)\n"
            "2. Errors (Are there any errors in the code?)\n"
            "3. Improvements (Does the code need improvements or optimizations?)\n"
            "Provide your score first, followed by a brief explanation of the rating. "
            "Example: 'Your score: 8. The code has good functionality but can be optimized.'"
        )
    elif task == "rate":
        # New instructions for rating to return a score first
        system_prompt = (
            "Rate the code from 0-10 considering code cleanliness, readability, and adherence to coding standards. "
            "Provide your score first, followed by a brief explanation of the rating. "
            "Example: 'Your score: 9. The code is clean and readable with good variable names and structure.'"
        )
    elif task == "feedback":
        # Provide feedback without unnecessary improvement suggestions if no improvements are needed
        system_prompt = (
            "Provide brief feedback on the code, focusing on strengths and areas for improvement. "
            "The feedback should be no more than 50 words. If the code is well-written and doesn't require improvements, "
            "omit any feedback related to improvements and focus on the strengths."
        )
    else:
        return jsonify({"error": "Invalid task specified"}), 400

    # Combine user prompt and file content
    inputs = f"{user_prompt}\n\n{file_content}"

    try:
        print(f"Sending request to Groq with task '{task}' and inputs: {inputs}")

        # Send request to Groq API with the task-specific prompt
        completion = client.chat.completions.create(
            model="llama3-8b-8192",  # Replace with the specific model as needed
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": inputs}
            ],
            temperature=1,
            max_tokens=1024,
            top_p=1,
            stream=False,
            stop=None,
        )

        feedback = completion.choices[0].message.content  # Access feedback content

        print(f"Received response: {feedback}")

        # Return the feedback as a JSON response
        return jsonify({"result": feedback})

    except Exception as e:
        print(f"Error during analysis: {e}")
        return jsonify({"error": "Internal server error"}), 500

#Github Auth
# Your GitHub OAuth credentials
CLIENT_ID = 'Ov23liy5AM4qoqFHMgkl'  # Replace with your actual GitHub Client ID
CLIENT_SECRET = 'fa24969a907342ea2025f912fa233371ff865a4b'  # Replace with your actual GitHub Client Secret

from flask import make_response

@app.route('/oauth/callback', methods=['GET'])
def github_oauth_callback():
    code = request.args.get('code')
    if not code:
        return jsonify({"error": "Missing authorization code"}), 400

    github_url = 'https://github.com/login/oauth/access_token'
    data = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'code': code
    }

    response = requests.post(github_url, data=data, headers={'Accept': 'application/json'})

    if response.status_code != 200:
        return jsonify({"error": "Failed to exchange code for token"}), 400

    token_data = response.json()
    access_token = token_data.get('access_token')

    if not access_token:
        return jsonify({"error": "Access token not found"}), 400

    # Store token in cookie
    resp = make_response(redirect("http://127.0.0.1:5000/#/instructor_home"))
    resp.set_cookie('github_token', access_token)  # Set the cookie with the access token

    return resp

if __name__ == '__main__':
    app.run(debug=True)
