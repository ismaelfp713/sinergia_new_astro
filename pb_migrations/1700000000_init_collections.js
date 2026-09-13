// Sinergia Ocupacional - initial collections
//
// Drop this file into your PocketBase instance's pb_migrations/ folder and run
// `./pocketbase migrate up` (or just start PocketBase) to create the schema.
// Then populate the data with `npm run seed`.

const publicRead = '';

function text(name, required = false) {
  return { name, type: 'text', required };
}

function editor(name, required = false) {
  return { name, type: 'editor', required };
}

function number(name) {
  return { name, type: 'number' };
}

function file(name, maxSelect = 1) {
  return { name, type: 'file', maxSelect, maxSize: 5242880, mimeTypes: [] };
}

function select(name, values) {
  return { name, type: 'select', required: true, maxSelect: 1, values };
}

function url(name) {
  return { name, type: 'url' };
}

migrate(
  (app) => {
    const collections = [];

    collections.push(
      new Collection({
        type: 'base',
        name: 'settings',
        listRule: publicRead,
        viewRule: publicRead,
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
          text('email'),
          text('phone1'),
          text('phone2'),
          text('phone3'),
          editor('address'),
          text('intro_youtube'),
          text('about_youtube'),
          editor('about_experience'),
          editor('about_impact'),
          text('map_embed'),
          file('logo'),
          file('favicon'),
          file('hero_bg'),
          file('about_img1'),
          file('about_img2'),
        ],
        options: { maxSelect: 1, minSelect: 1 },
      }),
    );

    collections.push(
      new Collection({
        type: 'base',
        name: 'techniques',
        listRule: publicRead,
        viewRule: publicRead,
        fields: [
          text('icon'),
          text('title', true),
          editor('description', true),
          number('sort'),
        ],
      }),
    );

    collections.push(
      new Collection({
        type: 'base',
        name: 'services',
        listRule: publicRead,
        viewRule: publicRead,
        fields: [
          text('icon'),
          text('title', true),
          editor('description', true),
          number('sort'),
        ],
      }),
    );

    collections.push(
      new Collection({
        type: 'base',
        name: 'courses',
        listRule: publicRead,
        viewRule: publicRead,
        fields: [
          text('title', true),
          editor('description', true),
          file('image'),
          number('sort'),
        ],
      }),
    );

    collections.push(
      new Collection({
        type: 'base',
        name: 'team',
        listRule: publicRead,
        viewRule: publicRead,
        fields: [
          text('name', true),
          text('role'),
          file('photo'),
          url('facebook'),
          url('instagram'),
          url('linkedin'),
          number('sort'),
        ],
      }),
    );

    collections.push(
      new Collection({
        type: 'base',
        name: 'clients',
        listRule: publicRead,
        viewRule: publicRead,
        fields: [text('name'), file('logo'), number('sort')],
      }),
    );

    collections.push(
      new Collection({
        type: 'base',
        name: 'why_items',
        listRule: publicRead,
        viewRule: publicRead,
        fields: [
          select('section', ['why1', 'why2', 'why3']),
          text('icon'),
          editor('item', true),
          number('sort'),
        ],
      }),
    );

    collections.push(
      new Collection({
        type: 'base',
        name: 'counters',
        listRule: publicRead,
        viewRule: publicRead,
        fields: [text('label', true), number('value'), number('sort')],
      }),
    );

    collections.push(
      new Collection({
        type: 'base',
        name: 'messages',
        listRule: null,
        viewRule: null,
        createRule:
          "@request.body.name != '' && @request.body.email != '' && @request.body.message != '' && @request.body.status:isset = false",
        updateRule: null,
        deleteRule: null,
        fields: [
          text('name', true),
          text('email', true),
          text('subject'),
          editor('message', true),
          select('status', ['new', 'read']),
        ],
      }),
    );

    collections.forEach((collection) => app.save(collection));
  },
  (app) => {
    const names = [
      'settings',
      'techniques',
      'services',
      'courses',
      'team',
      'clients',
      'why_items',
      'counters',
      'messages',
    ];
    names.forEach((name) => {
      try {
        const collection = app.findCollectionByNameOrId(name);
        app.delete(collection);
      } catch {
        // collection does not exist
      }
    });
  },
);