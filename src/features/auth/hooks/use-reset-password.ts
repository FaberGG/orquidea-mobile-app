import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';

import { resetPassword } from '../api';
import { type PasswordResetData } from '../types';

/** HU-1.1 paso 2: cambia la contraseña y vuelve al login con un mensaje de confirmación. */
export function useResetPassword() {
  return useMutation({
    mutationFn: (data: PasswordResetData) => resetPassword(data),
    onSuccess: () => {
      router.replace({ pathname: '/login', params: { passwordReset: 'true' } });
    },
  });
}
