/**
 * Seeds the PocketBase instance with the site content from the old
 * sinergiaocupacional.com site and ensures the required collections exist.
 *
 * Usage:
 *   node --env-file=.env node_modules/.bin/tsx scripts/seed-pocketbase.ts
 *   or just:  npm run seed
 *
 * Requires (see .env.example):
 *   PUBLIC_POCKETBASE_URL
 *   POCKETBASE_ADMIN_EMAIL
 *   POCKETBASE_ADMIN_PASSWORD
 *
 * Content is only inserted into a collection when it is empty, so your edits
 * in the PocketBase admin are never overwritten. Pass --force to clear and
 * re-seed everything.
 */
import PocketBase, { type RecordModel } from 'pocketbase';
import fs from 'node:fs';
import path from 'node:path';
import { fallbackContent } from '../src/lib/site-content.ts';
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

const adminEmail = email as string;
const adminPassword = password as string;
const FORCE = process.argv.includes('--force');

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

const fieldListRule = '';
const privateRule: string | null = null;

interface FieldSpec {
  name: string;
  type: 'text' | 'editor' | 'number' | 'file' | 'select' | 'url';
  required?: boolean;
  maxSelect?: number;
  values?: string[];
}

interface CollectionSpec {
  name: string;
  fields: FieldSpec[];
  listRule?: string | null;
  viewRule?: string | null;
  createRule?: string | null;
  single?: boolean;
}

const collections: CollectionSpec[] = [
  {
    name: 'settings',
    single: true,
    fields: [
      { name: 'email', type: 'text' },
      { name: 'phone1', type: 'text' },
      { name: 'phone2', type: 'text' },
      { name: 'phone3', type: 'text' },
      { name: 'address', type: 'editor' },
      { name: 'founded_year', type: 'number' },
      { name: 'intro_youtube', type: 'text' },
      { name: 'about_youtube', type: 'text' },
      { name: 'about_experience', type: 'editor' },
      { name: 'about_impact', type: 'editor' },
      { name: 'map_embed', type: 'text' },
      { name: 'logo', type: 'file', maxSelect: 1 },
      { name: 'favicon', type: 'file', maxSelect: 1 },
      { name: 'hero_bg', type: 'file', maxSelect: 1 },
      { name: 'about_img1', type: 'file', maxSelect: 1 },
      { name: 'about_img2', type: 'file', maxSelect: 1 },
    ],
    listRule: fieldListRule,
    viewRule: fieldListRule,
  },
  {
    name: 'techniques',
    fields: [
      { name: 'icon', type: 'select', values: Object.keys(iconPaths) },
      { name: 'title', type: 'text', required: true },
      { name: 'description', type: 'editor', required: true },
      { name: 'sort', type: 'number' },
    ],
    listRule: fieldListRule,
    viewRule: fieldListRule,
  },
  {
    name: 'services',
    fields: [
      { name: 'icon', type: 'select', values: Object.keys(iconPaths) },
      { name: 'title', type: 'text', required: true },
      { name: 'description', type: 'editor', required: true },
      { name: 'sort', type: 'number' },
    ],
    listRule: fieldListRule,
    viewRule: fieldListRule,
  },
  {
    name: 'courses',
    fields: [
      { name: 'title', type: 'text', required: true },
      { name: 'description', type: 'editor', required: true },
      { name: 'image', type: 'file', maxSelect: 1 },
      { name: 'sort', type: 'number' },
    ],
    listRule: fieldListRule,
    viewRule: fieldListRule,
  },
  {
    name: 'team',
    fields: [
      { name: 'name', type: 'text', required: true },
      { name: 'role', type: 'text' },
      { name: 'photo', type: 'file', maxSelect: 1 },
      { name: 'facebook', type: 'url' },
      { name: 'instagram', type: 'url' },
      { name: 'linkedin', type: 'url' },
      { name: 'sort', type: 'number' },
    ],
    listRule: fieldListRule,
    viewRule: fieldListRule,
  },
  {
    name: 'clients',
    fields: [
      { name: 'name', type: 'text' },
      { name: 'logo', type: 'file', maxSelect: 1 },
      { name: 'sort', type: 'number' },
    ],
    listRule: fieldListRule,
    viewRule: fieldListRule,
  },
  {
    name: 'why_items',
    fields: [
      { name: 'section', type: 'select', required: true, values: ['why1', 'why2', 'why3'] },
      { name: 'icon', type: 'text' },
      { name: 'item', type: 'editor', required: true },
      { name: 'sort', type: 'number' },
    ],
    listRule: fieldListRule,
    viewRule: fieldListRule,
  },
  {
    name: 'counters',
    fields: [
      { name: 'label', type: 'text', required: true },
      { name: 'value', type: 'number', required: true },
      { name: 'sort', type: 'number' },
    ],
    listRule: fieldListRule,
    viewRule: fieldListRule,
  },
  {
    name: 'messages',
    fields: [
      { name: 'name', type: 'text', required: true },
      { name: 'email', type: 'text', required: true },
      { name: 'subject', type: 'text' },
      { name: 'message', type: 'editor', required: true },
      { name: 'status', type: 'select', values: ['new', 'read'] },
    ],
    createRule:
      "@request.body.name != '' && @request.body.email != '' && @request.body.message != '' && @request.body.status:isset = false",
  },
];

