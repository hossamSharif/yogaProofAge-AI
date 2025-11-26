/plan
Build YogaAgeProof AI as a cross-platform mobile application using React Native with Expo. No custom backend—use Supabase for authentication, all database needs (user profiles, routines, diary entries, media references), and storage (user-uploaded images and photo gallery). All business logic, AI integrations, and notification scheduling should be handled client-side or via Supabase functions only if strictly necessary.

**Core Features:**
- AI-powered face scanner: Users upload a photo for AI-based skin analysis and to generate personalized routine options.
- Routine builder: After scanning, display several AI-generated routine options. User selects one. Require users to add products by category (e.g., cleanser, serum, moisturizer, treatment, sunscreen), limited to app-suggested products per step, with integrated product search and browsing tools.
- Routine player: Guide users step-by-step with yoga sessions, product usage guides, timers, and tips.
- Routine evaluation: Offer routine review, visual timeline, and targeted feedback.
- Photo gallery & AI comparison: Users can upload daily photos; enable side-by-side, AI-annotated progress comparisons.
- Skin diary: Support for tracking skin state, mood, and triggers via a calendar-based journal.
- Push notifications: Use Expo to deliver all reminders (routines, check-ins), progress updates, and system messages.
- Centralized notifications: Aggregate routine, diary, and system notifications in a single view.

**Design Integration Instructions:**
- All screens must match assets in the `design/` directory. Each screen resides in a subfolder (e.g., `design/login/`) and contains: `screen.html` (reference HTML), `screen.png` (design image).
- Always implement screens referencing both files for layout, structure, and interactions.
- Code must visually and interactively match the references. Strictly adhere to spacing, alignment, and content.
- Do not improvise or invent UI for referenced screens. For screens without references, follow master style guidelines.

**Style & Design Guidelines:**
- Brand Color Palette:
    - Deep Green (Primary): #24543A — for headers, buttons, key actions.
    - Muted Gold (Accent): #C8A55A — highlights, icons, focus rings.
    - Off-White (Background): #F4F0E8 — backgrounds, cards.
    - Charcoal Text: #1E1E1E — body text.
    - Warm Grey: #6F6A61 — metadata, secondary labels.
- Visual Style: Clean, modern, nature-inspired. Use Liquid Glass styling—translucent panels, gradients, subtle depth.
- Typography: Geometric sans-serif (Inter, SF Pro).
- Layout: Modular card-based UI, responsive grids, highly readable and accessible.
- Interactions: Smooth transitions, modern micro-animations, meaningful feedback.
- Accessibility: High-contrast support, scalable text, voice-over compatibility.

**MCP Tools & Integration Instructions:**
- For documentation, code references, or gathering technical resources, always use the **ref MCP tool**—supporting design files, private repos, PDFs, and Markdown docs.
- For database interactions (authentication, user data, routines, diary, media), always use the **Supabase MCP tool**. Never bypass this tool for DB access.
- For all payment, subscription, or invoice operations, always use **Stripe MCP tool**.
- For all development and build operations related to Expo—including local development server management, mobile simulator automation, EAS (Expo Application Services) builds, cloud publishing, and OTA updates—always use the **Expo MCP server**. Leverage both its server-side and local capabilities for automation, debugging, package management, and seamless integration with EAS throughout the development lifecycle.
- Never custom-code these integrations—agents and code must use the designated MCP tools for all corresponding operations, ensuring maintainability, automation, and up-to-date best practices.

