<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const props = defineProps({ placeholder: { type: String, default: 'Search programs' } });
const emit = defineEmits(['submit']);

const q = ref('');
const router = useRouter();
const route = useRoute();

// only set q once from the URL (no watchers)
if (typeof route.query.q === 'string') q.value = route.query.q;

function go() {
  const query = q.value.trim();
  emit('submit', query);
  router.push({ name: 'find', query: query ? { q: query } : {} });
}
</script>

<template>
  <div class="input-group" style="max-width: 640px; width: 100%">
    <span class="input-group-text" id="search-addon" aria-hidden="true">
      <i class="bi bi-search"></i>
    </span>
    <input
      :placeholder="placeholder"
      v-model="q"
      class="form-control"
      type="search"
      aria-label="Search programs"
      aria-describedby="search-addon"
      @keyup.enter="go"
    />
    <button class="btn btn-primary" type="button" @click="go">Search</button>
  </div>
</template>
