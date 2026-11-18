import { UnderlineTabs } from '@/components/ui/underline-tabs';

import { SIGHTINGS_LABELS } from '../constants';

export type CommunityView = 'feed' | 'moderation';

const TABS = [
  { id: 'feed', label: SIGHTINGS_LABELS.tabFeed },
  { id: 'moderation', label: SIGHTINGS_LABELS.tabModeration },
] as const satisfies readonly { id: CommunityView; label: string }[];

export type CommunityTabsProps = {
  value: CommunityView;
  onChange: (value: CommunityView) => void;
};

/**
 * Pestañas "Comunidad | Moderación" (Figma: "admin-tabs"). Solo las ve quien puede revisar reportes;
 * el resto de roles ve directamente el foro.
 */
export function CommunityTabs({ value, onChange }: CommunityTabsProps) {
  return <UnderlineTabs tabs={TABS} value={value} onChange={onChange} />;
}
