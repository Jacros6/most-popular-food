import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SafeHtmlPipe } from '../../pipe/safe-html.pipe';
import { STATE_BORDERS } from '../../../assets/state-borders';
import { FILL_COLORS } from '../../../assets/fill-colors';
import { PLAYABLE_STATES } from '../../../assets/playable-states';
@Component({
  standalone: true,
  imports: [SafeHtmlPipe],
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrl: 'home.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit {
  usMapSvg: string = '';

  readonly STATE_BORDERS = STATE_BORDERS;
  readonly FILL_COLORS = FILL_COLORS;
  readonly PLAYABLE_STATES = PLAYABLE_STATES;

  private currentState = '';
  currentlyAway = 0;
  currentRound = 0;
  private correctStates = new Set<string>();

  ngOnInit() {
    fetch('assets/us.svg')
      .then((res) => res.text())
      .then((svg) => {
        this.usMapSvg = svg;
      });

    this.getNewState();
  }

  onClick(event: Event) {
    const target = event.target as HTMLElement;

    if (target.tagName.toLowerCase() !== 'path') return;

    const stateId = target.dataset['id'];
    if (!stateId) return;

    if (this.correctStates.has(stateId)) return;

    if (stateId === this.currentState) {
      this.setFill(target, this.FILL_COLORS['current']);
      this.correctStates.add(stateId);
      this.resetColors();
      this.getNewState();
      return;
    }

    this.currentlyAway = this.bfs(stateId);
    const fill = this.getFillColor(this.currentlyAway);
    this.setFill(target, fill);
  }

  private resetColors() {
    document.querySelectorAll<HTMLElement>('path').forEach((path) => {
      const id = path.dataset['id'];
      if (id && this.correctStates.has(id)) {
        this.setFill(path, this.FILL_COLORS['current']);
      } else {
        this.setFill(path, '#f9f9f9'); // base/neutral
      }
    });
  }

  private getNewState() {
    if (PLAYABLE_STATES.length === 0) {
      //There should be no more playable states

      return;
    }

    const randomIndex = Math.floor(Math.random() * PLAYABLE_STATES.length);
    this.currentState = PLAYABLE_STATES[randomIndex];
    this.currentRound++;
    const removedElement = PLAYABLE_STATES.splice(randomIndex, 1)[0];
    console.log(this.currentState, PLAYABLE_STATES);
  }

  private setFill(element: HTMLElement, color: string) {
    element.setAttribute('fill', color);
  }

  private getFillColor(distance: number): string {
    return this.FILL_COLORS[distance] ?? this.FILL_COLORS['default'];
  }

  private bfs(clickedState: string | undefined): number {
    if (!clickedState) {
      return 0;
    }
    const q = [{ state: clickedState as string, distance: 0 }];
    const visited = new Set();
    visited.add(clickedState);
    while (q.length > 0) {
      const front = q.shift();
      if (!front) continue;
      if (front.state === this.currentState) {
        return front.distance;
      }
      const neighbors = this.STATE_BORDERS[front.state];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          q.push({ state: neighbor, distance: front.distance + 1 });
        }
      }
    }
    return 0;
  }
}
