<script setup>
import { reactive, watch, ref, onMounted } from 'vue';
import dataService from '../services/DataService.js';

const props = defineProps({
  initialQuery: { type: String, default: '' }
});

const emit = defineEmits(['filtersChanged']);

// Filter state
const filters = reactive({
  query: props.initialQuery,
  sport: '',
  ageGroup: '',
  maxCost: '',
  accessibility: []
});

// Filter options state
const sportOptions = ref([]);
const ageGroupOptions = ref([]);
const accessibilityOptions = ref([]);
const optionsLoading = ref(true);

// Watch for changes to initialQuery prop and update filters
watch(() => props.initialQuery, (newQuery) => {
  if (newQuery && newQuery !== filters.query) {
    filters.query = newQuery;
  }
}, { immediate: true });

// Load filter options from Firestore
onMounted(async () => {
  try {
    optionsLoading.value = true;
    const [sports, ageGroups, accessibility] = await Promise.all([
      dataService.getSportOptions(),
      dataService.getAgeGroupOptions(),
      dataService.getAccessibilityOptions()
    ]);
    
    sportOptions.value = sports;
    ageGroupOptions.value = ageGroups;
    accessibilityOptions.value = accessibility;
  } catch (error) {
    console.error('Error loading filter options:', error);
    // Fallback to default options
    sportOptions.value = ['Basketball', 'Yoga', 'Running', 'Swimming'];
    ageGroupOptions.value = ['8-12', '12-17', '18-40', '40-60', '60+'];
    accessibilityOptions.value = [
      { value: 'wheelchair-access', label: 'Wheelchair accessible' },
      { value: 'accessible-toilets', label: 'Accessible toilets' },
      { value: 'pool-lift', label: 'Pool lift' },
      { value: 'family-change-rooms', label: 'Family change rooms' },
      { value: 'quiet-area', label: 'Quiet area' },
      { value: 'pet-friendly', label: 'Pet friendly' }
    ];
  } finally {
    optionsLoading.value = false;
  }
});

// Validation errors
const errors = reactive({
  maxCost: '',
  general: ''
});

// Validation functions
function validateMaxCost() {
  // Handle both string and number types
  const value = String(filters.maxCost || '').trim();
  if (value && (isNaN(value) || parseFloat(value) < 0)) {
    errors.maxCost = 'Maximum cost must be a positive number';
    return false;
  }
  errors.maxCost = '';
  return true;
}

function validateGeneral() {
  const hasQuery = filters.query.trim().length > 0;
  const hasFilters = filters.sport || filters.ageGroup || String(filters.maxCost || '').trim() || filters.accessibility.length > 0;
  
  if (!hasQuery && !hasFilters) {
    errors.general = 'Please enter a search term or select at least one filter';
    return false;
  }
  errors.general = '';
  return true;
}

// Computed validation state (currently unused but kept for future use)
// const isValid = computed(() => {
//   return !errors.maxCost && !errors.general && 
//          (filters.query.trim() || filters.sport || filters.ageGroup || 
//           String(filters.maxCost || '').trim() || filters.accessibility.length > 0);
// });

// Watch for changes and emit to parent
watch(() => ({ ...filters }), () => {
  validateMaxCost();
  validateGeneral();
  // Always emit filters so users can see results as they type
  // The parent will handle whether to show results or not
  emit('filtersChanged', { ...filters });
}, { deep: true });

// Handle accessibility checkbox changes
function toggleAccessibility(value) {
  const index = filters.accessibility.indexOf(value);
  if (index > -1) {
    filters.accessibility.splice(index, 1);
  } else {
    filters.accessibility.push(value);
  }
}

// Clear all filters
function clearFilters() {
  filters.query = '';
  filters.sport = '';
  filters.ageGroup = '';
  filters.maxCost = '';
  filters.accessibility = [];
  errors.maxCost = '';
  errors.general = '';
}

// Update query when SearchBar changes it
function updateQuery(newQuery) {
  filters.query = newQuery;
}

// Expose method for parent component
defineExpose({ updateQuery });
</script>

<template>
  <div class="card mb-4">
    <div class="card-header">
      <h3 class="h5 mb-0">Search & Filters</h3>
    </div>
    <div class="card-body">
      <!-- Search Query -->
      <div class="mb-3">
        <label for="search-query" class="form-label">Search</label>
        <input
          id="search-query"
          v-model.trim="filters.query"
          type="search"
          class="form-control"
                     placeholder="Try 'youth', 'basketball', 'free'..."
        />
      </div>

      <!-- Filters Row -->
      <div class="row g-3 mb-3">
        <!-- Sport Filter -->
        <div class="col-md-6 col-lg-3">
          <label for="sport-filter" class="form-label">Sport</label>
          <select id="sport-filter" v-model="filters.sport" class="form-select">
            <option value="">Any sport</option>
            <option v-for="sport in sportOptions" :key="sport" :value="sport">
              {{ sport }}
            </option>
          </select>
        </div>

        <!-- Age Group Filter -->
        <div class="col-md-6 col-lg-3">
          <label for="age-filter" class="form-label">Age Group</label>
          <select id="age-filter" v-model="filters.ageGroup" class="form-select">
            <option value="">Any age</option>
            <option v-for="age in ageGroupOptions" :key="age" :value="age">
              {{ age }} years
            </option>
          </select>
        </div>

        <!-- Max Cost Filter -->
        <div class="col-md-6 col-lg-3">
          <label for="cost-filter" class="form-label">Max Cost ($)</label>
          <input
            id="cost-filter"
            v-model.trim="filters.maxCost"
            type="number"
            min="0"
            step="0.01"
            class="form-control"
            :class="{ 'is-invalid': errors.maxCost }"
            placeholder="e.g. 15"
            @blur="validateMaxCost"
          />
          <div v-if="errors.maxCost" class="invalid-feedback">
            {{ errors.maxCost }}
          </div>
        </div>

        <!-- Clear Button -->
        <div class="col-md-6 col-lg-3 d-flex align-items-end">
          <button 
            type="button" 
            class="btn btn-outline-secondary w-100"
            @click="clearFilters"
          >
            Clear All
          </button>
        </div>
      </div>

      <!-- Accessibility Filters -->
      <div class="mb-3">
        <fieldset>
          <legend class="form-label">Accessibility Features</legend>
          <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-2">
            <div 
              v-for="option in accessibilityOptions" 
              :key="option.value" 
              class="col"
            >
              <div class="form-check">
                <input
                  :id="`acc-${option.value}`"
                  type="checkbox"
                  class="form-check-input"
                  :checked="filters.accessibility.includes(option.value)"
                  @change="toggleAccessibility(option.value)"
                />
                <label :for="`acc-${option.value}`" class="form-check-label">
                  {{ option.label }}
                </label>
              </div>
            </div>
          </div>
        </fieldset>
      </div>

      <!-- Validation Error -->
      <div v-if="errors.general" class="alert alert-warning" role="alert">
        {{ errors.general }}
      </div>
    </div>
  </div>
</template>

<style scoped>
fieldset legend {
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}
</style>
