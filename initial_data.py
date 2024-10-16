from main import app
from application.models import db
from application.secondry import datastore
from werkzeug.security import generate_password_hash

with app.app_context():
    db.create_all()

    # Create roles
    if not datastore.find_role("admin"):
        datastore.create_role(name="admin", description="This is an Admin")
    if not datastore.find_role("instructor"):
        datastore.create_role(name="instructor", description="This is an Instructor")
    if not datastore.find_role("students"):
        datastore.create_role(name="students", description="This is a Student")
    if not datastore.find_role("TA"):
        datastore.create_role(name="TA", description="This is a TA")
    db.session.commit()

    # Create users and assign roles
    if not datastore.find_user(email="admin@email.com"):
        admin = datastore.create_user(
            name = "admin", email="admin@email.com", password=generate_password_hash("admin"))
        datastore.add_role_to_user(admin, "admin")
        
    if not datastore.find_user(email="inst1@email.com"):
        instructor = datastore.create_user(
            name = "instructor", email="inst1@email.com", password=generate_password_hash("inst1"))
        datastore.add_role_to_user(instructor, "instructor")
    
    db.session.commit()