# Routing

/home

/find

/program

/support

/login

/register

/account/member

/account/organizer

/launch-program

## Home (`/`)

- Hero with short mission statement (static copy).
- “Featured Programs” grid (cards) pulled from a local JS/JSON array (dynamic data via `ref`/`computed`).
- Quick search bar that navigates to Find Sports with a query param (e.g., `?q=netball`).
- Responsive layout (mobile-first cards that become a 2–3 column grid on tablet/desktop).

**Key components:** `ProgramCard.vue`, `SearchBar.vue`.

------

## Find Sports (`/find`)

- Filters: sport (select), age group (select), max cost (number), accessibility (checkbox).
- Basic client-side validations (e.g., max cost must be a positive number; at least one filter or query must be present).
- Results list bound to your in-memory dataset; support simple sort (e.g., by cost asc/desc) and a minimal “show 10 / Load more”.
- Clicking a result goes to Program Details.

**Key components:** `FiltersPanel.vue`, `ResultsList.vue`, `ResultRow.vue`.

------

##  Program Details (`/program/:id`)

- Pull program by `id` from your data store and render details (title, tags, schedule array, venue text, fees).
- “Register Interest” mini-form (no auth yet):
  - Fields: name (required), email (required + email format), participants (number ≥ 1).
  - Show inline validation messages and disable submit until valid.
  - On submit, show an in-app confirmation message (no backend yet).

**Key components:** `ProgramHeader.vue`, `ProgramMeta.vue`, `RegisterInterestForm.vue`.

------

##  Support / Contact (`/support`)

- Simple FAQ accordion fed from a local JSON array (dynamic rendering).
- Contact form with validations:
  - Email (required + email format), subject (required, min length), message (required, min length).
  - Accessibility: labels, described-by error text, keyboard focus order.

**Key components:** `FaqAccordion.vue`, `ContactForm.vue`.

------

## Login (`/login`)

- Role-based login with member/organizer selection
- Email and password authentication via Firebase Auth
- Form validation with real-time error feedback
- Password visibility toggle for accessibility
- Redirects to appropriate account page based on selected role
- Links to registration page for new users

**Key components:** Firebase authentication integration, role validation

------

## Register (`/register`)

- Role-based registration with member/organizer selection
- Email, password, and password confirmation fields
- Firebase Auth integration for account creation
- Form validation including email format and password strength
- Custom cloud function call to set user roles
- Success message and automatic redirect to account page

**Key components:** Firebase authentication, cloud function integration

------

## Member Account (`/account/member`)

- Protected route requiring member role authentication
- Dashboard view with MyAccount shared component displaying user info
- My Programs section (placeholder for joined programs)
- Quick action cards for future features (favorites, reviews, notifications)
- Navigation to Find Sports page for program discovery
- Logout functionality

**Key components:** MyAccount component, program tracking interface

------

## Organizer Account (`/account/organizer`)

- Protected route requiring organizer role authentication  
- Dashboard view with MyAccount shared component
- Launch Programs button routing to program creation
- My Programs section (placeholder for future program management)
- Quick action cards for future features (participants, analytics, schedule)
- Logout functionality and navigation links

**Key components:** MyAccount component, program management navigation

------

## Launch Program (`/launch-program`)

- Protected route requiring organizer role authentication
- Comprehensive form for creating new sports programs
- Program information inputs: title, sport selection, age groups, description, cost
- Accessibility and inclusivity features with checkbox selections
- Dynamic inclusivity tags system (type and enter to add, removable tags)
- Schedule configuration: weekday selection, start/end time dropdowns, start date picker
- Form validation with real-time error feedback and field-specific validation
- Responsive layout with sticky schedule section on desktop
- Submit functionality with loading states and success/error messages

**Key components:** Form validation, dynamic inputs, schedule management

------

