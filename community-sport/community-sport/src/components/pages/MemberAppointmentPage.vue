<template>
  <div class="container py-4 py-lg-5">
    <div class="row">
      <div class="col-12">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="h3 mb-1">{{ isEditMode ? 'Edit Your Appointment' : 'Book Your Appointment' }}</h1>
            <p class="text-muted mb-0" v-if="program">
              {{ isEditMode ? 'Editing appointment for' : 'Booking for' }}: <strong>{{ program.title }}</strong>
            </p>
            <p class="text-muted small mb-0" v-if="isEditMode && existingAppointment">
              <i class="bi bi-info-circle me-1"></i>
              Current appointment: {{ existingAppointment.time_slot.length }} time slot(s) selected
            </p>
          </div>
          <div class="d-flex gap-2">
            <RouterLink :to="{ name: 'find' }" class="btn btn-outline-secondary">
              <i class="bi bi-arrow-left me-2"></i>Back to Programs
            </RouterLink>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading program details...</span>
          </div>
          <p class="mt-2 mb-0 text-muted">Loading program details...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ error }}
        </div>

        <!-- No Program Selected -->
        <div v-else-if="!program" class="text-center py-5">
          <i class="bi bi-calendar-x display-1 text-muted mb-4"></i>
          <h4 class="mb-3">No Program Selected</h4>
            <p class="text-muted mb-4">
            Please select a program from the programs list to book an appointment.
          </p>
          <RouterLink :to="{ name: 'find' }" class="btn btn-primary">
            <i class="bi bi-search me-2"></i>Browse Programs
          </RouterLink>
        </div>

        <!-- Main Content -->
        <div v-else class="row g-4">
          <!-- Program Info -->
          <div class="col-lg-4">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="bi bi-info-circle me-2"></i>
                  Program Details
                </h5>
                  </div>
              <div class="card-body">
                <h6 class="mb-2">{{ program.title }}</h6>
                <p class="text-muted small mb-3">{{ program.description }}</p>
                
                <div class="mb-3">
                  <strong>Available Time Slots:</strong>
                  <div class="mt-2">
                    <div 
                      v-for="(schedule, index) in program.schedule" 
                      :key="index"
                      class="d-flex justify-content-between align-items-center p-2 border rounded mb-2"
                      :class="{ 'bg-primary text-white': selectedSlots.some(slot => slot.day === schedule.day) }"
                    >
                      <div>
                        <strong>{{ schedule.day }}s</strong><br>
                        <small>{{ schedule.start }} - {{ schedule.end }}</small>
                </div>
                      <button
                        @click="toggleTimeSlot(schedule)"
                        class="btn btn-sm"
                        :class="selectedSlots.some(slot => slot.day === schedule.day) ? 'btn-light' : 'btn-outline-primary'"
                      >
                        {{ selectedSlots.some(slot => slot.day === schedule.day) ? 'Selected' : 'Select' }}
                      </button>
                  </div>
                </div>
              </div>

                <div class="mb-3">
                  <strong>Venue:</strong><br>
                  <small class="text-muted">
                    {{ program.venue?.name }}<br>
                    {{ program.venue?.address }}, {{ program.venue?.suburb }}
                  </small>
                </div>

                <div class="mb-3">
                  <strong>Cost:</strong>
                  <span class="text-primary ms-2">
                    {{ program.cost === 0 ? 'Free' : `$${program.cost} ${program.costUnit}` }}
                  </span>
                  </div>
                </div>
              </div>

            <!-- Selected Time Slots Summary -->
            <div v-if="selectedSlots.length > 0" class="card mt-3">
              <div class="card-header">
                <h6 class="card-title mb-0">
                  <i class="bi bi-check-circle me-2"></i>
                  Selected Time Slots ({{ selectedSlots.length }})
                </h6>
              </div>
              <div class="card-body">
                <div 
                  v-for="(slot, index) in selectedSlots" 
                  :key="index"
                  class="d-flex justify-content-between align-items-center p-2 bg-light rounded mb-2"
                >
                  <div>
                    <strong>{{ slot.day }}s</strong><br>
                    <small>{{ slot.start }} - {{ slot.end }}</small>
                  </div>
                  <button
                    @click="removeTimeSlot(slot)"
                    class="btn btn-sm btn-outline-danger"
                  >
                    <i class="bi bi-x"></i>
                  </button>
                  </div>
                </div>
              </div>
            </div>

          <!-- Calendar -->
          <div class="col-lg-8">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="bi bi-calendar me-2"></i>
                  Calendar View
                </h5>
              </div>
              <div class="card-body">
                <FullCalendar
                  ref="calendarRef"
                  :options="calendarOptions"
                />
              </div>
            </div>

            <!-- Booking Actions -->
            <div class="card mt-3">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="mb-1">Ready to Book?</h6>
                    <small class="text-muted">
                      {{ selectedSlots.length }} time slot(s) selected
                    </small>
                  </div>
                  <div class="d-flex gap-2">
                    <button
                      @click="clearSelection"
                      class="btn btn-outline-secondary"
                      :disabled="selectedSlots.length === 0"
                    >
                      Clear Selection
                    </button>
                    <!-- Cancel Appointment Button (only in edit mode) -->
                    <button
                      v-if="isEditMode"
                      @click="cancelAppointment"
                      class="btn btn-outline-danger"
                      :disabled="isCanceling || isBooking"
                    >
                      <span v-if="isCanceling" class="spinner-border spinner-border-sm me-2"></span>
                      <i v-else class="bi bi-x-circle me-2"></i>
                      {{ isCanceling ? 'Canceling...' : 'Cancel Appointment' }}
                    </button>
                    <button
                      @click="bookAppointment"
                      class="btn btn-success"
                      :disabled="selectedSlots.length === 0 || isBooking || isCanceling"
                    >
                      <span v-if="isBooking" class="spinner-border spinner-border-sm me-2"></span>
                      <i v-else class="bi bi-calendar-check me-2"></i>
                      {{ isBooking ? (isEditMode ? 'Updating...' : 'Booking...') : (isEditMode ? 'Update Appointment' : 'Book Appointment') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Success/Error Messages -->
        <div v-if="successMessage" class="alert alert-success mt-4" role="alert">
          <i class="bi bi-check-circle-fill me-2"></i>
          {{ successMessage }}
        </div>

        <div v-if="errorMessage" class="alert alert-danger mt-4" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import dataService from '../../services/DataService.js';
import authService from '../../services/AuthService.js';

const route = useRoute();
const router = useRouter();

// Props
const props = defineProps({
  programId: String
});

// State
const program = ref(null);
const loading = ref(true);
const error = ref(null);
const selectedSlots = ref([]);
const isBooking = ref(false);
const isCanceling = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const calendarRef = ref(null);

// Edit mode state
const isEditMode = ref(false);
const existingAppointment = ref(null);
const editAppointmentId = ref(null);

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
  selectable: false,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  height: 'auto',
  eventDisplay: 'block',
  eventColor: '#0d6efd'
});

