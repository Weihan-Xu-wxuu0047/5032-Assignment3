<template>
  <div class="container py-4 py-lg-5">
    <div class="row">
      <div class="col-12">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="h3 mb-1">Member Dashboard</h1>
            <p class="text-muted mb-0">Manage your sports activities and programs</p>
          </div>
          <div class="d-flex gap-2">
            <RoleSwitcher />
            <button @click="handleLogout" class="btn btn-outline-secondary">
              <i class="bi bi-box-arrow-right me-2" aria-hidden="true"></i>
              Logout
            </button>
          </div>
        </div>

        <!-- My Account Component -->
        <MyAccount />

        <!-- My Programs Section -->
        <div class="card">
          <div class="card-header bg-light">
            <h5 class="card-title mb-0">
              <i class="bi bi-calendar-event me-2" aria-hidden="true"></i>
              My Programs ({{ appointments.length }})
            </h5>
          </div>
          <div class="card-body">
            <!-- Loading State -->
            <div v-if="appointmentsLoading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading your programs...</span>
              </div>
              <p class="mt-2 mb-0 text-muted">Loading your programs...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="appointmentsError" class="alert alert-warning" role="alert">
              <i class="bi bi-exclamation-triangle me-2"></i>
              {{ appointmentsError }}
            </div>

            <!-- No Programs State -->
            <div v-else-if="appointments.length === 0" class="text-center py-5">
              <i class="bi bi-calendar-plus display-4 text-muted mb-3" aria-hidden="true"></i>
              <h6 class="text-muted mb-3">No Programs Yet</h6>
              <p class="text-muted mb-4">
                You haven't joined any programs yet. Start exploring and join programs that interest you!
              </p>
              <RouterLink :to="{ name: 'find' }" class="btn btn-primary">
                <i class="bi bi-search me-2" aria-hidden="true"></i>
                Find Sports Programs
              </RouterLink>
            </div>

            <!-- Programs Calendar and List -->
            <div v-else>
              <!-- Calendar View -->
              <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h6 class="mb-0">Calendar View</h6>
                  <div class="d-flex gap-2">
                    <button 
                      @click="calendarView = 'month'" 
                      class="btn btn-sm"
                      :class="calendarView === 'month' ? 'btn-primary' : 'btn-outline-primary'"
                    >
                      Month
                    </button>
                    <button 
                      @click="calendarView = 'week'" 
                      class="btn btn-sm"
                      :class="calendarView === 'week' ? 'btn-primary' : 'btn-outline-primary'"
                    >
                      Week
                    </button>
                  </div>
                </div>
                <FullCalendar
                  ref="calendarRef"
                  :options="calendarOptions"
                />
              </div>

              <!-- Programs List -->
              <div class="row g-3">
                <div v-for="appointment in appointments" :key="appointment.id || appointment.appointment_id" class="col-md-6">
                  <div class="card border-0" :style="{ borderLeft: `4px solid ${getProgramColor(appointment.program_id)}` }">
                    <div class="card-body">
                      <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="card-title mb-1">
                          {{ appointment.program?.title || 'Unknown Program' }}
                        </h6>
                        <span class="badge bg-success">Active</span>
                      </div>
                      
                      <p class="text-muted small mb-2">
                        {{ appointment.program?.sport || 'Unknown Sport' }}
                      </p>

                      <div class="mb-2">
                        <strong>Time Slots:</strong>
                        <div class="mt-1">
                          <span 
                            v-for="(slot, index) in appointment.time_slot" 
                            :key="index"
                            class="badge bg-light text-dark me-1 mb-1"
                          >
                            {{ slot.day }}s {{ slot.start }} - {{ slot.end }}
                          </span>
                        </div>
                      </div>

                      <div class="mb-2" v-if="appointment.program?.venue">
                        <small class="text-muted">
                          <i class="bi bi-geo-alt me-1"></i>
                          {{ appointment.program.venue.name }}, {{ appointment.program.venue.suburb }}
                        </small>
                      </div>

                      <div class="d-flex gap-2 mt-3">
                        <button
                          @click="editAppointment(appointment)"
                          class="btn btn-sm btn-outline-primary"
                        >
                          <i class="bi bi-pencil me-1"></i>Edit Times
                        </button>
                        <RouterLink
                          :to="{ name: 'program', params: { id: appointment.program_id } }"
                          class="btn btn-sm btn-outline-secondary"
                        >
                          <i class="bi bi-eye me-1"></i>View Program
                        </RouterLink>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="row g-4 mt-4">
          <div class="col-md-3">
            <div class="card h-100 border-0 bg-light">
              <div class="card-body text-center">
                <i class="bi bi-heart text-primary mb-3" style="font-size: 2rem;" aria-hidden="true"></i>
                <h6 class="card-title">Favorites</h6>
                <p class="card-text text-muted small">Your saved programs and activities</p>
                <button class="btn btn-outline-primary btn-sm" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card h-100 border-0 bg-light">
              <div class="card-body text-center">
                <i class="bi bi-star text-primary mb-3" style="font-size: 2rem;" aria-hidden="true"></i>
                <h6 class="card-title">Reviews</h6>
                <p class="card-text text-muted small">Rate and review programs you've joined</p>
                <button class="btn btn-outline-primary btn-sm" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card h-100 border-0 bg-light">
              <div class="card-body text-center">
                <i class="bi bi-bell text-primary mb-3" style="font-size: 2rem;" aria-hidden="true"></i>
                <h6 class="card-title">Notifications</h6>
                <p class="card-text text-muted small">Program updates and reminders</p>
                <button class="btn btn-outline-primary btn-sm" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
          <div v-if="!hasOrganizerRole" class="col-md-3">
            <div class="card h-100 border-0 bg-success text-white">
              <div class="card-body text-center">
                <i class="bi bi-people text-white mb-3" style="font-size: 2rem;" aria-hidden="true"></i>
                <h6 class="card-title">Become Organizer</h6>
                <p class="card-text small">Create and manage sports programs</p>
                <RouterLink :to="{ name: 'register' }" class="btn btn-light btn-sm">
                  Add Organizer Role
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import authService from '../../services/AuthService.js';
import dataService from '../../services/DataService.js';
import MyAccount from '../MyAccount.vue';
import RoleSwitcher from '../RoleSwitcher.vue';

