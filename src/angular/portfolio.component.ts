import { Component, input } from '@angular/core';
import { AppIconComponent } from './app-icon.component';
import { AppWowDirective } from './app-wow.directive';
import { slugify } from '../lib/slug';
import type { Course } from '../lib/site-content';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [AppIconComponent, AppWowDirective],
  template: `
    <section id="portfolio" class="section-pad bg-light shadow-[0_0_12px_rgba(0,0,0,0.1)]">
      <div class="container-x">
        <div class="text-center">
          <h2 class="mb-[15px] text-[32px] font-bold uppercase tracking-wide text-ink md:text-[40px]">
            Portafolio
          </h2>
          <h3 class="mb-[35px] text-[16px] font-normal italic text-muted md:mb-[75px]">
            Cursos y Entrenamientos disponibles.
          </h3>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          @for (course of courses(); track course.id; let i = $index) {
            <div class="portfolio-item text-center wow wow-fade-up" [style.animation-delay]="(i % 3) * 0.15 + 's'">
              <a [href]="'/curso/' + slugify(course.title)" class="block">
                <div class="group relative block overflow-hidden">
                  <img [src]="course.image" [alt]="course.title" loading="lazy" class="h-[10em] w-full object-cover" />
                  <div class="absolute inset-0 flex items-center justify-center bg-[rgba(254,209,54,0.9)] text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <app-icon name="plus" iconClass="h-12 w-12" />
                  </div>
                </div>
                <div class="mx-auto max-w-[400px] bg-white p-[25px] text-center">
                  <h4 class="mb-1 text-[18px] font-semibold text-ink">{{ course.title }}</h4>
                  <p class="mb-0 text-[16px] italic text-muted">{{ course.description }}</p>
                </div>
              </a>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class AppPortfolioComponent {
  slugify = slugify;
  courses = input<Course[]>([]);
}