Here’s a clean, **Vue 3 + Firebase** approach that gives you two registration paths (Member vs Organizer) and two login paths, with **real** authorization enforced using **Firebase Custom Claims** + Firestore Rules.

------

# Overview

1. **Auth (client):** Email/Password with `createUserWithEmailAndPassword` and `signInWithEmailAndPassword`. ([Firebase](https://firebase.google.com/docs/auth/web/password-auth?utm_source=chatgpt.com), [Firebase](https://firebase.google.cn/docs/auth/web/start?hl=zh-cn&utm_source=chatgpt.com))
2. **Roles (server):** After sign-up, call a **Cloud Function (Admin SDK)** to set a custom claim `role: 'member' | 'organizer'`. Custom claims must be set on the server. ([Firebase](https://firebase.google.com/docs/auth/admin/custom-claims?utm_source=chatgpt.com), [Firebase](https://firebase.google.cn/docs/auth/admin/custom-claims?hl=zh-cn&utm_source=chatgpt.com))
3. **Read role (client):** Use `getIdTokenResult(user)` to read claims and gate UI/routes. ([Modular Firebase](https://modularfirebase.web.app/reference/auth?utm_source=chatgpt.com), [Firebase](https://firebase.google.com/docs/reference/js/auth?hl=zh-cn&utm_source=chatgpt.com))
4. **Secure data (rules):** Firestore rules check `request.auth.token.role`. ([Firebase](https://firebase.google.com/docs/auth/admin/custom-claims?utm_source=chatgpt.com))
5. (Optional) **VueFire** simplifies Auth state in Vue 3, but it’s not required. ([VueFire](https://vuefire.vuejs.org/guide/auth.html?utm_source=chatgpt.com))

------

# 1) Install & initialize Firebase (Vue 3 project)

```bash
npm i firebase
```

`src/firebase.ts`:

```ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // your keys from Firebase console
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

This matches the current modular web SDK guides. ([Firebase](https://firebase.google.cn/docs/auth/web/start?hl=zh-cn&utm_source=chatgpt.com), [Firebase](https://firebase.google.com/docs/web/learn-more?utm_source=chatgpt.com))

------

# 2) Cloud Function to assign roles (Admin SDK + Custom Claims)

Create a callable function that sets the user’s role right after registration:

```js
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.setUserRole = functions.https.onCall(async (data, context) => {
  // Only allow privileged callers (e.g., the newly created user for themselves).
  // You can also restrict by admin or an allowlist as needed.
  const { uid, role } = data; // 'member' | 'organizer'
  if (!uid || !['member','organizer'].includes(role)) {
    throw new functions.https.HttpsError('invalid-argument', 'Bad role/uid');
  }
  await admin.auth().setCustomUserClaims(uid, { role });
  return { ok: true };
});
```

Why server? **Custom claims must be set from a privileged environment** (Admin SDK). ([Firebase](https://firebase.google.com/docs/auth/admin/custom-claims?utm_source=chatgpt.com), [Firebase](https://firebase.google.cn/docs/auth/admin/custom-claims?hl=zh-cn&utm_source=chatgpt.com))

------

# 3) Registration (two paths) in Vue 3

Create a simple registration component with a role selector:

```vue
<!-- src/components/RegisterForm.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { auth } from '@/firebase';
import { createUserWithEmailAndPassword, getIdTokenResult } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

const email = ref('');
const password = ref('');
const role = ref<'member'|'organizer'>('member'); // switch for two forms/flows
const loading = ref(false);
const error = ref<string | null>(null);

const onRegister = async () => {
  error.value = null; loading.value = true;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.value, password.value);
    // set custom claim via callable function
    const fn = httpsCallable(getFunctions(), 'setUserRole');
    await fn({ uid: cred.user.uid, role: role.value });

    // force refresh to get the new claims into the ID token
    await cred.user.getIdToken(true); // or getIdToken(auth.currentUser!, true)
    const tokenRes = await getIdTokenResult(cred.user);
    console.log('role claim:', tokenRes.claims.role);
    // route based on role
    // router.push(role.value === 'organizer' ? '/org/dashboard' : '/member/home');
  } catch (e:any) {
    error.value = e.message ?? 'Registration failed';
  } finally { loading.value = false; }
};
</script>

<template>
  <form @submit.prevent="onRegister">
    <select v-model="role">
      <option value="member">Member</option>
      <option value="organizer">Organizer</option>
    </select>
    <input v-model="email" type="email" placeholder="Email" required />
    <input v-model="password" type="password" placeholder="Password" required />
    <button :disabled="loading">Create account</button>
    <p v-if="error">{{ error }}</p>
  </form>
</template>
```

- Creating the user / signing in is done with the current Password Auth APIs.
- The **new claim propagates** after login or after you force-refresh the token (`getIdToken(true)`), then you can read it with `getIdTokenResult`. ([Firebase](https://firebase.google.com/docs/auth/web/password-auth?utm_source=chatgpt.com), [Firebase](https://firebase.google.cn/docs/auth/web/start?hl=zh-cn&utm_source=chatgpt.com), [Modular Firebase](https://modularfirebase.web.app/reference/auth?utm_source=chatgpt.com))

------

# 4) Login (two paths) in Vue 3

You can offer two buttons/routes, but the underlying API is the same. After login, check the claim and branch.

```vue
<!-- src/components/LoginForm.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { auth } from '@/firebase';
import { signInWithEmailAndPassword, getIdTokenResult } from 'firebase/auth';

const email = ref(''); const password = ref('');
const desired = ref<'member'|'organizer'>('member'); // which portal the user chose
const error = ref<string|null>(null);

const onLogin = async () => {
  error.value = null;
  try {
    const cred = await signInWithEmailAndPassword(auth, email.value, password.value);
    const res = await getIdTokenResult(cred.user);
    const role = res.claims.role as 'member'|'organizer'|undefined;

    if (!role) throw new Error('No role found on account.');
    if (role !== desired.value) {
      throw new Error(`This account is a ${role}. Please use the ${role} portal.`);
    }
    // router.push(role === 'organizer' ? '/org/dashboard' : '/member/home');
  } catch (e:any) {
    error.value = e.message ?? 'Login failed';
  }
};
</script>

<template>
  <form @submit.prevent="onLogin">
    <select v-model="desired">
      <option value="member">Member login</option>
      <option value="organizer">Organizer login</option>
    </select>
    <input v-model="email" type="email" placeholder="Email" required />
    <input v-model="password" type="password" placeholder="Password" required />
    <button>Login</button>
    <p v-if="error">{{ error }}</p>
  </form>
</template>
```

- `signInWithEmailAndPassword` is the standard email/password sign-in.
- `getIdTokenResult(user)` is the modern way to read custom claims on the client. ([Firebase](https://firebase.google.com/docs/auth/web/password-auth?utm_source=chatgpt.com), [Modular Firebase](https://modularfirebase.web.app/reference/auth?utm_source=chatgpt.com))

------

# 5) Keep role in app state and guard routes

In `main.ts` or a small store, subscribe to auth changes and cache role:

```ts
import { auth } from '@/firebase';
import { onAuthStateChanged, getIdTokenResult } from 'firebase/auth';

export const currentRole = ref<'member'|'organizer'|null>(null);

onAuthStateChanged(auth, async (user) => {
  if (!user) { currentRole.value = null; return; }
  const res = await getIdTokenResult(user);
  currentRole.value = (res.claims.role as any) ?? null;
});
```

Then use **Vue Router guards**:

```ts
// example route meta: { requiresRole: 'organizer' }
router.beforeEach((to) => {
  const need = to.meta.requiresRole as 'member'|'organizer'|undefined;
  if (!need) return true;
  if (!auth.currentUser) return { name: 'login' };
  if (currentRole.value !== need) return { name: 'forbidden' };
  return true;
});
```

`onAuthStateChanged` and the modular APIs are shown in the current Firebase Web docs. ([Firebase](https://firebase.google.com/docs/web/learn-more?utm_source=chatgpt.com))
 (If you prefer, **VueFire** gives you composables like `useCurrentUser()` to simplify this wiring.) ([VueFire](https://vuefire.vuejs.org/guide/auth.html?utm_source=chatgpt.com))

------

# 6) Firestore Security Rules (enforce on backend)

Example: organizers can write to `/events/**`, members can write to `/registrations/**`:

```
// Firestore rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isOrganizer() { return request.auth != null && request.auth.token.role == 'organizer'; }
    function isMember() { return request.auth != null && request.auth.token.role == 'member'; }

    match /events/{id} {
      allow read: if request.auth != null;                // both can read
      allow create, update, delete: if isOrganizer();     // only organizers write
    }

    match /registrations/{id} {
      allow read, create: if isMember();                  // only members register
      allow update, delete: if false;                     // tighten as needed
    }
  }
}
```

Rules can check `request.auth.token` (the decoded ID token with your custom claims). ([Firebase](https://firebase.google.com/docs/auth/admin/custom-claims?utm_source=chatgpt.com))

------

# 7) Notes & alternatives

- **Claim propagation:** After setting a custom claim, the client won’t see it until the ID token refreshes (re-login or `getIdToken(user, true)`). ([Firebase](https://firebase.google.cn/docs/auth/admin/custom-claims?hl=zh-cn&utm_source=chatgpt.com), [Stack Overflow](https://stackoverflow.com/questions/70490182/how-to-use-the-getidtoken-auth-method-in-firebase-version-9?utm_source=chatgpt.com))
- **Don’t trust client-only checks:** Use **security rules** (and/or server checks) to truly protect data. Claims read on the client are for UX; rules enforce the policy. ([Firebase](https://firebase.google.com/docs/auth/admin/custom-claims?utm_source=chatgpt.com))
- **VueFire optional:** It’s handy for reactive auth state in Vue 3 but not required. ([VueFire](https://vuefire.vuejs.org/guide/auth.html?utm_source=chatgpt.com))
- **Email/password flows:** Follow the current password auth guide for validation, password policy, and anti-enumeration options. ([Firebase](https://firebase.google.com/docs/auth/web/password-auth?utm_source=chatgpt.com))

------

## References (official & reliable)

- Firebase Auth (Email/Password, Web v9+ modular): create/sign in, setup, observers. ([Firebase](https://firebase.google.com/docs/auth/web/password-auth?utm_source=chatgpt.com), [Firebase](https://firebase.google.cn/docs/auth/web/start?hl=zh-cn&utm_source=chatgpt.com))
- Custom Claims (Admin SDK) & how they propagate to clients and into rules. ([Firebase](https://firebase.google.com/docs/auth/admin/custom-claims?utm_source=chatgpt.com), [Firebase](https://firebase.google.cn/docs/auth/admin/custom-claims?hl=zh-cn&utm_source=chatgpt.com))
- Client-side access to claims: `getIdTokenResult(user)` (modular API). ([Modular Firebase](https://modularfirebase.web.app/reference/auth?utm_source=chatgpt.com), [Firebase](https://firebase.google.com/docs/reference/js/auth?hl=zh-cn&utm_source=chatgpt.com))
- Vue + Firebase Auth patterns with VueFire (optional). ([VueFire](https://vuefire.vuejs.org/guide/auth.html?utm_source=chatgpt.com))

------

If you want, I can drop this into a minimal Vite + Vue 3 repo structure with the two forms (Member/Organizer) and a tiny router so you can run it locally.