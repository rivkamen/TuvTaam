import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  size: number;
  opacity: number;
  shape: 'circle' | 'square' | 'triangle';
  emoji?: string;
}

@Component({
  selector: 'app-aufruf-confetti',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aufruf-confetti.component.html',
  styleUrl: './aufruf-confetti.component.css',
})
export class AufrufConfettiComponent implements OnDestroy {
  confettiPieces: ConfettiPiece[] = [];
  isAnimating = false;
  private animationId: number | null = null;

  private colors = [
    '#ff6b6b',
    '#4ecdc4',
    '#45b7d1',
    '#96ceb4',
    '#feca57',
    '#ff9ff3',
    '#54a0ff',
    '#5f27cd',
    '#00d2d3',
  ];

  triggerConfetti() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.confettiPieces = [];

    this.createConfettiBurst('left');
    setTimeout(() => {
      this.createConfettiBurst('right');
    }, 100);
    this.animate();
  }

  private createConfettiBurst(side: 'left' | 'right') {
    const screenWidth = window.innerWidth;
    const startX = side === 'left' ? 0 : screenWidth;

    for (let i = 0; i < 50; i++) {
      const piece: ConfettiPiece = {
        id: Date.now() + Math.random(),
        x: startX,
        y: Math.random() * 100 + 100,
        vx:
          side === 'left' ? Math.random() * 20 + 8 : -(Math.random() * 20 + 5),
        vy: -(Math.random() * 50 - 5),
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        size: Math.random() * 15 + 8,
        opacity: 1,
        shape: this.getRandomShape(),
        emoji: Math.random() > 0.3 ? '🍬' : undefined,
      };

      this.confettiPieces.push(piece);
    }
  }

  private getRandomShape(): 'circle' | 'square' | 'triangle' {
    const shapes: ('circle' | 'square' | 'triangle')[] = [
      'circle',
      'square',
      'triangle',
    ];
    return shapes[Math.floor(Math.random() * shapes.length)];
  }

  private animate() {
    this.animationId = requestAnimationFrame(() => {
      this.confettiPieces.forEach((piece) => {
        // תנועה
        piece.x += piece.vx;
        piece.y += piece.vy;
        // כבידה
        piece.vy += 0.5;
        // התנגדות אוויר
        piece.vx *= 0.98;
        // סיבוב
        piece.rotation += piece.rotationSpeed;
        // דעיכה הדרגתית
        if (piece.y > window.innerHeight * 0.9) {
          piece.opacity -= 0.02;
        }
      });

      // הסרת חלקיקים שיצאו מהמסך או דעכו
      this.confettiPieces = this.confettiPieces.filter(
        (piece) =>
          piece.y < window.innerHeight + 100 &&
          piece.opacity > 0 &&
          piece.x > -100 &&
          piece.x < window.innerWidth + 100
      );

      if (this.confettiPieces.length > 0 && this.isAnimating) {
        this.animate();
      } else if (this.confettiPieces.length === 0) {
        this.stopAnimation();
      }
    });
  }

  private stopAnimation() {
    this.isAnimating = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.confettiPieces = [];
  }

  trackByPiece(index: number, piece: ConfettiPiece): number {
    return piece.id;
  }

  ngOnDestroy() {
    this.stopAnimation();
  }
}
