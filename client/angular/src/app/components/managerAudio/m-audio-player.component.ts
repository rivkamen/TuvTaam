import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import Plyr from 'plyr';

@Component({
  selector: 'app-m-audio-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './m-audio-player.component.html',
  styleUrls: ['./m-audio-player.component.css']
})
export class MAudioPlayerComponent {
  @Input() src!: string;
  @Output() delete = new EventEmitter<void>();
  @Output() send = new EventEmitter<void>();

  @ViewChild('audio', { static: true }) audioRef!: ElementRef<HTMLAudioElement>;
  safeAudioUrl!: SafeResourceUrl;
  player: any;

constructor(private sanitizer: DomSanitizer) {}

ngAfterViewInit() {
    this.player = new Plyr('#player', {
      controls: ['play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'download']
    });
  }
ngOnChanges() {
    if (this.src) {
      this.safeAudioUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.src);
    }
  }
  isPlaying = false;
  currentTime = 0;
  duration = 0;

  togglePlay() {
    const audio = this.audioRef.nativeElement;
    if (audio.paused) {
      audio.play();
      this.isPlaying = true;
    } else {
      audio.pause();
      this.isPlaying = false;
    }
  }

  onTimeUpdate() {
    const audio = this.audioRef.nativeElement;
    this.currentTime = audio.currentTime;
    this.duration = audio.duration;
  }

  onSeek(event: Event) {
    const audio = this.audioRef.nativeElement;
    const value = (event.target as HTMLInputElement).value;
    audio.currentTime = parseFloat(value);
  }

  formatTime(time: number): string {
    if (isNaN(time)) return '00:00';
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }


download() {
  const a = document.createElement('a');
  a.href = this.src; // כתובת הקובץ (למשל URL מ־GCS)
  a.download = 'recording.webm'; // שם הקובץ שיורד
  a.target = '_blank'; // לא חובה, אבל עוזר לפעמים
  a.rel = 'noopener noreferrer';

  // חובה להוסיף לדום כדי שהקליק יעבוד באייפונים וכד'
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}


getSafeUrl(url: string): SafeResourceUrl {
  return this.sanitizer.bypassSecurityTrustResourceUrl(url);
}

  ngOnInit() {
  console.log('Audio Player loaded for src:', this.src);
    
    this.safeAudioUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.src);
  }

  handleError() {
    console.error('שגיאה בהטענת האודיו:', this.src);
  }
  
}
