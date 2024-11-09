export default {
  name: 'Register',
  data() {
    return {
      email: '',
      password: '',
      name: '',
      selectedRole: '',
      githubUserId: '',
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
          <button class="btn btn-primary mt-2" @click="goToLogin">Login</button>
        </div>
      </nav>
      <!-- Register Form -->
      <section class="vh-100" style="background-color: #f5f5f5;">
        <div class="container h-100">
          <div class="row d-flex justify-content-center align-items-center h-100">
            <div class="col-lg-12 col-xl-11">
              <div class="card text-black" style="border-radius: 25px; border: none; background-color: #ffe6e6;">
                <div class="card-body p-md-5">
                  <div class="row justify-content-center">
                    <div class="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">

                      <!-- Error and Success Messages -->
                      <p v-if="errorMessage" style="color: red;" class="mt-2 text-center">{{ errorMessage }}</p>
                      <p v-if="successMessage" style="color: green;" class="mt-2 text-center">{{ successMessage }}</p>

                      <!-- Sign up Title and Already Have an Account Button -->
                      <div class="d-flex justify-content-between align-items-center">
                        <p class="text-center h1 fw-bold mb-4 mx-1 mx-md-4 mt-4">Sign up</p>
                          <div class="text-center">
                          <button class="btn btn-success w-100 mt-1" @click="goToLogin">have an account?</button>
                        </div>
                      </div>

                      <form @submit.prevent="register" class="mx-1 mx-md-4">
                        <!-- Role Selection Field -->
                        <div class="d-flex flex-row align-items-center mb-4">
                          <i class="fas fa-user fa-lg me-3 fa-fw"></i>
                          <div class="form-outline flex-fill mb-0">
                            <label for="role" class="form-label">Role:</label>
                            <select class="form-control" id="role" v-model="selectedRole" required>
                              <option value="" disabled>Select your role</option>
                              <option value="student">Student</option>
                              <option value="instructor">Instructor</option>
                              <option value="TA">TA</option>
                            </select>
                          </div>
                        </div>

                        <!-- Conditional field for GitHub User ID, shown only if role is 'student' -->
                        <div class="d-flex flex-row align-items-center mb-4" v-if="selectedRole === 'student'">
                          <i class="fab fa-github fa-lg me-3 fa-fw"></i>
                          <div class="form-outline flex-fill mb-0">
                            <label for="githubUserId" class="form-label">GitHub User ID:</label>
                            <input type="text" class="form-control" id="githubUserId" v-model="githubUserId" required style="background-color: #f5f5f5;" />
                          </div>
                        </div>

                        <!-- Name Input -->
                        <div class="d-flex flex-row align-items-center mb-4">
                          <i class="fas fa-user fa-lg me-3 fa-fw"></i>
                          <div class="form-outline flex-fill mb-0">
                            <input type="text" id="name" class="form-control" v-model="name" required style="background-color: #f5f5f5;" />
                            <label class="form-label" for="name">Your Name</label>
                          </div>
                        </div>

                        <!-- Email Input -->
                        <div class="d-flex flex-row align-items-center mb-4">
                          <i class="fas fa-envelope fa-lg me-3 fa-fw"></i>
                          <div class="form-outline flex-fill mb-0">
                            <input type="email" id="email" class="form-control" placeholder="name@email.com" v-model="email" required style="background-color: #f5f5f5;" />
                            <label class="form-label" for="email">Your Email</label>
                          </div>
                        </div>

                        <!-- Password Input -->
                        <div class="d-flex flex-row align-items-center mb-4">
                          <i class="fas fa-lock fa-lg me-3 fa-fw"></i>
                          <div class="form-outline flex-fill mb-0">
                            <input type="password" id="password" class="form-control" v-model="password" required style="background-color: #f5f5f5;" />
                            <label class="form-label" for="password">Password</label>
                          </div>
                        </div>

                        <!-- Register Button -->
                        <div class="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                          <button type="submit" class="btn btn-primary btn-lg">Sign-up</button>
                        </div>
                      </form>
                    </div>
                    <div class="col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">
                      <img src="static/images/signup-image.jpg" alt="Signup Image" class="img-fluid" style="object-fit: cover; height: auto; max-height: 400px;"/>
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
