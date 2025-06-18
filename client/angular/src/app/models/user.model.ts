import { VerseRef } from './parasha.models';

export interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  adminId: string;
  dueDate: Date;
  parashah: VerseRef;
  haftarah?: VerseRef;
  recordBookmark: number;
}
