/**
 * Vendor portal icons. Paths are taken from the SVGs in `vendor ui-ux/*\/code.html`.
 * `S` draws outlined glyphs, `F` draws filled glyphs; children inherit the colour.
 */
import type { ReactNode } from 'react';
import Svg, { Circle, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';

export type VendorIconProps = { size?: number; color?: string };

function S({ size = 20, color = '#000', sw = 2, children }: VendorIconProps & { sw?: number; children: ReactNode }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round">
      {children}
    </Svg>
  );
}

function F({ size = 20, color = '#000', children }: VendorIconProps & { children: ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      {children}
    </Svg>
  );
}

// ---- Header ----

export const MenuIcon = (p: VendorIconProps) => (
  <S {...p} sw={2.2}>
    <Path d="M4 6h16M4 12h16M4 18h16" />
  </S>
);

export const InfoCircleIcon = (p: VendorIconProps) => (
  <S {...p} sw={1.9}>
    <Circle cx={12} cy={12} r={9.5} />
    <Path d="M12 8.25h.01M12 11.5v4.25" />
  </S>
);

export const MegaphoneIcon = (p: VendorIconProps) => (
  <F {...p}>
    <Path d="M20 2v3h-2V4h-1.5l-3.3 3.3c-.3.3-.7.5-1.2.5H8v4h4l3.3 3.3c.4.4.9.7 1.4.7H18v-1h2v3h-3.3c-.8 0-1.6-.3-2.1-.9L12.8 14H8c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2h4.8l1.8-1.8c.6-.6 1.3-.9 2.1-.9H20zm-15 7H3v2h2V9z" />
  </F>
);

export const ChevronRightIcon = (p: VendorIconProps) => (
  <S {...p} sw={2.5}>
    <Path d="M9 5l7 7-7 7" />
  </S>
);

export const ChevronDownIcon = (p: VendorIconProps) => (
  <S {...p} sw={2.2}>
    <Path d="M19 9l-7 7-7-7" />
  </S>
);

export const SortIcon = (p: VendorIconProps) => (
  <S {...p} sw={2.5}>
    <Path d="M7 10l5-5 5 5M7 14l5 5 5-5" />
  </S>
);

export const CloseIcon = (p: VendorIconProps) => (
  <S {...p} sw={2.5}>
    <Path d="M6 18L18 6M6 6l12 12" />
  </S>
);

export const PlusIcon = (p: VendorIconProps) => (
  <S {...p} sw={2.5}>
    <Path d="M12 4v16m8-8H4" />
  </S>
);

export const SearchIcon = (p: VendorIconProps) => (
  <S {...p} sw={2.2}>
    <Circle cx={11} cy={11} r={7} />
    <Line x1={21} y1={21} x2={16.65} y2={16.65} />
  </S>
);

export const SlidersIcon = (p: VendorIconProps) => (
  <S {...p}>
    <Path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
  </S>
);

export const FilterLinesIcon = (p: VendorIconProps) => (
  <F {...p}>
    <Path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
  </F>
);

// ---- Tab bar ----

export const HomeIcon = ({ filled, ...p }: VendorIconProps & { filled?: boolean }) =>
  filled ? (
    <F {...p}>
      <Path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </F>
  ) : (
    <S {...p} sw={1.8}>
      <Path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-7v6H4a1 1 0 0 1-1-1V9.5z" />
    </S>
  );

export const BagIcon = (p: VendorIconProps & { sw?: number }) => (
  <S {...p}>
    <Path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />
  </S>
);

export const CardIcon = ({ filled, ...p }: VendorIconProps & { filled?: boolean }) =>
  filled ? (
    <F {...p}>
      <Path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 5H4V7h16v2z" />
    </F>
  ) : (
    <S {...p} sw={1.8}>
      <Rect x={2} y={5} width={20} height={14} rx={2} />
      <Line x1={2} y1={10} x2={22} y2={10} />
    </S>
  );

