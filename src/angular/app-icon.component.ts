import { Component, computed, input } from '@angular/core';
import { resolveIcon } from '../lib/icon-paths';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    @if (icon()) {
      <svg [class]="iconClass()" [attr.viewBox]="viewBoxValue()" fill="currentColor" aria-hidden="true">
        @for (d of icon()!.paths; track $index) {
          <path [attr.d]="d" />
        }
      </svg>
    }
  `,
})
export class AppIconComponent {
  name = input<string>('');
  iconClass = input<string>('h-5 w-5');

  icon = computed(() => resolveIcon(this.name()));
  viewBoxValue = computed(() => this.icon()?.viewBox.join(' ') ?? '0 0 24 24');
}