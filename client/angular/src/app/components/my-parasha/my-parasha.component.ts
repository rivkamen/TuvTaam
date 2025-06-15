import { Component, inject } from '@angular/core';
import { ParashaService } from '../../services/parasha.service';
import { Parasha } from '../../models/parasha.models';
import { ParashaViewComponent } from "./parasha-view/parasha-view.component";

@Component({
  selector: 'app-my-parasha',
  standalone: true,
  imports: [ParashaViewComponent],
  templateUrl: './my-parasha.component.html',
  styleUrl: './my-parasha.component.css',
})
export class MyParashaComponent {
  parashaService = inject(ParashaService);
  parasha: Parasha | undefined;

  constructor() {
    const parasha = {
      bookName: 'בראשית',
      startChapter: 'י',
      startVerse: 'י',
      endChapter: 'יג',
      endVerse: 'ה',
    }; // user.parasha
    this.parashaService.getParashaText(parasha).then((obj: Parasha) => {
      this.parasha = obj;
      console.log(this.parasha);
    });
  }

  get verses() {
    return Object.values(this.parasha?.chapters || {}).flatMap((ch) =>
      Object.entries(ch).flatMap((verse: any) =>
        verse[1]['parasha']
          ? [verse[1]['text'], verse[1]['parasha']]
          : [verse[1]['text']]
      )
    );
  }
}
