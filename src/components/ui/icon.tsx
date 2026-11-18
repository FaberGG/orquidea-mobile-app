import {
  Activity,
  Camera,
  ImagePlus,
  Info,
  Asterisk,
  AtSign,
  Bell,
  Bird,
  CalendarClock,
  Bug,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CloudDownload,
  Droplets,
  Eye,
  EyeOff,
  Flashlight,
  GitBranch,
  Leaf,
  LayoutGrid,
  LocateFixed,
  LogIn,
  MapPin,
  Pencil,
  PenLine,
  PawPrint,
  Plus,
  QrCode,
  Save,
  Megaphone,
  Menu,
  Search,
  Sprout,
  Trash,
  Turtle,
  UserCog,
  X,
  Zap,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react-native';
import { forwardRef, type ElementRef } from 'react';
import Svg, { Path } from 'react-native-svg';

import { type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TablerPath = {
  d: string;
  /** Rellena la forma con el color del ícono (variante "activa"). */
  filled?: boolean;
  /** Sin trazo: solo relleno (íconos `filled` de Tabler). */
  noStroke?: boolean;
};

/**
 * Crea un ícono de Tabler (MIT, https://tabler.io/icons) con la misma firma que los de Lucide, para
 * los que Lucide no trae (hongo) o para las variantes rellenas de la barra inferior.
 */
function createTablerIcon(displayName: string, paths: readonly TablerPath[]): LucideIcon {
  const Glyph: LucideIcon = forwardRef<ElementRef<typeof Svg>, LucideProps>(
    (
      {
        color = 'currentColor',
        size = 24,
        width,
        height,
        strokeWidth = 2,
        absoluteStrokeWidth,
        nonScalingStroke,
      },
      ref,
    ) => {
      const iconWidth = width ?? size;
      const iconHeight = height ?? size;
      const resolvedStrokeWidth =
        absoluteStrokeWidth && typeof iconWidth === 'number'
          ? (Number(strokeWidth) * 24) / iconWidth
          : strokeWidth;
      return (
        <Svg ref={ref} width={iconWidth} height={iconHeight} viewBox="0 0 24 24" fill="none">
          {paths.map(({ d, filled, noStroke }) => (
            <Path
              key={d}
              d={d}
              fill={filled ? color : 'none'}
              stroke={noStroke ? 'none' : color}
              strokeWidth={resolvedStrokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect={nonScalingStroke ? 'non-scaling-stroke' : undefined}
            />
          ))}
        </Svg>
      );
    },
  );
  Glyph.displayName = displayName;
  return Glyph;
}

const TablerMushroom = createTablerIcon('TablerMushroom', [
  {
    d: 'M20 11.1c0 -4.474 -3.582 -8.1 -8 -8.1s-8 3.626 -8 8.1a.9 .9 0 0 0 .9 .9h14.2a.9 .9 0 0 0 .9 -.9',
  },
  { d: 'M10 12v7a2 2 0 1 0 4 0v-7' },
]);

// Pestañas inferiores: Tabler "home" (outline y filled) y variantes rellenas de "users-group", "map" y
// "user-circle", que Tabler solo publica en outline (se rellenan las partes que representan el cuerpo).
const TablerHomeFilled = createTablerIcon('TablerHomeFilled', [
  {
    d: 'M12.707 2.293l9 9c.63 .63 .184 1.707 -.707 1.707h-1v6a3 3 0 0 1 -3 3h-1v-7a3 3 0 0 0 -2.824 -2.995l-.176 -.005h-2a3 3 0 0 0 -3 3v7h-1a3 3 0 0 1 -3 -3v-6h-1c-.89 0 -1.337 -1.077 -.707 -1.707l9 -9a1 1 0 0 1 1.414 0m.293 11.707a1 1 0 0 1 1 1v7h-4v-7a1 1 0 0 1 .883 -.993l.117 -.007z',
    filled: true,
    noStroke: true,
  },
]);
const TablerHome = createTablerIcon('TablerHome', [
  { d: 'M5 12l-2 0l9 -9l9 9l-2 0' },
  { d: 'M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7' },
  { d: 'M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6' },
]);
const usersGroupBody = [
  { d: 'M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1' },
  { d: 'M17 10h2a2 2 0 0 1 2 2v1' },
  { d: 'M3 13v-1a2 2 0 0 1 2 -2h2' },
] as const;
const TablerUsersGroup = createTablerIcon('TablerUsersGroup', [
  { d: 'M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0' },
  { d: 'M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0' },
  { d: 'M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0' },
  ...usersGroupBody,
]);
const TablerUsersGroupFilled = createTablerIcon('TablerUsersGroupFilled', [
  { d: 'M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0', filled: true },
  { d: 'M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0', filled: true },
  { d: 'M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0', filled: true },
  ...usersGroupBody,
]);
const mapOutline = [
  { d: 'M3 7l6 -3l6 3l6 -3v13l-6 3l-6 -3l-6 3v-13' },
  { d: 'M9 4v13' },
  { d: 'M15 7v13' },
] as const;
const TablerMap = createTablerIcon('TablerMap', mapOutline);
const TablerMapFilled = createTablerIcon('TablerMapFilled', [
  { d: 'M3 7l6 -3v13l-6 3z', filled: true },
  { d: 'M15 7l6 -3v13l-6 3z', filled: true },
  ...mapOutline,
]);
const userCircleOutline = [
  { d: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0' },
  { d: 'M9 10a3 3 0 1 0 6 0a3 3 0 1 0 -6 0' },
  { d: 'M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855' },
] as const;
const TablerUserCircle = createTablerIcon('TablerUserCircle', userCircleOutline);
const TablerUserCircleFilled = createTablerIcon('TablerUserCircleFilled', [
  { d: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0' },
  { d: 'M9 10a3 3 0 1 0 6 0a3 3 0 1 0 -6 0', filled: true },
  { d: 'M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855', filled: true },
]);

/**
 * Íconos de la app (Lucide, como en el diseño de Figma). Cada ícono se nombra una sola vez aquí
 * con un nombre de la app, para que las pantallas no dependan de la librería. Ver ADR-0010.
 */
const ICONS = {
  // Formularios de acceso (HE-01)
  email: AtSign,
  password: Asterisk,
  visibility: Eye,
  visibilityOff: EyeOff,
  check: Check,
  // Navegación principal (Figma: "Listar fichas")
  home: TablerHome,
  homeFilled: TablerHomeFilled,
  community: TablerUsersGroup,
  communityFilled: TablerUsersGroupFilled,
  map: TablerMap,
  mapFilled: TablerMapFilled,
  user: TablerUserCircle,
  userFilled: TablerUserCircleFilled,
  menu: Menu,
  search: Search,
  // Menú lateral
  wetland: Leaf,
  announcements: Megaphone,
  offline: CloudDownload,
  manageAccounts: UserCog,
  login: LogIn,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  // Fichas taxonómicas (HE-03)
  categoryAll: LayoutGrid,
  bird: Bird,
  plant: Sprout,
  insect: Bug,
  // Lucide no tiene rana; para anfibio se usan gotas (ligado al agua). Hongo usa un SVG de Tabler.
  mammal: PawPrint,
  reptile: Turtle,
  amphibian: Droplets,
  fungus: TablerMushroom,
  taxonomy: GitBranch,
  diet: Zap,
  wetlandRole: Activity,
  edit: Pencil,
  add: Plus,
  camera: Camera,
  qrCode: QrCode,
  flashlight: Flashlight,
  imagePlus: ImagePlus,
  save: Save,
  delete: Trash,
  // Contenido del humedal (HE-06)
  close: X,
  calendar: CalendarClock,
  // Avistamientos (HE-07)
  notifications: Bell,
  writeReport: PenLine,
  location: MapPin,
  locate: LocateFixed,
  info: Info,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export type IconProps = {
  name: IconName;
  size?: number;
  color?: ThemeColor;
  /**
   * Color fijo que ignora el tema. Solo para superficies que no cambian con el tema (p. ej. el visor
   * de fotos, siempre oscuro).
   */
  fixedColor?: string;
};

/**
 * Ícono decorativo; si transmite información, quien lo usa debe darle `accessibilityLabel`.
 * El trazo es absoluto (2 px a cualquier tamaño), como los íconos exportados del Figma.
 */
export function Icon({ name, size = 24, color = 'primary', fixedColor }: IconProps) {
  const theme = useTheme();
  const LucideGlyph = ICONS[name];
  return (
    <LucideGlyph
      size={size}
      color={fixedColor ?? theme[color]}
      strokeWidth={2}
      absoluteStrokeWidth
    />
  );
}
