export default {
  name: 'Register',
  data() {
    return {
      email: '',
      password: '',
      name: '',
      selectedRole: '',  
      githubUserId: '',  // Added field for GitHub User ID
      errorMessage: '',
      successMessage: '',
    };
  },
  methods: {
    async register() {
      this.errorMessage = '';
      this.successMessage = '';
      try {
        const requestBody = {
          email: this.email,
          password: this.password,
          name: this.name,
          role: this.selectedRole,
        };

        if (this.selectedRole === 'student') {
          requestBody.githubUserId = this.githubUserId;
        }

        const response = await fetch('/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
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
    <div class="d-flex justify-content-center" style="margin-top: 10vh">
      <div class="p-4 bg-light rounded border" style="min-width: 400px; max-width: 400px; border-radius: 10px; border: 1px solid #ccc;">

        <!-- Centered Register Title with a line below -->
        <h1 class="text-center" style="font-size: 2rem;">Sign-up</h1>
        <hr />

        <form @submit.prevent="register">
          <!-- Role Selection Field -->
          <div class="mb-1">
            <label for="role" class="form-label">Role:</label>
            <select class="form-control" v-model="selectedRole" required>
              <option value="" disabled>Select your role</option>
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="TA">TA</option>
            </select>
          </div>

          <!-- Conditional field for GitHub User ID, shown only if role is 'student' -->
          <div class="mb-1" v-if="selectedRole === 'student'">
            <label for="githubUserId" class="form-label">GitHub User ID:</label>
            <input type="text" class="form-control" v-model="githubUserId" required />
          </div>

          <!-- Name Input -->
          <div class="mb-1">
            <label for="name" class="form-label">Name:</label>
            <input type="text" class="form-control" v-model="name" required>
          </div>

          <!-- Email Input -->
          <div class="mb-1">
            <label for="email" class="form-label">Email:</label>
            <input type="email" class="form-control" v-model="email" required>
          </div>

          <!-- Password Input -->
          <div class="mb-1">
            <label for="password" class="form-label">Password:</label>
            <input type="password" class="form-control" v-model="password" required>
          </div>

          <!-- Register and Login Buttons -->
          <div class="text-center">
            <button class="btn btn-primary w-50 mt-2" type="submit">Sign-up</button>
          </div>
          <hr style="margin: 0.2rem 0.2;" />
          <button class="btn btn-warning w-100 mt-1" @click="goToLogin">Already have an account?</button>
        </form>

        <!-- Error and Success Messages -->
        <p v-if="errorMessage" style="color: red;" class="mt-2 text-center">{{ errorMessage }}</p>
        <p v-if="successMessage" style="color: green;" class="mt-2 text-center">{{ successMessage }}</p>
      </div>
    </div>
  `,
};
