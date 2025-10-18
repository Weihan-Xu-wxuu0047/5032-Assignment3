import { 
  collection, 
  doc, 
  getDocs, 
  getDoc
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase.js';

class DataService {
  constructor() {
    this.programsCache = null;
    this.faqsCache = null;
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.programsCacheTime = null;
    this.faqsCacheTime = null;
  }

  // Check if cache is still valid
  isCacheValid(cacheTime) {
    return cacheTime && (Date.now() - cacheTime < this.cacheExpiry);
  }

  // Get all programs from Firestore
  async getPrograms() {
    try {
      // Return cached data if still valid
      if (this.programsCache && this.isCacheValid(this.programsCacheTime)) {
        return this.programsCache;
      }

      console.log('Fetching programs from Firestore...');
      const programsRef = collection(db, 'programs');
      const querySnapshot = await getDocs(programsRef);
      
      const programs = [];
      querySnapshot.forEach((doc) => {
        programs.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Cache the results
      this.programsCache = programs;
      this.programsCacheTime = Date.now();

      console.log(`Loaded ${programs.length} programs from Firestore`);
      return programs;
    } catch (error) {
      console.error('Error fetching programs from Firestore:', error);
      throw new Error('Failed to load programs. Please try again later.');
    }
  }

  // Get a single program by ID
  async getProgram(programId) {
    try {
      // First try to get from cache
      if (this.programsCache && this.isCacheValid(this.programsCacheTime)) {
        const program = this.programsCache.find(p => p.id === programId);
        if (program) {
          return program;
        }
      }

      console.log(`Fetching program ${programId} from Firestore...`);
      const programRef = doc(db, 'programs', programId);
      const programDoc = await getDoc(programRef);
      
      if (programDoc.exists()) {
        return {
          id: programDoc.id,
          ...programDoc.data()
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching program from Firestore:', error);
      throw new Error('Failed to load program details. Please try again later.');
    }
  }

  // Get all FAQs from Firestore
  async getFaqs() {
    try {
      // Return cached data if still valid
      if (this.faqsCache && this.isCacheValid(this.faqsCacheTime)) {
        return this.faqsCache;
      }

      console.log('Fetching FAQs from Firestore...');
      const faqsRef = collection(db, 'faqs');
      const querySnapshot = await getDocs(faqsRef);
      
      const faqs = [];
      querySnapshot.forEach((doc) => {
        faqs.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Cache the results
      this.faqsCache = faqs;
      this.faqsCacheTime = Date.now();

      console.log(`Loaded ${faqs.length} FAQs from Firestore`);
      return faqs;
    } catch (error) {
      console.error('Error fetching FAQs from Firestore:', error);
      throw new Error('Failed to load FAQs. Please try again later.');
    }
  }

  // Get unique sport options from programs
  async getSportOptions() {
    try {
      const programs = await this.getPrograms();
      const sports = [...new Set(programs.map(p => p.sport))].filter(Boolean);
      return sports.sort();
    } catch (error) {
      console.error('Error getting sport options:', error);
      return [];
    }
  }

  // Get unique age group options from programs
  async getAgeGroupOptions() {
    try {
      const programs = await this.getPrograms();
      const ageGroups = new Set();
      
      programs.forEach(program => {
        if (program.ageGroups && Array.isArray(program.ageGroups)) {
          program.ageGroups.forEach(age => ageGroups.add(age));
        }
      });
      
      return [...ageGroups].sort();
    } catch (error) {
      console.error('Error getting age group options:', error);
      return [];
    }
  }

  // Get unique accessibility options from programs
  async getAccessibilityOptions() {
    try {
      const programs = await this.getPrograms();
      const accessibilityFeatures = new Set();
      
      programs.forEach(program => {
        if (program.accessibility && Array.isArray(program.accessibility)) {
          program.accessibility.forEach(feature => accessibilityFeatures.add(feature));
        }
      });
      
      // Map to user-friendly labels
      const accessibilityMap = {
        'wheelchair-access': 'Wheelchair accessible',
        'accessible-toilets': 'Accessible toilets',
        'pool-lift': 'Pool lift',
        'family-change-rooms': 'Family change rooms',
        'quiet-area': 'Quiet area',
        'pet-friendly': 'Pet friendly',
        'pram-access': 'Pram accessible',
        'baby-change': 'Baby change facilities',
        'seating-available': 'Seating available'
      };
      
      return [...accessibilityFeatures].map(feature => ({
        value: feature,
        label: accessibilityMap[feature] || feature
      })).sort((a, b) => a.label.localeCompare(b.label));
    } catch (error) {
      console.error('Error getting accessibility options:', error);
      return [];
    }
  }

  // Search programs with filters
  async searchPrograms(filters = {}) {
    try {
      const programs = await this.getPrograms();
      let results = [...programs];

      // Text search
      if (filters.query && filters.query.trim()) {
        const query = filters.query.toLowerCase().trim();
        const queryWords = query.split(/\s+/).filter(word => word.length > 0);
        
        results = results.filter(program => {
          // Create searchable text from all relevant fields
          const searchFields = [
            program.title,
            program.sport,
            program.description,
            program.venue?.name,
            program.venue?.suburb,
            program.venue?.address,
            ...(program.inclusivityTags || []),
            ...(program.accessibility || []),
            ...(program.ageGroups || []),
            program.cost === 0 ? 'free' : '',
            program.costUnit || ''
          ].filter(Boolean);
          
          const searchText = searchFields.join(' ').toLowerCase();
          
          // Check if ALL query words match (can be partial matches)
          return queryWords.every(word => {
            if (searchText.includes(word)) return true;
            
            // Check individual fields for better word boundary matching
            return searchFields.some(field => {
              const fieldText = String(field).toLowerCase();
              
              // Exact word boundary match
              const wordBoundaryRegex = new RegExp(`\\b${this.escapeRegExp(word)}`, 'i');
              if (wordBoundaryRegex.test(fieldText)) return true;
              
              // Partial word match (at least 3 characters)
              if (word.length >= 3) {
                return fieldText.split(/\s+/).some(fieldWord => 
                  fieldWord.startsWith(word) || fieldWord.includes(word)
                );
              }
              
              return false;
            });
          });
        });
      }

      // Sport filter
      if (filters.sport) {
        results = results.filter(program => program.sport === filters.sport);
      }

      // Age group filter
      if (filters.ageGroup) {
        results = results.filter(program => 
          program.ageGroups && program.ageGroups.includes(filters.ageGroup)
        );
      }

      // Max cost filter
      if (filters.maxCost !== undefined && filters.maxCost !== null && String(filters.maxCost).trim() !== '') {
        const maxCost = parseFloat(String(filters.maxCost).trim());
        if (!isNaN(maxCost) && maxCost >= 0) {
          results = results.filter(program => program.cost <= maxCost);
        }
      }

      // Accessibility filters
      if (filters.accessibility && filters.accessibility.length > 0) {
        results = results.filter(program => {
          const programAccessibility = program.accessibility || [];
          return filters.accessibility.some(filter => 
            programAccessibility.includes(filter)
          );
        });
      }

      // Sort by relevance (free programs first, then by cost)
      return results.sort((a, b) => {
        if (a.cost === 0 && b.cost > 0) return -1;
        if (a.cost > 0 && b.cost === 0) return 1;
        return a.cost - b.cost;
      });
    } catch (error) {
      console.error('Error searching programs:', error);
      throw new Error('Failed to search programs. Please try again later.');
    }
  }

  // Helper function to escape special regex characters
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Clear cache (useful for testing or when data is updated)
  clearCache() {
    this.programsCache = null;
    this.faqsCache = null;
    this.programsCacheTime = null;
    this.faqsCacheTime = null;
    console.log('Data cache cleared');
  }

  // Create a new program using Cloud Function
  async createProgram(programData) {
    try {
      console.log('Creating program via Cloud Function...', programData);
      
      // Get the Cloud Function reference
      const createProgramFunction = httpsCallable(functions, 'createProgram');
      
      // Call the Cloud Function
      const result = await createProgramFunction(programData);
      
      console.log('Program created successfully:', result.data);
      
      // Clear cache to ensure fresh data on next fetch
      this.clearCache();
      
      return result.data;
    } catch (error) {
      console.error('Error creating program:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to create program. Please try again.';
      if (error.code === 'functions/invalid-argument') {
        errorMessage = error.message || 'Invalid program data provided.';
      } else if (error.code === 'functions/permission-denied') {
        errorMessage = 'You do not have permission to create programs.';
      } else if (error.code === 'functions/unauthenticated') {
        errorMessage = 'Please log in to create a program.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Create a new appointment using Cloud Function
  async createAppointment(appointmentData) {
    try {
      console.log('Creating appointment via Cloud Function...', appointmentData);
      
      // Get the Cloud Function reference
      const createAppointmentFunction = httpsCallable(functions, 'createAppointment');
      
      // Call the Cloud Function
      const result = await createAppointmentFunction(appointmentData);
      
      console.log('Appointment created successfully:', result.data);
      
      return result.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to book appointment. Please try again.';
      if (error.code === 'functions/invalid-argument') {
        errorMessage = error.message || 'Invalid appointment data provided.';
      } else if (error.code === 'functions/permission-denied') {
        errorMessage = 'You do not have permission to book appointments.';
      } else if (error.code === 'functions/unauthenticated') {
        errorMessage = 'Please log in to book an appointment.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Get user appointments using Cloud Function
  async getUserAppointments(userEmail) {
    try {
      console.log('Getting user appointments via Cloud Function...', userEmail);
      
      // Get the Cloud Function reference
      const getUserAppointmentsFunction = httpsCallable(functions, 'getUserAppointments');
      
      // Call the Cloud Function
      const result = await getUserAppointmentsFunction({ user_email: userEmail });
      
      console.log('User appointments retrieved successfully:', result.data);
      
      return result.data;
    } catch (error) {
      console.error('Error getting user appointments:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to load appointments. Please try again.';
      if (error.code === 'functions/invalid-argument') {
        errorMessage = error.message || 'Invalid request data.';
      } else if (error.code === 'functions/permission-denied') {
        errorMessage = 'You do not have permission to view appointments.';
      } else if (error.code === 'functions/unauthenticated') {
        errorMessage = 'Please log in to view your appointments.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Update an existing appointment using Cloud Function
  async updateAppointment(appointmentId, timeSlots, userEmail) {
    try {
      console.log('Updating appointment via Cloud Function...', { appointmentId, timeSlots, userEmail });
      
      // Get the Cloud Function reference
      const updateAppointmentFunction = httpsCallable(functions, 'updateAppointment');
      
      // Call the Cloud Function
      const result = await updateAppointmentFunction({
        appointment_id: appointmentId,
        time_slot: timeSlots,
        user_email: userEmail
      });
      
      console.log('Appointment updated successfully:', result.data);
      
      return result.data;
    } catch (error) {
      console.error('Error updating appointment:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to update appointment. Please try again.';
      if (error.code === 'functions/invalid-argument') {
        errorMessage = error.message || 'Invalid appointment data provided.';
      } else if (error.code === 'functions/permission-denied') {
        errorMessage = 'You do not have permission to update this appointment.';
      } else if (error.code === 'functions/unauthenticated') {
        errorMessage = 'Please log in to update appointments.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Cancel appointment
  async cancelAppointment(appointmentId, userEmail) {
    try {
      console.log('Canceling appointment via Cloud Function...', appointmentId, userEmail);
      
      // Get the Cloud Function reference
      const cancelAppointmentFunction = httpsCallable(functions, 'cancelAppointment');
      
      // Call the Cloud Function
      const result = await cancelAppointmentFunction({
        appointmentId: appointmentId,
        userEmail: userEmail
      });
      
      console.log('Appointment cancelled successfully:', result.data);
      
      return result.data;
    } catch (error) {
      console.error('Error canceling appointment:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to cancel appointment. Please try again.';
      if (error.code === 'functions/invalid-argument') {
        errorMessage = error.message || 'Invalid appointment data provided.';
      } else if (error.code === 'functions/permission-denied') {
        errorMessage = 'You do not have permission to cancel this appointment.';
      } else if (error.code === 'functions/unauthenticated') {
        errorMessage = 'Please log in to cancel appointments.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Update program
  async updateProgram(programId, programData) {
    try {
      console.log('Updating program via Cloud Function...', programId);
      
      // Get the Cloud Function reference
      const updateProgramFunction = httpsCallable(functions, 'updateProgram');
      
      // Call the Cloud Function
      const result = await updateProgramFunction({
        programId: programId,
        programData: programData
      });
      
      console.log('Program updated successfully:', result.data);
      
      // Clear cached programs to force refresh
      this.programsCache = null;
      this.programsCacheTime = 0;
      
      return result.data;
    } catch (error) {
      console.error('Error updating program:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to update program. Please try again.';
      if (error.code === 'functions/invalid-argument') {
        errorMessage = error.message || 'Invalid program data provided.';
      } else if (error.code === 'functions/permission-denied') {
        errorMessage = 'You do not have permission to update this program.';
      } else if (error.code === 'functions/unauthenticated') {
        errorMessage = 'Please log in to update programs.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Cancel program
  async cancelProgram(programId, userEmail) {
    try {
      console.log('Canceling program via Cloud Function...', programId, userEmail);
      
      // Get the Cloud Function reference
      const cancelProgramFunction = httpsCallable(functions, 'cancelProgram');
      
      // Call the Cloud Function
      const result = await cancelProgramFunction({
        programId: programId,
        userEmail: userEmail
      });
      
      console.log('Program cancelled successfully:', result.data);
      
      // Clear cached programs to force refresh
      this.programsCache = null;
      this.programsCacheTime = 0;
      
      return result.data;
    } catch (error) {
      console.error('Error canceling program:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to cancel program. Please try again.';
      if (error.code === 'functions/invalid-argument') {
        errorMessage = error.message || 'Invalid program data provided.';
      } else if (error.code === 'functions/permission-denied') {
        errorMessage = 'You do not have permission to cancel this program.';
      } else if (error.code === 'functions/unauthenticated') {
        errorMessage = 'Please log in to cancel programs.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Get user notifications
  async getUserNotifications(userEmail, page = 1, limit = 20) {
    try {
      console.log('Getting user notifications via Cloud Function...', userEmail, page, limit);
      
      // Get the Cloud Function reference
      const getUserNotificationsFunction = httpsCallable(functions, 'getUserNotifications');
      
      // Call the Cloud Function
      const result = await getUserNotificationsFunction({
        userEmail: userEmail,
        page: page,
        limit: limit
      });
      
      console.log('User notifications retrieved successfully:', result.data);
      
      return result.data;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to get notifications. Please try again.';
      if (error.code === 'functions/invalid-argument') {
        errorMessage = error.message || 'Invalid request data.';
      } else if (error.code === 'functions/unauthenticated') {
        errorMessage = 'Please log in to view notifications.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId, userEmail) {
    try {
      console.log('Marking notification as read via Cloud Function...', notificationId, userEmail);
      
      // Get the Cloud Function reference
      const markNotificationAsReadFunction = httpsCallable(functions, 'markNotificationAsRead');
      
      // Call the Cloud Function
      const result = await markNotificationAsReadFunction({
        notificationId: notificationId,
        userEmail: userEmail
      });
      
      console.log('Notification marked as read successfully:', result.data);
      
      return result.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to mark notification as read. Please try again.';
      if (error.code === 'functions/invalid-argument') {
        errorMessage = error.message || 'Invalid notification data.';
      } else if (error.code === 'functions/permission-denied') {
        errorMessage = 'You do not have permission to mark this notification as read.';
      } else if (error.code === 'functions/unauthenticated') {
        errorMessage = 'Please log in to manage notifications.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(userEmail) {
    try {
      console.log('Marking all notifications as read via Cloud Function...', userEmail);
      
      // Get the Cloud Function reference
      const markAllNotificationsAsReadFunction = httpsCallable(functions, 'markAllNotificationsAsRead');
      
      // Call the Cloud Function
      const result = await markAllNotificationsAsReadFunction({
        userEmail: userEmail
      });
      
      console.log('All notifications marked as read successfully:', result.data);
      
      return result.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to mark all notifications as read. Please try again.';
      if (error.code === 'functions/invalid-argument') {
        errorMessage = error.message || 'Invalid request data.';
      } else if (error.code === 'functions/unauthenticated') {
        errorMessage = 'Please log in to manage notifications.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Delete notification
  async deleteNotification(notificationId, userEmail) {
    try {
      console.log('Deleting notification via Cloud Function...', notificationId, userEmail);
      
      // Get the Cloud Function reference
      const deleteNotificationFunction = httpsCallable(functions, 'deleteNotification');
      
      // Call the Cloud Function
      const result = await deleteNotificationFunction({
        notificationId: notificationId,
        userEmail: userEmail
      });
      
      console.log('Notification deleted successfully:', result.data);
      
      return result.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to delete notification. Please try again.';
      if (error.code === 'functions/invalid-argument') {
        errorMessage = error.message || 'Invalid notification data.';
      } else if (error.code === 'functions/permission-denied') {
        errorMessage = 'You do not have permission to delete this notification.';
      } else if (error.code === 'functions/unauthenticated') {
        errorMessage = 'Please log in to manage notifications.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Upload image to S3
  async uploadImageToS3(file, programId = null) {
    try {
      console.log('Uploading image to S3...', file.name, programId);
      
      // Step 1: Get presigned URL from cloud function
      const generateUploadUrlFunction = httpsCallable(functions, 'generateImageUploadUrl');
      const urlResult = await generateUploadUrlFunction({
        fileName: file.name,
        fileType: file.type,
        programId: programId
      });
      
      if (!urlResult.data.success) {
        throw new Error('Failed to generate upload URL');
      }
      
      const { uploadUrl, publicUrl } = urlResult.data;
      console.log('Got presigned URL, uploading to S3...');
      
      // Step 2: Upload file directly to S3 using presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`S3 upload failed with status ${uploadResponse.status}`);
      }
      
      console.log('Image uploaded successfully to S3:', publicUrl);
      
      return {
        success: true,
        url: publicUrl,
        key: urlResult.data.key,
        fileName: file.name
      };
      
    } catch (error) {
      console.error('Error uploading image to S3:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to upload image. Please try again.';
      if (error.code === 'functions/invalid-argument') {
        errorMessage = error.message || 'Invalid file data.';
      } else if (error.code === 'functions/unauthenticated') {
        errorMessage = 'Please log in to upload images.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Get featured programs (for home page)
  async getFeaturedPrograms(limit = 6) {
    try {
      const programs = await this.getPrograms();
      
      // Score & pick up to specified limit for "Featured"
      const withScore = programs.map(p => {
        let score = 0;
        if (p.inclusivityTags?.includes('beginner-friendly')) score += 2;
        if (p.cost === 0) score += 2;
        if (p.cost > 0 && p.cost <= 5) score += 1;
        return { ...p, _score: score };
      });
      
      withScore.sort((a, b) => b._score - a._score || a.cost - b.cost);
      return withScore.slice(0, limit);
    } catch (error) {
      console.error('Error getting featured programs:', error);
      return [];
    }
  }
}

// Create singleton instance
export const dataService = new DataService();
export default dataService;
