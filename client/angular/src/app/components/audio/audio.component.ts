// import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
// import Plyr from 'plyr';

// @Component({
//   selector: 'app-player',
//   templateUrl: './audio.component.html',
//   styleUrls: ['./audio.component.css'],
//   standalone: true,
// })
// export class AAudioPlayerComponent implements AfterViewInit {
//   @Input() src!: string;
//   @ViewChild('player') playerRef!: ElementRef<HTMLAudioElement>;
// ngAfterViewInit(): void {
//   const audio = this.playerRef.nativeElement;

//   if (this.src) {
//     audio.src = this.src;

//     audio.addEventListener('loadedmetadata', () => {
//       new Plyr(audio, {
//         controls: ['play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'download'],
//       });
//     });
//   }
// }

// }
import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import Plyr from 'plyr';

@Component({
  selector: 'app-player',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.css'],
  standalone: true,
})
export class AAudioPlayerComponent implements AfterViewInit, OnChanges {
  @Input() src!: string;
  sanitizedSrc!: SafeResourceUrl;

  @ViewChild('player') playerRef!: ElementRef<HTMLAudioElement>;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(): void {
    if (this.src) {
      this.sanitizedSrc = this.sanitizer.bypassSecurityTrustResourceUrl(this.src);
    }
  }

  ngAfterViewInit(): void {
    new Plyr(this.playerRef.nativeElement, {
      controls: ['play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'download'],
    });
  }
}
