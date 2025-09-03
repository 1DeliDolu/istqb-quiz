export interface Chapter {
  title: string;
  description: string;
  subChapters: string[];
}

export interface ChapterData {
  [key: string]: Chapter;
}
