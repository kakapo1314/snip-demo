import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Link, SnipApiService } from './snip-api.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private readonly api = inject(SnipApiService);

  readonly url = signal('');
  readonly links = signal<Link[]>([]);
  readonly createdLink = signal<Link | null>(null);
  readonly error = signal('');
  readonly isSubmitting = signal(false);

  ngOnInit(): void {
    this.loadLinks();
  }

  submit(): void {
    const value = this.url().trim();
    if (!this.isHttpUrl(value)) {
      this.error.set('Enter a valid http or https URL.');
      return;
    }

    this.error.set('');
    this.createdLink.set(null);
    this.isSubmitting.set(true);
    this.api.createLink(value).subscribe({
      next: (link) => {
        this.createdLink.set(link);
        this.url.set('');
        this.links.update((links) => [link, ...links]);
        this.isSubmitting.set(false);
      },
      error: () => {
        this.error.set('Could not shorten that URL. Is the backend running?');
        this.isSubmitting.set(false);
      }
    });
  }

  private loadLinks(): void {
    this.api.getLinks().subscribe({
      next: (links) => this.links.set(links),
      error: () => this.error.set('Could not load links from the backend.')
    });
  }

  private isHttpUrl(value: string): boolean {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
