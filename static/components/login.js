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
            localStorage.setItem('Authentication-Token', data.token);
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
    },
    goToHome() {
      this.$router.push('/');
    },
  },
  template: `
    <div>
      <!-- Navbar -->
      <nav navbar navbar-expand-lg navbar-light bg-light style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000; 
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 20px;
        background-color: #F0E6F6;
        ">
        <div class="navbar-brand">
          <img src="static/images/logo.png" alt="Logo" style="height: 30px; width: auto;" />
        </div>
        <div class="ml-auto">
          <button class="btn btn-primary mt-2" @click="goToHome">Home</button>
          <button class="btn btn-secondary mt-2" @click="goToRegister">Register</button>
        </div>
      </nav>
      <!-- Login Form -->
      <section class="vh-100 d-flex align-items-center" style="background-color: #f5f5f5;">
        <div class="container h-100">
          <div class="row d-flex justify-content-center align-items-center h-100">
            <div class="col-lg-12 col-xl-11">
              <div class="card text-black" style="border-radius: 25px; border: none; background-color: #ffe6e6;">
                <div class="card-body p-md-5">
                  <div class="row justify-content-center">
                    <div class="col-md-10 col-lg-6 col-xl-5">

                      <!-- Error Message -->
                      <p v-if="errorMessage" style="color: red;" class="mt-2 text-center">{{ errorMessage }}</p>

                      <!-- Centered Login Title -->
                      <p class="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">Login</p>

                      <form @submit.prevent="login" class="mx-1 mx-md-4">

                        <!-- Email Input -->
                        <div class="d-flex flex-row align-items-center mb-4">
                          <i class="fas fa-envelope fa-lg me-3 fa-fw"></i>
                          <div class="form-outline flex-fill mb-0">
                            <label class="form-label" for="user-email">Your Email</label>
                            <input type="email" id="user-email" class="form-control" v-model="email" required style="background-color: #f5f5f5;" />
                          </div>
                        </div>

                        <!-- Password Input -->
                        <div class="d-flex flex-row align-items-center mb-4">
                          <i class="fas fa-lock fa-lg me-3 fa-fw"></i>
                          <div class="form-outline flex-fill mb-0">
                            <label class="form-label" for="password">Password</label>
                            <input type="password" id="password" class="form-control" v-model="password" required style="background-color: #f5f5f5;" />
                          </div>
                        </div>

                        <!-- Login Button -->
                        <div class="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                          <button type="submit" class="btn btn-primary btn-lg w-100">Login</button>
                        </div>

                        <hr style="margin: 0.2rem 0.2;" />

                        <!-- Register Button -->
                        <div class="text-center">
                          <button class="btn btn-warning w-100 mt-1" @click="goToRegister">Create a new account</button>
                        </div>
                      </form>
                    </div>
                    <div class="col-md-10 col-lg-6 col-xl-7 d-flex align-items-center">
                      <img src="static/images/login-image.jpg" alt="Login Image" class="img-fluid" style="object-fit: cover; height: auto; max-height: 400px;"/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
};
