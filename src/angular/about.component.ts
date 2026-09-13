import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import type { SafeResourceUrl } from '@angular/platform-browser';
import { AppIconComponent } from './app-icon.component';
import { AppWowDirective } from './app-wow.directive';
import type { Settings, Technique } from '../lib/site-content';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [AppIconComponent, AppWowDirective],
  template: `
    <section id="about" class="section-pad bg-white">
      <div class="container-x">
        <header class="section-header wow wow-fade-up">
          <h3>Sobre Nosotros</h3>
          <p>
            <strong>
              <span class="block text-[20px] font-normal text-ink">SINERGIA Ocupacional - Quienes Somos?</span>
              <span class="mt-1 block text-[18px] font-normal text-ink">
                Trabajando desde Reynosa Tamaulipas con Clientes Locales, Nacionales e Internacionales.
              </span>
            </strong>
          </p>
        </header>

        <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div class="order-2 lg:order-1 wow wow-fade-up">
            <p class="mb-6 leading-7">
              En <strong class="text-ink">SINERGIA Ocupacional creemos en los métodos extraordinarios
              para la enseñanza.</strong> Los métodos tradicionales de entrenamiento ya no funcionan en la
              actualidad, por lo tanto nosotros desarrollamos métodos más dinámicos que brindan la
              gratificación instántanea e interacción de nuestros clientes para facilitar su aprendizaje
              del tema.
            </p>

            @for (technique of techniques(); track technique.id; let i = $index) {
              <div class="group icon-box pb-[30px] wow wow-fade-up" [style.animation-delay]="i * 0.2 + 's'">
                <div class="flex items-start gap-4">
                  <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-primary text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                    <app-icon [name]="technique.icon" iconClass="h-6 w-6" />
                  </div>
                  <div>
                    <h4 class="mb-[5px] text-[18px] font-semibold text-ink">{{ technique.title }}</h4>
                    <p class="text-[14px] leading-6">{{ technique.description }}</p>
                  </div>
                </div>
              </div>
            }
          </div>

          <div class="order-1 lg:order-2 wow wow-fade-up">
            <img [src]="settings().aboutImg1" alt="SINERGIA Ocupacional capacitando" class="h-auto w-full" />
          </div>
        </div>

        <div class="grid grid-cols-1 items-center gap-8 pt-[60px] lg:grid-cols-2">
          <div class="wow wow-fade-up">
            <img [src]="settings().aboutImg2" alt="Exposición de un curso de SINERGIA Ocupacional" class="h-auto w-full" />
          </div>
          <div class="pt-5 lg:pt-0 wow wow-fade-up">
            <h4 class="mb-3 text-2xl font-semibold text-ink">Población que atiende y experiencia</h4>
            <p class="leading-7">{{ settings().aboutExperience }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 items-center gap-8 pt-[60px] lg:grid-cols-2">
          <div class="aspect-video w-full order-1 lg:order-2 wow wow-fade-up">
            <iframe
              class="h-full w-full"
              [src]="aboutVideo()"
              title="Video de SINERGIA Ocupacional - Cobertura territorial"
              allow="autoplay; fullscreen"
              allowfullscreen
            ></iframe>
          </div>
          <div class="pt-5 lg:pt-0 order-2 lg:order-1 wow wow-fade-up">
            <h4 class="mb-3 text-2xl font-semibold text-ink">
              Tamaño del impacto de la organización en cuanto a su extensión territorial.
            </h4>
            <p class="leading-7">{{ settings().aboutImpact }}</p>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class AppAboutComponent {
  settings = input<Settings>({} as Settings);
  techniques = input<Technique[]>([]);

  private sanitizer = inject(DomSanitizer);

  aboutVideo = computed<SafeResourceUrl>(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(this.settings().aboutYouTube || ''),
  );
}