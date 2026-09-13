import { iconNames } from '../../lib/icon-paths';
import type { PbRecord } from './admin.service';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'icon'
  | 'file'
  | 'wysiwyg'
  | 'url';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  optionLabels?: Record<string, string>;
  accept?: string;
  hint?: string;
  help?: string;
}

export interface ColDef {
  label: string;
  value: (r: PbRecord) => string;
  title?: boolean;
  thumb?: (r: PbRecord) => string | undefined;
}

export interface SectionDef {
  key: string;
  label: string;
  fa: string;
  collection: string;
  fields: FieldDef[];
  cols: ColDef[];
  sort?: string;
}

const INPUTS = 'text,url,select,icon,textarea,wysiwyg';

export const WHY_SECTIONS = ['why1', 'why2', 'why3'];

export const ICON_NAMES = iconNames;

export const SERVICES_SECTION: SectionDef = {
  key: 'services',
  label: 'Servicios',
  fa: 'fa-cogs',
  collection: 'services',
  sort: 'sort,title',
  fields: [
    { key: 'title', label: 'Título', type: 'text', required: true },
    {
      key: 'description',
      label: 'Descripción',
      type: 'wysiwyg',
      required: true,
      help: 'Editor de texto enriquecido. Se muestra con formato en la página.',
    },
    {
      key: 'icon',
      label: 'Icono',
      type: 'icon',
      required: true,
      options: ICON_NAMES,
      help: 'Icono ilustrativo del servicio.',
    },
    { key: 'sort', label: 'Orden', type: 'number' },
  ],
  cols: [
    { label: 'Servicio', title: true, value: (r) => (r.title as string) ?? '' },
    { label: 'Icono', value: (r) => (r.icon as string) ?? '' },
    {
      label: 'Descripción',
      value: (r) => String((r.description as string) ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 90),
    },
    { label: 'Orden', value: (r) => String((r.sort as number) ?? 0) },
  ],
};

export const COURSES_SECTION: SectionDef = {
  key: 'courses',
  label: 'Cursos',
  fa: 'fa-graduation-cap',
  collection: 'courses',
  sort: 'sort,title',
  fields: [
    { key: 'title', label: 'Título', type: 'text', required: true },
    {
      key: 'caption',
      label: 'Encabezado corto',
      type: 'wysiwyg',
      help: 'Texto destacado que acompaña al título del curso (editor de texto enriquecido).',
    },
    {
      key: 'description',
      label: 'Descripción',
      type: 'wysiwyg',
      required: true,
      help: 'Editor de texto enriquecido.',
    },
    {
      key: 'characteristics',
      label: 'Características',
      type: 'wysiwyg',
      help: 'Características del curso. Usa listas, negritas o párrafos según gustes (editor de texto enriquecido).',
    },
    {
      key: 'image',
      label: 'Imagen',
      type: 'file',
      accept: 'image/*',
      hint: 'Imagen principal del curso (JPG, PNG, WebP).',
    },
    { key: 'sort', label: 'Orden', type: 'number' },
  ],
  cols: [
    {
      label: 'Curso',
      title: true,
      value: (r) => (r.title as string) ?? '',
      thumb: (r) => (r.image ? undefined : undefined),
    },
    {
      label: 'Imagen',
      value: (r) => String((r.image as string) ?? ''),
      thumb: (r) => (r.image as string) ?? '',
    },
    {
      label: 'Encabezado',
      value: (r) => String((r.caption as string) ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 60),
    },
    {
      label: 'Descripción',
      value: (r) => String((r.description as string) ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 90),
    },
    { label: 'Orden', value: (r) => String((r.sort as number) ?? 0) },
  ],
};

export const TEAM_SECTION: SectionDef = {
  key: 'team',
  label: 'Equipo',
  fa: 'fa-users',
  collection: 'team',
  sort: 'sort,name',
  fields: [
    { key: 'name', label: 'Nombre', type: 'text', required: true },
    { key: 'role', label: 'Puesto / Rol', type: 'text' },
    { key: 'photo', label: 'Fotografía', type: 'file', accept: 'image/*' },
    { key: 'facebook', label: 'Facebook', type: 'url' },
    { key: 'instagram', label: 'Instagram', type: 'url' },
    { key: 'linkedin', label: 'LinkedIn', type: 'url' },
    { key: 'sort', label: 'Orden', type: 'number' },
  ],
  cols: [
    {
      label: 'Nombre',
      title: true,
      value: (r) => (r.name as string) ?? '',
      thumb: (r) => (r.photo as string) ?? '',
    },
    { label: 'Puesto', value: (r) => (r.role as string) ?? '' },
    { label: 'Orden', value: (r) => String((r.sort as number) ?? 0) },
  ],
};

