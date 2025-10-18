/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Load environment variables from .env.local for local development
require('dotenv').config({ path: '.env.local' });

const {setGlobalOptions} = require("firebase-functions");
const {onCall} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const {S3Client, PutObjectCommand} = require("@aws-sdk/client-s3");
const {getSignedUrl} = require("@aws-sdk/s3-request-presigner");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Initialize S3 Client
// Note: AWS credentials are set via Firebase Functions config
const s3Client = new S3Client({
  region: "ap-southeast-2",
  credentials: {
    accessKeyId: "AKIA4ZPZU223S7RIND6Q",
    secretAccessKey: "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"
  }
});

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

/**
 * Cloud Function to get user appointments from Firestore
 * Retrieves all appointments for a specific user email
 */
exports.getUserAppointments = onCall(async (request) => {
  try {
    // Log the incoming request for debugging
    logger.info("Getting user appointments", { data: request.data });

    // Validate required fields
    const { user_email } = request.data;
    if (!user_email) {
      throw new Error("User email is required");
    }

    // Get Firestore instance
    const db = admin.firestore();

    // Query appointments for the user
    const appointmentsQuery = db.collection("appointments")
      .where("user_email", "==", user_email);

    const querySnapshot = await appointmentsQuery.get();
    const appointments = [];

    logger.info("Found appointments", { count: querySnapshot.docs.length });

    for (const doc of querySnapshot.docs) {
      const appointmentData = { id: doc.id, ...doc.data() };
      
      // Skip cancelled appointments
      if (appointmentData.status === "cancelled") {
        logger.info("Skipping cancelled appointment", { appointmentId: doc.id });
        continue;
      }
      
      logger.info("Processing appointment", { 
        appointmentId: doc.id, 
        programId: appointmentData.program_id 
      });
      
      // Get program details for each appointment
      try {
        if (appointmentData.program_id) {
          logger.info("Fetching program details", { programId: appointmentData.program_id });
          const programDoc = await db.collection("programs").doc(appointmentData.program_id).get();
          
          if (programDoc.exists) {
            const programData = programDoc.data();
            appointmentData.program = { id: programDoc.id, ...programData };
            logger.info("Successfully added program details", { 
              programId: appointmentData.program_id,
              programTitle: programData.title,
              programSport: programData.sport
            });
          } else {
            logger.warn("Program document not found", { programId: appointmentData.program_id });
            // Add placeholder program data
            appointmentData.program = {
              id: appointmentData.program_id,
              title: `Program ${appointmentData.program_id}`,
              sport: 'Unknown Sport'
            };
          }
        } else {
          logger.warn("Appointment missing program_id", { appointmentId: doc.id });
          appointmentData.program = {
            id: 'unknown',
            title: 'Unknown Program',
            sport: 'Unknown Sport'
          };
        }
      } catch (programError) {
        logger.error("Error fetching program details", { 
          programId: appointmentData.program_id, 
          error: programError.message,
          stack: programError.stack 
        });
        // Add placeholder program data on error
        appointmentData.program = {
          id: appointmentData.program_id || 'error',
          title: 'Error Loading Program',
          sport: 'Unknown Sport'
        };
      }
      
      appointments.push(appointmentData);
    }

    // Sort appointments by creation date (client-side since we removed orderBy)
    appointments.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(0);
      const bTime = b.createdAt?.toDate?.() || new Date(0);
      return bTime - aTime;
    });

    logger.info("User appointments retrieved successfully", { count: appointments.length });

    return {
      success: true,
      appointments: appointments,
      count: appointments.length
    };

  } catch (error) {
    logger.error("Error getting user appointments", { 
      error: error.message, 
      stack: error.stack,
      code: error.code 
    });
    throw new Error(`Failed to get appointments: ${error.message}`);
  }
});

/**
 * Cloud Function to update an existing appointment in Firestore
 * Updates appointment time slots and other details
 */
