import { type Query } from '@tanstack/react-query';

import { isPersistedQuery } from '@/lib/offline';

import { authKeys } from '../constants';

/**
 * Queries que se borran al iniciar, cerrar o cambiar de sesión porque pueden depender del usuario o su rol.
 * Se conservan la sesión (`auth`) y los datos públicos guardados para uso offline (HU-21, `meta.persist`):
 * cerrar sesión sin conexión no debe dejar al visitante sin fichas.
 */
export function isSessionDependentQuery(query: Query): boolean {
  return query.queryKey[0] !== authKeys.all[0] && !isPersistedQuery(query);
}
