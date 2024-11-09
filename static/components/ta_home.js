export default {
    template: `
      <div class="container mt-3">
        <div class="row">
          <div class="col-md-12">
            <h3>Welcome TA: {{ taName }}!</h3>
          </div>
        </div>
  
        <!-- Allocated Teams Section -->
        <div class="row mt-4">
          <div class="col-md-12" v-if="allocatedTeams.length">
            <div class="card p-3 mb-3">
              <div class="project-header d-flex justify-content-between align-items-center">
                <h4 class="mb-0">Allocated Teams</h4>
              </div>
              <div class="row mt-3">
                <div class="col-md-12">
                  <p>Here are the teams allocated to you for support:</p>
                </div>
              </div>
  
              <!-- Team Cards -->
              <div class="mt-4">
                <div class="row">
                  <div
                    class="team-card card mb-3 p-3 col-md-4"
                    v-for="team in allocatedTeams"
                    :key="team.id"
                  >
                    <h6>Team Name: {{ team.team_name }}</h6>
  
                    <h6>Members:</h6>
                    <ul>
                      <li v-for="member in team.members" :key="member.id">{{ member.name }}</li>
                    </ul>
  
                    <!-- View Team Button -->
                    <div class="d-flex justify-content-between align-items-center mt-2">
                      <button class="btn btn-primary" @click="viewTeam(team.id)">View Team</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- If no teams are allocated -->
          <div v-else class="col-md-12">
            <div class="card p-3 mb-3">
              <p>No teams have been allocated to you yet.</p>
            </div>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        taName: '',  // TA's name
        allocatedTeams: [],  // List of teams allocated to the TA
      };
    },
    methods: {
      async fetchAllocatedTeams() {
        try {
          const taId = localStorage.getItem("user_id"); // Assuming TA ID is stored here
          const response = await fetch(`/api/ta_homepage/${taId}`);
          
          if (!response.ok) {
            throw new Error("Failed to fetch allocated teams.");
          }
  
          const data = await response.json();
          this.allocatedTeams = data.projects.flatMap(project => 
            project.teams.map(team => ({
              ...team,
              projectName: project.name
            }))
          );
        } catch (error) {
          console.error(error);
          alert("An error occurred while fetching allocated teams.");
        }
      },

      async fetchTAName() {
        const userId = localStorage.getItem('user_id');
        if (userId) {
          try {
            const response = await fetch(`/api/users/${userId}`);
            if (response.ok) {
              const userData = await response.json();
              this.taName = userData.name;
            } else {
              console.error('Error fetching TA name:', response.statusText);
            }
          } catch (error) {
            console.error('Error fetching TA name:', error);
          }
        }
      },
  
      // View team details
      viewTeam(teamId) {
        this.$router.push({ name: 'project_team', params: { teamId } });
      }
    },
    created() {
      this.fetchAllocatedTeams();
      this.fetchTAName();
    }
  };
  