import { Component, effect, inject, input, signal, type OnInit } from '@angular/core';
import { AdminService, type PbRecord } from './admin.service';
import { AdminFieldEditorComponent } from './admin-field-editor.component';
import type { SectionDef } from './field-defs';
import { ToastService } from './toast.service';
import { ConfirmService } from './confirm.service';

@Component({
  selector: 'app-crud-section',
  standalone: true,
  imports: [AdminFieldEditorComponent],
  template: `
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-xl font-bold text-slate-800">{{ section().label }}</h2>
      <div class="flex items-center gap-2">
        @if (loading()) {
          <span class="inline-flex items-center gap-2 text-[13px] text-slate-400">
            <i class="fa fa-refresh fa-spin" aria-hidden="true"></i> Cargando…
          </span>
        }
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
          (click)="openNew()"
        >
          <i class="fa fa-plus" aria-hidden="true"></i>
          Nuevo
        </button>
      </div>
    </div>

    @if (error()) {
      <div class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
        <i class="fa fa-exclamation-triangle mr-1" aria-hidden="true"></i>
        {{ error() }}
      </div>
    }

    <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      @if (!records().length && !loading()) {
        <div class="px-4 py-10 text-center text-[14px] text-slate-400">
          No hay elementos todavía. Agrega el primero.
        </div>
      } @else {
        <table class="w-full min-w-[560px] text-left text-[13px]">
          <thead class="border-b border-slate-200 bg-slate-50 text-[12px] uppercase tracking-wide text-slate-500">
            <tr>
              @for (col of section().cols; track col.label) {
                <th class="px-4 py-3 font-semibold">{{ col.label }}</th>
              }
              <th class="px-4 py-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (r of records(); track r.id) {
              <tr class="group transition-colors hover:bg-slate-50">
                @for (col of section().cols; track col.label) {
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      @if (col.thumb?.(r)) {
                        <img [src]="filePreview(r, col.thumb!(r))" alt="" class="h-10 w-14 shrink-0 rounded object-cover ring-1 ring-slate-200" />
                      }
                      <div>
                        <div [class]="col.title ? 'font-semibold text-slate-800' : 'text-slate-600'" [textContent]="col.value(r)"></div>
                      </div>
                    </div>
                  </td>
                }
                <td class="px-4 py-3 text-right">
                  <div class="inline-flex items-center gap-1">
                    <button
                      type="button"
                      class="rounded-md px-2.5 py-1.5 text-[12px] font-medium text-primary transition-colors hover:bg-primary/10"
                      (click)="openEdit(r)"
                    >
                      <i class="fa fa-pencil mr-1" aria-hidden="true"></i>Editar
                    </button>
                    <button
                      type="button"
                      class="rounded-md px-2.5 py-1.5 text-[12px] font-medium text-red-600 transition-colors hover:bg-red-50"
                      (click)="confirmDelete(r)"
                    >
                      <i class="fa fa-trash mr-1" aria-hidden="true"></i>Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>

    @if (editingId() != null || isNew()) {
      <div id="crud-overlay" class="fixed inset-0 z-[1000] flex items-start justify-end bg-slate-900/30 backdrop-blur-[1px]" (click)="close($event)">
        <div
          class="h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl"
          (click)="$event.stopPropagation()"
        >
          <div class="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
            <h3 class="text-[16px] font-bold text-slate-800">
              {{ isNew() ? 'Nuevo elemento' : 'Editar elemento' }}
              <span class="ml-1 font-normal text-slate-400">· {{ section().label }}</span>
            </h3>
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              (click)="close(null)"
              aria-label="Cerrar"
            >
              <i class="fa fa-times" aria-hidden="true"></i>
            </button>
          </div>

          <div class="px-6 py-5">
            @if (saving()) {
              <div class="py-20 text-center text-slate-400">
                <i class="fa fa-refresh fa-spin text-3xl" aria-hidden="true"></i>
                <p class="mt-3 text-[13px]">Guardando…</p>
              </div>
            } @else {
              <app-admin-field-editor [fields]="section().fields" [record]="model" (changed)="onChanged()" />
              @if (error()) {
                <div class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                  <i class="fa fa-exclamation-triangle mr-1" aria-hidden="true"></i>
                  {{ error() }}
                </div>
              }
              <div class="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
                @if (!isNew()) {
                  <span class="mr-auto inline-flex items-center gap-1.5 text-[12px] text-slate-400">
                    <i class="fa fa-info-circle" aria-hidden="true"></i>
                    Creado: {{ createdAt() }}
                  </span>
                }
                <button
                  type="button"
                  class="rounded-lg border border-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                  (click)="close(null)"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  class="rounded-lg bg-primary px-5 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
                  (click)="save()"
                >
                  <i class="fa fa-check mr-1" aria-hidden="true"></i>
                  Guardar
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class CrudSectionComponent implements OnInit {
  section = input.required<SectionDef>();

  private admin = inject(AdminService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

  records = signal<PbRecord[]>([]);
  loading = signal(false);
  error = signal('');
  editingId = signal<string | null | undefined>(undefined);
  isNew = signal(false);
  saving = signal(false);

  model: Record<string, unknown> = {};
  createdAt = signal('');

  private loadToken = 0;

  constructor() {
    effect(() => {
      const key = this.section().key;
      this.editingId.set(undefined);
      this.isNew.set(false);
      this.error.set('');
      void this.load(key);
    });
  }

  ngOnInit(): void {
    // load se dispara desde effect al cambiar de sección
  }

  async load(key = this.section().key): Promise<void> {
    const token = ++this.loadToken;
    this.loading.set(true);
    this.error.set('');
    try {
      const list = await this.admin.list(this.section().collection, this.section().sort ?? 'sort');
      if (key !== this.section().key) return;
      this.records.set(list);
    } catch (err) {
      if (key !== this.section().key) return;
      this.error.set(String((err as Error).message ?? err));
    } finally {
      if (key === this.section().key) this.loading.set(false);
    }
  }

  openNew(): void {
    this.model = {};
    this.isNew.set(true);
    this.editingId.set(null);
    this.error.set('');
    this.createdAt.set('');
  }

  openEdit(r: PbRecord): void {
    const defaults: Record<string, unknown> = {};
    for (const f of this.section().fields) {
      if (defaults[f.key] == null) defaults[f.key] = '';
    }
    this.model = { ...defaults, ...r };
    this.isNew.set(false);
    this.editingId.set(r.id);
    this.error.set('');
    this.createdAt.set(this.formatDate(r.created as string | undefined));
  }

  close(event: Event | null): void {
    void event;
    this.editingId.set(undefined);
    this.isNew.set(false);
    this.error.set('');
  }

  onChanged(): void {
    this.error.set('');
  }

  async save(): Promise<void> {
    const def = this.section();
    // validación básica de requeridos
    for (const f of def.fields) {
      const v = this.model[f.key];
      if (f.required && (v == null || v === '' || (v instanceof File && (v as File).name === ''))) {
        this.error.set(`El campo "${f.label}" es obligatorio.`);
        return;
      }
    }

    const form = new FormData();
    for (const f of def.fields) {
      const v = this.model[f.key];
      if (f.type === 'file') {
        if (v instanceof File) form.append(f.key, v);
        else if (v === '') form.append(f.key, '');
      } else if (f.type === 'number') {
        if (v != null && v !== '') form.append(f.key, String(v));
      } else if (v !== undefined && v !== null) {
        form.append(f.key, String(v));
      }
    }

    this.saving.set(true);
    this.error.set('');
    const wasNew = this.isNew();
    try {
      if (wasNew) await this.admin.create(def.collection, form);
      else await this.admin.update(def.collection, this.editingId() as string, form);
      await this.load();
      this.close(null);
      this.toast.success(wasNew ? 'Elemento creado correctamente.' : 'Cambios guardados correctamente.');
    } catch (err) {
      const msg = String((err as Error).message ?? err);
      this.error.set(msg);
      this.toast.error(msg);
    } finally {
      this.saving.set(false);
    }
  }

  async confirmDelete(r: PbRecord): Promise<void> {
    const label = (r.title as string) ?? (r.name as string) ?? r.id;
    const ok = await this.confirm.confirm({
      message: `¿Eliminar "${label}"? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
    });
    if (!ok) return;
    try {
      await this.admin.remove(this.section().collection, r.id);
      await this.load();
      this.toast.success('Elemento eliminado.');
    } catch (err) {
      const msg = String((err as Error).message ?? err);
      this.error.set(msg);
      this.toast.error(msg);
    }
  }

  filePreview(r: PbRecord, filename: string): string {
    return this.admin.fileUrl(r, filename);
  }

  private formatDate(value: string | undefined): string {
    if (!value) return '';
    const d = new Date(value);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}