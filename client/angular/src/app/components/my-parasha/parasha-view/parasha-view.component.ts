import { Component, Input } from '@angular/core';
import { FontSelectorsComponent } from '../font-selectors/font-selectors.component';
import {
  defaultTextSettings,
  TextSettings,
} from '../../../models/parasha.models';
import { CommonModule } from '@angular/common';
import { HebrewSanitizerPipe } from '../../../core/pipes/hebrew-sanitizer.pipe';

@Component({
  selector: 'app-parasha-view',
  standalone: true,
  imports: [CommonModule, HebrewSanitizerPipe],
  templateUrl: './parasha-view.component.html',
  styleUrl: './parasha-view.component.css',
})
export class ParashaViewComponent {
  @Input() verses: string[] = [];
  @Input() textSettings:TextSettings = defaultTextSettings
}
