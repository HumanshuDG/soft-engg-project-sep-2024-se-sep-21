from flask_restful import Api, Resource, reqparse, fields, marshal_with
from flask import request
from application.models import db, Project, User, Milestone, Team, TeamMember, Role, roles_users
from datetime import datetime

api = Api(prefix="/api")

# Define request parsers
project_parser = reqparse.RequestParser()
project_parser.add_argument('name', type=str, required=True, help='Name of the project')
project_parser.add_argument('description', type=str, help='Description of the project')
project_parser.add_argument('min_teammates', type=int, required=True, help='Minimum number of teammates')
project_parser.add_argument('max_teammates', type=int, required=True, help='Maximum number of teammates')
project_parser.add_argument('start_date', type=str, required=False, help='Start date of the project (YYYY-MM-DD)')
project_parser.add_argument('end_date', type=str, required=False, help='End date of the project (YYYY-MM-DD)')

# Define request parsers for milestones
milestone_parser = reqparse.RequestParser()
milestone_parser.add_argument('name', type=str, required=True, help='Name of the milestone')
milestone_parser.add_argument('description', type=str, help='Description of the milestone')
milestone_parser.add_argument('due_date', type=str, required=True, help='Due date of the milestone (YYYY-MM-DD)')
milestone_parser.add_argument('project_id', type=int, required=True, help='Project ID the milestone belongs to')

# Resource fields for marshalling
project_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'min_teammates': fields.Integer,
    'max_teammates': fields.Integer,
    'start_date': fields.String,
    'end_date': fields.String
}

milestone_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'due_date': fields.String,  # Consider formatting this if needed
    'project_id': fields.Integer
}

user_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'email': fields.String,
    'github': fields.String
}

team_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'repo': fields.String,
    'ta': fields.Nested(user_fields, attribute='ta'),
    'project_id': fields.Integer,
    'members': fields.List(fields.Nested({
        'id': fields.Integer,
        'name': fields.String(attribute='user.name')  # Pull member names
    }))
}

# User Resource
class UserResource(Resource):
    @marshal_with(user_fields)
    def get(self, user_id):
        user = User.query.get_or_404(user_id)  # Fetch the user by ID
        return user

# Project Resource
class ProjectResource(Resource):
    @marshal_with(project_fields)
    def get(self, project_id):
        project = Project.query.get_or_404(project_id)
        return project

    @marshal_with(project_fields)
    def put(self, project_id):
        args = project_parser.parse_args()
        project = Project.query.get_or_404(project_id)
        project.name = args['name']
        project.description = args.get('description')
        project.min_teammates = args['min_teammates']
        project.max_teammates = args['max_teammates']
        
        # Handle start_date and end_date
        if args.get('start_date'):
            project.start_date = datetime.strptime(args['start_date'], '%Y-%m-%d').date()
        if args.get('end_date'):
            project.end_date = datetime.strptime(args['end_date'], '%Y-%m-%d').date()

        db.session.commit()
        return project

    def delete(self, project_id):
        project = Project.query.get_or_404(project_id)
        db.session.delete(project)
        db.session.commit()
        return '', 204

class ProjectListResource(Resource):
    @marshal_with(project_fields)
    def get(self):
        projects = Project.query.all()
        return projects

    @marshal_with(project_fields)
    def post(self):
        args = project_parser.parse_args()
        project = Project(
            name=args['name'],
            description=args.get('description'),
            min_teammates=args['min_teammates'],
            max_teammates=args['max_teammates']
        )
        
        # Handle start_date and end_date
        if args.get('start_date'):
            project.start_date = datetime.strptime(args['start_date'], '%Y-%m-%d').date()
        if args.get('end_date'):
            project.end_date = datetime.strptime(args['end_date'], '%Y-%m-%d').date()

        db.session.add(project)
        db.session.commit()
        return project, 201
    
# Milestone Resource
class MilestoneResource(Resource):
    @marshal_with(milestone_fields)
    def get(self, milestone_id):
        milestone = Milestone.query.get_or_404(milestone_id)
        return milestone

    @marshal_with(milestone_fields)
    def put(self, milestone_id):
        args = milestone_parser.parse_args()
        milestone = Milestone.query.get_or_404(milestone_id)
        milestone.name = args['name']
        milestone.description = args.get('description')
        milestone.due_date = datetime.strptime(args['due_date'], '%Y-%m-%d')  # Parse the date
        milestone.project_id = args['project_id']

        db.session.commit()
        return milestone

    def delete(self, milestone_id):
        milestone = Milestone.query.get_or_404(milestone_id)
        db.session.delete(milestone)
        db.session.commit()
        return '', 204

