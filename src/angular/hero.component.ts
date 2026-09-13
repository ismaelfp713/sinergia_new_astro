import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import type { SafeResourceUrl } from '@angular/platform-browser';
import { AppWowDirective } from './app-wow.directive';
import type { Settings } from '../lib/site-content';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [AppWowDirective],
  template: `
    <section
      id="intro"
      class="relative w-full bg-cover bg-center bg-bottom"
      [style.background-image]="heroImage()"
    >
      <div
        class="container-x flex flex-col items-center pt-[140px] pb-[60px] max-lg:gap-8 max-[574px]:pt-[100px] max-[574px]:pb-[20px] lg:flex-row lg:items-start lg:pt-[200px] lg:pb-[120px]"
      >
        <div class="intro-img w-4/5 lg:order-2 lg:w-1/2 xl:px-4">
          <div class="aspect-video w-full">
            <iframe
              class="h-full w-full"
              [src]="introVideo()"
              title="Video de introducción SINERGIA Ocupacional"
              allow="autoplay; fullscreen"
              allowfullscreen
            ></iframe>
          </div>
        </div>

        <div class="intro-info wow wow-fade-up text-center lg:order-1 lg:w-1/2">
          <h2 class="mb-10 text-[34px] font-bold text-white md:text-[48px]">SINERGIA ocupacional</h2>
          <h1 class="introh1 text-[30px] text-white">
            Proveemos soluciones de capacitación y entrenamiento para su negocio!
          </h1>
          <div class="mt-8">
            <a href="#about" class="btn-pill-blue scrollto">Inicio</a>
            <a href="#services" class="btn-pill-outline scrollto">Nuestros Servicios</a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class AppHeroComponent {
  settings = input<Settings>({} as Settings);

  private sanitizer = inject(DomSanitizer);

  heroImage = computed(() => `url('${this.settings().heroBg}')`);
  introVideo = computed<SafeResourceUrl>(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(this.settings().introYouTube || ''),
  );
}