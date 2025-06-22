export interface VerseRef {
  bookName: string;
  startChapter: string;
  startVerse: string;
  endChapter: string;
  endVerse: string;
}

export interface TanakhBook {
  book: string;
  chapters: Record<string, Record<string, { text: string; parasha?: string }>>;
}

export interface Parasha {
  book: string;
  range: string;
  chapters: Record<string, Record<string, { text: string; parasha?: string }>>;
}

export interface TextSettings {
  script: string;
  display: 'no-nikud' | 'no-teamim' | 'regular';
  fontSize: number;
}

export const defaultTextSettings: TextSettings = {
  script: 'Guttman Stam',
  display: 'no-nikud',
  fontSize: 16,
};
