export default {
    template: `
      <div class="container mt-3">
        <div class="row">
          <div class="col-md-12">
            <h3>Welcome TA: {{ taName }}!</h3>
          </div>
          
          <!-- Show GitHub authentication button if not authenticated -->
          <button v-if="!isAuthenticated" class="btn btn-dark" @click="loginWithGitHub">Authenticate with GitHub</button>  
          <!-- Show logout button if authenticated -->
          <button v-if="isAuthenticated" class="btn btn-danger" @click="logoutFromGitHub">Logout from GitHub</button>
        
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
        isAuthenticated: false, 
        taName: '',  // TA's name
        allocatedTeams: [],  // List of teams allocated to the TA
      };
    },
    created() {   
      this.handleGitHubCallback();
      this.checkAuthentication();
      this.fetchAllocatedTeams();
      this.fetchTAName(); 
    },
    methods: {
      loginWithGitHub() {
        const clientId = 'Ov23liKVYMe97F4UGF34';
        const redirectUri = encodeURIComponent(window.location.origin + '/oauth/callback');
        const scope = 'repo user';
  
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
        window.location.href = authUrl;
      },
  
          // Check if the user is authenticated
          checkAuthentication() {
            const token = this.getCookie('github_token'); // Check if the github_token cookie is present
            this.isAuthenticated = token !== null; // Set isAuthenticated based on the presence of the token
          },
      
          // Get cookie value by name
          getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            return null;  // Return null if the cookie is not found
          },
      
          // Logout from GitHub
          logoutFromGitHub() {
            // Clear the GitHub token cookie and localStorage
            document.cookie = "github_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            localStorage.removeItem('github_token');
            
            // Set the authentication status to false
            this.isAuthenticated = false;
            
            // Redirect user to login or another page
            this.$router.push({ path: '/ta_home' });
          },
  
      handleGitHubCallback() {
        // Function to get a cookie by name
        function getCookie(name) {
          let match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
          if (match) return match[2];
          return null;
        }
    
        // Check for 'github_token' cookie after redirect
        const token = getCookie('github_token');
        
        if (token) {
          // Store the token in localStorage
          localStorage.setItem('github_token', token);
          console.log('GitHub token saved to localStorage:', token);
    
          // Redirect the user to the appropriate page
          window.location.href = '#/ta_home'; // Redirect after successful login
        }
      },
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
  };
  