export const FlagIcon = ({ filled, ...p }: VendorIconProps & { filled?: boolean }) =>
  filled ? (
    <F {...p}>
      <Path d="M4 2v20h2v-8h14l-2.5-5L20 4H6V2H4z" />
    </F>
  ) : (
    <S {...p} sw={1.8}>
      <Path d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
    </S>
  );

export const ReportIcon = ({ filled, ...p }: VendorIconProps & { filled?: boolean }) =>
  filled ? (
    <F {...p}>
      <Path d="M4 19h2V9H4v10zm6 0h2v-6h-2v6zm6 0h2v-3h-2v3zm4 2H2V3h2v16h18v2z" />
    </F>
  ) : (
    <S {...p} sw={1.8}>
      <Path d="M18 20V10M12 20V4M6 20v-6" />
    </S>
  );

// ---- Dashboard ----

export const CartIcon = (p: VendorIconProps) => (
  <F {...p}>
    <Path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
  </F>
);

export const TruckIcon = (p: VendorIconProps) => (
  <F {...p}>
    <Path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zm-.5 1.5l1.96 2.5H17V9.5h2.5zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
  </F>
);

export const TruckOutlineIcon = (p: VendorIconProps) => (
  <S {...p}>
    <Rect x={1} y={3} width={15} height={13} rx={1} />
    <Polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <Circle cx={5.5} cy={18.5} r={2.5} />
    <Circle cx={18.5} cy={18.5} r={2.5} />
  </S>
);

export const DocumentLinesIcon = (p: VendorIconProps) => (
  <F {...p}>
    <Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h10v2H7zm0 4h7v2H7z" />
  </F>
);

export const ShoppingBagFilledIcon = (p: VendorIconProps) => (
  <F {...p}>
    <Path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" />
  </F>
);

export const CheckIcon = (p: VendorIconProps & { sw?: number }) => (
  <S sw={2.5} {...p}>
    <Path d="M5 13l4 4L19 7" />
  </S>
);

export const UndoFilledIcon = (p: VendorIconProps) => (
  <F {...p}>
    <Path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
  </F>
);

export const DotsIcon = (p: VendorIconProps) => (
  <F {...p}>
    <Path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </F>
);

export const CalendarFilledIcon = (p: VendorIconProps) => (
  <F {...p}>
    <Path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
  </F>
);

export const CalendarGridIcon = (p: VendorIconProps) => (
  <F {...p}>
    <Path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zm-8 4h2v2H7zm4 4h2v2h-2zm4-4h2v2h-2z" />
  </F>
);

export const CalendarOutlineIcon = (p: VendorIconProps) => (
  <S {...p}>
    <Rect x={3} y={4} width={18} height={18} rx={2} />
    <Line x1={16} y1={2} x2={16} y2={6} />
    <Line x1={8} y1={2} x2={8} y2={6} />
    <Line x1={3} y1={10} x2={21} y2={10} />
  </S>
);

export const ChatFilledIcon = (p: VendorIconProps) => (
  <F {...p}>
    <Path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
  </F>
);

export const FolderIcon = (p: VendorIconProps) => (
  <F {...p}>
    <Path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
  </F>
);

// ---- Orders ----

export const BoxIcon = (p: VendorIconProps) => (
  <S {...p}>
    <Path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <Path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
  </S>
);

export const ReturnArrowIcon = (p: VendorIconProps) => (
  <S {...p}>
    <Path d="M9 14l-4-4 4-4" />
    <Path d="M5 10h11a4 4 0 110 8h-1" />
  </S>
);

export const AlertCircleIcon = (p: VendorIconProps) => (
  <S {...p}>
    <Circle cx={12} cy={12} r={9} />
    <Path d="M12 8v4M12 16h.01" />
  </S>
);

export const UserIcon = (p: VendorIconProps) => (
  <S {...p}>
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx={12} cy={7} r={4} />
  </S>
);

export const BranchBuildingIcon = (p: VendorIconProps) => (
  <S {...p}>
    <Rect x={4} y={2} width={16} height={20} rx={2} />
    <Path d="M9 22V2M8 6h2M14 6h2M8 10h2M14 10h2M8 14h2M14 14h2M8 18h2M14 18h2" />
  </S>
);

