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
  ],
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
  readonly ALL_STATES = ALL_STATES;

  private currentState = '';
  currentlyAway = 0;
  currentRound = 0;
  private correctStates = new Set<string>();
  hoveredState: string | null = null;
  mediaList: StateMedia = {};
  currentMedia: any = null;
  stateCtrl = new FormControl('');
  filteredStates!: Observable<string[]>;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private readonly mediaService: MediaService,
  ) {
    this.filteredStates = this.stateCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || '')),
    );
  }

  async ngOnInit() {
    this.mediaList = await this.mediaService.loadJson();
    console.log(this.mediaList);
    fetch('assets/us.svg')
      .then((res) => res.text())
      .then((svg) => {
        this.usMapSvg = svg;
        this.onStateHover();
      });
    this.getNewState();
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
    PLAYABLE_STATES.splice(randomIndex, 1)[0];
    //fetch the media id for the current state
    this.getRandomMedia();
    console.log(this.currentState, PLAYABLE_STATES);
  }

  submitGuess() {
    const guess = this.stateCtrl.value;
    if (guess) {
      console.log('User guessed:', guess);
      // 🔥 Pass guess to your game engine
    }
  }

  private async getRandomMedia() {
    const stateMediaList = this.mediaList[this.currentState].media;
    const randomIndex = Math.floor(Math.random() * stateMediaList.length);
    const mediaId = stateMediaList[randomIndex].id;
    const isTv = stateMediaList[randomIndex].isTv;
    console.log(mediaId, isTv);
    const res = await this.mediaService.getMediaPiece(mediaId, isTv);
    this.currentMedia = res;
    console.log(this.currentMedia);
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
