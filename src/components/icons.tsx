import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

import { Colors } from '@/constants/theme';

type IconProps = { size?: number; color?: string; strokeWidth?: number };

const stroke = (color: string, strokeWidth: number) => ({
  fill: 'none',
  stroke: color,
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function MailIcon({ size = 24, color = '#1F2937', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, strokeWidth)}>
      <Rect x={3} y={5} width={18} height={14} rx={2} />
      <Polyline points="3 7 12 13 21 7" />
    </Svg>
  );
}

export function LockIcon({ size = 24, color = '#111827' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
      />
    </Svg>
  );
}

export function EyeSlashIcon({ size = 24, color = '#9CA3AF', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, strokeWidth)}>
      <Path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </Svg>
  );
}

export function EyeIcon({ size = 24, color = '#9CA3AF', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, strokeWidth)}>
      <Path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <Path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </Svg>
  );
}

export function CloseIcon({ size = 24, color = Colors.red, strokeWidth = 2.5 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, strokeWidth)}>
      <Path d="M6 18L18 6M6 6l12 12" />
    </Svg>
  );
}

export function SearchIcon({ size = 24, color = Colors.red, strokeWidth = 2.5 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, strokeWidth)}>
      <Path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </Svg>
  );
}

export function BackArrowIcon({ size = 24, color = Colors.red, strokeWidth = 2.5 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, strokeWidth)}>
      <Line x1={19} y1={12} x2={5} y2={12} />
      <Polyline points="12 19 5 12 12 5" />
    </Svg>
  );
}

export function PlusIcon({ size = 32, color = '#FFFFFF', strokeWidth = 2.5 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, strokeWidth)}>
      <Line x1={12} y1={5} x2={12} y2={19} />
      <Line x1={5} y1={12} x2={19} y2={12} />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 16, color = '#9CA3AF', strokeWidth = 2.5 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, strokeWidth)}>
      <Path d="M9 5l7 7-7 7" />
    </Svg>
  );
}

export function ChevronDownIcon({ size = 16, color = '#6B7280', strokeWidth = 2.5 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, strokeWidth)}>
      <Path d="M19 9l-7 7-7-7" />
    </Svg>
  );
}

export function CaretDownIcon({ size = 10, color = Colors.red }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 18L2 6h20L12 18z" fill={color} />
    </Svg>
  );
}

export function SmallChevronDownIcon({ size = 12, color = Colors.red }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      <Path
        fill={color}
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      />
    </Svg>
  );
}

export function CheckIcon({ size = 16, color = '#FFFFFF', strokeWidth = 3 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, strokeWidth)}>
      <Path d="M5 13l4 4L19 7" />
    </Svg>
  );
}

export function TicketIcon({ size = 24, color = Colors.red }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M4 4c-1.1 0-2 .9-2 2v2.5a2.5 2.5 0 0 1 0 5V18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4.5a2.5 2.5 0 0 1 0-5V6c0-1.1-.9-2-2-2H4zm8 3a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0V8a1 1 0 0 1 1-1zm0 4a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0v-1a1 1 0 0 1 1-1zm0 4a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0v-1a1 1 0 0 1 1-1z"
      />
    </Svg>
  );
}

export function TrashIcon({ size = 20, color = '#9CA3AF', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, strokeWidth)}>
      <Polyline points="3 6 5 6 21 6" />
      <Path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </Svg>
  );
}

// ---- Tab bar icons ----

export function TrackTabIcon({ size = 24, color }: IconProps & { color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, 2)}>
      <Circle cx={12} cy={12} r={10} />
      <Circle cx={12} cy={12} r={6} />
      <Circle cx={12} cy={12} r={2} fill={color} />
    </Svg>
  );
}

export function FindUsTabIcon({ size = 24, color }: IconProps & { color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, 1.8)}>
      <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <Line x1={12} y1={6.5} x2={12} y2={11.5} />
      <Line x1={9.5} y1={9} x2={14.5} y2={9} />
    </Svg>
  );
}

export function AccountTabIcon({ size = 24, color, strokeWidth = 1.8 }: IconProps & { color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, strokeWidth)}>
      <Circle cx={12} cy={7} r={4} />
      <Path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
    </Svg>
  );
}

export function MoreTabIcon({ size = 24, color }: IconProps & { color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={5} cy={12} r={2} fill={color} />
      <Circle cx={12} cy={12} r={2} fill={color} />
      <Circle cx={19} cy={12} r={2} fill={color} />
    </Svg>
  );
}

// ---- Account menu icons ----

export function UserIcon({ size = 24, color = Colors.red, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, strokeWidth)}>
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Circle cx={12} cy={7} r={4} />
    </Svg>
  );
}

export function DeliveryPrefIcon({ size = 24, color = Colors.red }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        {...stroke(color, 1.9)}
        d="M19 8a2 2 0 0 0-1-1.73l-6-3.5a2 2 0 0 0-2 0l-6 3.5A2 2 0 0 0 3 8v7a2 2 0 0 0 1 1.73l6 3.5a2 2 0 0 0 2 0l1-.6"
      />
      <Path {...stroke(color, 1.9)} d="m3.3 7 7.7 4.5L18.7 7" />
      <Path {...stroke(color, 1.9)} d="M11 21V11.5" />
      <Circle cx={18.5} cy={18.5} r={3.2} fill="#FFFFFF" stroke={color} strokeWidth={1.6} />
      <Circle cx={18.5} cy={18.5} r={1} fill={color} />
    </Svg>
  );
}

