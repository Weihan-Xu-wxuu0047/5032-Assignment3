<script setup>
import { reactive, ref, computed, nextTick } from 'vue';

// form model
const form = reactive({
  email: '',
  subject: '',
  message: ''
});

// refs for focusing first invalid field
const emailRef = ref(null);
const subjectRef = ref(null);
const messageRef = ref(null);

// simple validators
const emailPattern =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const errors = reactive({
  email: '',
  subject: '',
  message: ''
});

const touched = reactive({
  email: false,
  subject: false,
  message: false
});

function validateField(name) {
  const v = form[name]?.trim?.() ?? '';
  let err = '';

  if (name === 'email') {
    if (!v) err = 'Email is required.';
    else if (!emailPattern.test(v)) err = 'Please enter a valid email address.';
  }

  if (name === 'subject') {
    if (!v) err = 'Subject is required.';
    else if (v.length < 4) err = 'Subject must be at least 4 characters.';
  }

  if (name === 'message') {
    if (!v) err = 'Message is required.';
    else if (v.length < 10) err = 'Message must be at least 10 characters.';
  }

  errors[name] = err;
  return !err;
}

function validateAll() {
  return (
    validateField('email') &
    validateField('subject') &
    validateField('message')
  );
}

// derived state
const isValid = computed(() =>
  !errors.email && !errors.subject && !errors.message &&
  form.email && form.subject && form.message
);

const submitted = ref(false);
const submitting = ref(false);

function onBlur(name) {
  touched[name] = true;
  validateField(name);
}

async function focusFirstError() {
  await nextTick();
  const order = [
    { name: 'email', ref: emailRef },
    { name: 'subject', ref: subjectRef },
    { name: 'message', ref: messageRef }
  ];
  for (const { name, ref } of order) {
    if (errors[name] && ref.value) {
      ref.value.focus();
      break;
    }
  }
}

async function onSubmit(e) {
  e.preventDefault();
  // validate all fields
  validateAll();

  if (!isValid.value) {
    await focusFirstError();
    return;
  }

  submitting.value = true;

  // Simulate a request (no backend yet)
  setTimeout(() => {
    submitting.value = false;
    submitted.value = true;
    // clear form
    form.email = '';
    form.subject = '';
    form.message = '';
    touched.email = touched.subject = touched.message = false;
    errors.email = errors.subject = errors.message = '';
  }, 500);
}
</script>

<template>
  <form novalidate @submit="onSubmit" aria-describedby="contact-help">
    <p id="contact-help" class="visually-hidden">
      All fields are required. Use Tab/Shift+Tab to navigate between inputs.
    </p>

    <!-- Email -->
    <div class="mb-3">
      <label for="email" class="form-label">Email <span class="text-danger">*</span></label>
      <input
        id="email"
        ref="emailRef"
        type="email"
        class="form-control"
        :class="{ 'is-invalid': touched.email && errors.email }"
        v-model.trim="form.email"
        @blur="onBlur('email')"
        aria-required="true"
        :aria-invalid="touched.email && !!errors.email"
        :aria-describedby="touched.email && errors.email ? 'email-error' : undefined"
        placeholder="you@example.com"
        autocomplete="email"
      />
      <div v-if="touched.email && errors.email" id="email-error" class="invalid-feedback">
        {{ errors.email }}
      </div>
    </div>

    <!-- Subject -->
    <div class="mb-3">
      <label for="subject" class="form-label">Subject <span class="text-danger">*</span></label>
      <input
        id="subject"
        ref="subjectRef"
        type="text"
        class="form-control"
        :class="{ 'is-invalid': touched.subject && errors.subject }"
        v-model.trim="form.subject"
        @blur="onBlur('subject')"
        aria-required="true"
        :aria-invalid="touched.subject && !!errors.subject"
        :aria-describedby="touched.subject && errors.subject ? 'subject-error' : undefined"
        placeholder="e.g. Fees for walking football"
      />
      <div v-if="touched.subject && errors.subject" id="subject-error" class="invalid-feedback">
        {{ errors.subject }}
      </div>
    </div>

    <!-- Message -->
    <div class="mb-3">
      <label for="message" class="form-label">Message <span class="text-danger">*</span></label>
      <textarea
        id="message"
        ref="messageRef"
        rows="5"
        class="form-control"
        :class="{ 'is-invalid': touched.message && errors.message }"
        v-model.trim="form.message"
        @blur="onBlur('message')"
        aria-required="true"
        :aria-invalid="touched.message && !!errors.message"
        :aria-describedby="touched.message && errors.message ? 'message-error' : undefined"
        placeholder="Tell us how we can help…"
      />
      <div v-if="touched.message && errors.message" id="message-error" class="invalid-feedback">
        {{ errors.message }}
      </div>
    </div>

    <!-- Actions -->
    <div class="d-flex align-items-center gap-2">
      <button class="btn btn-primary" type="submit" :disabled="submitting">
        {{ submitting ? 'Sending…' : 'Send message' }}
      </button>
      <span class="text-success" v-if="submitted" role="status" aria-live="polite">
        Thanks! We’ve received your message.
      </span>
    </div>
  </form>
</template>

<style scoped>
/* Ensure focus ring is visible even on custom themes */
:focus { outline-offset: 2px; }
</style>
