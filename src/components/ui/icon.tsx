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
  CircleUser,
  CloudDownload,
  Droplets,
  Eye,
  EyeOff,
  Flashlight,
  GitBranch,
  House,
  Leaf,
  LayoutGrid,
  LocateFixed,
  LogIn,
  Map as MapIcon,
  MapPin,
  Pencil,
  PenLine,
  PawPrint,
  Plus,
  Save,
  Megaphone,
  Menu,
  Search,
  Sprout,
  Trash,
  Turtle,
  UserCog,
  UserGroup,
  X,
  Zap,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react-native';
import { forwardRef, type ElementRef } from 'react';
import Svg, { Path } from 'react-native-svg';

import { type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Ícono Tabler "mushroom" (MIT): https://tabler.io/icons?icon=mushroom
const TablerMushroom: LucideIcon = forwardRef<ElementRef<typeof Svg>, LucideProps>(
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
        <Path
          d="M20 11.1c0 -4.474 -3.582 -8.1 -8 -8.1s-8 3.626 -8 8.1a.9 .9 0 0 0 .9 .9h14.2a.9 .9 0 0 0 .9 -.9"
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect={nonScalingStroke ? 'non-scaling-stroke' : undefined}
        />
        <Path
          d="M10 12v7a2 2 0 1 0 4 0v-7"
          stroke={color}
          strokeWidth={resolvedStrokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect={nonScalingStroke ? 'non-scaling-stroke' : undefined}
        />
      </Svg>
    );
  },
);
TablerMushroom.displayName = 'TablerMushroom';

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
  home: House,
  community: UserGroup,
  map: MapIcon,
  user: CircleUser,
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
