// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import authService from '../services/AuthService.js';

const routes = [
  { path: '/', name: 'home', component: () => import('../components/pages/HomePage.vue') },
  { path: '/find', name: 'find', component: () => import('../components/pages/FindSportsPage.vue') },
  { path: '/program/:id', name: 'program', props: true, component: () => import('../components/pages/ProgramDetailsPage.vue') },
  { path: '/support', name: 'support', component: () => import('../components/pages/SupportPage.vue') },
  
  // Authentication routes
  { path: '/login', name: 'login', component: () => import('../components/pages/LoginPage.vue') },
  { path: '/register', name: 'register', component: () => import('../components/pages/RegisterPage.vue') },
  
  // Account routes (protected)
  { 
    path: '/account/member', 
    name: 'member-account', 
    component: () => import('../components/pages/MemberAccountPage.vue'),
    meta: { requiresAuth: true, requiresRole: 'member' }
  },
  { 
    path: '/account/organizer', 
    name: 'organizer-account', 
    component: () => import('../components/pages/OrganizerAccountPage.vue'),
    meta: { requiresAuth: true, requiresRole: 'organizer' }
  },
  
  // Member-specific routes
  { 
    path: '/member-appointment/:programId?', 
    name: 'member-appointment', 
    component: () => import('../components/pages/MemberAppointmentPage.vue'),
    props: true,
    meta: { requiresAuth: true, requiresRole: 'member' }
  },

  // Organizer-specific routes
  { 
    path: '/launch-program', 
    name: 'launch-program', 
    component: () => import('../components/pages/LaunchProgramPage.vue'),
    meta: { requiresAuth: true, requiresRole: 'organizer' }
  },
  { 
    path: '/edit-program/:id', 
    name: 'edit-program', 
    component: () => import('../components/pages/EditProgramPage.vue'),
    props: true,
    meta: { requiresAuth: true, requiresRole: 'organizer' }
  },
  
  // Notification routes (accessible by both roles)
  { 
    path: '/notifications', 
    name: 'notifications', 
    component: () => import('../components/pages/NotificationPage.vue'),
    meta: { requiresAuth: true }
  },
  
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({ history: createWebHistory(), routes });

// Route guards
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresRole = to.meta.requiresRole;
  
  // Use synchronous method for route guard (faster)
  const currentUserSync = authService.getCurrentUserSync();
  
  if (requiresAuth && !currentUserSync.user) {
    // Redirect to login if authentication is required
    next({ name: 'login' });
    return;
  }
  
  if (requiresRole && currentUserSync.role !== requiresRole) {
    // If we don't have role data yet, get it from Firestore
    if (!currentUserSync.role && currentUserSync.user) {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser.role !== requiresRole) {
          next({ name: 'home' });
          return;
        }
      } catch (error) {
        console.error('Route guard error:', error);
        next({ name: 'home' });
        return;
      }
    } else {
      // Redirect to home if user doesn't have required role
      next({ name: 'home' });
      return;
    }
  }
  
  next();
});

export default router;