export default {
    name: 'Register',
    data() {
      return {
        email: '',
        password: '',
        name: '',
        selectedRole: '',  
        errorMessage: '',
        successMessage: '',
      };
    },
    methods: {
      async register() {
        this.errorMessage = '';
        this.successMessage = '';
        try {
          const response = await fetch('/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: this.email,
              password: this.password,
              name: this.name,
              role: this.selectedRole,  // Include the role in the request body
            }),
          });
  
          if (response.ok) {
            this.successMessage = 'Registration successful! Redirecting to login...';
            setTimeout(() => {
              this.$router.push('/login');
            }, 2000);
          } else {
            const errorData = await response.json();
            this.errorMessage = errorData.message || 'Registration failed. Please try again.';
          }
        } catch (error) {
          this.errorMessage = 'An error occurred during registration. Please try again.';
          console.error('Error:', error);
        }
      },
      goToLogin() {
        this.$router.push('/login');
      },
    },
    template: `
      <div class='d-flex justify-content-center' style="margin-top: 25vh">
        <div class="mb-3 p-5 bg-light">
          <h1>Register</h1>
          <form @submit.prevent="register">
            <div>
              <label for="name" class="form-label">Name:</label>
              <input type="text" class="form-control" v-model="name" required>
            </div>
            <div>
              <label for="email" class="form-label">Email:</label>
              <input type="email" class="form-control" v-model="email" required>
            </div>
            <div>
              <label for="password" class="form-label">Password:</label>
              <input type="password" class="form-control" v-model="password" required>
            </div>
            <div>
              <label for="role" class="form-label">Role:</label>
              <select class="form-control" v-model="selectedRole" required>
                <option value="" disabled>Select your role</option>
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="TA">TA</option>
              </select>
            </div>
            <button class="btn btn-primary mt-2" type="submit">Register</button>
            <button class="btn btn-secondary mt-2" @click="goToLogin">Go to Login</button>
          </form>
          
          <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
          <p v-if="successMessage" style="color: green;">{{ successMessage }}</p>
        </div>
      </div>
    `,
  };
  