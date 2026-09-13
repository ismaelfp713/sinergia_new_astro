import {
  Component,
  Directive,
  ElementRef,
  input,
  type AfterViewInit,
  type OnInit,
} from '@angular/core';
import { slugify } from '../lib/slug';
import type { Course, Counter, Settings } from '../lib/site-content';

@Directive({
  selector: '[appReveal]',
  standalone: true,
})
export class RevealDirective implements AfterViewInit {
  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    const node = this.el.nativeElement;
    if (typeof IntersectionObserver === 'undefined') {
      node.classList.add('in');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    io.observe(node);
  }
}

const BENEFIT_ITEMS = [
  {
    icon: 'fa-graduation-cap',
    title: 'Capacitación integral',
    text: 'Entrenamiento en materia de salud, seguridad y desarrollo humano para tu organización.',
  },
  {
    icon: 'fa-building',
    title: 'Empresas y maquiladoras',
    text: 'Servicios diseñados a la medida de las necesidades de tu empresa.',
  },
  {
    icon: 'fa-clock-o',
    title: 'Fechas y modalidad',
    text: 'Contáctanos para conocer calendarios, horarios y modalidad de impartición.',
  },
  {
    icon: 'fa-check-circle',
    title: 'Experiencia comprobada',
    text: 'Desde 1990 formamos personal en seguridad y salud ocupacional.',
  },
];

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [RevealDirective],
  template: `
    <header class="fixed inset-x-0 top-0 z-[997] bg-white/95 shadow-[0_2px_20px_rgba(0,0,0,0.06)] backdrop-blur">
      <div class="container-x flex h-[70px] items-center justify-between">
        <a href="/" aria-label="Inicio">
          <img [src]="settings().logo" alt="SINERGIA Ocupacional" class="h-[46px] max-h-[46px]" />
        </a>
        <nav class="hidden items-center gap-8 font-display text-[14px] font-semibold text-ink md:flex" aria-label="Principal">
          <a href="/" class="transition-colors hover:text-primary">Inicio</a>
          <a href="/" class="transition-colors hover:text-primary">Nosotros</a>
          <a href="/" class="text-primary">Cursos</a>
          <a href="/" class="transition-colors hover:text-primary">Contacto</a>
        </nav>
        <a
          [href]="whatsappHref"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 font-display text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#128C7E]"
        >
          <i class="fa fa-whatsapp" aria-hidden="true"></i>
          Cotizar
        </a>
      </div>
    </header>

    <main>
      <section class="relative overflow-hidden bg-primary-dark">
        <img
          [src]="course().image"
          [alt]="course().title"
          class="absolute inset-0 h-full w-full scale-105 object-cover opacity-45"
        />
        <div class="absolute inset-0" [style.background]="heroOverlay"></div>

        <div class="relative container-x pb-[110px] pt-[170px]">
          <nav class="reveal mb-6 flex flex-wrap items-center gap-2 text-[13px] font-medium text-breath" appReveal aria-label="Ruta">
            <a href="/" class="rounded-full bg-white/10 px-3 py-1.5 transition-colors hover:bg-white/20 hover:text-white">
              <i class="fa fa-home mr-1" aria-hidden="true"></i>Inicio
            </a>
            <i class="fa fa-chevron-right text-white/50" aria-hidden="true"></i>
            <a href="/" class="rounded-full bg-white/10 px-3 py-1.5 transition-colors hover:bg-white/20 hover:text-white">Cursos</a>
            <i class="fa fa-chevron-right text-white/50" aria-hidden="true"></i>
            <span class="rounded-full bg-white/10 px-3 py-1.5 text-white">{{ course().title }}</span>
          </nav>

          <div class="reveal mb-5 inline-flex items-center gap-2 rounded-full bg-gold px-4 py-1.5 font-display text-[12px] font-bold uppercase tracking-wider text-ink" appReveal>
            <i class="fa fa-graduation-cap" aria-hidden="true"></i>
            Curso de capacitación
          </div>

          <h1 class="reveal mb-5 max-w-3xl text-[30px] font-bold leading-[1.15] text-white md:text-[48px]" appReveal>
            {{ course().title }}
          </h1>

          @if (course().caption) {
            <p class="reveal mb-4 max-w-2xl font-display text-[14px] font-bold uppercase tracking-wider text-pale" appReveal [innerHTML]="course().caption"></p>
          }

          <div class="reveal mb-9 max-w-2xl rich-text text-breath" appReveal [innerHTML]="course().description"></div>

          <div class="reveal flex flex-wrap gap-4" appReveal>
            <a
              [href]="whatsappHref"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-8 py-3 font-display text-[14px] font-semibold text-white shadow-lg transition-colors hover:bg-[#128C7E]"
            >
              <i class="fa fa-whatsapp text-lg" aria-hidden="true"></i>
              Solicitar por WhatsApp
            </a>
            <a
              href="#detalles"
              class="inline-flex items-center gap-2 rounded-full border-2 border-white/70 px-8 py-3 font-display text-[14px] font-semibold text-white transition-colors hover:border-white hover:bg-white hover:text-primary-dark"
            >
              Ver detalles
            </a>
          </div>
        </div>
      </section>

      <section id="detalles" class="section-pad bg-white">
        <div class="container-x grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div class="lg:col-span-2">
            <div class="reveal mb-10" appReveal>
              <p class="mb-2 font-display text-[13px] font-bold uppercase tracking-wider text-primary">Sobre este curso</p>
              <h2 class="mb-5 text-[28px] font-bold text-ink md:text-[34px]">Información del curso</h2>
              <div class="rich-text text-[16px] leading-8 text-muted" [innerHTML]="course().description"></div>

              @if (course().characteristics) {
                <div class="mt-8">
                  <h3 class="mb-4 text-[18px] font-semibold text-ink">Características del curso</h3>
                  <div class="rich-text space-y-3 text-[15px] leading-7 text-muted" [innerHTML]="course().characteristics"></div>
                </div>
              }
            </div>

            <div class="reveal grid grid-cols-1 gap-5 sm:grid-cols-2" appReveal>
              @for (item of BENEFIT_ITEMS; track item.title) {
                <div class="rounded-2xl border border-[#e5eff7] bg-soft/60 p-6 transition-shadow hover:shadow-[0_12px_30px_rgba(16,94,133,0.12)]">
                  <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-md">
                    <i [class]="item.icon + ' text-xl'" aria-hidden="true"></i>
                  </div>
                  <h3 class="mb-2 text-[16px] font-semibold text-ink">{{ item.title }}</h3>
                  <p class="text-[14px] leading-6 text-muted">{{ item.text }}</p>
                </div>
              }
            </div>
          </div>

          <aside class="lg:sticky lg:top-[90px] lg:self-start">
            <div class="reveal overflow-hidden rounded-2xl border border-[#e5eff7] bg-white shadow-[0_18px_50px_rgba(16,94,133,0.12)]" appReveal>
              <img [src]="course().image" [alt]="course().title" class="h-[200px] w-full object-cover" />
              <div class="p-6">
                <p class="mb-4 font-display text-[12px] font-bold uppercase tracking-wider text-muted">Solicitar información</p>
                <a
                  [href]="whatsappHref"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="mb-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 font-display text-[14px] font-semibold text-white transition-colors hover:bg-[#128C7E]"
                >
                  <i class="fa fa-whatsapp text-lg" aria-hidden="true"></i>
                  WhatsApp
                </a>
                <div class="space-y-4 border-t border-gray-100 pt-5 text-[14px]">
                  <a [href]="'mailto:' + settings().email" class="flex items-start gap-3 text-muted transition-colors hover:text-primary">
                    <i class="fa fa-envelope mt-1 text-primary" aria-hidden="true"></i>
                    <span class="break-all">{{ settings().email }}</span>
                  </a>
                  <p class="flex items-start gap-3 text-muted">
                    <i class="fa fa-phone mt-1 text-primary" aria-hidden="true"></i>
                    <span>{{ settings().phone1 }}</span>
                  </p>
                  <p class="flex items-start gap-3 text-muted">
                    <i class="fa fa-map-marker mt-1 text-primary" aria-hidden="true"></i>
                    <span class="leading-6">{{ settings().address }}</span>
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section class="bg-primary section-pad">
        <div class="container-x grid max-w-3xl grid-cols-3 gap-4 text-center md:gap-8">
          @for (stat of stats(); track stat.label) {
            <div class="reveal" appReveal>
              <span class="block font-display text-[38px] font-bold text-white md:text-[52px]">{{ stat.value }}</span>
              <p class="mx-0 mb-0 text-[13px] font-medium uppercase tracking-wide text-pale md:text-[14px]">{{ stat.label }}</p>
            </div>
          }
        </div>
      </section>

      @if (others().length) {
        <section class="section-pad section-bg">
          <div class="container-x">
            <div class="reveal mb-10 text-center" appReveal>
              <p class="mb-2 font-display text-[13px] font-bold uppercase tracking-wider text-primary">Sigue explorando</p>
              <h2 class="text-[28px] font-bold text-ink md:text-[34px]">Otros cursos</h2>
            </div>
            <div class="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
              @for (c of others(); track c.id; let i = $index) {
                <a
                  [href]="'/#/curso/' + slugify(c.title)"
                  class="reveal group block overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_rgba(16,94,133,0.1)] transition-shadow hover:shadow-[0_20px_45px_rgba(16,94,133,0.2)]"
                  appReveal
                >
                  <div class="overflow-hidden">
                    <img
                      [src]="c.image"
                      [alt]="c.title"
                      loading="lazy"
                      class="h-[180px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div class="p-6">
                    <span class="mb-3 inline-flex items-center gap-2 rounded-full bg-soft px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wider text-primary">
                      <i class="fa fa-graduation-cap" aria-hidden="true"></i>
                      Curso
                    </span>
                    <h3 class="mb-2 text-[16px] font-semibold leading-snug text-ink transition-colors group-hover:text-primary">
                      {{ c.title }}
                    </h3>
                    @if (c.caption) {
                      <p class="mb-1 text-[13px] italic text-primary" [innerHTML]="c.caption"></p>
                    }
                    <p class="rich-text mb-4 text-[14px] leading-6 text-muted" [innerHTML]="c.description"></p>
                    <span class="inline-flex items-center gap-2 font-display text-[13px] font-semibold text-primary">
                      Ver curso
                      <i class="fa fa-arrow-right text-[12px] transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true"></i>
                    </span>
                  </div>
                </a>
              }
            </div>
          </div>
        </section>
      }
    </main>

    <footer class="bg-primary-dark text-breath">
      <div class="container-x grid grid-cols-1 gap-10 py-14 md:grid-cols-3">
        <div>
          <img [src]="settings().logo" alt="SINERGIA Ocupacional" class="mb-4 h-[44px] max-h-[44px] w-auto rounded bg-white/10 p-1" />
          <p class="text-[14px] leading-6 text-breath/90">
            Especialistas en servicios médicos y capacitación en materia de salud, seguridad y desarrollo
            humano para empresas y maquiladoras desde 1990.
          </p>
        </div>
        <div>
          <h3 class="mb-4 font-display text-[15px] font-bold uppercase tracking-wider text-white">Contacto</h3>
          <ul class="space-y-3 text-[14px]">
            <li class="flex items-start gap-3">
              <i class="fa fa-map-marker mt-1 text-pale" aria-hidden="true"></i>
              <span class="leading-6">{{ settings().address }}</span>
            </li>
            <li class="flex items-center gap-3">
              <i class="fa fa-envelope text-pale" aria-hidden="true"></i>
              <a [href]="'mailto:' + settings().email" class="transition-colors hover:text-white">{{ settings().email }}</a>
            </li>
            <li class="flex items-center gap-3">
              <i class="fa fa-phone text-pale" aria-hidden="true"></i>
              <span>{{ settings().phone1 }}</span>
            </li>
            <li class="flex items-center gap-3">
              <i class="fa fa-whatsapp text-pale" aria-hidden="true"></i>
              <a [href]="whatsappHref" target="_blank" rel="noopener noreferrer" class="transition-colors hover:text-white">
                {{ settings().phone3 }}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 class="mb-4 font-display text-[15px] font-bold uppercase tracking-wider text-white">Cursos</h3>
          <ul class="space-y-2 text-[14px]">
            @for (c of allCourses().slice(0, 5); track c.id) {
              <li>
                <a [href]="'/#/curso/' + slugify(c.title)" class="transition-colors hover:text-white">
                  <i class="fa fa-angle-right mr-2 text-pale" aria-hidden="true"></i>
                  {{ c.title }}
                </a>
              </li>
            }
            <li>
              <a href="/" class="inline-flex items-center gap-2 font-semibold text-white transition-colors hover:text-pale">
                <i class="fa fa-arrow-circle-up" aria-hidden="true"></i>
                Volver al inicio
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div class="border-t border-white/10 py-5">
        <div class="container-x flex flex-col items-center justify-between gap-2 text-[13px] text-pale md:flex-row">
          <p>&copy; {{ currentYear() }} SINERGIA Ocupacional. Todos los derechos reservados.</p>
          <p>
            <a href="/" class="transition-colors hover:text-white">Contáctanos</a>
            <span class="mx-2">·</span>
            <a href="/" class="transition-colors hover:text-white">Cursos</a>
          </p>
        </div>
      </div>
    </footer>
  `,
})
export class AppCourseDetailComponent implements OnInit {
  slugify = slugify;

  course = input.required<Course>();
  settings = input.required<Settings>();
  allCourses = input<Course[]>([]);
  counters = input<Counter[]>([]);

  readonly BENEFIT_ITEMS = BENEFIT_ITEMS;
  readonly heroOverlay =
    'linear-gradient(90deg, rgba(16,94,133,0.96) 0%, rgba(16,94,133,0.82) 50%, rgba(21,126,179,0.55) 100%)';

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  get whatsappHref(): string {
    const digits = (this.settings().phone3 ?? '').replace(/\D/g, '');
    return digits ? `https://wa.me/${digits}` : '#';
  }

  currentYear(): number {
    return new Date().getFullYear();
  }

  stats(): Array<{ label: string; value: number }> {
    const counters = this.counters();
    return [
      { value: counters.find((c) => /a[ñn]os/i.test(c.label))?.value ?? 0, label: 'Años de Servicio' },
      { value: counters.find((c) => /curso/i.test(c.label))?.value ?? 0, label: 'Cursos' },
      { value: counters.find((c) => /cliente/i.test(c.label))?.value ?? 0, label: 'Clientes' },
    ];
  }

  others(): Course[] {
    return this.allCourses().filter((c) => c.id !== this.course().id);
  }
}