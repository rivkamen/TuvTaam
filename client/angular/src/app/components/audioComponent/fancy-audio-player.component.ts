import { Component, Input, ViewChild, ElementRef, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-fancy-audio-player',
  standalone: true,
  imports: [CommonModule, ButtonModule, ProgressBarModule],
  templateUrl: './fancy-audio-player.component.html',
  styleUrls: ['./fancy-audio-player.component.css']
})
export class FancyAudioPlayerComponent {
  // @Input() src!: string;
  @ViewChild('audioRef') audioRef!: ElementRef<HTMLAudioElement>;
@Input() src!: SafeResourceUrl;
@Input() downloadUrl!: string;

  isPlaying = signal(false);
  currentTime = signal(0);
  duration = signal(0);
isAudioError = false;
durationLoaded = false;

onAudioError() {
  this.isAudioError = true;
}

  ngAfterViewInit() {
  const audio = this.audioRef.nativeElement;

  audio.addEventListener('loadedmetadata', () => this.updateDuration('loadedmetadata'));
  audio.addEventListener('canplaythrough', () => this.updateDuration('canplaythrough'));
  audio.addEventListener('durationchange', () => this.updateDuration('durationchange'));
  audio.addEventListener('timeupdate', () => {
  const t = audio.currentTime;
  this.currentTime.set(t); // אם את משתמשת ב-Signal
});

}

updateDuration(eventName: string) {
  const audio = this.audioRef.nativeElement;
  const d = audio.duration;
  
  if (!isNaN(d) && isFinite(d) && d > 0) {
    this.duration.set(d);
    this.durationLoaded = true;
  }
}


onLoadedMetadata() {
  const audio = this.audioRef.nativeElement;



  const d = audio.duration;

  // עוד בדיקות למעקב


  if (isNaN(d)) {
    console.warn('[onLoadedMetadata] duration הוא NaN');
  } else if (!isFinite(d)) {
    console.warn('[onLoadedMetadata] duration הוא Infinity');
  } else {
    console.log('[onLoadedMetadata] duration תקין:', d);
    this.duration.set(d);
    this.durationLoaded = true;
  }
}

  formatTime(seconds: number): string {
    if (!isFinite(seconds)) return '--:--';

    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

togglePlayback() {
  const audio = this.audioRef.nativeElement;

  if (!this.isPlaying()) {
    audio.play().then(() => {
      this.isPlaying.set(true);
    }).catch(err => {
      console.warn('Playback failed', err);
      this.isPlaying.set(false);
    });
  } else {
    audio.pause();
    this.isPlaying.set(false);
  }
}

download() {
  fetch(this.downloadUrl)
    .then(res => res.blob())
    .then(blob => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = this.extractFilenameFromURL(this.downloadUrl);
      link.click();
      URL.revokeObjectURL(link.href);
    })
    .catch(err => console.error('Download failed', err));
}

private extractFilenameFromURL(url: string): string {
  try {
    const u = new URL(url);
    const pathname = u.pathname;
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
    return decodeURIComponent(filename.split('?')[0]) || 'audio.mp3';
  } catch {
    return 'audio.mp3';
  }
}

  onProgressBarClick(event: MouseEvent) {
    const audio = this.audioRef.nativeElement;
    const progressBar = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const clickX = event.clientX - progressBar.left;
    const percent = clickX / progressBar.width;
    audio.currentTime = percent * audio.duration;
    this.currentTime.set(audio.currentTime);
  }
}
