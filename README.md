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
| 6 | My KSG account | `/account` |
| 7 | My Account details | `/account-details` |
| 8 | Find Us map | `/find-us` |
| 9 | Details Form | `/details-form` (FAB on Account details) |
| 10 | Notify me by | `/notify` (Account → Notification Preferences) |
| 11 | More | `/more` |
| 12 | Leave eligible parcels | `/delivery-preferences` (Account → Delivery Preferences) |
| 13 | Offers | `/offers` |
| 14 | Search KSG Branches | `/branches` (More → Branch List) |
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
- Admin: `/admin` — Dashboard, Shipments, Dispatch, Fleet, Finance; the drawer adds Reports, Live Fleet Map, Returns & Exceptions, Support Tickets, Merchants, Hubs, Rate Card, Announcements, Staff & Roles, Audit Log, Settings.
- Code: `src/data/ops.ts` (model, sample network, calculations), `src/state/ops-state.tsx` (store), `src/components/portal/` (shared design kit), `src/components/admin/`, `src/components/rider/`.

See `PROJECT_STATUS.md` for the full feature list.

## Structure

- `src/app/` — routes (Expo Router). `(tabs)/` holds Track / Find Us / Account / More.
- `src/components/` — header, inputs, buttons, tab bar, SVG icons, brand logo, maps.
- `src/data/` — branches, provinces/districts, services, about and contact content.
- `src/state/app-state.tsx` — app state persisted with AsyncStorage.

## Not wired to a backend yet

- Sign in / register only validate input locally — connect them to the KSG auth API.
- Tracking numbers are stored on the device; no live status is fetched.
- `src/data/branches.ts` is sample data with approximate town coordinates — replace with the branch API.
- Before a store build, add a Google Maps API key for Android (`react-native-maps` config plugin) and replace the Expo placeholder icon/splash images in `assets/images`.
