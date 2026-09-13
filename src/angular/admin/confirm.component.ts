import { Component, inject } from '@angular/core';
import { ConfirmService } from './confirm.service';

@Component({
  selector: 'app-confirm',
  standalone: true,
  template: `
    @if (confirm.pending(); as p) {
      <div class="fixed inset-0 z-[2500] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[1px]" (click)="confirm.answer(false)">
        <div
          class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          (click)="$event.stopPropagation()"
        >
          <div class="mb-4 flex items-start gap-4">
            <span
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
              [class]="p.danger ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'"
            >
              <i class="fa fa-exclamation-triangle text-xl" aria-hidden="true"></i>
            </span>
            <div class="min-w-0">
              <h3 class="text-[16px] font-bold leading-snug text-slate-800">{{ p.title }}</h3>
              <p class="mt-1 text-[13.5px] leading-relaxed text-slate-600">{{ p.message }}</p>
            </div>
          </div>
          <div class="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              class="rounded-lg border border-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              (click)="confirm.answer(false)"
            >
              Cancelar
            </button>
            <button
              type="button"
              [class]="
                p.danger
                  ? 'rounded-lg bg-red-600 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-red-700'
                  : 'rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-dark'
              "
              (click)="confirm.answer(true)"
            >
              {{ p.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmComponent {
  readonly confirm = inject(ConfirmService);
}