function buildFields(spec: FieldSpec[]) {
  return spec.map((f) => {
    const base: Record<string, unknown> = { name: f.name, type: f.type };
    if (f.type === 'text') base.required = Boolean(f.required);
    if (f.type === 'editor') base.required = Boolean(f.required);
    if (f.type === 'number') base.required = Boolean(f.required);
    if (f.type === 'file') {
      base.maxSelect = f.maxSelect ?? 1;
      base.maxSize = 5242880;
      base.mimeTypes = [];
    }
    if (f.type === 'select') {
      base.required = Boolean(f.required);
      base.maxSelect = 1;
      base.values = f.values;
    }
    return base;
  });
}

async function ensureCollection(spec: CollectionSpec): Promise<RecordModel> {
  try {
    return await pb.collections.getOne(spec.name);
  } catch {
    console.log(`  creating collection "${spec.name}"`);
    return pb.collections.create({
      name: spec.name,
      type: 'base',
      fields: [
        {
          name: 'id',
          type: 'text',
          system: true,
          primaryKey: true,
          autogenerate: true,
          autogeneratePattern: '[a-z0-9]{15}',
        },
        { name: 'created', type: 'date', system: true, onCreate: true, onUpdate: false },
        { name: 'updated', type: 'date', system: true, onUpdate: true, onCreate: false },
        ...buildFields(spec.fields),
      ],
      listRule: spec.listRule ?? privateRule,
      viewRule: spec.viewRule ?? privateRule,
      createRule: spec.createRule ?? privateRule,
      updateRule: privateRule,
      deleteRule: privateRule,
      options: spec.single ? { maxSelect: 1, minSelect: 1 } : {},
      indexes: [],
    });
  }
}

async function syncSettingsFields() {
  const spec = collections.find((c) => c.name === 'settings');
  if (!spec) return;
  const col = await pb.collections.getOne('settings');
  const existing = new Set(col.fields.map((f) => f.name));
  const missing = spec.fields.filter((f) => !existing.has(f.name));
  if (missing.length === 0) return;
  const newFields = missing.map((f) => buildFields([f])[0]);
  await pb.collections.update(col.id, { fields: [...col.fields, ...newFields] });
  console.log(`  added fields to "settings": ${missing.map((f) => f.name).join(', ')}`);
}

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