export const PhoneOutlineIcon = (p: VendorIconProps) => (
  <S {...p}>
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </S>
);

export const PinOutlineIcon = (p: VendorIconProps) => (
  <S {...p}>
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <Circle cx={12} cy={10} r={3} />
  </S>
);

export const ClockIcon = (p: VendorIconProps) => (
  <S {...p}>
    <Circle cx={12} cy={12} r={9} />
    <Path d="M12 7v5l3 2" />
  </S>
);

export const WineGlassIcon = (p: VendorIconProps) => (
  <S {...p}>
    <Path d="M8 22h8M12 11v11M5 2h14l-2 7a5 5 0 0 1-10 0L5 2z" />
  </S>
);

// ---- Accounts ----

export const CashIcon = (p: VendorIconProps) => (
  <S {...p}>
    <Rect x={2} y={6} width={20} height={12} rx={2} />
    <Circle cx={12} cy={12} r={2.5} />
    <Path d="M6 12h.01M18 12h.01" />
  </S>
);

export const ReceiptIcon = (p: VendorIconProps) => (
  <F {...p}>
    <Path d="M19 3H5c-1.1 0-2 .9-2 2v14l3-2 3 2 3-2 3 2 3-2 3 2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2z" />
  </F>
);

export const ReturnedIcon = (p: VendorIconProps) => (
  <S {...p} sw={2.4}>
    <Path d="M3 10h10a5 5 0 015 5v2M3 10l5-5M3 10l5 5" />
  </S>
);

export const CalculatorIcon = (p: VendorIconProps) => (
  <F {...p}>
    <Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 4h2v2h-2V7zm0 4h2v2h-2v-2zm-4-4h2v2H7V7zm0 4h2v2H7v-2zm10 8H7v-2h10v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" />
  </F>
);

export const BankIcon = (p: VendorIconProps) => (
  <F {...p}>
    <Path d="M4 10h3v7H4zM10.5 10h3v7h-3zM2 19h20v3H2zM17 10h3v7h-3zM12 1L2 6v2h20V6z" />
  </F>
);

export const BalanceIcon = (p: VendorIconProps) => (
  <S {...p}>
    <Rect x={3} y={3} width={18} height={18} rx={2} />
    <Path d="M9 9h6v6H9z" />
  </S>
);

export const InfoFilledIcon = (p: VendorIconProps) => (
  <F {...p}>
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
  </F>
);

// ---- Actions ----

export const ChatBubbleIcon = (p: VendorIconProps) => (
  <S {...p}>
    <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </S>
);

export const TicketTagIcon = (p: VendorIconProps) => (
  <F {...p}>
    <Path d="M15.58 2.83 21.17 8.42a2 2 0 0 1 0 2.83l-8.49 8.49a2 2 0 0 1-2.83 0l-5.59-5.59a2 2 0 0 1 0-2.83l8.49-8.49a2 2 0 0 1 2.83 0ZM15 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
  </F>
);

export const ListBoxIcon = (p: VendorIconProps) => (
  <S {...p} sw={2.2}>
    <Rect x={3} y={4} width={18} height={15} rx={2} />
    <Path d="M7 8h10M7 12h6" />
  </S>
);

export const ReplyFilledIcon = (p: VendorIconProps) => (
  <F {...p}>
    <Path d="M9 14l-4-4 4-4v3h7a4 4 0 0 1 4 4 4 4 0 0 1-4 4H9v-3z" />
  </F>
);

export const StoreSmallIcon = (p: VendorIconProps) => (
  <S {...p}>
    <Path d="M3 21h18M3 7v14M21 7v14M6 7V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3M9 11h2M13 11h2M9 15h2M13 15h2" />
  </S>
);

// ---- Reports ----

export const DocumentIcon = (p: VendorIconProps) => (
  <S {...p}>
    <Path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </S>
);

export const CheckCircleIcon = (p: VendorIconProps) => (
  <S {...p}>
    <Path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </S>
);

