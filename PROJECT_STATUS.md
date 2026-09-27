# Karnali Smart Group App — Status Report & Next Steps

_Last updated: 2026-09-28_

## 1. Summary

This is the Karnali Smart Group courier mobile app, built with React Native and Expo (SDK 57, Expo Router). The code for all 17 screens in `app ui-ux/` is written, in the requested screen order.

**Status:** code complete, installed, and passing all checks. The project now lives at `C:\Users\amrit\Downloads\courier\mobile app` (moved off the USB drive). Dependencies are installed; typecheck, lint and `expo-doctor` pass, and the Android and web bundles build. It has **not yet been opened on a phone**.

| Area | Status |
|------|--------|
| Project setup (Expo + Expo Router + TypeScript) | Done |
| 17 screens (UI + navigation) | Done — not yet tested |
| Shared components (header, inputs, buttons, tab bar, icons, logo) | Done |
| Data saved on the device | Done |
| Dependency install | Done |
| Extra native packages (maps, svg, storage, date picker) | Done |
| Typecheck / lint / expo-doctor / bundle build | Done — all pass |
| Run on phone | **Not done** |
| Backend / API connection | **Not started** |
| App icon, splash screen, store build | **Not started** |

---

## 2. What is completed

### Screens (in design order)

| # | Design folder | Screen file | How to reach it |
|---|---------------|-------------|-----------------|
| 1 | karnali_smart_group_login_screen | `src/app/login.tsx` | App start (signed out) |
| 2 | karnali_smart_group_register_screen | `src/app/register.tsx` | Login → Register |
| 3 | karnali_smart_group_search_screen | — (removed on request, 2026-09-28) | — |
| 4 | karnali_smart_group_track_screen | `src/app/(tabs)/track.tsx` | First screen after Sign In / Sign Up |
| 5 | screen_5 add_tracking_modal | `src/components/add-tracking-modal.tsx` | Red + button on Track |
| 6 | screen_6 my_ksg_account | `src/app/(tabs)/account.tsx` | Account tab |
| 7 | screen_7 my_account_details | `src/app/account-details.tsx` | Account → Account Details |
| 8 | screen_8 find_us_map_screen | `src/app/(tabs)/find-us.tsx` | Find Us tab |
| 9 | screen_9 details_form | `src/app/details-form.tsx` | Account Details → + button |
| 10 | screen_10 notify_me_by | `src/app/notify.tsx` | Account → Notification Preferences |
| 11 | screen_11 more_screen | `src/app/(tabs)/more.tsx` | More tab |
| 12 | screen_12 leave_eligible_parcels | `src/app/delivery-preferences.tsx` | Account → Delivery Preferences |
| 13 | screen_13 offers_screen | `src/app/offers.tsx` | More → Offers |
| 14 | screen_14 search_ksg_branches | `src/app/branches.tsx` | More → Branch List |
| 15 | screen_15 services | `src/app/services.tsx` | More → Services |
| 16 | screen_16 contact_us | `src/app/contact.tsx` | More → Contact Us (also Services → Get Started) |
| 17 | screen_17 about_us | `src/app/about.tsx` | More → About Us |

### Vendor portal (designs in `vendor ui-ux/`)

Choosing **Vendor** on Login opens a separate vendor app. It is built from the 7 vendor designs, in the same order:

| # | Design folder | Screen file | How to reach it |
|---|---------------|-------------|-----------------|
| 1 | screen_1 dashboard | `src/app/vendor/index.tsx` | First screen after a Vendor sign-in |
| 2 | screen_2 orders | `src/app/vendor/orders.tsx` | Orders tab |
| 3 | screen_3 accounts | `src/app/vendor/accounts.tsx` | Accounts tab |
| 4 | screen_4 actions | `src/app/vendor/actions.tsx` | Actions tab |
| 5 | screen_5 reports | `src/app/vendor/reports.tsx` | Report tab |
| 6 | screen_6 navigation_drawer | `src/components/vendor/drawer.tsx` | ☰ button on any vendor screen |
| 7 | screen_7 resources | `src/app/vendor/resources.tsx` | Drawer → Resources |

