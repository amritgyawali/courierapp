import { PROVINCES } from '@/data/content';

export type Branch = {
  name: string;
  municipality: string;
  district: string;
  latitude: number;
  longitude: number;
  phone?: string;
  /** Localities served by the branch. */
  areas?: string[];
};

// Sample branch network (approximate town coordinates). Replace with the live branch API.
const raw: Branch[] = [
  {
    name: 'AARUGHAT',
    municipality: 'AARUGHAT RURAL MUNICIPALITY',
    district: 'GORKHA',
    latitude: 28.04,
    longitude: 84.82,
    phone: '9701003362',
    areas: ['ARUGHAT BIDHUT CHOWK', 'ARUGHAT BUSPARK', 'PAHADI CHOWK', 'BAGAICHAI', 'BISHAL BAZZAR', 'ARUTHAR', 'MANGALTAR'],
  },
  { name: 'ADAMGHAT', municipality: 'GAJURI RURAL MUNICIPALITY', district: 'DHADING', latitude: 27.81, longitude: 84.87 },
  { name: 'AMARGADHI', municipality: 'AMARGADHI MUNICIPALITY', district: 'DADELDHURA', latitude: 29.3, longitude: 80.59 },
  { name: 'AMARDAHA', municipality: 'SUNWARSHI MUNICIPALITY', district: 'MORANG', latitude: 26.49, longitude: 87.49 },
  { name: 'AMARAI ARGHAKHANCHI', municipality: 'SHITAGANGA MUNICIPALITY', district: 'ARGHAKHANCHI', latitude: 27.95, longitude: 83.08 },
  { name: 'AMLEKHGUNJ', municipality: 'JITPUR SIMARA SUB-METROPOLITAN CITY', district: 'BARA', latitude: 27.28, longitude: 85.0 },
  { name: 'ANBUKHAIRENI', municipality: 'ANBUKHAIRENI RURAL MUNICIPALITY', district: 'TANAHUN', latitude: 27.86, longitude: 84.53 },
  { name: 'BAGLUNG', municipality: 'BAGLUNG MUNICIPALITY', district: 'BAGLUNG', latitude: 28.27, longitude: 83.59 },
  { name: 'BANEPA', municipality: 'BANEPA MUNICIPALITY', district: 'KAVREPALANCHOK', latitude: 27.63, longitude: 85.52 },
  { name: 'BARDIBAS', municipality: 'BARDIBAS MUNICIPALITY', district: 'MAHOTTARI', latitude: 27.0, longitude: 85.89 },
  { name: 'BESISAHAR', municipality: 'BESISAHAR MUNICIPALITY', district: 'LAMJUNG', latitude: 28.23, longitude: 84.38 },
  { name: 'BHAIRAHAWA', municipality: 'SIDDHARTHANAGAR MUNICIPALITY', district: 'RUPANDEHI', latitude: 27.51, longitude: 83.45 },
  { name: 'BHAKTAPUR', municipality: 'BHAKTAPUR MUNICIPALITY', district: 'BHAKTAPUR', latitude: 27.67, longitude: 85.43 },
  { name: 'BHARATPUR', municipality: 'BHARATPUR METROPOLITAN CITY', district: 'CHITWAN', latitude: 27.68, longitude: 84.43 },
  { name: 'BIRATNAGAR', municipality: 'BIRATNAGAR METROPOLITAN CITY', district: 'MORANG', latitude: 26.45, longitude: 87.27 },
  { name: 'BIRGUNJ', municipality: 'BIRGUNJ METROPOLITAN CITY', district: 'PARSA', latitude: 27.01, longitude: 84.88 },
  { name: 'BIRTAMOD', municipality: 'BIRTAMOD MUNICIPALITY', district: 'JHAPA', latitude: 26.64, longitude: 87.99 },
  { name: 'BUTWAL', municipality: 'BUTWAL SUB-METROPOLITAN CITY', district: 'RUPANDEHI', latitude: 27.7, longitude: 83.45 },
  { name: 'DAMAK', municipality: 'DAMAK MUNICIPALITY', district: 'JHAPA', latitude: 26.66, longitude: 87.7 },
  { name: 'DAMAULI', municipality: 'BYAS MUNICIPALITY', district: 'TANAHUN', latitude: 27.97, longitude: 84.27 },
  { name: 'DHANGADHI', municipality: 'DHANGADHI SUB-METROPOLITAN CITY', district: 'KAILALI', latitude: 28.7, longitude: 80.59 },
  { name: 'DHARAN', municipality: 'DHARAN SUB-METROPOLITAN CITY', district: 'SUNSARI', latitude: 26.81, longitude: 87.28 },
  { name: 'DHULIKHEL', municipality: 'DHULIKHEL MUNICIPALITY', district: 'KAVREPALANCHOK', latitude: 27.62, longitude: 85.55 },
  { name: 'GAUR', municipality: 'GAUR MUNICIPALITY', district: 'RAUTAHAT', latitude: 26.77, longitude: 85.27 },
  { name: 'GHORAHI', municipality: 'GHORAHI SUB-METROPOLITAN CITY', district: 'DANG', latitude: 28.04, longitude: 82.49 },
  { name: 'GORKHA', municipality: 'GORKHA MUNICIPALITY', district: 'GORKHA', latitude: 28.0, longitude: 84.63 },
  { name: 'GULARIYA', municipality: 'GULARIYA MUNICIPALITY', district: 'BARDIYA', latitude: 28.23, longitude: 81.35 },
  { name: 'HETAUDA', municipality: 'HETAUDA SUB-METROPOLITAN CITY', district: 'MAKWANPUR', latitude: 27.43, longitude: 85.03 },
  { name: 'ILAM', municipality: 'ILAM MUNICIPALITY', district: 'ILAM', latitude: 26.91, longitude: 87.93 },
  { name: 'ITAHARI', municipality: 'ITAHARI SUB-METROPOLITAN CITY', district: 'SUNSARI', latitude: 26.66, longitude: 87.28 },
  { name: 'JANAKPUR', municipality: 'JANAKPURDHAM SUB-METROPOLITAN CITY', district: 'DHANUSHA', latitude: 26.73, longitude: 85.93 },
  { name: 'KALAIYA', municipality: 'KALAIYA SUB-METROPOLITAN CITY', district: 'BARA', latitude: 27.03, longitude: 85.0 },
  { name: 'KATHMANDU', municipality: 'KATHMANDU METROPOLITAN CITY', district: 'KATHMANDU', latitude: 27.7172, longitude: 85.324 },
  { name: 'KAWASOTI', municipality: 'KAWASOTI MUNICIPALITY', district: 'NAWALPUR', latitude: 27.64, longitude: 84.12 },
  { name: 'LAHAN', municipality: 'LAHAN MUNICIPALITY', district: 'SIRAHA', latitude: 26.72, longitude: 86.48 },
  { name: 'LALITPUR', municipality: 'LALITPUR METROPOLITAN CITY', district: 'LALITPUR', latitude: 27.67, longitude: 85.32 },
  { name: 'MAHENDRANAGAR', municipality: 'BHIMDATTA MUNICIPALITY', district: 'KANCHANPUR', latitude: 28.96, longitude: 80.18 },
  { name: 'MALANGWA', municipality: 'MALANGWA MUNICIPALITY', district: 'SARLAHI', latitude: 26.86, longitude: 85.56 },
  { name: 'NEPALGUNJ', municipality: 'NEPALGUNJ SUB-METROPOLITAN CITY', district: 'BANKE', latitude: 28.05, longitude: 81.62 },
  { name: 'POKHARA', municipality: 'POKHARA METROPOLITAN CITY', district: 'KASKI', latitude: 28.21, longitude: 83.99 },
  { name: 'RAJBIRAJ', municipality: 'RAJBIRAJ MUNICIPALITY', district: 'SAPTARI', latitude: 26.54, longitude: 86.75 },
  { name: 'SURKHET', municipality: 'BIRENDRANAGAR MUNICIPALITY', district: 'SURKHET', latitude: 28.6, longitude: 81.63 },
  { name: 'TANSEN', municipality: 'TANSEN MUNICIPALITY', district: 'PALPA', latitude: 27.87, longitude: 83.54 },
  { name: 'TIKAPUR', municipality: 'TIKAPUR MUNICIPALITY', district: 'KAILALI', latitude: 28.53, longitude: 81.12 },
  { name: 'TULSIPUR', municipality: 'TULSIPUR SUB-METROPOLITAN CITY', district: 'DANG', latitude: 28.13, longitude: 82.3 },
  { name: 'URLABARI', municipality: 'URLABARI MUNICIPALITY', district: 'MORANG', latitude: 26.67, longitude: 87.62 },
  { name: 'WALING', municipality: 'WALING MUNICIPALITY', district: 'SYANGJA', latitude: 27.98, longitude: 83.78 },
];

export const BRANCHES = raw;

/** Short branch code, e.g. AARUGHAT → AARU1. */
export function branchCode(branch: Branch) {
  return `${branch.name.replace(/[^A-Z]/g, '').slice(0, 4)}1`;
}

/** Province the branch's district belongs to, e.g. GORKHA → GANDAKI. */
export function branchRegion(branch: Branch) {
  const district = branch.district.toLowerCase();
  const province = Object.keys(PROVINCES).find((p) => PROVINCES[p].some((d) => d.toLowerCase() === district));
  return province?.replace(/ Province$/, '').toUpperCase();
}

export function filterBranches(query: string) {
  const q = query.trim().toUpperCase();
  if (!q) return BRANCHES;
  return BRANCHES.filter(
    (b) => b.name.includes(q) || b.municipality.includes(q) || b.district.includes(q),
  );
}
