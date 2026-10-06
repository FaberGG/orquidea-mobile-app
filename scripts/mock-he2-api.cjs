/** API efímera para revisar HE-2 desde Expo. Nunca usa datos ni servicios reales. */
const http = require('node:http');
const { randomUUID } = require('node:crypto');

const DEMO_PASSWORD = 'Prueba123!';
const ADMIN_LIMIT = 3;
const PATH_LOGIN = '/api/autenticacion/iniciar-sesion';
const PATH_ME = '/api/autenticacion/yo';
const PATH_CREATE = '/api/administradores/registrarAdmin';
const PATH_ADMINS = '/api/administradores';

function json(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  });
  response.end(JSON.stringify(body));
}

function createDemoHandler() {
  const accounts = [
    {
      id: '3c9ec9c0-3d02-4b57-a1bb-6bf131395416',
      nombre: 'María',
      apellido: 'García',
      correo: 'superadmin@orquidea.test',
      rol: 'SUPERADMINISTRADOR',
      contrasena: DEMO_PASSWORD,
      habilitado: true,
    },
    {
      id: 'fd9c7822-a0f5-4e13-aa19-95169d653c18',
      nombre: 'Carlos',
      apellido: 'López',
      correo: 'admin@orquidea.test',
      rol: 'ADMINISTRADOR',
      contrasena: DEMO_PASSWORD,
      habilitado: true,
    },
  ];
  const tokens = new Map();

  async function readJson(request) {
    let text = '';
    for await (const chunk of request) {
      text += chunk.toString();
      if (text.length > 64_000) throw new Error('Solicitud demasiado grande.');
    }
    return JSON.parse(text || '{}');
  }

  return async (request, response) => {
    const path = new URL(request.url || '/', 'http://localhost').pathname;
    if (request.method === 'OPTIONS') return json(response, 204, {});
    if (request.method === 'GET' && path === '/__he2/health') {
      return json(response, 200, {
        demo: true,
        admins: accounts.filter((a) => a.rol === 'ADMINISTRADOR').length,
        limit: ADMIN_LIMIT,
      });
    }

    let body;
    try {
      if (request.method === 'POST' || request.method === 'PUT') body = await readJson(request);
    } catch {
      return json(response, 400, { mensaje: 'Solicitud JSON inválida.' });
    }

    if (request.method === 'POST' && path === PATH_LOGIN) {
      const account = accounts.find(
        (a) =>
          a.habilitado &&
          a.correo === body.correo?.trim().toLowerCase() &&
          a.contrasena === body.contrasena,
      );
      if (!account) return json(response, 401, { mensaje: 'Correo o contraseña incorrectos.' });
      const token = `demo-${randomUUID()}`;
      tokens.set(token, account.id);
      const { contrasena: _password, ...usuario } = account;
      return json(response, 200, { token, tipo: 'Bearer', expiraEnSegundos: 28800, usuario });
    }

    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
    const current = accounts.find((a) => a.id === tokens.get(token));
    if ((path === PATH_ME || path.startsWith(PATH_ADMINS)) && !current) {
      return json(response, 401, { mensaje: 'La sesión ha vencido.' });
    }
    if (request.method === 'GET' && path === PATH_ME) {
      const { contrasena: _password, ...user } = current;
      return json(response, 200, user);
    }
    if (path.startsWith(PATH_ADMINS) && current.rol !== 'SUPERADMINISTRADOR') {
      return json(response, 403, { mensaje: 'Acceso denegado.' });
    }
    const toAdminDto = (account) => {
      const { contrasena: _password, ...dto } = account;
      return dto;
    };
    if (request.method === 'GET' && path === PATH_ADMINS) {
      return json(
        response,
        200,
        accounts.filter((a) => a.rol !== 'USUARIO_REGISTRADO').map(toAdminDto),
      );
    }
    const adminPath = path.match(/^\/api\/administradores\/([0-9a-f-]{36})(\/revocar-acceso)?$/i);
    if (adminPath && (request.method === 'PUT' || request.method === 'POST')) {
      const account = accounts.find((a) => a.id === adminPath[1] && a.rol !== 'USUARIO_REGISTRADO');
      if (!account)
        return json(response, 404, { mensaje: 'El administrador solicitado no existe.' });
      if (request.method === 'PUT' && !adminPath[2]) {
        if (account.rol !== 'ADMINISTRADOR')
          return json(response, 404, { mensaje: 'El administrador solicitado no existe.' });
        const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
        const apellido = typeof body.apellido === 'string' ? body.apellido.trim() : '';
        const correo = typeof body.correo === 'string' ? body.correo.trim().toLowerCase() : '';
        if (
          !nombre ||
          !apellido ||
          !/^\S+@\S+\.\S+$/.test(correo) ||
          typeof body.habilitado !== 'boolean'
        )
          return json(response, 400, { mensaje: 'Debes completar todos los campos obligatorios.' });
        if (accounts.some((a) => a.id !== account.id && a.correo === correo))
          return json(response, 409, { mensaje: 'Este correo ya está registrado.' });
        Object.assign(account, { nombre, apellido, correo, habilitado: body.habilitado });
        return json(response, 200, toAdminDto(account));
      }
      if (request.method === 'POST' && adminPath[2]) {
        if (
          account.rol === 'SUPERADMINISTRADOR' &&
          accounts.filter((a) => a.rol === 'SUPERADMINISTRADOR' && a.habilitado).length <= 1
        )
          return json(response, 409, {
            mensaje: 'No puedes revocar el único superadministrador de la plataforma.',
          });
        account.rol = 'USUARIO_REGISTRADO';
        return json(response, 200, toAdminDto(account));
      }
    }
    if (request.method === 'POST' && path === PATH_CREATE) {
      if (current.rol !== 'SUPERADMINISTRADOR')
        return json(response, 403, { mensaje: 'Acceso denegado.' });
      const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
      const apellido = typeof body.apellido === 'string' ? body.apellido.trim() : '';
      const correo = typeof body.correo === 'string' ? body.correo.trim().toLowerCase() : '';
      const contrasena = typeof body.contrasena === 'string' ? body.contrasena : '';
      if (
        nombre.length < 2 ||
        apellido.length < 2 ||
        !/^\S+@\S+\.\S+$/.test(correo) ||
        !contrasena
      ) {
        return json(response, 400, { mensaje: 'Debes completar todos los campos obligatorios.' });
      }
      if (accounts.some((a) => a.correo.toLowerCase() === correo)) {
        return json(response, 409, { mensaje: 'Este correo ya está registrado.' });
      }
      if (accounts.filter((a) => a.rol === 'ADMINISTRADOR' && a.habilitado).length >= ADMIN_LIMIT) {
        return json(response, 409, {
          mensaje: `Administradores activos exceden el límite permitido: ${ADMIN_LIMIT}`,
        });
      }
      const created = {
        id: randomUUID(),
        nombre,
        apellido,
        correo,
        rol: 'ADMINISTRADOR',
        contrasena,
      };
      accounts.push(created);
      created.habilitado = true;
      return json(response, 201, toAdminDto(created));
    }
    return json(response, 404, { mensaje: 'Ruta de demostración no disponible.' });
  };
}

function startMockHe2Api(port = 8080) {
  const server = http.createServer(createDemoHandler());
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '0.0.0.0', () => resolve(server));
  });
}

module.exports = { createDemoHandler, startMockHe2Api };

if (require.main === module) {
  startMockHe2Api()
    .then(() => console.log('API de prueba HE-2 disponible en el puerto 8080.'))
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