What works:
- **Dashboard:** greeting that changes with the time of day, shop name and Vendor ID, order counts, the four order values, today's and unclosed comment counts. All figures are calculated from the order and comment data. Tapping a card opens the matching list.
- **Orders:** Orders / Warehouse / RTV's / Unattended chips, search by order number, receiver, phone or branch, filter by status, fragile badge.
- **Accounts:** Payments with COD, Charge, Returned, Net, COD Transferred and Balance. Net and Balance are calculated, and the status badge follows from the balance. Also a COD Transfers tab, search, a status filter, and "Order Detail", which opens that order in Orders.
- **Actions:** Comments / Logs / Tickets. Comments are split into Unclosed and Actions; "Mark As Read" moves a comment across, is saved on the phone, and updates the Dashboard count. There is also a date filter and a newest/oldest sort.
- **Reports:** Sales Report and Daily Order Report, start and end date pickers, a 31-day limit with an error message, and the Total Summary grids. All figures are calculated for the chosen dates.
- **Drawer:** slides in; the current screen is highlighted; Android Back closes it. It has Edit (profile), Customers, Manage Staffs, Check App Update and Rate Our App (open the store listing), Support Center (Contact Us), and Log out.
- **Resources:** branch list grouped A–Z with search, branch code, region, phone (tap to call) and areas covered.
- Vendors cannot open customer screens, and customers cannot open vendor screens.

### Features that work in the code

- **Login / Register:** account type selector on Login (Customer / Vendor / Admin, saved with the session), email and password checks, show/hide password, error messages, "Forgot Password?" hint. Register always creates a Customer account.
- **Auth routing:** `Stack.Protected` guards in `src/app/_layout.tsx`. Signing in or up opens the Track tab; signing out opens Login; signed-out users cannot open app screens and signed-in users cannot go back to Login.
- **Bottom tabs:** Track, Find Us, Account and More, with the red active tab as in the designs.
- **Track:** empty-state artwork, add tracking numbers through the pop-up (duplicates are blocked), list of tracked parcels, delete a parcel.
- **Find Us:** map of Nepal with red branch pins, search box that zooms to a branch, zoom + / − buttons.
- **Account:** menu rows, Sign out, Nepal skyline artwork.
- **Account Details:** empty state until the form is filled in, then a summary of your details.
- **Details Form:** Name, Surname, Date of birth (date picker), Email, Province → District lists (all 7 provinces and 77 districts), Municipality, Ward No. Saves as you type.
- **Notify me by:** email and phone checkboxes plus Submit.
- **Leave eligible parcels:** safe-place checkbox, place and time pickers, Submit.
- **Offers:** category filter, empty state.
- **Branch List:** numbered list in the design's layout, with search.
- **Services:** 6 swipeable slides with dots, "Get Started" button.
- **Contact Us:** map pin at Tinkune, contact card, directions button, tap-to-email and tap-to-call.
- **About Us:** 7 sections that expand and collapse, 6 social links.
- **Data kept after closing the app** (AsyncStorage): login state, tracking numbers, details, notification and delivery preferences.

### Project files

- `src/app/` — screens (Expo Router)
- `src/components/` — header, inputs, buttons, tab bar, icons, logo, maps, date field
- `src/data/` — branches, provinces/districts, services, about and contact content
- `src/state/app-state.tsx` — app data and saving to the device
- `src/constants/theme.ts` — colours
- `app.json` — app name "Karnali Smart Group", package `com.karnalismartgroup.app`
- `README.md` — how to run the app

### Changes from the designs (please confirm)

