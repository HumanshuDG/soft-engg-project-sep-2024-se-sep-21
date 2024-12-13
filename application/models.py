from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from datetime import datetime
import uuid

db = SQLAlchemy()

# Association table for many-to-many relationship between User and Role
roles_users = db.Table('roles_users',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('role_id', db.Integer, db.ForeignKey('role.id'))
)

class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)  # e.g., "student", "instructor"
    description = db.Column(db.String(255))

class User(db.Model, UserMixin):
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    github_id = db.Column(db.String(50), unique=True, nullable=True)
    name = db.Column(db.String(50), unique=False, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    account_created = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, default=datetime.utcnow)
    active = db.Column(db.Boolean, default=True)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    
    # Relationships
    roles = db.relationship('Role', secondary=roles_users, backref=db.backref('users', lazy='dynamic'))
    projects_created = db.relationship('Project', backref='creator', lazy=True)  # Defines the relationship to Project
    enrollments = db.relationship('Enrollment', backref='student', lazy=True)
    ta_allocations = db.relationship('TAAllocation', backref='ta', lazy=True)


class Project(db.Model):
    __tablename__ = 'project'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_on = db.Column(db.DateTime, default=datetime.utcnow)
    deadline = db.Column(db.DateTime, nullable=True)
    max_teammates = db.Column(db.Integer, nullable=False, default=1)
    min_teammates = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text, nullable=True)
    file_path = db.Column(db.String(255), nullable=True)

    # Relationships
    teams = db.relationship('Team', backref='project', lazy=True)
    milestones = db.relationship('Milestone', backref='project', lazy=True)

class Team(db.Model):
    __tablename__ = 'team'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    team_name = db.Column(db.String(100), nullable=True)
    created_on = db.Column(db.DateTime, default=datetime.utcnow)
    repo = db.Column(db.String(100), nullable=True)
    
    # Relationships 
    enrollments = db.relationship('Enrollment', backref='team', lazy=True)
    ta_allocations = db.relationship('TAAllocation', backref='team', lazy=True)
    submissions = db.relationship('ProjectSubmit', backref='team', lazy=True)
    milestone_submissions = db.relationship('MilestoneSubmit', backref='team', lazy=True)
    # One-to-many relationship: A team can have multiple members
    members = db.relationship('TeamMember', backref='team', lazy=True)

# TeamMember Model (Mapping Users to Teams)
class TeamMember(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    # Relationship to User model
    user = db.relationship('User', backref='team_members')


class Enrollment(db.Model):
    __tablename__ = 'enrollment'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=True)
    enrollment_date = db.Column(db.DateTime, default=datetime.utcnow)


class TAAllocation(db.Model):
    __tablename__ = 'ta_allocation'
    
    id = db.Column(db.Integer, primary_key=True)
    ta_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    assigned_on = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Unique constraint to prevent duplicate TA assignments to the same team
    __table_args__ = (db.UniqueConstraint('ta_id', 'team_id', name='unique_ta_team'),)


class ProjectSubmit(db.Model):
    __tablename__ = 'project_submit'
    
    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    submission_date = db.Column(db.DateTime, default=datetime.utcnow)


class Milestone(db.Model):
    __tablename__ = 'milestone'
    
    id = db.Column(db.Integer, primary_key=True)
    milestone_number = db.Column(db.Integer, nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    created_on = db.Column(db.DateTime, default=datetime.utcnow)
    deadline = db.Column(db.DateTime, nullable=True)
    description = db.Column(db.Text, nullable=True)
    file_path = db.Column(db.String(255), nullable=True)

    # Relationships
    submissions = db.relationship('MilestoneSubmit', backref='milestone', lazy=True)


class MilestoneSubmit(db.Model):
    __tablename__ = 'milestone_submit'
    
    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    milestone_id = db.Column(db.Integer, db.ForeignKey('milestone.id'), nullable=False)
    submission_date = db.Column(db.DateTime, default=datetime.utcnow)

class Feedback(db.Model):
    __tablename__ = 'feedback'
    
    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    instructor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    feedback_text = db.Column(db.Text, nullable=False)
    created_on = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    instructor = db.relationship('User', backref='given_feedbacks', lazy=True)
    team = db.relationship('Team', backref=db.backref('feedbacks', lazy=True))

class GenAIReport(db.Model):
    __tablename__ = 'gen_ai_report'
    
    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    instructor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    file = db.Column(db.String(255), nullable=False)
    assessment = db.Column(db.Float, nullable=True)  # Optional float field
    code_clarity = db.Column(db.Float, nullable=True)  # Optional float field
    feedback = db.Column(db.Text, nullable=True)  # Optional feedback field
    created_on = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    instructor = db.relationship('User', backref='gen_ai_reports', lazy=True)
    team = db.relationship('Team', backref=db.backref('gen_ai_reports', lazy=True))