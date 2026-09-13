import { Component, HostListener, inject, signal } from '@angular/core';

const ngCompiler = await import('@angular/compiler');
/**
 * Same trick as app-root: astro-angular islands ship "linked" components, so the
 * CompilerFacade must be registered before Angular bootstraps.
 */
interface CompilerModule {
  publishFacade(global: unknown): void;
}
;(ngCompiler as unknown as CompilerModule).publishFacade(globalThis);

import { AdminService } from './admin.service';
import { AdminLoginComponent } from './login.component';
import { CrudSectionComponent } from './crud-section.component';
import { MessagesAdminComponent } from './messages-admin.component';
import { SettingsAdminComponent } from './settings-admin.component';
import { StaffAdminComponent } from './staff-admin.component';
import { ToastComponent } from './toast.component';
import { ConfirmComponent } from './confirm.component';
import {
  sectionFor,
  type SectionDef,
} from './field-defs';

type SectionKey =
  | 'messages'
  | 'services'
  | 'courses'
  | 'team'
  | 'clients'
  | 'techniques'
  | 'whyItems'
  | 'settings'
  | 'staff';

const NAV: SectionKey[] = [
  'messages',
  'services',
  'courses',
  'team',
  'clients',
  'techniques',
  'whyItems',
  'settings',
  'staff',
];

@Component({
  selector: 'app-admin-root',
  standalone: true,
  imports: [
    AdminLoginComponent,
    CrudSectionComponent,
    MessagesAdminComponent,
    SettingsAdminComponent,
    StaffAdminComponent,
    ToastComponent,
    ConfirmComponent,
  ],
  template: `
    <app-toast />
    <app-confirm />
    @if (!admin.isAuthed()) {
      <app-admin-login />
    } @else {
      <div class="flex min-h-screen bg-slate-100">
        <div
          class="fixed inset-y-0 left-0 z-[1100] w-64 bg-primary-dark text-white transition-transform lg:static lg:translate-x-0"
          [class.-translate-x-full]="!sidebarOpen()"
        >
          <div class="flex h-16 items-center gap-3 border-b border-white/10 px-5">
            <i class="fa fa-briefcase text-lg text-pale" aria-hidden="true"></i>
            <span class="font-display text-[15px] font-bold uppercase tracking-wide">Sinergia Admin</span>
          </div>

          <nav class="px-3 py-4">
            <p class="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-white/40">Contenido</p>
            <ul class="space-y-0.5">
              @for (key of NAV; track key) {
                <li>
                  <button
                    type="button"
                    class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors"
                    [class]="active() === key ? 'bg-primary text-white' : 'text-breath hover:bg-white/10 hover:text-white'"
                    (click)="go(key)"
                  >
                    <i [class]="navClass(key)" class="w-5 text-center" aria-hidden="true"></i>
                    <span class="flex-1 text-left">{{ navLabel(key) }}</span>
                    @if (key === 'messages' && newCount()) {
                      <span class="rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-bold text-amber-950">{{ newCount() }}</span>
                    }
                  </button>
                </li>
              }
            </ul>
          </nav>

          <div class="absolute inset-x-0 bottom-0 border-t border-white/10 p-3">
            <div class="mb-2 flex items-center gap-2 px-2">
              <span class="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[13px] font-bold text-white">
                {{ initials() }}
              </span>
              <span class="min-w-0 flex-1 truncate text-[13px] font-semibold text-white">{{ email() }}</span>
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-full text-breath transition-colors hover:bg-white/10 hover:text-white"
                [title]="'Ver el sitio'"
                (click)="goSite()"
              >
                <i class="fa fa-external-link" aria-hidden="true"></i>
              </button>
            </div>
            <button
              type="button"
              class="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-white/20"
              (click)="logout()"
            >
              <i class="fa fa-sign-out" aria-hidden="true"></i>
              Cerrar sesión
            </button>
          </div>
        </div>

        @if (sidebarOpen()) {
          <div class="fixed inset-0 z-[1050] bg-slate-900/40 lg:hidden" (click)="sidebarOpen.set(false)"></div>
        }

        <div class="flex min-w-0 flex-1 flex-col">
          <header class="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-5">
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 lg:hidden"
              (click)="sidebarOpen.set(!sidebarOpen())"
              aria-label="Abrir menú"
            >
              <i class="fa fa-bars" aria-hidden="true"></i>
            </button>
            <h1 class="min-w-0 truncate text-[17px] font-bold text-slate-800">{{ pageTitle() }}</h1>
          </header>

          <main class="flex-1 overflow-x-hidden p-4 md:p-6">
            @switch (active()) {
              @case ('messages') {
                <app-messages-admin (countChange)="newCount.set($event)" />
              }
              @case ('staff') {
                <app-staff-admin />
              }
              @case ('settings') {
                <app-settings-admin />
              }
              @default {
                @if (sectionDef(); as s) {
                  <app-crud-section [section]="s" />
                }
              }
            }
          </main>
        </div>
      </div>
    }
  `,
})
export class AdminRootComponent {
  readonly admin = inject(AdminService);

  active = signal<SectionKey>('messages');
  newCount = signal(0);
  sidebarOpen = signal(false);

  private readonly titles: Record<SectionKey, string> = {
    messages: 'Mensajes recibidos',
    services: 'Servicios',
    courses: 'Cursos',
    team: 'Equipo',
    clients: 'Clientes',
    techniques: 'Técnicas',
    whyItems: 'Por qué elegirnos',
    settings: 'Configuración',
    staff: 'Usuarios del panel',
  };

  private readonly icons: Record<SectionKey, string> = {
    messages: 'fa-envelope-o',
    services: 'fa-cogs',
    courses: 'fa-graduation-cap',
    team: 'fa-users',
    clients: 'fa-building-o',
    techniques: 'fa-puzzle-piece',
    whyItems: 'fa-star-o',
    settings: 'fa-cog',
    staff: 'fa-user-circle-o',
  };

  constructor() {
    // badge de mensajes al entrar + refrescar periódicamente
    void this.refreshBadge();
  }

  @HostListener('window:focus')
  onFocus(): void {
    void this.refreshBadge();
  }

  async refreshBadge(): Promise<void> {
    if (!this.admin.isAuthed()) return;
    if (this.active() !== 'messages') {
      this.newCount.set(await this.admin.countNewMessages());
    }
  }

  pageTitle(): string {
    return this.titles[this.active()];
  }

  navClass(key: SectionKey): string {
    return this.icons[key] ?? 'fa-circle';
  }

  navLabel(key: SectionKey): string {
    return this.titles[key];
  }

  email(): string {
    return (this.admin.user()?.email as string) ?? '';
  }

  initials(): string {
    const local = this.email().split('@')[0] ?? '';
    return (local || 'A').slice(0, 2).toUpperCase();
  }

  sectionDef(): SectionDef | null {
    return sectionFor(this.active());
  }

  go(key: SectionKey): void {
    this.active.set(key);
    this.sidebarOpen.set(false);
    void this.refreshBadge();
  }

  goSite(): void {
    window.open(window.location.origin, '_blank', 'noopener');
  }

  logout(): void {
    this.admin.logout();
  }

  protected readonly NAV = NAV;
}