import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Config } from './services/config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private config: Config = inject(Config);

  ngOnInit() {
    this.config.locale$.subscribe((locale) => {
      console.log('Using locale', locale);
    });
  }
}
