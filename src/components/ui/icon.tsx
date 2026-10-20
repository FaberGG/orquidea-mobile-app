import {
  Activity,
  Camera,
  ImagePlus,
  Info,
  Asterisk,
  AtSign,
  Bell,
  Bird,
  Bug,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUser,
  CloudDownload,
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
  Plus,
  Save,
  Megaphone,
  Menu,
  Search,
  Sprout,
  Trash,
  UserCog,
  UserGroup,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';

import { type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

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
