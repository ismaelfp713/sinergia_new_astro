import { Injectable } from '@angular/core';
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
} from '../lib/site-content';
import { cleanText } from '../lib/html-text';

interface PbRecord {
  id: string;
  collectionId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class PbService {
  readonly url: string | undefined = (import.meta.env.PUBLIC_POCKETBASE_URL ?? '').replace(/\/+$/, '');

  private cached: SiteContent | null = null;
  private inflight: Promise<SiteContent> | null = null;

  async getContent(): Promise<SiteContent> {
    if (this.cached) return this.cached;
    if (this.inflight) return this.inflight;
    this.inflight = this.load().then((content) => {
      this.cached = content;
      return content;
    });
    return this.inflight;
  }

  fileUrl(record: PbRecord, filename: string): string {
    if (!this.url || !filename || !record?.id || !record?.collectionId) return '';
    return `${this.url}/api/files/${record.collectionId}/${record.id}/${encodeURIComponent(filename)}`;
  }

  async fetchAll(name: string, sort = 'sort'): Promise<PbRecord[]> {
    if (!this.url) return [];
    const query = sort ? `?perPage=200&sort=${sort}&skipTotal=1` : '?perPage=200&skipTotal=1';
    const res = await fetch(`${this.url}/api/collections/${name}/records${query}`);
    if (!res.ok) throw new Error(`PocketBase ${name} ${res.status}`);
    const data = await res.json();
    return (data.items ?? []) as PbRecord[];
  }

  private async load(): Promise<SiteContent> {
    const fb = fallbackContent;
    try {
      const [settingsRec, techniques, services, whyItems, courses, team, clients] =
        await Promise.all([
          this.fetchAll('settings', ''),
          this.fetchAll('techniques'),
          this.fetchAll('services'),
          this.fetchAll('why_items'),
          this.fetchAll('courses'),
          this.fetchAll('team'),
          this.fetchAll('clients'),
        ]);

      const servicesMapped = this.mapServices(services, fb.services);
      const coursesMapped = this.mapCourses(courses, fb.courses);
      const teamMapped = this.mapTeam(team, fb.team);
      const clientsMapped = this.mapClients(clients, fb.clients);
      const settingsMapped = this.mapSettings(settingsRec[0], fb.settings);

      return {
        settings: settingsMapped,
        techniques: this.mapTechniques(techniques, fb.techniques),
        services: servicesMapped,
        whyCards: this.mapWhyCards(whyItems, fb.whyCards),
        counters: buildCounters(settingsMapped, coursesMapped, clientsMapped, teamMapped),
        courses: coursesMapped,
        team: teamMapped,
        clients: clientsMapped,
      };
    } catch (err) {
      console.error('PocketBase: usando contenido de respaldo', err);
      return fb;
    }
  }

  private str(record: PbRecord | undefined, ...keys: string[]): string {
    if (!record) return '';
    for (const key of keys) {
      const value = record[key];
      if (typeof value === 'string' && value) return value;
    }
    return '';
  }

  private num(record: PbRecord | undefined, key: string): number {
    if (!record) return 0;
    const value = record[key];
    return typeof value === 'number' ? value : Number(value) || 0;
  }

  private clean(value: string): string {
    return cleanText(value);
  }

  private mapSettings(r: PbRecord | undefined, fb: Settings): Settings {
    return {
      email: this.clean(this.str(r, 'email')) || fb.email || DEFAULT_EMAIL,
      phone1: this.clean(this.str(r, 'phone1')) || fb.phone1,
      phone2: this.clean(this.str(r, 'phone2')) || fb.phone2,
      phone3: this.clean(this.str(r, 'phone3')) || fb.phone3,
      address: this.clean(this.str(r, 'address')) || fb.address,
      foundedYear: this.num(r, 'founded_year') || fb.foundedYear,
      introYouTube: this.str(r, 'intro_youtube') || fb.introYouTube,
      aboutYouTube: this.str(r, 'about_youtube') || fb.aboutYouTube,
      aboutExperience: this.clean(this.str(r, 'about_experience')) || fb.aboutExperience,
      aboutImpact: this.clean(this.str(r, 'about_impact')) || fb.aboutImpact,
      mapEmbed: this.str(r, 'map_embed') || fb.mapEmbed,
      logo: this.fileUrl(r!, this.str(r, 'logo')) || fb.logo,
      favicon: this.fileUrl(r!, this.str(r, 'favicon')) || fb.favicon,
      heroBg: this.fileUrl(r!, this.str(r, 'hero_bg')) || fb.heroBg,
      aboutImg1: this.fileUrl(r!, this.str(r, 'about_img1')) || fb.aboutImg1,
      aboutImg2: this.fileUrl(r!, this.str(r, 'about_img2')) || fb.aboutImg2,
    };
  }

  private mapTechniques(records: PbRecord[], fb: Technique[]): Technique[] {
    if (!records.length) return fb;
    return records.map((r, i) => ({
      id: this.str(r, 'id') || String(i),
      icon: this.str(r, 'icon') || fb[i]?.icon || 'lightbulb',
      title: this.clean(this.str(r, 'title')),
      description: this.clean(this.str(r, 'description')),
    }));
  }

  private mapServices(records: PbRecord[], fb: Service[]): Service[] {
    if (!records.length) return fb;
    return records.map((r, i) => ({
      id: this.str(r, 'id') || String(i),
      icon: this.str(r, 'icon') || fb[i]?.icon || 'clipboard',
      title: this.clean(this.str(r, 'title')),
      description: this.clean(this.str(r, 'description')),
    }));
  }

  private mapWhyCards(records: PbRecord[], fb: WhyCard[]): WhyCard[] {
    if (!records.length) return fb;
    const grouped = new Map<string, PbRecord[]>();
    for (const r of records) {
      const section = this.str(r, 'section') || 'why1';
      grouped.set(section, [...(grouped.get(section) ?? []), r]);
    }
    return fb.map((card) => {
      const group = grouped.get(card.section) ?? [];
      const icon = group.length ? this.str(group[0], 'icon') : '';
      return {
        ...card,
        icon: icon || card.icon,
        items: group.length ? group.map((r) => this.clean(this.str(r, 'item'))).filter(Boolean) : card.items,
      };
    });
  }

  private mapCourses(records: PbRecord[], fb: Course[]): Course[] {
    if (!records.length) return fb;
    return records.map((r, i) => ({
      id: this.str(r, 'id') || String(i),
      title: this.clean(this.str(r, 'title')),
      description: this.clean(this.str(r, 'description')),
      image: this.fileUrl(r, this.str(r, 'image')) || fb[i]?.image || '/images/forklift.jpg',
    }));
  }

  private mapTeam(records: PbRecord[], fb: TeamMember[]): TeamMember[] {
    if (!records.length) return fb;
    return records.map((r, i) => ({
      id: this.str(r, 'id') || String(i),
      name: this.clean(this.str(r, 'name')),
      role: this.clean(this.str(r, 'role')),
      photo: this.fileUrl(r, this.str(r, 'photo')) || fb[i]?.photo || '/images/doc.jpg',
      facebook: this.str(r, 'facebook'),
      instagram: this.str(r, 'instagram'),
      linkedin: this.str(r, 'linkedin'),
    }));
  }

  private mapClients(records: PbRecord[], fb: Client[]): Client[] {
    if (!records.length) return fb;
    return records.map((r, i) => ({
      id: this.str(r, 'id') || String(i),
      name: this.clean(this.str(r, 'name')),
      logo: this.fileUrl(r, this.str(r, 'logo')) || fb[i]?.logo || '',
    }));
  }
}