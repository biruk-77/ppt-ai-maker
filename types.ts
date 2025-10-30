export interface SlideStructure {
  title: string;
  content: string[];
  imagePrompt: string;
  sources?: { uri: string; title: string; }[];
}

export interface Slide {
  title: string;
  content: string[];
  imageUrl: string;
  sources?: { uri: string; title: string; }[];
}
