# Design System Specification: The Therapeutic Editorial

## 1. Overview & Creative North Star
This design system is built upon the Creative North Star of **"The Digital Sanctuary."** In an industry often defined by clinical coldness or frantic urgency, this system pivots toward high-end, editorial calm. We reject the "template" look of rigid grids and heavy borders, opting instead for a composition that feels organic, breathable, and deeply intentional.

The visual language balances the authority of a premium medical institution with the warmth of a caregiver’s touch. We achieve this through **Intentional Asymmetry**—placing large-scale typography against generous whitespace—and **Tonal Layering**, where depth is felt through color shifts rather than seen through lines.

---

## 2. Colors & Surface Philosophy
The palette is rooted in restorative Sage and Warm Sand, designed to lower the user's cortisol levels upon interaction.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders to define sections. Layout boundaries must be established solely through background color shifts. For example, a `surface-container-low` (#f7f4e1) section should sit directly against a `surface` (#fdfae7) background. This creates a seamless, sophisticated transition that mimics high-end paper stock.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the Material tiers to create nested importance:
- **Base Layer:** `surface` (#fdfae7) for the primary canvas.
- **Sectioning:** `surface-container-low` (#f7f4e1) for large secondary content areas.
- **Interactive Elements:** `surface-container-highest` (#e6e3d0) for elevated cards or utility bars.
- **Deep Insets:** `surface-dim` (#dddbc8) for footer or background areas requiring a "recessed" feel.

### The "Glass & Gradient" Rule
To escape a flat, "out-of-the-box" appearance:
- **CTAs & Heroes:** Use subtle linear gradients transitioning from `primary` (#4a654f) to `primary_container` (#8daa91) at a 135-degree angle. This adds "soul" and a tactile, silk-like quality.
- **Floating Elements:** For top navigation or transient modals, use `surface_container_lowest` (#ffffff) with a 70% opacity and a `24px` backdrop-blur to create a "frosted glass" effect.

---

## 3. Typography
We employ a high-contrast scale to mirror medical journals and premium lifestyle editorials.

*   **Display & Headlines (Manrope):** The "Voice." Used for welcoming the user and establishing authority. The generous tracking and roundness of Manrope provide an approachable yet professional "Headline" feel.
*   **Body & Titles (Inter):** The "Information." Inter provides maximum legibility for clinical data and instructions.

| Role | Font | Size | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **display-lg** | Manrope | 3.5rem | Bold | Hero statements, transformative stats |
| **headline-md** | Manrope | 1.75rem | Medium | Section headers, care plan titles |
| **title-lg** | Inter | 1.375rem | Semi-Bold | Card titles, modal headers |
| **body-md** | Inter | 0.875rem | Regular | Core clinical content, descriptions |
| **label-md** | Inter | 0.75rem | Medium | Metadata, eyebrow text, small buttons |

---

## 4. Elevation & Depth
Depth is a psychological cue for "safety" and "focus." In this system, we avoid "harsh" shadows.

*   **The Layering Principle:** Rather than shadows, stack `surface-container-lowest` (#ffffff) cards on `surface-container-low` (#f7f4e1) backgrounds. The delta in lightness provides a natural, soft lift.
*   **Ambient Shadows:** If a floating action is required, use a `20px` to `40px` blur radius with only 4% opacity of the `on_surface` (#1c1c11) color. It should feel like an ambient glow, not a drop shadow.
*   **The "Ghost Border" Fallback:** If a container requires definition against a similar background (e.g., in accessibility-critical states), use `outline_variant` (#c2c8c0) at **15% opacity**. Never use a 100% opaque border.

---

## 5. Components

### Buttons
*   **Primary:** Gradient of `primary` to `primary_container`. `xl` (1.5rem) corner radius. Use `on_primary` (#ffffff) text.
*   **Secondary:** `secondary_container` (#e6e3d0) background with `on_secondary_container` (#666556) text. No border.
*   **Tertiary/Ghost:** No background. Underline on hover using a `2px` stroke of `primary_fixed` (#cceacf).

### Cards & Lists
*   **Cards:** Use `lg` (1rem) or `xl` (1.5rem) corner radius. **Forbid divider lines.** Separate content using the spacing scale (e.g., `spacing-6` or `2rem`) or a subtle background shift to `surface-container-highest`.
*   **Lists:** Leading icons should be encased in a `secondary_fixed` (#e6e3d0) circle for a soft, curated look.

### Input Fields
*   **Text Inputs:** Use `surface_container_lowest` (#ffffff) background with a "Ghost Border" (15% `outline_variant`). On focus, transition the border to `primary` (#4a654f) and add a subtle 2px outer glow of `primary_fixed`.

### Care-Specific Components
*   **Progress "Halos":** Use large, soft circular strokes in `tertiary_container` (#74a9cd) to track recovery goals—gentle, not clinical.
*   **Sanctuary Modals:** Large-scale, full-screen overlays using the Glassmorphism rule to keep the user grounded in their current context while they focus on a specific task.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace Whitespace:** Use `spacing-16` (5.5rem) and `spacing-20` (7rem) between major sections to let the design breathe.
*   **Layer Surfaces:** Use the `surface-container` tiers to guide the eye toward the most important action.
*   **Use Soft Geometry:** Stick strictly to the `lg` (1rem) and `xl` (1.5rem) radius for all major containers.

### Don’t:
*   **No "Hard" Lines:** Never use 100% opaque, high-contrast borders or dividers.
*   **No Pure Black:** Text should always be `on_surface` (#1c1c11) or `on_surface_variant` (#424842)—never `#000000`.
*   **No Grid-Lock:** Avoid perfectly symmetrical 3-column grids. Try an asymmetrical layout (e.g., a 2/3 width content area paired with a 1/3 width "sanctuary" sidebar) to maintain an editorial feel.
*   **No Default Shadows:** Avoid the standard "Material Design" shadows. If it looks like a default shadow, it’s too heavy.