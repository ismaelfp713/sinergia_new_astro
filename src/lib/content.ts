import type PocketBase from 'pocketbase';
import {
  fallbackContent,
  DEFAULT_EMAIL,
  buildCounters,
  type SiteContent,
  type Settings,
  type Technique,
  type Service,
  type WhyCard,
  type Course,
  type TeamMember,
  type Client,
} from './site-content';
import { POCKETBASE_URL, pocketbase, pocketbaseFileUrl } from './pocketbase';
import { cleanText } from './html-text';

const TIMEOUT_MS = 5000;

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('PocketBase request timed out')), TIMEOUT_MS);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

function resolveURL(
  pb: PocketBase,
  record: Record<string, unknown>,
  field: string,
  fallbackPath: string,
): string {
  const filename = record[field] as string | undefined;
  if (filename) {
    const url = pocketbaseFileUrl(pb, record as { collectionId: string; id: string }, filename);
    if (url) return url;
  }
  return fallbackPath;
}

async function loadSettings(pb: PocketBase): Promise<Settings> {
  const fallback = fallbackContent.settings;
  try {
    const records = await withTimeout(pb.collection('settings').getFullList({ limit: 1 }));
    const r = records[0];
    if (!r) return fallback;
    return {
      email: cleanText(r.email as string) || fallback.email || DEFAULT_EMAIL,
      phone1: cleanText(r.phone1 as string) || fallback.phone1,
      phone2: cleanText(r.phone2 as string) || fallback.phone2,
      phone3: cleanText(r.phone3 as string) || fallback.phone3,
      address: cleanText(r.address as string) || fallback.address,
      foundedYear: Number(r.founded_year) || fallback.foundedYear,
      introYouTube: (r.intro_youtube as string) || fallback.introYouTube,
      aboutYouTube: (r.about_youtube as string) || fallback.aboutYouTube,
      aboutExperience: cleanText(r.about_experience as string) || fallback.aboutExperience,
      aboutImpact: cleanText(r.about_impact as string) || fallback.aboutImpact,
      mapEmbed: (r.map_embed as string) || fallback.mapEmbed,
      logo: resolveURL(pb, r, 'logo', fallback.logo),
      favicon: resolveURL(pb, r, 'favicon', fallback.favicon),
      heroBg: resolveURL(pb, r, 'hero_bg', fallback.heroBg),
      aboutImg1: resolveURL(pb, r, 'about_img1', fallback.aboutImg1),
      aboutImg2: resolveURL(pb, r, 'about_img2', fallback.aboutImg2),
    };
  } catch {
    return fallback;
  }
}

async function loadTechniques(pb: PocketBase): Promise<Technique[]> {
  try {
    const records = await withTimeout(
      pb.collection('techniques').getFullList({ sort: 'sort', fields: 'id,icon,title,description' }),
    );
    if (!records.length) return fallbackContent.techniques;
    return records.map((r, i) =>
      ({
        id: (r.id as string) || String(i),
        icon: (r.icon as string) || fallbackContent.techniques[i]?.icon || 'lightbulb',
        title: cleanText(r.title as string),
        description: cleanText(r.description as string),
      }),
    );
  } catch {
    return fallbackContent.techniques;
  }
}

async function loadServices(pb: PocketBase): Promise<Service[]> {
  try {
    const records = await withTimeout(
      pb.collection('services').getFullList({ sort: 'sort', fields: 'id,icon,title,description' }),
    );
    if (!records.length) return fallbackContent.services;
    return records.map((r, i) => ({
      id: (r.id as string) || String(i),
      icon: (r.icon as string) || fallbackContent.services[i]?.icon || 'clipboard',
      title: cleanText(r.title as string),
      description: cleanText(r.description as string),
    }));
  } catch {
    return fallbackContent.services;
  }
}

async function loadWhyCards(pb: PocketBase): Promise<WhyCard[]> {
  const fallbackCards = fallbackContent.whyCards;
  try {
    const records = await withTimeout(
      pb.collection('why_items').getFullList({ sort: 'sort', fields: 'id,section,icon,item' }),
    );
    const grouped = new Map<string, { icon: string; items: string[] }>();
    for (const r of records) {
      const section = (r.section as string) || 'why1';
      const entry = grouped.get(section) || { icon: '', items: [] };
      entry.items.push(cleanText(r.item as string));
      grouped.set(section, entry);
    }
    if (grouped.size === 0) return fallbackCards;
    return fallbackCards.map((fb) => {
      const section = fb.section;
      const found = grouped.get(section);
      const iconRecord = records.find((r) => (r.section as string) === section);
      return {
        id: fb.id,
        section,
        icon: (iconRecord?.icon as string) || fb.icon,
        items: found ? found.items : fb.items,
        prev: fb.prev,
        next: fb.next,
      };
    });
  } catch {
    return fallbackCards;
  }
}

async function loadCourses(pb: PocketBase): Promise<Course[]> {
  try {
    const records = await withTimeout(
      pb.collection('courses').getFullList({ sort: 'sort' }),
    );
    if (!records.length) return fallbackContent.courses;
    return records.map((r, i) => ({
      id: (r.id as string) || String(i),
      title: cleanText(r.title as string),
      caption: r.caption as string,
      description: r.description as string,
      characteristics: r.characteristics as string,
      image: resolveURL(pb, r, 'image', fallbackContent.courses[i]?.image || '/images/forklift.jpg'),
    }));
  } catch {
    return fallbackContent.courses;
  }
}

async function loadTeam(pb: PocketBase): Promise<TeamMember[]> {
  try {
    const records = await withTimeout(
      pb.collection('team').getFullList({ sort: 'sort' }),
    );
    if (!records.length) return fallbackContent.team;
    return records.map((r, i) => ({
      id: (r.id as string) || String(i),
      name: cleanText(r.name as string),
      role: cleanText(r.role as string) || '',
      photo: resolveURL(pb, r, 'photo', fallbackContent.team[i]?.photo || '/images/doc.jpg'),
      facebook: (r.facebook as string) || '',
      instagram: (r.instagram as string) || '',
      linkedin: (r.linkedin as string) || '',
    }));
  } catch {
    return fallbackContent.team;
  }
}

async function loadClients(pb: PocketBase): Promise<Client[]> {
  try {
    const records = await withTimeout(
      pb.collection('clients').getFullList({ sort: 'sort' }),
    );
    if (!records.length) return fallbackContent.clients;
    return records.map((r, i) => ({
      id: (r.id as string) || String(i),
      name: cleanText(r.name as string) || '',
      logo: resolveURL(pb, r, 'logo', fallbackContent.clients[i]?.logo || '/images/customers/corning.png'),
    }));
  } catch {
    return fallbackContent.clients;
  }
}

export async function loadSiteContent(): Promise<SiteContent> {
  if (!POCKETBASE_URL) {
    return fallbackContent;
  }

  let pb: PocketBase;
  try {
    pb = pocketbase();
  } catch {
    return fallbackContent;
  }

  try {
    const [settings, techniques, services, whyCards, courses, team, clients] = await Promise.all([
      loadSettings(pb),
      loadTechniques(pb),
      loadServices(pb),
      loadWhyCards(pb),
      loadCourses(pb),
      loadTeam(pb),
      loadClients(pb),
    ]);

    const counters = buildCounters(settings, courses, clients, team);

    return {
      settings,
      techniques,
      services,
      whyCards,
      counters,
      courses,
      team,
      clients,
    };
  } catch {
    return fallbackContent;
  }
}