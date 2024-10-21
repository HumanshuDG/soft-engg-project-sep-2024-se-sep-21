export default {
  name: 'login',
  data() {
    return {
      email: '',
      password: '',
      errorMessage: ''
    };
  },
  methods: {
    async login() {
      try {
        const response = await fetch('/user-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
          }),
        });

        if (response.ok) {
          const data = await response.json();

          if (data.token) {
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('role', data.role[0] || '');
            localStorage.setItem('user_id', data.user_id);

            const role = data.role[0];
            if (role === 'admin') {
              this.$router.push('/admin_home');
            } else if (role === 'instructor') {
              this.$router.push('/instructor_home');
            } else if (role === 'TA') {
              this.$router.push('/ta_home');
            } else if (role === 'student') {
              this.$router.push('/student_home');
            } else {
              this.errorMessage = 'Unknown role. Please contact support.';
            }
          } else {
            this.errorMessage = 'Login failed. Token not received.';
          }
        } else {
          const errorData = await response.json();
          this.errorMessage = errorData.message || 'Login failed.';
        }
      } catch (error) {
        console.error('Error:', error);
        this.errorMessage = 'An error occurred during login. Please try again.';
      }
    },
    goToRegister() {
      this.$router.push('/register');
    }
  },
  template: `
    <div class="d-flex justify-content-center" style="margin-top: 15vh">
      <div class="p-5 bg-light rounded border" style="min-width: 400px; max-width: 400px; border-radius: 10px; border: 1px solid #ccc;">

        <!-- Centered Sign-in Title with a line below -->
        <h1 class="text-center">Login</h1>
        <hr />

        <!-- Email Input -->
        <div class="mb-3">
          <label for="email" class="form-label">Email Address</label>
          <input type="email" class="form-control" id="user-email" placeholder="name@email.com" v-model="email">
        </div>

        <!-- Password Input -->
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input type="password" class="form-control" id="password" v-model="password">
        </div>

        <!-- Buttons for Login and Signup -->
        <div class="text-center">
        <button class="btn btn-primary w-50 mt-3" @click="login"> Login </button>
        </div>
        <hr style="margin: 0.2rem 0.2;" />
        <button class="btn btn-secondary w-100 mt-2" @click="goToRegister"> Create a new account </button>

        <!-- Error Message -->
        <p v-if="errorMessage" style="color: red;" class="mt-3 text-center">{{ errorMessage }}</p>
      </div>
    </div>
  `,
};
