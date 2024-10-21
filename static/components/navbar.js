export default {
    template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <router-link class="navbar-brand" to="#">Home</router-link>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/notifications"><i class="fa-solid fa-bell"></i> Notification</router-link>
              
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/projects">Project</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/dashboard">Dashboard</router-link>
            </li>
            <li class="nav-item" v-if="is_login">
              <button class="nav-link btn btn-link text-danger" @click="logout">
                <i class="fas fa-sign-out-alt"></i> Logout <!-- Log-out Icon -->
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>`,
  
    data() {
      return {
        role: localStorage.getItem('role'),
        is_login: localStorage.getItem('auth_token'),
      };
    },
  
    methods: {
      logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('role');
        localStorage.removeItem('user_id');
        this.$router.push({ path: '/login' });
      },
    },
  };
  