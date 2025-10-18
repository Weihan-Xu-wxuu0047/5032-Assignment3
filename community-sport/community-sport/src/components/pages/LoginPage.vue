<template>
  <div class="container py-4 py-lg-5">
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-6">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <!-- Header -->
            <div class="text-center mb-4">
              <h1 class="h3 mb-2">Sign In</h1>
              <p class="text-muted">Welcome back to Community Sport</p>
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="alert alert-danger" role="alert">
              <i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
              {{ errorMessage }}
            </div>

            <!-- Login Form -->
            <form @submit.prevent="handleLogin" novalidate>
              <!-- Login Type Selection -->
              <div class="mb-4">
                <label class="form-label fw-semibold">Login as:</label>
                <div class="row g-2">
                  <div class="col-6">
                    <input
                      type="radio"
                      class="btn-check"
                      name="loginType"
                      id="login-member"
                      value="member"
                      v-model="form.loginType"
                      required
                    />
                    <label class="btn btn-outline-primary w-100" for="login-member">
                      <i class="bi bi-person me-2" aria-hidden="true"></i>
                      Member
                    </label>
                  </div>
                  <div class="col-6">
                    <input
                      type="radio"
                      class="btn-check"
                      name="loginType"
                      id="login-organizer"
                      value="organizer"
                      v-model="form.loginType"
                      required
                    />
                    <label class="btn btn-outline-primary w-100" for="login-organizer">
                      <i class="bi bi-people me-2" aria-hidden="true"></i>
                      Organizer
                    </label>
                  </div>
                </div>
                <div class="form-text mt-2">
                  Select the portal you want to access
                </div>
              </div>

              <!-- Email -->
              <div class="mb-3">
                <label for="email" class="form-label">
                  Email <span class="text-danger">*</span>
                </label>
                <input
                  id="email"
                  ref="emailRef"
                  type="email"
                  class="form-control"
                  :class="{ 'is-invalid': touched.email && errors.email }"
                  v-model.trim="form.email"
                  @blur="onBlur('email')"
                  @input="onInput('email')"
                  aria-required="true"
                  :aria-invalid="touched.email && !!errors.email"
                  :aria-describedby="touched.email && errors.email ? 'email-error' : undefined"
                  placeholder="you@example.com"
                  autocomplete="email"
                  required
                />
                <div v-if="touched.email && errors.email" id="email-error" class="invalid-feedback">
                  {{ errors.email }}
                </div>
              </div>

              <!-- Password -->
              <div class="mb-4">
                <label for="password" class="form-label">
                  Password <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <input
                    id="password"
                    ref="passwordRef"
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control"
                    :class="{ 'is-invalid': touched.password && errors.password }"
                    v-model="form.password"
                    @blur="onBlur('password')"
                    @input="onInput('password')"
                    aria-required="true"
                    :aria-invalid="touched.password && !!errors.password"
                    :aria-describedby="touched.password && errors.password ? 'password-error' : undefined"
                    placeholder="Enter your password"
                    autocomplete="current-password"
                    required
                  />
                  <button
                    class="btn btn-outline-secondary"
                    type="button"
                    @click="showPassword = !showPassword"
                    :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  >
                    <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" aria-hidden="true"></i>
                  </button>
                </div>
                <div v-if="touched.password && errors.password" id="password-error" class="invalid-feedback">
                  {{ errors.password }}
                </div>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                class="btn btn-primary w-100 mb-3"
                :disabled="isSubmitting || !isFormValid"
              >
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ isSubmitting ? 'Signing In...' : `Sign In as ${form.loginType}` }}
              </button>

              <!-- Register Link -->
              <div class="text-center">
                <p class="mb-0">
                  Don't have an account? 
                  <RouterLink :to="{ name: 'register' }" class="link-primary">Create account</RouterLink>
                </p>
              </div>
            </form>
          </div>
        </div>

        <!-- Additional Info -->
        <div class="text-center mt-4">
          <div class="card bg-light border-0">
            <div class="card-body p-3">
              <h6 class="card-title mb-2">Account Access</h6>
              <div class="row g-2 text-sm">
                <div class="col-6">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-person text-primary me-2" aria-hidden="true"></i>
                    <div>
                      <strong>Member Portal</strong><br>
                      <small class="text-muted">Join programs & events</small>
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-people text-primary me-2" aria-hidden="true"></i>
                    <div>
                      <strong>Organizer Portal</strong><br>
                      <small class="text-muted">Manage programs & events</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../../services/AuthService.js';