1. **One logo on every screen.** The logo differs between design screens, so the Login screen version is used everywhere.
2. **Typos fixed:** "Distirct" → "District", "your're" → "you're", "arn't" → "aren't".
3. **No fake phone chrome.** The designs show a phone status bar and Android buttons; the real phone draws these itself.
4. **Search screen removed** (your request). After sign-in the app opens Track directly.
5. **Details Form has no Save button**, as in the design. It saves every change automatically.
6. **Extra content was written.** Only one Services slide ("Import & export") exists in the design. I wrote the other 5 slides and all About Us answers. Please review or replace this text.
7. **Account type on Login** (Customer / Vendor / Admin) was added on request; it is not in the designs. The Account screen shows "Signed in as … · <type>". Vendors get the vendor portal; Admins still see the customer screens (there are no admin designs yet).
8. **Vendor screens without designs:** Customers, Manage Staffs and Profile (the drawer's Edit button) use the vendor style with simple content. The Price List and Package Code tabs in Resources, and the Tickets tab in Actions, show "coming soon" or empty messages. The "+" buttons on Dashboard and Orders explain that creating orders is coming soon.
9. **Vendor sample data:** the orders, payments and comments in `src/data/vendor.ts` copy the figures in the designs. Three orders and some comments were added so the lists and totals are complete (for example, Rs. 291 total value).

---

## 3. What is remaining

### A. Must do before the app can run

- [x] Move the project off the USB drive (E:) to the C: SSD
- [x] Install dependencies (`npm install`)
- [x] Install the extra native packages: `react-native-svg`, `react-native-maps`, `@react-native-async-storage/async-storage`, `@react-native-community/datetimepicker`
- [x] Run the typecheck (`npx tsc --noEmit`) and lint (`npx expo lint`), and fix any errors
- [x] `npx expo-doctor` (21/21 checks pass) and `npx expo export` for Android and web (both build)
- [ ] Open the app on a phone in Expo Go and check every screen against its `screen.png`

### B. Connect to the real Karnali Smart Group system (backend)

- [ ] **Login / Register:** call the real KSG login API. Right now any valid email with a 6+ character password is accepted, for any account type. The server must check that the account really has the chosen type (Vendor / Admin).
- [ ] **Vendor API:** replace the `SAMPLE_*` data in `src/data/vendor.ts` (profile, orders, payments, comments) with the KSG vendor API. Screens already calculate every total from these records.
- [ ] **Vendor extras:** create order, price list, package codes, tickets, customers and staff management need API endpoints and designs.
- [ ] **Admin screens:** decide what admins see. Today they get the customer screens.
- [ ] **Forgot Password:** connect to the password-reset API.
- [ ] **Tracking:** fetch live parcel status for each tracking number. Right now each parcel only shows "Awaiting update".
- [ ] **Branches:** replace the sample list in `src/data/branches.ts` with the real KSG branch list and locations. Only the first 6 branches come from the design.
- [ ] **Details Form, notification and delivery preferences:** save them to the user's KSG account, not only on the phone.
- [ ] **Offers:** load real offers from the server.
- [ ] **Social links:** check the Facebook, Instagram, LinkedIn and Twitter links in `src/data/content.ts` (they are guesses).

### C. Before publishing to the Play Store / App Store

- [ ] Add a Google Maps API key for Android (react-native-maps config in `app.json`)
- [ ] Replace the Expo placeholder app icon and splash images in `assets/images/` with the KSG logo
- [ ] Set up EAS Build (`npx eas-cli@latest build`)
- [ ] Test on real Android and iPhone devices

---

## 4. What to do next (step by step)

Steps 1–4 are done (2026-09-28).

**Step 1 — Clean up before moving.**
Delete `karnali-smart-group\node_modules`. It is a broken, half-finished install (about 2.3 GB) and not worth copying.

**Step 2 — Move the folder.**
Copy the whole `mobile app` folder (including `app ui-ux` and `karnali-smart-group`) to your SSD, for example `C:\projects\courier\mobile app`.

**Step 3 — Install everything.** Open a terminal in the new `karnali-smart-group` folder:

```bash
npm install
npx expo install react-native-svg react-native-maps @react-native-async-storage/async-storage @react-native-community/datetimepicker
```

**Step 4 — Check the code:**

```bash
npx tsc --noEmit
npx expo lint
```

Result: the only errors were the text-input `outlineStyle: 'none'` lines (React Native 0.86 types `outlineStyle` but does not allow `'none'`). They were changed to `outlineWidth: 0`, which hides the web focus ring and is valid on phones too. ESLint (`eslint.config.js`, `eslint-config-expo`) was added by `expo lint` on first run.

**Step 5 — Run on your phone:**

```bash
npx expo start
```

Install **Expo Go** from the Play Store or App Store and scan the QR code. The phone and computer must be on the same Wi-Fi.

**Step 6 — Test the full flow:**
Login (pick account type) → Register → Sign Up → Track → + Add tracking → Account → Account Details → + Details Form → back → Delivery Preferences → Notification Preferences → Sign out. Then check the Find Us, More, Branch List, Offers, Services, Contact and About screens.

**Step 7 — Compare with the designs.**
Open each `app ui-ux/*/screen.png` next to the phone and note any spacing or colour differences to fix.

**Step 8 — Backend.**
Get the KSG API details (login, tracking, branches) and connect them (Section 3B).

**Step 9 — Release.**
Complete Section 3C.

---

## 5. Known issues and notes

- **Web preview** (`npx expo start --web`) works, but the maps there are a simple OpenStreetMap embed with a single pin, because react-native-maps is not supported on web.
- **Slow npm installs.** On this PC, npm's IPv6 connections to the npm registry stalled during installs. If `npm install` hangs, try:
  `set NODE_OPTIONS=--dns-result-order=ipv4first` (Command Prompt) and then run `npm install` again.
- **Terminal warnings fixed (2026-09-28):** `"shadow*" style props are deprecated` and `props.pointerEvents is deprecated`. All shadows now use `boxShadow` via the `shadow()` helper in `src/constants/theme.ts`, and `pointerEvents` moved into styles. A headless run of every screen logs no warnings or errors.