export const TrendUpIcon = (p: VendorIconProps) => (
  <S {...p}>
    <Path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </S>
);

// ---- Drawer ----

export const UsersIcon = (p: VendorIconProps) => (
  <S {...p} sw={1.8}>
    <Path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </S>
);

export const UserCircleIcon = (p: VendorIconProps) => (
  <S {...p} sw={1.8}>
    <Path d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </S>
);

export const CubeIcon = (p: VendorIconProps) => (
  <S {...p} sw={1.8}>
    <Path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </S>
);

export const CardDotsIcon = (p: VendorIconProps) => (
  <S {...p} sw={1.8}>
    <Path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </S>
);

export const BarsIcon = (p: VendorIconProps & { sw?: number }) => (
  <S sw={1.8} {...p}>
    <Path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </S>
);

export const BookIcon = (p: VendorIconProps) => (
  <S {...p} sw={1.8}>
    <Path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </S>
);

export const ArrowDownIcon = (p: VendorIconProps) => (
  <S {...p} sw={2.5}>
    <Path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </S>
);

export const StarIcon = (p: VendorIconProps) => (
  <F {...p}>
    <Path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </F>
);

export const SupportIcon = (p: VendorIconProps) => (
  <S {...p}>
    <Path d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824-2.179a5 5 0 014.243 0" />
  </S>
);

export const LogoutIcon = (p: VendorIconProps) => (
  <S {...p} sw={2.2}>
    <Path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </S>
);

export const PencilIcon = (p: VendorIconProps) => (
  <S {...p} sw={2.5}>
    <Path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </S>
);

export const AvatarIcon = (p: VendorIconProps) => (
  <S {...p}>
    <Circle cx={12} cy={8} r={4} />
    <Path d="M4 20c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6" />
  </S>
);

// ---- Resources ----

export const BuildingsFilledIcon = (p: VendorIconProps) => (
  <F {...p}>
    <Path d="M19 2H9c-1.1 0-2 .9-2 2v3H5c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM5 20V9h2v11H5zm8 0H9V4h4v16zm6 0h-4V9h4v11z" />
  </F>
);

export const PriceTagIcon = (p: VendorIconProps) => (
  <S {...p}>
    <Path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <Line x1={7} y1={7} x2={7.01} y2={7} />
  </S>
);

export const ArchiveIcon = (p: VendorIconProps) => (
  <S {...p}>
    <Polyline points="21 8 21 21 3 21 3 8" />
    <Rect x={1} y={3} width={22} height={5} />
    <Line x1={10} y1={12} x2={14} y2={12} />
  </S>
);

export const OfficeIcon = (p: VendorIconProps) => (
  <S {...p}>
    <Path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </S>
);

export const QrIcon = (p: VendorIconProps) => (
  <F {...p}>
    <Path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm8-2h7v7h-7V3zm2 2v3h3V5h-3zM3 13h7v7H3v-7zm2 2v3h3v-3H5zm13-2h-3v3h3v-3zm3 0h-2v2h2v-2zm-3 5h3v2h-3v-2zm3 0h2v2h-2v-2zm-5-2h2v4h-2v-4z" />
  </F>
);

export const MunicipalityIcon = (p: VendorIconProps) => (
  <F {...p}>
    <Path d="M4 21V9l8-6 8 6v12H4zm2-2h12V10l-6-4.5L6 10v9zm2-7h2v2H8v-2zm0 4h2v2H8v-2zm6-4h2v2h-2v-2zm0 4h2v2h-2v-2z" />
  </F>
);

export const GlobeIcon = (p: VendorIconProps) => (
  <F {...p}>
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </F>
);

export const RegionFlagIcon = (p: VendorIconProps) => (
  <F {...p}>
    <Path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z" />
  </F>
);

export const PhoneFilledIcon = (p: VendorIconProps) => (
  <F {...p}>
    <Path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
  </F>
);

export const PinFilledIcon = (p: VendorIconProps) => (
  <F {...p}>
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </F>
);
