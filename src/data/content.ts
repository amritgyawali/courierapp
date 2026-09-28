export const PROVINCES: Record<string, string[]> = {
  'Koshi Province': [
    'Bhojpur', 'Dhankuta', 'Ilam', 'Jhapa', 'Khotang', 'Morang', 'Okhaldhunga',
    'Panchthar', 'Sankhuwasabha', 'Solukhumbu', 'Sunsari', 'Taplejung', 'Terhathum', 'Udayapur',
  ],
  'Madhesh Province': ['Bara', 'Dhanusha', 'Mahottari', 'Parsa', 'Rautahat', 'Saptari', 'Sarlahi', 'Siraha'],
  'Bagmati Province': [
    'Bhaktapur', 'Chitwan', 'Dhading', 'Dolakha', 'Kathmandu', 'Kavrepalanchok', 'Lalitpur',
    'Makwanpur', 'Nuwakot', 'Ramechhap', 'Rasuwa', 'Sindhuli', 'Sindhupalchok',
  ],
  'Gandaki Province': [
    'Baglung', 'Gorkha', 'Kaski', 'Lamjung', 'Manang', 'Mustang', 'Myagdi',
    'Nawalpur', 'Parbat', 'Syangja', 'Tanahun',
  ],
  'Lumbini Province': [
    'Arghakhanchi', 'Banke', 'Bardiya', 'Dang', 'Eastern Rukum', 'Gulmi', 'Kapilvastu',
    'Palpa', 'Parasi', 'Pyuthan', 'Rolpa', 'Rupandehi',
  ],
  'Karnali Province': [
    'Dailekh', 'Dolpa', 'Humla', 'Jajarkot', 'Jumla', 'Kalikot', 'Mugu', 'Salyan', 'Surkhet', 'Western Rukum',
  ],
  'Sudurpashchim Province': [
    'Achham', 'Baitadi', 'Bajhang', 'Bajura', 'Dadeldhura', 'Darchula', 'Doti', 'Kailali', 'Kanchanpur',
  ],
};

export const LEAVE_PLACES = ['Front Porch', 'Back Door', 'Garage', 'Reception / Guard House'];

export const DELIVERY_TIMES = [
  'Morning (9:00 AM - 12:00 PM)',
  'Afternoon (12:00 PM - 3:00 PM)',
  'Evening (3:00 PM - 6:00 PM)',
];

export const OFFER_CATEGORIES = ['All', 'Domestic', 'International', 'E-commerce'];

export const SERVICES = [
  {
    title: 'Import & export',
    body: 'We can import & export items from most countries to Nepal, including Australia, China, Europe, India US, UK, UAE at most affordable rates.',
  },
  {
    title: 'Domestic delivery',
    body: 'Send parcels and documents to every corner of Nepal through our nationwide branch network, fast and safely.',
  },
  {
    title: 'Cash on delivery',
    body: 'We collect payment from your customers at the doorstep and settle it back to you quickly and transparently.',
  },
  {
    title: 'Doorstep pickup',
    body: 'Schedule a pickup and our riders will collect your parcels from your home, shop or warehouse.',
  },
  {
    title: 'Warehousing',
    body: 'Store your inventory with us and let our team pick, pack and dispatch your orders the same day.',
  },
  {
    title: 'E-commerce logistics',
    body: 'Plug your online store into our delivery network and track every order from pickup to delivery.',
  },
];

/** About Us answers. `{brand}` is replaced with the app name set in Admin → Branding. */
export const ABOUT_SECTIONS = [
  {
    title: 'What we do:',
    body: '{brand} is a courier and logistics company delivering parcels, documents and e-commerce orders across Nepal and internationally.',
  },
  {
    title: 'Where do we ship to:',
    body: 'We deliver to all 77 districts of Nepal through our branch network, and ship internationally to and from countries including Australia, China, Europe, India, the US, the UK and the UAE.',
  },
  {
    title: 'What makes us special:',
    body: 'Real-time tracking, doorstep pickup, cash on delivery and a friendly support team that answers when you call.',
  },
  {
    title: 'How does it work:',
    body: 'Book a delivery, hand your parcel to our rider or drop it at the nearest branch, and track it all the way to your customer using your tracking number.',
  },
  {
    title: 'Grow your e-commerce and other business with us:',
    body: 'Merchants get pickup, cash on delivery, fast settlements and a dashboard to manage every order in one place.',
  },
  {
    title: 'Our Mission:',
    body: 'To make moving anything, anywhere in Nepal simple, reliable and affordable.',
  },
  {
    title: 'Who are we:',
    body: 'A team of logistics professionals and riders based in Kathmandu, working every day to keep Nepal moving.',
  },
];

/** Head office pin on the Contact Us map. */
export const HQ_LOCATION = { latitude: 27.6866, longitude: 85.3486 };

/**
 * Contact details shown on Contact Us and About Us until an admin edits them in
 * Admin → Branding & Appearance (the social links are unverified placeholders).
 */
export const DEFAULT_SUPPORT_CONTACTS = {
  phone: '+977 01 519 9684',
  salesEmail: 'sales@karnalismartgroup.com',
  supportEmail: 'support@karnalismartgroup.com',
  address: 'Karnali Smart Group Building, 51 Muni Bhairab Marga, Tinkune, KMC-32, Kathmandu, Nepal',
  website: 'https://karnalismartgroup.com',
  facebook: 'https://www.facebook.com/karnalismartgroup',
  instagram: 'https://www.instagram.com/karnalismartgroup',
  linkedin: 'https://www.linkedin.com/company/karnalismartgroup',
  twitter: 'https://twitter.com/karnalismartgroup',
};

export type SupportContacts = typeof DEFAULT_SUPPORT_CONTACTS;
