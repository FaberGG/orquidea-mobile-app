import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';

import { register } from '../api';
import { type RegisterData } from '../types';

/** HU-2: registra al visitante y lo lleva al login con un mensaje de confirmación (CA1). */
export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterData) => register(data),
    onSuccess: () => {
      router.replace({ pathname: '/login', params: { registered: 'true' } });
    },
  });
}
