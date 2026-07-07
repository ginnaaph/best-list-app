# Legal Screens Design

## Scope

Add two static Expo Router screens:

- `app/privacy.tsx` at `/privacy`
- `app/terms.tsx` at `/terms`

Update the Privacy policy and Terms of service rows in `app/settings.tsx` and the matching links in `components/auth-screen.tsx` to navigate to these routes. Preserve all other routes, Settings behavior, authentication behavior, and existing uncommitted work.

## Screen Design

Both screens will directly render the approved legal copy as JSX. They will match `app/credits.tsx` by using:

- `SafeAreaView` with the existing light background
- A `ScrollView` with `contentContainerClassName="grow px-5 pb-8 pt-2"`
- The circular bordered Ionicons `chevron-back` button calling `router.back()`
- A centered `font-display` screen title
- NativeWind classes only, except the permitted inline `SafeAreaView` style

Legal content will use `font-body`. Section headings will be bold and slightly larger than paragraph text. Lists will render as separate bullet rows rather than markdown text. The supplied wording and ordering will remain unchanged.

The Terms screen's section 7 will render the words “Privacy Policy” as an Expo Router link to `/privacy`. The surrounding sentence will remain unchanged.

## Navigation

The two Settings rows will use their existing `onPress` mechanism:

- Privacy policy calls `router.push("/privacy")`
- Terms of service calls `router.push("/terms")`

The obsolete external URL values will be removed from those rows. No shared Settings renderer behavior or other row will change.

The matching legal links in `components/auth-screen.tsx` will call `router.push("/privacy")` and `router.push("/terms")` instead of opening the external Google Sites URLs. No other authentication screen behavior or styling will change.

## Compatibility

The implementation will use only Expo Router, Ionicons, and cross-platform React Native primitives: `Pressable`, `ScrollView`, `Text`, and `View`. It will not use native-only APIs, so both screens remain compatible with native builds and Expo web export/Vercel routing.

## Verification

Add focused source-contract tests before implementation to verify:

- Both route files exist and contain the expected screen structure and legal content markers.
- Settings routes the two legal rows internally.
- The authentication screen routes its two legal links internally.
- Terms links “Privacy Policy” to `/privacy`.

Run the focused test in its failing and passing states, then run `npm run verify`, `git diff --check`, and an Expo web export. Existing unrelated uncommitted files will not be modified.
