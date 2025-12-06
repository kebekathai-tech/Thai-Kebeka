import { AppMode, GameConfig, Language } from './types';

export const STRINGS = {
  [Language.ENGLISH]: {
    appTitle: "Typing Genius",
    tagline: "Master the keyboard with fun and style.",
    startPractice: "Basic Practice",
    miniGames: "Mini Games",
    back: "Back",
    score: "Score",
    wpm: "WPM",
    accuracy: "Accuracy",
    gameOver: "Game Over",
    playAgain: "Play Again",
    loading: "Generating content...",
    selectGame: "Select a Game",
    typeHere: "Type here...",
    start: "Start",
    letterPractice: "Letter Practice",
    sentencePractice: "Sentence Practice",
    articlePractice: "Short Article Practice",
    chooseLetter: "Choose a letter to start",
    next: "Next",
    retry: "Retry",
    pressEnter: "Press Enter to continue",
    lowAccuracy: "Accuracy too low (<80%). Please try again.",
    linesCompleted: "Lines Completed",
    excellent: "Excellent!",
    practiceMenu: "Select Practice Mode",
    difficulty: "Difficulty",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    selectDifficulty: "Select Difficulty"
  },
  [Language.CHINESE]: {
    appTitle: "打字天才",
    tagline: "寓教于乐，掌握键盘。",
    startPractice: "基础练习",
    miniGames: "迷你游戏",
    back: "返回",
    score: "得分",
    wpm: "速度 (WPM)",
    accuracy: "准确率",
    gameOver: "游戏结束",
    playAgain: "再玩一次",
    loading: "正在生成内容...",
    selectGame: "选择游戏",
    typeHere: "在此输入...",
    start: "开始",
    letterPractice: "字母练习",
    sentencePractice: "句子练习",
    articlePractice: "短文练习",
    chooseLetter: "选择一个字母开始",
    next: "下一个",
    retry: "重试",
    pressEnter: "按回车键继续",
    lowAccuracy: "准确率太低 (<80%)，请重试。",
    linesCompleted: "完成行数",
    excellent: "太棒了！",
    practiceMenu: "选择练习模式",
    difficulty: "难度",
    easy: "简单",
    medium: "中等",
    hard: "困难",
    selectDifficulty: "选择难度"
  }
};

export const GAMES: GameConfig[] = [
  {
    name: "Kangaroo Jump",
    description: "Type words to help the kangaroo jump over obstacles!",
    id: AppMode.GAME_KANGAROO,
    icon: "🦘",
    color: "bg-orange-100 text-orange-600"
  },
  {
    name: "Balloon Pop",
    description: "Pop the balloons before they fly away by typing their letters.",
    id: AppMode.GAME_BALLOON,
    icon: "🎈",
    color: "bg-red-100 text-red-600"
  },
  {
    name: "Space Defender",
    description: "Defend your base from falling asteroids.",
    id: AppMode.GAME_SPACE,
    icon: "🚀",
    color: "bg-indigo-100 text-indigo-600"
  },
  {
    name: "Speed Racer",
    description: "Type fast to win the car race against the bot.",
    id: AppMode.GAME_RACER,
    icon: "🏎️",
    color: "bg-green-100 text-green-600"
  },
  {
    name: "Memory Matrix",
    description: "Remember the word shown briefly and type it out.",
    id: AppMode.GAME_MEMORY,
    icon: "🧠",
    color: "bg-purple-100 text-purple-600"
  }
];

export const FALLBACK_WORDS_EN = ["apple", "banana", "cherry", "dog", "elephant", "fish", "grape", "house", "ice", "jump", "kite", "lemon", "mouse", "nose", "orange", "pencil", "queen", "rabbit", "sun", "tree", "umbrella", "violin", "water", "xylophone", "yellow", "zebra"];
export const FALLBACK_WORDS_ZH = ["苹果", "香蕉", "樱桃", "小狗", "大象", "鱼", "葡萄", "房子", "冰", "跳", "风筝", "柠檬", "老鼠", "鼻子", "橙子", "铅笔", "女王", "兔子", "太阳", "树", "雨伞", "小提琴", "水", "木琴", "黄色", "斑马"];
