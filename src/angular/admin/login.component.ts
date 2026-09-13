import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from './admin.service';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-dark via-primary to-[#1b8dcb] px-4">
      <div class="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <div class="mb-8 text-center">
          <h1 class="text-[22px] font-bold tracking-tight text-slate-800">Panel de administración</h1>
          <p class="mt-1 text-[13px] text-slate-500">SINERGIA Ocupacional</p>
        </div>

        @if (error()) {
          <div class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-700">{{ error() }}</div>
        }

        <form (ngSubmit)="submit()" class="space-y-4">
          <div>
            <label for="email" class="mb-1.5 block text-[13px] font-semibold text-slate-700">Correo electrónico</label>
            <input
              id="email"
              type="email"
              autocomplete="email"
              required
              class="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[14px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              [(ngModel)]="model.email"
              name="email"
            />
          </div>
          <div>
            <label for="password" class="mb-1.5 block text-[13px] font-semibold text-slate-700">Contraseña</label>
            <input
              id="password"
              type="password"
              autocomplete="current-password"
              required
              class="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[14px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              [(ngModel)]="model.password"
              name="password"
            />
          </div>
          <button
            type="submit"
            class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-[14px] font-bold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            [disabled]="busy()"
          >
            @if (busy()) {
              <i class="fa fa-refresh fa-spin" aria-hidden="true"></i> Entrando…
            } @else {
              <i class="fa fa-sign-in" aria-hidden="true"></i> Iniciar sesión
            }
          </button>
        </form>
      </div>
    </div>
  `,
})
export class AdminLoginComponent {
  private admin = inject(AdminService);
  private toast = inject(ToastService);

  model = { email: '', password: '' };
  busy = signal(false);
  error = signal('');

  async submit(): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      await this.admin.login(this.model.email.trim(), this.model.password);
      this.toast.success('Bienvenido al panel.');
    } catch (err) {
      const msg = String((err as Error).message ?? err);
      this.error.set(msg);
      this.toast.error(msg);
    } finally {
      this.busy.set(false);
    }
  }
}