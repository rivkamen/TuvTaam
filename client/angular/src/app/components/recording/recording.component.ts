
import { Component, Output, EventEmitter, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-recording',
  standalone: true,
  imports: [CommonModule, ButtonModule,DialogModule],
  templateUrl: './recording.component.html',
  styleUrl: './recording.component.css'
})
export class RecordingComponent {
  @Output() audioRecorded = new EventEmitter<Blob>();
  @Output() closed = new EventEmitter<void>();
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  isRecording = signal(false);
  isRecorded = signal(false);
  showControls = signal(false);
  recordingTime = signal(0);
elapsedTime: number = 0;

  private mediaRecorder!: MediaRecorder;
  private audioChunks: Blob[] = [];
  private intervalId!: any;
  private audioContext!: AudioContext;
  private analyser!: AnalyserNode;
  private source!: MediaStreamAudioSourceNode;
  private animationFrameId!: number;
  private stream!: MediaStream;
  isDialogOpen: boolean = false;

  audioUrl: string | null = null;

  async startRecording() {
    console.log("audio");
    this.stopOtherAudio();
    this.resetRecording();
    this.isRecording.set(true);
    this.showControls.set(false);
    this.recordingTime.set(0);





    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(this.stream);
    this.audioChunks = [];

    this.audioContext = new AudioContext();
    this.source = this.audioContext.createMediaStreamSource(this.stream);
    this.analyser = this.audioContext.createAnalyser();
    this.source.connect(this.analyser);
    this.drawWaveform();
    this.mediaRecorder.ondataavailable = e => this.audioChunks.push(e.data);




// ✅ הגדרת onstop – כאן עצירת המיקרופון בפועל
this.mediaRecorder.onstop = () => {
      this.saveRecording();
  const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
  this.audioUrl = URL.createObjectURL(audioBlob);
  this.isRecorded.set(true);
  this.showControls.set(true);

  this.isRecording.set(false);
  clearInterval(this.intervalId);

  // ✅ עצירת המיקרופון בפועל
  this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
};

this.mediaRecorder.start();
this.intervalId = setInterval(() => this.recordingTime.set(this.recordingTime() + 1), 1000);
  }

  stopRecording() {
         if (this.audioUrl) {
            fetch(this.audioUrl)
        .then(res => res.blob())}
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.isRecording.set(false);
      this.mediaRecorder.stop();
      this.stream.getTracks().forEach(track => track.stop());
      clearInterval(this.intervalId);
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  saveRecording = () => {
    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
    this.audioUrl = URL.createObjectURL(audioBlob);
    this.isRecorded.set(true);
    this.showControls.set(true);
  };

  playAudio() {
    this.audioPlayer.nativeElement.play();
  }

  deleteRecording() {
    this.audioUrl = null;
    this.isRecorded.set(false);
    this.showControls.set(false);
    this.recordingTime.set(0);
    this.closed.emit(); // סוגר את הדיאלוג

  }

  // sendRecording() {
  //   console.log("Sending recording...");
    
  //     if (this.audioUrl) {
  //           fetch(this.audioUrl)
  //       .then(res => res.blob())
  //       .then(blob => this.audioRecorded.emit(blob));      
  //     this.deleteRecording();
  //   }
  // }
sendRecording() {

  if (!this.audioUrl) {
    return;
  }

  fetch(this.audioUrl)
    .then(res => {
      if (!res.ok) {
        throw new Error(`Fetch failed with status ${res.status}`);
      }
      return res.blob();
    })
    .then(blob => {
      this.audioRecorded.emit(blob);
      this.deleteRecording();
    })
    .catch(err => {
      console.error("Error while sending recording:", err);
    });
}

  private resetRecording() {
    this.audioChunks = [];
    this.audioUrl = null;
    if (this.audioContext) {
      this.audioContext.close();
    }
  }

  private drawWaveform = () => {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      this.animationFrameId = requestAnimationFrame(draw);
      this.analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = '#f4f4f4';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#007ad9';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  };
  get formattedTime(): string {
  const minutes = Math.floor(this.elapsedTime / 60);
  const seconds = this.elapsedTime % 60;
  return `${this.pad(minutes)}:${this.pad(seconds)}`;
}

pad(value: number): string {
  return value < 10 ? '0' + value : value.toString();
}
// closeRecording() {
//   this.isDialogOpen = false;
//   this.resetRecording(); // אם יש פונקציה כזו
// }
closeRecording() {
  this.resetRecording();
  this.closed.emit();
}

stopOtherAudio() {
  const audios = document.querySelectorAll('audio');
  audios.forEach((a: any) => {
    try {
      a.pause();
      a.currentTime = 0;
    } catch (e) {}
  });
}


}
