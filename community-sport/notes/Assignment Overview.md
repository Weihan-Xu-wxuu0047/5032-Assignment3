# Assignment Overview

## Scenario

As a freelance full-stack web developer, you have been awarded the prestigious contract to design and develop **a modern web application** for a distinguished **Not for Profit (NFP)**. This organization is dedicated to significantly impacting the community by supporting vulnerable groups through innovative technology solutions. Your expertise and innovative approach to web development have made you stand out, making you the developer of choice for this critical project.

## Client Overview

The client is a renowned NFP in Melbourne focused on improving the health and well-being of underrepresented communities. They provide crucial resources, support, and education to **one of the following options of your choice**:

- Health promotion through community sport
- Public health through nutrition education
- Youth mental health and wellbeing
- Men’s health
- Women’s health
- [Or another option of your choice that you believe needs this support] - **consult with your tutor**.

This NFP seeks to leverage technology to expand its reach, enhance its services, and streamline its operations to better serve its target audience.

The success of this initiative heavily relies on the user experience (UX) of the web application, as it serves as a critical driver for their business success and community impact.

------

**Website Content (Website Copy)**

While **there are no marks attached** to the accuracy of your content, some basic research on the internet should suggest suitable content for you (i.e. using a search engine to look up health charities to find examples of what kind of content should be included).

When conducting content research for your NFP website, a good starting point is to review other similar NFP websites. Look for how they present their information, the types of content they prioritize (like blog posts, FAQs and resource guides), and the design choices that enhance user engagement. Analyze their approach to communicating with different audiences, especially through the use of visuals like infographics, photos, and video content.

------

## 2. Business Requirements A-C

**The new Web Application must be able to meet the following Functional and Non-Functional Business requirements.**

### BUSINESS REQUIREMENT (CATEGORY A):

**BR (A.1): Development Stack [Coverage: Week 1]**
 The new Web Application must be developed using VueJS 3 framework.

**BR (A.2): Responsiveness**
 The new Web Application must have responsiveness capability to be compatible with various devices.

------

### BUSINESS REQUIREMENT (CATEGORY B):

**BR (B.1): Validations**
 The new Web Application must implement user input validations with a minimum of two different types of validations.

**BR (B.2): Dynamic Data**
 The new Web Application must be able to dynamically fetch and displays values from the underlying JavaScript data structures (e.g. fetched from JSON, State variables or vue binding).

------

### BUSINESS REQUIREMENT (CATEGORY C):

**BR (C.1): Authentication**
 The new Web Application must have a basic authentication mechanism (login/register functionality and user accounts) to provide confidentiality.

**BR (C.2): Role-based authentication**
 The new Web Application must have a role-based authentication mechanism (supporting different types of users) with a minimum of two roles to support different authorisation levels on pages.

**BR (C.3): Rating**
 The new Web Application must implement an aggregated rating score feature. Users can rate and see the average rating from all users for a particular aspect (Such as Reviews).

**BR (C.4): Security**
 The new Web Application must implement basic security to protect from online attacks such as XSS. Also needs to follow basic security practices (e.g. implementing client-side data validation).

------

## 3. Business Requirements D-E

### BUSINESS REQUIREMENT (CATEGORY D)

**BR (D.1): External Authentication**
 The new Web Application must have an external authentication mechanism (such as Firebase Auth).

**BR (D.2): Email**
 The new Web Application must be able to send emails with an attachment. Use SendGrid API or other email API services to achieve this.

**BR (D.3): Interactive Table Data**
 The new Web Application must display interactive table data with a minimum of two tables. The table needs to support: sort, search and limit to 10 rows per page. User must be able to search by individual column.

**BR (D.4): Deployment to the cloud**
 Fully working public online version hosted (e.g. on Cloudflare Pages, on Google Cloud Hosting etc).

------

### BUSINESS REQUIREMENT (CATEGORY E)

**BR (E.1): Cloud Functions**
 The new Web Application must use serverless such as Firebase Cloud functions to execute server-side functionality.

**BR (E.2): Geo Location**
 The new Web Application must display a map with minimum two features. These two features need to be non-trivial features. For example: searching places of interest, navigate between places, and trip information etc.

**BR (E.3): Accessibility**
 The application must meet WCAG 2.1 accessibility standards at the AA level to ensure usability by people with a range of disabilities. Provide accessibility features such as keyboard navigability in forms and provide text alternatives for non-text content.

**BR (E.4): Export**
 The new Web Application must be able to export data (for example: as CSV or PDF file).

------

### BUSINESS REQUIREMENT (CATEGORY F):

**BR (F.1): Innovation**
 The new Web Application must implement **four** extended innovative features aimed at improving User Experience (UX). A research report with details on which features have been implemented and recommendations for future upgrades **must be prepared** and submitted. Note that implemented innovations may represent enhancements to existing features. Examples of extended innovative features:

- Appointment Booking (using Calendar): The new Web Application must implement booking constraints such as booking conflict management using Calendar. **Hint:** Displaying features on a Calendar such as event constraint can be done using [FullCalendar.io](http://fullcalendar.io/) API
- Bulk Email: The new Web Application must be able to send bulk email to selected users.
- Provide API access to others i.e. exposing at least 2 routes on your platform to allow third parties to fetch data using REST protocol.
- Interactive Charts - The new Web Application must display an interactive chart or graph using data from Firestore.
- Incorporate GenAI such as Gemini API or OpenAI API (note: Gemini API can be used for testing free of cost, so it is recommended to use that)
- Admin Dashboard - Create a dashboard view for the system admin of this health charity (you may want to create a seprate role for ‘admin’), where they can see an overview of the website including number of users and types of users.
- App with at least two offline features like: Checking if user is online/offline, extended use of Local Storage etc.