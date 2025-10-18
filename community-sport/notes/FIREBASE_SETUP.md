# Firebase Authentication Setup Guide

This guide will help you configure Firebase Authentication for the Community Sport application.

## Prerequisites

1. A Firebase project (create one at [Firebase Console](https://console.firebase.google.com))
2. Node.js and npm installed
3. Firebase CLI installed (`npm install -g firebase-tools`)

## Step 1: Firebase Project Configuration

### 1.1 Enable Authentication
1. Go to Firebase Console → Your Project → Authentication
2. Click "Get started" 
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Save changes

### 1.2 Enable Firestore (for future features)
1. Go to Firebase Console → Your Project → Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" (we'll secure it later)
4. Select a location close to your users

### 1.3 Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Web app" icon (</>)
4. Register your app with name "Community Sport"
5. Copy the configuration object

### 1.4 Update Firebase Configuration
Open `src/firebase.js` and fill in your configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## Step 2: Deploy Cloud Functions

### 2.1 Initialize Firebase Functions
```bash
# In your project root
firebase login
firebase init functions

# Choose:
# - Use an existing project (select your project)
# - JavaScript
# - Yes to ESLint
# - Yes to install dependencies
```

### 2.2 Replace Functions Code
The functions code is already provided in `functions/index.js`. If you initialized functions and it created a new index.js, replace it with the provided one.

### 2.3 Deploy Functions
```bash
firebase deploy --only functions
```

### 2.4 Verify Deployment
After deployment, you should see:
- `setUserRole` function in Firebase Console → Functions
- `getUserRole` function in Firebase Console → Functions

## Step 3: Test the Application

### 3.1 Start Development Server
```bash
npm run dev
```

### 3.2 Test Registration
1. Navigate to `/register`
2. Choose "Member" or "Organizer"
3. Fill in email and password
4. Submit form
5. Check Firebase Console → Authentication → Users to see the new user

### 3.3 Test Login
1. Navigate to `/login`
2. Choose the same role you registered with
3. Enter credentials
4. Should redirect to appropriate account page

## Step 4: Security Rules (Future)

For production, you'll want to set up Firestore security rules. Here's a basic example:

```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Role-based access examples
    match /programs/{programId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.role == 'organizer';
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **"Firebase project not found"**
   - Make sure you've run `firebase login`
   - Check that you're in the correct directory
   - Verify project ID in `.firebaserc`

2. **"Function deployment failed"**
   - Check that you have the correct Node.js version (18+)
   - Ensure all dependencies are installed in the functions folder
   - Check Firebase Console → Functions for error logs

3. **"Custom claims not working"**
   - Make sure cloud functions are deployed
   - Check browser network tab for function call errors
   - Verify user is authenticated before calling setUserRole

4. **"Role not persisting after login"**
   - Custom claims take effect on next token refresh
   - Try logging out and logging back in
   - Check that getIdToken(true) is called to force refresh

### Debug Tools

1. **Firebase Console → Authentication → Users**: Check user accounts and custom claims
2. **Firebase Console → Functions → Logs**: Check function execution logs
3. **Browser DevTools → Network**: Monitor API calls to Firebase
4. **Browser DevTools → Application → Local Storage**: Check Firebase auth tokens

## Next Steps

Once authentication is working:
1. Implement protected routes for specific features
2. Add role-based UI components
3. Create user profile management
4. Implement the rating system
5. Add security measures for XSS protection

## Support

If you encounter issues:
1. Check Firebase Console for error messages
2. Review browser console for JavaScript errors
3. Consult Firebase documentation: https://firebase.google.com/docs/auth
4. Check the community forums: https://firebase.google.com/community
