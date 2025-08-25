import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SafeHtmlPipe } from '../../pipe/safe-html.pipe';
import { stateBorders } from '../../../assets/state-borders';
@Component({
    standalone: true,
    imports: [SafeHtmlPipe],
    selector: 'app-home',
    templateUrl: 'home.component.html',
    styleUrl: 'home.component.scss',
    encapsulation: ViewEncapsulation.None
})

export class HomeComponent implements OnInit {
  usMapSvg: string = '';
  STATE_BORDERS = stateBorders
  currentState = 'CA'
  currentlyAway = 0;

  ngOnInit() {
    fetch('assets/us.svg')
      .then(res => res.text())
      .then(svg => {
        this.usMapSvg = svg; 

    })
  }

  onClick(event: Event) {
    const target = event.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'path') {
      console.log('Clicked state:', target);
      if(target.dataset['id'] === this.currentState){
        target.setAttribute('fill', '#4dff00ff')
        //get a new fresh state
      }
      else{
        //do a bfs search to find the how close the state is to the actual state
            this.currentlyAway = this.bfs(target.dataset['id']);
        
            target.setAttribute('fill', '#ffcc00');
        
      }
      

    }
  }

  bfs(clickedState: string | undefined): number{
    if(!clickedState){
        return 0;
    }
    const q = [{state: clickedState as string, distance: 0}];
    const visited = new Set();
    visited.add(clickedState);

    while(q.length > 0){
        const front = q.shift();

        if(!front) continue;

        if(front.state === this.currentState){
            return front.distance;
        }

        const neighbors = stateBorders[front.state];

        for(const neighbor of neighbors){
            if(!visited.has(neighbor)){
                visited.add(neighbor);
                q.push({state: neighbor, distance: front.distance + 1});
            }
        }
    }
    
    return 0;
  }
}