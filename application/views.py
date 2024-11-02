from flask import current_app as app, jsonify, render_template, request
from flask_security import login_user, auth_required, roles_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from application.models import db, User, Role
from application.secondry import datastore
from datetime import datetime
import uuid
## INDEX PAGE ##
@app.get('/')
def home():
    return render_template('index.html')

@app.route('/user-login', methods=['POST'])
def user_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = datastore.find_user(email=email)

    if not user:
        return jsonify({'message': 'User not found.'}), 404
    if not check_password_hash(user.password, password):
        return jsonify({'message': 'Incorrect Password'}), 401

    # Update last_active timestamp
    user.last_login = datetime.utcnow()
    db.session.commit()

    return jsonify({'token': user.get_auth_token(), 'role': [role.name for role in user.roles], 'user_id': user.id}), 200
    
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    role_name = data.get('role')  # Get the selected role from the request
    github_user_id = data.get('githubUserId')  # Get the GitHub User ID (if provided)

    # Check for required fields
    if not email or not password or not role_name:
        return jsonify({"message": "Email, password, and role are required"}), 400

    # Ensure that if the role is 'student', GitHub User ID is provided
    if role_name == 'student' and not github_user_id:
        return jsonify({"message": "GitHub User ID is required for students"}), 400

    # Check if user already exists by email
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User already exists"}), 400

    # Hash the password
    hashed_password = generate_password_hash(password)

    # Check if the role exists, if not, create it
    user_role = Role.query.filter_by(name=role_name).first()
    if not user_role:
        user_role = Role(name=role_name)
        db.session.add(user_role)
        db.session.commit()

    # Create a new user with the selected role and optionally the GitHub User ID
    new_user = User(
        email=email,
        password=hashed_password,
        roles=[user_role],
        name=name,
        github_id=github_user_id if role_name == 'student' else None,  # Assign GitHub ID if role is student
        fs_uniquifier=str(uuid.uuid4())
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Registration successful"}), 201
