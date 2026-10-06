import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getAdmin, listAdmins, revokeAdmin, updateAdmin } from '../api';
import { adminKeys } from '../constants';
import { type UpdateAdminInput } from '../types';

export function useAdmins() {
  return useQuery({ queryKey: adminKeys.list(), queryFn: listAdmins, retry: false });
}

export function useAdmin(id: string) {
  return useQuery({ queryKey: adminKeys.detail(id), queryFn: () => getAdmin(id), retry: false });
}

export function useUpdateAdmin(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateAdminInput) => updateAdmin(id, input),
    onSuccess: (admin) => {
      queryClient.setQueryData(adminKeys.detail(id), admin);
      void queryClient.invalidateQueries({ queryKey: adminKeys.list() });
    },
  });
}

export function useRevokeAdmin(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => revokeAdmin(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: adminKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: adminKeys.list() });
    },
  });
}
