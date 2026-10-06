import { useMutation } from '@tanstack/react-query';

import { createAdmin } from '../api';

/** HU-4: envía el formulario a la API como mutación autenticada. */
export function useCreateAdmin() {
  return useMutation({ mutationFn: createAdmin });
}
