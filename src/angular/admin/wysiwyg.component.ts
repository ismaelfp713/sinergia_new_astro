import {
  Component,
  ElementRef,
  effect,
  input,
  output,
  viewChild,
  type OnInit,
} from '@angular/core';

function sanitizeHtml(html: string): string {
  return String(html ?? '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<(iframe|object|embed|form|video|audio|link|meta)[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

@Component({
  selector: 'app-wysiwyg',
  standalone: true,
  template: `
    <div class="overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
      <div class="flex flex-wrap items-center gap-0.5 overflow-x-auto border-b border-slate-200 bg-slate-50 px-1.5 py-1">
        @for (btn of toolbar; track btn.cmd) {
          <button
            type="button"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded text-[13px] font-semibold text-slate-600 transition-colors hover:bg-white hover:text-primary"
            [title]="btn.label"
            [attr.aria-label]="btn.label"
            (mousedown)="$event.preventDefault()"
            (click)="run(btn)"
          >
            @if (btn.html) {
              <span [innerHTML]="btn.html"></span>
            } @else {
              <i [class]="btn.fa" aria-hidden="true"></i>
            }
          </button>
        }
      </div>
      <div
        #ed
        contenteditable="true"
        role="textbox"
        aria-multiline="true"
        class="wysiwyg-body min-h-[140px] cursor-text px-3 py-2 text-[14px] leading-6 text-slate-700 outline-none"
        (input)="onInput()"
        (keydown)="onKeydown($event)"
      ></div>
    </div>
  `,
})
export class WysiwygComponent implements OnInit {
  value = input<string>('');
  valueChange = output<string>();

  readonly editor = viewChild.required<ElementRef<HTMLDivElement>>('ed');

  readonly toolbar: Array<{ cmd: string; arg?: string; label: string; fa?: string; html?: string }> = [
    { cmd: 'bold', label: 'Negrita', html: '<b>B</b>' },
    { cmd: 'italic', label: 'Cursiva', html: '<i>I</i>' },
    { cmd: 'underline', label: 'Subrayado', html: '<u>U</u>' },
    { cmd: 'formatBlock', arg: 'h3', label: 'Encabezado', html: '<span class="text-[11px]">H3</span>' },
    { cmd: 'insertUnorderedList', label: 'Lista con viñetas', fa: 'fa fa-list-ul' },
    { cmd: 'insertOrderedList', label: 'Lista numerada', fa: 'fa fa-list-ol' },
    { cmd: 'createLink', label: 'Enlace', fa: 'fa fa-link' },
    { cmd: 'removeFormat', label: 'Quitar formato', fa: 'fa fa-eraser' },
    { cmd: 'clear', label: 'Limpiar todo', fa: 'fa fa-remove' },
  ];

  constructor() {
    effect(() => {
      const v = this.value();
      const el = this.editor()?.nativeElement;
      if (!el) return;
      if (document.activeElement !== el && sanitizeHtml(el.innerHTML) !== sanitizeHtml(v)) {
        el.innerHTML = sanitizeHtml(v);
      }
    });
  }

  ngOnInit() {
    this.editor().nativeElement.innerHTML = sanitizeHtml(this.value());
  }

  run(btn: { cmd: string; arg?: string; label: string }) {
    this.editor().nativeElement.focus();
    if (btn.cmd === 'clear') {
      this.editor().nativeElement.innerHTML = '';
      this.emit();
      return;
    }
    if (btn.cmd === 'createLink') {
      const url = window.prompt('URL del enlace (https://...)', 'https://');
      if (url) document.execCommand('createLink', false, url);
      else return;
    } else if (btn.cmd === 'formatBlock') {
      const tag = btn.arg ?? 'h3';
      document.execCommand('styleWithCSS', false, 'false');
      if (!document.execCommand('formatBlock', false, `<${tag}>`)) {
        document.execCommand('formatBlock', false, tag);
      }
    } else {
      document.execCommand(btn.cmd, false, btn.arg);
    }
    this.emit();
  }

  onInput() {
    this.emit();
  }

  onKeydown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
      event.preventDefault();
      document.execCommand('bold');
      this.emit();
    }
  }

  private emit() {
    this.valueChange.emit(sanitizeHtml(this.editor().nativeElement.innerHTML));
  }
}