export const CLIENTS_SECTION: SectionDef = {
  key: 'clients',
  label: 'Clientes',
  fa: 'fa-building',
  collection: 'clients',
  sort: 'sort,name',
  fields: [
    { key: 'name', label: 'Nombre', type: 'text', required: true },
    { key: 'logo', label: 'Logo', type: 'file', accept: 'image/*' },
    { key: 'sort', label: 'Orden', type: 'number' },
  ],
  cols: [
    {
      label: 'Cliente',
      title: true,
      value: (r) => (r.name as string) ?? '',
      thumb: (r) => (r.logo as string) ?? '',
    },
    { label: 'Orden', value: (r) => String((r.sort as number) ?? 0) },
  ],
};

export const TECHNIQUES_SECTION: SectionDef = {
  key: 'techniques',
  label: 'Técnicas',
  fa: 'fa-puzzle-piece',
  collection: 'techniques',
  sort: 'sort,title',
  fields: [
    { key: 'title', label: 'Título', type: 'text', required: true },
    { key: 'description', label: 'Descripción', type: 'textarea', required: true },
    {
      key: 'icon',
      label: 'Icono',
      type: 'icon',
      required: true,
      options: ICON_NAMES,
    },
    { key: 'sort', label: 'Orden', type: 'number' },
  ],
  cols: [
    { label: 'Técnica', title: true, value: (r) => (r.title as string) ?? '' },
    {
      label: 'Descripción',
      value: (r) => String((r.description as string) ?? '').slice(0, 90),
    },
    { label: 'Icono', value: (r) => (r.icon as string) ?? '' },
    { label: 'Orden', value: (r) => String((r.sort as number) ?? 0) },
  ],
};

export const WHY_ITEMS_SECTION: SectionDef = {
  key: 'whyItems',
  label: 'Porqué elegirnos',
  fa: 'fa-star',
  collection: 'why_items',
  sort: 'section,sort',
  fields: [
    {
      key: 'section',
      label: 'Sección',
      type: 'select',
      required: true,
      options: WHY_SECTIONS,
      optionLabels: {
        why1: 'Tarjeta 1',
        why2: 'Tarjeta 2',
        why3: 'Tarjeta 3',
      },
      help: 'En qué tarjeta de "Por qué elegirnos" aparece este elemento.',
    },
    {
      key: 'icon',
      label: 'Icono (Font Awesome)',
      type: 'text',
      hint: 'Clase de Font Awesome, p. ej. fa-check-circle',
    },
    { key: 'item', label: 'Texto', type: 'textarea', required: true },
    { key: 'sort', label: 'Orden', type: 'number' },
  ],
  cols: [
    {
      label: 'Elemento',
      title: true,
      value: (r) => String((r.item as string) ?? '').slice(0, 70),
    },
    {
      label: 'Sección',
      value: (r) => (r.section as string) ?? '',
    },
    { label: 'Orden', value: (r) => String((r.sort as number) ?? 0) },
  ],
};

export const SETTINGS_FIELDS: FieldDef[] = [
  { key: 'email', label: 'Email de contacto', type: 'text', required: true },
  { key: 'phone1', label: 'Teléfono 1', type: 'text' },
  { key: 'phone2', label: 'Teléfono 2', type: 'text' },
  { key: 'phone3', label: 'Celular / WhatsApp', type: 'text' },
  { key: 'address', label: 'Dirección', type: 'textarea' },
  { key: 'founded_year', label: 'Año de fundación', type: 'number', required: true },
  { key: 'intro_youtube', label: 'YouTube (sección intro)', type: 'text' },
  { key: 'about_youtube', label: 'YouTube (sección nosotros)', type: 'text' },
  { key: 'about_experience', label: 'Texto experiencia', type: 'textarea' },
  { key: 'about_impact', label: 'Texto impacto', type: 'textarea' },
  { key: 'map_embed', label: 'Mapa (embed)', type: 'textarea' },
  { key: 'logo', label: 'Logo', type: 'file', accept: 'image/*' },
  { key: 'favicon', label: 'Favicon', type: 'file', accept: 'image/*' },
  { key: 'hero_bg', label: 'Fondo hero', type: 'file', accept: 'image/*' },
  { key: 'about_img1', label: 'Imagen nosotros 1', type: 'file', accept: 'image/*' },
  { key: 'about_img2', label: 'Imagen nosotros 2', type: 'file', accept: 'image/*' },
];

export function sectionFor(key: string): SectionDef | null {
  for (const s of [
    SERVICES_SECTION,
    COURSES_SECTION,
    TEAM_SECTION,
    CLIENTS_SECTION,
    TECHNIQUES_SECTION,
    WHY_ITEMS_SECTION,
  ]) {
    if (s.key === key) return s;
  }
  return null;
}