exports.updateAppointment = onCall(async (request) => {
  try {
    // Log the incoming request for debugging
    logger.info("Updating appointment", { data: request.data });

    // Validate required fields
    const { appointment_id, time_slot, user_email } = request.data;
    if (!appointment_id || !time_slot || !user_email) {
      throw new Error("Appointment ID, time slots, and user email are required");
    }

    // Validate time_slot array
    if (!Array.isArray(time_slot) || time_slot.length === 0) {
      throw new Error("At least one time slot must be selected");
    }

    // Get Firestore instance
    const db = admin.firestore();

    // Get the existing appointment to verify ownership
    const appointmentRef = db.collection("appointments").doc(appointment_id);
    const appointmentDoc = await appointmentRef.get();

    if (!appointmentDoc.exists()) {
      throw new Error("Appointment not found");
    }

    const existingAppointment = appointmentDoc.data();
    
    // Verify the user owns this appointment
    if (existingAppointment.user_email !== user_email) {
      throw new Error("You can only update your own appointments");
    }

    // Update the appointment
    const updateData = {
      time_slot: time_slot,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await appointmentRef.update(updateData);

    logger.info("Appointment updated successfully", { appointmentId: appointment_id });

    return {
      success: true,
      appointmentId: appointment_id,
      message: "Appointment updated successfully"
    };

  } catch (error) {
    logger.error("Error updating appointment", { error: error.message });
    throw new Error(`Failed to update appointment: ${error.message}`);
  }
});

/**
 * Cloud Function to create a new appointment in Firestore
 * Receives appointment data from frontend and stores it in the appointments collection
 */
exports.createAppointment = onCall(async (request) => {
  try {
    // Log the incoming request for debugging
    logger.info("Creating new appointment", { data: request.data });

    // Validate required fields
    const appointmentData = request.data;
    if (!appointmentData) {
      throw new Error("Appointment data is required");
    }

    // Validate required fields
    const requiredFields = ["program_id", "user_email", "time_slot"];
    for (const field of requiredFields) {
      if (!appointmentData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate time_slot array
    if (!Array.isArray(appointmentData.time_slot) || appointmentData.time_slot.length === 0) {
      throw new Error("At least one time slot must be selected");
    }

    // Get Firestore instance
    const db = admin.firestore();

    // Create a new document reference with auto-generated ID
    const appointmentRef = db.collection("appointments").doc();
    const appointmentId = appointmentRef.id;

    // Prepare the appointment data with auto-generated ID explicitly included
    const appointmentToSave = {
      id: appointmentId, // Add standard id field for consistency
      appointment_id: appointmentId, // Keep the original field name as specified
      program_id: appointmentData.program_id,
      user_email: appointmentData.user_email,
      time_slot: appointmentData.time_slot,
      status: "confirmed",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Save the appointment to Firestore
    await appointmentRef.set(appointmentToSave);

    logger.info("Appointment created successfully", { appointmentId: appointmentId });

    // Return success response with the appointment ID
    return {
      success: true,
      appointmentId: appointmentId,
      message: "Appointment booked successfully"
    };

  } catch (error) {
    logger.error("Error creating appointment", { error: error.message });
    
    // Return error response
    throw new Error(`Failed to create appointment: ${error.message}`);
  }
});

/**
 * Cloud Function to create a new program in Firestore
 * Receives program data from frontend and stores it in the programs collection
 */
exports.createProgram = onCall(async (request) => {
  try {
    // Log the incoming request for debugging
    logger.info("Creating new program", { data: request.data });

    // Validate required fields
    const programData = request.data;
    if (!programData) {
      throw new Error("Program data is required");
    }

    // Validate required fields
    const requiredFields = ["title", "sport", "organizer_email", "description", "ageGroups", "cost", "costUnit"];
    for (const field of requiredFields) {
      if (!programData[field] && programData[field] !== 0) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Get Firestore instance
    const db = admin.firestore();

    // Create a new document reference with auto-generated ID
    const programRef = db.collection("programs").doc();
    const programId = programRef.id;

    // Prepare the program data with auto-generated ID explicitly included
    const programToSave = {
      id: programId, // Explicitly include the ID in the document data
      title: programData.title,
      sport: programData.sport,
      organizer_email: programData.organizer_email,
      description: programData.description,
      ageGroups: programData.ageGroups || [],
      cost: Number(programData.cost),
      costUnit: programData.costUnit,
      accessibility: programData.accessibility || [],
      inclusivityTags: programData.inclusivityTags || [],
      schedule: programData.schedule || [],
      venue: programData.venue || {},
      equipment: programData.equipment || { provided: false, required: [] },
      contact: programData.contact || {},
      images: programData.images || [],
      maxParticipants: Number(programData.maxParticipants),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "active" // Default status
    };

    // Save the program to Firestore
    await programRef.set(programToSave);

    logger.info("Program created successfully", { programId: programId });

    // Return success response with the program ID
    return {
      success: true,
      programId: programId,
      message: "Program created successfully"
    };

  } catch (error) {
    logger.error("Error creating program", { error: error.message });
    
    // Return error response
    throw new Error(`Failed to create program: ${error.message}`);
  }
});

// Cancel Appointment Function
exports.cancelAppointment = onCall(async (request) => {
  try {
    const { appointmentId, userEmail } = request.data;

    // Validate input
    if (!appointmentId || !userEmail) {
      throw new Error("Missing required fields: appointmentId and userEmail are required");
    }

    logger.info("Canceling appointment", { appointmentId, userEmail });

    // Get Firestore instance
    const db = admin.firestore();

    // Get the appointment document
    const appointmentRef = db.collection("appointments").doc(appointmentId);
    const appointmentDoc = await appointmentRef.get();

    if (!appointmentDoc.exists) {
      throw new Error("Appointment not found");
    }

    const appointmentData = appointmentDoc.data();

    // Verify ownership - user can only cancel their own appointments
    if (appointmentData.user_email !== userEmail) {
      throw new Error("You can only cancel your own appointments");
    }

    // Check if appointment is already cancelled
    if (appointmentData.status === "cancelled") {
      throw new Error("Appointment is already cancelled");
    }

    // Get program details for notification
    const programRef = db.collection("programs").doc(appointmentData.program_id);
    const programDoc = await programRef.get();
    
    let programTitle = "Unknown Program";
    if (programDoc.exists) {
      const programData = programDoc.data();
      programTitle = programData.title || "Unknown Program";
    }

    // Create a batch for atomic operations
    const batch = db.batch();

    // Update appointment status to cancelled
    batch.update(appointmentRef, {
      status: "cancelled",
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create notification for the user
    const notificationRef = db.collection("notifications").doc();
    const notificationData = {
      notification_id: notificationRef.id,
      email: userEmail,
      notification_title: `Appointment cancelled: ${programTitle}`,
      notification_text: `You have successfully cancelled your appointment for: ${programTitle}. If you change your mind, you can book again from the program details page.`,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false
    };
    
    batch.set(notificationRef, notificationData);

    // Execute all operations atomically
    await batch.commit();

    logger.info("Appointment cancelled successfully", { 
      appointmentId, 
      userEmail,
      programId: appointmentData.program_id,
      programTitle: programTitle
    });

    return {
      success: true,
      message: "Appointment cancelled successfully",
      appointmentId: appointmentId,
      notificationSent: true
    };

  } catch (error) {
    logger.error("Error cancelling appointment", { 
      error: error.message,
      appointmentId: request.data?.appointmentId,
      userEmail: request.data?.userEmail
    });
    
    throw new Error(`Failed to cancel appointment: ${error.message}`);
  }
});

// Update Program Function
exports.updateProgram = onCall(async (request) => {
  try {
    const { programId, programData } = request.data;

    // Validate input
    if (!programId || !programData) {
      throw new Error("Missing required fields: programId and programData are required");
    }

    logger.info("Updating program", { programId });

    // Get Firestore instance
    const db = admin.firestore();

    // Get the program document
    const programRef = db.collection("programs").doc(programId);
    const programDoc = await programRef.get();

    if (!programDoc.exists) {
      throw new Error("Program not found");
    }

    const existingProgram = programDoc.data();

    // Verify ownership - user can only update their own programs
    if (existingProgram.organizer_email !== programData.organizer_email) {
      throw new Error("You can only update your own programs");
    }

    // Prepare updated program data
    const updatedProgram = {
      id: programId,
      title: programData.title,
      sport: programData.sport,
      organizer_email: programData.organizer_email,
      description: programData.description,
      ageGroups: programData.ageGroups || [],
      cost: Number(programData.cost),
      costUnit: programData.costUnit,
      accessibility: programData.accessibility || [],
      inclusivityTags: programData.inclusivityTags || [],
      schedule: programData.schedule || [],
      venue: programData.venue || {},
      equipment: programData.equipment || { provided: false, required: [] },
      contact: programData.contact || {},
      images: programData.images || [],
      maxParticipants: Number(programData.maxParticipants),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      // Preserve original creation data
      createdAt: existingProgram.createdAt,
      status: existingProgram.status || "active"
    };

    // Update the program in Firestore
    await programRef.set(updatedProgram);

    logger.info("Program updated successfully", { programId });

    return {
      success: true,
      programId: programId,
      message: "Program updated successfully"
    };

  } catch (error) {
    logger.error("Error updating program", { 
      error: error.message,
      programId: request.data?.programId
    });
    
    throw new Error(`Failed to update program: ${error.message}`);
  }
});

// Cancel Program Function
exports.cancelProgram = onCall(async (request) => {
  try {
    const { programId, userEmail } = request.data;

    // Validate input
    if (!programId || !userEmail) {
      throw new Error("Missing required fields: programId and userEmail are required");
    }

    logger.info("Canceling program", { programId, userEmail });

    // Get Firestore instance
    const db = admin.firestore();

    // Get the program document
    const programRef = db.collection("programs").doc(programId);
    const programDoc = await programRef.get();

    if (!programDoc.exists) {
      throw new Error("Program not found");
    }

    const programData = programDoc.data();

    // Verify ownership - user can only cancel their own programs
    if (programData.organizer_email !== userEmail) {
      throw new Error("You can only cancel your own programs");
    }

    // Check if program is already cancelled
    if (programData.status === "cancelled") {
      throw new Error("Program is already cancelled");
    }

    // Get all appointments for this program
    const appointmentsQuery = db.collection("appointments")
      .where("program_id", "==", programId);
    
    const appointmentsSnapshot = await appointmentsQuery.get();
    
    // Filter out already cancelled appointments client-side
    const activeAppointments = appointmentsSnapshot.docs.filter(doc => {
      const appointment = doc.data();
      return appointment.status !== "cancelled";
    });
    
    logger.info("Found appointments to notify", { 
      programId, 
      totalAppointments: appointmentsSnapshot.docs.length,
      activeAppointments: activeAppointments.length
    });

    // Create notifications for all participants
    const batch = db.batch();
    const participantEmails = new Set();

    activeAppointments.forEach(doc => {
      const appointment = doc.data();
      participantEmails.add(appointment.user_email);
      
      // Cancel the appointment
      batch.update(doc.ref, {
        status: "cancelled",
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    // Create notifications for each unique participant
    for (const email of participantEmails) {
      const notificationRef = db.collection("notifications").doc();
      const notificationData = {
        notification_id: notificationRef.id,
        email: email,
        notification_title: `Program has been canceled: ${programData.title}`,
        notification_text: `Your booked program has been canceled: ${programData.title}. Appointments of this program has been removed.`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false
      };
      
      batch.set(notificationRef, notificationData);
    }

    // Update program status to cancelled
    batch.update(programRef, {
      status: "cancelled",
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Execute all updates in a batch
    await batch.commit();

    logger.info("Program cancelled successfully", { 
      programId, 
      userEmail,
      participantCount: participantEmails.size,
      appointmentCount: activeAppointments.length
    });

    return {
      success: true,
      programId: programId,
      message: "Program cancelled successfully",
      participantsNotified: participantEmails.size,
      appointmentsCancelled: activeAppointments.length
    };

  } catch (error) {
    logger.error("Error cancelling program", { 
      error: error.message,
      programId: request.data?.programId,
      userEmail: request.data?.userEmail
    });
    
    throw new Error(`Failed to cancel program: ${error.message}`);
  }
});

// Get User Notifications Function
exports.getUserNotifications = onCall(async (request) => {
  try {
    const { userEmail, page = 1, limit = 20 } = request.data;

    // Validate input
    if (!userEmail) {
      throw new Error("Missing required field: userEmail is required");
    }

    logger.info("Getting user notifications", { userEmail, page, limit });

    // Get Firestore instance
    const db = admin.firestore();

    // Query notifications for the user (without orderBy to avoid index requirement)
    const notificationsQuery = db.collection("notifications")
      .where("email", "==", userEmail);

    const querySnapshot = await notificationsQuery.get();
    
    // Sort notifications by createdAt client-side (newest first)
    const allNotifications = [];
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      allNotifications.push({
        notification_id: doc.id,
        ...data,
        // Convert Firestore timestamp to sortable format
        createdAtTimestamp: data.createdAt ? data.createdAt.toMillis() : 0
      });
    });
    
    // Sort by createdAt descending (newest first)
    allNotifications.sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp);
    
    // Apply pagination client-side
    const offset = (page - 1) * limit;
    const notifications = allNotifications.slice(offset, offset + limit);
    const hasMore = allNotifications.length > offset + limit;

    logger.info("User notifications retrieved successfully", { 
      userEmail, 
      count: notifications.length,
      hasMore 
    });

    return {
      success: true,
      notifications: notifications,
      hasMore: hasMore,
      page: page,
      total: allNotifications.length
    };

  } catch (error) {
    logger.error("Error getting user notifications", { 
      error: error.message,
      userEmail: request.data?.userEmail
    });
    
    throw new Error(`Failed to get notifications: ${error.message}`);
  }
});

// Mark Notification as Read Function
exports.markNotificationAsRead = onCall(async (request) => {
  try {
    const { notificationId, userEmail } = request.data;

    // Validate input
    if (!notificationId || !userEmail) {
      throw new Error("Missing required fields: notificationId and userEmail are required");
    }

    logger.info("Marking notification as read", { notificationId, userEmail });

    // Get Firestore instance
    const db = admin.firestore();

    // Get the notification document
    const notificationRef = db.collection("notifications").doc(notificationId);
    const notificationDoc = await notificationRef.get();

    if (!notificationDoc.exists) {
      throw new Error("Notification not found");
    }

    const notificationData = notificationDoc.data();

    // Verify ownership - user can only mark their own notifications as read
    if (notificationData.email !== userEmail) {
      throw new Error("You can only mark your own notifications as read");
    }

    // Update notification as read
    await notificationRef.update({
      read: true,
      readAt: admin.firestore.FieldValue.serverTimestamp()
    });

    logger.info("Notification marked as read successfully", { notificationId, userEmail });

    return {
      success: true,
      notificationId: notificationId,
      message: "Notification marked as read"
    };

  } catch (error) {
    logger.error("Error marking notification as read", { 
      error: error.message,
      notificationId: request.data?.notificationId,
      userEmail: request.data?.userEmail
    });
    
    throw new Error(`Failed to mark notification as read: ${error.message}`);
  }
});

// Mark All Notifications as Read Function
exports.markAllNotificationsAsRead = onCall(async (request) => {
  try {
    const { userEmail } = request.data;

    // Validate input
    if (!userEmail) {
      throw new Error("Missing required field: userEmail is required");
    }

    logger.info("Marking all notifications as read", { userEmail });

    // Get Firestore instance
    const db = admin.firestore();

    // Get all unread notifications for the user
    const notificationsQuery = db.collection("notifications")
      .where("email", "==", userEmail)
      .where("read", "==", false);

    const querySnapshot = await notificationsQuery.get();
    
    if (querySnapshot.empty) {
      return {
        success: true,
        message: "No unread notifications found",
        updatedCount: 0
      };
    }

    // Update all unread notifications in a batch
    const batch = db.batch();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    querySnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        read: true,
        readAt: timestamp
      });
    });

    await batch.commit();

    logger.info("All notifications marked as read successfully", { 
      userEmail, 
      updatedCount: querySnapshot.docs.length 
    });

    return {
      success: true,
      message: "All notifications marked as read",
      updatedCount: querySnapshot.docs.length
    };

  } catch (error) {
    logger.error("Error marking all notifications as read", { 
      error: error.message,
      userEmail: request.data?.userEmail
    });
    
    throw new Error(`Failed to mark all notifications as read: ${error.message}`);
  }
});

// Delete Notification Function
exports.deleteNotification = onCall(async (request) => {
  try {
    const { notificationId, userEmail } = request.data;

    // Validate input
    if (!notificationId || !userEmail) {
      throw new Error("Missing required fields: notificationId and userEmail are required");
    }

    logger.info("Deleting notification", { notificationId, userEmail });

    // Get Firestore instance
    const db = admin.firestore();

    // Get the notification document
    const notificationRef = db.collection("notifications").doc(notificationId);
    const notificationDoc = await notificationRef.get();

    if (!notificationDoc.exists) {
      throw new Error("Notification not found");
    }

    const notificationData = notificationDoc.data();

    // Verify ownership - user can only delete their own notifications
    if (notificationData.email !== userEmail) {
      throw new Error("You can only delete your own notifications");
    }

    // Delete the notification
    await notificationRef.delete();

    logger.info("Notification deleted successfully", { notificationId, userEmail });

    return {
      success: true,
      notificationId: notificationId,
      message: "Notification deleted successfully"
    };

  } catch (error) {
    logger.error("Error deleting notification", { 
      error: error.message,
      notificationId: request.data?.notificationId,
      userEmail: request.data?.userEmail
    });
    
    throw new Error(`Failed to delete notification: ${error.message}`);
  }
});

// Generate S3 Presigned URL for Image Upload
exports.generateImageUploadUrl = onCall(async (request) => {
  try {
    const { fileName, fileType, programId } = request.data;

    // Validate input
    if (!fileName || !fileType) {
      throw new Error("Missing required fields: fileName and fileType are required");
    }

    // Validate file type (only images)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(fileType.toLowerCase())) {
      throw new Error(`Invalid file type: ${fileType}. Only images are allowed (JPG, PNG, GIF, WEBP).`);
    }

    logger.info("Generating presigned URL for image upload", { fileName, fileType, programId });

    // Generate unique filename with timestamp to avoid collisions
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const folder = programId || 'temp';
    const key = `programs/${folder}/${timestamp}-${sanitizedFileName}`;
    
    const bucketName = "5032-a3-image-bucket";

    // Create S3 PutObject command
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: fileType,
      // Add metadata
      Metadata: {
        uploadedBy: request.auth?.uid || "anonymous",
        uploadedAt: new Date().toISOString(),
        programId: programId || "none"
      }
    });

    // Generate presigned URL (expires in 5 minutes)
    const presignedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 300 // 5 minutes
    });

    // Generate the public URL for accessing the image after upload
    const region = process.env.AWS_REGION || "ap-southeast-2";
    const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

    logger.info("Presigned URL generated successfully", { 
      fileName, 
      key, 
      programId 
    });

    return {
      success: true,
      uploadUrl: presignedUrl,
      publicUrl: publicUrl,
      key: key,
      message: "Presigned URL generated successfully"
    };

  } catch (error) {
    logger.error("Error generating presigned URL", { 
      error: error.message,
      fileName: request.data?.fileName
    });
    
    throw new Error(`Failed to generate upload URL: ${error.message}`);
  }
});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
