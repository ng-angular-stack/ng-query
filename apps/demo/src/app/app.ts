import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected title = 'demo';
  protected currentRoute = '';
  private readonly router = inject(Router);

  ngOnInit() {
    // Set initial route
    this.updateCurrentRoute(this.router.url);

    // Listen to route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateCurrentRoute(event.url);
      });
  }

  private updateCurrentRoute(url: string) {
    // Handle routes with parameters (like /no-store/1)
    if (url.startsWith('/no-store/') && !url.startsWith('/no-store-by-id/')) {
      this.currentRoute = '/no-store/1';
    } else if (url.startsWith('/no-store-by-id/')) {
      this.currentRoute = '/no-store-by-id/1';
    } else {
      this.currentRoute = url;
    }
  }

  navigate(event: Event) {
    const target = event.target as HTMLSelectElement;
    const url = target.value;
    if (url) {
      console.log('Navigating to:', url);
      this.router.navigateByUrl(url);
    }
  }
}
