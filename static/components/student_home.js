export default {
    template: `
      <div id="student-home" class="container mt-4">
        <div class="row">
          <div class="col-md-4">
            <div class="card mb-4">
              <div class="card-body text-center">
                <img :src="student.avatar_url || 'https://via.placeholder.com/100'" alt="GitHub Profile Photo" class="profile-photo rounded-circle mb-3" style="width: 100px; height: 100px;" />
                <h5 class="card-title">{{ student.name }}</h5>
                <p class="card-text">GitHub: {{ student.github }}</p>
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
                        <button @click="enrollInProject(project.id)" class="btn btn-primary">Enroll</button>
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
    `,
    data() {
      return {
        student: {},
        projects: []
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
            await this.fetchGitHubProfile(this.student.github); // Assume `github_username` is stored
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
      async enrollInProject(projectId) {
        const repoUrl = prompt("Please enter your GitHub repository URL:");
  
        if (!repoUrl) {
          alert("Repository URL is required to enroll.");
          return;
        }
  
        try {
          const response = await fetch(`/api/teams`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project_id: projectId, user_id: this.student.id, repo: repoUrl })
          });
  
          const result = await response.json();
  
          if (response.ok) {
            alert(result.message);
            this.fetchProjects();
          } else {
            alert(result.message);
          }
        } catch (error) {
          console.error("Error enrolling in project:", error);
          alert("Enrollment failed due to an error.");
        }
      },
      viewProject(projectId) {
        console.log(`Viewing project with ID: ${projectId}`);
      }
    }
  };
  