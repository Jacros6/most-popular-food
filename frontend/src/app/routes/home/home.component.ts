import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MOVIE_IMAGES } from '../../../assets/movie-images';
import { MatCardModule } from '@angular/material/card';

@Component({
  standalone: true,
  imports: [MatButtonModule, MatCardModule],
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrl: 'home.component.scss',
})
export class HomeComponent implements OnInit {
  images: string[] = MOVIE_IMAGES;

  constructor(private readonly router: Router) {}

  ngOnInit() {}

  toStates(mode: 'iconic' | 'all') {
    this.router.navigate(['/states']);
  }
}
