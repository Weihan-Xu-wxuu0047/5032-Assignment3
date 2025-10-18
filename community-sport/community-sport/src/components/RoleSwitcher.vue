<template>
  <div v-if="availableRoles.length > 1" class="dropdown">
    <button
      class="btn btn-outline-secondary dropdown-toggle"
      type="button"
      id="roleSwitcher"
      data-bs-toggle="dropdown"
      aria-expanded="false"
      :aria-label="`Switch role from ${currentRole}`"
    >
      <i class="bi bi-person-badge me-1" aria-hidden="true"></i>
      Switch Role
    </button>
    <ul class="dropdown-menu" aria-labelledby="roleSwitcher">
      <li>
        <h6 class="dropdown-header">Available Roles</h6>
      </li>
      <li v-for="role in availableRoles" :key="role">
        <button
          @click="switchToRole(role)"
          class="dropdown-item d-flex align-items-center"
          :class="{ 'active': role === currentRole }"
          :disabled="role === currentRole"
        >
          <i 
            :class="role === 'organizer' ? 'bi bi-people' : 'bi bi-person'" 
            class="me-2" 
            aria-hidden="true"
          ></i>
          <span class="text-capitalize">{{ role }}</span>
          <i v-if="role === currentRole" class="bi bi-check-lg ms-auto text-success" aria-hidden="true"></i>
        </button>
      </li>
      <li><hr class="dropdown-divider"></li>
      <li>
        <RouterLink 
          :to="{ name: 'register' }" 
          class="dropdown-item d-flex align-items-center"
        >
          <i class="bi bi-plus-circle me-2" aria-hidden="true"></i>
          Add Another Role
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../services/AuthService.js';

const router = useRouter();

// Get current user info
const currentUser = ref({ user: null, role: null, availableRoles: [] });
const currentRole = computed(() => currentUser.value.role);
const availableRoles = computed(() => currentUser.value.availableRoles || []);

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
    currentUser.value = { user: null, role: null, availableRoles: [] };
  }
});

// Cleanup on unmount
onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

// Switch to a different role
async function switchToRole(newRole) {
  const success = await authService.switchRole(newRole);
  if (success) {
    // Navigate to the appropriate account page
    const targetPage = newRole === 'organizer' ? 'organizer-account' : 'member-account';
    router.push({ name: targetPage });
  }
}
</script>

<style scoped>
.dropdown-item.active {
  background-color: var(--bs-primary);
  color: white;
}

.dropdown-item:disabled {
  opacity: 0.6;
  pointer-events: none;
}

.dropdown-header {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--bs-secondary);
}
</style>
