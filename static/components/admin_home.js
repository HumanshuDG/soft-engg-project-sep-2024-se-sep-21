export default {
  name: 'admin_home',

  template: `
<div style="height: 100vh; background-color: #B0C4DE; display: flex; flex-direction: column;">
<!-- Outer Container (Full Screen with Background Color) -->
<div class="container-fluid" style="height: 90vh; display: flex; padding: 10px; box-sizing: border-box; margin-top: 10px; width: 90%; position: relative; z-index: 10;">
  
  <!-- Left Column (Wide Component) -->
  <div class="col-md-9" style="display: flex; flex-direction: column; height: 100%; padding-right: 20px; margin-right: 20px; border-radius: 10px;">
    
    <!-- Top Component (Basic Overview Table + Export Button) -->
    <div class="row" style="flex-shrink: 0; height: 25%; padding: 10px; margin-bottom: 15px; background-color: #FFF9E6; border-radius: 10px; overflow: hidden; display: flex; justify-content: space-between;">
      <div class="col-md-10" style="max-height: 100%; overflow-y: auto;">
        <h2>Basic Overview</h2>
        <table class="table table-bordered" style="font-size: 12px; margin-bottom: 0; width: 100%; overflow-y: auto;">
          <thead style="background-color: #343a40; color: #f8f9fa;">
            <tr>
              <th>Roles</th>
              <th>No. of Users</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Instructors</td>
              <td>{{ totalInstructors }}</td>
            </tr>
            <tr>
              <td>TAs</td>
              <td>{{ totalTAs }}</td>
            </tr>
            <tr>
              <td>Students</td>
              <td>{{ totalStudents }}</td>
            </tr>
            <tr>
              <td>Admin</td>
              <td>1</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Export Data Button -->
      <div class="col-md-2" style="display: flex; justify-content: center; align-items: center; padding-left: 10px;">
        <button class="btn btn-secondary" style="font-size: 14px; padding: 10px 20px; border-radius: 10px;">Export Data</button>
      </div>
    </div>

    <!-- Middle Component (Projects Cards) -->
    <div class="row" style="flex-grow: 1; height: 45%; padding: 10px; overflow-y: auto; margin-bottom: 15px; background-color: #FFF9E6; border-radius: 10px;">
      <div class="col-md-12" style="overflow-y: auto;">
        <h2>Projects</h2>
        <div v-for="project in projects" :key="project.id" class="card" style="margin-bottom: 10px; border-radius: 10px; background-color: #FFF9E6; max-height: 100%; overflow-y: auto;">
          <div class="card-body">
            <h5 class="card-title">{{ project.name }}</h5>
            <button @click="viewProject(project)" class="btn btn-primary">View</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Component (Project Info) -->
    <div class="row" style="flex-shrink: 0; height: 30%; padding: 10px; margin-bottom: 15px; background-color: #FFF9E6; border-radius: 10px;">
      <div class="col-md-12" style="max-height: 100%; overflow-y: auto;">
        <h2>Project Info</h2>
        <div v-if="selectedProject">
          <p><strong>Created On:</strong> {{ selectedProject.startTime }}</p>
          <p><strong>Deadline:</strong> {{ selectedProject.deadline }}</p>
          <p><strong>Milestones:</strong> {{ selectedProject.milestones.join(', ') }}</p>
          <p><strong>Instructor:</strong> {{ selectedProject.instructor }}</p>
          <p><strong>No. of Teams:</strong> {{ selectedProject.teams }}</p>
          <p><strong>TAs Assigned:</strong> {{ selectedProject.TAs }}</p>
          
        </div>
        <div v-else>
          <p>Select a project to view details.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Right Column (Thinner Component) -->
  <div class="col-md-3" style="display: flex; flex-direction: column; height: 100%; padding-left: 20px; border-radius: 10px;">
    
    <!-- Top Component  -->
    <div class="row" style="flex-shrink: 0; height: 15%; padding: 10px; margin-bottom: 15px; background-color: #FFF9E6; border-radius: 10px;">
      <h3>Welcome , admin</h3>
    </div>

    <!-- Middle Component (Bar Graph) -->
    <div class="row" style="flex-shrink: 0; height: 45%; padding: 10px; margin-bottom: 15px; background-color: #FFF9E6; border-radius: 10px;">
      <div class="col-md-12" style="overflow-y: auto;">
        
        <h3>Total Users</h3>
        <!-- Restricted Canvas size -->
        <canvas id="totalUsersBarGraph" style="width: 100%; height: 200px;"></canvas>
      </div>
    </div>

    <!-- Bottom Component (Teams Per Project Graph) -->
    <div class="row" style="flex-grow: 1; height: 40%; padding: 10px; margin-bottom: 15px; background-color: #FFF9E6; border-radius: 10px;">
      <div class="col-md-12" style="overflow-y: auto;">
        <h3>No. of Teams per Project</h3>
        <!-- Restricted Canvas size -->
        <canvas id="teamsPerProjectGraph" style="width: 100%; height: 200px;"></canvas>
      </div>
    </div>
  </div>
</div>

<!-- Optional Footer or Other Components Above Outer Container -->
<div style="z-index: 20; position: relative; background-color: #f8f9fa; padding: 20px; text-align: center;">
  <p>Project Management Dashboard - Admin View</p>
</div>
</div>


  `,

  data() {
    return {
      totalProjects: 0,
      totalInstructors: 0,
      totalStudents: 0,
      totalTAs: 0,
      projects: [],
      availableTAs: [],
      selectedProject: null,
      instructorName: '',
    };
  },

  created() {
    this.fetchDashboardData();
  },



  mounted() {
      this.$nextTick(() => {
        this.generateTotalUsersBarGraph();
        this.generateTeamsPerProjectGraph();
      });
    },    





  methods: {
    // Fetch dashboard data (projects, users, and TAs)
    async fetchDashboardData() {
      try {
        const response = await fetch('/api/admin_home');
        if (response.ok) {
          const data = await response.json();
          this.totalProjects = data.totalProjects;
          this.totalInstructors = data.totalInstructors;
          this.totalStudents = data.totalStudents;
          this.totalTAs = data.totalTAs;
          this.projects = data.projects;
          this.availableTAs = data.availableTAs;
          this.generateTotalUsersBarGraph();
          this.generateTeamsPerProjectGraph();
        } else {
          console.error('Error fetching dashboard data:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    },

    // View project details
    viewProject(project) {
      this.selectedProject = project;
      
    },

    destroyAndGenerateChart(chartId, chartConfig) {
      const existingChart = Chart.getChart(chartId); // Check if chart already exists
      if (existingChart) {
        existingChart.destroy(); // Destroy the existing chart
      }
    
      const ctx = document.getElementById(chartId).getContext('2d');
      new Chart(ctx, chartConfig); // Generate the new chart
    },
    
    generateTotalUsersBarGraph() {
      const userCounts = [this.totalInstructors, this.totalTAs, this.totalStudents];
      const userLabels = ['Instructors', 'TAs', 'Students'];
    
      const chartConfig = {
        type: 'bar',  // Horizontal bar chart
        data: {
          labels: userLabels,
          datasets: [{
            label: 'Total Users',
            data: userCounts,
            backgroundColor: ['#4caf50', '#ff9800', '#2196f3'],
          }]
        },
        options: {
          responsive: true,
          indexAxis: 'y',
          scales: {
            x: { beginAtZero: true },
            y: { beginAtZero: true }
          }
        }
      };
    
      this.destroyAndGenerateChart('totalUsersBarGraph', chartConfig); // Destroy and generate new chart
    },
    
    generateTeamsPerProjectGraph() {
      const projectNames = this.projects.map(project => project.name);
      const teamsData = this.projects.map(project => project.teams);
      
    
      const chartConfig = {
        type: 'bar',
        data: {
          labels: projectNames,
          datasets: [{
            label: 'No. of Teams per Project',
            data: teamsData,
            backgroundColor: '#ffcc80',
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: { beginAtZero: true },
            y: { beginAtZero: true }
          }
        }
      };
    
      this.destroyAndGenerateChart('teamsPerProjectGraph', chartConfig); // Destroy and generate new chart
    },

    
  },
};