export function BellIcon({ size = 24, color = Colors.red, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, strokeWidth)}>
      <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </Svg>
  );
}

// ---- More menu icons ----

export function BranchListIcon({ size = 32, color = Colors.red }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, 2)}>
      <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
      <Line x1={9} y1={9} x2={15} y2={9} />
      <Line x1={9} y1={13} x2={15} y2={13} />
      <Line x1={9} y1={17} x2={15} y2={17} />
    </Svg>
  );
}

export function GiftIcon({ size = 32, color = Colors.red }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, 2)}>
      <Polyline points="20 12 20 22 4 22 4 12" />
      <Rect x={2} y={7} width={20} height={5} />
      <Line x1={12} y1={22} x2={12} y2={7} />
      <Path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <Path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </Svg>
  );
}

export function InfoIcon({ size = 32, color = Colors.red }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, 2)}>
      <Circle cx={12} cy={12} r={10} />
      <Line x1={12} y1={16} x2={12} y2={12} />
      <Line x1={12} y1={8} x2={12.01} y2={8} />
    </Svg>
  );
}

export function GearIcon({ size = 32, color = Colors.red }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54A.484.484 0 0 0 13.92 2h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.47c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
      />
    </Svg>
  );
}

export function ContactCardIcon({ size = 32, color = Colors.red }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, 2)}>
      <Rect x={3} y={4} width={18} height={16} rx={2} />
      <Circle cx={8.5} cy={10} r={2} />
      <Path d="M14.5 9h2" />
      <Path d="M14.5 13h2" />
      <Path d="M6 16c0-1.5 1.5-2.5 3-2.5s3 1 3 2.5" />
    </Svg>
  );
}

// ---- Details form icons ----

export function PersonIcon({ size = 20, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, 2)}>
      <Path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </Svg>
  );
}

export function PersonAddIcon({ size = 20, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      />
    </Svg>
  );
}

export function CalendarIcon({ size = 20, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, 2)}>
      <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
      <Line x1={16} y1={2} x2={16} y2={6} />
      <Line x1={8} y1={2} x2={8} y2={6} />
      <Line x1={3} y1={10} x2={21} y2={10} />
    </Svg>
  );
}

export function EnvelopeIcon({ size = 20, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, 2)}>
      <Path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </Svg>
  );
}

export function BuildingIcon({ size = 20, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"
      />
    </Svg>
  );
}

export function FlagIcon({ size = 20, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path fill={color} d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
    </Svg>
  );
}

export function PinOutlineIcon({ size = 20, color = '#000', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, strokeWidth)}>
      <Path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <Path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </Svg>
  );
}

export function NumberedListIcon({ size = 20, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"
      />
    </Svg>
  );
}

// ---- Leave parcels ----

export function DoorIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, 2.5)}>
      <Path d="M8 7v10M8 12h8m-8 5h8m0-10v10" />
    </Svg>
  );
}

// ---- Contact / social ----

export function LocationDotIcon({ size = 16, color = Colors.red }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
      />
    </Svg>
  );
}

export function PhoneIcon({ size = 16, color = Colors.red }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
      />
    </Svg>
  );
}

export function PaperPlaneIcon({ size = 26, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path fill={color} d="M22 2L2 10.5l7.2 2.6L20 5.2 11 14.7V22l3.9-5.1 4.6 3.3L22 2z" />
    </Svg>
  );
}

export function GlobeIcon({ size = 20, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, 1.8)}>
      <Circle cx={12} cy={12} r={10} />
      <Path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </Svg>
  );
}

export function FacebookIcon({ size = 20, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.52-.14-2.73-.14-2.8 0-4.77 1.71-4.77 4.9v3.1H7v4h3V22h4v-8.5z"
      />
    </Svg>
  );
}

export function InstagramIcon({ size = 20, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, 2)}>
      <Rect x={2} y={2} width={20} height={20} rx={5} ry={5} />
      <Path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <Line x1={17.5} y1={6.5} x2={17.51} y2={6.5} />
    </Svg>
  );
}

export function LinkedInIcon({ size = 20, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"
      />
    </Svg>
  );
}

export function TwitterIcon({ size = 20, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"
      />
    </Svg>
  );
}

// ---- Map ----

export function MapPinIcon({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 1.25} viewBox="0 0 24 30">
      <Path
        d="M12 0C5.37 0 0 5.37 0 12C0 21 12 30 12 30C12 30 24 21 24 12C24 5.37 18.63 0 12 0Z"
        fill="#E52320"
      />
      <Circle cx={12} cy={11} r={4.2} fill="#8B0000" />
    </Svg>
  );
}

export function ZoomInIcon({ size = 16, color = '#374151' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path fill={color} d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </Svg>
  );
}

export function ZoomOutIcon({ size = 16, color = '#374151' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path fill={color} d="M19 13H5v-2h14v2z" />
    </Svg>
  );
}


// ---- User roles ----

export function StorefrontIcon({ size = 18, color = Colors.red, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, strokeWidth)}>
      <Path d="M3 9l1.5-5h15L21 9" />
      <Path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
      <Path d="M5 11.5V20h14v-8.5" />
      <Path d="M10 20v-5h4v5" />
    </Svg>
  );
}

export function ShieldIcon({ size = 18, color = Colors.red, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, strokeWidth)}>
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <Path d="M9 12l2 2 4-4" />
    </Svg>
  );
}
