import { Component, input } from '@angular/core';
import { AppIconComponent } from './app-icon.component';
import { AppWowDirective } from './app-wow.directive';
import type { Service } from '../lib/site-content';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [AppIconComponent, AppWowDirective],
  template: `
    <section id="services" class="section-bg section-pad">
      <div class="container-x">
        <header class="section-header wow wow-fade-up">
          <h3>Servicios</h3>
          <p>
            SINERGIA Ocupacional, fue fundada en 1990 como una oficina de servicios médicos a empresas,
            inicialmente compañías de seguros, bancos y maquiladoras, para posteriormente integrar
            servicios de capacitación en materia de salud y seguridad.
          </p>
        </header>

        <div class="flex flex-col md:flex-row md:flex-wrap">
          @for (service of services(); track service.id; let i = $index) {
            <div class="mb-[40px] w-full md:w-1/2 lg:w-[41.666%] lg:ml-[8.333%]">
              <div
                class="group mx-[10px] rounded-[10px] bg-white p-[30px] shadow-[0_10px_29px_rgba(68,88,144,0.1)] transition-transform duration-300 ease-in-out hover:-translate-y-[5px] wow wow-bounce-in-up"
                [style.animation-delay]="i * 0.15 + 's'"
              >
                <div class="flex items-center">
                  <div class="shrink-0 text-primary transition-colors duration-500">
                    <app-icon [name]="service.icon" iconClass="h-16 w-16" />
                  </div>
                  <div class="pl-10">
                    <h4 class="mb-[15px] text-[18px] font-bold text-[#111] transition-colors duration-300 group-hover:text-primary">
                      {{ service.title }}
                    </h4>
                    <p class="text-[14px] leading-6">{{ service.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class AppServicesComponent {
  services = input<Service[]>([]);
}