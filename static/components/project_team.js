export default {
    template: `
      <div id="team-details" class="container mt-4">
        <h2 class="mb-4 text-center">Team Details</h2>
        
        <div v-if="team">
          <!-- Team Information Card -->
          <div class="card mb-4">
            <div class="card-header bg-primary text-white">
              Team Information
            </div>
            <div class="card-body">
              <h5 class="card-title">Team Name: {{ team.team_name }}</h5>
              <p><strong>Project ID:</strong> {{ team.project_id }}</p>
              <p>
                <strong>GitHub Repo:</strong>
                <a :href="team.repo" target="_blank" rel="noopener noreferrer">{{ team.repo }}</a>
              </p>
            </div>
          </div>
  
          <!-- Container for side-by-side scrollable sections -->
          <div class="row">
            <div class="col-md-4 mb-4">
              <div class="card h-100">
                <div class="card-header bg-info text-white">
                  Recent Commits
                </div>
                <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
                  <table class="table mb-0">
                    <thead class="thead-light">
                      <tr>
                        <th>Message</th>
                        <th>Author</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="commit in commits" :key="commit.sha">
                        <td>{{ commit.commit.message }}</td>
                        <td>{{ commit.commit.author.name }}</td>
                        <td>{{ new Date(commit.commit.author.date).toLocaleDateString() }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
  
            <div class="col-md-4 mb-4">
              <div class="card h-100">
                <div class="card-header bg-success text-white">
                  Open Pull Requests
                </div>
                <div class="list-group list-group-flush" style="max-height: 300px; overflow-y: auto;">
                  <a v-for="pr in pullRequests" :key="pr.id" :href="pr.html_url" target="_blank" class="list-group-item list-group-item-action">
                    {{ pr.title }} by {{ pr.user.login }}
                  </a>
                </div>
              </div>
            </div>
  
            <div class="col-md-4 mb-4">
              <div class="card h-100">
                <div class="card-header bg-warning text-dark">
                  Open Issues
                </div>
                <div class="list-group list-group-flush" style="max-height: 300px; overflow-y: auto;">
                  <a v-for="issue in issues" :key="issue.id" :href="issue.html_url" target="_blank" class="list-group-item list-group-item-action">
                    {{ issue.title }} by {{ issue.user.login }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else>
          <p class="text-center">Loading team details...</p>
        </div>
      </div>
    `,
    data() {
      return {
        team: null,
        commits: [],
        pullRequests: [],
        issues: []
      };
    },
    created() {
      const teamId = this.$route.params.teamId;
      this.fetchTeamDetails(teamId);
    },
    methods: {
      async fetchTeamDetails(teamId) {
        try {
          const response = await fetch(`/api/teams/${teamId}`);
          if (response.ok) {
            const data = await response.json();
            this.team = data;
            this.fetchGitHubData(data.repo); // Trigger GitHub data fetch for the repo
          } else {
            console.error("Failed to fetch team details.");
          }
        } catch (error) {
          console.error("Error fetching team details:", error);
        }
      },
      async fetchGitHubData(repoUrl) {
        const repoName = repoUrl.split("github.com/")[1];
  
        // Fetch recent commits
        try {
          const commitsResponse = await fetch(`https://api.github.com/repos/${repoName}/commits`);
          if (commitsResponse.ok) {
            this.commits = await commitsResponse.json();
          } else {
            console.error("Failed to fetch commits.");
          }
        } catch (error) {
          console.error("Error fetching commits:", error);
        }
  
        // Fetch open pull requests
        try {
          const prsResponse = await fetch(`https://api.github.com/repos/${repoName}/pulls?state=open`);
          if (prsResponse.ok) {
            this.pullRequests = await prsResponse.json();
          } else {
            console.error("Failed to fetch pull requests.");
          }
        } catch (error) {
          console.error("Error fetching pull requests:", error);
        }
  
        // Fetch open issues
        try {
          const issuesResponse = await fetch(`https://api.github.com/repos/${repoName}/issues?state=open`);
          if (issuesResponse.ok) {
            this.issues = await issuesResponse.json();
          } else {
            console.error("Failed to fetch issues.");
          }
        } catch (error) {
          console.error("Error fetching issues:", error);
        }
      }
    }
  };
  