# UI Guidelines: To Do App

## 1. Keep the UI Simple

- Prioritize clarity and ease of use over visual complexity.
- Avoid unnecessary decorative elements, animations, or features that distract from task management.
- Each screen or section should have a single, clear purpose.
- Use whitespace generously to separate content and reduce visual clutter.
- Error messages and feedback should be concise and placed close to the relevant element.

## 2. Match Existing Colors

Use the established color palette consistently across all new UI elements:

| Role | Color |
|---|---|
| Primary action / button background | `#61dafb` |
| Primary action hover | `#21a1c9` |
| Primary text on dark background | `#ffffff` |
| App header background | `#282c34` |
| Button text / dark text | `#282c34` |
| Section / card background | `#f5f5f5` |
| Border / divider | `#dddddd` |
| Destructive action (delete) | `#f44336` |
| Destructive action hover | `#d32f2f` |
| Error text | `#d32f2f` |

- Do not introduce new brand colors without updating this guide.
- Use `#f5f5f5` for card and section backgrounds to maintain visual consistency.

## 3. Match Existing Button Styles

All buttons must follow the established style defined in `App.css`:

- **Padding**: `8px 16px`
- **Background**: `#61dafb` (primary), `#f44336` (destructive)
- **Text color**: `#282c34` (primary), `#ffffff` (destructive)
- **Border**: none
- **Border radius**: `4px`
- **Font weight**: bold
- **Cursor**: pointer
- **Hover**: darken the background color (`#21a1c9` for primary, `#d32f2f` for destructive)

Secondary or smaller buttons (e.g., inline delete) may use reduced padding (`6px 12px`) and a smaller font size (`0.8rem`), as with `.delete-btn`.

Do not apply custom border or box-shadow styles to buttons unless required for accessibility (e.g., focus rings).
