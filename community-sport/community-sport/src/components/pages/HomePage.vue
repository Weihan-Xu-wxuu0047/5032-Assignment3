<script setup>
import { ref, onMounted } from 'vue';
import SearchBar from '../SearchBar.vue';
import ProgramCard from '../ProgramCard.vue';
import dataService from '../../services/DataService.js';

// Hero copy (static)
const hero = {
  title: 'Move more, feel better.',
  subtitle:
    'Discover inclusive, low-cost community sport programs across Melbourne. Start with a quick search below.'
};

// State
const featured = ref([]);
const loading = ref(true);
const error = ref(null);

// Load featured programs on mount
onMounted(async () => {
  try {
    loading.value = true;
    error.value = null;
    featured.value = await dataService.getFeaturedPrograms(6);
  } catch (err) {
    console.error('Error loading featured programs:', err);
    error.value = 'Failed to load featured programs. Please try again later.';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="container py-4 py-lg-5">
    <!-- Hero -->
    <section class="text-center mb-4 mb-lg-5">
      <h1 class="display-5 fw-semibold">{{ hero.title }}</h1>
      <p class="lead text-muted mx-auto" style="max-width: 52ch">
        {{ hero.subtitle }}
      </p>
      <div class="mt-3 mt-lg-4 d-flex justify-content-center">
        <SearchBar placeholder="Try ‘netball’, ‘walking football’, ‘wheelchair access’…" />
      </div>
    </section>

    <!-- Featured Programs -->
    <section aria-labelledby="featured-heading">
      <div class="d-flex align-items-baseline justify-content-between mb-2">
        <h2 id="featured-heading" class="h4 m-0">Featured programs</h2>
        <RouterLink :to="{ name: 'find' }" class="link-primary">See all</RouterLink>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading featured programs...</span>
        </div>
        <p class="mt-2 mb-0 text-muted">Loading featured programs...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-warning" role="alert">
        <i class="bi bi-exclamation-triangle me-2" aria-hidden="true"></i>
        {{ error }}
      </div>

      <!-- Programs Grid -->
      <div v-else>
        <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
          <div v-for="p in featured" :key="p.id" class="col">
            <ProgramCard :program="p" />
          </div>
        </div>

        <div v-if="featured.length === 0" class="text-center text-muted py-5">
          <i class="bi bi-emoji-neutral" aria-hidden="true"></i>
          <p class="mt-2 mb-0">No featured programs yet. Please check back soon.</p>
        </div>
      </div>
    </section>
  </div>
</template>
