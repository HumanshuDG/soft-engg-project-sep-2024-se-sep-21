import router from './router.js';
import Navbar from './components/navbar.js';

// Route Guard

router.beforeEach((to, from, next) => {
  // Allow access to login, signup, and homepage without authentication
  if (to.name === 'login' || to.name === 'signup' || to.name === 'homepage') {
    next();
  } 
  // Redirect to login page if not authenticated
  else if (!localStorage.getItem('Authentication-Token')) {
    alert('You must log in to access this page.');
    next({ name: 'login' });
  } 
  // Allow access if authenticated
  else {
    next();
  }
});


// Initializing new Vue app
new Vue({
  el: '#app',
  components: {
    Navbar,
  },

  template: `
    <div>
      <!-- Conditionally render Navbar -->
      <Navbar v-if="!isAuthPage" :key='has_changed' />
      <router-view />
    </div>
  `,
  router,

  data: {
    has_changed: true,
  },

  computed: {
    // Computed property to determine if the current page is login, signup, or homepage
    isAuthPage() {
      const authRoutes = ['login', 'signup', 'homepage'];
      return authRoutes.includes(this.$route.name);
    },
  },

  watch: {
    // Watch for route changes and force a re-render of Navbar
    $route(to, from) {
      this.has_changed = !this.has_changed;
    },
  },
});
