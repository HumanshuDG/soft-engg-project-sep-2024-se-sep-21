export default {
    name: 'ta_dashboard',
    template: `
<div class="container mt-3 " style="width: 90%; margin: 0 auto;">
  <h1>Hello</h1>

  <!-- Main content section with 3:6:3 layout -->
  <div class="row mt-4">
    <!-- Left column (3 parts) with light dusky blue background -->
    <div class="col-md-3" style="background-color: #B0C4DE; padding: 20px;">
      <!-- Left side content (can be used for sidebar or other content) -->
      <h2>Updates</h2>
      <p>Here you can add updates or any other content relevant to the left section.</p>
    </div>

    <!-- Middle column (6 parts) -->
    <div class="col-md-6">
      <!-- Top section (2 parts) -->
      <div class="mb-4" style="height: 300px; margin-bottom: 3px;">
        <h3>Top Section</h3>
        <!-- Canvas element for the chart -->
        <canvas id="projects-ta-chart"></canvas>
      </div>

      <!-- Bottom section replaced with graph showing available projects -->
      <div class="mb-4" style="margin-top: 5vh;">
        <h3>Projects Overview</h3>

        <!-- Graph for Available Projects -->
        <canvas id="projects-count-chart"></canvas>
      </div>
    </div>

    <!-- Right column (3 parts) with light dusky blue background -->
    <div class="col-md-3" style="background-color: #B0C4DE; padding: 20px;">
      <!-- Right sidebar or additional content -->
      <ul>
        <h3>Total Statistics:</h3>
        <li>No. of projects: {{ projects.length }}</li>
        <li>No. of TAs: {{ availableTAs.length }}</li>
      </ul>
    </div>
  </div>
</div>
  `,

    data() {
      return {
        projects: [],
        availableTAs: [],
        totalProjects: 0,
        totalTAs: 0,
        selectedProject: {
          id: null,
          creator_id : localStorage.getItem('user_id'),
          name: '',
          deadline: '',
          max_teammates: 1,
          min_teammates: 1,
          description: '',
        },
        
        milestoneModalVisible: false, // Control visibility of the milestone modal
        currentProject: {}, // Store current project data
        milestones: [], // Store the milestones for the current project
        milestoneName: '', // Name of the new milestone
        milestone_number: '',
        milestoneDescription: '', // Description of the new milestone
        milestoneDueDate: '', // Due date for the new milestone
        currentMilestoneId: null, // Track current milestone ID for editing
        instructorName: '',
    
        showAssignTAModal: false,
        availableTAs: [],
        selectedTeamId: null, // Store the currently selected team ID
      };
    },
    created() {
      this.fetchProjects();
      this.fetchInstructorName();
      this.fetchAvailableTAs();
    },
    
    methods: {
      viewTeam(teamId) {
        this.$router.push({ name: 'project_team', params: { teamId } });
      },
  
      openAssignTAModal(teamId) {
        this.selectedTeamId = teamId;
        this.showAssignTAModal = true;
        this.fetchAvailableTAs(); // Fetch TAs when the modal opens
      },
      closeAssignTAModal() {
        this.showAssignTAModal = false;
      },
    
      // fetch available TAs
      async fetchAvailableTAs() {
        try {
          const response = await fetch('/api/tas');
          if (response.ok) {
            this.availableTAs = await response.json(); // Assume response is an array of TAs
            this.totalTAs = this.availableTAs.length; // Update the total number of TAs
            this.updateCharts(); // Update both charts after fetching data
          } else {
            console.error('Error fetching TAs:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching TAs:', error);
        }
      },
    
      async assignTA(taId) {
        try {
          const response = await fetch(`/api/teams/${this.selectedTeamId}/assign-ta`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ta_id: taId }),
          });
          
          if (response.ok) {
            const updatedTeam = await response.json();
            this.$emit('update-team', updatedTeam); // Emitting the updated team to parent for reactivity
            this.closeAssignTAModal();
          } else {
            console.error('Failed to assign TA');
          }
        } catch (error) {
          console.error('Error assigning TA:', error);
        }
      },
      
      async fetchProjects() {
        try {
          const response = await fetch('/api/projects');
          if (response.ok) {
            const projects = await response.json();
            this.projects = projects;
            this.totalProjects = projects.length;
            this.updateCharts();
          } else {
            console.error('Error fetching projects:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching projects:', error);
        }
      },

      updateCharts() {
        // Update the main chart (projects and TAs)
        const ctx = document.getElementById('projects-ta-chart').getContext('2d');
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Total Projects', 'Total TAs'],
            datasets: [{
              label: 'Count',
              data: [this.totalProjects, this.totalTAs],
              fill: false,
              borderColor: '#4BC0C0',
              tension: 0.1
            }]
          },
          options: {
            responsive: true,
            scales: {
              x: {
                beginAtZero: true,
              },
              y: {
                beginAtZero: true
              }
            }
          }
        });

        // Update the projects count chart
        const projectCountCtx = document.getElementById('projects-count-chart').getContext('2d');
        new Chart(projectCountCtx, {
          type: 'bar',
          data: {
            labels: ['Projects'],
            datasets: [{
              label: 'No. of Projects',
              data: [this.totalProjects],
              backgroundColor: '#FF6347', // Tomato color
              borderColor: '#FF6347',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            scales: {
              x: {
                beginAtZero: true,
              },
              y: {
                beginAtZero: true
              }
            }
          }
        });
      },

      async fetchInstructorName() {
        const userId = localStorage.getItem('user_id');
        if (userId) {
          try {
            const response = await fetch(`/api/users/${userId}`);
            if (response.ok) {
              const userData = await response.json();
              this.instructorName = userData.name;
            } else {
              console.error('Error fetching instructor name:', response.statusText);
            }
          } catch (error) {
            console.error('Error fetching instructor name:', error);
          }
        }
      },
    },
}
