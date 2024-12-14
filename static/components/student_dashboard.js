export default {
  name: 'student_dashboard',

  template: `
    <div class="container-fluid" style="height: 90vh; display: flex; padding: 10px; box-sizing: border-box; margin-top: 10px; width: 90%;">

      <!-- Left Column (Updates Section) with Light Dusky Blue Background -->
      <div class="col-md-3" style="background-color: #B0C4DE; padding: 20px; flex-shrink: 0; height: 100%; border: 1px solid #ddd; margin-left: 5px; margin-right: 10px;">
        <h2>Updates</h2>
        <h4>Enrolled Projects:</h4>
        <ul>
          <li v-for="(project, index) in enrolledProjectsWithDetails" :key="index">
            <strong>{{ project.name }}</strong>
            <p><em>Total Teams: {{ project.teamsCount }}</em></p>
          </li>
        </ul>
      </div>

      <!-- Middle Column (Activity Stats and Timeline Chart) -->
      <div class="col-md-6" style="display: flex; flex-direction: column; height: 100%; padding-left: 10px; border: 1px solid #ddd;">

        <!-- Top Component (Activity Statistics Card) -->
        <div class="row" style="flex-shrink: 0; height: 30%; padding: 10px; margin-bottom: 20px;">
          <div class="col-12">
            <div class="card" style="background-color: #d6e3f3; color: #001f3d; padding: 20px; height: 100%; border: 1px solid #ddd; box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);">
              <h3 style="margin-bottom: 10px; font-size: 2rem; font-weight: bold; letter-spacing: 1px;">Student Information</h3> <!-- Increased font size here -->
              <ul style="font-size: 1.2rem; padding-left: 20px;">
                <li><strong>Student Name:</strong> {{ studentName }}</li>
                <li><strong>Projects Enrolled:</strong> {{ totalEnrolledProjects }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Bottom Component (Project Deadline Timeline) -->
        <div class="row" style="flex-grow: 1; height: 70%; padding: 10px;">
          <div class="col-12">
            <h3>Project Deadlines</h3>
            <canvas id="projectTimelineChart" style="width: 100%; height: 400px; background-color: #f5f5dc; border: 1px solid #ddd;"></canvas> <!-- Increased height of chart here -->
          </div>
        </div>
      </div>

      <!-- Right Column (Upcoming Deadlines Section) with Light Dusky Blue Background -->
      <div class="col-md-3" style="background-color:#B0C4DE; padding: 20px; flex-shrink: 0; height: 100%; border: 1px solid #ddd;">
        <h2>Deadlines</h2>
        <ul>
          <li v-for="(project, index) in projectsWithDeadlines" :key="index">
            <strong>{{ project.name }}</strong>
            <p><em>Deadline: {{ project.deadline }}</em></p>
          </li>
        </ul>
      </div>
    </div>
  `,

  data() {
    return {
      totalEnrolledProjects: 0,
      enrolledProjects: [],
      projects: [],
      studentName: '',
      projectsWithDeadlines: [],
      enrolledProjectsWithDetails: []
    };
  },

  created() {
    this.fetchDashboardData();
    this.fetchStudentName();
  },

  methods: {
    async fetchDashboardData() {
      try {
        const userId = localStorage.getItem('user_id');
        
        if (userId) {
          const enrollmentsResponse = await fetch(`/api/enrollments?student_id=${userId}`);
          if (enrollmentsResponse.ok) {
            const enrollments = await enrollmentsResponse.json();
            this.enrolledProjects = enrollments.map(enrollment => enrollment.project_id);
            this.totalEnrolledProjects = this.enrolledProjects.length;
          }
        }

        const projectsResponse = await fetch(`/api/projects`);
        if (projectsResponse.ok) {
          const projects = await projectsResponse.json();
          this.projects = projects;

          this.enrolledProjectsWithDetails = this.enrolledProjects.map(projectId => {
            const project = this.projects.find(p => p.id === projectId);
            return project ? { name: project.name, teamsCount: project.teams.length } : null;
          }).filter(project => project !== null);

          this.projectsWithDeadlines = this.projects.map(project => ({
            name: project.name,
            deadline: new Date(project.deadline).toLocaleDateString()  // Format the deadline to a readable format
          }));

          this.generateProjectTimelineChart(); // After data is fetched
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    },

    generateProjectTimelineChart() {
      const projectNames = this.enrolledProjects.map(projectId => {
        const project = this.projects.find(p => p.id === projectId);
        return project ? project.name : '';
      });
    
      const projectDeadlines = this.enrolledProjects.map(projectId => {
        const project = this.projects.find(p => p.id === projectId);
        const deadline = project ? new Date(project.deadline) : null;
        const diffInDays = deadline ? Math.abs(Math.floor((deadline - new Date()) / (1000 * 3600 * 24))) : 0; // Ensure positive values
        return diffInDays; // Return absolute difference in days
      });
    
      const ctx = document.getElementById('projectTimelineChart').getContext('2d');
    
      // Generate an array of random colors for each project
      const colors = projectNames.map(() => {
        return `hsl(${Math.random() * 360}, 70%, 60%)`; // Generate a random color
      });
    
      new Chart(ctx, {
        type: 'bar', // Use 'bar' for Chart.js v3 or above
        data: {
          labels: projectNames,
          datasets: [{
            label: 'Days Until Deadline',
            data: projectDeadlines,
            backgroundColor: colors, // Assign random colors to each project
            borderColor: '#42a5f5',
            borderWidth: 1,
            barThickness: 15 // This makes the bars more visible
          }]
        },
        options: {
          responsive: true,
          indexAxis: 'y', // Set the bars to be horizontal
          scales: {
            x: {
              beginAtZero: true,
            },
            y: {
              beginAtZero: true,
            }
          }
        }
      });
    },
    
    async fetchStudentName() {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        try {
          const response = await fetch(`/api/users/${userId}`);
          if (response.ok) {
            const userData = await response.json();
            this.studentName = userData.name;
          } else {
            console.error('Error fetching student name:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching student name:', error);
        }
      }
    },
  },
};
