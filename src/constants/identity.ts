/**
 * Placeholder identity for the demo accounts until sign-in returns real profiles.
 *
 * Change `DEMO_PERSON_NAME` here to rename the customer, the vendor shop and the admin in one
 * place. Each can also be renamed inside the app: customers in Account Details, vendors in
 * Profile, and the admin in Admin → Settings.
 */
export const DEMO_PERSON_NAME = 'Hasta Pun';

/** Vendor shop name for new installs (Vendor → Profile edits it). */
export const DEMO_VENDOR_BUSINESS_NAME = DEMO_PERSON_NAME;

/** Email of the demo Super Admin staff record. */
export const DEMO_ADMIN_EMAIL = 'hasta.pun@ksg.example';

/** Names used by earlier builds, migrated to the ones above when saved data loads. */
export const LEGACY_NAMES = {
  vendorBusiness: 'Trending Shop Nepal',
  vendorId: '16500',
  admin: 'Sunita Karki',
  adminEmail: 'sunita.karki@ksg.example',
  merchantOwner: 'Aakash Rai',
} as const;
