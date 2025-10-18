<script setup>
import { ref } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true // [{ id, question, answer }]
  }
});

// track open panel by id (or null)
const openId = ref(null);
function toggle(id) {
  openId.value = openId.value === id ? null : id;
}
</script>

<template>
  <div class="accordion" role="region" aria-label="FAQ">
    <div
      v-for="(item, idx) in items"
      :key="item.id || idx"
      class="accordion-item border rounded mb-2"
    >
      <h3 class="accordion-header m-0">
        <button
          class="accordion-button bg-body-tertiary"
          :class="{ collapsed: openId !== (item.id || idx) }"
          type="button"
          :aria-expanded="String(openId === (item.id || idx))"
          :aria-controls="`faq-panel-${item.id || idx}`"
          :id="`faq-trigger-${item.id || idx}`"
          @click="toggle(item.id || idx)"
        >
          {{ item.question }}
        </button>
      </h3>
      <div
        :id="`faq-panel-${item.id || idx}`"
        class="accordion-collapse"
        v-show="openId === (item.id || idx)"
        role="region"
        :aria-labelledby="`faq-trigger-${item.id || idx}`"
      >
        <div class="accordion-body">
          <p class="mb-0">{{ item.answer }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* mimic Bootstrap collapse spacing when v-show hides content */
.accordion-button.collapsed { box-shadow: none; }
.accordion-collapse { transition: all 0.2s ease; }
</style>