function localFile(relPath: string): File {
  const abs = path.resolve(process.cwd(), 'public', relPath.replace(/^\//, ''));
  const buffer = fs.readFileSync(abs);
  const ext = path.extname(abs).toLowerCase();
  return new File([buffer as unknown as BlobPart], path.basename(abs), {
    type: MIME[ext] ?? 'application/octet-stream',
  });
}

async function uploadSettingsImages() {
  const records = await pb.collection('settings').getFullList();
  if (!records.length) return;
  const rec = records[0];
  const files: Array<{ field: string; rel: string }> = [
    { field: 'logo', rel: '/img/logo2.jpg' },
    { field: 'favicon', rel: '/favicon.png' },
    { field: 'hero_bg', rel: '/img/intro-bg2.png' },
    { field: 'about_img1', rel: '/img/dandocurso.jpg' },
    { field: 'about_img2', rel: '/img/exposicion.jpg' },
  ];
  const fd = new FormData();
  let changed = false;
  for (const it of files) {
    if (rec[it.field]) continue;
    fd.append(it.field, localFile(it.rel));
    changed = true;
  }
  if (!changed) return;
  await pb.collection('settings').update(rec.id, fd);
  console.log('  uploaded images to "settings" (logo, favicon, hero, about)');
}

async function uploadCollectionImages(
  name: string,
  field: string,
  records: RecordModel[],
  files: Array<{ match: string; rel: string }>,
) {
  for (const it of files) {
    const rec = records.find(
      (r) => (r.title as string) === it.match || (r.name as string) === it.match,
    );
    if (!rec || rec[field]) continue;
    const single = new FormData();
    single.append(field, localFile(it.rel));
    await pb.collection(name).update(rec.id, single);
    console.log(`  uploaded "${it.rel}" -> ${name}.${field}`);
  }
}

async function seedCollection(name: string, records: Record<string, unknown>[]) {
  const collection = pb.collection(name);
  const existing = await collection.getFullList();
  if (!FORCE && existing.length > 0) {
    console.log(`  "${name}" already has ${existing.length} record(s) — skipped (use --force to reseed)`);
    return;
  }
  if (FORCE && existing.length > 0) {
    for (const record of existing) {
      await collection.delete(record.id);
    }
    console.log(`  cleared ${existing.length} record(s) from "${name}"`);
  }
  for (const record of records) {
    await collection.create(record);
  }
  console.log(`  seeded ${records.length} record(s) into "${name}"`);
}

async function seedSettings() {
  const S = fallbackContent.settings;
  const data = {
    email: S.email,
    phone1: S.phone1,
    phone2: S.phone2,
    phone3: S.phone3,
    address: S.address,
    founded_year: S.foundedYear,
    intro_youtube: S.introYouTube,
    about_youtube: S.aboutYouTube,
    about_experience: S.aboutExperience,
    about_impact: S.aboutImpact,
    map_embed: S.mapEmbed,
  };

  const records = await pb.collection('settings').getFullList();
  if (!FORCE && records.length > 0) {
    console.log(`  "settings" already has a record — skipped (use --force to overwrite)`);
    return;
  }
  if (records.length > 0) {
    await pb.collection('settings').update(records[0].id, data);
    console.log('  updated "settings"');
  } else {
    await pb.collection('settings').create({ id: 'settings', ...data });
    console.log('  created "settings"');
  }
}

async function main() {
  console.log(`Connecting to PocketBase at ${url}`);
  await pb.collection('_superusers').authWithPassword(adminEmail, adminPassword);

  console.log('Ensuring collections...');
  const created: RecordModel[] = [];
  for (const spec of collections) {
    const col = await ensureCollection(spec);
    created.push(col);
    if (spec.name === 'settings') {
      await syncSettingsFields();
    }
  }

  console.log('Seeding content...');
  await seedSettings();
  await uploadSettingsImages();

  await seedCollection(
    'techniques',
    fallbackContent.techniques.map((t, i) => ({
      icon: t.icon,
      title: t.title,
      description: t.description,
      sort: i,
    })),
  );

  await seedCollection(
    'services',
    fallbackContent.services.map((s, i) => ({
      icon: s.icon,
      title: s.title,
      description: s.description,
      sort: i,
    })),
  );

  await seedCollection(
    'courses',
    fallbackContent.courses.map((c, i) => ({
      title: c.title,
      description: c.description,
      sort: i,
    })),
  );

  const courseFiles = fallbackContent.courses.map((c) => ({
    match: c.title,
    rel: c.image,
  }));
  await uploadCollectionImages('courses', 'image', await pb.collection('courses').getFullList(), courseFiles);

  await seedCollection(
    'team',
    fallbackContent.team.map((m, i) => ({
      name: m.name,
      role: m.role,
      facebook: m.facebook || null,
      instagram: m.instagram || null,
      linkedin: m.linkedin || null,
      sort: i,
    })),
  );

  const teamFiles = fallbackContent.team.map((m) => ({
    match: m.name,
    rel: m.photo,
  }));
  await uploadCollectionImages('team', 'photo', await pb.collection('team').getFullList(), teamFiles);

  await seedCollection(
    'clients',
    fallbackContent.clients.map((c, i) => ({ name: c.name, sort: i })),
  );

  const clientFiles = fallbackContent.clients.map((c) => ({
    match: c.name,
    rel: c.logo,
  }));
  await uploadCollectionImages('clients', 'logo', await pb.collection('clients').getFullList(), clientFiles);

  const whyRecords: Record<string, unknown>[] = [];
  fallbackContent.whyCards.forEach((card, cardIndex) => {
    card.items.forEach((item, itemIndex) => {
      whyRecords.push({ section: card.section, icon: card.icon, item, sort: cardIndex * 100 + itemIndex });
    });
  });
  await seedCollection('why_items', whyRecords);

  console.log('\nDone! Now add PUBLIC_POCKETBASE_URL to .env and rebuild the site.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});