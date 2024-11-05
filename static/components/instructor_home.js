export default {
  template: `
    <div class="container mt-3">
      <div class="row">
        <div class="col-md-12">
          <h3>Welcome Instructor: {{ instructorName }}!</h3>
          <button class="btn btn-primary float-end" @click="showModal = true">Create Project</button>
        </div>
      </div>

      <!-- Available Projects -->
      <div class="row mt-4">
        <div class="col-md-12" v-for="project in projects" :key="project.id">
          <div class="card p-3 mb-3">
            <div class="project-header d-flex justify-content-between align-items-center">
              <h4 class="mb-0">{{ project.name }}</h4>
              <div>
                <button class="btn btn-success me-2" @click="openEditModal(project)">Edit</button>
                <button class="btn btn-danger" @click="confirmDeleteProject(project)">Delete</button>
              </div>
            </div>
            <div class="row mt-3">
              <div class="col-md-12">
                <p>{{ project.description }}</p>
              </div>
            </div>

            <!-- Team Cards -->
            <div class="mt-4">
              <h5>Teams Enrolled</h5>
              <div class="row">
                <div
                  class="team-card card mb-3 p-3 col-md-4"
                  v-for="team in project.teams"
                  :key="team.id"
                >
                  <h6> Team Name: {{ team.team_name }}</h6>

                  <h6>Members:</h6>
                  <ul>
                    <li v-for="member in team.members" :key="member.id">{{ member.name }}</li>
                  </ul>

                  <!-- Flex container for buttons -->
                  <div class="d-flex justify-content-between align-items-center mt-2">
                    <!-- Button to View Team -->
                    <button class="btn btn-primary" @click="viewTeam(team.id)">View Team</button>

                    <!-- Conditional Display for Assign TA -->
                    <div>
                      <div v-if="team.ta_id == null">
                        <button class="btn btn-secondary" @click="openAssignTAModal(team.id)">Assign TA</button>
                      </div>
                      <div v-else>
                        <h6 class="m-0">Assigned TA: {{ team.ta.name }}</h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <div class="project-footer d-flex justify-content-between align-items-center mt-3">
              <button class="btn btn-warning milestone-btn" @click="openMilestoneModal(project)">Milestones</button>
              <span class="mx-auto"><strong>Created On:</strong> {{ project.created_on }}</span>
              <span><strong>Deadline:</strong> {{ project.deadline }}</span>
            </div>
          </div>
        </div>
      </div>

        <!-- Assign TA Modal -->
        <div class="modal fade show" v-if="showAssignTAModal" tabindex="-1" role="dialog" aria-labelledby="assignTAModalLabel" aria-hidden="false" style="display: block;">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="assignTAModalLabel">Assign TA to Team</h5>
                <button type="button" class="btn-close" @click="closeAssignTAModal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <h6>Available TAs</h6>
                <ul>
                  <li v-for="ta in availableTAs" :key="ta.id">
                    {{ ta.name }}
                    <button @click="assignTA(ta.id)" class="btn btn-sm btn-primary">Assign</button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>



      <!-- Create Project Modal -->
      <div class="modal fade show" v-if="showModal" tabindex="-1" role="dialog" aria-labelledby="createProjectModalLabel" aria-hidden="false" style="display: block;">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="createProjectModalLabel">New Project</h5>
              <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="createProject">
                <div class="mb-3">
                  <label for="projectName" class="form-label">Project Name</label>
                  <input type="text" class="form-control" id="projectName" v-model="newProject.name" required />
                </div>
                <div class="mb-3">
                  <label for="projectDescription" class="form-label">Project Description</label>
                  <textarea class="form-control" id="projectDescription" v-model="newProject.description" required></textarea>
                </div>
                <div class="mb-3">
                  <label for="Deadline" class="form-label">Deadline</label>
                  <input type="date" class="form-control" id="startDate" v-model="newProject.deadline" required />
                </div>
                <div class="mb-3">
                  <label for="minTeammates" class="form-label">Minimum Teammates</label>
                  <input type="number" class="form-control" id="minTeammates" v-model="newProject.min_teammates" min="1" required />
                </div>
                <div class="mb-3">
                  <label for="maxTeammates" class="form-label">Maximum Teammates</label>
                  <input type="number" class="form-control" id="maxTeammates" v-model="newProject.max_teammates" min="1" required />
                </div>
                <button type="submit" class="btn btn-success">Submit</button>
              </form>
            </div>
          </div>
        </div>
      </div>


      <!-- Edit Project Modal -->
      <div class="modal fade show" v-if="editModalVisible" tabindex="-1" role="dialog" aria-labelledby="editProjectModalLabel" aria-hidden="false" style="display: block;">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="editProjectModalLabel">Edit Project</h5>
              <button type="button" class="btn-close" @click="closeEditModal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="updateProject">
                <div class="mb-3">
                  <label for="editProjectName" class="form-label">Project Name</label>
                  <input type="text" class="form-control" id="editProjectName" v-model="selectedProject.name" required />
                </div>
                <div class="mb-3">
                  <label for="editProjectDescription" class="form-label">Project Description</label>
                  <textarea class="form-control" id="editProjectDescription" v-model="selectedProject.description" required></textarea>
                </div>
                <div class="mb-3">
                  <label for="editDeadline" class="form-label">Deadline</label>
                  <input type="date" class="form-control" id="editDeadline" v-model="selectedProject.deadline" required />
                </div>
                <div class="mb-3">
                  <label for="editMinTeammates" class="form-label">Minimum Teammates</label>
                  <input type="number" class="form-control" id="editMinTeammates" v-model="selectedProject.min_teammates" min="1" required />
                </div>
                <div class="mb-3">
                  <label for="editMaxTeammates" class="form-label">Maximum Teammates</label>
                  <input type="number" class="form-control" id="editMaxTeammates" v-model="selectedProject.max_teammates" min="1" required />
                </div>
                <button type="submit" class="btn btn-success">Update</button>
              </form>
            </div>
          </div>
        </div>
      </div>

        <!-- Milestone Modal -->
      <div class="modal fade show" v-if="milestoneModalVisible" tabindex="-1" role="dialog" aria-labelledby="milestoneModalLabel" aria-hidden="false" style="display: block;">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="milestoneModalLabel">{{ currentProject.name }} - Milestones</h5>
              <button type="button" class="btn-close" @click="closeMilestoneModal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <!-- Existing Milestones List -->
              <ul class="list-group mb-3">
                <li class="list-group-item" v-for="milestone in currentProject.milestones" :key="milestone.id">
                  <div>
                    <strong>Milestone {{ milestone.milestone_number }}</strong> (Due: {{ milestone.deadline }})
                    <button class="btn btn-warning btn-sm float-end" @click="openEditMilestoneModal(milestone)">Edit</button>
                    <button class="btn btn-danger btn-sm float-end me-2" @click="confirmDeleteMilestone(milestone)">Delete</button>
                  </div>
                </li>
              </ul>

              <!-- Add New Milestone Form -->
              <h6>Add New Milestone:</h6>
              <form @submit.prevent="createMilestone">
                <div class="mb-3">
                  <label for="milestone_number" class="form-label">Milestone Number</label>
                  <input type="number" class="form-control" id="milestone_number" v-model="milestone_number" required />
                </div>
                <div class="mb-3">
                  <label for="milestoneDescription" class="form-label">Description</label>
                  <textarea class="form-control" id="milestoneDescription" v-model="milestoneDescription"></textarea>
                </div>
                <div class="mb-3">
                  <label for="milestoneDueDate" class="form-label">Due Date</label>
                  <input type="date" class="form-control" id="milestoneDueDate" v-model="milestoneDueDate" required />
                </div>
                <button type="submit" class="btn btn-primary">Create Milestone</button>
              </form>
            </div>
          </div>
        </div>
      </div>


      <!-- Delete Project Confirmation Modal -->
      <div class="modal fade show" v-if="deleteModalVisible" tabindex="-1" role="dialog" aria-labelledby="deleteConfirmationLabel" aria-hidden="false" style="display: block;">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="deleteConfirmationLabel">Confirm Delete</h5>
              <button type="button" class="btn-close" @click="closeDeleteModal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              Are you sure you want to delete the project <strong>{{ selectedProject.name }}</strong>?
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeDeleteModal">Cancel</button>
              <button class="btn btn-danger" @click="deleteProject">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-backdrop fade show" v-if="showModal || editModalVisible || deleteModalVisible" @click="closeModal"></div>
    </div>
  `,
  data() {
    return {
      projects: [],
      showModal: false,
      editModalVisible: false,
      deleteModalVisible: false,
      selectedProject: {
        id: null,
        creator_id : localStorage.getItem('user_id'),
        name: '',
        deadline: '',
        max_teammates: 1,
        min_teammates: 1,
        description: '',
      },
      newProject: {
        name: '',
        creator_id : localStorage.getItem('user_id'),
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
        const response = await fetch('/api/tas'); // Replace with your actual API endpoint
        if (response.ok) {
          this.availableTAs = await response.json(); // Assuming the response is an array of TAs
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
    
    async loadProject(projectId) {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (response.ok) {
          const projectData = await response.json();
          this.projects = [projectData]; // Assuming it returns a single project
          await this.fetchMilestones(projectId);
        } else {
          console.error('Error loading project:', response.statusText);
        }
      } catch (error) {
        console.error('Error loading project:', error);
      }
    },
  
    async fetchMilestones(projectId) {
      try {
        const response = await fetch(`/api/milestones_list?project_id=${projectId}`);
        if (response.ok) {
          const milestones = await response.json();
          const project = this.projects.find(p => p.id === projectId);
          if (project) {
            project.milestones = milestones;
          }
        } else {
          console.error('Error fetching milestones:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching milestones:', error);
      }
    },
  
    async openMilestoneModal(project) {
      this.currentProject = project;
      this.milestone_number = '';
      this.milestoneName = '';
      this.milestoneDescription = '';
      this.milestoneDueDate = '';
    
      // Fetch milestones for the selected project before opening the modal
      await this.fetchMilestones(project.id);
      
      // Set milestones for display in the modal
      this.milestones = project.milestones || [];
      
      this.milestoneModalVisible = true;
    },
  
    closeMilestoneModal() {
      this.milestoneModalVisible = false;
      this.currentMilestoneId = null;
    },
  
    async createMilestone() {
      const milestoneData = {
        name: this.milestoneName,
        milestone_number : this.milestone_number,
        description: this.milestoneDescription,
        deadline: this.milestoneDueDate,
        project_id: this.currentProject.id,
      };
  
      try {
        const response = await fetch('/api/milestones', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(milestoneData),
        });
  
        if (response.ok) {
          await this.fetchMilestones(this.currentProject.id);
          this.closeMilestoneModal();
        } else {
          console.error('Error creating milestone:', response.statusText);
        }
      } catch (error) {
        console.error('Error creating milestone:', error);
      }
    },
  
    openEditMilestoneModal(milestone) {
      this.milestoneName = milestone.name;
      this.milestoneDescription = milestone.description;
      this.milestoneDueDate = milestone.due_date;
      this.currentMilestoneId = milestone.id;
      this.milestoneModalVisible = true;
    },
  
    async confirmDeleteMilestone(milestone) {
      if (confirm('Are you sure you want to delete this milestone?')) {
        try {
          const response = await fetch(`/api/milestones/${milestone.id}`, {
            method: 'DELETE',
          });
          if (response.ok) {
            await this.fetchMilestones(this.currentProject.id);
          } else {
            console.error('Error deleting milestone:', response.statusText);
          }
        } catch (error) {
          console.error('Error deleting milestone:', error);
        }
      }
    },
  
    async fetchProjects() {
      try {
        const response = await fetch('/api/projects');
        if (response.ok) {
          const projects = await response.json();
          
          // Fetch teams for each project
          for (const project of projects) {
            const teamResponse = await fetch(`/api/projects/${project.id}/teams`);
            if (teamResponse.ok) {
              project.teams = await teamResponse.json();
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
  
    openEditModal(project) {
      this.selectedProject = { ...project };
      this.editModalVisible = true;
    },
  
    closeEditModal() {
      this.editModalVisible = false;
      this.resetSelectedProject();
    },
  
    confirmDeleteProject(project) {
      this.selectedProject = project;
      this.deleteModalVisible = true;
    },
  
    closeDeleteModal() {
      this.deleteModalVisible = false;
      this.resetSelectedProject();
    },
  
    closeModal() {
      this.showModal = false;
      this.resetNewProject();
    },
  
    async createProject() {
      try {
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.newProject),
        });
  
        if (response.ok) {
          const createdProject = await response.json();
          this.projects.push(createdProject);
          this.closeModal();
        } else {
          console.error('Error creating project:', response.statusText);
        }
      } catch (error) {
        console.error('Error creating project:', error);
      }
    },
  
    async updateProject() {
      try {
        const response = await fetch(`/api/projects/${this.selectedProject.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.selectedProject),
        });
  
        if (response.ok) {
          const updatedProject = await response.json();
          const index = this.projects.findIndex(p => p.id === updatedProject.id);
          this.$set(this.projects, index, updatedProject);
          this.closeEditModal();
        } else {
          console.error('Error updating project:', response.statusText);
        }
      } catch (error) {
        console.error('Error updating project:', error);
      }
    },
  
    async deleteProject() {
      try {
        const response = await fetch(`/api/projects/${this.selectedProject.id}`, {
          method: 'DELETE',
        });
  
        if (response.ok) {
          this.projects = this.projects.filter(p => p.id !== this.selectedProject.id);
          this.closeDeleteModal();
        } else {
          console.error('Error deleting project:', response.statusText);
        }
      } catch (error) {
        console.error('Error deleting project:', error);
      }
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
  
    resetSelectedProject() {
      this.selectedProject = {
        id: null,
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        min_teammates: 1,
        max_teammates: 1,
      };
    },
  
    resetNewProject() {
      this.newProject = {
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        min_teammates: 1,
        max_teammates: 1,
      };
    },
  },
}