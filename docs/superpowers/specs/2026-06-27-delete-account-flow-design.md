# Delete Account Flow Design

## Goal

Add the screenshot-matched, frontend-only three-step delete-account flow to the existing Settings screen without changing its current content or layout.

## Behavior

- Tapping the existing **Delete account** control opens the warning sheet.
- **Continue** advances to confirmation; **Cancel** closes and resets the flow.
- Confirmation accepts an exact, case-sensitive `DELETE` value. Only that value turns the input border green and enables the red **Delete my account** button.
- **Back** returns from confirmation to warning and clears the confirmation value.
- Confirming advances to the success sheet. No account or data deletion occurs.
- **Back to sign in** closes and resets the flow, then replaces the current route with `/sign-in`.
- Tapping the dark overlay and using the Android hardware-back action do not dismiss the modal. Dismissal and navigation happen only through the rendered buttons.

## Architecture

Create `components/delete-account-sheet.tsx` with a typed `warning | confirmation | success` step state and local confirmation text. The component receives `visible`, `onClose`, and `onBackToSignIn` callbacks so Settings owns only visibility and navigation.

Follow the existing transparent native `Modal` pattern in `components/verification-modal.tsx`: `animationType="slide"`, a keyboard-aware full-screen dim layer, and a rounded top sheet. The overlay is a non-interactive `View` rather than the dismissible `Pressable` used by the verification modal. Styling remains entirely in NativeWind classes, including the keyboard-avoidance container.

Modify only the existing Settings delete control to make it an accessible `Pressable`, render the sheet next to the unchanged screen content, and call `router.replace("/sign-in")` after the success action.

## Visual Treatment

- White sheets with a rounded top edge, centered grabber, and dark translucent overlay.
- Warning uses a pale-red circular trash icon, centered title/body, red primary button, and light-gray secondary button.
- Confirmation uses left-aligned copy and input, gray disabled state, exact-match green input state, red enabled state, and a light-gray Back button.
- Success uses a pale-green circular check icon, centered copy, and black primary button.
- Destructive red is `#DC2626`; success green uses the app's Basil Green family; the unchanged Settings screen supplies the warm background behind the overlay.

## Testing and Verification

- Add focused source-level tests using the repo's Node test runner pattern to verify the modal structure, three step states, exact confirmation rule, non-dismissible overlay/back request, and sign-in callback.
- Run the focused test first and observe the expected failure before implementation.
- Run the focused test after implementation, then Expo lint, TypeScript checking, `git diff --check`, and a scoped diff review.

## Scope Exclusions

- No Supabase deletion or auth mutation.
- No new dependencies.
- No changes to existing Settings content, spacing, sections, header, or navigation outside wiring the current delete control.
