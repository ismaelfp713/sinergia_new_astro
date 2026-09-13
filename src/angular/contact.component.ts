import { Component, HostListener, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import type { SafeResourceUrl } from '@angular/platform-browser';
import { AppIconComponent } from './app-icon.component';
import { AppWowDirective } from './app-wow.directive';
import type { Settings } from '../lib/site-content';

const POLICY_ITEMS = [
  {
    title: 'Introducción:',
    text: 'SINERGIA ocupacional, fue fundada en 1990 como una oficina de servicios médicos a empresas y maquiladoras, para posteriormente integrar servicios de capacitación en materia de salud, seguridad y desarrollo humano.',
  },
  {
    title: 'Descripción general:',
    text: 'En SINERGIA ocupacional, utilizamos sus datos de una manera confidencial.',
  },
  {
    title: 'Recopilación de datos:',
    text: 'Los datos recopilados de cada cliente, se usan únicamente para realizar los procesos de comunicación de oferta de servicios propios de SINERGIA ocupacional con el cliente.',
  },
  {
    title: 'Transparencia:',
    text: 'Los clientes pueden acceder y consultar sus datos en el momento que lo desee.',
  },
  {
    title: 'Actualizaciones:',
    text: 'La política de privacidad de SINERGIA ocupacional, puede ser modificada y publicada de acuerdo a la revisión de sus propios estatutos.',
  },
];

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [AppIconComponent, AppWowDirective, FormsModule],
  template: `
    <section id="contact" class="section-pad overflow-hidden shadow-[0_0_12px_rgba(0,0,0,0.1)]">
      <div class="w-full px-[15px]">
        <header class="section-header wow wow-fade-up">
          <h3>Contacto</h3>
        </header>

        <div class="grid grid-cols-1 gap-8 lg:grid-cols-2 wow wow-fade-up">
          <div class="map mb-4 lg:mb-0">
            <div class="h-[312px] overflow-hidden rounded-lg shadow-[0_10px_30px_rgba(68,88,144,0.12)] lg:h-full">
              <iframe
                [src]="mapSrc"
                title="Mapa de ubicación SINERGIA Ocupacional"
                class="h-full w-full border-0"
                allowfullscreen
                loading="lazy"
              ></iframe>
            </div>
          </div>

          <div>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-12">
              <div class="info md:col-span-6 rounded-lg border border-[#dcebf5] bg-[#f7fbff] p-4">
                <div class="flex items-start gap-4">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                    <app-icon name="location" iconClass="h-4 w-4" />
                  </div>
                  <p class="leading-7 text-ink">{{ settings().address }}</p>
                </div>
              </div>

              <div class="info md:col-span-6 rounded-lg border border-[#dcebf5] bg-[#f7fbff] p-4">
                <div class="flex items-start gap-4">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                    <app-icon name="email" iconClass="h-4 w-4" />
                  </div>
                  <p class="break-all leading-7 text-ink">
                    <a [href]="'mailto:' + settings().email" class="hover:text-primary">{{ settings().email }}</a>
                  </p>
                </div>
              </div>
            </div>

            <div class="form mt-4">
              @if (showSuccess()) {
                <div class="mb-[15px] border border-primary p-[15px] text-center font-semibold text-primary">
                  Mensaje enviado. Gracias!
                </div>
              }
              @if (errorMessage()) {
                <div class="mb-[15px] border border-red-600 p-[15px] text-center font-semibold text-red-600">
                  {{ errorMessage() }}
                </div>
              }

              <form id="contactForm" method="post" role="form" (ngSubmit)="onSubmit()">
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label for="ct-name" class="mb-1 block text-[13px] font-semibold text-ink">Nombre</label>
                    <input
                      type="text"
                      id="ct-name"
                      name="name"
                      placeholder="Nombre"
                      required
                      [value]="model.name"
                      (input)="onInput('name', $any($event.target).value)"
                      class="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label for="ct-email" class="mb-1 block text-[13px] font-semibold text-ink">Email</label>
                    <input
                      type="email"
                      id="ct-email"
                      name="email"
                      placeholder="Email"
                      required
                      [value]="model.email"
                      (input)="onInput('email', $any($event.target).value)"
                      class="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div class="mt-3">
                  <label for="ct-subject" class="mb-1 block text-[13px] font-semibold text-ink">Tema</label>
                  <input
                    type="text"
                    id="ct-subject"
                    name="subject"
                    placeholder="Tema"
                    required
                    [value]="model.subject"
                    (input)="onInput('subject', $any($event.target).value)"
                    class="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div class="mt-3">
                  <label for="ct-message" class="mb-1 block text-[13px] font-semibold text-ink">Mensaje</label>
                  <textarea
                    id="ct-message"
                    name="message"
                    rows="5"
                    placeholder="Mensaje"
                    required
                    [value]="model.message"
                    (input)="onInput('message', $any($event.target).value)"
                    class="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  ></textarea>
                </div>
                <div class="mt-3 flex cursor-pointer select-none items-start gap-2" (click)="openModal($event)">
                  <span
                    class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border-2 transition-colors"
                    [class.bg-primary]="policyChecked()"
                    [class.border-primary]="policyChecked()"
                    [class.text-white]="policyChecked()"
                    [class.bg-white]="!policyChecked()"
                    [class.border-gray-300]="!policyChecked()"
                    aria-hidden="true"
                  >
                    @if (policyChecked()) {
                      <i class="fa fa-check text-[10px]"></i>
                    }
                  </span>
                  <span class="text-[14px] leading-6">
                    Aceptar&nbsp;<span class="text-primary underline underline-offset-2">Politica de Privacidad</span>
                  </span>
                </div>
                <div class="text-center">
                  <button
                    type="submit"
                    id="sendmessages"
                    title="Envía el mensaje"
                    [disabled]="!policyChecked() || submitLabel() !== 'Enviar'"
                    class="mt-4 min-w-[180px] rounded-full bg-primary px-[30px] py-2.5 text-white transition-colors duration-300 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {{ submitLabel() }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div
      class="modal fixed inset-0 z-[2000] items-center justify-center bg-black/50 p-4"
      [class.hidden]="!modalOpen()"
      [class.flex]="modalOpen()"
      role="dialog"
      aria-modal="true"
      aria-labelledby="policyModalLabel"
      (click)="closeModalOnBackdrop($event)"
    >
      <div class="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg bg-white shadow-xl">
        <div class="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h5 id="policyModalLabel" class="text-lg font-semibold text-ink">
            Política de Privacidad de SINERGIA ocupacional:
          </h5>
          <button
            type="button"
            aria-label="Cerrar"
            class="text-2xl leading-none text-gray-500 hover:text-ink"
            (click)="closeModal()"
          >
            &times;
          </button>
        </div>

        <div class="px-5 py-4">
          <ul class="list-disc space-y-3 pl-5 text-[14px] leading-relaxed text-muted">
            @for (item of POLICY_ITEMS; track item.title) {
              <li>
                <strong class="text-ink">{{ item.title }}</strong> {{ item.text }}
              </li>
            }
          </ul>
        </div>

        <div class="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <button
            type="button"
            class="rounded border border-gray-300 px-4 py-2 text-[14px] text-muted transition-colors hover:bg-gray-100"
            (click)="closeModal()"
          >
            Cerrar
          </button>
          <button
            type="button"
            class="rounded bg-primary px-4 py-2 text-[14px] text-white transition-colors hover:bg-primary-dark"
            (click)="acceptPolicy()"
          >
            Acepto Política
          </button>
        </div>
      </div>
    </div>
  `,
})
export class AppContactComponent {
  settings = input<Settings>({} as Settings);

