import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hebrewSanitizer',
  standalone: true,
})
export class HebrewSanitizerPipe implements PipeTransform {
  transform(value: string, type: string): string {
    switch (type) {
      case 'no-teamim':
        return value.replace(/[\u0591-\u05AF]/g, '');
      case 'no-nikud':
        return value
          .replaceAll('־', ' ')
          .replace(/[\u0591-\u05C7]/g, '')
          .replace(/[\u05B0-\u05BD]/g, '')
          .replace(/\s*\[.*?\]/g, '');
      default:
        return value;
    }
  }
}