// Load program data
onMounted(async () => {
  const programId = props.programId || route.params.programId;
  const editId = route.query.edit;
  
  if (!programId) {
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    
    // Load program details
    program.value = await dataService.getProgram(programId);
    
    if (!program.value) {
      error.value = 'Program not found. Please check the program ID and try again.';
      return;
    }

    // Check if this is edit mode
    if (editId) {
      isEditMode.value = true;
      editAppointmentId.value = editId;
      await loadExistingAppointment(editId);
    }

    // Generate calendar events for the program schedule
    updateCalendarEvents();
    
  } catch (err) {
    console.error('Error loading program:', err);
    error.value = 'Failed to load program details. Please try again later.';
  } finally {
    loading.value = false;
  }
});

// Update calendar events when selected slots change
watch(selectedSlots, () => {
  updateCalendarEvents();
}, { deep: true });

// Generate calendar events based on program schedule and selected slots
function updateCalendarEvents() {
  if (!program.value || !program.value.schedule) return;

  const events = [];
  const today = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 3); // Show 3 months ahead

  program.value.schedule.forEach(schedule => {
    const dayOfWeek = getDayOfWeekNumber(schedule.day);
    const isSelected = selectedSlots.value.some(slot => slot.day === schedule.day);
    
    // Generate recurring events for each week
    const currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() + (dayOfWeek - currentDate.getDay() + 7) % 7);
    
    while (currentDate <= endDate) {
      events.push({
        title: isSelected ? `${program.value.title} (Selected)` : program.value.title,
        start: `${currentDate.toISOString().split('T')[0]}T${schedule.start}:00`,
        end: `${currentDate.toISOString().split('T')[0]}T${schedule.end}:00`,
        backgroundColor: isSelected ? '#198754' : '#0d6efd',
        borderColor: isSelected ? '#198754' : '#0d6efd',
        extendedProps: {
          schedule: schedule,
          isSelected: isSelected
        }
      });
      
      currentDate.setDate(currentDate.getDate() + 7); // Next week
    }
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

// Toggle time slot selection
function toggleTimeSlot(schedule) {
  const existingIndex = selectedSlots.value.findIndex(slot => slot.day === schedule.day);
  
  if (existingIndex > -1) {
    selectedSlots.value.splice(existingIndex, 1);
  } else {
    selectedSlots.value.push({
      day: schedule.day,
      start: schedule.start,
      end: schedule.end,
      frequency: schedule.frequency || 'weekly',
      startDate: schedule.startDate,
      endDate: schedule.endDate
    });
  }
}

// Remove time slot
function removeTimeSlot(slot) {
  const index = selectedSlots.value.findIndex(s => s.day === slot.day);
  if (index > -1) {
    selectedSlots.value.splice(index, 1);
  }
}

// Clear all selections
function clearSelection() {
  selectedSlots.value = [];
}

// Load existing appointment for edit mode
async function loadExistingAppointment(appointmentId) {
  try {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser.user) {
      error.value = 'You must be logged in to edit appointments.';
      return;
    }

    // Get user appointments to find the specific one
    const result = await dataService.getUserAppointments(currentUser.user.email);
    const appointment = result.appointments.find(apt => apt.id === appointmentId || apt.appointment_id === appointmentId);
    
    if (!appointment) {
      error.value = 'Appointment not found or you do not have permission to edit it.';
      return;
    }

    if (appointment.program_id !== program.value.id) {
      error.value = 'This appointment does not belong to the current program.';
      return;
    }

    existingAppointment.value = appointment;
    selectedSlots.value = [...appointment.time_slot]; // Copy existing time slots
    
  } catch (err) {
    console.error('Error loading existing appointment:', err);
    error.value = 'Failed to load appointment details.';
  }
}

