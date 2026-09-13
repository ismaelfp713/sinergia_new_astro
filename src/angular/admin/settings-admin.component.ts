import { Component, inject, signal, type OnInit } from '@angular/core';
import { AdminService, type PbRecord } from './admin.service';
import { AdminFieldEditorComponent } from './admin-field-editor.component';
import { SETTINGS_FIELDS } from './field-defs';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-settings-admin',
  standalone: true,
  imports: [AdminFieldEditorComponent],
  template: `
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-xl font-bold text-slate-800">Configuración general</h2>
      <span class="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-[12px] font-medium text-sky-700">
        <i class="fa fa-globe" aria-hidden="true"></i>
        Se refleja en todo el sitio
      </span>
    </div>

    @if (error()) {
      <div class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{{ error() }}</div>
    }

    @if (loading()) {
      <div class="rounded-xl border border-slate-200 bg-white px-4 py-20 text-center text-slate-400">
        <i class="fa fa-refresh fa-spin text-3xl" aria-hidden="true"></i>
        <p class="mt-3 text-[13px]">Cargando configuración…</p>
      </div>
    } @else if (settings()) {
      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <app-admin-field-editor [fields]="SETTINGS_FIELDS" [record]="settings()" (changed)="error.set('')" />

        <div class="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
          <span class="mr-auto inline-flex items-center gap-1.5 text-[12px] text-slate-400">
            <i class="fa fa-info-circle" aria-hidden="true"></i>
            Los archivos (logo, imágenes, vídeos) son opcionales; si cambias una, se reemplaza.
          </span>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            [disabled]="saving()"
            (click)="save()"
          >
            @if (saving()) {
              <i class="fa fa-refresh fa-spin" aria-hidden="true"></i> Guardando…
            } @else {
              <i class="fa fa-check" aria-hidden="true"></i> Guardar cambios
            }
          </button>
        </div>
      </div>
    }
  `,
})
export class SettingsAdminComponent implements OnInit {
  readonly SETTINGS_FIELDS = SETTINGS_FIELDS;

  private admin = inject(AdminService);

  private toast = inject(ToastService);

  settings = signal<Record<string, unknown> | null>(null);
  loading = signal(false);
  saving = signal(false);
  error = signal('');

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const list = await this.admin.list('settings', '');
      const rec = list[0];
      if (!rec) {
        this.settings.set(null);
        this.error.set('No se encontró el registro de configuración.');
        return;
      }
      this.settings.set({ ...rec });
    } catch (err) {
      this.error.set(String((err as Error).message ?? err));
    } finally {
      this.loading.set(false);
    }
  }

  async save(): Promise<void> {
    const rec = this.settings();
    if (!rec) return;

    const form = new FormData();
    for (const f of SETTINGS_FIELDS) {
      const v = rec[f.key];
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
    try {
      await this.admin.update('settings', (rec as unknown as PbRecord).id, form);
      await this.load();
      this.toast.success('Configuración guardada correctamente.');
    } catch (err) {
      const msg = String((err as Error).message ?? err);
      this.error.set(msg);
      this.toast.error(msg);
    } finally {
      this.saving.set(false);
    }
  }
}