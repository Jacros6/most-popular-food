import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatDivider } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  standalone: true,
  imports: [MatButtonModule, MatCardModule],
  selector: 'app-game-over',
  templateUrl: 'game-over.component.html',
  styleUrl: 'game-over.component.scss',
})
export class GameOverComponent {
  @Input() score: number = 0;
  @Input() playedMedia: any[] = [];
  constructor(private readonly router: Router) {}
  ngOnInit() {
    console.log(this.playedMedia);
  }
  restartGame() {
    this.router.navigate(['']);
  }
}
