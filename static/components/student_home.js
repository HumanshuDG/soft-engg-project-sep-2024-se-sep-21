export default {
  template: `
    <div>
      <div id="student-home" class="container mt-4">
        <div class="row">
          <div class="col-12 col-md-4">
            <div class="card mb-4">
              <div class="card-body text-center">
                <img :src="student.avatar_url || 'https://via.placeholder.com/100'" 
                     alt="GitHub Profile Photo" 
                     class="profile-photo rounded-circle mb-3" 
                     style="width: 100px; height: 100px;" />
                          <h5 class="card-title">
                            {{ student.name }}
                            <button class="btn btn-sm btn-link" @click="openUpdateModal">
                              <i class="fa-solid fa-pencil"></i>
                            </button>
                          </h5>
                <p class="card-text">GitHub: {{ student.github_id }}</p>
                <p class="card-text">Email: {{ student.email }}</p>
              </div>
            </div>
          </div>

          <!-- Update Modal for Name and GitHub ID -->
          <div class="modal fade show" v-if="showUpdateModal" tabindex="-1" role="dialog" aria-labelledby="updateModalLabel" aria-hidden="true" style="display: block;">
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="updateModalLabel">Update Name and GitHub ID</h5>
                  <button type="button" class="btn-close" @click="closeUpdateModal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <form @submit.prevent="submitUpdate">
                    <div class="mb-3">
                      <label for="newName" class="form-label">New Name</label>
                      <input type="text" class="form-control" id="newName" v-model="newName" required />
                    </div>
                    <div class="mb-3">
                      <label for="newGitHubId" class="form-label">New GitHub ID</label>
                      <input type="text" class="form-control" id="newGitHubId" v-model="newGitHubId" required />
                    </div>
                    <button type="submit" class="btn btn-success">Update</button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 col-md-8">
            <h2 class="greeting">Hello, {{ student.name }}! Here are the available projects:</h2>
            <div class="row">
              <div v-if="projects.length">
                <div v-for="project in projects" :key="project.id" class="col-12 col-md-6 mb-4">
                  <div class="card project-card" style="max-width: 100%;">
                    <div class="card-body">
                      <h5 class="card-title">{{ project.name }}</h5>
                      
                      <!-- Team Cards -->
                      <div class="mt-4">
                        <h5>Team Details</h5>
                        <div>
                          <div 
                            class="team-card card mb-3 p-3 w-100" 
                            v-for="team in project.teams" 
                            :key="team.id"
                          >
                            <h6>Team Name: {{ team.team_name }}</h6>
                            <h6>Members:</h6>
                            <ul>
                              <li v-for="member in team.members" :key="member.id">{{ member.name }}</li>
                            </ul>

                            <!-- Flex container for buttons -->
                            <div class="d-flex justify-content-between align-items-center mt-2">
                              <button class="btn btn-primary btn-sm" @click="viewTeam(team.id)">View Team</button>
                              <!-- Conditional Display for Assign TA -->
                              <div>
                                <div v-if="!team.ta_allocations || team.ta_allocations.length === 0">
                                  <!-- If no TA is assigned, show the 'TA Not Assigned' message in red -->
                                  <p style="color: red; font-weight: bold;">TA Not Assigned</p>
                                </div>
                                <div v-else>
                                  <!-- If a TA is assigned, display the assigned TA's name in a styled manner -->
                                  <div class="assigned-ta-info">
                                    <h6 class="m-0" style="color: #4caf50; font-weight: bold;">
                                      Assigned TA: {{ team.ta_allocations[0].ta.name }}
                                    </h6>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>


                      <!-- Button Group with Flex Wrap -->
                      <div class="d-flex flex-wrap mt-3">
                        <button @click="viewProjectDetails(project)" class="btn btn-info me-2 mb-2">Project Details</button>
                        <button 
    v-if="!isStudentEnrolledInProject(project.id)"
    @click="openEnrollmentModal(project)" 
    class="btn btn-primary mb-2"
  >
    Enroll
  </button>

  <span v-else class="btn btn-success mb-2" style="cursor: default;">Enrolled</span>
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
      </div>
      
      <!-- Enrollment Modal -->
      <div class="modal fade show" v-if="showEnrollmentModal" tabindex="-1" role="dialog" aria-labelledby="enrollmentModalLabel" aria-hidden="true" style="display: block;">
        <div class="modal-dialog modal-dialog-centered modal-lg">
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

      <!-- Project Details Modal -->
      <div class="modal fade show" v-if="showProjectDetailsModal" tabindex="-1" role="dialog" aria-labelledby="projectDetailsModalLabel" aria-hidden="true" style="display: block;">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="projectDetailsModalLabel">{{ selectedProject.name }}</h5>
              <button type="button" class="btn-close" @click="closeProjectDetailsModal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p><strong>Description:</strong> {{ selectedProject.description }}</p>
              <p><strong>Min Team Size:</strong> {{ selectedProject.min_teammates }}</p>
              <p><strong>Max Team Size:</strong> {{ selectedProject.max_teammates }}</p>
              <p><strong>Deadline:</strong> {{ selectedProject.deadline }}</p>
            </div>
          </div>
        </div>
      </div>


    </div>
  `,
  // Component data, created lifecycle hook, and methods as in your original code

  data() {
    return {
      student: {},
      projects: [],
      showEnrollmentModal: false,
      repo: '',
      selectedTeam: '',
      teams: [],
      newTeamName: '',
      selectedProject: null,
      showProjectDetailsModal: false,
      showUpdateModal: false,
      newName: '',
      newGitHubId: '',
    };
  },
  created() {
    this.fetchStudentInfo();
    this.fetchProjects();
  },
  methods: {
    viewTeam(teamId) {
      this.$router.push({ name: 'project_team_std', params: { teamId } });
    },
    async fetchStudentInfo() {
      try {
        const userId = localStorage.getItem("user_id");
        const response = await fetch(`/api/users/${userId}`);
        if (response.ok) {
          this.student = await response.json();
          await this.fetchGitHubProfile(this.student.github_id);
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
          this.$set(this.student, 'avatar_url', githubData.avatar_url);
        } else {
          console.error("Error fetching GitHub profile:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching GitHub profile:", error);
      }
    },
    async fetchProjects() {
      try {
        const response = await fetch('/api/projects');
        if (response.ok) {
          const projects = await response.json();
          const userId = localStorage.getItem("user_id");
          const parsedUserId = parseInt(userId, 10);
    
          for (const project of projects) {
            const teamResponse = await fetch(`/api/projects/${project.id}/teams`);
            if (teamResponse.ok) {
              const teams = await teamResponse.json();
              project.teams = teams.filter(team =>
                team.members.some(member => parseInt(member.user_id, 10) === parsedUserId)
              );
            } else {
              console.error('Error fetching teams for project:', project.name);
              project.teams = [];
            }
          }
    
          this.projects = projects;
        } else {
          console.error('Error fetching projects:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    },
    
    isStudentEnrolledInProject(projectId) {
      const project = this.projects.find(proj => proj.id === projectId);
      return project && project.teams.length > 0;
    },

    openEnrollmentModal(project) {
      this.selectedProject = project.id;
      this.showEnrollmentModal = true;
      this.fetchTeams(project.id);
    },
    closeEnrollmentModal() {
      this.showEnrollmentModal = false;
      this.repo = '';
      this.selectedTeam = '';
      this.newTeamName = '';
      this.selectedProject = null;
    },

    openUpdateModal() {
      this.newName = this.student.name; // Set the current name as the default
      this.newGitHubId = this.student.github_id; // Set the current GitHub ID as the default
      this.showUpdateModal = true;
    },
    closeUpdateModal() {
      this.showUpdateModal = false;
      this.newName = '';
      this.newGitHubId = '';
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
        const selectedTeamId = this.selectedTeam || null;
        let newTeamId = null;
    
        if (!selectedTeamId && this.newTeamName) {
          const teamResponse = await fetch('/api/teams', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              team_name: this.newTeamName,
              project_id: this.selectedProject,
              repo: this.repo,
            })
          });
    
          if (!teamResponse.ok) {
            console.error("Error creating new team:", teamResponse.statusText);
            return;
          }
    
          const teamData = await teamResponse.json();
          newTeamId = teamData.id;
        }
    
        const finalTeamId = selectedTeamId || newTeamId;
    
        const enrollmentResponse = await fetch('/api/enrollments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            student_id: userId,
            team_id: finalTeamId,
            project_id: this.selectedProject
          })
        });
    
        if (enrollmentResponse.ok) {
          alert('Enrollment successful!');
          this.closeEnrollmentModal();
          await this.fetchProjects();
        } else {
          const errorData = await enrollmentResponse.json();
          alert(errorData.message || "Enrollment failed: Already Enrolled.");
        }
      } catch (error) {
        console.error("Error enrolling:", error);
      }
    },

    async submitUpdate() {
      try {
        const userId = localStorage.getItem("user_id");
        const response = await fetch(`/api/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: this.newName,
            github_id: this.newGitHubId,
          }),
        });

        if (response.ok) {
          alert('Name and GitHub ID updated successfully!');
          this.student.name = this.newName; // Update local student data
          this.student.github_id = this.newGitHubId; // Update local student data
          this.closeUpdateModal();
        } else {
          alert('Error updating name and GitHub ID');
        }
      } catch (error) {
        console.error("Error updating name and GitHub ID:", error);
      }
    },

    viewProjectDetails(project) {
      this.selectedProject = project;
      this.showProjectDetailsModal = true;
    },
    closeProjectDetailsModal() {
      this.showProjectDetailsModal = false;
      this.selectedProject = null;
    },
  }
};
