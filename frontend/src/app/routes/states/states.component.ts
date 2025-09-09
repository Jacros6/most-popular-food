import {
  Component,
  OnInit,
  ViewEncapsulation,
  Renderer2,
  ElementRef,
} from '@angular/core';
import { SafeHtmlPipe } from '../../pipe/safe-html.pipe';
import { STATE_BORDERS } from '../../../assets/state-borders';
import { FILL_COLORS } from '../../../assets/fill-colors';
import { PLAYABLE_STATES } from '../../../assets/playable-states';
import { ALL_STATES } from '../../../assets/all-states';
import { MediaService, StateMedia } from '../../service/media.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { ActivatedRoute, Router } from '@angular/router';
import { GameOverComponent } from './game-over/game-over.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    SafeHtmlPipe,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatListModule,
    GameOverComponent,
  ],
  selector: 'app-home',
  templateUrl: 'states.component.html',
  styleUrl: 'states.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class StatesComponent implements OnInit {
  usMapSvg: string = '';

  readonly STATE_BORDERS = STATE_BORDERS;
  readonly FILL_COLORS = FILL_COLORS;
  PLAYABLE_STATES = [...PLAYABLE_STATES];
  readonly ALL_STATES = ALL_STATES;

  readonly STATE_LOOKUP: Record<string, string> = this.ALL_STATES.reduce(
    (state, acc, i) => {
      state[acc] = this.PLAYABLE_STATES[i];
      return state;
    },
    {} as Record<string, string>,
  );

  private currentState = '';
  currentlyAway: number | null = null;
  currentRound = 0;
  private correctStates = new Set<string>();
  hoveredState: string | null = null;
  mediaList: StateMedia = {};
  currentMedia: any = null;
  stateCtrl = new FormControl('');
  filteredStates!: Observable<string[]>;
  playedStatesInRound: { id: string; name: string; stepsAway: number }[] = [];
  score = 0;
  attemptsThisRound = 0;
  maxRounds = 50;
  playedMedia: any[] = [];

  gameOver = false;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private readonly mediaService: MediaService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {
    this.filteredStates = this.stateCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || '')),
    );
  }

  get playedStatesArray(): any[] {
    return [...this.playedStatesInRound].reverse();
  }

  async ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const mode = params.get('mode');
      if (mode === 'short') {
        this.maxRounds = 15;
      } else {
        this.maxRounds = 50;
      }
    });

    this.mediaList = await this.mediaService.loadJson();

    fetch('assets/us.svg')
      .then((res) => res.text())
      .then((svg) => {
        this.usMapSvg = svg;
        this.onStateHover();
      });
    this.getNewState();
  }

  restartGame() {
    this.gameOver = false;
    this.score = 0;
    this.currentRound = 0;
    this.correctStates.clear();
    this.attemptsThisRound = 0;
    this.PLAYABLE_STATES = [...PLAYABLE_STATES];
    this.getNewState();
    this.resetColors();
    this.router.navigate(['']);
  }

  onStateHover() {
    setTimeout(() => {
      const paths = this.el.nativeElement.querySelectorAll('path[data-name]');
      paths.forEach((path: SVGPathElement) => {
        this.renderer.listen(path, 'mouseover', () => {
          this.hoveredState = path.getAttribute('data-name');
        });
        this.renderer.listen(path, 'mouseout', () => {
          this.hoveredState = null;
        });
      });
    });
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.ALL_STATES.filter((state) =>
      state.toLowerCase().includes(filterValue),
    );
  }

  onClick(event: Event) {
    const target = event.target as HTMLElement;
    if (target.tagName.toLowerCase() !== 'path') return;
    const stateId = target.dataset['id'];
    const stateName = target.dataset['name'];

    if (!stateId) return;

    if (this.playedStatesInRound.find((s) => s.id === stateId)) return;

    if (this.correctStates.has(stateId)) return;

    if (!stateName) return;

    if (stateId === this.currentState) {
      this.playedMedia.push({
        state: this.currentState,
        media: this.currentMedia,
      });
      this.nextRound(target, stateId);
      return;
    }

    this.attemptsThisRound++;
    this.currentlyAway = this.bfs(stateId);
    this.playedStatesInRound.push({
      id: stateId,
      name: stateName,
      stepsAway: this.currentlyAway,
    });
    const fill = this.getFillColor(this.currentlyAway);
    this.setFill(target, fill);
  }

  private resetColors() {
    document.querySelectorAll<HTMLElement>('path').forEach((path) => {
      const id = path.dataset['id'];
      if (id && this.correctStates.has(id)) {
        this.setFill(path, this.FILL_COLORS['current']);
      } else {
        this.setFill(path, '#f9f9f9');
      }
    });
  }

  private getNewState() {
    if (
      this.PLAYABLE_STATES.length === 0 ||
      this.maxRounds <= this.currentRound
    ) {
      this.gameOver = true;
      return;
    }
    const randomIndex = Math.floor(Math.random() * this.PLAYABLE_STATES.length);
    this.currentState = this.PLAYABLE_STATES[randomIndex];
    this.currentRound++;
    this.PLAYABLE_STATES.splice(randomIndex, 1)[0];
    this.getRandomMedia();
  }

  submitGuess() {
    const guess = this.stateCtrl.value;
    if (!guess) return;
    if (!this.STATE_LOOKUP[guess]) return;
    const abbr = this.STATE_LOOKUP[guess];

    if (this.playedStatesInRound.find((s) => s.id === abbr)) return;
    const target = document.querySelector(`[data-id='${abbr}']`) as HTMLElement;
    if (abbr === this.currentState) {
      this.playedMedia.push({
        state: this.currentState,
        media: this.currentMedia,
      });
      this.nextRound(target, abbr);
      return;
    }

    this.currentlyAway = this.bfs(abbr);
    const fill = this.getFillColor(this.currentlyAway);
    this.setFill(target, fill);
    this.stateCtrl.reset();
    this.attemptsThisRound++;
    this.playedStatesInRound.push({
      id: abbr,
      name: guess,
      stepsAway: this.currentlyAway,
    });
    const input = document.querySelector<HTMLInputElement>(
      'input[formControlName="stateCtrl"]',
    );
    input?.blur();
  }

  private nextRound(target: HTMLElement, abbr: string) {
    this.addPointsForRound();
    this.setFill(target, this.FILL_COLORS['current']);
    this.correctStates.add(abbr);
    this.resetColors();
    this.getNewState();
    this.stateCtrl.reset();
    this.playedStatesInRound = [];

    const input = document.querySelector<HTMLInputElement>(
      'input[formControlName="stateCtrl"]',
    );
    input?.blur();
    this.currentlyAway = null;
  }

  private async getRandomMedia() {
    const stateMediaList = this.mediaList[this.currentState].media;
    const randomIndex = Math.floor(Math.random() * stateMediaList.length);
    const mediaId = stateMediaList[randomIndex].id;
    const isTv = stateMediaList[randomIndex].isTv;
    const res = await this.mediaService.getMediaPiece(mediaId, isTv);
    this.currentMedia = res;
  }

  private setFill(element: HTMLElement, color: string) {
    element.setAttribute('fill', color);
  }

  private getFillColor(distance: number): string {
    if (distance === 0) {
      return 'hsla(120, 100%, 50%, 1.00)';
    }
    if (distance === -1) {
      return '#999999';
    }

    const stepRotation = -25;
    const baseHue = 100;
    const hue = (baseHue + distance * stepRotation) % 360;

    return `hsl(${hue}, 100%, 50%)`;
  }

  private addPointsForRound() {
    const points = Math.max(10 - this.attemptsThisRound * 2, 2);
    this.score += points;
    this.attemptsThisRound = 0;
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
    return -1;
  }
}
