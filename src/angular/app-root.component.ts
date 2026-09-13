import { Component, HostListener, inject, signal, type OnInit } from '@angular/core';

const ngCompiler = await import('@angular/compiler');
/**
 * astro-angular islands ship some declarations as "partial" (linked) components,
 * so @angular/compiler must be present and its CompilerFacade registered before
 * Angular bootstraps. The tree-shaker drops the compiler's top-level
 * publishFacade(global) call, so we invoke it explicitly.
 */
interface CompilerModule {
  publishFacade(global: unknown): void;
}
;(ngCompiler as unknown as CompilerModule).publishFacade(globalThis);
import { PbService } from './pb.service';
import { AppHeaderComponent } from './header.component';
import { AppHeroComponent } from './hero.component';
import { AppAboutComponent } from './about.component';
import { AppServicesComponent } from './services.component';
import { AppWhyUsComponent } from './why-us.component';
import { AppPortfolioComponent } from './portfolio.component';
import { AppTeamComponent } from './team.component';
import { AppClientsComponent } from './clients.component';
import { AppContactComponent } from './contact.component';
import { AppFooterComponent } from './footer.component';
import { AppIconComponent } from './app-icon.component';
import { fallbackContent, type SiteContent } from '../lib/site-content';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    AppHeaderComponent,
    AppHeroComponent,
    AppAboutComponent,
    AppServicesComponent,
    AppWhyUsComponent,
    AppPortfolioComponent,
    AppTeamComponent,
    AppClientsComponent,
    AppContactComponent,
    AppFooterComponent,
    AppIconComponent,
  ],
  template: `
    @if (content(); as content) {
      <app-header [logo]="content.settings.logo" />
      <main>
        <app-hero [settings]="content.settings" />
        <app-about [settings]="content.settings" [techniques]="content.techniques" />
        <app-services [services]="content.services" />
        <app-why-us [whyCards]="content.whyCards" [counters]="content.counters" />
        <app-portfolio [courses]="content.courses" />
        <app-team [team]="content.team" />
        <app-clients [clients]="content.clients" />
        <app-contact [settings]="content.settings" />
      </main>
      <app-footer [settings]="content.settings" />

      <a
        href="#intro"
        class="back-to-top scrollto fixed bottom-[15px] right-[15px] z-[90] rounded-full bg-primary p-3 text-white shadow-lg transition-colors hover:bg-primary-dark"
        [class.hidden]="!showBackToTop()"
      >
        <app-icon name="chevron-up" iconClass="h-4 w-4" />
      </a>

      <a
        [href]="whatsappLink"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp"
        title="Escríbenos por WhatsApp"
        class="fixed bottom-[62px] right-[15px] z-[90] flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-colors hover:bg-[#128C7E]"
      >
        <app-icon name="whatsapp" iconClass="h-6 w-6" />
      </a>
    }
  `,
})
export class AppRootComponent implements OnInit {
  content = signal<SiteContent | null>(null);
  showBackToTop = signal(false);

  private pb = inject(PbService);

  get whatsappLink(): string {
    const digits = (this.content()?.settings.phone3 ?? '').replace(/\D/g, '');
    return digits ? `https://wa.me/${digits}` : '#';
  }

  ngOnInit() {
    document.documentElement.classList.add('js');
    this.content.set(fallbackContent);
    void this.pb.getContent().then((content) => this.content.set(content));
  }

  @HostListener('window:scroll')
  onScroll() {
    this.showBackToTop.set(window.scrollY > 200);
  }
}