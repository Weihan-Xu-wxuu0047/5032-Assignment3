<script setup>
import { ref, onMounted } from 'vue';
import FaqAccordion from '../FaqAccordion.vue';
import ContactForm from '../ContactForm.vue';
import dataService from '../../services/DataService.js';

// State
const faqs = ref([]);
const loading = ref(true);
const error = ref(null);

// Load FAQs on mount
onMounted(async () => {
  try {
    loading.value = true;
    error.value = null;
    faqs.value = await dataService.getFaqs();
  } catch (err) {
    console.error('Error loading FAQs:', err);
    error.value = 'Failed to load FAQs. Please try again later.';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="container py-4 py-lg-5">
    <header class="mb-4">
      <h1 class="h3 mb-1">Support</h1>
      <p class="text-muted">Find answers quickly or send us a message.</p>
    </header>

    <div class="row g-4">
      <div class="col-12 col-lg-6">
        <section aria-labelledby="faq-heading">
          <h2 id="faq-heading" class="h5 mb-3">Frequently Asked Questions</h2>
          
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading FAQs...</span>
            </div>
            <p class="mt-2 mb-0 text-muted">Loading FAQs...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="alert alert-warning" role="alert">
            <i class="bi bi-exclamation-triangle me-2" aria-hidden="true"></i>
            {{ error }}
          </div>

          <!-- FAQs -->
          <div v-else>
            <FaqAccordion :items="faqs" />
            <div v-if="faqs.length === 0" class="text-center text-muted py-4">
              <i class="bi bi-question-circle" aria-hidden="true"></i>
              <p class="mt-2 mb-0">No FAQs available at the moment.</p>
            </div>
          </div>
        </section>
      </div>

      <div class="col-12 col-lg-6">
        <section aria-labelledby="contact-heading">
          <h2 id="contact-heading" class="h5 mb-3">Contact us</h2>
          <ContactForm />
        </section>
      </div>
    </div>
  </div>
</template>
