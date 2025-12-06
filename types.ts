export enum Language {
  ENGLISH = 'en',
  CHINESE = 'zh'
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export enum AppMode {
  HOME = 'home',
  BASIC_PRACTICE = 'basic_practice',
  GAME_MENU = 'game_menu',
  GAME_KANGAROO = 'game_kangaroo',
  GAME_BALLOON = 'game_balloon',
  GAME_SPACE = 'game_space',
  GAME_RACER = 'game_racer',
  GAME_MEMORY = 'game_memory'
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  score: number;
}

export interface GameConfig {
  name: string;
  description: string;
  id: AppMode;
  icon: string;
  color: string;
}

export interface WordItem {
  text: string;
  pinyin?: string; // For Chinese help
  translation?: string;
}