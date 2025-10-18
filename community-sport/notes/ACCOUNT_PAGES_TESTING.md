# Account Pages Testing Guide

## Overview

The account pages have been configured with shared components and role-specific functionality:

### ✅ **Completed Features**

1. **MyAccount Component** - Shared component displaying user information
2. **Member Account Page** - Dashboard with My Programs section
3. **Organizer Account Page** - Dashboard with Launch Programs functionality
4. **Launch Program Page** - Comprehensive form for creating sports programs

## Testing Steps

### 1. Test Member Account Page

1. **Login as Member**:
   - Navigate to `/login`
   - Select "Member" 
   - Enter credentials and login

2. **Verify Member Dashboard**:
   - Should redirect to `/account/member`
   - Check MyAccount component displays:
     - User avatar with initials
     - Email address
     - "member" role badge
     - Account statistics (join date, program count, activity level)
   - Check "My Programs" section shows placeholder content
   - Verify "Find Sports Programs" button links to `/find`

3. **Test Navigation**:
   - Account dropdown should show "My member Account"
   - Logout should work and redirect to home

### 2. Test Organizer Account Page

1. **Login as Organizer**:
   - Navigate to `/login`
   - Select "Organizer"
   - Enter credentials and login

2. **Verify Organizer Dashboard**:
   - Should redirect to `/account/organizer`
   - Check MyAccount component displays with "organizer" role badge
   - Verify "Launch Programs" button is prominent and styled with success color
   - Check "My Programs" section shows placeholder for created programs
   - Test quick action cards are present but disabled

3. **Test Launch Programs Button**:
   - Click "Launch Programs" button
   - Should navigate to `/launch-program`
   - Verify route protection (only organizers can access)

### 3. Test Launch Program Page

1. **Access Launch Program Page**:
   - Must be logged in as organizer
   - Navigate via organizer dashboard or directly to `/launch-program`

2. **Test Form Sections**:

   **Program Information**:
   - [ ] Title input (required, min 3 characters)
   - [ ] Sport dropdown (required, multiple options)
   - [ ] Age groups checkboxes (required, at least one)
   - [ ] Description textarea (required, 20-500 characters, shows counter)
   - [ ] Cost input (number, min 0, shows $ symbol)

   **Accessibility & Inclusivity**:
   - [ ] Accessibility features checkboxes (optional)
   - [ ] Inclusivity tags input (type + Enter to add, removable badges)

   **Schedule Section**:
   - [ ] Days checkboxes (required, at least one day)
   - [ ] Start time dropdowns (hour + minute, required)
   - [ ] End time dropdowns (hour + minute, required, must be after start)
   - [ ] Start date picker (required, cannot be in past)

3. **Test Form Validation**:
   - [ ] Submit empty form - should show validation errors
   - [ ] Fill required fields progressively - errors should clear
   - [ ] Test edge cases (end time before start time, past date)
   - [ ] Submit valid form - should show success message and redirect

4. **Test Form Features**:
   - [ ] Inclusivity tags: add/remove functionality
   - [ ] Character counter for description
   - [ ] Responsive layout (schedule section sticky on desktop)
   - [ ] Back button navigation to organizer dashboard

### 4. Test Route Protection

1. **Unauthenticated Access**:
   - Try accessing `/account/member` without login → should redirect to login
   - Try accessing `/account/organizer` without login → should redirect to login  
   - Try accessing `/launch-program` without login → should redirect to login

2. **Wrong Role Access**:
   - Login as member, try accessing `/account/organizer` → should redirect to home
   - Login as member, try accessing `/launch-program` → should redirect to home
   - Login as organizer, try accessing `/account/member` → should redirect to home

## Expected UI Elements

### MyAccount Component Features:
- ✅ User avatar with initials
- ✅ Display name (extracted from email)
- ✅ Email address
- ✅ Role badge (capitalized)
- ✅ Account statistics (join date, program count, activity level)
- ✅ Edit Profile button (shows placeholder alert)

### Member Account Specific:
- ✅ "My Programs" section with empty state
- ✅ Link to Find Sports page
- ✅ Future feature previews (favorites, reviews, notifications)

### Organizer Account Specific:
- ✅ Prominent "Launch Programs" button
- ✅ "My Programs" management section
- ✅ Future feature previews (participants, analytics, schedule)

### Launch Program Form Features:
- ✅ Comprehensive form with all required fields
- ✅ Real-time validation with error messages
- ✅ Dynamic inclusivity tags system
- ✅ Time validation (end after start)
- ✅ Date validation (not in past)
- ✅ Responsive layout with sticky sidebar
- ✅ Loading states and success/error messages

## Common Issues & Solutions

### MyAccount Component Issues:
- **Avatar not showing**: Check if user email is available
- **Role not displaying**: Verify authentication state and role assignment

### Form Validation Issues:
- **Validation not triggering**: Check if touched state is properly set on blur/input
- **Time validation errors**: Ensure start time is before end time
- **Date issues**: Verify minimum date is set to today

### Navigation Issues:
- **Route protection not working**: Check authentication state in router guards
- **Wrong redirects**: Verify role-based routing logic

## Next Steps

After testing these pages, you can proceed with:
1. Implementing the rating system (BR C.3)
2. Adding security measures (BR C.4)
3. Creating actual program storage/retrieval functionality
4. Implementing program management features for organizers
