<template>
  <div class="container py-4 py-lg-5">
    <div class="row">
      <div class="col-12">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="h3 mb-1">Notifications</h1>
            <p class="text-muted mb-0">Stay updated with your program activities</p>
          </div>
          <div class="d-flex gap-2">
            <button 
              @click="markAllAsRead" 
              class="btn btn-outline-primary btn-sm"
              :disabled="!hasUnreadNotifications || isMarkingAllRead"
            >
              <span v-if="isMarkingAllRead" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="bi bi-check-all me-2"></i>
              {{ isMarkingAllRead ? 'Marking...' : 'Mark All Read' }}
            </button>
            <button 
              @click="loadNotifications" 
              class="btn btn-outline-secondary btn-sm"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="bi bi-arrow-clockwise me-2"></i>
              {{ loading ? 'Loading...' : 'Refresh' }}
            </button>
          </div>
        </div>

        <!-- Notification Stats -->
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <div class="card bg-primary text-white">
              <div class="card-body text-center">
                <i class="bi bi-bell display-6 mb-2"></i>
                <h5 class="card-title">{{ notifications.length }}</h5>
                <p class="card-text small mb-0">Total Notifications</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card bg-warning text-dark">
              <div class="card-body text-center">
                <i class="bi bi-bell-fill display-6 mb-2"></i>
                <h5 class="card-title">{{ unreadCount }}</h5>
                <p class="card-text small mb-0">Unread</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card bg-success text-white">
              <div class="card-body text-center">
                <i class="bi bi-check-circle display-6 mb-2"></i>
                <h5 class="card-title">{{ readCount }}</h5>
                <p class="card-text small mb-0">Read</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading && notifications.length === 0" class="text-center py-5">
          <div class="spinner-border text-primary mb-3" role="status">
            <span class="visually-hidden">Loading notifications...</span>
          </div>
          <p class="text-muted">Loading your notifications...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ error }}
          <button @click="loadNotifications" class="btn btn-outline-danger btn-sm ms-2">
            Try Again
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="notifications.length === 0" class="text-center py-5">
          <i class="bi bi-bell-slash display-1 text-muted mb-4"></i>
          <h4 class="mb-3">No Notifications</h4>
          <p class="text-muted mb-4">
            You don't have any notifications yet. When programs are updated or cancelled, you'll see them here.
          </p>
        </div>

        <!-- Notifications List -->
        <div v-else class="card">
          <div class="card-header bg-light">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">
                <i class="bi bi-list-ul me-2"></i>
                Your Notifications
              </h5>
              <div class="d-flex gap-2">
                <!-- Filter buttons -->
                <div class="btn-group btn-group-sm" role="group">
                  <input type="radio" class="btn-check" name="filter" id="filter-all" v-model="filter" value="all">
                  <label class="btn btn-outline-secondary" for="filter-all">All</label>

                  <input type="radio" class="btn-check" name="filter" id="filter-unread" v-model="filter" value="unread">
                  <label class="btn btn-outline-warning" for="filter-unread">Unread</label>

                  <input type="radio" class="btn-check" name="filter" id="filter-read" v-model="filter" value="read">
                  <label class="btn btn-outline-success" for="filter-read">Read</label>
                </div>
              </div>
            </div>
          </div>
          <div class="card-body p-0">
            <div class="list-group list-group-flush">
              <div 
                v-for="notification in filteredNotifications" 
                :key="notification.notification_id"
                class="list-group-item list-group-item-action"
                :class="{ 
                  'list-group-item-warning': !notification.read,
                  'border-start border-warning border-3': !notification.read
                }"
              >
                <div class="d-flex w-100 justify-content-between align-items-start">
                  <div class="flex-grow-1">
                    <div class="d-flex align-items-center mb-2">
                      <i 
                        class="bi me-2"
                        :class="notification.read ? 'bi-envelope-open text-muted' : 'bi-envelope-fill text-warning'"
                      ></i>
                      <h6 class="mb-0" :class="{ 'fw-bold': !notification.read }">
                        {{ notification.notification_title }}
                      </h6>
                      <span v-if="!notification.read" class="badge bg-warning text-dark ms-2">New</span>
                    </div>
                    <p class="mb-2 text-muted">{{ notification.notification_text }}</p>
                    <small class="text-muted">
                      <i class="bi bi-clock me-1"></i>
                      {{ formatDate(notification.createdAt) }}
                    </small>
                  </div>
                  <div class="ms-3 d-flex flex-column gap-2">
                    <button 
                      v-if="!notification.read"
                      @click="markAsRead(notification.notification_id)"
                      class="btn btn-outline-success btn-sm"
                      :disabled="markingRead.includes(notification.notification_id)"
                    >
                      <span v-if="markingRead.includes(notification.notification_id)" class="spinner-border spinner-border-sm me-1"></span>
                      <i v-else class="bi bi-check me-1"></i>
                      {{ markingRead.includes(notification.notification_id) ? 'Marking...' : 'Mark Read' }}
                    </button>
                    <button 
                      @click="deleteNotification(notification.notification_id)"
                      class="btn btn-outline-danger btn-sm"
                      :disabled="deleting.includes(notification.notification_id)"
                    >
                      <span v-if="deleting.includes(notification.notification_id)" class="spinner-border spinner-border-sm me-1"></span>
                      <i v-else class="bi bi-trash me-1"></i>
                      {{ deleting.includes(notification.notification_id) ? 'Deleting...' : 'Delete' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div v-if="hasMore && !loading" class="text-center mt-4">
          <button @click="loadMoreNotifications" class="btn btn-outline-primary">
            <i class="bi bi-arrow-down-circle me-2"></i>
            Load More Notifications
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import authService from '../../services/AuthService.js';
import dataService from '../../services/DataService.js';

// State
const notifications = ref([]);
const loading = ref(false);
const error = ref(null);
const filter = ref('all');
const hasMore = ref(false);
const currentPage = ref(1);
const pageSize = 20;

// Action states
const markingRead = ref([]);
const deleting = ref([]);
const isMarkingAllRead = ref(false);

// Computed properties
const unreadCount = computed(() => 
  notifications.value.filter(n => !n.read).length
);

const readCount = computed(() => 
  notifications.value.filter(n => n.read).length
);

const hasUnreadNotifications = computed(() => unreadCount.value > 0);

const filteredNotifications = computed(() => {
  switch (filter.value) {
    case 'unread':
      return notifications.value.filter(n => !n.read);
    case 'read':
      return notifications.value.filter(n => n.read);
    default:
      return notifications.value;
  }
});

// Load notifications on mount
onMounted(async () => {
  await loadNotifications();
});

// Load notifications
async function loadNotifications() {
  try {
    loading.value = true;
    error.value = null;
    
    const currentUser = await authService.getCurrentUser();
    if (!currentUser.user) {
      error.value = 'You must be logged in to view notifications.';
      return;
    }

    const result = await dataService.getUserNotifications(currentUser.user.email);
    notifications.value = result.notifications || [];
    hasMore.value = result.hasMore || false;
    currentPage.value = 1;
    
    console.log(`Loaded ${notifications.value.length} notifications`);
  } catch (err) {
    console.error('Error loading notifications:', err);
    error.value = 'Failed to load notifications. Please try again.';
  } finally {
    loading.value = false;
  }
}

// Load more notifications
async function loadMoreNotifications() {
  try {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser.user) return;

    const nextPage = currentPage.value + 1;
    const result = await dataService.getUserNotifications(currentUser.user.email, nextPage, pageSize);
    
    notifications.value.push(...(result.notifications || []));
    hasMore.value = result.hasMore || false;
    currentPage.value = nextPage;
    
  } catch (err) {
    console.error('Error loading more notifications:', err);
    error.value = 'Failed to load more notifications.';
  }
}

// Mark notification as read
async function markAsRead(notificationId) {
  try {
    markingRead.value.push(notificationId);
    
    const currentUser = await authService.getCurrentUser();
    if (!currentUser.user) return;

    await dataService.markNotificationAsRead(notificationId, currentUser.user.email);
    
    // Update local state
    const notification = notifications.value.find(n => n.notification_id === notificationId);
    if (notification) {
      notification.read = true;
    }
    
  } catch (err) {
    console.error('Error marking notification as read:', err);
    error.value = 'Failed to mark notification as read.';
  } finally {
    markingRead.value = markingRead.value.filter(id => id !== notificationId);
  }
}

// Mark all notifications as read
async function markAllAsRead() {
  try {
    isMarkingAllRead.value = true;
    
    const currentUser = await authService.getCurrentUser();
    if (!currentUser.user) return;

    await dataService.markAllNotificationsAsRead(currentUser.user.email);
    
    // Update local state
    notifications.value.forEach(notification => {
      notification.read = true;
    });
    
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    error.value = 'Failed to mark all notifications as read.';
  } finally {
    isMarkingAllRead.value = false;
  }
}

// Delete notification
async function deleteNotification(notificationId) {
  if (!confirm('Are you sure you want to delete this notification?')) {
    return;
  }

  try {
    deleting.value.push(notificationId);
    
    const currentUser = await authService.getCurrentUser();
    if (!currentUser.user) return;

    await dataService.deleteNotification(notificationId, currentUser.user.email);
    
    // Remove from local state
    notifications.value = notifications.value.filter(n => n.notification_id !== notificationId);
    
  } catch (err) {
    console.error('Error deleting notification:', err);
    error.value = 'Failed to delete notification.';
  } finally {
    deleting.value = deleting.value.filter(id => id !== notificationId);
  }
}

// Format date
function formatDate(timestamp) {
  if (!timestamp) return 'Unknown date';
  
  try {
    let date;
    if (timestamp.seconds) {
      // Firestore timestamp
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Unknown date';
  }
}
</script>

<style scoped>
.card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  border-radius: 12px 12px 0 0;
}

.list-group-item {
  border-left: none;
  border-right: none;
}

.list-group-item:first-child {
  border-top: none;
}

.list-group-item:last-child {
  border-bottom: none;
  border-radius: 0 0 12px 12px;
}

.list-group-item-warning {
  background-color: rgba(255, 193, 7, 0.1);
}

.btn {
  border-radius: 8px;
}

.display-1 {
  font-size: 4rem;
}

.display-6 {
  font-size: 2rem;
}

.border-3 {
  border-width: 3px !important;
}

.btn-group-sm .btn {
  font-size: 0.875rem;
}
</style>
