# Karnali Smart Group — Mobile App

React Native + Expo (SDK 57, Expo Router) app built from the designs in `../app ui-ux`.

## Run

```bash
npm install
npx expo start        # scan the QR code with Expo Go (Android / iOS)
npx expo start --web  # browser preview (maps fall back to an OpenStreetMap embed)
```

## Screen flow

| # | Design | Route |
|---|--------|-------|
| 1 | Login | `/login` |
| 2 | Register | `/register` |
| 3 | Search | removed — sign in / sign up opens Track |
| 4 | Track | `/track` (first screen after sign in) |
| 5 | Add tracking modal | FAB on `/track` |
| 6 | My {short name} account | `/account` |
| 7 | My Account details | `/account-details` |
| 8 | Find Us map | `/find-us` |
| 9 | Details Form | `/details-form` (FAB on Account details) |
| 10 | Notify me by | `/notify` (Account → Notification Preferences) |
| 11 | More | `/more` |
| 12 | Leave eligible parcels | `/delivery-preferences` (Account → Delivery Preferences) |
| 13 | Offers | `/offers` |
| 14 | Search {short name} Branches | `/branches` (More → Branch List) |
| 15 | Services | `/services` |
| 16 | Contact Us | `/contact` |
| 17 | About Us | `/about` |

## Vendor portal

Sign in with **Vendor** selected to open the vendor app (designs in `../vendor ui-ux`):

| # | Design | Route |
|---|--------|-------|
| 1 | Dashboard | `/vendor` |
| 2 | Orders | `/vendor/orders` |
| 3 | Accounts | `/vendor/accounts` |
| 4 | Actions | `/vendor/actions` |
| 5 | Reports | `/vendor/reports` |
| 6 | Navigation drawer | ☰ on any vendor screen |
| 7 | Resources | `/vendor/resources` (drawer) |

Code: `src/app/vendor/` (routes), `src/components/portal/` (header, chips, drawer, tab bar, icons), `src/data/vendor.ts` (sample data + totals), `src/state/vendor-state.tsx`.

## Rider and Admin portals

Sign in with **Rider** or **Admin** selected. They share one operations data set, so a rider's delivery shows up on the admin dashboard straight away.

- Rider: `/rider` — Home, Tasks, Route, Wallet, Account; task detail at `/rider/task/[id]`.
- Admin: `/admin` — Dashboard, Shipments, Dispatch, Fleet, Finance; the drawer adds Reports, Live Fleet Map, Returns & Exceptions, Support Tickets, Merchants, Hubs, Rate Card, Announcements, Staff & Roles, Audit Log, Branding & Appearance, Settings.
- Code: `src/data/ops.ts` (model, sample network, calculations), `src/state/ops-state.tsx` (store), `src/components/portal/` (shared design kit), `src/components/admin/`, `src/components/rider/`.

See `PROJECT_STATUS.md` for the full feature list.

## Branding & theming (white label)

Admin → **Branding & Appearance** (`/admin/branding`) changes, at runtime and for every role:

- App name, short name and tagline
- Brand logo (wide, for white backgrounds) and app icon (square) — uploaded from the photo library, resized and stored as data URIs
- Theme colour: 8 presets (Teal is the default) or any hex colour; colours too light for white text are darkened automatically
- Font (Plus Jakarta Sans, Poppins, Nunito or the system font) and text size (Compact / Default / Large)
- Contact details and social links shown on Contact Us and About Us

How it works:

- `src/state/branding-state.tsx` stores the settings (`useBranding()` / `useBrand()`).
- `src/theme/` turns them into a theme: `buildPalette()` derives every brand shade from one colour, `fonts.ts` loads the chosen family, `ThemeProvider` shares it.
- Styles are written with `makeStyles(({ colors: C }) => ({ … }))` and read with `useStyles()`; inline colours come from `useColors()`. Never hard-code brand hex values.
- Always import `Text` / `TextInput` from `@/components/text`: they map `fontWeight` to the right font file and apply the text size.
- The home-screen icon and name come from `app.json` / `assets/` and change only with a new build.

Demo names live in `src/constants/identity.ts` (`Hasta Pun` for the customer, vendor shop and admin). The vendor ID is a random 6-digit number created on first launch.

## Structure

- `src/app/` — routes (Expo Router). `(tabs)/` holds Track / Find Us / Account / More.
- `src/theme/` — palette, colour maths, fonts, presets, `ThemeProvider`, `makeStyles`.
- `src/components/` — `text.tsx` (themed Text), header, inputs, buttons, tab bar, SVG icons, brand logo, maps.
- `src/data/` — branches, provinces/districts, services, about text and default contact details.
- `src/state/` — app, vendor, operations and branding stores; `persist.ts` is the shared load/save hook.
- `src/utils/` — formatting, links, route-param guards (`params.ts`), ids, logo upload (`brand-image.ts`).

## Not wired to a backend yet

- Sign in / register only validate input locally — connect them to the KSG auth API.
- Tracking numbers are stored on the device; no live status is fetched.
- `src/data/branches.ts` is sample data with approximate town coordinates — replace with the branch API.
- Branding settings are saved on the device that changed them. Load them from the backend so every user sees the same branding.
- Before a store build, add a Google Maps API key for Android (`react-native-maps` config plugin). The launcher icon, adaptive icon, splash and favicon in `assets/` use the teal brand mark; swap them for final artwork if needed.
