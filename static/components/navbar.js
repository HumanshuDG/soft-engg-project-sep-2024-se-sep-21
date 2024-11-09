export default {
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <div class="navbar-brand">
          <img src="static/images/logo.png" alt="Logo" style="height: 30px; width: auto;" />
        </div>
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
              <router-link class="nav-link position-relative" to="/notifications">
                <i class="fa-solid fa-bell"></i> Notification
                <!-- Badge for notifications -->
                <span v-if="notificationCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {{ notificationCount }}
                </span>
              </router-link>
            </li>
            <li class="nav-item" v-if="role == 'instructor'">
              <router-link class="nav-link" to="/instructor_home"><i class="fa-solid fa-diagram-project"></i>Projects</router-link>
            </li>
            <li class="nav-item" v-if="role == 'student'">
              <router-link class="nav-link" to="/student_home"><i class="fa-solid fa-diagram-project"></i>Projects</router-link>
            </li>
            <li class="nav-item" v-if="role == 'TA'">
              <router-link class="nav-link" to="/ta_home"><i class="fa-solid fa-diagram-project"></i>Projects</router-link>
            </li>
            <li class="nav-item" v-if="role == 'instructor'">
              <router-link class="nav-link" to="/instructor_dashboard"><i class="fa-solid fa-chart-line"></i>Dashboard</router-link>
            </li>
            <li class="nav-item" v-if="role == 'student'">
              <router-link class="nav-link" to="/student_dashboard"><i class="fa-solid fa-chart-line"></i>Dashboard</router-link>
            </li>
            <li class="nav-item" v-if="role == 'TA'">
              <router-link class="nav-link" to="/ta_dashboard"><i class="fa-solid fa-chart-line"></i>Dashboard</router-link>
            </li>
            <li class="nav-item" v-if="is_login">
              <button class="nav-link btn btn-link text-danger" @click="logout">
                <i class="fas fa-sign-out-alt"></i> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,

  data() {
    return {
      role: localStorage.getItem('role'),
      is_login: localStorage.getItem('Authentication-Token'),
      notifications: [],  // Initialize an array for notifications
    };
  },

  computed: {
    notificationCount() {
      // Return the number of unread notifications
      return this.notifications.length;
    },
  },

  methods: {
    logout() {
      localStorage.removeItem('Authentication-Token');
      localStorage.removeItem('role');
      localStorage.removeItem('user_id');
      this.$router.push({ path: '/login' });
    },

    fetchNotifications() {
      // Example logic to fetch notifications, potentially from local storage or an API
      const storedNotifications = JSON.parse(localStorage.getItem('notifications')) || [];
      this.notifications = storedNotifications.filter(notification => !notification.read); // Only count unread notifications
    },
  },

  mounted() {
    this.fetchNotifications(); // Fetch notifications when the navbar loads
  },
};
