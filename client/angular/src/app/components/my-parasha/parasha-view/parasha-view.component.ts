import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-parasha-view',
  standalone: true,
  imports: [],
  templateUrl: './parasha-view.component.html',
  styleUrl: './parasha-view.component.css'
})
export class ParashaViewComponent {

  @Input() verses: string[] = [];
}
