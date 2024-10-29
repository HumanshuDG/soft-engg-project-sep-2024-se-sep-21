from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from datetime import datetime

db = SQLAlchemy()

roles_users = db.Table('roles_users',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('role_id', db.Integer, db.ForeignKey('role.id'))
)

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30), nullable=True)
    email = db.Column(db.String(255), unique=True)
    github = db.Column(db.String(30), nullable=True)
    password = db.Column(db.String(255))
    active = db.Column(db.Boolean, default=True)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    roles = db.relationship('Role', secondary=roles_users, backref=db.backref('users', lazy='dynamic'))
    last_active = db.Column(db.DateTime, default=datetime.utcnow)
     # One-to-many relationship: A user can be part of multiple teams
    team_memberships = db.relationship('TeamMember', backref='user', lazy=True)


# Project Model
class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    
    # New fields for start and end dates
    start_date = db.Column(db.Date, nullable=True)  # Optional start date
    end_date = db.Column(db.Date, nullable=True)    # Optional end date
    
    min_teammates = db.Column(db.Integer, default=1)  # Minimum number of teammates
    max_teammates = db.Column(db.Integer, nullable=False)  # Maximum number of teammates
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # One-to-many relationship: A project can have many teams
    teams = db.relationship('Team', backref='project', lazy=True)

    # One-to-many relationship: A project can have many milestones
    milestones = db.relationship('Milestone', backref='project', lazy=True)

# Milestone Model (Tracking Milestones for Projects)
class Milestone(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    due_date = db.Column(db.DateTime, nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)

# Team Model
class Team(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    repo = db.Column(db.String(100), nullable=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # One-to-many relationship: A team can have multiple members
    members = db.relationship('TeamMember', backref='team', lazy=True)

    # Relationship to get the TA for the team
    ta_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    # Relationship to get the TA for the team
    ta = db.relationship('User', foreign_keys=[ta_id])

# TeamMember Model (Mapping Users to Teams)
class TeamMember(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
