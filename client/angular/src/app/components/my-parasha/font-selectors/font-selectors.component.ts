import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';
import {
  defaultTextSettings,
  TextSettings,
} from '../../../models/parasha.models';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-font-selectors',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ButtonModule,
    SelectButtonModule,
    TooltipModule,
  ],
  templateUrl: './font-selectors.component.html',
  styleUrls: ['./font-selectors.component.css'],
})
export class FontSelectorsComponent implements OnInit {
  private initialSettings = defaultTextSettings;

  @Output() settingsChange = new EventEmitter<TextSettings>();

  currentSettings: TextSettings = { ...this.initialSettings };

  readonly minFontSize = 12;
  readonly maxFontSize = 32;

  readonly scriptOptions = [
    { label: 'א', value: 'Guttman Stam', font: 'Guttman Stam' },
    { label: 'א', value: 'regular' },
  ];

  readonly displayOptions = [
    { value: 'no-nikud', label: 'א' },
    { value: 'no-teamim', label: 'אָ' },
    { value: 'normal', label: 'אָ֭' },
  ];

  ngOnInit() {
    this.currentSettings = { ...this.initialSettings };
  }

  increaseFontSize = () => {
    if (this.currentSettings.fontSize < this.maxFontSize) {
      this.currentSettings.fontSize += 2;
      this.onSettingsChange();
    }
  };

  decreaseFontSize = () => {
    if (this.currentSettings.fontSize > this.minFontSize) {
      this.currentSettings.fontSize -= 2;
      this.onSettingsChange();
    }
  };

  resetSettings = () => {
    this.currentSettings = { ...this.initialSettings };
    this.onSettingsChange();
  };

  onSettingsChange = () => {
    this.settingsChange.emit({ ...this.currentSettings });
  };
}
