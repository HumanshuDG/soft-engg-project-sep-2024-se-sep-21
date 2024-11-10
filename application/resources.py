from flask_restful import Api, Resource, reqparse, fields, marshal_with, request
from datetime import datetime
from application.models import db, User, Role, roles_users, Project, Team, TeamMember, Enrollment, TAAllocation, ProjectSubmit, Milestone, MilestoneSubmit

# Initialize the API
api = Api(prefix="/api")

# Parsers for each model
user_parser = reqparse.RequestParser()
user_parser.add_argument('name', type=str, location='json', required=False, help="Name of the user")
user_parser.add_argument('github_id', type=str, location='json', required=False, help="GitHub ID of the user")
user_parser.add_argument('email', type=str, location='json', required=False, help="Email of the user")
user_parser.add_argument('password', type=str, location='json', required=False, help="Password of the user")

project_parser = reqparse.RequestParser()
project_parser.add_argument('name', type=str, required=True)
project_parser.add_argument('creator_id', type=int, required=True)
project_parser.add_argument('deadline', type=str)
project_parser.add_argument('max_teammates', type=int, required=True)
project_parser.add_argument('min_teammates', type=int, required=True)
project_parser.add_argument('description', type=str)

team_parser = reqparse.RequestParser()
team_parser.add_argument('project_id', type=int, required=True)
team_parser.add_argument('team_name', type=str)
team_parser.add_argument('repo', type=str)


enrollment_parser = reqparse.RequestParser()
enrollment_parser.add_argument('student_id', type=int, required=True)
enrollment_parser.add_argument('project_id', type=int, required=True)
enrollment_parser.add_argument('team_id', type=int)

ta_allocation_parser = reqparse.RequestParser()
ta_allocation_parser.add_argument('ta_id', type=int, required=True)
ta_allocation_parser.add_argument('team_id', type=int, required=True)

project_submit_parser = reqparse.RequestParser()
project_submit_parser.add_argument('team_id', type=int, required=True)
project_submit_parser.add_argument('project_id', type=int, required=True)

milestone_parser = reqparse.RequestParser()
milestone_parser.add_argument('milestone_number', type=int, required=True)
milestone_parser.add_argument('project_id', type=int, required=True)
milestone_parser.add_argument('deadline', type=str)
milestone_parser.add_argument('description', type=str)

milestone_submit_parser = reqparse.RequestParser()
milestone_submit_parser.add_argument('team_id', type=int, required=True)
milestone_submit_parser.add_argument('milestone_id', type=int, required=True)

enrollment_check_parser = reqparse.RequestParser()
enrollment_check_parser.add_argument('student_id', type=int, required=True, help='Student ID cannot be blank')
enrollment_check_parser.add_argument('project_id', type=int, required=True, help='Project ID cannot be blank')


# Define fields for marshaling responses
user_fields = {
    'id': fields.Integer,
    'github_id': fields.String,
    'name': fields.String,
    'email': fields.String,
    'account_created': fields.DateTime,
}

team_fields = {
    'id': fields.Integer,
    'project_id': fields.Integer,
    'team_name': fields.String,
    'repo': fields.String,
    'created_on': fields.DateTime,
    'members': fields.List(fields.Nested({
        'id': fields.Integer,
        'user_id': fields.Integer,      # User ID for each team member
        'name': fields.String(attribute='user.name')  # Pull member names
    })),
    'ta_allocations': fields.List(fields.Nested({
        'id': fields.Integer,
        'ta': fields.Nested(user_fields)  # Assuming 'user_fields' has 'name'
    }))
}

project_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'creator_id': fields.Integer,
    'created_on': fields.DateTime,
    'deadline': fields.DateTime,
    'max_teammates': fields.Integer,
    'min_teammates': fields.Integer,
    'description': fields.String,
    'teams': fields.List(fields.Nested(team_fields)),
}


enrollment_fields = {
    'id': fields.Integer,
    'student_id': fields.Integer,
    'project_id': fields.Integer,
    'team_id': fields.Integer,
    'enrollment_date': fields.DateTime,
}

