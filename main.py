from flask import Flask
from config import DevelopmentConfig
from application.models import db
from application.secondry import datastore
from flask_security import Security
from application.resources import api

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

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)