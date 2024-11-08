export default {
    name: 'student_dashboard',
  
    template: `
      <div class="container-fluid" style="height: 90vh; display: flex; padding: 10px; box-sizing: border-box; margin-top: 10px; width: 90%;">
      
        <!-- Left Column (Updates Section) with Light Dusky Blue Background -->
        <div class="col-md-3" style="background-color: #B0C4DE; padding: 20px; flex-shrink: 0; height: 100%; border: 1px solid #ddd; margin-left: 5px; margin-right: 10px;">
          <h2>Updates</h2>
          <p>Here you can add updates or any other content relevant to the left section.</p>
        </div>
    
        <!-- Middle Column (Activity Stats and Graph) -->
        <div class="col-md-6" style="display: flex; flex-direction: column; height: 100%; padding-left: 10px; border: 1px solid #ddd;">
    
          <!-- Top Component (Activity Statistics Card) -->
          <div class="row" style="flex-shrink: 0; height: 30%; padding: 10px; margin-bottom: 20px;">
            <div class="col-12">
              <div class="card" style="background-color: #d6e3f3; color: #001f3d; padding: 20px; height: 100%; border: 1px solid #ddd; box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);">
                <h3 style="margin-bottom: 10px; font-size: 1.5rem; font-weight: bold; letter-spacing: 1px;">Activity Statistics</h3>
                <ul style="font-size: 1.2rem; padding-left: 20px;">
                  <li><strong>Projects Completed:</strong> {{ projectsCompleted }}</li>
                  <li><strong>Pending Milestones:</strong> {{ pendingMilestones }}</li>
                </ul>
              </div>
            </div>
          </div>
  
          <!-- Bottom Component (Graph) -->
          <div class="row" style="flex-grow: 1; height: 70%; padding: 10px;">
            <div class="col-12">
              <h3>Project Progress</h3>
              <canvas id="projectProgressChart" style="width: 100%; height: 100%; background-color: #f5f5dc; border: 1px solid #ddd;"></canvas>
            </div>
          </div>
        </div>
    
        <!-- Right Column (Upcoming Deadlines Section) with Light Dusky Blue Background -->
        <div class="col-md-3" style="background-color:#B0C4DE; padding: 20px; flex-shrink: 0; height: 100%; border: 1px solid #ddd;">
          <h2>Upcoming Deadlines</h2>
          <p>List of upcoming deadlines for your projects and milestones will be shown here.</p>
        </div>
      </div>
    `,
  
    data() {
      return {
        totalEnrolledProjects: 0,
        totalTAs: 0,
        enrolledProjects: [],
        taAllocations: [],
        milestones: [],
        studentName: '',
        projectsCompleted: 0,
        pendingMilestones: 0,
      };
    },
  
    created() {
      this.fetchDashboardData();
      this.fetchStudentName();
    },
  
    methods: {
      // Fetch dashboard data (enrolled projects, milestones, and TAs)
      async fetchDashboardData() {
        try {
          const userId = localStorage.getItem('user_id');
          
          // Fetch the student's enrolled projects
          if (userId) {
            const enrollmentsResponse = await fetch(`/api/enrollments?student_id=${userId}`);
            if (enrollmentsResponse.ok) {
              const enrollments = await enrollmentsResponse.json();
              this.enrolledProjects = enrollments.map(enrollment => enrollment.project_id);
              this.totalEnrolledProjects = this.enrolledProjects.length;
            }
          }
      
          // Fetch project details (names, completion percentages) for each enrolled project
          const projectsResponse = await fetch(`/api/projects`);
          if (projectsResponse.ok) {
            this.projects = await projectsResponse.json();
            this.generateProjectProgressChart(); // Call this after projects are fetched
          }
      
          // Fetch milestones and calculate stats
          const milestonesResponse = await fetch(`/api/milestones?student_id=${userId}`);
          if (milestonesResponse.ok) {
            const milestones = await milestonesResponse.json();
            this.milestones = milestones;
      
            // Calculate completed and pending milestones
            this.projectsCompleted = milestones.filter(milestone => milestone.completed).length;
            this.pendingMilestones = milestones.filter(milestone => !milestone.completed).length;
          }
      
          // Fetch total number of TAs for the second chart
          const taResponse = await fetch('/api/ta_allocations');
          if (taResponse.ok) {
            const taAllocations = await taResponse.json();
            this.totalTAs = taAllocations.length;
            this.taAllocations = taAllocations;
          }
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        }
      },
      
  
      // Generate the "Project Progress" chart
      generateProjectProgressChart() {
        const projectNames = this.enrolledProjects.map(projectId => {
          const project = this.projects.find(p => p.id === projectId);
          return project ? project.name : '';
        });
  
        const projectCompletionData = this.enrolledProjects.map(projectId => {
          const project = this.projects.find(p => p.id === projectId);
          return project ? project.completionPercentage : 0;  // Assuming a 'completionPercentage' field exists
        });
  
        const ctx = document.getElementById('projectProgressChart').getContext('2d');
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: projectNames,
            datasets: [{
              label: 'Project Completion Progress (%)',
              data: projectCompletionData,
              fill: false,
              borderColor: '#42a5f5',
              tension: 0.1
            }]
          },
          options: {
            responsive: true,
            scales: { 
              y: { beginAtZero: true, max: 100 },
              x: { ticks: { maxRotation: 90, minRotation: 45 } }
            }
          }
        });
      },
  
      // Fetch the student's name
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
  