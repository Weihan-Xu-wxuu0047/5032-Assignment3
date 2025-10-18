<template>
  <div class="container py-4 py-lg-5">
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-6">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <!-- Header -->
            <div class="text-center mb-4">
              <h1 class="h3 mb-2">Create Account</h1>
              <p class="text-muted">Join our community sport platform</p>
            </div>

            <!-- Success Message -->
            <div v-if="successMessage" class="alert alert-success" role="alert">
              <i class="bi bi-check-circle-fill me-2" aria-hidden="true"></i>
              {{ successMessage }}
            </div>

            <!-- Info Message for Existing Users -->
            <div v-if="isExistingUser" class="alert alert-info" role="alert">
              <i class="bi bi-info-circle-fill me-2" aria-hidden="true"></i>
              You're already registered! You can add {{ form.role }} role to your existing account.
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="alert alert-danger" role="alert">
              <i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
              {{ errorMessage }}
            </div>

            <!-- Registration Form -->
            <form @submit.prevent="handleRegister" novalidate>
              <!-- Role Selection -->
              <div class="mb-4">
                <label class="form-label fw-semibold">Register as:</label>
                <div class="row g-2">
                  <div class="col-6">
                    <input
                      type="radio"
                      class="btn-check"
                      name="role"
                      id="role-member"
                      value="member"
                      v-model="form.role"
                      required
                    />
                    <label class="btn btn-outline-primary w-100" for="role-member">
                      <i class="bi bi-person me-2" aria-hidden="true"></i>
                      Member
                    </label>
                  </div>
                  <div class="col-6">
                    <input
                      type="radio"
                      class="btn-check"
                      name="role"
                      id="role-organizer"
                      value="organizer"
                      v-model="form.role"
                      required
                    />
                    <label class="btn btn-outline-primary w-100" for="role-organizer">
                      <i class="bi bi-people me-2" aria-hidden="true"></i>
                      Organizer
                    </label>
                  </div>
                </div>
                <div class="form-text mt-2">
                  <strong>Member:</strong> Join programs and events<br>
                  <strong>Organizer:</strong> Create and manage programs
                </div>
              </div>

              <!-- User Name -->
              <div class="mb-3">
                <label for="userName" class="form-label">
                  User Name <span class="text-danger">*</span>
                </label>
                <input
                  id="userName"
                  ref="userNameRef"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': touched.userName && errors.userName }"
                  v-model.trim="form.userName"
                  @blur="onBlur('userName')"
                  @input="onInput('userName')"
                  aria-required="true"
                  :aria-invalid="touched.userName && !!errors.userName"
                  :aria-describedby="touched.userName && errors.userName ? 'userName-error' : undefined"
                  placeholder="Enter your user name"
                  autocomplete="username"
                  required
                />
                <div v-if="touched.userName && errors.userName" id="userName-error" class="invalid-feedback">
                  {{ errors.userName }}
                </div>
                <div class="form-text">
                  This will be displayed as your profile name
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
              <div class="mb-3">
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
                    :aria-describedby="touched.password && errors.password ? 'password-error' : 'password-help'"
                    placeholder="Enter your password"
                    autocomplete="new-password"
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
                <div v-else id="password-help" class="form-text">
                  Password must be at least 6 characters long
                </div>
              </div>

              <!-- Confirm Password -->
              <div class="mb-4">
                <label for="confirmPassword" class="form-label">
                  Confirm Password <span class="text-danger">*</span>
                </label>
                <input
                  id="confirmPassword"
                  ref="confirmPasswordRef"
                  type="password"
                  class="form-control"
                  :class="{ 'is-invalid': touched.confirmPassword && errors.confirmPassword }"
                  v-model="form.confirmPassword"
                  @blur="onBlur('confirmPassword')"
                  @input="onInput('confirmPassword')"
                  aria-required="true"
                  :aria-invalid="touched.confirmPassword && !!errors.confirmPassword"
                  :aria-describedby="touched.confirmPassword && errors.confirmPassword ? 'confirm-password-error' : undefined"
                  placeholder="Confirm your password"
                  autocomplete="new-password"
                  required
                />
                <div v-if="touched.confirmPassword && errors.confirmPassword" id="confirm-password-error" class="invalid-feedback">
                  {{ errors.confirmPassword }}
                </div>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                class="btn btn-primary w-100 mb-3"
                :disabled="isSubmitting || !isFormValid"
              >
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ isSubmitting ? (isExistingUser ? 'Adding Role...' : 'Creating Account...') : (isExistingUser ? `Add ${form.role} Role` : 'Create Account') }}
              </button>

              <!-- Login Link -->
              <div class="text-center">
                <p class="mb-0">
                  Already have an account? 
                  <RouterLink :to="{ name: 'login' }" class="link-primary">Sign in</RouterLink>
                </p>
              </div>
            </form>
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
  role: 'member',
  userName: '',
  email: '',
  password: '',
  confirmPassword: ''
});

