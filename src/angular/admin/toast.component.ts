import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div
      class="pointer-events-none fixed inset-x-0 top-4 z-[3000] flex flex-col items-center gap-2 px-4"
      aria-live="polite"
    >
      @for (t of toasts.toasts(); track t.id) {
        <div
          class="toast-in pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border shadow-2xl"
          [class]="
            t.type === 'success'
              ? 'border-green-200 bg-white'
              : t.type === 'error'
                ? 'border-red-200 bg-white'
                : 'border-sky-200 bg-white'
          "
        >
          <span
            class="mt-3.5 ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            [class]="
              t.type === 'success'
                ? 'bg-green-100 text-green-700'
                : t.type === 'error'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-sky-100 text-sky-700'
            "
          >
            <i
              class="fa"
              [class]="t.type === 'success' ? 'fa-check' : t.type === 'error' ? 'fa-exclamation' : 'fa-info-circle'"
              aria-hidden="true"
            ></i>
          </span>
          <div class="min-w-0 flex-1 py-3 pr-2">
            <p class="text-[13.5px] font-semibold leading-snug text-slate-800">{{ t.text }}</p>
          </div>
          <button
            type="button"
            class="mt-2 mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            (click)="toasts.dismiss(t.id)"
            aria-label="Cerrar aviso"
          >
            <i class="fa fa-times" aria-hidden="true"></i>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  readonly toasts = inject(ToastService);
}