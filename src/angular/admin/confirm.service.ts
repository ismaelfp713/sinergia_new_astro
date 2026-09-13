import { Injectable, signal } from '@angular/core';

interface PendingConfirm {
  title: string;
  message: string;
  confirmLabel: string;
  danger: boolean;
  resolve: (value: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  pending = signal<PendingConfirm | null>(null);

  confirm(options: { title?: string; message: string; confirmLabel?: string; danger?: boolean }): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.pending.set({
        title: options.title ?? '¿Confirmar acción?',
        message: options.message,
        confirmLabel: options.confirmLabel ?? 'Continuar',
        danger: options.danger ?? true,
        resolve,
      });
    });
  }

  answer(value: boolean): void {
    const p = this.pending();
    if (!p) return;
    this.pending.set(null);
    p.resolve(value);
  }
}