import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';

import { login } from '../api';
import { type LoginCredentials } from '../types';
import { useSession } from './use-session';

/** HU-1: inicia sesión, guarda el token y lleva al inicio con las opciones del rol (CA1). */
export function useLogin() {
  const { signIn } = useSession();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: async (result) => {
      await signIn(result);
      router.replace('/');
    },
  });
}
