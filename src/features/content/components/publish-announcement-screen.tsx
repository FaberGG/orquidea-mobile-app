import { router } from 'expo-router';

import { useToast } from '@/components/feedback/toast';

import { CONTENT_LABELS, CONTENT_MESSAGES } from '../constants';
import { getPublishAnnouncementErrorMessage, useCreateAnnouncement } from '../hooks';
import { type AnnouncementFormValues } from '../schemas';
import { AnnouncementForm } from './announcement-form';

const EMPTY_VALUES: AnnouncementFormValues = {
  title: '',
  description: '',
  priority: null,
  expiresAt: null,
};

/**
 * HU-16 y HU-23: publicar un anuncio o información educativa con su prioridad (CA3) y, si se quiere,
 * una fecha y hora de finalización. Solo se llega con `announcements:publish` (el grupo `(admin)` ya
 * exige permisos de administrador). Al publicar muestra la confirmación y vuelve a la lista de anuncios.
 */
export function PublishAnnouncementScreen() {
  const publish = useCreateAnnouncement();
  const toast = useToast();

  return (
    <AnnouncementForm
      title={CONTENT_LABELS.publishTitle}
      subtitle={CONTENT_LABELS.publishSubtitle}
      submitLabel={CONTENT_LABELS.publishButton}
      defaultValues={EMPTY_VALUES}
      isPending={publish.isPending}
      serverError={publish.isError ? getPublishAnnouncementErrorMessage(publish.error) : undefined}
      onEdit={() => publish.reset()}
      onSubmit={(values) => {
        publish.mutate(values, {
          onSuccess: () => {
            toast.show(CONTENT_MESSAGES.announcementPublished);
            router.back();
          },
        });
      }}
    />
  );
}
