export default {
  name: 'Home',
  components: {
    footers: {
      template: `
        <div>
          <footer style="
            background-color: #007BFF; 
            color: white; 
            text-align: center; 
            padding: 10px 0; 
            position: fixed; 
            bottom: 0; 
            width: 100%;
          ">
            <div class="container">
              <span>&copy; 2024 Project Management App. All rights reserved.</span>
            </div>
          </footer>
        </div>
      `,
    }
  },
  template: `
    <div>
      <!-- Navbar -->
      <nav style="
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        padding: 10px 20px; 
        background-color: #007BFF;
        color: white;
      ">
        <h2 style="margin: 0; color: white;">Project Management App</h2>
        <div>
          <button class="btn btn-primary mt-2" @click="goToLogin">Login</button>
          <button class="btn btn-secondary mt-2" @click="goToRegister">Register</button>
        </div>
      </nav>

      <!-- Main Content -->
      <div style="display: flex; justify-content: center; margin-top: 30px;">
        <div style="
          width: 90%; 
          max-width: 600px; 
          background: white; 
          border: 1px solid #ccc; 
          border-radius: 8px; 
          box-shadow: 0 2px 5px rgba(0,0,0,0.1); 
          padding: 20px; 
          text-align: center;
        ">
          <h1>Welcome to the Project Management App</h1>
          <p style="font-size: 18px; color: #555; margin-top: 20px;">
            Manage projects efficiently with tools designed for students, teaching assistants, and instructors. Here’s what you can do:
          </p>
          <ul style="text-align: left; margin-top: 20px; list-style-position: inside;">
            <li>Track project milestones and deadlines</li>
            <li>Submit and manage project documentation</li>
            <li>Collaborate with team members</li>
            <li>Get feedback from instructors</li>
          </ul>
          <router-link to="/signup">
            <button style="
              padding: 10px 20px; 
              font-size: 16px; 
              color: white; 
              background-color: #007BFF; 
              border: none; 
              border-radius: 5px; 
              cursor: pointer; 
              margin-top: 20px;
            ">
              Get Started
            </button>
          </router-link>
        </div>
      </div>
      
      <!-- Footer -->
      <footers></footers>
    </div>
  `,
  methods: {
    goToLogin() {
      this.$router.push({ name: 'login' });
    },
    goToRegister() {
      this.$router.push({ name: 'signup' });
    }
  }
  
};
