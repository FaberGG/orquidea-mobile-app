// API pública de la feature de contenido del humedal (HE-06). Desde fuera solo se importa
// "@/features/content".
export {
  EditWetlandComponentScreen,
  PublishAnnouncementScreen,
  WetlandComponentDetailScreen,
  WetlandComponentsScreen,
} from './components';
export { announcementKeys, wetlandComponentKeys } from './constants';
export type { AnnouncementInput, WetlandComponent } from './types';
