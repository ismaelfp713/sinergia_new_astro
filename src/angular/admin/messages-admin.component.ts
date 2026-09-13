import { Component, inject, output, signal, type OnInit } from '@angular/core';
import { AdminService, type PbRecord } from './admin.service';
import { ToastService } from './toast.service';
import { ConfirmService } from './confirm.service';

@Component({
  selector: 'app-messages-admin',
  standalone: true,
  template: `
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-xl font-bold text-slate-800">Mensajes recibidos</h2>
      <div class="flex items-center gap-2">
        @if (loading()) {
          <span class="text-[13px] text-slate-400"><i class="fa fa-refresh fa-spin mr-1" aria-hidden="true"></i>Cargando…</span>
        }
        <button
          type="button"
          class="rounded-lg border border-slate-300 px-3 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50"
          (click)="load()"
        >
          <i class="fa fa-refresh mr-1" aria-hidden="true"></i>Recargar
        </button>
      </div>
    </div>

    @if (error()) {
      <div class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{{ error() }}</div>
    }

    <div class="space-y-3">
      @if (!messages().length && !loading()) {
        <div class="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center text-[14px] text-slate-400">
          No hay mensajes todavía.
        </div>
      }
      @for (m of messages(); track m.id) {
        <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" [class.ring-2]="!isRead(m)" [class.ring-amber-200]="!isRead(m)">
          <button
            type="button"
            class="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-left transition-colors hover:bg-slate-50"
            (click)="toggle(m.id)"
          >
            <span
              class="inline-flex w-[68px] justify-center rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide"
              [class]="isRead(m) ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'"
            >
              {{ isRead(m) ? 'Leído' : 'Nuevo' }}
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate font-semibold text-slate-800">{{ str(m, 'subject') }}</span>
              <span class="block truncate text-[12px] text-slate-500">
                {{ str(m, 'name') }} · {{ str(m, 'email') }}
              </span>
            </span>
            <span class="text-[12px] text-slate-400">{{ date(m.created) }}</span>
            <i class="fa flex w-4 justify-center text-slate-400" [class]="expanded.get(m.id) ? 'fa-chevron-up' : 'fa-chevron-down'" aria-hidden="true"></i>
          </button>

          @if (expanded.get(m.id)) {
            <div class="border-t border-slate-100 px-4 py-4" [innerHTML]="str(m, 'message')"></div>
            <div class="flex flex-wrap items-center gap-2 border-t border-slate-100 px-4 py-3">
              @if (!isRead(m)) {
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-primary-dark"
                  (click)="markRead(m)"
                >
                  <i class="fa fa-check" aria-hidden="true"></i> Marcar como leído
                </button>
              }
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 text-[12px] font-semibold text-red-600 transition-colors hover:bg-red-50"
                (click)="remove(m)"
              >
                <i class="fa fa-trash" aria-hidden="true"></i> Eliminar
              </button>
              <a
                [href]="'mailto:' + str(m, 'email')"
                class="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-[12px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                <i class="fa fa-reply" aria-hidden="true"></i> Responder por email
              </a>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class MessagesAdminComponent implements OnInit {
  private admin = inject(AdminService);

  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

  messages = signal<PbRecord[]>([]);
  loading = signal(false);
  error = signal('');
  expanded = new Map<string, boolean>();
  countChange = output<number>();

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const all = await this.admin.list('messages', '-created');
      this.messages.set(all);
      const n = all.filter((m) => (m.status as string) !== 'read').length;
      this.countChange.emit(n);
    } catch (err) {
      this.error.set(String((err as Error).message ?? err));
    } finally {
      this.loading.set(false);
    }
  }

  toggle(id: string): void {
    this.expanded.set(String(id), !this.expanded.get(String(id)));
  }

  isRead(m: PbRecord): boolean {
    return (m.status as string) === 'read';
  }

  markRead(m: PbRecord): void {
    const form = new FormData();
    form.append('status', 'read');
    void this.admin
      .update('messages', m.id, form)
      .then(() => {
        this.load();
        this.toast.success('Mensaje marcado como leído.');
      })
      .catch((err) => {
        const msg = String((err as Error).message ?? err);
        this.error.set(msg);
        this.toast.error(msg);
      });
  }

  async remove(m: PbRecord): Promise<void> {
    const ok = await this.confirm.confirm({
      message: '¿Eliminar este mensaje? Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
    });
    if (!ok) return;
    try {
      await this.admin.remove('messages', m.id);
      await this.load();
      this.toast.success('Mensaje eliminado.');
    } catch (err) {
      const msg = String((err as Error).message ?? err);
      this.error.set(msg);
      this.toast.error(msg);
    }
  }

  date(value: unknown): string {
    if (!value) return '';
    const d = new Date(String(value));
    return isNaN(d.getTime())
      ? ''
      : d.toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  str(m: PbRecord, key: string): string {
    const v = m[key];
    return v == null ? '' : String(v);
  }
}