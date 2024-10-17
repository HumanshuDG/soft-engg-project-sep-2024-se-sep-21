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
  
            // Check if the response contains the token
            if (data.token) {
              // Store token, role, and user ID in localStorage
              localStorage.setItem('auth_token', data.token);
              localStorage.setItem('role', data.role[0] || '');
              localStorage.setItem('user_id', data.user_id);
  
              // Redirect based on role
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
      <div class='d-flex justify-content-center' style="margin-top: 25vh">
        <div class="mb-3 p-5 bg-light">
          <h1>Login</h1>
          
          <label for="email" class="form-label">Email Address</label>
          <input type="email" class="form-control" id="user-email" placeholder="name@email.com" v-model="email">
          
          <label for="password" class="form-label">Password</label>
          <input type="password" class="form-control" id="password" v-model="password">
          
          <button class="btn btn-primary mt-2" @click="login"> Login </button>
          <button class="btn btn-secondary mt-2" @click="goToRegister">Signup</button>
          
          <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
        </div> 
      </div>`,
  };
  