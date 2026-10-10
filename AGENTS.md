# BlisterLens — AI Agent Guidelines & Architecture

BlisterLens is an Expo (React Native + TypeScript) mobile application created as a BCA final-year project for **AI Tools and Techniques**.

> **Product Identity**: BlisterLens  
> **Tagline**: Turn a car photo into a pocket-sized collectible.  
> **Visual Series**: "Street Shelf ’90"  
> **Core Aesthetic**: Original 90s toy-aisle blister packaging nostalgia (never imitate trademarked toy brands or flame logos).

---

## CRITICAL ARCHITECTURAL RULES

```text
shadcn/ui, 21st.dev and GSAP are web-only references and must not be used as React Native dependencies.

Use react-native-reanimated for React Native animation.
```

- **Clean Boundary Between AI and Local Determinism**:
  - Gemini Vision answers: *What car is this? (make, model, variant, colour_name, colour_hex, bounding box, confidence, top 3 alternatives)*.
  - Local runtime answers: *BBox validation, image cropping, colour contrast calculation, deterministic rarity calculation, card canvas rendering, local storage, sharing*.
  - Never outsource cheap, deterministic computations to an AI model.

- **Direct API Key Safety**:
  - The Gemini API key (`EXPO_PUBLIC_GEMINI_API_KEY`) is stored only in `.env` (gitignored).
  - Calling Gemini directly from the mobile app is strictly a **private student demo shortcut**. For production or public deployment, requests must be proxied through a secured serverless backend.
  - NEVER print, log, or hardcode the API key in source files or transcripts.

---

## MILESTONES & WORKFLOW GATING

Work proceeds strictly through sequential milestones. **STOP after every milestone**:
1. Demonstrate the feature running.
2. Summarize exact changes made.
3. Run `@ponytail-review` to hunt over-engineering and unnecessary abstractions.
4. Run a dedicated Safety / Bug / Permission review pass.
5. Report both review results.
6. Await explicit user approval before moving to the next milestone.

### Milestone Map
- **M1**: Scaffold, Branding, Navigation, 90s Toy-Aisle Theme, BlisterCard shell.
- **M2**: Image Capture / Gallery Selection, Resize (1024px), Gemini Vision Structured Output with runtime validation and error boundaries.
- **M3**: Bounding Box Normalization & Local Crop, 90s Blister Card Generation, Dynamic Colour Contrast, Deterministic Rarity Engine.
- **M4**: Low Confidence Confirmation UX (< 60%), ViewShot Card Export, Local Sharing (`expo-sharing`), Local Storage (`AsyncStorage`).
- **M5**: 20-Photo Empirical Verification, Architecture Documentation, Technical Trade-off Analysis.

---

## DEVELOPMENT TOOLING & COMMANDS

```bash
npx expo start              # Start the Metro dev server
npx expo lint               # Run linter
npx tsc --noEmit            # TypeScript typecheck
```

- When adding Expo-compatible packages, use `npx expo install <package>`.
- Always check that libraries run in Expo without requiring custom native compilation unless documented.
