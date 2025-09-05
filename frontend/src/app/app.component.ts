import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MOVIE_IMAGES } from '../assets/movie-images';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  images: string[] = MOVIE_IMAGES;
  title = 'most-popular-food';
}
