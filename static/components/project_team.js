export default {
  template: `
    <div id="team-details" class="container mt-4">      
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-center">Team Details</h2>
        <!-- New GenAI Button -->
        <button class="btn btn-secondary" @click="goToGenAI(team.id)">GenAI</button>
      </div>

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
            <h6>Members:</h6>
            <ul>
              <li v-for="member in team.members" :key="member.id">{{ member.name }}</li>
            </ul>
          </div>
        </div>
        <h2 class="mb-4 text-center">GitHub Repo Details</h2>
        <!-- Row for Commits, Pull Requests, and Issues with scrollable cards -->
        <div class="row">
          <div class="col-md-4 mb-4">
            <div class="card h-100">
              <div class="card-header bg-info text-white">
                Recent Commits
              </div>
              <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
                <table class="table table-striped mb-0">
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
              <div class="list-group list-group-flush overflow-auto" style="max-height: 300px;">
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
              <div class="list-group list-group-flush overflow-auto" style="max-height: 300px;">
                <a v-for="issue in issues" :key="issue.id" :href="issue.html_url" target="_blank" class="list-group-item list-group-item-action">
                  {{ issue.title }} by {{ issue.user.login }}
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="row mt-4">
        <h2 class="mb-4 text-center">Team Statistics</h2>
          <div class="col-md-4">
            <div class="card">
              <div class="card-header bg-info text-white">Commits per Day</div>
              <div class="card-body">
                <canvas id="commitsChart"></canvas>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card">
              <div class="card-header bg-success text-white">Pull Requests by User</div>
              <div class="card-body">
                <canvas id="pullRequestsChart"></canvas>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card">
              <div class="card-header bg-warning text-dark">Issues by User</div>
              <div class="card-body">
                <canvas id="issuesChart"></canvas>
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
      issues: [],
    };
  },
  created() {
    const teamId = this.$route.params.teamId;
    this.fetchTeamDetails(teamId);
  },
  methods: {
    goToGenAI(teamId) {
      this.$router.push({ name: 'gen_ai', params: { teamId } });
    },
    async fetchTeamDetails(teamId) {
      try {
        const response = await fetch(`/api/teams/${teamId}`);
        if (response.ok) {
          const data = await response.json();
          this.team = data;
          this.fetchGitHubData(data.repo);
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
          this.setupCommitsChart();
        }
      } catch (error) {
        console.error("Error fetching commits:", error);
      }
  
      // Fetch open pull requests
      try {
        const prsResponse = await fetch(`https://api.github.com/repos/${repoName}/pulls?state=open`);
        if (prsResponse.ok) {
          this.pullRequests = await prsResponse.json();
          this.setupPullRequestsChart();
        }
      } catch (error) {
        console.error("Error fetching pull requests:", error);
      }
  
      // Fetch open issues
      try {
        const issuesResponse = await fetch(`https://api.github.com/repos/${repoName}/issues?state=open`);
        if (issuesResponse.ok) {
          this.issues = await issuesResponse.json();
          this.setupIssuesChart();
        }
      } catch (error) {
        console.error("Error fetching issues:", error);
      }
    },
    setupCommitsChart() {
      const dates = this.commits.map(commit => new Date(commit.commit.author.date).toLocaleDateString());
      const commitsPerDay = dates.reduce((counts, date) => {
        counts[date] = (counts[date] || 0) + 1;
        return counts;
      }, {});

      new Chart(document.getElementById("commitsChart"), {
        type: "bar",
        data: {
          labels: Object.keys(commitsPerDay),
          datasets: [{ label: "Commits", data: Object.values(commitsPerDay), backgroundColor: "rgba(0, 123, 255, 0.6)" }]
        },
        options: { responsive: true, scales: { x: { beginAtZero: true } } }
      });
    },
    setupPullRequestsChart() {
      const userCounts = this.pullRequests.reduce((counts, pr) => {
        counts[pr.user.login] = (counts[pr.user.login] || 0) + 1;
        return counts;
      }, {});

      new Chart(document.getElementById("pullRequestsChart"), {
        type: "pie",
        data: {
          labels: Object.keys(userCounts),
          datasets: [{ data: Object.values(userCounts), backgroundColor: ["#28a745", "#ffc107", "#dc3545", "#17a2b8"] }]
        },
        options: { responsive: true }
      });
    },
    setupIssuesChart() {
      const userCounts = this.issues.reduce((counts, issue) => {
        counts[issue.user.login] = (counts[issue.user.login] || 0) + 1;
        return counts;
      }, {});

      new Chart(document.getElementById("issuesChart"), {
        type: "pie",
        data: {
          labels: Object.keys(userCounts),
          datasets: [{ data: Object.values(userCounts), backgroundColor: ["#007bff", "#ffc107", "#28a745", "#dc3545"] }]
        },
        options: { responsive: true }
      });
    }
  }
};
