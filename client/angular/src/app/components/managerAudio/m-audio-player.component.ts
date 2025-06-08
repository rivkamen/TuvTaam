import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

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
    a.href = this.src;
    a.download = 'recording.mp3';
    a.click();
  }
}
