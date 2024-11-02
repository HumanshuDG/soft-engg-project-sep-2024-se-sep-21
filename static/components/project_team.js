export default {
    template: `
      <div id="team-details" class="container mt-4">
        <h2>Team Details</h2>
        <div v-if="team">
          <h4>Team ID: {{ team.id }}</h4>
          <h4>Team Name: {{ team.team_name }}</h4>
          <p><strong>Project ID:</strong> {{ team.project_id }}</p>
          <p><strong>GitHub Repo:</strong> 
            <a :href="team.repo" target="_blank" rel="noopener noreferrer">{{ team.repo }}</a>
          </p>
          <h5>Team Members:</h5>
          <ul>
            <li v-for="member in team.members" :key="member.id">
              {{ member.name }}
            </li>
          </ul>
        </div>
        <div v-else>
          <p>Loading team details...</p>
        </div>
      </div>
    `,
    data() {
      return {
        team: null,
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
          } else {
            console.error("Failed to fetch team details.");
          }
        } catch (error) {
          console.error("Error fetching team details:", error);
        }
      }
    }
  };
  