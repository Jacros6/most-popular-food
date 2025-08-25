import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SafeHtmlPipe } from '../../pipe/safe-html.pipe';
@Component({
    standalone: true,
    imports: [SafeHtmlPipe],
    selector: 'app-home',
    templateUrl: 'home.component.html',
    styleUrl: 'home.component.scss'
})

export class HomeComponent implements OnInit {
  usMapSvg: string = '';

  ngOnInit() {
    fetch('assets/us.svg')
      .then(res => res.text())
      .then(svg => {
        this.usMapSvg = svg; 

        setTimeout(() => {
        const paths = document.querySelectorAll('.states svg path');
        paths.forEach(path => {
          path.addEventListener('mouseenter', () => path.setAttribute("fill", '#aaddff'));
          path.addEventListener('mouseleave', () => path.setAttribute("fill", '#f9f9f9'));
        });
        }, 0);
      });
  }

  onClick(event: Event) {
    const target = event.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'path') {
      console.log('Clicked state:', target);
      target.setAttribute('fill', '#ffcc00');

    }
  }
}