import { Injectable } from '@angular/core';
import { Parasha, TanakhBook, VerseRef } from '../models/parasha.models';

const BOOKS_MAP: Record<string, string> = {
  Genesis: 'בראשית',
  Exodus: 'שמות',
  Leviticus: 'ויקרא',
  Numbers: 'במדבר',
  Deuteronomy: 'דברים',
  Joshua: 'יהושע',
  Judges: 'שופטים',
  Samuel: 'שמואל',
  'I Samuel': 'שמואל א',
  'II Samuel': 'שמואל ב',
  Kings: 'מלכים',
  'I Kings': 'מלכים א',
  'II Kings': 'מלכים ב',
  Isaiah: 'ישעיהו',
  Jeremiah: 'ירמיהו',
  Ezekiel: 'יחזקאל',
  Hosea: 'הושע',
  Joel: 'יואל',
  Amos: 'עמוס',
  Obadiah: 'עובדיה',
  Jonah: 'יונה',
  Micah: 'מיכה',
  Nahum: 'נחום',
  Habakkuk: 'חבקוק',
  Zephaniah: 'צפניה',
  Haggai: 'חגי',
  Zechariah: 'זכריה',
  Malachi: 'מלאכי',
};

const GEMATRIA_MAP: Record<number, string> = {
  1: 'א',
  2: 'ב',
  3: 'ג',
  4: 'ד',
  5: 'ה',
  6: 'ו',
  7: 'ז',
  8: 'ח',
  9: 'ט',
  10: 'י',
  11: 'יא',
  12: 'יב',
  13: 'יג',
  14: 'יד',
  15: 'טו',
  16: 'טז',
  17: 'יז',
  18: 'יח',
  19: 'יט',
  20: 'כ',
  21: 'כא',
  22: 'כב',
  23: 'כג',
  24: 'כד',
  25: 'כה',
  26: 'כו',
  27: 'כז',
  28: 'כח',
  29: 'כט',
  30: 'ל',
  31: 'לא',
  32: 'לב',
  33: 'לג',
  34: 'לד',
  35: 'לה',
  36: 'לו',
  37: 'לז',
  38: 'לח',
  39: 'לט',
  40: 'מ',
  41: 'מא',
  42: 'מב',
  43: 'מג',
  44: 'מד',
  45: 'מה',
  46: 'מו',
  47: 'מז',
  48: 'מח',
  49: 'מט',
  50: 'נ',
  51: 'נא',
  52: 'נב',
  53: 'נג',
  54: 'נד',
  55: 'נה',
  56: 'נו',
  57: 'נז',
  58: 'נח',
  59: 'נט',
  60: 'ס',
  61: 'סא',
  62: 'סב',
  63: 'סג',
  64: 'סד',
  65: 'סה',
  66: 'סו',
  67: 'סז',
  68: 'סח',
  69: 'סט',
  70: 'ע',
  71: 'עא',
  72: 'עב',
  73: 'עג',
  74: 'עד',
  75: 'עה',
  76: 'עו',
  77: 'עז',
  78: 'עח',
  79: 'עט',
  80: 'פ',
  81: 'פא',
  82: 'פב',
  83: 'פג',
  84: 'פד',
  85: 'פה',
  86: 'פו',
  87: 'פז',
  88: 'פח',
  89: 'פט',
  90: 'צ',
  91: 'צא',
  92: 'צב',
  93: 'צג',
  94: 'צד',
  95: 'צה',
  96: 'צו',
  97: 'צז',
  98: 'צח',
  99: 'צט',
  100: 'ק',
};

@Injectable({
  providedIn: 'root',
})
export class ParashaService {
  constructor() {}

  private numberToGematria = (num: number): string =>
    GEMATRIA_MAP[num] || num.toString();

  private parseVerseToHebrew = (verseString: string): VerseRef|undefined => {
    const regex = /^(.*?)\s+(\d+):(\d+)-(?:(\d+):)?(\d+)$/;
    const match = verseString.trim().match(regex);
    if (!match) {
      return
    }

    const [_, bookName, startChapterStr, startVerseStr, endChapterStr, endVerseStr] =
      match;
    const startChapter = Number(startChapterStr);
    const startVerse = Number(startVerseStr);
    const endVerse = Number(endVerseStr);
    const endChapter = endChapterStr ? Number(endChapterStr) : startChapter;

    return {
      bookName: BOOKS_MAP[bookName],
      startChapter: this.numberToGematria(startChapter),
      startVerse: this.numberToGematria(startVerse),
      endChapter: this.numberToGematria(endChapter),
      endVerse: this.numberToGematria(endVerse),
    };
  };

