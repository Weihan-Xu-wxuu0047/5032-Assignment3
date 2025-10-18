# A1-2 Reflection
Looking back on this development phase, the most challenging aspect has been implementing the comprehensive responsiveness requirements. Initially, I approached responsive design with a basic understanding of Bootstrap's grid system, but the A1-2 requirements demanded much deeper precision. I had to truly understand how Bootstrap's responsive classes work together, learning the differences between col-sm-2, col-md-6, and col-lg-3 and how they create cascading layout changes. The real challenge came with the FindSportsPage filters panel, where I needed the four-column desktop layout to gracefully transform into a two-column tablet layout and then stack on mobile without breaking functionality. This required me to think systematically about information hierarchy across different device types, which has fundamentally changed how I approach frontend development.

The fuzzy search implementation has been equally demanding. What started as simple text matching evolved into a sophisticated search algorithm handling partial word matching, case-insensitive searches, and multi-word queries. I realized users don't search like programmers think - they type fragments of what they remember, not exact matches. Building a system that finds "Youth Basketball" when someone types just "youth" or "basketball" requires diving deep into JavaScript string manipulation and regular expressions. I had to implement word boundary detection and partial matching while searching across multiple data fields simultaneously - program titles, descriptions, venue information, and accessibility features. This challenge taught me to think about user experience from a technical implementation perspective.

The validation system initially seemed straightforward with the requirement for "at least two different types," but implementing robust validation taught me about the relationship between user experience and data integrity. Creating email format validation was just the beginning - I had to learn how to provide real-time feedback without being intrusive and handle edge cases like empty strings versus undefined values. The number range validation for the cost filter presented unexpected challenges when HTML number inputs returned actual number types instead of strings, causing my .trim() methods to fail. This forced me to implement type-safe validation handling both string and number inputs gracefully. Managing validation state across multiple components while maintaining consistent user feedback stretched my understanding of Vue's reactivity system and taught me to design validation as an integral part of the user interface.

## use of AI
I use ChatGPT to search for responsive layout solutions for bootstrap. 



# A1-3 Reflection
5. Reflections: Implementation of C.4 Security
If you have implemented BR C.4, in less than 200 words describe the approach that you have taken to implementing Security in your application. What security flaws were you trying to prevent and what security measures have you implemented to fix those flaws? How do you know that these measures will help prevent those issues from happening? Optionally you can cite external sources to provide evidence for your claim. 

The most critical security flaw addressed was the exposure of sensitive Firebase API keys in the source code, which could allow malicious actors to access and manipulate the Firebase project directly. This was resolved by migrating all Firebase configuration to environment variables using Vite's VITE_ prefix system.

Also, Role-based access control was implemented to ensure users can only access resources appropriate to their assigned roles, with server-side validation through Firestore security rules that verify user identity and permissions before allowing database operations. These rules prevent unauthorized users from reading or modifying user data and program comments by matching the authenticated user's ID with document ownership.




6. Reflections: Challenges
What has been the most challenging part of this assignment for you? How has this stretched you as a programmer? 

The most challenging aspect of this assignment was implementing the role-based authentication system and migrating from local storage to Firebase Firestore for user role management. Initially, the application stored user roles in localStorage, which was simple but not persistent across devices or secure. Transitioning to Firebase required understanding handling authentication state changes, and ensuring data consistency between the authentication service and the user interface components. 

Security implementation proved to be particularly time-consuming, especially when configuring Firebase security rules and debugging permission errors. Moving API keys to environment variables was straightforward conceptually, but required understanding Vite's environment variable system and ensuring proper configuration across development and production environments. The most frustrating part was debugging Firestore security rules, as error messages were often cryptic and required extensive testing to identify whether issues stemmed from incorrect rule syntax, authentication problems, or data structure mismatches. Each rule change required careful testing across different user scenarios to ensure legitimate access remained functional while preventing unauthorized operations.

Developing the comment and rating system improves my front end design skills, particularly in handling real-time data synchronization between the user interface and Firebase database. Creating an interactive star rating component required understanding event handling, state management, and visual feedback systems. The challenge intensified when implementing comment display functionality that required querying Firestore with complex filters, handling loading states, and managing the relationship between user authentication and comment ownership. This experience taught me the importance of planning data structures carefully and the complexity involved in creating responsive, real-time applications that maintain data integrity while providing smooth user experiences.




## use of AI
I use ChatGPT to learn firestore rules
I use ChatGPT to learn how to write firestore rules

I use ChatGPT to learn how to use firestore
I use ChatGPT to learn how to create, setup and integrate firestore into the Javascript code. 

I use ChatGPT to learn how to improve API key security
I use ChatGPT to learn how to prevent API key leakage, learn how to setup environment variables in vue code.

