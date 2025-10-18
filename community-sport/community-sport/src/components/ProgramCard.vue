<script setup>
const props = defineProps({
  program: { type: Object, required: true }
});

// Use a local placeholder so cards never break if an image path is missing
const fallbackImg = '/src/assets/images/placeholder-program.jpg';
</script>

<template>
  <div class="card h-100">
    <img
      class="card-img-top"
      :src="program.images?.[0] || fallbackImg"
      :alt="`${program.title} image`"
      loading="lazy"
      @error="$event.target.src = fallbackImg"
      style="object-fit: cover; height: 180px;"
    />
    <div class="card-body d-flex flex-column">
      <div class="d-flex justify-content-between align-items-start">
        <h3 class="h5 card-title mb-1">{{ program.title }}</h3>
        <span class="badge text-bg-light">{{ program.sport }}</span>
      </div>

      <p class="card-text text-muted small mb-2">
        {{ program.venue?.suburb || 'Melbourne' }}
      </p>

      <p class="card-text flex-grow-1 mb-2">{{ program.description }}</p>

      <div class="d-flex gap-2 flex-wrap mb-3">
        <span
          v-for="t in (program.inclusivityTags || []).slice(0, 3)"
          :key="t"
          class="badge rounded-pill text-bg-secondary"
        >
          {{ t }}
        </span>
      </div>

      <div class="d-flex align-items-center justify-content-between">
        <span class="fw-semibold">
          {{ program.cost === 0 ? 'Free' : `$${program.cost} ${program.costUnit || ''}` }}
        </span>
        <RouterLink
          class="btn btn-outline-primary btn-sm"
          :to="{ name: 'program', params: { id: program.id } }"
        >
          View
        </RouterLink>
      </div>
    </div>
  </div>
</template>
