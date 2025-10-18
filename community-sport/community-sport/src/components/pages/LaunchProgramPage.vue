<template>
  <div class="container py-4 py-lg-5">
    <div class="row justify-content-center">
      <div class="col-12 col-xl-10">
        <!-- Header -->
        <div class="d-flex align-items-center mb-4">
          <RouterLink :to="{ name: 'organizer-account' }" class="btn btn-outline-secondary me-3">
            <i class="bi bi-arrow-left me-2" aria-hidden="true"></i>
            Back to Dashboard
          </RouterLink>
          <div>
            <h1 class="h3 mb-1">Launch New Program</h1>
            <p class="text-muted mb-0">Create and configure your community sports program</p>
          </div>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="alert alert-success" role="alert">
          <i class="bi bi-check-circle-fill me-2" aria-hidden="true"></i>
          {{ successMessage }}
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleSubmit" novalidate>
          <div class="row g-4">
            <!-- Main Program Information -->
            <div class="col-md-8">
              <div class="card">
                <div class="card-header">
                  <h5 class="card-title mb-0">
                    <i class="bi bi-info-circle me-2" aria-hidden="true"></i>
                    Program Information
                  </h5>
                </div>
                <div class="card-body">
                  <!-- Title -->
                  <div class="mb-3">
                    <label for="title" class="form-label">
                      Program Title <span class="text-danger">*</span>
                    </label>
                    <input
                      id="title"
                      ref="titleRef"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': touched.title && errors.title }"
                      v-model.trim="form.title"
                      @blur="onBlur('title')"
                      @input="onInput('title')"
                      placeholder="e.g. Beginner's Tennis Program"
                      required
                    />
                    <div v-if="touched.title && errors.title" class="invalid-feedback">
                      {{ errors.title }}
                    </div>
                  </div>

                  <!-- Sport -->
                  <div class="mb-3">
                    <label for="sport" class="form-label">
                      Sport <span class="text-danger">*</span>
                    </label>
                    <select
                      id="sport"
                      ref="sportRef"
                      class="form-select"
                      :class="{ 'is-invalid': touched.sport && errors.sport }"
                      v-model="form.sport"
                      @blur="onBlur('sport')"
                      @change="onInput('sport')"
                      required
                    >
                      <option value="">Select a sport</option>
                      <option v-for="sport in sportOptions" :key="sport" :value="sport">
                        {{ sport }}
                      </option>
                    </select>
                    <div v-if="touched.sport && errors.sport" class="invalid-feedback">
                      {{ errors.sport }}
                    </div>
                  </div>

                  <!-- Age Groups -->
                  <div class="mb-3">
                    <label class="form-label">
                      Age Groups <span class="text-danger">*</span>
                    </label>
                    <div class="row g-2">
                      <div v-for="ageGroup in ageGroupOptions" :key="ageGroup" class="col-md-4 col-6">
                        <div class="form-check">
                          <input
                            :id="`age-${ageGroup}`"
                            type="checkbox"
                            class="form-check-input"
                            :value="ageGroup"
                            v-model="form.ageGroups"
                            @change="onInput('ageGroups')"
                          />
                          <label :for="`age-${ageGroup}`" class="form-check-label">
                            {{ ageGroup }}
                          </label>
                        </div>
                      </div>
                    </div>
                    <div v-if="touched.ageGroups && errors.ageGroups" class="text-danger small mt-1">
                      {{ errors.ageGroups }}
                    </div>
                  </div>

                  <!-- Description -->
                  <div class="mb-3">
                    <label for="description" class="form-label">
                      Description <span class="text-danger">*</span>
                    </label>
                    <textarea
                      id="description"
                      ref="descriptionRef"
                      rows="4"
                      class="form-control"
                      :class="{ 'is-invalid': touched.description && errors.description }"
                      v-model.trim="form.description"
                      @blur="onBlur('description')"
                      @input="onInput('description')"
                      placeholder="Describe your program, what participants can expect, skill level requirements, equipment needed, etc."
                      required
                    />
                    <div v-if="touched.description && errors.description" class="invalid-feedback">
                      {{ errors.description }}
                    </div>
                    <div class="form-text">{{ form.description.length }}/500 characters</div>
                  </div>

                  <!-- Cost -->
                  <div class="row g-3 mb-3">
                    <div class="col-md-6">
                      <label for="cost" class="form-label">
                        Cost <span class="text-danger">*</span>
                      </label>
                      <div class="input-group">
                        <span class="input-group-text">$</span>
                        <input
                          id="cost"
                          ref="costRef"
                          type="number"
                          step="0.01"
                          min="0"
                          class="form-control"
                          :class="{ 'is-invalid': touched.cost && errors.cost }"
                          v-model.number="form.cost"
                          @blur="onBlur('cost')"
                          @input="onInput('cost')"
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div v-if="touched.cost && errors.cost" class="invalid-feedback">
                        {{ errors.cost }}
                      </div>
                      <div class="form-text">Enter 0 for free programs</div>
                    </div>
                    <div class="col-md-6">
                      <label for="cost-unit" class="form-label">
                        Cost Unit <span class="text-danger">*</span>
                      </label>
                      <select
                        id="cost-unit"
                        class="form-select"
                        :class="{ 'is-invalid': touched.costUnit && errors.costUnit }"
                        v-model="form.costUnit"
                        @blur="onBlur('costUnit')"
                        @change="onInput('costUnit')"
                        required
                      >
                        <option v-for="unit in costUnitOptions" :key="unit" :value="unit">
                          {{ unit }}
                        </option>
                      </select>
                      <div v-if="touched.costUnit && errors.costUnit" class="invalid-feedback">
                        {{ errors.costUnit }}
                      </div>
                    </div>
                  </div>

                  <!-- Image Upload -->
                  <div class="mb-3">
                    <label for="program-images" class="form-label">
                      Program Images
                    </label>
                    <input
                      id="program-images"
                      type="file"
                      class="form-control"
                      :class="{ 'is-invalid': touched.images && errors.images }"
                      multiple
                      accept="image/*"
                      @change="handleImageUpload"
                      @blur="onBlur('images')"
                    />
                    <div v-if="touched.images && errors.images" class="invalid-feedback">
                      {{ errors.images }}
                    </div>
                    <div class="form-text">Upload images to showcase your program (JPG, PNG, GIF - Max 5MB each, up to 10 images)</div>
                    
                    <!-- Image Preview -->
                    <div v-if="imagePreviewUrls.length > 0" class="mt-3">
                      <div class="row g-2">
                        <div 
                          v-for="(preview, index) in imagePreviewUrls" 
                          :key="index" 
                          class="col-6 col-md-4 col-lg-3"
                        >
                          <div class="position-relative">
                            <img 
                              :src="preview.url" 
                              :alt="`Preview ${index + 1}`"
                              class="img-thumbnail w-100"
                              style="height: 100px; object-fit: cover;"
                            />
                            <button
                              type="button"
                              class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                              @click="removeImage(index)"
                              :aria-label="`Remove image ${index + 1}`"
                            >
                              <i class="bi bi-x" aria-hidden="true"></i>
                            </button>
                            <div class="small text-muted mt-1 text-truncate">
                              {{ preview.name }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Upload Status -->
                    <div v-if="imageUploadStatus" class="mt-2">
                      <div v-if="imageUploadStatus.type === 'uploading'" class="text-info">
                        <i class="bi bi-cloud-arrow-up me-1" aria-hidden="true"></i>
                        Uploading images...
                      </div>
                      <div v-else-if="imageUploadStatus.type === 'success'" class="text-success">
                        <i class="bi bi-check-circle me-1" aria-hidden="true"></i>
                        {{ imageUploadStatus.message }}
                      </div>
                      <div v-else-if="imageUploadStatus.type === 'error'" class="text-danger">
                        <i class="bi bi-exclamation-triangle me-1" aria-hidden="true"></i>
                        {{ imageUploadStatus.message }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Accessibility & Inclusivity -->
              <div class="card mt-4">
                <div class="card-header">
                  <h5 class="card-title mb-0">
                    <i class="bi bi-universal-access me-2" aria-hidden="true"></i>
                    Accessibility & Inclusivity
                  </h5>
                </div>
                <div class="card-body">
                  <!-- Accessibility Features -->
                  <div class="mb-3">
                    <label class="form-label">Accessibility Features</label>
                    <div class="row g-2">
                      <div v-for="feature in accessibilityOptions" :key="feature" class="col-md-6">
                        <div class="form-check">
                          <input
                            :id="`accessibility-${feature}`"
                            type="checkbox"
                            class="form-check-input"
                            :value="feature"
                            v-model="form.accessibility"
                          />
                          <label :for="`accessibility-${feature}`" class="form-check-label">
                            {{ feature }}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Inclusivity Tags -->
                  <div class="mb-3">
                    <label for="inclusivity-tag-input" class="form-label">Inclusivity Tags</label>
                    <div class="input-group mb-2">
                      <input
                        id="inclusivity-tag-input"
                        type="text"
                        class="form-control"
                        v-model="newInclusivityTag"
                        @keyup.enter="addInclusivityTag"
                        placeholder="Type a tag and press Enter"
                      />
                      <button
                        type="button"
                        class="btn btn-outline-secondary"
                        @click="addInclusivityTag"
                        :disabled="!newInclusivityTag.trim()"
                      >
                        Add Tag
                      </button>
                    </div>
                    <div class="d-flex flex-wrap gap-2">
                      <span
                        v-for="(tag, index) in form.inclusivityTags"
                        :key="index"
                        class="badge bg-primary"
                      >
                        {{ tag }}
                        <button
                          type="button"
                          class="btn-close btn-close-white ms-2"
                          @click="removeInclusivityTag(index)"
                          :aria-label="`Remove ${tag} tag`"
                        ></button>
                      </span>
                    </div>
                    <div class="form-text">Examples: beginner-friendly, women-only, LGBTQ+ friendly, family-oriented</div>
                  </div>

                  <!-- Equipment -->
                  <div class="mb-3">
                    <label class="form-label">Equipment</label>
                    <div class="form-check mb-2">
                      <input
                        id="equipment-provided"
                        type="checkbox"
                        class="form-check-input"
                        v-model="form.equipment.provided"
                      />
                      <label for="equipment-provided" class="form-check-label">
                        Equipment provided by organizer
                      </label>
                    </div>
                    
                    <label for="equipment-input" class="form-label">Required Equipment</label>
                    <div class="input-group mb-2">
                      <input
                        id="equipment-input"
                        type="text"
                        class="form-control"
                        v-model="newEquipmentItem"
                        @keyup.enter="addEquipmentItem"
                        placeholder="Type equipment item and press Enter"
                      />
                      <button
                        type="button"
                        class="btn btn-outline-secondary"
                        @click="addEquipmentItem"
                        :disabled="!newEquipmentItem.trim()"
                      >
                        Add Item
                      </button>
                    </div>
                    <div class="d-flex flex-wrap gap-2">
                      <span
                        v-for="(item, index) in form.equipment.required"
                        :key="index"
                        class="badge bg-secondary"
                      >
                        {{ item }}
                        <button
                          type="button"
                          class="btn-close btn-close-white ms-2"
                          @click="removeEquipmentItem(index)"
                          :aria-label="`Remove ${item}`"
                        ></button>
                      </span>
                    </div>
                    <div class="form-text">Examples: sports shoes, water bottle, yoga mat</div>
                  </div>
                </div>
              </div>

              <!-- Venue Information -->
              <div class="card mt-4">
                <div class="card-header">
                  <h5 class="card-title mb-0">
                    <i class="bi bi-geo-alt me-2" aria-hidden="true"></i>
                    Venue Information
                  </h5>
                </div>
                <div class="card-body">
                  <!-- Venue Name -->
                  <div class="mb-3">
                    <label for="venue-name" class="form-label">
                      Venue Name <span class="text-danger">*</span>
                    </label>
                    <input
                      id="venue-name"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': touched.venueName && errors.venueName }"
                      v-model.trim="form.venue.name"
                      @blur="onBlur('venueName')"
                      @input="onInput('venueName')"
                      placeholder="e.g. Carlton Youth Centre"
                      required
                    />
                    <div v-if="touched.venueName && errors.venueName" class="invalid-feedback">
                      {{ errors.venueName }}
                    </div>
                  </div>

                  <!-- Address Search Section -->
                  <div class="mb-3">
                    <label for="address-search" class="form-label">
                      Address Search <span class="text-danger">*</span>
                    </label>
                    <div class="position-relative">
                      <div class="input-group">
                        <input
                          id="address-search"
                          type="text"
                          class="form-control"
                          v-model="addressSearchQuery"
                          @input="searchAddresses"
                          @focus="showSuggestions = addressSuggestions.length > 0"
                          placeholder="Start typing an address..."
                          autocomplete="off"
                        />
                        <button
                          type="button"
                          class="btn btn-outline-secondary"
                          @click="clearAddressSearch"
                          :disabled="!addressSearchQuery"
                        >
                          <i class="bi bi-x-lg"></i>
                        </button>
                      </div>
                      
                      <!-- Loading indicator -->
                      <div v-if="isSearching" class="position-absolute top-50 end-0 translate-middle-y me-5">
                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                          <span class="visually-hidden">Searching...</span>
                        </div>
                      </div>

                      <!-- Address suggestions dropdown -->
                      <div 
                        v-if="showSuggestions && addressSuggestions.length > 0" 
                        class="position-absolute w-100 bg-white border rounded-bottom shadow-lg"
                        style="top: 100%; z-index: 1000; max-height: 300px; overflow-y: auto;"
                      >
                        <div
                          v-for="suggestion in addressSuggestions"
                          :key="suggestion.id"
                          class="p-3 border-bottom suggestion-item"
                          @click="selectAddress(suggestion)"
                          style="cursor: pointer;"
                        >
                          <div class="fw-medium">{{ suggestion.place_name }}</div>
                        </div>
                      </div>
                    </div>
                    <div class="form-text">
                      Search for your venue address. Select from the suggestions to auto-fill address details.
                    </div>
                  </div>

                  <!-- Address Confirmation -->
                  <div v-if="showAddressConfirmation" class="mb-3">
                    <div class="alert alert-info d-flex align-items-center">
                      <i class="bi bi-info-circle me-2"></i>
                      <div class="flex-grow-1">
                        <strong>Selected Address:</strong><br>
                        {{ selectedAddress.place_name }}
                      </div>
                      <div class="ms-3">
                        <button type="button" class="btn btn-success btn-sm me-2" @click="confirmAddress">
                          <i class="bi bi-check-lg me-1"></i>Confirm
                        </button>
                        <button type="button" class="btn btn-outline-secondary btn-sm" @click="cancelAddressSelection">
                          <i class="bi bi-x-lg me-1"></i>Cancel
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Interactive Map -->
                  <div class="mb-3">
                    <label class="form-label">Location Map</label>
                    <div class="position-relative">
                      <div 
                        ref="mapContainer" 
                        class="map-container border rounded"
                        style="height: 300px; width: 100%;"
                      ></div>
                      
                      <!-- Map loading overlay -->
                      <div 
                        v-if="isSearching" 
                        class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75 rounded"
                        style="z-index: 1000;"
                      >
                        <div class="text-center">
                          <div class="spinner-border text-primary mb-2" role="status">
                            <span class="visually-hidden">Finding address...</span>
                          </div>
                          <div class="small text-muted">Finding address...</div>
                        </div>
                      </div>
                    </div>
                    <div class="form-text">
                      <i class="bi bi-info-circle me-1"></i>
                      <strong>Interactive Map:</strong> Click anywhere on the map to automatically find the address at that location, or use the address search above to find a specific address.
                    </div>
                    <div class="mt-2">
                      <small class="text-muted">
                        <i class="bi bi-cursor me-1"></i>
                        Tip: The map cursor changes to a crosshair to indicate it's clickable
                      </small>
                    </div>
                  </div>

                  <!-- Manual Address Fields (Auto-filled) -->
                  <div class="row g-3">
                    <div class="col-12">
                      <label for="venue-address" class="form-label">
                        Street Address <span class="text-danger">*</span>
                      </label>
                      <input
                        id="venue-address"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': touched.venueAddress && errors.venueAddress }"
                        v-model.trim="form.venue.address"
                        @blur="onBlur('venueAddress')"
                        @input="onInput('venueAddress')"
                        placeholder="e.g. 88 Rathdowne St"
                        required
                        readonly
                      />
                      <div v-if="touched.venueAddress && errors.venueAddress" class="invalid-feedback">
                        {{ errors.venueAddress }}
                      </div>
                      <div class="form-text">Auto-filled from address search</div>
                    </div>
                    <div class="col-md-8">
                      <label for="venue-suburb" class="form-label">
                        Suburb <span class="text-danger">*</span>
                      </label>
                      <input
                        id="venue-suburb"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': touched.venueSuburb && errors.venueSuburb }"
                        v-model.trim="form.venue.suburb"
                        @blur="onBlur('venueSuburb')"
                        @input="onInput('venueSuburb')"
                        placeholder="e.g. Carlton"
                        required
                        readonly
                      />
                      <div v-if="touched.venueSuburb && errors.venueSuburb" class="invalid-feedback">
                        {{ errors.venueSuburb }}
                      </div>
                    </div>
                    <div class="col-md-4">
                      <label for="venue-postcode" class="form-label">
                        Postcode <span class="text-danger">*</span>
                      </label>
                      <input
                        id="venue-postcode"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': touched.venuePostcode && errors.venuePostcode }"
                        v-model.trim="form.venue.postcode"
                        @blur="onBlur('venuePostcode')"
                        @input="onInput('venuePostcode')"
                        placeholder="e.g. 3053"
                        maxlength="4"
                        required
                        readonly
                      />
                      <div v-if="touched.venuePostcode && errors.venuePostcode" class="invalid-feedback">
                        {{ errors.venuePostcode }}
                      </div>
                    </div>
                  </div>

                  <!-- Coordinates Display (for debugging) -->
                  <div v-if="form.venue.lat && form.venue.lng" class="mt-3">
                    <small class="text-muted">
                      <i class="bi bi-geo me-1"></i>
                      Coordinates: {{ form.venue.lat.toFixed(6) }}, {{ form.venue.lng.toFixed(6) }}
                    </small>
                  </div>
                </div>
              </div>

              <!-- Contact Information -->
              <div class="card mt-4">
                <div class="card-header">
                  <h5 class="card-title mb-0">
                    <i class="bi bi-telephone me-2" aria-hidden="true"></i>
                    Contact Information
                  </h5>
                </div>
                <div class="card-body">
                  <!-- Contact Email -->
                  <div class="mb-3">
                    <label for="contact-email" class="form-label">
                      Contact Email <span class="text-danger">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      class="form-control"
                      :class="{ 'is-invalid': touched.contactEmail && errors.contactEmail }"
                      v-model.trim="form.contact.email"
                      @blur="onBlur('contactEmail')"
                      @input="onInput('contactEmail')"
                      placeholder="e.g. contact@example.com"
                      required
                    />
                    <div v-if="touched.contactEmail && errors.contactEmail" class="invalid-feedback">
                      {{ errors.contactEmail }}
                    </div>
                  </div>

                  <!-- Contact Phone -->
                  <div class="mb-3">
                    <label for="contact-phone" class="form-label">
                      Contact Phone <span class="text-danger">*</span>
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      class="form-control"
                      :class="{ 'is-invalid': touched.contactPhone && errors.contactPhone }"
                      v-model.trim="form.contact.phone"
                      @blur="onBlur('contactPhone')"
                      @input="onInput('contactPhone')"
                      placeholder="e.g. 03 9123 4567"
                      required
                    />
                    <div v-if="touched.contactPhone && errors.contactPhone" class="invalid-feedback">
                      {{ errors.contactPhone }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Schedule Section -->
            <div class="col-md-4">
              <div class="card sticky-top" style="top: 2rem;">
                <div class="card-header">
                  <h5 class="card-title mb-0">
                    <i class="bi bi-calendar-event me-2" aria-hidden="true"></i>
                    Schedule
                  </h5>
                </div>
                <div class="card-body">
                  <!-- Days -->
                  <div class="mb-3">
                    <label class="form-label">
                      Days <span class="text-danger">*</span>
                    </label>
                    <div class="d-flex flex-wrap gap-2">
                      <div v-for="day in dayOptions" :key="day.value" class="form-check">
                        <input
                          :id="`day-${day.value}`"
                          type="checkbox"
                          class="form-check-input"
                          :value="day.value"
                          v-model="form.schedule.days"
                          @change="onInput('scheduleDays')"
                        />
                        <label :for="`day-${day.value}`" class="form-check-label">
                          {{ day.label }}
                        </label>
                      </div>
                    </div>
                    <div v-if="touched.scheduleDays && errors.scheduleDays" class="text-danger small mt-1">
                      {{ errors.scheduleDays }}
                    </div>
                  </div>

                  <!-- Start Time -->
                  <div class="mb-3">
                    <label for="start-time" class="form-label">
                      Start Time <span class="text-danger">*</span>
                    </label>
                    <div class="row g-2">
                      <div class="col-7">
                        <select
                          id="start-hour"
                          class="form-select form-select-sm"
                          v-model="form.schedule.startHour"
                          @change="onInput('startTime')"
                        >
                          <option value="">Hour</option>
                          <option v-for="hour in hourOptions" :key="hour" :value="hour">
                            {{ hour }}
                          </option>
                        </select>
                      </div>
                      <div class="col-5">
                        <select
                          id="start-minute"
                          class="form-select form-select-sm"
                          v-model="form.schedule.startMinute"
                          @change="onInput('startTime')"
                        >
                          <option value="">Min</option>
                          <option v-for="minute in minuteOptions" :key="minute" :value="minute">
                            {{ minute }}
                          </option>
                        </select>
                      </div>
                    </div>
                    <div v-if="touched.startTime && errors.startTime" class="text-danger small mt-1">
                      {{ errors.startTime }}
                    </div>
                  </div>

                  <!-- End Time -->
                  <div class="mb-3">
                    <label for="end-time" class="form-label">
                      End Time <span class="text-danger">*</span>
                    </label>
                    <div class="row g-2">
                      <div class="col-7">
                        <select
                          id="end-hour"
                          class="form-select form-select-sm"
                          v-model="form.schedule.endHour"
                          @change="onInput('endTime')"
                        >
                          <option value="">Hour</option>
                          <option v-for="hour in hourOptions" :key="hour" :value="hour">
                            {{ hour }}
                          </option>
                        </select>
                      </div>
                      <div class="col-5">
                        <select
                          id="end-minute"
                          class="form-select form-select-sm"
                          v-model="form.schedule.endMinute"
                          @change="onInput('endTime')"
                        >
                          <option value="">Min</option>
                          <option v-for="minute in minuteOptions" :key="minute" :value="minute">
                            {{ minute }}
                          </option>
                        </select>
                      </div>
                    </div>
                    <div v-if="touched.endTime && errors.endTime" class="text-danger small mt-1">
                      {{ errors.endTime }}
                    </div>
                  </div>

                  <!-- Start Date -->
                  <div class="mb-3">
                    <label for="start-date" class="form-label">
                      Start Date <span class="text-danger">*</span>
                    </label>
                    <input
                      id="start-date"
                      type="date"
                      class="form-control"
                      :class="{ 'is-invalid': touched.startDate && errors.startDate }"
                      v-model="form.schedule.startDate"
                      @blur="onBlur('startDate')"
                      @change="onInput('startDate')"
                      :min="minDate"
                      required
                    />
                    <div v-if="touched.startDate && errors.startDate" class="invalid-feedback">
                      {{ errors.startDate }}
                    </div>
                  </div>

                  <!-- Max Participants -->
                  <div class="mb-4">
                    <label for="max-participants" class="form-label">
                      Max Participants <span class="text-danger">*</span>
                    </label>
                    <input
                      id="max-participants"
                      type="number"
                      min="1"
                      max="1000"
                      class="form-control"
                      :class="{ 'is-invalid': touched.maxParticipants && errors.maxParticipants }"
                      v-model.number="form.maxParticipants"
                      @blur="onBlur('maxParticipants')"
                      @input="onInput('maxParticipants')"
                      placeholder="20"
                      required
                    />
                    <div v-if="touched.maxParticipants && errors.maxParticipants" class="invalid-feedback">
                      {{ errors.maxParticipants }}
                    </div>
                    <div class="form-text">Maximum number of participants allowed</div>
                  </div>

                  <!-- Submit Button -->
                  <button
                    type="submit"
                    class="btn btn-success w-100"
                    :disabled="isSubmitting || !isFormValid"
                  >
                    <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    <i v-else class="bi bi-rocket-takeoff me-2" aria-hidden="true"></i>
                    {{ isSubmitting ? 'Launching...' : 'Launch Program' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../../services/AuthService.js';
import dataService from '../../services/DataService.js';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const router = useRouter();

// Form data
const form = reactive({
  title: '',
  sport: '',
  organizer_email: '',
  ageGroups: [],
  description: '',
  cost: 0,
  costUnit: 'per-session',
  accessibility: [],
  inclusivityTags: [],
  schedule: {
    days: [],
    startHour: '',
    startMinute: '',
    endHour: '',
    endMinute: '',
    startDate: ''
  },
  venue: {
    name: '',
    address: '',
    suburb: '',
    postcode: '',
    lat: null,
    lng: null
  },
  equipment: {
    provided: false,
    required: []
  },
  contact: {
    email: '',
    phone: ''
  },
  images: [], // Not implemented yet
  maxParticipants: 20
});

// Form state
const touched = reactive({
  title: false,
  sport: false,
  ageGroups: false,
  description: false,
  cost: false,
  costUnit: false,
  scheduleDays: false,
  startTime: false,
  endTime: false,
  startDate: false,
  venueName: false,
  venueAddress: false,
  venueSuburb: false,
  venuePostcode: false,
  contactEmail: false,
  contactPhone: false,
  maxParticipants: false,
  images: false
});

const errors = reactive({
  title: '',
  sport: '',
  ageGroups: '',
  description: '',
  cost: '',
  costUnit: '',
  scheduleDays: '',
  startTime: '',
  endTime: '',
  startDate: '',
  venueName: '',
  venueAddress: '',
  venueSuburb: '',
  venuePostcode: '',
  contactEmail: '',
  contactPhone: '',
  maxParticipants: '',
  images: ''
});

const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const newInclusivityTag = ref('');
const newEquipmentItem = ref('');
const imagePreviewUrls = ref([]);
const imageUploadStatus = ref(null);
const selectedImageFiles = ref([]);

// Mapbox related state
const map = ref(null);
const mapContainer = ref(null);
const marker = ref(null);
const addressSearchQuery = ref('');
const addressSuggestions = ref([]);
const showSuggestions = ref(false);
const isSearching = ref(false);
const selectedAddress = ref(null);
const showAddressConfirmation = ref(false);

// Form refs
const titleRef = ref(null);
const sportRef = ref(null);
const descriptionRef = ref(null);
const costRef = ref(null);

// Options
const sportOptions = [
  'Football', 'Basketball', 'Tennis', 'Swimming', 'Running', 'Cycling',
  'Yoga', 'Pilates', 'Boxing', 'Martial Arts', 'Dance', 'Volleyball',
  'Badminton', 'Table Tennis', 'Cricket', 'Rugby', 'Netball', 'Golf',
  'Rock Climbing', 'Walking Football', 'Wheelchair Basketball', 'Other'
];

const ageGroupOptions = [
  '5-8', '8-12', '12-17', '18-40', '40-60', '60+'
];

const costUnitOptions = [
  'per-session', 'per-class', 'per-term', 'per-month', 'free'
];

const accessibilityOptions = [
  'Wheelchair Accessible', 'Hearing Loop Available', 'Sign Language Support',
  'Visual Impairment Support', 'Cognitive Support Available', 'Accessible Parking'
];

const dayOptions = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' }
];

const hourOptions = Array.from({ length: 24 }, (_, i) => 
  i.toString().padStart(2, '0')
);

const minuteOptions = ['00', '15', '30', '45'];

// Get minimum date (today)
const minDate = computed(() => {
  return new Date().toISOString().split('T')[0];
});

// Load organizer email and initialize map on mount
onMounted(async () => {
  try {
    const currentUser = await authService.getCurrentUser();
    if (currentUser.user) {
      form.organizer_email = currentUser.user.email;
      form.contact.email = currentUser.user.email; // Default contact email to organizer email
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }

  // Initialize Mapbox
  await initializeMap();
});

// Cleanup map on unmount
onUnmounted(() => {
  if (map.value) {
    map.value.remove();
  }
});

// Mapbox functions
async function initializeMap() {
  try {
    // Set Mapbox access token
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_TOKEN;
    
    if (!mapboxgl.accessToken) {
      console.error('Mapbox access token not found');
      return;
    }

    // Wait for next tick to ensure DOM is ready
    await nextTick();
    
    if (!mapContainer.value) {
      console.error('Map container not found');
      return;
    }

    // Initialize map centered on Melbourne, Australia
    map.value = new mapboxgl.Map({
      container: mapContainer.value,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [144.9631, -37.8136], // Melbourne coordinates
      zoom: 10
    });

    // Add navigation controls
    map.value.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add click event listener for reverse geocoding
    map.value.on('click', handleMapClick);

    console.log('Mapbox initialized successfully');
  } catch (error) {
    console.error('Error initializing Mapbox:', error);
  }
}

// Debounce function for search
let searchTimeout = null;

async function searchAddresses() {
  if (!addressSearchQuery.value.trim() || addressSearchQuery.value.length < 3) {
    addressSuggestions.value = [];
    showSuggestions.value = false;
    return;
  }

  // Clear previous timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // Debounce the search
  searchTimeout = setTimeout(async () => {
    await performAddressSearch();
  }, 300);
}

async function performAddressSearch() {
  isSearching.value = true;
  
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addressSearchQuery.value)}.json?` +
      `access_token=${mapboxgl.accessToken}&` +
      `country=AU&` +
      `types=address,poi&` +
      `limit=5&` +
      `autocomplete=true`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch address suggestions');
    }

    const data = await response.json();
    addressSuggestions.value = data.features.map(feature => ({
      id: feature.id,
      place_name: feature.place_name,
      center: feature.center,
      context: feature.context || [],
      properties: feature.properties || {}
    }));
    
    showSuggestions.value = addressSuggestions.value.length > 0;
  } catch (error) {
    console.error('Error searching addresses:', error);
    addressSuggestions.value = [];
    showSuggestions.value = false;
  } finally {
    isSearching.value = false;
  }
}

function selectAddress(suggestion) {
  selectedAddress.value = suggestion;
  addressSearchQuery.value = suggestion.place_name;
  showSuggestions.value = false;
  showAddressConfirmation.value = true;

  // Add marker to map
  if (marker.value) {
    marker.value.remove();
  }

  marker.value = new mapboxgl.Marker()
    .setLngLat(suggestion.center)
    .addTo(map.value);

  // Center map on selected location
  map.value.flyTo({
    center: suggestion.center,
    zoom: 15
  });
}

function confirmAddress() {
  if (!selectedAddress.value) return;

  // Parse address components from Mapbox response
  const addressComponents = parseAddressComponents(selectedAddress.value);
  
  // Auto-fill form fields
  form.venue.address = addressComponents.address;
  form.venue.suburb = addressComponents.suburb;
  form.venue.postcode = addressComponents.postcode;
  form.venue.lat = selectedAddress.value.center[1]; // latitude
  form.venue.lng = selectedAddress.value.center[0]; // longitude

  showAddressConfirmation.value = false;
  
  // Trigger validation for updated fields
  validateField('venueAddress');
  validateField('venueSuburb');
  validateField('venuePostcode');
}

function parseAddressComponents(suggestion) {
  const components = {
    address: '',
    suburb: '',
    postcode: '',
    state: ''
  };

  // Extract street address from place_name
  const placeParts = suggestion.place_name.split(',');
  if (placeParts.length > 0) {
    components.address = placeParts[0].trim();
  }

  // Parse context for suburb, postcode, and state
  if (suggestion.context) {
    suggestion.context.forEach(ctx => {
      if (ctx.id.startsWith('postcode')) {
        components.postcode = ctx.text;
      } else if (ctx.id.startsWith('place')) {
        components.suburb = ctx.text;
      } else if (ctx.id.startsWith('region')) {
        components.state = ctx.text;
      }
    });
  }

  return components;
}

function cancelAddressSelection() {
  selectedAddress.value = null;
  showAddressConfirmation.value = false;
  addressSearchQuery.value = '';
  
  // Remove marker
  if (marker.value) {
    marker.value.remove();
    marker.value = null;
  }
}

function clearAddressSearch() {
  addressSearchQuery.value = '';
  addressSuggestions.value = [];
  showSuggestions.value = false;
  selectedAddress.value = null;
  showAddressConfirmation.value = false;
  
  // Remove marker
  if (marker.value) {
    marker.value.remove();
    marker.value = null;
  }

  // Clear form fields
  form.venue.address = '';
  form.venue.suburb = '';
  form.venue.postcode = '';
  form.venue.lat = null;
  form.venue.lng = null;
}

// Handle map click for reverse geocoding
async function handleMapClick(event) {
  const { lng, lat } = event.lngLat;
  
  try {
    // Show loading state
    isSearching.value = true;
    
    // Perform reverse geocoding
    const addressData = await reverseGeocode(lng, lat);
    
    if (addressData) {
      // Create a suggestion object similar to search results
      const suggestion = {
        id: `reverse-${Date.now()}`,
        place_name: addressData.place_name,
        center: [lng, lat],
        context: addressData.context || [],
        properties: addressData.properties || {}
      };
      
      // Auto-select this address
      selectAddress(suggestion);
    }
  } catch (error) {
    console.error('Error with map click reverse geocoding:', error);
  } finally {
    isSearching.value = false;
  }
}

// Reverse geocoding function
async function reverseGeocode(lng, lat) {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?` +
      `access_token=${mapboxgl.accessToken}&` +
      `country=AU&` +
      `types=address,poi&` +
      `limit=1`
    );

    if (!response.ok) {
      throw new Error('Failed to reverse geocode location');
    }

    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      return data.features[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    return null;
  }
}

// Validation functions
function validateField(fieldName) {
  let error = '';

  switch (fieldName) {
    case 'title':
      if (!form.title.trim()) {
        error = 'Program title is required.';
      } else if (form.title.trim().length < 3) {
        error = 'Title must be at least 3 characters long.';
      }
      break;

    case 'sport':
      if (!form.sport) {
        error = 'Please select a sport.';
      }
      break;

    case 'ageGroups':
      if (form.ageGroups.length === 0) {
        error = 'Please select at least one age group.';
      }
      break;

    case 'description':
      if (!form.description.trim()) {
        error = 'Program description is required.';
      } else if (form.description.trim().length < 20) {
        error = 'Description must be at least 20 characters long.';
      } else if (form.description.length > 500) {
        error = 'Description must not exceed 500 characters.';
      }
      break;

    case 'cost':
      if (form.cost < 0) {
        error = 'Cost cannot be negative.';
      }
      break;

    case 'scheduleDays':
      if (form.schedule.days.length === 0) {
        error = 'Please select at least one day.';
      }
      break;

    case 'startTime':
      if (!form.schedule.startHour || !form.schedule.startMinute) {
        error = 'Please select start time.';
      }
      break;

    case 'endTime':
      if (!form.schedule.endHour || !form.schedule.endMinute) {
        error = 'Please select end time.';
      } else if (form.schedule.startHour && form.schedule.startMinute) {
        const startTime = parseInt(form.schedule.startHour) * 60 + parseInt(form.schedule.startMinute);
        const endTime = parseInt(form.schedule.endHour) * 60 + parseInt(form.schedule.endMinute);
        if (endTime <= startTime) {
          error = 'End time must be after start time.';
        }
      }
      break;

    case 'startDate':
      if (!form.schedule.startDate) {
        error = 'Please select a start date.';
      } else if (new Date(form.schedule.startDate) < new Date()) {
        error = 'Start date cannot be in the past.';
      }
      break;

    case 'costUnit':
      if (!form.costUnit) {
        error = 'Please select a cost unit.';
      }
      break;

    case 'venueName':
      if (!form.venue.name.trim()) {
        error = 'Venue name is required.';
      }
      break;

    case 'venueAddress':
      if (!form.venue.address.trim()) {
        error = 'Venue address is required.';
      }
      break;

    case 'venueSuburb':
      if (!form.venue.suburb.trim()) {
        error = 'Venue suburb is required.';
      }
      break;

    case 'venuePostcode':
      if (!form.venue.postcode.trim()) {
        error = 'Venue postcode is required.';
      } else if (!/^\d{4}$/.test(form.venue.postcode.trim())) {
        error = 'Postcode must be 4 digits.';
      }
      break;

    case 'contactEmail':
      if (!form.contact.email.trim()) {
        error = 'Contact email is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact.email)) {
        error = 'Please enter a valid email address.';
      }
      break;

    case 'contactPhone':
      if (!form.contact.phone.trim()) {
        error = 'Contact phone is required.';
      } else if (!/^[\d\s\-+()]{8,}$/.test(form.contact.phone.trim())) {
        error = 'Please enter a valid phone number.';
      }
      break;

    case 'maxParticipants':
      if (!form.maxParticipants || form.maxParticipants < 1) {
        error = 'Maximum participants must be at least 1.';
      } else if (form.maxParticipants > 1000) {
        error = 'Maximum participants cannot exceed 1000.';
      }
      break;

    case 'images':
      if (selectedImageFiles.value.length > 10) {
        error = 'Maximum 10 images allowed.';
      }
      break;
  }

  errors[fieldName] = error;
  return !error;
}

function validateAll() {
  return (
    validateField('title') &&
    validateField('sport') &&
    validateField('ageGroups') &&
    validateField('description') &&
    validateField('cost') &&
    validateField('costUnit') &&
    validateField('scheduleDays') &&
    validateField('startTime') &&
    validateField('endTime') &&
    validateField('startDate') &&
    validateField('venueName') &&
    validateField('venueAddress') &&
    validateField('venueSuburb') &&
    validateField('venuePostcode') &&
    validateField('contactEmail') &&
    validateField('contactPhone') &&
    validateField('maxParticipants')
  );
}

// Computed properties
const isFormValid = computed(() => {
  return form.title.trim() &&
         form.sport &&
         form.ageGroups.length > 0 &&
         form.description.trim() &&
         form.cost >= 0 &&
         form.costUnit &&
         form.schedule.days.length > 0 &&
         form.schedule.startHour &&
         form.schedule.startMinute &&
         form.schedule.endHour &&
         form.schedule.endMinute &&
         form.schedule.startDate &&
         form.venue.name.trim() &&
         form.venue.address.trim() &&
         form.venue.suburb.trim() &&
         form.venue.postcode.trim() &&
         form.contact.email.trim() &&
         form.contact.phone.trim() &&
         form.maxParticipants > 0 &&
         !errors.title &&
         !errors.sport &&
         !errors.ageGroups &&
         !errors.description &&
         !errors.cost &&
         !errors.costUnit &&
         !errors.scheduleDays &&
         !errors.startTime &&
         !errors.endTime &&
         !errors.startDate &&
         !errors.venueName &&
         !errors.venueAddress &&
         !errors.venueSuburb &&
         !errors.venuePostcode &&
         !errors.contactEmail &&
         !errors.contactPhone &&
         !errors.maxParticipants;
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
  if (successMessage.value) {
    successMessage.value = '';
  }
}

function addInclusivityTag() {
  const tag = newInclusivityTag.value.trim();
  if (tag && !form.inclusivityTags.includes(tag)) {
    form.inclusivityTags.push(tag);
    newInclusivityTag.value = '';
  }
}

function removeInclusivityTag(index) {
  form.inclusivityTags.splice(index, 1);
}

function addEquipmentItem() {
  const item = newEquipmentItem.value.trim();
  if (item && !form.equipment.required.includes(item)) {
    form.equipment.required.push(item);
    newEquipmentItem.value = '';
  }
}

function removeEquipmentItem(index) {
  form.equipment.required.splice(index, 1);
}

// Image handling functions
function handleImageUpload(event) {
  const files = Array.from(event.target.files);
  
  // Clear previous status
  imageUploadStatus.value = null;
  
  // Validate file types and sizes
  const validFiles = [];
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  
  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      imageUploadStatus.value = {
        type: 'error',
        message: `${file.name} is not a valid image type. Please use JPG, PNG, or GIF.`
      };
      return;
    }
    
    if (file.size > maxSize) {
      imageUploadStatus.value = {
        type: 'error',
        message: `${file.name} is too large. Maximum size is 5MB.`
      };
      return;
    }
    
    validFiles.push(file);
  }
  
  // Check total number of images
  if (selectedImageFiles.value.length + validFiles.length > 10) {
    imageUploadStatus.value = {
      type: 'error',
      message: 'Maximum 10 images allowed. Please remove some images first.'
    };
    return;
  }
  
  // Add files to selected files
  selectedImageFiles.value.push(...validFiles);
  
  // Create preview URLs
  validFiles.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreviewUrls.value.push({
        url: e.target.result,
        name: file.name,
        file: file
      });
    };
    reader.readAsDataURL(file);
  });
  
  // Note: Images will be uploaded to S3 when the program is submitted
  // For now, just store the files for preview
  form.images = []; // Will be populated with S3 URLs after upload
  
  // Show success message
  if (validFiles.length > 0) {
    imageUploadStatus.value = {
      type: 'success',
      message: `${validFiles.length} image(s) ready for upload. Images will be uploaded when you submit the program.`
    };
    
    // Clear status after 5 seconds
    setTimeout(() => {
      imageUploadStatus.value = null;
    }, 5000);
  }
  
  // Validate images field
  validateField('images');
}

