/** API efímera para revisar HU-4 desde Expo. Nunca usa datos ni servicios reales. */
const http = require('node:http');
const { randomUUID } = require('node:crypto');

const DEMO_PASSWORD = 'Prueba123!';
const ADMIN_LIMIT = 3;
const PATH_LOGIN = '/api/autenticacion/iniciar-sesion';
const PATH_ME = '/api/autenticacion/yo';
const PATH_CREATE = '/api/administradores/registrarAdmin';

function json(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    },
    {
      id: 'fd9c7822-a0f5-4e13-aa19-95169d653c18',
      nombre: 'Carlos',
      apellido: 'López',
      correo: 'admin@orquidea.test',
      rol: 'ADMINISTRADOR',
      contrasena: DEMO_PASSWORD,
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
      if (request.method === 'POST') body = await readJson(request);
    } catch {
      return json(response, 400, { mensaje: 'Solicitud JSON inválida.' });
    }

    if (request.method === 'POST' && path === PATH_LOGIN) {
      const account = accounts.find(
        (a) => a.correo === body.correo?.trim().toLowerCase() && a.contrasena === body.contrasena,
      );
      if (!account) return json(response, 401, { mensaje: 'Correo o contraseña incorrectos.' });
      const token = `demo-${randomUUID()}`;
      tokens.set(token, account.id);
      const { contrasena: _password, ...usuario } = account;
      return json(response, 200, { token, tipo: 'Bearer', expiraEnSegundos: 28800, usuario });
    }

    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
    const current = accounts.find((a) => a.id === tokens.get(token));
    if ((path === PATH_ME || path === PATH_CREATE) && !current) {
      return json(response, 401, { mensaje: 'La sesión ha vencido.' });
    }
    if (request.method === 'GET' && path === PATH_ME) {
      const { contrasena: _password, ...user } = current;
      return json(response, 200, user);
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
      if (accounts.filter((a) => a.rol === 'ADMINISTRADOR').length >= ADMIN_LIMIT) {
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
      const { contrasena: _password, ...result } = created;
      return json(response, 201, result);
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
    .then(() => console.log('API de prueba HU-4 disponible en el puerto 8080.'))
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