ta_allocation_fields = {
    'id': fields.Integer,
    'ta_id': fields.Integer,
    'team_id': fields.Integer,
    'assigned_on': fields.DateTime,
}

project_submit_fields = {
    'id': fields.Integer,
    'team_id': fields.Integer,
    'project_id': fields.Integer,
    'submission_date': fields.DateTime,
}

milestone_fields = {
    'id': fields.Integer,
    'milestone_number': fields.Integer,
    'project_id': fields.Integer,
    'created_on': fields.DateTime,
    'deadline': fields.String,
    'description': fields.String,
}

milestone_submit_fields = {
    'id': fields.Integer,
    'team_id': fields.Integer,
    'milestone_id': fields.Integer,
    'submission_date': fields.DateTime,
}

#For Admin Page
# marshaling project details
project_details_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'startTime': fields.String,
    'deadline': fields.String,
    'milestones': fields.List(fields.Integer),
    'instructor': fields.String,
    'TAs': fields.List(fields.String),
    'teams': fields.Integer
}

# marshaling TA details
ta_fields = {
    'id': fields.Integer,
    'name': fields.String
}

# marshaling the AdminHomeResource response
admin_home_fields = {
    'totalProjects': fields.Integer,
    'totalTAs': fields.Integer,
    'totalInstructors': fields.Integer,
    'totalStudents': fields.Integer,
    'projects': fields.List(fields.Nested(project_details_fields)),
    'availableTAs': fields.List(fields.Nested(ta_fields))
}



# User Resource
class UserResource(Resource):
    @marshal_with(user_fields)
    def get(self, user_id):
        user = User.query.get_or_404(user_id)
        return user

    @marshal_with(user_fields)
    def post(self):
        args = user_parser.parse_args()
        user = User(
            github_id=args['github_id'],
            username=args['name'],
            email=args['email'],
            password=args['password'],
            account_created=datetime.utcnow()
        )
        db.session.add(user)
        db.session.commit()
        return user, 201

    def delete(self, user_id):
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        return {'message': 'User deleted successfully'}, 204
    @marshal_with(user_fields)
    def put(self, user_id):
        user = User.query.get_or_404(user_id)
        args = user_parser.parse_args()

        # Update the fields with the new values
        user.username = args['name']
        user.github_id = args['github_id']

        # Commit the changes to the database
        db.session.commit()

        # Return the updated user
        return user

# Project Resource
class ProjectResource(Resource):
    @marshal_with(project_fields)
    def get(self, project_id=None):
        if project_id is None:
            # Fetch all projects
            projects = Project.query.all()
            return projects  # Return all projects
        else:
            # Fetch a specific project by ID
            project = Project.query.get_or_404(project_id)
            return project

    @marshal_with(project_fields)
    def post(self):
        args = project_parser.parse_args()
        project = Project(
            name=args['name'],
            creator_id=args['creator_id'],
            deadline=datetime.fromisoformat(args['deadline']) if args['deadline'] else None,
            max_teammates=args['max_teammates'],
            min_teammates=args['min_teammates'],
            description=args['description']
        )
        db.session.add(project)
        db.session.commit()
        return project, 201
    
    @marshal_with(project_fields)
    def put(self, project_id):
        args = project_parser.parse_args()
        project = Project.query.get_or_404(project_id)
        
        # Update project fields with new values
        project.name = args['name']
        project.creator_id = args['creator_id']
        project.deadline = datetime.fromisoformat(args['deadline']) if args['deadline'] else None
        project.max_teammates = args['max_teammates']
        project.min_teammates = args['min_teammates']
        project.description = args['description']

        db.session.commit()  # Commit the changes
        return project, 200  # Return the updated project

    def delete(self, project_id):
        project = Project.query.get_or_404(project_id)
        db.session.delete(project)
        db.session.commit()
        return {'message': 'Project deleted successfully'}, 204

