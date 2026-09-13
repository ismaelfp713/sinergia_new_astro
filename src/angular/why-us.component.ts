import {
  Component,
  ElementRef,
  input,
  signal,
  type AfterViewInit,
  type OnDestroy,
  type OnInit,
} from '@angular/core';
import { AppIconComponent } from './app-icon.component';
import { AppWowDirective } from './app-wow.directive';
import type { Counter, WhyCard } from '../lib/site-content';

const AUTOPLAY_MS = 8000;

@Component({
  selector: 'app-why-us',
  standalone: true,
  imports: [AppIconComponent, AppWowDirective],
  template: `
    <section id="why-us" class="section-pad bg-primary">
      <div class="container-x">
        <header class="section-header wow wow-fade-up">
          <h3 class="text-white">Porque elegirnos?</h3>
        </header>

        <div class="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-4">
          @for (card of whyCards(); track card.id; let i = $index) {
            <div
              class="group rounded-[10px] bg-primary-dark px-3 py-[15px] text-center text-white transition-colors duration-300 ease-in-out hover:bg-primary-darker wow wow-bounce-in-up"
              [style.animation-delay]="i * 0.15 + 's'"
            >
              <div class="pt-[15px] text-[48px] leading-none text-[#bfddfe]">
                <i [class]="faClass(card.icon)" aria-hidden="true"></i>
              </div>
              <div class="carousel relative mt-3" (mouseenter)="pause(i)" (mouseleave)="resume(i)">
                <div class="carousel-inner flex min-h-[150px] flex-col justify-center">
                  @for (item of card.items; track $index) {
                    <p
                      class="carousel-item text-[15px] leading-relaxed text-breath"
                      [class.active]="indices()[i] === $index"
                    >
                      {{ item }}
                    </p>
                  }
                </div>
                <button
                  type="button"
                  aria-label="Anterior"
                  class="absolute left-[-6px] top-1/2 -translate-y-1/2 text-[#74b5fc] transition-colors hover:text-white"
                  (click)="move(i, -1)"
                >
                  <app-icon name="chevron-left" iconClass="h-6 w-6" />
                </button>
                <button
                  type="button"
                  aria-label="Siguiente"
                  class="absolute right-[-6px] top-1/2 -translate-y-1/2 text-[#74b5fc] transition-colors hover:text-white"
                  (click)="move(i, 1)"
                >
                  <app-icon name="chevron-right" iconClass="h-6 w-6" />
                </button>
              </div>
            </div>
          }
        </div>

        <div class="counters-grid grid grid-cols-2 gap-y-10 pt-[40px] text-center lg:grid-cols-4">
          @for (counter of counters(); track counter.id; let i = $index) {
            <div>
              <span class="block text-[40px] font-bold text-white md:text-[48px]">
                {{ displayed()[i] ?? 0 }}
              </span>
              <p class="mx-0 mb-5 mt-0 font-display text-[14px] text-pale">{{ counter.label }}</p>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class AppWhyUsComponent implements OnInit, AfterViewInit, OnDestroy {
  whyCards = input<WhyCard[]>([]);
  counters = input<Counter[]>([]);

  indices = signal<number[]>([]);
  displayed = signal<number[]>([]);

  private timers: number[] = [];
  private counterObserver?: IntersectionObserver;
  private countersStarted = false;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  faClass(name: string): string {
    const clean = (name || '').replace(/^fa[- ]+/i, '').trim().replace(/\s+/g, '-');
    const alias: Record<string, string> = { objects: 'object-group' };
    return `fa fa-${alias[clean] || clean}`;
  }

  ngOnInit() {
    this.indices.set(this.whyCards().map(() => 0));
    this.displayed.set(this.counters().map(() => 0));
    this.whyCards().forEach((_, i) => this.resume(i));
  }

  ngAfterViewInit() {
    const grid = this.elementRef.nativeElement.querySelector('.counters-grid') as HTMLElement | null;
    if (!grid) return;
    this.counterObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting) && !this.countersStarted) {
          this.countersStarted = true;
          this.animateCounters();
          this.counterObserver?.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    this.counterObserver.observe(grid);
  }

  ngOnDestroy() {
    for (const timer of this.timers) window.clearInterval(timer);
    this.counterObserver?.disconnect();
  }

  move(cardIndex: number, delta: number) {
    const count = this.whyCards()[cardIndex]?.items.length ?? 0;
    if (!count) return;
    this.indices.update((arr) =>
      arr.map((value, i) => (i === cardIndex ? (value + delta + count) % count : value)),
    );
  }

  pause(cardIndex: number) {
    const timer = this.timers[cardIndex];
    if (timer) window.clearInterval(timer);
    this.timers[cardIndex] = 0;
  }

  resume(cardIndex: number) {
    this.pause(cardIndex);
    this.timers[cardIndex] = window.setInterval(() => this.move(cardIndex, 1), AUTOPLAY_MS);
  }

  private animateCounters() {
    const targets = this.counters();
    if (!targets.length) return;
    const duration = 1600;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.displayed.set(targets.map((counter) => Math.round(counter.value * eased)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}