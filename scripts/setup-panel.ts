/**
 * Configura el panel de administración para SINERGIA:
 *  1. Crea la colección auth `staff` (administradores del sitio, no superadmin).
 *  2. Ajusta las reglas de las colecciones para que `staff` pueda CRUD.
 *  3. Agrega los orígenes permitidos (CORS) para la app.
 *  4. Crea el primer usuario `staff` si no existe (email/password del .env o generado).
 *
 * Usage:
 *   npm run setup:panel
 */
import PocketBase, { type AuthModel, type CollectionField, type RecordModel } from 'pocketbase';
import crypto from 'node:crypto';

try {
  process.loadEnvFile('.env');
} catch {
  // .env not present; rely on existing environment variables
}

const url = process.env.PUBLIC_POCKETBASE_URL;
const email = process.env.POCKETBASE_ADMIN_EMAIL;
const password = process.env.POCKETBASE_ADMIN_PASSWORD;

if (!url || !email || !password) {
  console.error(
    'Missing env vars. Fill PUBLIC_POCKETBASE_URL, POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD in .env',
  );
  process.exit(1);
}

const STAFF_COLLECTION = 'staff';
const CONTENT_COLLECTIONS = ['techniques', 'services', 'courses', 'team', 'clients', 'why_items'];
const STAFF_AUTH_RULE = '@request.auth.id != ""';

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const pb = new PocketBase(url as string);
pb.beforeSend = (_u, options) => ({
  url: _u,
  options: {
    ...options,
    headers: {
      ...(options.headers as Record<string, string> | undefined),
      'User-Agent': BROWSER_UA,
      'Accept-Language': 'en-US,en;q=0.9',
      Accept: 'application/json',
    },
  },
});

const ALLOWED_ORIGINS = [
  'http://localhost:4321',
  'http://localhost:4173',
  'http://127.0.0.1:4321',
  'http://127.0.0.1:4173',
  'https://sinergiaocupacional.com',
];

async function ensureStaffCollection() {
  try {
    const col = await pb.collections.getOne(STAFF_COLLECTION);
    if (col.type !== 'auth') throw new Error(`"${STAFF_COLLECTION}" ya existe pero no es auth`);
    console.log(`  "${STAFF_COLLECTION}" ya existe (auth)`);
    await pb.collections.update(col.id, {
      listRule: STAFF_AUTH_RULE,
      viewRule: STAFF_AUTH_RULE,
      createRule: STAFF_AUTH_RULE,
      updateRule: STAFF_AUTH_RULE,
      deleteRule: STAFF_AUTH_RULE,
    });
    console.log(`  reglas de "${STAFF_COLLECTION}" actualizadas`);
    return col;
  } catch (err) {
    if ((err as Error).message?.includes('ya existe')) throw err;
    console.log(`  creando colección auth "${STAFF_COLLECTION}"`);
    return pb.collections.create({
      name: STAFF_COLLECTION,
      type: 'auth',
      listRule: STAFF_AUTH_RULE,
      viewRule: STAFF_AUTH_RULE,
      createRule: STAFF_AUTH_RULE,
      updateRule: STAFF_AUTH_RULE,
      deleteRule: STAFF_AUTH_RULE,
      options: { minPasswordLength: 8 },
      indexes: [],
    });
  }
}

async function ensureContentRules() {
  for (const name of CONTENT_COLLECTIONS) {
    const col = await pb.collections.getOne(name);
    const patch: Record<string, unknown> = {
      createRule: STAFF_AUTH_RULE,
      updateRule: STAFF_AUTH_RULE,
      deleteRule: STAFF_AUTH_RULE,
    };
    const changed = Object.entries(patch).some(([k, v]) => (col as unknown as Record<string, unknown>)[k] !== v);
    if (!changed) {
      console.log(`  "${name}" ya tiene reglas de staff`);
      continue;
    }
    await pb.collections.update(col.id, patch);
    console.log(`  "${name}": create/update/delete -> staff`);
  }

  // settings: permitir edición a staff (list/view públicos)
  const settings = await pb.collections.getOne('settings');
  if (settings.updateRule !== STAFF_AUTH_RULE) {
    await pb.collections.update(settings.id, { updateRule: STAFF_AUTH_RULE });
    console.log('  "settings": update -> staff');
  }

  // messages: lectura/gestión solo para staff; creación pública (formulario)
  const messages = await pb.collections.getOne('messages');
  const mk = (v: unknown) => v ?? '';
  const msgsPatch: Record<string, unknown> = {};
  if (mk(messages.listRule) !== STAFF_AUTH_RULE) msgsPatch.listRule = STAFF_AUTH_RULE;
  if (mk(messages.viewRule) !== STAFF_AUTH_RULE) msgsPatch.viewRule = STAFF_AUTH_RULE;
  if (mk(messages.updateRule) !== STAFF_AUTH_RULE) msgsPatch.updateRule = STAFF_AUTH_RULE;
  if (mk(messages.deleteRule) !== STAFF_AUTH_RULE) msgsPatch.deleteRule = STAFF_AUTH_RULE;
  if (Object.keys(msgsPatch).length) {
    await pb.collections.update(messages.id, msgsPatch);
    console.log('  "messages": list/view/update/delete -> staff (creación pública intacta)');
  } else {
    console.log('  "messages" ya tiene reglas de staff');
  }
}