  readonly POLICY_ITEMS = POLICY_ITEMS;
  readonly url: string = (import.meta.env.PUBLIC_POCKETBASE_URL ?? '').replace(/\/+$/, '');

  modalOpen = signal(false);
  policyChecked = signal(false);
  showSuccess = signal(false);
  errorMessage = signal('');
  submitLabel = signal('Enviar');

model = { name: '', email: '', subject: '', message: '' };

  onInput(field: string, value: string) {
    this.model = { ...this.model, [field]: value };
  }

  private cachedMapUrl = '';
  private cachedMapSrc?: SafeResourceUrl;

  get mapSrc(): SafeResourceUrl {
    const url = this.settings().mapEmbed;
    if (this.cachedMapUrl !== url) {
      this.cachedMapUrl = url;
      this.cachedMapSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    return this.cachedMapSrc!;
  }

  private sanitizer = inject(DomSanitizer);

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeModal();
  }

  openModal(event: Event) {
    event.preventDefault();
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
  }

  acceptPolicy() {
    this.policyChecked.set(true);
    this.closeModal();
  }

  closeModalOnBackdrop(event: Event) {
    if ((event.target as HTMLElement).classList?.contains('modal')) this.closeModal();
  }

  async onSubmit() {
    this.errorMessage.set('');
    this.showSuccess.set(false);

    if (!this.policyChecked()) {
      this.errorMessage.set('Favor de aceptar la Política de Privacidad.');
      return;
    }
    if (this.model.subject.trim().length < 4) {
      this.errorMessage.set('Ingresar al menos 4 caracteres sobre el tema');
      return;
    }
    if (!this.url) {
      this.errorMessage.set('El formulario no está configurado. Contacte a la empresa por teléfono.');
      return;
    }

    this.submitLabel.set('Enviando...');
    const data = {
      name: this.model.name,
      email: this.model.email,
      subject: this.model.subject,
      message: this.model.message,
    };

    try {
      const res = await fetch(`${this.url}/api/collections/messages/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Request failed');
      this.showSuccess.set(true);
      this.model = { name: '', email: '', subject: '', message: '' };
      this.policyChecked.set(false);
    } catch (err) {
      console.error(err);
      this.errorMessage.set('No se pudo enviar el mensaje. Inténtelo de nuevo o contacte por teléfono.');
    } finally {
      this.submitLabel.set('Enviar');
    }
  }
}