# Team Resource
class TeamResource(Resource):
    @marshal_with(team_fields)
    def get(self, team_id):
        team = Team.query.get_or_404(team_id)
        return team

    @marshal_with(team_fields)
    def post(self):
        args = team_parser.parse_args()
        team = Team(
            project_id=args['project_id'],
            repo=args['repo'],
            team_name=args['team_name'],
            created_on=datetime.utcnow()
        )
        db.session.add(team)
        db.session.commit()
        return team, 201

    def delete(self, team_id):
        team = Team.query.get_or_404(team_id)
        db.session.delete(team)
        db.session.commit()
        return {'message': 'Team deleted successfully'}, 204

class EnrollmentResource(Resource):
    @marshal_with(enrollment_fields)
    def get(self, enrollment_id=None):
        # Fetch enrollment by ID if provided
        if enrollment_id is not None:
            enrollment = Enrollment.query.get_or_404(enrollment_id)
            return enrollment

        # Otherwise, fetch all enrollments for a specific student_id
        args = request.args  # to fetch query parameters
        student_id = args.get('student_id')

        if student_id:
            enrollments = Enrollment.query.filter_by(student_id=student_id).all()
            return enrollments  # Returns all enrollments for the given student_id
        else:
            return {'message': 'student_id is required'}, 400  # Return an error if student_id is not provided

    @marshal_with(enrollment_fields)
    def post(self):
        args = enrollment_parser.parse_args()
        student_id = args['student_id']
        project_id = args['project_id']
        team_id = args['team_id']

        # Check if the student is already enrolled in the specified project
        existing_enrollment = Enrollment.query.filter_by(student_id=student_id, project_id=project_id).first()
        if existing_enrollment:
            return {'message': 'You are already enrolled in this project.'}, 400

        # Create the enrollment entry
        enrollment = Enrollment(
            student_id=student_id,
            project_id=project_id,
            team_id=team_id,
            enrollment_date=datetime.utcnow()
        )
        db.session.add(enrollment)

        # Create a TeamMember entry for the user in the specified team
        team_member = TeamMember(user_id=student_id, team_id=team_id)
        db.session.add(team_member)

        db.session.commit()
        return enrollment, 201

    def delete(self, enrollment_id):
        enrollment = Enrollment.query.get_or_404(enrollment_id)
        db.session.delete(enrollment)
        db.session.commit()
        return {'message': 'Enrollment deleted successfully'}, 204


class TAListResource(Resource):
    @marshal_with(user_fields)
    def get(self):
        # Fetch TAs who have the role of 'TA'
        tas = User.query.join(roles_users).join(Role).filter(Role.name == 'TA').all()
        return tas
    
class TAAllocationResource(Resource):
    @marshal_with(ta_allocation_fields)
    def get(self, allocation_id):
        allocation = TAAllocation.query.get_or_404(allocation_id)
        return allocation

    @marshal_with(ta_allocation_fields)
    def post(self):
        args = ta_allocation_parser.parse_args()
        allocation = TAAllocation(
            ta_id=args['ta_id'],
            team_id=args['team_id'],
            assigned_on=datetime.utcnow()
        )
        db.session.add(allocation)
        db.session.commit()
        return allocation, 201

    def delete(self, allocation_id):
        allocation = TAAllocation.query.get_or_404(allocation_id)
        db.session.delete(allocation)
        db.session.commit()
        return {'message': 'TA Allocation deleted successfully'}, 204

class ProjectSubmitResource(Resource):
    @marshal_with(project_submit_fields)
    def get(self, submission_id):
        submission = ProjectSubmit.query.get_or_404(submission_id)
        return submission

    @marshal_with(project_submit_fields)
    def post(self):
        args = project_submit_parser.parse_args()
        submission = ProjectSubmit(
            team_id=args['team_id'],
            project_id=args['project_id'],
            submission_date=datetime.utcnow()
        )
        db.session.add(submission)
        db.session.commit()
        return submission, 201

    def delete(self, submission_id):
        submission = ProjectSubmit.query.get_or_404(submission_id)
        db.session.delete(submission)
        db.session.commit()
        return {'message': 'Project Submission deleted successfully'}, 204

