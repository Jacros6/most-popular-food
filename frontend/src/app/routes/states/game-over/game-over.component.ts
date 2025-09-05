import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [],
  selector: 'app-game-over',
  templateUrl: 'game-over.component.html',
})
export class GameOverComponent {
  @Input() score: number = 0;
  constructor(private readonly router: Router) {}

  restartGame() {
    this.router.navigate(['']);
  }
}
