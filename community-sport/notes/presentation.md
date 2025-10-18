I am using **Vue Router 4.5.1** for client-side navigation and **Bootstrap 5.3.7** for responsive design and UI components

## Component Architecture

### **Page Components (4 Core Pages)**

#### **1. HomePage.vue**

- **Hero section** with clear mission statement
- **Featured programs** with intelligent scoring algorithm
- **Integrated search** that seamlessly connects to Find Sports
- **Responsive card grid** (1→2→3 columns based on screen size)

#### **2. FindSportsPage.vue**

- **Advanced search orchestration** combining multiple components
- **Real-time filtering** with URL state management
- **Smart result handling** with loading states and empty states

#### **3. SupportPage.vue**

- **Dual-purpose layout** with FAQ and contact form
- **Dynamic content loading** from JSON data sources

#### **4. ProgramDetailsPage.vue**

- **Dynamic routing** with program ID parameter handling
- **Detailed program information** display (prepared for next phase)



# Responsiveness Implementation

I've implemented a **mobile-first responsive design** using Bootstrap's advanced grid system:

1 column on mobile → 2 on tablet → 3 on desktop

 Find Sports filters: Full width on mobile → Half on tablet → Quarter on desktop



# Comprehensive Validation System

Email Format Validation in Support page:

Minimum Length Validation in Support page form



In Find sport page:

I have create Number Range Validation for maximum cost filter,Validating cost filter inputs must be non-negative numbers.



Conditional/General Validation: must enter a search term or select at least one filter



# Dynamic Data Implementation

All content is dynamically loaded from JSON data sources: For example, in home page, this data are loaded from programs.json, and in FAQ page, the faqs are loaded from faqs.json







