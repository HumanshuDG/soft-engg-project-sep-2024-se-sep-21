export default {
  template: `
<div id="team-details" class="container mt-4">
  <!-- Header Section -->
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="text-center">Team Details</h2>
    <h2 class="text-center">Team Statistics</h2>
    <button class="btn btn-primary" @click="openFeedbackModal"><i class="fa-regular fa-comments"></i>Feedbacks</button>
  </div>

    <!-- Feedback Modal -->
  <div class="modal fade" id="feedbackModal" tabindex="-1" aria-labelledby="feedbackModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="feedbackModalLabel">Team Feedback</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <ul class="list-group">
            <li v-for="feedback in feedbacks" :key="feedback.id" class="list-group-item">
              <p><strong>Instrcutor ID{{ feedback.instructor_id }}:</strong> {{ feedback.feedback_text }}</p>
              <small class="text-muted">{{ new Date(feedback.created_on).toLocaleString() }}</small>
            </li>
          </ul>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Content Section -->
  <div v-if="team" class="row">
    <!-- Left Box: Team and Milestones -->
    <div class="col-md-4">
      <div class="card mb-4">
        <div class="card-header bg-primary text-white">Team Information</div>
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

        <div class="card-header bg-info text-white">Project Milestones</div>
        <div class="card-body">
          <ul class="list-unstyled">
            <li v-for="milestone in milestones" :key="milestone.id" class="mb-3">
              <h5>Milestone #{{ milestone.milestone_number }}
                <button v-if="!milestone.submitted" class="btn btn-link" @click="submitMilestone(milestone)"><i class="fa-solid fa-check-to-slot">Mark Submitted</i></button>
                <span v-else class="badge bg-success">Submitted</span>
              </h5>
              <p><strong>Deadline:</strong> {{ formatDate(milestone.deadline) }}</p>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Right Box: Statistics and Charts -->
    <div class="col-md-8">
      <!-- Make this section scrollable -->
      <div class="overflow-auto" style="max-height: 500px; padding-right: 10px;">
        <!-- Commits per Day Chart -->
        <div class="card mb-4">
          <div class="card-header bg-info text-white">Commits per Day</div>
          <div class="card-body">
            <canvas id="commitsChart"></canvas>
          </div>
        </div>

        <!-- Pie Charts Row -->
        <div class="row">
          <div class="col-md-6">
            <div class="card mb-4">
              <div class="card-header bg-success text-white">Pull Requests by User</div>
              <div class="card-body">
                <canvas id="pullRequestsChart"></canvas>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card mb-4">
              <div class="card-header bg-warning text-dark">Issues by User</div>
              <div class="card-body">
                <canvas id="issuesChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- GitHub Data Section -->
  <div class="row mt-4">
    <!-- Left: Recent Commits -->
    <div class="col-md-6">
      <div class="card">
        <div class="card-header bg-info text-white">Recent Commits</div>
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

    <!-- Right: Pull Requests and Issues -->
    <div class="col-md-6">
      <!-- Open Pull Requests -->
      <div class="card mb-4">
        <div class="card-header bg-success text-white">Open Pull Requests</div>
        <div class="list-group list-group-flush overflow-auto" style="max-height: 300px;">
          <a v-for="pr in pullRequests" :key="pr.id" :href="pr.html_url" target="_blank" class="list-group-item list-group-item-action">
            {{ pr.title }} by {{ pr.user.login }}
          </a>
        </div>
      </div>

      <!-- Open Issues -->
      <div class="card">
        <div class="card-header bg-warning text-dark">Open Issues</div>
        <div class="list-group list-group-flush overflow-auto" style="max-height: 300px;">
          <a v-for="issue in issues" :key="issue.id" :href="issue.html_url" target="_blank" class="list-group-item list-group-item-action">
            {{ issue.title }} by {{ issue.user.login }}
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
    `,
    data() {
      return {
        team: null,
        commits: [],
        pullRequests: [],
        issues: [],
        milestones: [],
        feedbacks: [],
      };
    },
    created() {
      const teamId = this.$route.params.teamId;
      this.fetchTeamDetails(teamId);
    },
    methods: {
      openFeedbackModal() {
        // Fetch feedbacks from API
        fetch(`/api/feedback/${this.team.id}`)
          .then((response) => response.json())
          .then((data) => {
            this.feedbacks = data;
            const feedbackModal = new bootstrap.Modal(document.getElementById('feedbackModal'));
            feedbackModal.show();
          })
          .catch((error) => {
            console.error("Error fetching feedbacks:", error);
          });
      },

      async fetchTeamDetails(teamId) {
        try {
          const response = await fetch(`/api/teams/${teamId}`);
          if (response.ok) {
            const data = await response.json();
            this.team = data;
            this.fetchMilestones(data.project_id);
            this.fetchGitHubData(data.repo);
          } else {
            console.error("Failed to fetch team details.");
          }
        } catch (error) {
          console.error("Error fetching team details:", error);
        }
      },

      async fetchMilestones(projectId) {
        try {
          const response = await fetch(`/api/milestones_list?project_id=${projectId}`);
          if (response.ok) {
            const milestones = await response.json();
            this.milestones = milestones;
      
            // Fetch milestone submissions for the current team
            this.fetchMilestoneSubmissions();
          } else {
            console.error("Failed to fetch milestones.");
          }
        } catch (error) {
          console.error("Error fetching milestones:", error);
        }
      },
      
      async fetchMilestoneSubmissions() {
        try {
          const response = await fetch(`/api/teams/${this.team.id}/milestone_submits`);
          if (response.ok) {
            const submissions = await response.json();
            
            // Mark milestones as submitted based on submissions
            this.milestones.forEach(milestone => {
              milestone.submitted = submissions.some(submission => submission.milestone_id === milestone.id);
            });
          } else {
            console.error("Failed to fetch milestone submissions.");
          }
        } catch (error) {
          console.error("Error fetching milestone submissions:", error);
        }
      },

      formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString();
      },

      submitMilestone(milestone) {
        fetch(`/api/milestone_submits`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            team_id: this.team.id,
            milestone_id: milestone.id,
          }),
        })
          .then((response) => {
            if (response.ok) {
              alert('Milestone marked as submitted!');
              
              // Immediately update the submitted status in the UI
              this.milestones = this.milestones.map((m) =>
                m.id === milestone.id ? { ...m, submitted: true } : m
              );
            } else {
              return response.json().then((error) => {
                throw new Error(error.message || 'Failed to mark milestone as submitted');
              });
            }
          })
          .catch((error) => {
            console.error('Error submitting milestone:', error);
          });
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
          options: {indexAxis: 'y', responsive: true, scales: { x: { beginAtZero: true } } }
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
  