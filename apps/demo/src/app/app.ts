import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'demo';
  private readonly router = inject(Router);

  navigate(url: string) {
    console.log('url', url);
    this.router.navigateByUrl(url);
  }
}
