import { Component, input, output } from '@angular/core';
import { WysiwygComponent } from './wysiwyg.component';
import type { FieldDef } from './field-defs';

@Component({
  selector: 'app-admin-field-editor',
  standalone: true,
  imports: [WysiwygComponent],
  template: `
    <div class="space-y-5">
      @for (field of fields(); track field.key) {
        <div>
          <label class="mb-1.5 block text-[13px] font-semibold text-slate-700">
            {{ field.label }}
            @if (field.required) {
              <span class="text-red-500">*</span>
            }
          </label>

          @switch (field.type) {
            @case ('text') {
              <input
                type="text"
                class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-[14px] text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                [value]="val(field)"
                [required]="field.required"
                (input)="setStr(field, $event)"
              />
            }
            @case ('url') {
              <input
                type="url"
                placeholder="https://"
                class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-[14px] text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                [value]="val(field)"
                (input)="setStr(field, $event)"
              />
            }
            @case ('number') {
              <input
                type="number"
                class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-[14px] text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                [value]="val(field)"
                (input)="setNum(field, $event)"
              />
            }
            @case ('textarea') {
              <textarea
                rows="4"
                class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-[14px] leading-6 text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                [value]="val(field)"
                (input)="setStr(field, $event)"
              ></textarea>
            }
            @case ('select') {
              <select
                class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[14px] text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                [value]="val(field)"
                (change)="setSel(field, $event)"
              >
                <option value="">— Selecciona —</option>
                @for (opt of field.options ?? []; track opt) {
                  <option [value]="opt">{{ optionLabel(field, opt) }}</option>
                }
              </select>
            }
            @case ('icon') {
              <div class="flex items-center gap-3">
                <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-soft text-primary">
                  <i [class]="'fa fa-' + val(field)" aria-hidden="true"></i>
                </span>
                <select
                  class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[14px] text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  [value]="val(field)"
                  (change)="setSel(field, $event)"
                >
                  <option value="">— Selecciona —</option>
                  @for (opt of field.options ?? []; track opt) {
                    <option [value]="opt">{{ opt }}</option>
                  }
                </select>
              </div>
            }
            @case ('file') {
              <div class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
                <input
                  type="file"
                  [attr.accept]="field.accept ?? ''"
                  class="block w-full text-[13px] text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-[13px] file:font-semibold file:text-white hover:file:bg-primary-dark"
                  (change)="setFile(field, $event)"
                />
                <div class="mt-2 flex flex-wrap items-center gap-3">
                  @if (isFile(val(field))) {
                    <span class="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-[12px] font-medium text-sky-700">
                      <i class="fa fa-file" aria-hidden="true"></i>
                      {{ fileName(val(field)) }} (nuevo)
                    </span>
                  } @else if (val(field)) {
                    @if (isImage(field)) {
                      <img [src]="fileUrl(field)" alt="" class="h-12 w-16 rounded object-cover ring-1 ring-slate-200" />
                    }
                    <span class="inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 text-[12px] font-medium text-slate-600">
                      <i class="fa fa-file-image-o" aria-hidden="true"></i>
                      {{ fileName(val(field)) }}
                    </span>
                  } @else {
                    <span class="text-[12px] text-slate-400">Sin archivo.</span>
                  }

                  @if (val(field)) {
                    <button
                      type="button"
                      class="inline-flex items-center gap-1 rounded-full border border-red-300 px-3 py-1 text-[12px] font-medium text-red-600 transition-colors hover:bg-red-50"
                      (click)="clearFile(field)"
                    >
                      <i class="fa fa-times" aria-hidden="true"></i> Quitar {{ field.key === 'logo' || field.key === 'favicon' || isImage(field) ? 'imagen' : 'archivo' }}
                    </button>
                  }
                </div>
              </div>
            }
            @case ('wysiwyg') {
              <app-wysiwyg
                [value]="val(field)"
                (valueChange)="model()[field.key] = $event"
              />
            }
          }

          @if (field.help) {
            <p class="mt-1 text-[12px] text-slate-400">{{ field.help }}</p>
          }
        </div>
      }
    </div>
  `,
})
export class AdminFieldEditorComponent {
  fields = input<FieldDef[]>([]);
  record = input<Record<string, unknown> | null>(null);
  changed = output<void>();

  model(): Record<string, unknown> {
    return (this.record() ?? {}) as Record<string, unknown>;
  }

  val(field: FieldDef): string {
    const v = this.model()[field.key];
    if (v instanceof File) return '';
    return v == null ? '' : String(v);
  }

  fileUrl(field: FieldDef): string {
    const v = this.model()[field.key];
    if (typeof v !== 'string' || !v) return '';
    const rec = this.record();
    if (!rec) return v;
    return `${(import.meta.env.PUBLIC_POCKETBASE_URL ?? '').replace(/\/+$/, '')}/api/files/${rec.collectionId}/${
      rec.id
    }/${encodeURIComponent(v)}`;
  }

  isFile(v: unknown): boolean {
    return v instanceof File;
  }

  isImage(field: FieldDef): boolean {
    return /image\//.test(field.accept ?? '');
  }

  fileName(v: unknown): string {
    if (!v) return '';
    return String(v);
  }

  optionLabel(field: FieldDef, opt: string): string {
    return field.optionLabels?.[opt] ?? opt;
  }

  setStr(field: FieldDef, event: Event) {
    this.model()[field.key] = (event.target as HTMLInputElement).value;
    this.changed.emit();
  }

  setNum(field: FieldDef, event: Event) {
    const raw = (event.target as HTMLInputElement).value;
    this.model()[field.key] = raw === '' ? null : Number(raw);
    this.changed.emit();
  }

  setSel(field: FieldDef, event: Event) {
    this.model()[field.key] = (event.target as HTMLSelectElement).value;
    this.changed.emit();
  }

  setFile(field: FieldDef, event: Event) {
    const el = event.target as HTMLInputElement;
    const file = el.files?.[0];
    if (file) {
      this.model()[field.key] = file;
      this.changed.emit();
    }
  }

  clearFile(field: FieldDef) {
    this.model()[field.key] = '';
    this.changed.emit();
  }
}