const router = useRouter();

// User state
const currentUser = ref({ user: null, role: null, availableRoles: [] });
const hasOrganizerRole = computed(() => {
  const availableRoles = currentUser.value.availableRoles || [];
  return availableRoles.includes('organizer');
});

// Appointments state
const appointments = ref([]);
const appointmentsLoading = ref(false);
const appointmentsError = ref(null);
const calendarView = ref('month');
const calendarRef = ref(null);

// Program colors for calendar (different color for each program)
const programColors = ref(new Map());
const colorPalette = [
  '#0d6efd', '#198754', '#dc3545', '#fd7e14', '#6f42c1', 
  '#d63384', '#20c997', '#0dcaf0', '#6c757d', '#f8d7da'
];

// Calendar configuration
const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek'
  },
  events: [],
  height: 'auto',
  eventDisplay: 'block',
  dayMaxEvents: 3,
  eventClick: handleEventClick
});

// Watch calendar view changes
watch(calendarView, (newView) => {
  if (calendarRef.value) {
    const calendarApi = calendarRef.value.getApi();
    calendarApi.changeView(newView === 'month' ? 'dayGridMonth' : 'timeGridWeek');
  }
});

// Watch appointments changes to update calendar
watch(appointments, () => {
  updateCalendarEvents();
}, { deep: true });

// Load user data and appointments on mount
onMounted(async () => {
  const userData = await authService.getCurrentUser();
  currentUser.value = userData;
  
  if (userData.user) {
    await loadUserAppointments();
  }
});

// Listen for auth state changes
const unsubscribe = authService.onAuthStateChange(async (user, role) => {
  if (user) {
    const userData = await authService.getCurrentUser();
    currentUser.value = userData;
    await loadUserAppointments();
  } else {
    currentUser.value = { user: null, role: null, availableRoles: [] };
    appointments.value = [];
  }
});

// Cleanup on unmount
onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

// Load user appointments
async function loadUserAppointments() {
  if (!currentUser.value.user) return;

  try {
    appointmentsLoading.value = true;
    appointmentsError.value = null;
    
    const result = await dataService.getUserAppointments(currentUser.value.user.email);
    appointments.value = result.appointments || [];
    
    // Assign colors to programs
    assignProgramColors();
    
  } catch (error) {
    console.error('Error loading appointments:', error);
    appointmentsError.value = error.message || 'Failed to load your programs.';
  } finally {
    appointmentsLoading.value = false;
  }
}

// Assign unique colors to each program
function assignProgramColors() {
  const uniquePrograms = [...new Set(appointments.value.map(apt => apt.program_id))];
  uniquePrograms.forEach((programId, index) => {
    if (!programColors.value.has(programId)) {
      programColors.value.set(programId, colorPalette[index % colorPalette.length]);
    }
  });
}

// Get program color
function getProgramColor(programId) {
  return programColors.value.get(programId) || '#0d6efd';
}

// Update calendar events
function updateCalendarEvents() {
  const events = [];
  const today = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 3); // Show 3 months ahead

  appointments.value.forEach(appointment => {
    const programColor = getProgramColor(appointment.program_id);
    
    appointment.time_slot.forEach(slot => {
      const dayOfWeek = getDayOfWeekNumber(slot.day);
      
      // Generate recurring events for each week
      const currentDate = new Date(today);
      currentDate.setDate(currentDate.getDate() + (dayOfWeek - currentDate.getDay() + 7) % 7);
      
      while (currentDate <= endDate) {
        events.push({
          title: appointment.program?.title || 'Program',
          start: `${currentDate.toISOString().split('T')[0]}T${slot.start}:00`,
          end: `${currentDate.toISOString().split('T')[0]}T${slot.end}:00`,
          backgroundColor: programColor,
          borderColor: programColor,
          extendedProps: {
            appointmentId: appointment.id || appointment.appointment_id,
            programId: appointment.program_id,
            slot: slot
          }
        });
        
        currentDate.setDate(currentDate.getDate() + 7); // Next week
      }
    });
  });

  calendarOptions.value.events = events;
}

// Helper function to convert day name to day number
function getDayOfWeekNumber(dayName) {
  const days = {
    'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
    'Thursday': 4, 'Friday': 5, 'Saturday': 6
  };
  return days[dayName] || 0;
}

// Handle calendar event click
function handleEventClick(info) {
  const appointmentId = info.event.extendedProps.appointmentId;
  const appointment = appointments.value.find(apt => apt.id === appointmentId || apt.appointment_id === appointmentId);
  if (appointment) {
    editAppointment(appointment);
  }
}

// Edit appointment - navigate to appointment page with edit mode
function editAppointment(appointment) {
  router.push({ 
    name: 'member-appointment', 
    params: { programId: appointment.program_id },
    query: { edit: appointment.id || appointment.appointment_id }
  });
}

// Handle logout
async function handleLogout() {
  try {
    await authService.logout();
    router.push({ name: 'home' });
  } catch (error) {
    console.error('Logout error:', error);
  }
}
</script>

<style scoped>
.bg-light {
  background-color: #f8f9fa !important;
}

.card {
  border-radius: 12px;
}

.display-1 {
  font-size: 4rem;
}
</style>
