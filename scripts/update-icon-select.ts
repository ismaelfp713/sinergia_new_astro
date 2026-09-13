/**
 * Convierte el campo `icon` de las colecciones services/techniques a tipo
 * `select` con la lista de iconos SGV disponibles (registry en icon-paths.ts).
 *
 * Usage:
 *   node --env-file=.env node_modules/.bin/tsx scripts/update-icon-select.ts
 */
import PocketBase, { type RecordModel } from 'pocketbase';
import { iconPaths } from '../src/lib/icon-paths.ts';

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
    'Missing environment variables. Copy .env.example to .env and fill PUBLIC_POCKETBASE_URL, POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD.',
  );
  process.exit(1);
}

const ICONS = Object.keys(iconPaths);

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const pb = new PocketBase(url as string);
pb.beforeSend = (_url, options) => ({
  url: _url,
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

type PbField = {
  name: string;
  type: string;
  system?: boolean;
  required?: boolean;
  [key: string]: unknown;
};

async function convertField(collectionName: string) {
  const col = await pb.collections.getOne(collectionName);
  const field = col.fields.find((f: PbField) => f.name === 'icon');
  if (!field) {
    console.log(`  "${collectionName}": sin campo icon, omitido`);
    return;
  }
  if (field.type === 'select') {
    console.log(`  "${collectionName}": icon ya es select, omitido`);
    return;
  }

  const records = await pb.collection(collectionName).getFullList({ fields: 'id,icon' });
  const saved = new Map<string, string>();
  for (const r of records as unknown as RecordModel[]) {
    if (r.icon) saved.set(r.id, String(r.icon));
  }

  const toSelect = (f: PbField): PbField => ({
    ...f,
    type: 'select',
    required: Boolean(f.required),
    maxSelect: 1,
    values: [...ICONS],
  });

  let changed = false;
  try {
    const newFields = col.fields.map((f: PbField) => (f.name === 'icon' ? toSelect(f) : f));
    await pb.collections.update(col.id, { fields: newFields });
    console.log(`  "${collectionName}": icon -> select (en sitio)`);
    changed = true;
  } catch (err) {
    const msg = (err as Error).message?.split('\n')[0] ?? String(err);
    console.log(`  "${collectionName}": type change rechazado (${msg}), borrando y re-creando el campo`);
    await pb.collections.update(col.id, {
      fields: col.fields.filter((f: PbField) => f.name !== 'icon'),
    });
    const col2 = await pb.collections.getOne(collectionName);
    await pb.collections.update(col2.id, {
      fields: [
        ...col2.fields,
        { name: 'icon', type: 'select', required: false, maxSelect: 1, values: [...ICONS] } as PbField,
      ],
    });
    changed = true;
  }

  for (const [id, icon] of saved) {
    await pb.collection(collectionName).update(id, { icon });
  }
  if (changed) console.log(`  "${collectionName}": ${saved.size} valor(es) de icon restaurado(s)`);
}

async function main() {
  console.log(`Conectando a PocketBase en ${url}`);
  await pb.collection('_superusers').authWithPassword(email as string, password as string);

  await convertField('services');
  await convertField('techniques');

  const services = await pb.collections.getOne('services');
  const iconField = services.fields.find((f: PbField) => f.name === 'icon');
  console.log(
    `\nListo. icon = type=${iconField?.type} values=${(iconField?.values as string[] | undefined)?.length ?? 0}`,
  );
}

main().catch((err) => {
  console.error('Migración falló:', err);
  process.exit(1);
});