<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SearchBar from '../SearchBar.vue';
import FiltersPanel from '../FiltersPanel.vue';
import ResultsList from '../ResultsList.vue';
import dataService from '../../services/DataService.js';

const route = useRoute();
const router = useRouter();

// Component refs
const filtersPanelRef = ref(null);

// State
const loading = ref(false);
const programs = ref([]);
const filteredPrograms = ref([]);
const currentFilters = ref({
  query: '',
  sport: '',
  ageGroup: '',
  maxCost: '',
  accessibility: []
});

// Initialize from URL query and load programs
onMounted(async () => {
  try {
    // Load programs first
    programs.value = await dataService.getPrograms();
    
    if (route.query.q) {
      const initialQuery = String(route.query.q);
      currentFilters.value.query = initialQuery;
      
      // Use nextTick to ensure FiltersPanel is mounted
      await nextTick();
      if (filtersPanelRef.value) {
        filtersPanelRef.value.updateQuery(initialQuery);
      }
      
      // Perform initial search
      await performSearch();
    }
  } catch (error) {
    console.error('Error loading programs:', error);
  }
});

// Perform search using dataService
async function performSearch() {
  try {
    loading.value = true;
    filteredPrograms.value = await dataService.searchPrograms(currentFilters.value);
  } catch (error) {
    console.error('Error searching programs:', error);
    filteredPrograms.value = [];
  } finally {
    loading.value = false;
  }
}

// Handle filter changes
async function onFiltersChanged(filters) {
  // Merge new filters with existing ones to avoid overriding URL query
  currentFilters.value = { 
    ...currentFilters.value,
    ...filters 
  };
  
  // Update URL with query parameter
  const query = currentFilters.value.query ? { q: currentFilters.value.query } : {};
  router.replace({ name: 'find', query });

  // Perform search with new filters
  await performSearch();
}

// Handle search bar submission
async function onSearchSubmit(query) {
  currentFilters.value.query = query;
  if (filtersPanelRef.value) {
    filtersPanelRef.value.updateQuery(query);
  }
  await performSearch();
}

// Watch route changes (e.g., from SearchBar navigation)
watch(() => route.query.q, async (newQuery) => {
  if (newQuery && newQuery !== currentFilters.value.query) {
    currentFilters.value.query = String(newQuery);
    if (filtersPanelRef.value) {
      filtersPanelRef.value.updateQuery(currentFilters.value.query);
    }
    await performSearch();
  }
});
</script>

<template>
  <div class="container py-4 py-lg-5">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12 col-lg-8">
        <h1 class="h3 mb-2">Find Sports Programs</h1>
        <p class="text-muted mb-3">
          Discover inclusive, accessible community sport programs across Melbourne.
        </p>
      </div>
      <div class="col-12 col-lg-4">
        <SearchBar 
          placeholder="Search programs, sports, or features..."
          @submit="onSearchSubmit"
        />
      </div>
    </div>

    <!-- Filters -->
    <FiltersPanel
      ref="filtersPanelRef"
      :initial-query="route.query.q || ''"
      @filters-changed="onFiltersChanged"
    />

    <!-- Results -->
    <ResultsList 
      :programs="filteredPrograms"
      :loading="loading"
    />
  </div>
</template>
