You are integrating a UI design exported from stitch folder into a Next.js (App Router) project.

CORE PRINCIPLE:

* The Stitch design is the visual source of truth (UI/UX style, layout, spacing, colors)
* Functional logic, structure, and additional pages may be improved if they are reasonable and consistent

STRICT UI RULES:

* DO NOT change visual style (colors, spacing, typography, layout structure)
* DO NOT redesign components
* You MAY reuse and rearrange existing components if needed
* Any new UI must strictly follow the same design system from Stitch

OBJECTIVE:
Transform the static Stitch design into a functional, clean, and scalable Next.js application.

TECH STACK:

* Next.js (App Router)
* TypeScript
* Tailwind CSS (follow existing classes/design tokens from Stitch)
* Minimal dependencies only when necessary

IMPLEMENTATION GUIDELINES:

1. PROJECT STRUCTURE:

* Use clean and scalable structure:
  /src/app
  /src/components
  /src/lib
  /src/services
  /src/types
* Extract reusable components properly (avoid duplication)

2. UI INTEGRATION:

* Convert Stitch HTML into JSX/TSX
* Preserve styles exactly
* Break UI into logical reusable components
* Maintain consistent naming

3. ROUTING & PAGES:

* Implement core pages:

  * Home (project list)
  * Project (kanban board)
* You MAY add logical pages if needed, such as:

  * Project detail wrapper
  * Not found / fallback
* Routing must follow Next.js App Router best practices

4. STATE & DATA FLOW:

* Use simple and clear state management (React state)
* Avoid unnecessary global state
* Ensure predictable data flow

5. DATA STRUCTURE:
   Define clean types:

* Project (id, name, description, pin, timestamps)
* Task (id, title, description, status, priority, labels, attachments, testing)
* Column (id, title, order)

6. FUNCTIONAL FEATURES:
   Implement based on UI:

* Project list display
* Create project
* PIN-based access (simple validation logic)
* Kanban board rendering
* Task CRUD (create, edit, delete)
* Drag and drop between columns (lightweight solution)

7. ALLOWED IMPROVEMENTS:

* Add missing logical flows if UI implies them
* Improve component structure
* Normalize data handling
* Add minimal UX improvements (loading state, empty state)
* Add small helper components if needed

8. NOT ALLOWED:

* Changing visual design
* Adding features that conflict with the UI concept
* Over-engineering (no unnecessary abstraction layers)
* Adding heavy libraries without strong reason

9. CODE QUALITY:

* Clean, readable, and modular code
* No redundant logic
* No deeply nested components
* Consistent naming conventions
* Follow modern Next.js best practices

10. ERROR HANDLING:

* Minimal but clear validation
* Handle basic edge cases (empty state, invalid PIN)

11. OUTPUT RULES:

* No self-talk
* No explanations
* No summaries
* Only provide code
* Ensure the app runs correctly

GOAL:
Build a functional kanban-style project management app from the Stitch design, preserving its visual identity while improving structure and logic where necessary.
Wijiforkanban1234 supabase