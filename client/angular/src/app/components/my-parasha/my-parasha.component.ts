import { Component, inject } from '@angular/core';
import { ParashaService } from '../../services/parasha.service';
import { defaultTextSettings, Parasha, TextSettings } from '../../models/parasha.models';
import { ParashaViewComponent } from './parasha-view/parasha-view.component';
import { AuthService } from '../../services/auth.service';
import { FontSelectorsComponent } from './font-selectors/font-selectors.component';

@Component({
  selector: 'app-my-parasha',
  standalone: true,
  imports: [ParashaViewComponent, FontSelectorsComponent],
  templateUrl: './my-parasha.component.html',
  styleUrl: './my-parasha.component.css',
})
export class MyParashaComponent {
  private _parashaService = inject(ParashaService);
  private parasha: Parasha | undefined;
  haftara?: Parasha | undefined;

  textSettings = defaultTextSettings;

  constructor(_authService: AuthService) {
    _authService.user.subscribe((user) => {
      if (user) {
        this._parashaService
          .getParashaText(user.parashah)
          .then((obj: Parasha) => {
            this.parasha = obj;
          });
        user.haftarah &&
          this._parashaService
            .getParashaText(user.haftarah)
            .then((obj: Parasha) => {
              this.haftara = obj;
            });
      }
    });
  }

  get parashaVerses(){
    return this.parasha ? this.getVerses(this.parasha) : []
  }
  
  get haftaraVerses(){
    return this.haftara ? this.getVerses(this.haftara) : []
  }
  private getVerses = (parasha:Parasha) => {
    return Object.values(parasha.chapters || {}).flatMap((ch) =>
      Object.entries(ch).flatMap((verse: any) =>
        verse[1]['parasha']
          ? [verse[1]['text'], verse[1]['parasha']]
          : [verse[1]['text']]
      )
    );
  }

  public onSettingsChange(newSettings: TextSettings): void {
    this.textSettings = newSettings;
  }

}
