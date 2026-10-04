import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Can } from '../can-component';
import { RoleProvider } from '../role-context';

describe('<Can>', () => {
  it('muestra el contenido si el rol tiene el permiso', async () => {
    await render(
      <RoleProvider role="admin">
        <Can permission="species:create">
          <Text>Crear ficha</Text>
        </Can>
      </RoleProvider>,
    );
    expect(screen.getByText('Crear ficha')).toBeTruthy();
  });

  it('oculta el contenido y muestra el fallback si no tiene el permiso', async () => {
    await render(
      <RoleProvider role="user">
        <Can permission="species:create" fallback={<Text>Sin acceso</Text>}>
          <Text>Crear ficha</Text>
        </Can>
      </RoleProvider>,
    );
    expect(screen.queryByText('Crear ficha')).toBeNull();
    expect(screen.getByText('Sin acceso')).toBeTruthy();
  });

  it('usa el rol visitante si no hay RoleProvider', async () => {
    await render(
      <Can permission="auth:login">
        <Text>Iniciar sesión</Text>
      </Can>,
    );
    expect(screen.getByText('Iniciar sesión')).toBeTruthy();
  });
});
