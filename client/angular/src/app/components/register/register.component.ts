import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { DatePickerModule } from 'primeng/datepicker';
import { CommonModule } from '@angular/common';
import { ParashaService } from '../../services/parasha.service';
import { VerseRef } from '../../models/parasha.models';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { AufrufConfettiComponent } from './aufruf-confetti/aufruf-confetti.component';

@Component({
  selector: 'register-auth',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    DatePickerModule,
    DropdownModule,
    MultiSelectModule,
    CommonModule,
    CheckboxModule,
    AufrufConfettiComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  #authService = inject(AuthService);
  #router = inject(Router);
  #activatedRoute = inject(ActivatedRoute);
  #parasha = inject(ParashaService);

  @ViewChild('aufruf') confetti!: AufrufConfettiComponent;

  currDate = new Date();
  currentStep = 1;

  usernameFormControl = new FormControl('', [Validators.required]);
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);
  passwordFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(4),
  ]);

  title: string = '';
  leyningMap?: (VerseRef | undefined)[];
  haftara?: VerseRef;
  leynings = [
    { label: 'ראשון', value: 0 },
    { label: 'שני', value: 1 },
    { label: 'שלישי', value: 2 },
    { label: 'רביעי', value: 3 },
    { label: 'חמישי', value: 4 },
    { label: 'שישי', value: 5 },
    { label: 'שביעי', value: 6 },
    { label: 'מפטיר', value: 7 },
  ];
  birthdateFormControl = new FormControl('', [Validators.required]);
  leyningFormControl = new FormControl([], [Validators.required]);
  withHafatara = new FormControl(false);

  ngOnInit() {
    this.#activatedRoute.queryParams.subscribe((params) => {
      const username = params['username'];
      const email = params['email'];
      if (username && email) {
        this.usernameFormControl.setValue(username);
        this.emailFormControl.setValue(email);
        this.emailFormControl.disable();
        this.passwordFormControl.clearValidators();
        this.passwordFormControl.updateValueAndValidity();
        this.passwordFormControl.disable();
      }
    });
  }

  nextStep() {
    if (this.isFirstStepValid()) {
      this.currentStep = 2;
    }
  }

  previousStep() {
    this.currentStep = 1;
  }

  isFirstStepValid(): boolean {
    // אם השדות מושבתים (disable), נניח שהם תקינים
    const usernameValid =
      this.usernameFormControl.disabled || this.usernameFormControl.valid;
    const emailValid =
      this.emailFormControl.disabled || this.emailFormControl.valid;
    const passwordValid =
      this.passwordFormControl.disabled || this.passwordFormControl.valid;
    return usernameValid && emailValid && passwordValid;
  }

  isSecondStepValid(): boolean {
    return this.birthdateFormControl.valid && this.leyningFormControl.valid;
  }

  formatVerse = (verseRef: VerseRef) =>
    `${verseRef.bookName} ${verseRef.startChapter} ${verseRef.startVerse} - ${verseRef.endChapter} ${verseRef.endVerse}`;

  async onSelectDate(localDate: Date) {
    this.leyningMap = undefined;
    this.title = '';
    const utcDate = new Date(
      Date.UTC(
        localDate.getFullYear(),
        localDate.getMonth(),
        localDate.getDate()
      )
    );
    const formattedDate = utcDate.toISOString().slice(0, 10);
    this.#parasha.fetchParasha(formattedDate).then((parasha) => {
      this.leyningMap = parasha.leining;
      this.haftara = parasha.haftara;
      this.title = parasha.title;
    });
  }

  register(): void {
    if (!this.isFirstStepValid() || !this.isSecondStepValid()) {
      alert('יש למלא את כל השדות כראוי');
      return;
    }
    const finalParasha = this.getFinalParasha();
    if (!finalParasha) {
      alert('נא לבחור קריאות ברצף.');
    }

    const email = this.emailFormControl.value!;
    const password = this.passwordFormControl.value ?? '';
    const username = this.usernameFormControl.value!;
    const dueDate = this.birthdateFormControl.value!;
    const haftara = this.withHafatara?.value ? this.haftara : undefined;
    this.#authService
      .register(username, email, password, dueDate, finalParasha!, haftara)
      .subscribe({
        next: (res: any) => {
          if (res?.token) {
            this.confetti.triggerConfetti();
            sessionStorage.setItem('token', res.token);
            sessionStorage.setItem('role', res.role);
            setTimeout(() => {
              alert('הרשמה הצליחה');
              this.#router.navigateByUrl('/home');
            }, 3000);
          } else {
            alert('שגיאה בהרשמה');
          }
        },
        error: (err) => {
          console.error('שגיאה בהרשמה', err);
          alert(`שגיאה בהרשמה: ${err?.message || 'לא ידוע'}`);
        },
      });
  }

  loginWithGoogle(): void {
    this.#authService.loginWithGoogle();
  }

  private getFinalParasha(): VerseRef | null {
    if (!this.leyningFormControl.value || !this.leyningMap) return null;
    const values = this.leyningFormControl.value
      .map((item) => item['value'])
      .sort((a, b) => a - b);

    const isConsecutive = values.every(
      (val, idx, arr) => idx === 0 || val === arr[idx - 1] + 1
    );

    if (!isConsecutive) return null;

    const minIndex = values[0];
    const maxIndex = values[values.length - 1];
    const start = this.leyningMap[minIndex];
    const end = this.leyningMap[maxIndex];

    if (!start || !end) return null;

    return {
      bookName: start.bookName,
      startChapter: start.startChapter,
      startVerse: start.startVerse,
      endChapter: end.endChapter,
      endVerse: end.endVerse,
    };
  }
}