class MilestoneListResource(Resource):
    @marshal_with(milestone_fields)
    def get(self):
        project_id = request.args.get('project_id', type=int)
        if project_id:
            milestones = Milestone.query.filter_by(project_id=project_id).all()
            return milestones
        milestones = Milestone.query.all()
        return milestones

    @marshal_with(milestone_fields)
    def post(self):
        args = milestone_parser.parse_args()
        milestone = Milestone(
            name=args['name'],
            description=args.get('description'),
            due_date=datetime.strptime(args['due_date'], '%Y-%m-%d'),
            project_id=args['project_id']
        )
        
        db.session.add(milestone)
        db.session.commit()
        return milestone, 201
        
class TeamListResource(Resource):
    def post(self):
        data = request.get_json()
        project_id = data.get('project_id')
        user_id = data.get('user_id')
        repo_url = data.get('repo')  # Get repo URL from the request

        # Check if project exists
        project = Project.query.get(project_id)
        if not project:
            return {'message': 'Project not found'}, 404

        # Check if user is already enrolled in this project
        existing_team_member = TeamMember.query.filter_by(user_id=user_id).join(Team).filter(Team.project_id == project_id).first()
        if existing_team_member:
            return {'message': 'User is already enrolled in this project.'}, 400

        # Find a team with an available slot in the same project
        team = (
            Team.query.filter_by(project_id=project_id)
            .filter(Team.members.any())  # Check that team already has members
            .join(TeamMember)
            .group_by(Team.id)
            .having(db.func.count(TeamMember.id) < project.max_teammates)  # Only teams with space
            .first()
        )

        # If no team with available slots, create a new team
        if not team:
            team = Team(name=f"Team for {project.name}", project_id=project_id, repo=repo_url)
            db.session.add(team)
            db.session.commit()

        # Add the user to the selected or newly created team
        team_member = TeamMember(user_id=user_id, team_id=team.id)
        db.session.add(team_member)
        db.session.commit()

        return {'message': 'User enrolled in project successfully'}, 201
    
# Api to fetch teams associated with each project   
class ProjectTeamsResource(Resource):
    @marshal_with(team_fields)
    def get(self, project_id):
        project = Project.query.get_or_404(project_id)
        teams = Team.query.filter_by(project_id=project_id).all()
        return teams

class TAListResource(Resource):
    @marshal_with(user_fields)
    def get(self):
        # Fetch TAs who have the role of 'TA'
        tas = User.query.join(roles_users).join(Role).filter(Role.name == 'TA').all()
        return tas
    
#API to assign/update TA for each team  
class TeamResource(Resource):
    @marshal_with(team_fields)
    def put(self, team_id):
        # Fetching the team by ID
        team = Team.query.get_or_404(team_id)

        # Getting TA ID from request JSON
        data = request.get_json()
        ta_id = data.get('ta_id')

        # Assign the TA to the team
        if ta_id:
            team.ta_id = ta_id
            db.session.commit()
            return team, 200
        else:
            return {'message': 'TA ID is required'}, 400


# Registering Project Resources
api.add_resource(ProjectResource, '/projects/<int:project_id>')
api.add_resource(ProjectListResource, '/projects')

# Registering the UserResource
api.add_resource(UserResource, '/users/<int:user_id>')

# Registering Milestone Resources
api.add_resource(MilestoneResource, '/milestones/<int:milestone_id>')
api.add_resource(MilestoneListResource, '/milestones')

# Register the TeamListResource for creating a team
api.add_resource(TeamListResource, '/teams')

# Register the ProjectTeamsResource
api.add_resource(ProjectTeamsResource, '/projects/<int:project_id>/teams')

# Register the TAListResource
api.add_resource(TAListResource, '/tas')

# Register the TeamResource with a new route
api.add_resource(TeamResource, '/teams/<int:team_id>/assign-ta')

