export default {
  name: 'default_home',
  data() {
    return {
      isLoading: true,  // To show a loading state
      errorMessage: '',  // In case of any error
    };
  },
  mounted() {
    // Simulate the role fetching or getting it from localStorage
    const role = localStorage.getItem('role');  // Assuming role is stored in localStorage

    // Simulating a delay for the loading effect
    setTimeout(() => {
      if (role === 'student') {
        this.$router.push('/student_home');
      } else if (role === 'instructor') {
        this.$router.push('/instructor_home');
      } else if (role === 'ta') {
        this.$router.push('/ta_home');
      } else {
        this.$router.push('/');  // Redirect to the root if no role is found
      }
      this.isLoading = false;  // Stop loading after redirecting
    }, 2000);  // Wait 2 seconds before redirecting (simulating loading)
  },
  methods: {
    // You can add additional methods if needed, for example, to handle errors
    handleError(message) {
      this.errorMessage = message;
    },
  },
};
