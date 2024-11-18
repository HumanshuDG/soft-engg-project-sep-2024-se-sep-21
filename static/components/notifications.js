export default {
  template: `
    <div class="container mt-4">
      <h2>Notifications</h2>

      <!-- Loading Spinner -->
      <div v-if="isLoading" class="text-center my-3">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>

      <!-- Empty Notifications -->
      <div v-if="!isLoading && notifications.length === 0" class="alert alert-info">
        No new notifications.
      </div>

      <!-- Notification List -->
      <div v-else class="list-group">
        <div 
          v-for="(notification, index) in notifications" 
          :key="index" 
          class="list-group-item d-flex justify-content-between align-items-center"
          :class="{ 'list-group-item-secondary': notification.read }">
          
          <div class="me-auto">
            <h5>{{ notification.title }}</h5>
            <p class="mb-1">{{ notification.message }}</p>
            <small class="text-muted">{{ formatDate(notification.timestamp) }}</small>
          </div>
          
          <div>
            <button 
              v-if="!notification.read" 
              @click="markAsRead(index)" 
              class="btn btn-sm btn-outline-primary">
              Mark as Read
            </button>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      notifications: [], // Initialize the notifications array
      errorMessage: '',
      isLoading: true,
    };
  },

  created() {
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      this.notifications = JSON.parse(storedNotifications);
      this.isLoading = false;
    } else {
      this.fetchNotifications();
    }
  },

  methods: {
    async fetchNotifications() {
      const githubToken = localStorage.getItem('github_token');

      if (!githubToken) {
        this.errorMessage = 'GitHub token is missing. Please log in again.';
        this.isLoading = false;
        return;
      }

      try {
        const response = await fetch('https://api.github.com/notifications?all=true', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });

        if (response.ok) {
          const data = await response.json();

          // Log the raw data for debugging
          console.log("Fetched Notifications:", data);

          if (data.length > 0) {
            // Map the GitHub notification data to match the format used in the component
            this.notifications = data.map((notification) => ({
              title: notification.subject?.title || 'No Title',
              message: notification.reason || 'No Reason Provided',
              timestamp: notification.updated_at || new Date().toISOString(),
              read: !notification.unread, // Convert unread status to read flag
            }));

            // Save to localStorage
            localStorage.setItem('notifications', JSON.stringify(this.notifications));
          } else {
            console.log("No notifications fetched from GitHub API.");
          }
        } else {
          const errorText = await response.text();
          console.error("API Error:", errorText);
          this.errorMessage = `Failed to fetch notifications from GitHub. Error: ${response.status}`;
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        this.errorMessage = `Error fetching notifications: ${error.message}`;
      } finally {
        this.isLoading = false;
      }
    },

    markAsRead(index) {
      this.notifications[index].read = true; // Mark notification as read locally
      localStorage.setItem('notifications', JSON.stringify(this.notifications)); // Save updated notifications to localStorage
    },

    formatDate(timestamp) {
      return new Date(timestamp).toLocaleString(); // Format the timestamp for display
    },
  },
};