async function configureCors() {
  const settings = (await pb.send('/api/settings', { requestKey: 'settings-' + Date.now() })) as {
    meta?: { allowedOrigins?: unknown };
  };
  const current = Array.isArray(settings.meta?.allowedOrigins) ? settings.meta.allowedOrigins : [];
  const merged = Array.from(new Set<string>([...(current as string[]), ...ALLOWED_ORIGINS]));
  const changed =
    merged.length !== (current as string[]).length ||
    merged.some((o, i) => o !== (current as string[])[i]);
  if (!changed) {
    console.log('  CORS: orígenes ya configurados');
    return;
  }
  await pb.send('/api/settings', {
    method: 'PATCH',
    body: { meta: { ...settings.meta, allowedOrigins: merged } },
    requestKey: 'settings-update-' + Date.now(),
  });
  console.log(`  CORS orígenes: ${merged.join(', ')}`);
}

async function ensureCoursesFields() {
  const col = await pb.collections.getOne('courses');
  const target = ['caption', 'characteristics'];
  const fields = (col.fields ?? []).slice();
  const known = new Set(fields.map((f) => f.name));
  const toAdd = target.filter((n) => !known.has(n));
  if (toAdd.length) {
    fields.push(...(toAdd.map((name) => ({ name, type: 'editor' })) as unknown as CollectionField[]));
    await pb.collections.update(col.id, { fields });
    console.log(`  "courses": agregados campos ${toAdd.join(', ')} (editor)`);
    return;
  }
  const toUpgrade = fields.filter((f) => target.includes(f.name) && f.type !== 'editor');
  if (toUpgrade.length) {
    // PocketBase no permite cambiar el tipo de un campo existente:
    // se elimina y se vuelve a crear como editor (los campos están vacíos).
    const names = new Set(toUpgrade.map((f) => f.name));
    const next = [
      ...fields.filter((f) => !names.has(f.name)),
      ...(toUpgrade.map((f) => ({ name: f.name, type: 'editor' })) as unknown as CollectionField[]),
    ];
    await pb.collections.update(col.id, { fields: next });
    console.log(`  "courses": campos ${toUpgrade.map((f) => f.name).join(', ')} recreados como editor`);
    return;
  }
  console.log('  "courses" ya tiene caption y characteristics como editor');
}

async function ensureFirstStaff() {
  const staffEmail = (process.env.POCKETBASE_STAFF_EMAIL || 'staff@sinergiaocupacional.com').trim().toLowerCase();
  let staffPassword = (process.env.POCKETBASE_STAFF_PASSWORD || '').trim();

  const existing = await pb.collection(STAFF_COLLECTION).getFullList({ filter: `email = '${staffEmail}'` });
  if (existing.length) {
    console.log(`  primer usuario de staff ya existe (${staffEmail})`);
    return null;
  }

  if (!staffPassword) {
    staffPassword = crypto.randomBytes(9).toString('base64url');
  }
  await pb.collection(STAFF_COLLECTION).create({
    email: staffEmail,
    password: staffPassword,
    passwordConfirm: staffPassword,
  });
  return { staffEmail, staffPassword };
}

async function main() {
  console.log(`Conectando a PocketBase en ${url}`);
  await pb.collection('_superusers').authWithPassword(email as string, password as string);

  console.log('Asegurando colección staff...');
  await ensureStaffCollection();

  console.log('Ajustando reglas de acceso...');
  await ensureContentRules();

  console.log('Asegurando campos de courses...');
  await ensureCoursesFields();

  console.log('Configurando CORS...');
  await configureCors();

  console.log('Creando primer usuario staff...');
  const created = await ensureFirstStaff();

  console.log('\nPanel configurado.');
  if (created) {
    console.log('\nCredenciales iniciales del panel (nuevo usuario):');
    console.log('  URL:    /admin');
    console.log(`  Email:  ${created.staffEmail}`);
    console.log(`  Password: ${created.staffPassword}`);
    console.log('\nCámbiala desde el panel (sección Usuarios).');
  }
}

main().catch((err) => {
  console.error('Setup falló:', err);
  process.exit(1);
});