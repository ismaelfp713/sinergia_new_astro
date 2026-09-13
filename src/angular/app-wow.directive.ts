import { Directive, ElementRef, type OnDestroy, type OnInit } from '@angular/core';

@Directive({
  selector: '.wow',
})
export class AppWowDirective implements OnInit, OnDestroy {
  private observer?: IntersectionObserver;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  ngOnInit() {
    const node = this.elementRef.nativeElement;
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      node.classList.add('animated');
      return;
    }
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          node.classList.add('animated');
          this.observer?.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    this.observer.observe(node);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}