class MilestoneResource(Resource):
    @marshal_with(milestone_fields)
    def get(self, milestone_id):
        milestone = Milestone.query.get_or_404(milestone_id)
        return milestone

    @marshal_with(milestone_fields)
    def post(self):
        args = milestone_parser.parse_args()
        # Parse and store only the date part of the deadline
        deadline = datetime.fromisoformat(args['deadline']).date() if args['deadline'] else None
        
        milestone = Milestone(
            milestone_number=args['milestone_number'],
            project_id=args['project_id'],
            deadline=deadline,  # Storing only the date part
            description=args['description']
        )
        
        db.session.add(milestone)
        db.session.commit()
        return milestone, 201
    
    @marshal_with(milestone_fields)
    def put(self, milestone_id):
        args = milestone_parser.parse_args()
        milestone = Milestone.query.get_or_404(milestone_id)
        
        # Update milestone fields based on input
        milestone.milestone_number = args['milestone_number'] if args['milestone_number'] is not None else milestone.milestone_number
        milestone.project_id = args['project_id'] if args['project_id'] is not None else milestone.project_id
        milestone.deadline = datetime.fromisoformat(args['deadline']).date() if args['deadline'] else milestone.deadline
        milestone.description = args['description'] if args['description'] else milestone.description
        
        db.session.commit()
        return milestone, 200

    def delete(self, milestone_id):
        milestone = Milestone.query.get_or_404(milestone_id)
        db.session.delete(milestone)
        db.session.commit()
        return {'message': 'Milestone deleted successfully'}, 204

class MilestoneListResource(Resource):
    @marshal_with(milestone_fields)
    def get(self):
        project_id = request.args.get('project_id', type=int)
        if project_id:
            milestones = Milestone.query.filter_by(project_id=project_id).all()
            return milestones
        milestones = Milestone.query.all()
        return milestones

class MilestoneSubmitResource(Resource):
    @marshal_with(milestone_submit_fields)
    def get(self, submission_id):
        submission = MilestoneSubmit.query.get_or_404(submission_id)
        return submission

    @marshal_with(milestone_submit_fields)
    def post(self):
        args = milestone_submit_parser.parse_args()
        submission = MilestoneSubmit(
            team_id=args['team_id'],
            milestone_id=args['milestone_id'],
            submission_date=datetime.utcnow()
        )
        db.session.add(submission)
        db.session.commit()
        return submission, 201

    def delete(self, submission_id):
        submission = MilestoneSubmit.query.get_or_404(submission_id)
        db.session.delete(submission)
        db.session.commit()
        return {'message': 'Milestone Submission deleted successfully'}, 204

class ProjectTeamResource(Resource):
    @marshal_with(team_fields)
    def get(self, project_id):
        project = Project.query.get_or_404(project_id)
        teams = project.teams 
        return teams, 200  

class EnrollmentCheckResource(Resource):
    @marshal_with(enrollment_fields)
    def get(self, project_id, student_id):
        # Query for existing enrollment
        enrollment = Enrollment.query.filter_by(student_id=student_id, project_id=project_id).first()
        
        if enrollment:
            return enrollment, 200  # Student is already enrolled in the project
        else:
            return {'message': 'Student is not enrolled in this project.'}, 404

