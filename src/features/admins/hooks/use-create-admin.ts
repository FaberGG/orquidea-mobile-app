import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createAdmin } from '../api';
import { adminKeys } from '../constants';

/** HU-4: envía el formulario a la API como mutación autenticada. */
export function useCreateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdmin,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.list() }),
  });
}