// Form state
const touched = reactive({
  userName: false,
  email: false,
  password: false,
  confirmPassword: false
});

const errors = reactive({
  userName: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const isSubmitting = ref(false);
const showPassword = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const isExistingUser = ref(false);

// Form refs for focus management
const userNameRef = ref(null);
const emailRef = ref(null);
const passwordRef = ref(null);
const confirmPasswordRef = ref(null);

// Validation patterns
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

// Validation functions
function validateField(fieldName) {
  const value = form[fieldName]?.trim?.() ?? '';
  let error = '';

  switch (fieldName) {
    case 'userName':
      if (!value) {
        error = 'User name is required.';
      } else if (value.length < 2) {
        error = 'User name must be at least 2 characters long.';
      } else if (value.length > 30) {
        error = 'User name must be less than 30 characters.';
      } else if (!/^[a-zA-Z0-9\s_-]+$/.test(value)) {
        error = 'User name can only contain letters, numbers, spaces, underscores, and hyphens.';
      }
      break;

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
      } else if (value.length < 6) {
        error = 'Password must be at least 6 characters long.';
      }
      break;

    case 'confirmPassword':
      if (!value) {
        error = 'Please confirm your password.';
      } else if (value !== form.password) {
        error = 'Passwords do not match.';
      }
      break;
  }

  errors[fieldName] = error;
  return !error;
}

function validateAll() {
  const userNameValid = validateField('userName');
  const emailValid = validateField('email');
  const passwordValid = validateField('password');
  const confirmPasswordValid = validateField('confirmPassword');
  
  return userNameValid && emailValid && passwordValid && confirmPasswordValid;
}

// Computed properties
const isFormValid = computed(() => {
  return form.role && 
         form.userName &&
         form.email && 
         form.password && 
         form.confirmPassword &&
         !errors.userName &&
         !errors.email && 
         !errors.password && 
         !errors.confirmPassword;
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
  // Clear messages on input
  if (errorMessage.value) {
    errorMessage.value = '';
  }
}

async function focusFirstError() {
  await nextTick();
  const fieldOrder = [
    { name: 'userName', ref: userNameRef },
    { name: 'email', ref: emailRef },
    { name: 'password', ref: passwordRef },
    { name: 'confirmPassword', ref: confirmPasswordRef }
  ];

  for (const { name, ref } of fieldOrder) {
    if (errors[name] && ref.value) {
      ref.value.focus();
      break;
    }
  }
}

async function handleRegister() {
  errorMessage.value = '';
  successMessage.value = '';

  // Validate all fields
  if (!validateAll()) {
    await focusFirstError();
    return;
  }

  isSubmitting.value = true;

  try {
    const result = await authService.register(
      form.userName,
      form.email,
      form.password,
      form.role
    );

    if (result.availableRoles && result.availableRoles.length > 1) {
      successMessage.value = `${form.role} role added successfully! You now have access to both member and organizer features.`;
      isExistingUser.value = true;
    } else {
      successMessage.value = `Account created successfully! Welcome to Community Sport as a ${form.role}.`;
    }

    // Redirect to appropriate account page after short delay
    setTimeout(() => {
      const targetPage = form.role === 'organizer' ? 'organizer-account' : 'member-account';
      router.push({ name: targetPage });
    }, 2000);

  } catch (error) {
    // Check if this is an existing user trying to add a role
    if (error.message.includes('email-already-in-use')) {
      errorMessage.value = 'This email is already registered. Please sign in first, then you can add additional roles from your account page.';
    } else {
      errorMessage.value = error.message;
    }
    console.error('Registration error:', error);
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

.btn-check:focus + .btn {
  outline: 2px solid var(--bs-primary);
  outline-offset: 2px;
}
</style>