class TAHomepageResource(Resource):
    def get(self, ta_id):
        # Fetch teams where the given TA is assigned
        teams = Team.query.join(TAAllocation).filter(TAAllocation.ta_id == ta_id).all()

        # Get project IDs for teams assigned to the TA
        project_ids = {team.project_id for team in teams}

        # Fetch projects associated with those IDs
        projects = Project.query.filter(Project.id.in_(project_ids)).all()

        # Build response data
        data = []
        for project in projects:
            project_data = {
                'id': project.id,
                'name': project.name,
                'description': project.description,
                'deadline': project.deadline.strftime('%Y-%m-%d'),
                'teams': []
            }
            
            # Get teams for the current project assigned to this TA
            project_teams = [team for team in teams if team.project_id == project.id]
            
            for team in project_teams:
                team_data = {
                    'id': team.id,
                    'team_name': team.team_name,
                    'repo': team.repo,
                    'members': [{'id': member.id, 'name': member.user.name} for member in team.members],
                    'milestones': [],
                    'submissions': []
                }
                
                # Fetch milestones for this project
                milestones = Milestone.query.filter_by(project_id=project.id).all()
                team_data['milestones'] = [{'id': milestone.id, 'milestone_number': milestone.milestone_number, 'deadline': milestone.deadline.strftime('%Y-%m-%d')} for milestone in milestones]

                # Fetch submissions for this team
                submissions = MilestoneSubmit.query.filter_by(team_id=team.id).all()
                team_data['submissions'] = [{'id': submission.id, 'milestone_id': submission.milestone_id, 'submission_date': submission.submission_date.strftime('%Y-%m-%d')} for submission in submissions]
                
                project_data['teams'].append(team_data)
                
            data.append(project_data)

        return {'projects': data}, 200

class AdminHomeResource(Resource):
    @marshal_with(admin_home_fields)
    def get(self):
        # Fetch total number of projects
        total_projects = Project.query.count()
       
        # Fetch total number of TAs
        total_tas = User.query.join(Role, User.roles).filter(Role.id == 3).count()
        
        # Fetch total number of instructors by comparing role ID
        total_instructors = User.query.join(Role, User.roles).filter(Role.id == 1).count()

        # Fetch total number of students by comparing role ID
        total_students = User.query.join(Role, User.roles).filter(Role.id == 2).count()
       
        # Fetch project details
        projects = Project.query.all()
        project_details = []
        for project in projects:
            project_details.append({
                'id': project.id,
                'name': project.name,
                'startTime': project.created_on.strftime('%Y-%m-%d'),
                'deadline': project.deadline.strftime('%Y-%m-%d') if project.deadline else 'N/A',
                'milestones': [milestone.milestone_number for milestone in project.milestones],
                'instructor': project.creator.name,
                'TAs': [ta.name for ta in project.creator.ta_allocations],
                'teams': len(project.teams)
            })

        # Fetch available TAs
        available_tas = User.query.join(Role, User.roles).filter(Role.name == 'TA').all()
        available_tas_list = [{'id': ta.id, 'name': ta.name} for ta in available_tas]

        return {
            'totalProjects': total_projects,
            'totalTAs': total_tas,
            'totalInstructors': total_instructors,
            'totalStudents': total_students,
            'projects': project_details,
            'availableTAs': available_tas_list
        }





# Register resources with the API
api.add_resource(UserResource, '/users', '/users/<int:user_id>')
api.add_resource(ProjectResource, '/projects', '/projects/<int:project_id>')
api.add_resource(TeamResource, '/teams', '/teams/<int:team_id>')
api.add_resource(EnrollmentResource, '/enrollments', '/enrollments/<int:enrollment_id>')
api.add_resource(TAAllocationResource, '/ta_allocations', '/ta_allocations/<int:allocation_id>')
api.add_resource(ProjectSubmitResource, '/project_submits', '/project_submits/<int:submission_id>')
api.add_resource(MilestoneResource, '/milestones', '/milestones/<int:milestone_id>')
api.add_resource(MilestoneListResource, '/milestones_list')
api.add_resource(MilestoneSubmitResource, '/milestone_submits', '/milestone_submits/<int:submission_id>')
api.add_resource(ProjectTeamResource, '/projects/<int:project_id>/teams')
api.add_resource(EnrollmentCheckResource, '/projects/<int:project_id>/enrollments/<int:student_id>')
api.add_resource(TAListResource, '/tas')
api.add_resource(TAHomepageResource, '/ta_homepage/<int:ta_id>')
api.add_resource(AdminHomeResource, '/admin_home')
