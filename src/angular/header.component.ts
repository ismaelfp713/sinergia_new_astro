import { Component, HostListener, input, signal, type OnInit } from '@angular/core';
import { AppIconComponent } from './app-icon.component';

const LINKS = [
  { href: '#intro', label: 'Inicio' },
  { href: '#about', label: 'Sobre Nosotros' },
  { href: '#services', label: 'Servicios' },
  { href: '#portfolio', label: 'Portafolio' },
  { href: '#team', label: 'Nuestro Equipo' },
  { href: '#contact', label: 'Contacto' },
];

const SECTIONS = ['intro', 'about', 'services', 'portfolio', 'team', 'contact'];

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AppIconComponent],
  template: `
    <header
      id="header"
      [class]="scrolled()
        ? 'fixed inset-x-0 top-0 z-[997] bg-white py-5 shadow-[0_0_30px_rgba(127,137,161,0.3)] transition-all duration-500'
        : 'fixed inset-x-0 top-0 z-[997] bg-white py-5 transition-all duration-500'"
    >
      <div class="container-x flex items-center justify-between">
        <a href="#intro">
          <img [src]="logo()" alt="Sinergia Ocupacional" class="h-[50px] max-h-[50px]" />
        </a>

        <span class="sr-only" id="mobile-nav-toggle-label">Menú</span>
        <button
          type="button"
          id="mobile-nav-toggle"
          class="text-navy hover:text-primary lg:hidden"
          aria-label="Abrir menú"
          aria-controls="mobile-nav"
          [attr.aria-expanded]="mobileOpen()"
          (click)="toggleMobile()"
        >
          <app-icon name="menu" iconClass="h-7 w-7" />
        </button>

        <nav class="hidden lg:block" aria-label="Principal">
          <ul class="flex items-center">
            @for (link of links; track link.href) {
              <li>
                <a
                  [href]="link.href"
                  [class]="active() === link.href.slice(1)
                    ? 'scrollto px-[15px] py-2.5 font-body text-primary transition-colors duration-300'
                    : 'scrollto px-[15px] py-2.5 font-body text-navy transition-colors duration-300 hover:text-primary'"
                >
                  {{ link.label }}
                </a>
              </li>
            }
            <li>
              <a
                href="/admin"
                title="Panel de administración"
                aria-label="Iniciar sesión y administrar los datos"
                class="ml-[15px] inline-flex items-center gap-2 rounded-full border-2 border-primary px-4 py-2 font-body text-[13px] font-semibold text-primary transition-colors duration-300 hover:bg-primary hover:text-white"
              >
                <i class="fa fa-user-circle-o text-base" aria-hidden="true"></i>
                <span class="hidden xl:inline">Admin</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <nav
        id="mobile-nav"
        [class]="mobileOpen() ? 'border-t border-gray-100 bg-white shadow-md lg:hidden' : 'hidden border-t border-gray-100 bg-white shadow-md lg:hidden'"
        aria-label="Menú móvil"
      >
        <ul class="container-x flex flex-col py-2">
          @for (link of links; track link.href) {
            <li>
              <a
                [href]="link.href"
                class="scrollto block px-4 py-2.5 text-navy hover:text-primary"
                (click)="closeMobile()"
              >
                {{ link.label }}
              </a>
            </li>
          }
          <li>
            <a
              href="/admin"
              class="flex items-center gap-2 px-4 py-2.5 font-semibold text-primary hover:text-primary-dark"
              (click)="closeMobile()"
            >
              <i class="fa fa-user-circle-o text-lg" aria-hidden="true"></i>
              Administrar datos
            </a>
          </li>
        </ul>
      </nav>
    </header>
  `,
})
export class AppHeaderComponent implements OnInit {
  logo = input<string>('/img/logo2.jpg');
  readonly links = LINKS;

  scrolled = signal(false);
  mobileOpen = signal(false);
  active = signal('');

  ngOnInit() {
    this.updateActive();
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 40);
    this.updateActive();
  }

  toggleMobile() {
    this.mobileOpen.update((value) => !value);
  }

  closeMobile() {
    this.mobileOpen.set(false);
  }

  private updateActive() {
    let current = SECTIONS[0];
    for (const id of SECTIONS) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) current = id;
    }
    this.active.set(current);
  }
}
