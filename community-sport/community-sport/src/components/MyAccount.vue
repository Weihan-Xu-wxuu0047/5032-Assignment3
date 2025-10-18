<template>
  <div class="card mb-4">
    <div class="card-header bg-primary text-white">
      <h5 class="card-title mb-0">
        <i class="bi bi-person-circle me-2" aria-hidden="true"></i>
        My Account
      </h5>
    </div>
    <div class="card-body">
      <div class="row align-items-center">
        <div class="col-auto">
          <div class="avatar-placeholder bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
               style="width: 60px; height: 60px; font-size: 1.5rem;">
            {{ userInitials }}
          </div>
        </div>
        <div class="col">
          <h6 class="mb-1">{{ displayName }}</h6>
          <p class="text-muted mb-1">{{ userEmail }}</p>
          <div class="d-flex gap-1 flex-wrap">
            <span 
              v-for="role in availableRoles" 
              :key="role"
              class="badge text-capitalize"
              :class="role === userRole ? 'bg-primary' : 'bg-secondary'"
            >
              {{ role }}
              <i v-if="role === userRole" class="bi bi-check-lg ms-1" aria-hidden="true"></i>
            </span>
          </div>
        </div>
        <div class="col-auto">
          <button @click="handleEditProfile" class="btn btn-outline-primary btn-sm">
            <i class="bi bi-pencil me-1" aria-hidden="true"></i>
            Edit Profile
          </button>
        </div>
      </div>
      
      <!-- Account Stats -->
      <div class="row mt-4 pt-3 border-top">
        <div class="col-md-4">
          <div class="text-center">
            <div class="h4 mb-0 text-primary">{{ accountStats.joinDate }}</div>
            <small class="text-muted">Member Since</small>
          </div>
        </div>
        <div class="col-md-4">
          <div class="text-center">
            <div class="h4 mb-0 text-success">{{ accountStats.programCount }}</div>
            <small class="text-muted">{{ userRole === 'organizer' ? 'Programs Created' : 'Programs Joined' }}</small>
          </div>
        </div>
        <div class="col-md-4">
          <div class="text-center">
            <div class="h4 mb-0 text-info">{{ accountStats.activityLevel }}</div>
            <small class="text-muted">Activity Level</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import authService from '../services/AuthService.js';

// Get current user info
const currentUser = ref({ user: null, role: null, availableRoles: [], userName: null });

// Reactive user info
const userEmail = computed(() => currentUser.value.user?.email || 'No email');
const userRole = computed(() => currentUser.value.role || 'member');
const availableRoles = computed(() => currentUser.value.availableRoles || [userRole.value]);

// Load user data on mount
onMounted(async () => {
  const userData = await authService.getCurrentUser();
  currentUser.value = userData;
});

// Listen for auth state changes
const unsubscribe = authService.onAuthStateChange(async (user, role) => {
  if (user) {
    const userData = await authService.getCurrentUser();
    currentUser.value = userData;
  } else {
    currentUser.value = { user: null, role: null, availableRoles: [], userName: null };
  }
});

// Cleanup on unmount
onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

// Extract display name from userName or fallback to email
const displayName = computed(() => {
  // First try to get userName from Firestore data
  if (currentUser.value.userName) {
    return currentUser.value.userName;
  }
  // Fallback to email-based name if no userName
  if (currentUser.value.user?.email) {
    return currentUser.value.user.email.split('@')[0];
  }
  return 'User';
});

// Get user initials for avatar
const userInitials = computed(() => {
  const name = displayName.value;
  if (name.length >= 2) {
    return name.substring(0, 2).toUpperCase();
  }
  return name.substring(0, 1).toUpperCase();
});

// Mock account statistics (can be replaced with real data later)
const accountStats = computed(() => {
  const joinDate = new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    year: 'numeric' 
  });
  
  return {
    joinDate: joinDate,
    programCount: userRole.value === 'organizer' ? '3' : '5',
    activityLevel: 'Active'
  };
});

// Handle edit profile (placeholder for future implementation)
function handleEditProfile() {
  // TODO: Implement profile editing functionality
  alert('Profile editing will be implemented in future updates!');
}
</script>

<style scoped>
.card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.card-header {
  border-radius: 12px 12px 0 0;
  border-bottom: none;
  padding: 1rem 1.5rem;
}

.card-body {
  padding: 1.5rem;
}

.avatar-placeholder {
  font-weight: 600;
  border: 3px solid rgba(255, 255, 255, 0.2);
}

.btn-outline-primary {
  border-radius: 6px;
}

.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

@media (max-width: 768px) {
  .card-body .row.mt-4 .col-md-4 {
    margin-bottom: 1rem;
  }
  
  .card-body .row.mt-4 .col-md-4:last-child {
    margin-bottom: 0;
  }
}
</style>
