import { Component, Input } from '@angular/core';
import { FontSelectorsComponent } from '../font-selectors/font-selectors.component';
import { TextSettings } from '../../../models/parasha.models';
import { CommonModule } from '@angular/common';
import { HebrewSanitizerPipe } from '../../../core/pipes/hebrew-sanitizer.pipe';

@Component({
  selector: 'app-parasha-view',
  standalone: true,
  imports: [FontSelectorsComponent, CommonModule, HebrewSanitizerPipe],
  templateUrl: './parasha-view.component.html',
  styleUrl: './parasha-view.component.css',
})
export class ParashaViewComponent {
  @Input() verses: string[] = [];
  textSettings: TextSettings = {
    script: 'regular',
    display: 'regular',
    fontSize: 18,
  };

  onSettingsChange(newSettings: TextSettings): void {
    this.textSettings = newSettings;
  }
}