function removeImage(index) {
  // Remove from preview URLs
  imagePreviewUrls.value.splice(index, 1);
  
  // Remove from selected files
  selectedImageFiles.value.splice(index, 1);
  
  // Update form.images
  form.images = selectedImageFiles.value.map(file => `/assets/images/${file.name}`);
  
  // Clear any error messages
  errors.images = '';
  
  imageUploadStatus.value = {
    type: 'success',
    message: 'Image removed successfully.'
  };
  
  // Clear status after 2 seconds
  setTimeout(() => {
    imageUploadStatus.value = null;
  }, 2000);
}

async function focusFirstError() {
  await nextTick();
  const fieldOrder = [
    { name: 'title', ref: titleRef },
    { name: 'sport', ref: sportRef },
    { name: 'description', ref: descriptionRef },
    { name: 'cost', ref: costRef }
  ];

  for (const { name, ref } of fieldOrder) {
    if (errors[name] && ref.value) {
      ref.value.focus();
      break;
    }
  }
}

async function handleSubmit() {
  errorMessage.value = '';
  successMessage.value = '';

  // Validate all fields
  if (!validateAll()) {
    await focusFirstError();
    return;
  }

  isSubmitting.value = true;

  try {
    // Check authentication first
    const currentUser = await authService.getCurrentUser();
    if (!currentUser.user) {
      errorMessage.value = 'You must be logged in to create a program. Please log in and try again.';
      return;
    }

    // Upload images to S3 if any
    const uploadedImageUrls = [];
    if (selectedImageFiles.value.length > 0) {
      imageUploadStatus.value = {
        type: 'uploading',
        message: `Uploading ${selectedImageFiles.value.length} image(s) to storage...`
      };
      
      for (let i = 0; i < selectedImageFiles.value.length; i++) {
        const file = selectedImageFiles.value[i];
        try {
          const uploadResult = await dataService.uploadImageToS3(file, null); // programId will be set after creation
          uploadedImageUrls.push(uploadResult.url);
          
          imageUploadStatus.value = {
            type: 'uploading',
            message: `Uploading images... (${i + 1}/${selectedImageFiles.value.length})`
          };
        } catch (uploadError) {
          console.error(`Failed to upload ${file.name}:`, uploadError);
          // Continue with other images
        }
      }
      
      imageUploadStatus.value = {
        type: 'success',
        message: `${uploadedImageUrls.length} of ${selectedImageFiles.value.length} image(s) uploaded successfully.`
      };
      
      // Clear after a delay
      setTimeout(() => {
        imageUploadStatus.value = null;
      }, 3000);
    }

    // Format schedule data to match required structure
    const scheduleData = form.schedule.days.map(day => ({
      day: day.charAt(0).toUpperCase() + day.slice(1), // Capitalize first letter
      start: `${form.schedule.startHour}:${form.schedule.startMinute}`,
      end: `${form.schedule.endHour}:${form.schedule.endMinute}`,
      frequency: 'weekly',
      startDate: form.schedule.startDate,
      endDate: null
    }));

    // Format the complete program data
    const programData = {
      title: form.title.trim(),
      sport: form.sport,
      organizer_email: form.organizer_email,
      description: form.description.trim(),
      ageGroups: form.ageGroups,
      cost: form.cost,
      costUnit: form.costUnit,
      accessibility: form.accessibility,
      inclusivityTags: form.inclusivityTags,
      schedule: scheduleData,
      venue: {
        name: form.venue.name.trim(),
        address: form.venue.address.trim(),
        suburb: form.venue.suburb.trim(),
        postcode: form.venue.postcode.trim(),
        lat: form.venue.lat,
        lng: form.venue.lng
      },
      equipment: {
        provided: form.equipment.provided,
        required: form.equipment.required
      },
      contact: {
        email: form.contact.email.trim(),
        phone: form.contact.phone.trim()
      },
      images: uploadedImageUrls, // S3 URLs of uploaded images
      maxParticipants: form.maxParticipants
    };

    console.log('Submitting program data:', programData);

    // Call cloud function to create program
    const result = await dataService.createProgram(programData);

    console.log('Program created with ID:', result.programId);

    successMessage.value = `Program launched successfully! Your program ID is ${result.programId}. Participants can now find and join your program.`;

    // Redirect after short delay
    setTimeout(() => {
      router.push({ name: 'organizer-account' });
    }, 3000);

  } catch (error) {
    errorMessage.value = error.message || 'Failed to launch program. Please try again.';
    console.error('Launch program error:', error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  border-radius: 12px 12px 0 0;
}

.form-control, .form-select {
  border-radius: 8px;
}

.btn {
  border-radius: 8px;
}

.badge {
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
}

.btn-close-white {
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .sticky-top {
    position: relative !important;
    top: auto !important;
  }
}

/* Image upload styling */
.img-thumbnail {
  transition: transform 0.2s ease;
}

.img-thumbnail:hover {
  transform: scale(1.05);
}

.position-relative .btn-danger {
  border-radius: 50%;
  width: 24px;
  height: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

#program-images {
  cursor: pointer;
}

#program-images:hover {
  border-color: #0d6efd;
}

/* Mapbox styles */
.map-container {
  border-radius: 8px;
  overflow: hidden;
  cursor: crosshair;
  position: relative;
}

.map-container:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.2s ease;
}

.suggestion-item:hover {
  background-color: #f8f9fa;
}

.suggestion-item:last-child {
  border-bottom: none !important;
}

/* Address search dropdown */
.position-relative .bg-white {
  border-top: none;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>
