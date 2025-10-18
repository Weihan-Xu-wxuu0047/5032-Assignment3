<script setup>
import { ref, computed } from 'vue';
import ProgramCard from './ProgramCard.vue';

const props = defineProps({
  programs: { type: Array, required: true },
  loading: { type: Boolean, default: false }
});

// Sorting and pagination state
const sortBy = ref('relevance'); // 'relevance', 'cost-asc', 'cost-desc', 'title'
const itemsPerPage = 10;
const currentPage = ref(1);

// Sort options
const sortOptions = [
  { value: 'relevance', label: 'Most relevant' },
  { value: 'cost-asc', label: 'Lowest cost first' },
  { value: 'cost-desc', label: 'Highest cost first' },
  { value: 'title', label: 'Alphabetical' }
];

// Computed sorted programs
const sortedPrograms = computed(() => {
  const programs = [...props.programs];
  
  switch (sortBy.value) {
    case 'cost-asc':
      return programs.sort((a, b) => a.cost - b.cost);
    case 'cost-desc':
      return programs.sort((a, b) => b.cost - a.cost);
    case 'title':
      return programs.sort((a, b) => a.title.localeCompare(b.title));
    case 'relevance':
    default:
      // Keep original order (relevance-based from parent)
      return programs;
  }
});

// Computed paginated programs
const paginatedPrograms = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedPrograms.value.slice(start, end);
});

// Pagination computed properties
const totalPages = computed(() => 
  Math.ceil(sortedPrograms.value.length / itemsPerPage)
);

const hasNextPage = computed(() => currentPage.value < totalPages.value);
const hasPrevPage = computed(() => currentPage.value > 1);

// Pagination methods
function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    // Scroll to top of results
    document.getElementById('results-header')?.scrollIntoView({ behavior: 'smooth' });
  }
}

function nextPage() {
  if (hasNextPage.value) goToPage(currentPage.value + 1);
}

function prevPage() {
  if (hasPrevPage.value) goToPage(currentPage.value - 1);
}

// Reset to page 1 when programs change
function resetPagination() {
  currentPage.value = 1;
}

// Watch for program changes to reset pagination
import { watch } from 'vue';
watch(() => props.programs.length, resetPagination);

// Result count display
const resultStart = computed(() => 
  sortedPrograms.value.length === 0 ? 0 : (currentPage.value - 1) * itemsPerPage + 1
);

const resultEnd = computed(() => 
  Math.min(currentPage.value * itemsPerPage, sortedPrograms.value.length)
);
</script>

<template>
  <div>
    <!-- Results Header -->
    <div id="results-header" class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2 class="h5 mb-1">
          {{ loading ? 'Searching...' : `${sortedPrograms.length} programs found` }}
        </h2>
        <p v-if="!loading && sortedPrograms.length > 0" class="text-muted small mb-0">
          Showing {{ resultStart }}-{{ resultEnd }} of {{ sortedPrograms.length }}
        </p>
      </div>

      <!-- Sort Options -->
      <div v-if="!loading && sortedPrograms.length > 0" class="d-flex align-items-center gap-2">
        <label for="sort-select" class="form-label small mb-0">Sort by:</label>
        <select 
          id="sort-select" 
          v-model="sortBy" 
          class="form-select form-select-sm"
          style="width: auto;"
        >
          <option v-for="option in sortOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading programs...</span>
      </div>
    </div>

    <!-- No Results -->
    <div v-else-if="sortedPrograms.length === 0" class="text-center py-5">
      <i class="bi bi-search text-muted" style="font-size: 3rem;" aria-hidden="true"></i>
      <h3 class="h5 mt-3 mb-2">No programs found</h3>
      <p class="text-muted mb-3">
        Try adjusting your search criteria or clearing some filters.
      </p>
    </div>

    <!-- Results Grid -->
    <div v-else>
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3 mb-4">
        <div v-for="program in paginatedPrograms" :key="program.id" class="col">
          <ProgramCard :program="program" />
        </div>
      </div>

      <!-- Pagination -->
      <nav v-if="totalPages > 1" aria-label="Search results pagination">
        <div class="d-flex justify-content-between align-items-center">
          <button 
            class="btn btn-outline-primary"
            :disabled="!hasPrevPage"
            @click="prevPage"
          >
            <i class="bi bi-chevron-left" aria-hidden="true"></i>
            Previous
          </button>

          <div class="d-flex align-items-center gap-2">
            <button
              v-for="page in Math.min(totalPages, 5)"
              :key="page"
              class="btn btn-sm"
              :class="page === currentPage ? 'btn-primary' : 'btn-outline-secondary'"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
            <span v-if="totalPages > 5" class="text-muted">
              ... {{ totalPages }}
            </span>
          </div>

          <button 
            class="btn btn-outline-primary"
            :disabled="!hasNextPage"
            @click="nextPage"
          >
            Next
            <i class="bi bi-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
      </nav>
    </div>
  </div>
</template>
