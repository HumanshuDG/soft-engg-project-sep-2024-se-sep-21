export default {
  name: 'instructor_dashboard',

  template: `
    <div class="container-fluid" style="height: 90vh; display: flex; padding: 10px; box-sizing: border-box; margin-top: 10px; width: 90%;">
  
      <!-- Left Column (Updates Section) with Increased Margins and Scrolling -->
      <div class="col-md-3" style="background-color: #e6c7ff; padding: 20px; flex-shrink: 0; height: 100%; border: 1px solid #ddd; margin-left: 5px; margin-right: 30px; overflow-y: auto; max-height: 90vh;">
        <h2>Updates</h2>
        <h4>Project Details:</h4>
        <ul>
          <li v-for="(project, index) in projects" :key="index">
            <strong>{{ project.name }}</strong>
            <p>{{ project.description }}</p>
            <p><em>Teams Enrolled: {{ project.teams.length }}</em></p>
          </li>
        </ul>
      </div>
  
      <!-- Right Column (Top and Bottom Components) -->
      <div class="col-md-9" style="display: flex; flex-direction: column; height: 100%; padding-left: 10px; border: 1px solid #ddd;">
  
        <!-- Top Component (Cards: Total Projects and Total TAs) -->
        <div class="row" style="flex-shrink: 0; height: 30%; padding: 10px; justify-content: space-between; margin-bottom: 20px;">
          <div class="col-md-6" style="padding-right: 5px;">
            <div class="card" style="background-color: #ffe6e6; color: #001f3d; padding: 20px; height: 100%; border: 1px solid #ddd; display: flex; flex-direction: column; justify-content: center; box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1); transform: translateY(2px); transition: transform 0.3s ease;">
              <h3 style="margin-bottom: 10px; font-size: 1.5rem; font-weight: bold; letter-spacing: 1px;">Total Projects</h3>
              <p style="font-size: 4rem; font-weight: bolder; text-align: center; margin: 0; flex-grow: 1; font-family: 'Digital-7', sans-serif; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);"> {{ totalProjects }} </p>
            </div>
          </div>
  
          <div class="col-md-6" style="padding-left: 5px;">
            <div class="card" style="background-color: #ffe6e6; color: #001f3d; padding: 20px; height: 100%; border: 1px solid #ddd; display: flex; flex-direction: column; justify-content: center; box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1); transform: translateY(2px); transition: transform 0.3s ease;">
              <h3 style="margin-bottom: 10px; font-size: 1.5rem; font-weight: bold; letter-spacing: 1px;">Total TAs</h3>
              <p style="font-size: 4rem; font-weight: bolder; text-align: center; margin: 0; flex-grow: 1; font-family: 'Digital-7', sans-serif; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);"> {{ totalTAs }} </p>
            </div>
          </div>
        </div>
  
        <!-- Bottom Component (Graphs: No. of Teams Enrolled and No. of Projects vs No. of TAs) -->
        <div class="row" style="flex-grow: 1; height: 70%; padding: 10px;">
          <div class="col-md-6 mb-4" style="height: 90%; border: 1px solid #ddd;">
            <h3>No. of Teams Enrolled in Each Project</h3>
            <canvas id="teamsEnrolledChart" style="width: 100%; height: 100%; background-color: #f5f5dc; border: 1px solid #ddd;"></canvas>
          </div>
  
          <div class="col-md-6 mb-4" style="height: 90%; border: 1px solid #ddd;">
            <h3>No. of Projects vs No. of TAs</h3>
            <canvas id="projectsVsTAsChart" style="width: 100%; height: 100%; background-color: #f5f5dc; border: 1px solid #ddd;"></canvas>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      totalProjects: 0,
      totalTAs: 0,
      projects: [],
      availableTAs: [],
      milestones: [],
      instructorName: '',
    };
  },

  created() {
    this.fetchDashboardData();
    this.fetchAvailableTAs();
  },

  methods: {
    // Fetch dashboard data (projects and TAs)
    async fetchDashboardData() {
      try {
        // Fetch total number of projects and teams for the first chart
        const projectsResponse = await fetch('/api/projects');
        if (projectsResponse.ok) {
          const projects = await projectsResponse.json();
          this.totalProjects = projects.length;
          this.projects = projects;  
  
          // Destroy previous charts before generating new ones
          this.destroyChart('teamsEnrolledChart');
          this.destroyChart('projectsVsTAsChart');
  
          // Now generate charts
          this.generateTeamsEnrolledChart();
          this.generateProjectsVsTAsChart();
        }
  
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    },
  
    // Destroy a chart if it exists
    destroyChart(chartId) {
      const canvas = document.getElementById(chartId);
      if (canvas && canvas.chart) {
        canvas.chart.destroy();  // Destroy existing chart
      }
    },
  
    // Generate the "No. of Teams Enrolled in Each Project" chart
    generateTeamsEnrolledChart() {
      const projectNames = this.projects.map(project => project.name);
      const teamsData = this.projects.map(project => project.teams.length);
  
      const ctx = document.getElementById('teamsEnrolledChart').getContext('2d');
      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: projectNames,
          datasets: [{
            label: 'No. of Teams Enrolled',
            data: teamsData,
            backgroundColor: '#B0C4DE',
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: { beginAtZero: true },
            y: { beginAtZero: true },
          }
        }
      });
  
      // Store the chart instance on the canvas element
      ctx.chart = chart;
    },
  
    // Generate the "No. of Projects vs No. of TAs" chart
    generateProjectsVsTAsChart() {
      const projectCounts = this.projects.length; 
      const taCounts = this.availableTAs.length;
      
  
      const ctx = document.getElementById('projectsVsTAsChart').getContext('2d');
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Projects', 'TAs'],
          datasets: [{
            label: 'No. of Projects vs No. of TAs',
            data: [projectCounts, taCounts],
            fill: false,
            borderColor: '#42a5f5',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: true } }
        }
      });
  
      // Store the chart instance on the canvas element
      ctx.chart = chart;
    },
  
    // Fetch available TAs
    async fetchAvailableTAs() {
      try {
        const response = await fetch('/api/tas');
        if (response.ok) {
          this.availableTAs = await response.json(); 
          this.totalTAs = this.availableTAs.length; // Update the total number of TAs
        } else {
          console.error('Error fetching TAs:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching TAs:', error);
      }
    },
  },
};
