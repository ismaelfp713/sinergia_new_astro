import { Injectable, computed, signal } from '@angular/core';

const TOKEN_KEY = 'sinergia_admin_token';
const USER_KEY = 'sinergia_admin_user';

export interface PbRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  readonly url: string = (import.meta.env.PUBLIC_POCKETBASE_URL ?? '').replace(/\/+$/, '');

  readonly token = signal<string | null>(this.readStorage(TOKEN_KEY));
  readonly user = signal<PbRecord | null>(this.readUser());
  readonly isAuthed = computed(() => !!this.token() && !!this.user());

  private readUser(): PbRecord | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as PbRecord) : null;
    } catch {
      return null;
    }
  }

  private readStorage(key: string): string | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  async login(email: string, password: string): Promise<void> {
    const res = await fetch(`${this.url}/api/collections/staff/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: email, password }),
    });
    const body = await this.parseOrThrow(res);
    const token = (body as { token?: string }).token;
    const record = (body as { record?: PbRecord }).record;
    if (!token || !record) throw new Error('Respuesta no válida del servidor');
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(record));
    } catch {
      // storage may be unavailable; session still works in-memory
    }
    this.token.set(token);
    this.user.set(record);
  }

  logout(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // ignore
    }
    this.token.set(null);
    this.user.set(null);
  }

  fileUrl(record: PbRecord, filename: string): string {
    if (!this.url || !filename || !record?.id || !record?.collectionId) return '';
    return `${this.url}/api/files/${record.collectionId}/${record.id}/${encodeURIComponent(filename)}`;
  }

  async list(name: string, sort = 'sort'): Promise<PbRecord[]> {
    const res = await fetch(
      `${this.url}/api/collections/${name}/records?perPage=200&sort=${encodeURIComponent(sort)}&skipTotal=1`,
      { headers: this.headers() },
    );
    const body = await this.parseOrThrow(res);
    return ((body as { items?: PbRecord[] }).items ?? []).filter((r) => r != null) as PbRecord[];
  }

  async create(name: string, form: FormData): Promise<PbRecord> {
    const res = await fetch(`${this.url}/api/collections/${name}/records`, {
      method: 'POST',
      headers: this.headers(),
      body: form,
    });
    return (await this.parseOrThrow(res)) as PbRecord;
  }

  async update(name: string, id: string, form: FormData): Promise<PbRecord> {
    const res = await fetch(`${this.url}/api/collections/${name}/records/${id}`, {
      method: 'PATCH',
      headers: this.headers(),
      body: form,
    });
    return (await this.parseOrThrow(res)) as PbRecord;
  }

  async remove(name: string, id: string): Promise<void> {
    const res = await fetch(`${this.url}/api/collections/${name}/records/${id}`, {
      method: 'DELETE',
      headers: this.headers(),
    });
    await this.parseOrThrow(res);
  }

  async countNewMessages(): Promise<number> {
    try {
      const res = await fetch(
        `${this.url}/api/collections/messages/records?perPage=1&filter=${encodeURIComponent(
          `status = 'new'`,
        )}&skipTotal=1`,
        { headers: this.headers() },
      );
      const body = await this.parseOrThrow(res);
      return ((body as { totalItems?: number }).totalItems ?? 0) as number;
    } catch {
      return 0;
    }
  }

  private headers(): HeadersInit {
    const t = this.token();
    return t ? { Accept: 'application/json', Authorization: t } : { Accept: 'application/json' };
  }

  private async parseOrThrow(res: Response): Promise<unknown> {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    if (res.ok) return body ?? {};
    const data = (body as { data?: unknown })?.data;
    const fieldErr = data && typeof data === 'object'
      ? Object.values(data).find((v) => (v as { message?: string })?.message)
      : null;
    const msg =
      (body as { message?: string })?.message ??
      (fieldErr ? (fieldErr as { message: string }).message : '') ??
      `Error ${res.status}`;
    throw new Error(String(msg));
  }
}