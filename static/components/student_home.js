export default {
  template: `
    <div id="student-home" class="container mt-4">
      <div class="row">
        <div class="col-md-4">
          <div class="card mb-4">
            <div class="card-body text-center">
              <img :src="student.avatar_url || 'https://via.placeholder.com/100'" alt="GitHub Profile Photo" class="profile-photo rounded-circle mb-3" style="width: 100px; height: 100px;" />
              <h5 class="card-title">{{ student.name }}</h5>
              <p class="card-text">GitHub: {{ student.github_id }}</p>
              <p class="card-text">Email: {{ student.email }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-8">
          <h2 class="greeting">Hello, {{ student.name }}! Here are the available projects:</h2>
          <div class="row">
            <div v-if="projects.length">
              <div v-for="project in projects" :key="project.id" class="col-md-6 mb-4">
                <div class="card project-card">
                  <div class="card-body">
                    <h5 class="card-title">{{ project.name }}</h5>
                    <p class="card-text">{{ project.description }}</p>
                    <p class="card-text"><strong>Min Team Size:</strong> {{ project.min_teammates }}</p>
                    <p class="card-text"><strong>Max Team Size:</strong> {{ project.max_teammates }}</p>
                    <div class="button-group">
                      <button @click="viewProject(project.id)" class="btn btn-info me-2">View</button>
                      <button @click="openEnrollmentModal(project)" class="btn btn-primary">Enroll</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else>
              <p>No projects available at the moment.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Enrollment Modal -->
      <div class="modal fade show" v-if="showEnrollmentModal" tabindex="-1" role="dialog" aria-labelledby="enrollmentModalLabel" aria-hidden="false" style="display: block;">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="enrollmentModalLabel">Enroll in Project</h5>
              <button type="button" class="btn-close" @click="closeEnrollmentModal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="submitEnrollment">
                <div class="mb-3">
                  <label for="repo" class="form-label">GitHub Repo URL</label>
                  <input type="url" class="form-control" id="repo" v-model="repo" required />
                </div>
                <div class="mb-3">
                  <label for="teamSelect" class="form-label">Select Team</label>
                  <select id="teamSelect" class="form-select" v-model="selectedTeam" :disabled="!teams.length">
                    <option v-if="teams.length" v-for="team in teams" :key="team.id" :value="team.id">{{ team.team_name }}</option>
                    <option value="">Create New Team</option>
                  </select>
                  <div v-if="!teams.length" class="text-muted mt-2">
                    No teams available. Please create a new team.
                  </div>
                </div>
                <div v-if="selectedTeam === ''" class="mb-3">
                  <label for="newTeamName" class="form-label">New Team Name</label>
                  <input type="text" class="form-control" id="newTeamName" v-model="newTeamName" required />
                </div>
                <button type="submit" class="btn btn-success">Submit</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      student: {},
      projects: [],
      showEnrollmentModal: false,
      repo: '',
      selectedTeam: '',
      teams: [], // Store fetched teams
      newTeamName: '',
      selectedProject: null // Keep track of selected project
    };
  },
  created() {
    this.fetchStudentInfo();
    this.fetchProjects();
  },
  methods: {
    async fetchStudentInfo() {
      try {
        const userId = localStorage.getItem("user_id");
        const response = await fetch(`/api/users/${userId}`);
        if (response.ok) {
          this.student = await response.json();
          await this.fetchGitHubProfile(this.student.github_id); // Assume `github_username` is stored
        }
      } catch (error) {
        console.error("Error fetching student info:", error);
      }
    },
    async fetchGitHubProfile(username) {
      try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        if (response.ok) {
          const githubData = await response.json();
          this.$set(this.student, 'avatar_url', githubData.avatar_url); // Use $set to ensure reactivity
        } else {
          console.error("Error fetching GitHub profile:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching GitHub profile:", error);
      }
    },
    async fetchProjects() {
      try {
        const response = await fetch("/api/projects");
        if (response.ok) {
          this.projects = await response.json();
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    },
    openEnrollmentModal(project) {
      this.selectedProject = project.id; // Save the selected project ID
      this.showEnrollmentModal = true;
      this.fetchTeams(project.id); // Fetch teams for the selected project
    },
    closeEnrollmentModal() {
      this.showEnrollmentModal = false;
      this.repo = '';
      this.selectedTeam = '';
      this.newTeamName = '';
      this.selectedProject = null; // Reset the selected project
    },
    async fetchTeams(projectId) {
      try {
        const response = await fetch(`/api/projects/${projectId}/teams`);
        if (response.ok) {
          this.teams = await response.json();
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    },
    
    async submitEnrollment() {
      try {
        const userId = localStorage.getItem("user_id");
        const selectedTeamId = this.selectedTeam || null; // Use existing team if selected
        let newTeamId = null; // This will hold the ID if a new team is created
    
        // Step 1: Create a new team if no existing team is selected and a new team name is provided
        if (!selectedTeamId && this.newTeamName) {
          const teamResponse = await fetch('/api/teams', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              team_name: this.newTeamName,
              project_id: this.selectedProject,  // Ensure the team is created under the correct project
              repo: this.repo,
            })
          });
    
          if (!teamResponse.ok) {
            console.error("Error creating new team:", teamResponse.statusText);
            return; // Exit if team creation fails
          }
    
          const teamData = await teamResponse.json();
          newTeamId = teamData.id; // Capture the new team's ID
        }
    
        // Step 2: Use either the selected team ID or the newly created team ID for enrollment
        const finalTeamId = selectedTeamId || newTeamId;
    
        // Step 3: Proceed with enrollment using the final team ID
        const enrollmentResponse = await fetch('/api/enrollments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            student_id: userId,
            team_id: finalTeamId,
            project_id: this.selectedProject  // Specify the project ID for enrollment
          })
        });
    
        if (enrollmentResponse.ok) {
          alert('Enrollment successful!');
          this.closeEnrollmentModal();
          await this.fetchProjects(); // Refresh projects to reflect any changes
        } else {
          const errorData = await enrollmentResponse.json();
          alert(errorData.message || "Enrollment failed : Already Enrolled.");
        }
      } catch (error) {
        console.error("Error enrolling:", error);
      }
    },
    
    
  }
};