const router = useRouter();

// Form data
const form = reactive({
  loginType: 'member',
  email: '',
  password: ''
});

// Form state
const touched = reactive({
  email: false,
  password: false
});

const errors = reactive({
  email: '',
  password: ''
});

const isSubmitting = ref(false);
const showPassword = ref(false);
const errorMessage = ref('');

// Form refs for focus management
const emailRef = ref(null);
const passwordRef = ref(null);

// Validation patterns
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

// Validation functions
function validateField(fieldName) {
  const value = form[fieldName]?.trim?.() ?? '';
  let error = '';

  switch (fieldName) {
    case 'email':
      if (!value) {
        error = 'Email is required.';
      } else if (!emailPattern.test(value)) {
        error = 'Please enter a valid email address.';
      }
      break;

    case 'password':
      if (!value) {
        error = 'Password is required.';
      }
      break;
  }

  errors[fieldName] = error;
  return !error;
}

function validateAll() {
  const emailValid = validateField('email');
  const passwordValid = validateField('password');
  
  return emailValid && passwordValid;
}

// Computed properties
const isFormValid = computed(() => {
  return form.loginType && 
         form.email && 
         form.password &&
         !errors.email && 
         !errors.password;
});

// Event handlers
function onBlur(fieldName) {
  touched[fieldName] = true;
  validateField(fieldName);
}

function onInput(fieldName) {
  if (touched[fieldName]) {
    validateField(fieldName);
  }
  // Clear error message on input
  if (errorMessage.value) {
    errorMessage.value = '';
  }
}

async function focusFirstError() {
  await nextTick();
  const fieldOrder = [
    { name: 'email', ref: emailRef },
    { name: 'password', ref: passwordRef }
  ];

  for (const { name, ref } of fieldOrder) {
    if (errors[name] && ref.value) {
      ref.value.focus();
      break;
    }
  }
}

async function handleLogin() {
  errorMessage.value = '';

  // Validate all fields
  if (!validateAll()) {
    await focusFirstError();
    return;
  }

  isSubmitting.value = true;

  try {
    const result = await authService.login(
      form.email,
      form.password,
      form.loginType
    );

   
    await new Promise(resolve => setTimeout(resolve, 100));

    // Redirect to appropriate account page
    const targetPage = form.loginType === 'organizer' ? 'organizer-account' : 'member-account';
    console.log('Login successful, redirecting to:', targetPage);
    console.log('User role:', result.role);
    
    await router.push({ name: targetPage });
    console.log('Redirect completed');

  } catch (error) {
    errorMessage.value = error.message;
    console.error('Login error:', error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.btn-check:checked + .btn {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
  color: white;
}

.card {
  border: none;
  border-radius: 12px;
}

.btn-primary {
  border-radius: 8px;
}

.form-control {
  border-radius: 8px;
}

.input-group .btn {
  border-radius: 0 8px 8px 0;
}

.input-group .form-control {
  border-radius: 8px 0 0 8px;
}

/* Focus styles for accessibility */
.btn-check:focus + .btn {
  outline: 2px solid var(--bs-primary);
  outline-offset: 2px;
}

.bg-light {
  background-color: #f8f9fa !important;
}

.text-sm {
  font-size: 0.875rem;
}
</style>