  private getTanakhRange = (
    tanakhData: TanakhBook[],
    { bookName, startChapter, startVerse, endChapter, endVerse }: VerseRef
  ): Parasha => {
    const book = tanakhData.find((b) => b.book === bookName);
    if (!book) {
      throw new Error(`ספר "${bookName}" לא נמצא`);
    }
    const chapters = Object.keys(book.chapters);
    const startChapterIndex = chapters.indexOf(startChapter);
    const endChapterIndex = chapters.indexOf(endChapter);
    if (startChapterIndex === -1) {
      throw new Error(`פרק "${startChapter}" לא נמצא בספר "${bookName}"`);
    }
    if (endChapterIndex === -1) {
      throw new Error(`פרק "${endChapter}" לא נמצא בספר "${bookName}"`);
    }
    if (startChapterIndex > endChapterIndex) {
      throw new Error('פרק התחלה לא יכול להיות אחרי פרק הסיום');
    }

    const result = {
      book: bookName,
      range: `${startChapter}:${startVerse} - ${endChapter}:${endVerse}`,
      chapters: {},
    } as Parasha;

    for (let i = startChapterIndex; i <= endChapterIndex; i++) {
      const chapterKey = chapters[i];
      const chapter = book.chapters[chapterKey];
      if (!chapter) continue;
      const verses = Object.keys(chapter);
      result.chapters[chapterKey] = {};
      if (startChapterIndex === endChapterIndex) {
        const startVerseIndex = verses.indexOf(startVerse);
        const endVerseIndex = verses.indexOf(endVerse);
        if (startVerseIndex === -1) {
          throw new Error(`פסוק "${startVerse}" לא נמצא בפרק "${chapterKey}"`);
        }
        if (endVerseIndex === -1) {
          throw new Error(`פסוק "${endVerse}" לא נמצא בפרק "${chapterKey}"`);
        }
        if (startVerseIndex > endVerseIndex) {
          throw new Error('פסוק התחלה לא יכול להיות אחרי פסוק הסיום');
        }
        for (let j = startVerseIndex; j <= endVerseIndex; j++) {
          const verseKey = verses[j];
          result.chapters[chapterKey][verseKey] = chapter[verseKey];
        }
      } else if (i === startChapterIndex) {
        const startVerseIndex = verses.indexOf(startVerse);
        if (startVerseIndex === -1) {
          throw new Error(`פסוק "${startVerse}" לא נמצא בפרק "${chapterKey}"`);
        }
        for (let j = startVerseIndex; j < verses.length; j++) {
          const verseKey = verses[j];
          result.chapters[chapterKey][verseKey] = chapter[verseKey];
        }
      } else if (i === endChapterIndex) {
        const endVerseIndex = verses.indexOf(endVerse);
        if (endVerseIndex === -1) {
          throw new Error(`פסוק "${endVerse}" לא נמצא בפרק "${chapterKey}"`);
        }
        for (let j = 0; j <= endVerseIndex; j++) {
          const verseKey = verses[j];
          result.chapters[chapterKey][verseKey] = chapter[verseKey];
        }
      } else {
        result.chapters[chapterKey] = { ...chapter };
      }
    }

    return result;
  };

  public fetchParasha = async (date: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD.');
    }
    const res = await fetch(
      `https://www.hebcal.com/hebcal?v=1&cfg=json&s=on&start=${date}&end=${date}`
    );
    if (!res.ok) {
      throw new Error('Failed to fetch parasha');
    }
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      throw new Error('No parasha found for the given date');
    }
    return {
      title: data.items[0].hebrew,
      parasha: this.parseVerseToHebrew(data.items[0].leyning.torah),
      haftara: this.parseVerseToHebrew(data.items[0].leyning.haftarah),
      leining: [
        this.parseVerseToHebrew(data.items[0].leyning['1']),
        this.parseVerseToHebrew(data.items[0].leyning['2']),
        this.parseVerseToHebrew(data.items[0].leyning['3']),
        this.parseVerseToHebrew(data.items[0].leyning['4']),
        this.parseVerseToHebrew(data.items[0].leyning['5']),
        this.parseVerseToHebrew(data.items[0].leyning['6']),
        this.parseVerseToHebrew(data.items[0].leyning['7']),
        this.parseVerseToHebrew(data.items[0].leyning.maftir),
      ],
    };
  };

  public getParashaText = async (ref: VerseRef) => {
    const { bookName, startChapter, startVerse, endChapter, endVerse } = ref;
    const allTanakh = await fetch('/assets/tanakh.json');
    if (!allTanakh.ok) {
      throw new Error('Failed to fetch Tanakh data');
    }
    const tanakhData = (await allTanakh.json()) as TanakhBook[];
    return this.getTanakhRange(tanakhData, {
      bookName,
      startChapter,
      startVerse,
      endChapter,
      endVerse,
    });
  };
}
