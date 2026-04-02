# Design System Document: The Architectural Canvas

## 1. Overview & Creative North Star
This design system is built upon the philosophy of **"The Architectural Canvas."** In a world of cluttered project management tools, we move beyond the "grid of boxes" to create a space that feels like a high-end editorial spread. We prioritize precision, structural depth without lines, and intentional void.

The "Architectural Canvas" breaks the template look by treating the interface as a physical environment. We use a sophisticated interplay of tonal layering and oversized typography to create a signature experience that feels custom-built, not assembled. We don't use lines to separate ideas; we use space and light.

---

## 2. Colors & Surface Philosophy
Our palette is a study in "Warm Minimalism." It uses a sophisticated range of neutrals to guide the eye, with a deep, authoritative blue for critical actions.

### Tonal Foundations
- **Background (`#f8f9fa`):** Our primary stage. It is soft, reducing eye strain during long work sessions.
- **Primary (`#0c56d0`):** Used sparingly for "Architectural Accents"—the primary call-to-action or the active navigation state.
- **Secondary (`#4d626c`):** Used for utility elements and supporting information to provide a grounded, professional contrast.

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using 1px solid borders for sectioning. Traditional borders create visual noise. Instead:
- **Surface Shifts:** Define boundaries by shifting from `surface` to `surface-container-low` or `surface-container-high`.
- **Nesting Hierarchy:** Treat the UI as layers of fine paper. An application sidebar should live on `surface-container-low`, while the main workspace sits on `surface`. Task cards must sit on `surface-container-lowest` (pure white) to appear as if they are lifting off the page naturally.

### The "Glass & Gradient" Rule
To elevate the system from "clean" to "premium," use **Glassmorphism** for floating elements (modals, dropdowns, or hovering tooltips). Use `surface` colors with a 70-80% opacity and a `20px` backdrop-blur. 
- **Signature Texture:** For primary buttons and high-level headers, apply a subtle linear gradient from `primary` (#0c56d0) to `primary_dim` (#004aba) at a 135-degree angle. This provides a "jewel" effect that flat color cannot replicate.

---

## 3. Typography: Editorial Authority
We utilize a dual-font strategy to balance character with utility.

- **Display & Headlines (Manrope):** These are our "Editorial Hooks." Use `display-lg` and `headline-md` with tight letter-spacing (-0.02em) to create a sense of authoritative luxury.
- **Interface & Body (Inter):** All functional data—task titles, descriptions, and labels—must use Inter. Its high x-height ensures maximum legibility at small sizes (`body-sm` and `label-md`).
- **Hierarchy through Scale:** Use extreme contrast. A `headline-lg` project title should feel significantly more "important" than the `body-md` task description beneath it.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are often a crutch for poor layout. In this system, we use **Tonal Layering**.

- **The Layering Principle:** 
    1. Base Layer: `surface`
    2. Content Containers: `surface-container-low`
    3. Interactive Cards: `surface-container-lowest`
- **Ambient Shadows:** When a card is hovered or "picked up" (in a Trello-style drag), apply an extra-diffused shadow. Use `on_surface` at 6% opacity with a `32px` blur and `12px` Y-offset. It should feel like ambient light, not a black glow.
- **The "Ghost Border":** If a card requires a border for accessibility in high-glare environments, use the `outline_variant` token at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Cards (The Core Unit)
- **Style:** Background: `surface_container_lowest`. Corner Radius: `md` (0.75rem). 
- **Constraint:** No internal dividers. Use `spacing-4` (1rem) to separate the task title from the metadata.
- **Interaction:** On hover, shift the background to `surface_bright` and apply the Ambient Shadow.

### Buttons
- **Primary:** Gradient fill (Primary to Primary-Dim), `on_primary` text, `full` (pill) or `md` radius.
- **Secondary:** `surface_container_high` background with `on_secondary_container` text. No border.
- **Tertiary:** Text-only using `primary` color, bold weight, with a `0.5rem` padding for a larger hit state.

### Input Fields
- **State:** Background: `surface_container_low`. 
- **Focus:** Transition background to `surface_container_lowest` and apply a 2px "Ghost Border" using the `primary` color at 40% opacity. 
- **Typography:** Labels must use `label-md` in `on_surface_variant`.

### Contextual Drawers (Unique to this System)
Instead of standard modals, use side-drawers that slide in from the right. Use a `surface` background with a heavy backdrop blur (`16px`) on the content behind it. This maintains the "Notion-like" sense of flow and context.

---

## 6. Do's and Don'ts

### Do:
- **Do** use `spacing-8` (2rem) or `spacing-10` (2.5rem) between major sections to let the design breathe.
- **Do** use `thin` iconography (1px or 1.5px stroke) to match the Inter typography weight.
- **Do** utilize `surface_tint` at 5% opacity for hover states on list items.

### Don't:
- **Don't** ever use a `#000000` shadow. Always tint shadows with the `on_surface` color.
- **Don't** use "Default" blue (#0000FF). Always use the refined `primary` (#0c56d0).
- **Don't** use more than two levels of nesting. If a container is inside a container which is inside a container, reconsider the layout using whitespace.
- **Don't** use dividers to separate list items. Use a `1px` vertical gap and let the `surface` color show through as a "natural" separator.

---
**Director's Final Note:** This system is about the "quiet" details. When in doubt, add more whitespace and remove a line. Let the typography and the subtle shifts in surface color do the heavy lifting.