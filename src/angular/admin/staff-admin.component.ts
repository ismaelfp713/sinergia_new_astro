import { Component, inject, signal, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService, type PbRecord } from './admin.service';
import { ToastService } from './toast.service';
import { ConfirmService } from './confirm.service';

interface StaffForm {
  email: string;
  password: string;
}

@Component({
  selector: 'app-staff-admin',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-xl font-bold text-slate-800">Usuarios del panel</h2>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
        (click)="toggleCreate()"
      >
        <i class="fa fa-user-plus" aria-hidden="true"></i>
        Agregar usuario
      </button>
    </div>

    @if (error()) {
      <div class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{{ error() }}</div>
    }

    @if (createOpen()) {
      <div class="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 class="mb-4 text-[15px] font-bold text-slate-800">Nuevo usuario</h3>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <input
            type="email"
            placeholder="Correo electrónico"
            class="rounded-lg border border-slate-300 px-3 py-2 text-[14px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            [(ngModel)]="newForm.email"
          />
          <input
            type="password"
            placeholder="Contraseña"
            class="rounded-lg border border-slate-300 px-3 py-2 text-[14px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            [(ngModel)]="newForm.password"
          />
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-dark"
              (click)="create()"
            >
              Crear
            </button>
            <button
              type="button"
              class="rounded-lg border border-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              (click)="closeCreate()"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    }

    <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      @if (!users().length && !loading()) {
        <div class="px-4 py-10 text-center text-[14px] text-slate-400">No hay usuarios.</div>
      } @else {
        <table class="w-full min-w-[520px] text-left text-[13px]">
          <thead class="border-b border-slate-200 bg-slate-50 text-[12px] uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-4 py-3 font-semibold">Email</th>
              <th class="px-4 py-3 font-semibold">Creado</th>
              <th class="px-4 py-3 font-semibold">Verificado</th>
              <th class="px-4 py-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (u of users(); track u.id) {
              <tr class="transition-colors hover:bg-slate-50">
                <td class="px-4 py-3 font-semibold text-slate-800">
                  {{ u.email }}
                  @if (isMe(u)) {
                    <span class="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">Tú</span>
                  }
                </td>
                <td class="px-4 py-3 text-slate-600">{{ date(u.created) }}</td>
                <td class="px-4 py-3">
                  @if (u.verified) {
                    <span class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-700">
                      <i class="fa fa-check-circle" aria-hidden="true"></i>Sí
                    </span>
                  } @else {
                    <span class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                      <i class="fa fa-clock-o" aria-hidden="true"></i>No
                    </span>
                  }
                </td>
                <td class="px-4 py-3 text-right">
                  @if (resetFor() === u.id) {
                    <div class="flex items-center justify-end gap-2">
                      <input
                        type="password"
                        placeholder="Nueva contraseña"
                        class="w-40 rounded-lg border border-slate-300 px-3 py-1.5 text-[13px] outline-none focus:border-primary"
                        [(ngModel)]="resetPassword"
                      />
                      <button
                        type="button"
                        class="rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-primary-dark"
                        (click)="reset()"
                        [disabled]="!resetPassword"
                      >
                        Cambiar
                      </button>
                      <button
                        type="button"
                        class="rounded-lg border border-slate-300 px-3 py-1.5 text-[12px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                        (click)="resetFor.set(null)"
                      >
                        Cancelar
                      </button>
                    </div>
                  } @else if (!isMe(u)) {
                    <div class="inline-flex items-center gap-1">
                      <button
                        type="button"
                        class="rounded-md px-2.5 py-1.5 text-[12px] font-medium text-primary transition-colors hover:bg-primary/10"
                        (click)="resetFor.set(u.id); resetPassword = ''"
                      >
                        <i class="fa fa-key mr-1" aria-hidden="true"></i>Cambiar contraseña
                      </button>
                      <button
                        type="button"
                        class="rounded-md px-2.5 py-1.5 text-[12px] font-medium text-red-600 transition-colors hover:bg-red-50"
                        (click)="remove(u)"
                      >
                        <i class="fa fa-trash mr-1" aria-hidden="true"></i>Eliminar
                      </button>
                    </div>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
})
export class StaffAdminComponent implements OnInit {
  private admin = inject(AdminService);

  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

  users = signal<PbRecord[]>([]);
  loading = signal(false);
  error = signal('');
  createOpen = signal(false);
  resetFor = signal<string | null>(null);
  newForm: StaffForm = { email: '', password: '' };
  resetPassword = '';

  ngOnInit(): void {
    void this.load();
  }

  get currentEmail(): string {
    return (this.admin.user()?.email as string) ?? '';
  }

  isMe(u: PbRecord): boolean {
    return u.id === this.admin.user()?.id;
  }

  toggleCreate(): void {
    this.createOpen.update((v) => !v);
    this.error.set('');
  }

  closeCreate(): void {
    this.createOpen.set(false);
    this.newForm = { email: '', password: '' };
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      this.users.set(await this.admin.list('staff', 'email'));
    } catch (err) {
      this.error.set(String((err as Error).message ?? err));
    } finally {
      this.loading.set(false);
    }
  }

  async create(): Promise<void> {
    const email = this.newForm.email.trim();
    if (!email || !this.newForm.password) {
      this.error.set('Correo y contraseña son obligatorios.');
      return;
    }
    if (this.newForm.password.length < 8) {
      this.error.set('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    const form = new FormData();
    form.append('email', email);
    form.append('password', this.newForm.password);
    form.append('passwordConfirm', this.newForm.password);
    try {
      await this.admin.create('staff', form);
      this.closeCreate();
      await this.load();
      this.toast.success('Usuario creado correctamente.');
    } catch (err) {
      const msg = String((err as Error).message ?? err);
      this.error.set(msg);
      this.toast.error(msg);
    }
  }

  async reset(): Promise<void> {
    const id = this.resetFor();
    if (!id || !this.resetPassword) return;
    const form = new FormData();
    form.append('password', this.resetPassword);
    form.append('passwordConfirm', this.resetPassword);
    try {
      await this.admin.update('staff', id, form);
      this.resetFor.set(null);
      this.resetPassword = '';
      this.error.set('');
      this.toast.success('Contraseña actualizada.');
    } catch (err) {
      const msg = String((err as Error).message ?? err);
      this.error.set(msg);
      this.toast.error(msg);
    }
  }

  async remove(u: PbRecord): Promise<void> {
    const ok = await this.confirm.confirm({
      message: `¿Eliminar el usuario "${u.email}"? No podrá iniciar sesión en el panel.`,
      confirmLabel: 'Eliminar',
    });
    if (!ok) return;
    try {
      await this.admin.remove('staff', u.id);
      await this.load();
      this.toast.success('Usuario eliminado.');
    } catch (err) {
      const msg = String((err as Error).message ?? err);
      this.error.set(msg);
      this.toast.error(msg);
    }
  }

  date(value: unknown): string {
    if (!value) return '';
    const d = new Date(String(value));
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}