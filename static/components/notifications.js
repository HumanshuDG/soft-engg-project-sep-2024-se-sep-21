export default {
    template: `
      <div class="container mt-4">
        <h2>Notifications</h2>
        <div v-if="notifications.length === 0" class="alert alert-info">
          No new notifications.
        </div>
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
        notifications: []  // Initialize the notifications array
      };
    },
  
    methods: {
      fetchNotifications() {
        // Retrieve notifications (assuming they are stored in localStorage)
        const storedNotifications = JSON.parse(localStorage.getItem('notifications')) || [];
        this.notifications = storedNotifications;
      },
  
      markAsRead(index) {
        this.notifications[index].read = true;  // Mark notification as read
        this.updateNotifications();             // Save changes
      },
  
      updateNotifications() {
        // Update notifications in localStorage
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
      },
  
      formatDate(timestamp) {
        // Format the timestamp to a readable format
        return new Date(timestamp).toLocaleString();
      },
    },
  
    mounted() {
      this.fetchNotifications();  // Load notifications when the component mounts
    }
  };
  