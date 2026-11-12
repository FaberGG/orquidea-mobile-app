import { useState } from 'react';

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
 * exige permisos de administrador). Al publicar, limpia el formulario y muestra la confirmación.
 */
export function PublishAnnouncementScreen() {
  const publish = useCreateAnnouncement();
  const [hasPublished, setHasPublished] = useState(false);

  return (
    <AnnouncementForm
      title={CONTENT_LABELS.publishTitle}
      subtitle={CONTENT_LABELS.publishSubtitle}
      submitLabel={CONTENT_LABELS.publishButton}
      defaultValues={EMPTY_VALUES}
      isPending={publish.isPending}
      serverError={publish.isError ? getPublishAnnouncementErrorMessage(publish.error) : undefined}
      successMessage={hasPublished ? CONTENT_MESSAGES.announcementPublished : undefined}
      onEdit={() => setHasPublished(false)}
      onSubmit={(values, reset) => {
        setHasPublished(false);
        publish.mutate(values, {
          onSuccess: () => {
            reset(EMPTY_VALUES);
            setHasPublished(true);
          },
        });
      }}
    />
  );
}
