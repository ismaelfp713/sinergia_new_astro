import { Component, input } from '@angular/core';
import { AppIconComponent } from './app-icon.component';
import { AppWowDirective } from './app-wow.directive';
import type { TeamMember } from '../lib/site-content';

const SOCIALS = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'linkedin', label: 'LinkedIn' },
] as const;

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [AppIconComponent, AppWowDirective],
  template: `
    <section id="team" class="section-pad">
      <div class="container-x">
        <header class="section-header wow wow-fade-up">
          <h3>Nuestro Equipo</h3>
        </header>

        <div class="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3 md:gap-x-4 lg:grid-cols-4">
          @for (member of team(); track member.id; let i = $index) {
            <div
              class="group relative mx-auto mb-5 aspect-square w-full max-w-[280px] overflow-hidden rounded-full text-center wow wow-fade-up"
              [style.animation-delay]="i * 0.1 + 's'"
            >
              <img
                [src]="member.photo"
                [alt]="member.name"
                loading="lazy"
                class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div
                class="absolute inset-0 flex flex-col items-center justify-center bg-[rgba(8,46,65,0.7)] p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              >
                <div class="mt-[50px] transition-all duration-200 group-hover:mt-0">
                  <h4 class="mb-[2px] text-[18px] font-bold text-white">{{ member.name }}</h4>
                  <span class="block text-[13px] italic text-white">{{ member.role }}</span>
                  @if (hasSocial(member)) {
                    <div class="mt-[15px] flex items-center justify-center gap-2">
                      @for (social of SOCIALS; track social.key) {
                        @if (member[social.key]) {
                          <a
                            [href]="member[social.key]!"
                            target="_blank"
                            rel="noopener noreferrer"
                            [attr.aria-label]="member.name + ' en ' + social.label"
                            class="inline-block text-white transition-colors hover:text-primary"
                          >
                            <app-icon [name]="social.key" iconClass="h-5 w-5" />
                          </a>
                        }
                      }
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class AppTeamComponent {
  readonly SOCIALS = SOCIALS;

  team = input<TeamMember[]>([]);

  hasSocial(member: TeamMember): boolean {
    return SOCIALS.some((social) => Boolean(member[social.key]));
  }
}