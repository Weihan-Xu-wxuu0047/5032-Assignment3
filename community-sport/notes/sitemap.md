%%{init: { 'flowchart': { 'nodeSpacing': 100 }}}%%
flowchart TD
    %% ROOT
    A[Home — Landing page with mission, featured programs, quick search] --> B
    A --> C
    A --> D
    A --> E
    A --> F
    A --> G
    A --> H
    A --> I

    %% SEARCH / DISCOVERY
    subgraph B[Find Sports — Help users discover suitable activities]
      B1[Search & Filters — by sport, age, cost, accessibility, location]
      B2[Map View — visualize nearby programs & clubs]
      B3[Results List — paginated, sortable table with key details]
    end
    B --> J

    %% PROGRAMS
    subgraph C[Programs — Directory of all community sport programs]
      C1[Categories — e.g., Team, Solo, Low-impact, Youth, Seniors]
      C2[All Programs — browseable list with tags & ratings]
      C3[Program Details — schedule, location, cost, inclusivity, equipment]
      C4[Ratings & Reviews — average score + user feedback]
      C5[Register/Join — add to calendar, confirm attendance]
    end
    C2 --> C3
    C3 --> C4
    C3 --> C5
    C3 --> J
    C5 --> K

    %% EVENTS
    subgraph D[Events Calendar — Upcoming sessions & community events]
      D1[Month/Week/Day Views — responsive calendar]
      D2[Event Details — time, venue, transport tips]
      D3[Register/RSVP — simple sign-up flow]
      D4[Export/Share — add to device calendar, share link]
    end
    D1 --> D2 --> D3 --> K
    D2 --> J

    %% RESOURCES
    subgraph E[Resources — Health promotion guides & safety info]
      E1[Getting Started — “beginner” tips, costs, what to bring]
      E2[Inclusion & Accessibility — adaptive sports, support options]
      E3[Injury Prevention — warm-ups, recovery, credible references]
      E4[Nutrition Basics — pre/post activity guidance]
      E5[Download Centre — PDF/CSV handouts & checklists]
    end

    %% CLUBS & PARTNERS
    subgraph F[Clubs & Partners — Connect with local organisations]
      F1[Club Directory — profiles, contacts, accreditation]
      F2[Partner Offers — discounts, equipment loans]
      F3[Volunteer Opportunities — roles, onboarding steps]
    end
    F1 --> J

    %% ABOUT & CONTACT
    subgraph G[About — Who we are & impact]
      G1[Mission & Impact — outcomes, community stories]
      G2[Team & Governance — transparency, credibility]
      G3[Policies — privacy, terms, child safety]
    end
    subgraph H[Support — Help users succeed]
      H1[FAQ — common questions on programs & fees]
      H2[Contact — form/email; response expectations]
      H3[Accessibility Support — WCAG tips, assistive tech guidance]
    end

    %% ACCOUNT & AUTH
    subgraph I[Account — Personalised experience for participants & organisers]
      direction TB
      I1[Login / Register — basic auth, role-based access]
      I2[Profile & Preferences — age group, interests, accessibility needs]
      I3[My Registrations — upcoming & past, cancellations]
      I4[Favourites / Watchlist — save programs & clubs]
      I5[Notifications — reminders, updates, waitlists]
      I6[Settings — privacy, data export]
    end
    I1 --> I2 --> I3
    I2 --> B
    I2 --> C
    I2 --> D

    %% PROGRAM / EVENT RELATIONSHIPS
    B1 --> B3
    B2 --> B3
    B3 --> C3
    J[Location Details — map, transport options, accessibility notes]
    K[Confirmation — success screen + emailed details]

    %% ORGANISER CONSOLE (role-based)
    subgraph O[Organiser Console — Tools for clubs & coordinators]
      O1[Create Program/Event — forms with validation]
      O2[Manage Listings — edit details, schedules, capacity]
      O3[Attendees — check-ins, waitlists, CSV export]
      O4[Messaging — send updates to registrants]
      O5[Reviews Moderation — respond to feedback]
    end
    I1 -->|Organiser role| O
    O1 --> C2
    O2 --> C3
    O3 --> I3
    O4 --> I5

    %% ADMIN DASHBOARD (role-based)
    subgraph AD[Admin Dashboard — Oversight & governance]
      AD1[Users — roles, access, support]
      AD2[Content — pages, resources, approvals]
      AD3[Reports — participation metrics, exports]
      AD4[Safety & Compliance — policy updates, audit logs]
    end
    I1 -->|Admin role| AD
    AD2 --> E
    AD2 --> G
    AD3 --> G1
