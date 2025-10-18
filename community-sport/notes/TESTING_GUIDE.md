# Authentication Testing Guide

## What We Fixed

The CORS error occurred because we were trying to call Firebase Cloud Functions that weren't deployed yet. I've implemented a temporary solution using localStorage to store user roles locally, which allows you to test the authentication flow immediately.

## Current Implementation

- **Registration**: Creates Firebase user account and stores role in localStorage
- **Login**: Validates credentials and checks role from localStorage  
- **Navigation**: Shows appropriate Account dropdown based on auth state
- **Route Protection**: Protects account pages based on authentication and role

## Testing Steps

### 1. Test Registration

1. Navigate to `http://localhost:5173/register` (or whatever port your dev server is using)
2. Select "Member" or "Organizer" 
3. Enter email and password
4. Click "Create Account"
5. Should show success message and redirect to appropriate account page

### 2. Test Login

1. Navigate to `http://localhost:5173/login`
2. Select the same role you registered with
3. Enter the same credentials
4. Click "Sign In"
5. Should redirect to appropriate account page

### 3. Test Navigation

1. When logged out: Should see "Login" and "Register" buttons
2. When logged in: Should see "Account" dropdown with role badge
3. Account dropdown should have link to appropriate account page and logout option

### 4. Test Route Protection

1. Try accessing `/account/member` when not logged in → Should redirect to login
2. Try accessing `/account/organizer` when logged in as member → Should redirect to home
3. Account pages should only be accessible with correct authentication and role

## Current Limitations (Temporary)

1. **Roles stored in localStorage**: In production, roles should be stored as Firebase Custom Claims via Cloud Functions
2. **No role persistence across devices**: Roles are only stored locally
3. **No role validation on server**: Currently only client-side validation

## Future Improvements

1. **Deploy Cloud Functions**: Implement proper server-side role management
2. **Add Firestore**: Store additional user profile data
3. **Implement proper security rules**: Server-side validation and authorization

## Common Issues & Solutions

### Registration/Login Errors

- **"Email already in use"**: Use a different email or check Firebase Console → Authentication → Users
- **"Weak password"**: Use at least 6 characters
- **"Invalid email"**: Check email format

### Role Issues

- **"No role found"**: Clear browser localStorage and register again
- **"Wrong role access"**: Make sure you're logging in with the same role you registered with

### Firebase Console

Check Firebase Console → Authentication → Users to see registered users and verify they're being created properly.

## Testing Checklist

- [ ] Registration as Member works
- [ ] Registration as Organizer works  
- [ ] Login as Member works
- [ ] Login as Organizer works
- [ ] Navigation shows correct state when logged out
- [ ] Navigation shows correct state when logged in
- [ ] Account pages are protected
- [ ] Role-based access works correctly
- [ ] Logout works and clears state

## Next Steps

Once basic authentication is working, we can:
1. Implement the rating system (BR C.3)
2. Add security measures for XSS protection (BR C.4)
3. Deploy Cloud Functions for production-ready role management