// Book or update appointment
async function bookAppointment() {
  if (selectedSlots.value.length === 0) {
    errorMessage.value = 'Please select at least one time slot.';
    return;
  }

  try {
    isBooking.value = true;
    errorMessage.value = '';
    successMessage.value = '';

    // Get current user
    const currentUser = await authService.getCurrentUser();
    if (!currentUser.user) {
      errorMessage.value = 'You must be logged in to book an appointment.';
      return;
    }

    let result;

    if (isEditMode.value && editAppointmentId.value) {
      // Update existing appointment
      result = await dataService.updateAppointment(
        editAppointmentId.value,
        selectedSlots.value,
        currentUser.user.email
      );
      successMessage.value = `Appointment updated successfully! Your appointment ID is ${editAppointmentId.value}.`;
    } else {
      // Create new appointment
      const appointmentData = {
        program_id: program.value.id,
        user_email: currentUser.user.email,
        time_slot: selectedSlots.value
      };
      
      result = await dataService.createAppointment(appointmentData);
      successMessage.value = `Appointment booked successfully! Your appointment ID is ${result.appointmentId}.`;
    }
    
    // Clear selections
    selectedSlots.value = [];

    // Redirect after delay
    setTimeout(() => {
      router.push({ name: 'member-account' });
    }, 3000);

  } catch (err) {
    console.error('Error with appointment:', err);
    errorMessage.value = err.message || `Failed to ${isEditMode.value ? 'update' : 'book'} appointment. Please try again.`;
  } finally {
    isBooking.value = false;
  }
}

// Cancel appointment
async function cancelAppointment() {
  if (!isEditMode.value || !editAppointmentId.value) {
    errorMessage.value = 'No appointment to cancel.';
    return;
  }

  // Show confirmation dialog
  const confirmed = confirm(
    `Are you sure you want to cancel this appointment for "${program.value.title}"?\n\n` +
    `This action cannot be undone. You will need to book a new appointment if you change your mind.`
  );

  if (!confirmed) {
    return;
  }

  try {
    isCanceling.value = true;
    errorMessage.value = '';
    successMessage.value = '';

    // Get current user
    const currentUser = await authService.getCurrentUser();
    if (!currentUser.user) {
      errorMessage.value = 'You must be logged in to cancel appointments.';
      return;
    }

    // Cancel the appointment
    await dataService.cancelAppointment(editAppointmentId.value, currentUser.user.email);
    
    successMessage.value = `Appointment cancelled successfully! You will be redirected to your account page.`;
    
    // Clear selections and reset form
    selectedSlots.value = [];
    existingAppointment.value = null;

    // Redirect after delay
    setTimeout(() => {
      router.push({ name: 'member-account' });
    }, 3000);

  } catch (err) {
    console.error('Error canceling appointment:', err);
    errorMessage.value = err.message || 'Failed to cancel appointment. Please try again.';
  } finally {
    isCanceling.value = false;
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
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  border-radius: 12px 12px 0 0;
}

.btn {
  border-radius: 8px;
}

.display-1 {
  font-size: 4rem;
}

/* FullCalendar custom styles */
:deep(.fc) {
  font-family: inherit;
}

:deep(.fc-event) {
  border-radius: 4px;
  font-size: 0.875rem;
}

:deep(.fc-daygrid-event) {
  margin: 1px;
}

:deep(.fc-button) {
  border-radius: 6px;
}

:deep(.fc-button-primary) {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

:deep(.fc-button-primary:hover) {
  background-color: #0b5ed7;
  border-color: #0a58ca;
}
</style>
