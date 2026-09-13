import { Component, input } from '@angular/core';
import { AppWowDirective } from './app-wow.directive';
import type { Client } from '../lib/site-content';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [AppWowDirective],
  template: `
    <section id="clients" class="section-bg section-pad">
      <div class="container-x">
        <header class="section-header wow wow-fade-up">
          <h3>Nuestros Clientes</h3>
        </header>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 wow wow-fade-up">
          @for (client of clients(); track client.id) {
            <div class="flex h-[160px] items-center justify-center overflow-hidden border-b border-r border-[#a9dcf5] bg-white p-8">
              <img
                [src]="client.logo"
                [alt]="client.name || 'Cliente SINERGIA Ocupacional'"
                loading="lazy"
                class="max-h-full max-w-full transition-transform duration-500 ease-in-out hover:scale-[1.2]"
              />
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class AppClientsComponent {
  clients = input<Client[]>([]);
}