import { GoogleGenAI, Type } from "@google/genai";
import { Language, Difficulty } from "../types";
import { FALLBACK_WORDS_EN, FALLBACK_WORDS_ZH } from "../constants";

const apiKey = process.env.API_KEY || ''; // Ensure this is safe in prod
const ai = new GoogleGenAI({ apiKey });

export const generateTypingContent = async (language: Language, difficulty: Difficulty, count: number = 20): Promise<string[]> => {
  if (!apiKey) {
    console.warn("No API Key provided. Using fallback data.");
    return language === Language.ENGLISH ? FALLBACK_WORDS_EN.slice(0, count) : FALLBACK_WORDS_ZH.slice(0, count);
  }

  const langStr = language === Language.ENGLISH ? "English" : "Simplified Chinese (words or idioms)";
  const difficultyStr = difficulty === 'easy' ? "simple words for kids (3-5 letters/characters)" : difficulty === 'medium' ? "common words (5-8 letters/characters)" : "complex words or short phrases";

  const prompt = `Generate a JSON list of ${count} distinct ${langStr} ${difficultyStr} suitable for a primary school typing game. Return ONLY the array of strings.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    throw new Error("Invalid response format");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return language === Language.ENGLISH ? FALLBACK_WORDS_EN : FALLBACK_WORDS_ZH;
  }
};

export const generatePracticeSentence = async (language: Language, difficulty: Difficulty = 'easy'): Promise<string> => {
   if (!apiKey) {
    return language === Language.ENGLISH 
      ? "The quick brown fox jumps over the lazy dog." 
      : "一只敏捷的棕色狐狸跳过了一只懒惰的狗。";
  }

  const langStr = language === Language.ENGLISH ? "English" : "Simplified Chinese";
  let complexityPrompt = "";
  if (difficulty === 'easy') complexityPrompt = "simple words, short sentence (max 8 words)";
  else if (difficulty === 'medium') complexityPrompt = "common words, medium length sentence (10-15 words)";
  else complexityPrompt = "complex words, longer sentence (15-25 words), inspiring or educational";

  const prompt = `Write a single ${langStr} sentence for a child to practice typing. Difficulty: ${difficulty} (${complexityPrompt}). Just the sentence text.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || "";
  } catch (error) {
     return language === Language.ENGLISH 
      ? "The quick brown fox jumps over the lazy dog." 
      : "一只敏捷的棕色狐狸跳过了一只懒惰的狗。";
  }
}

export const generateShortArticle = async (language: Language, difficulty: Difficulty = 'easy'): Promise<string> => {
  if (!apiKey) {
    return language === Language.ENGLISH 
      ? "The sun is shining brightly today. Birds are singing in the trees. It is a perfect day to go to the park and play with friends."
      : "今天阳光明媚。鸟儿在树上歌唱。这是去公园和朋友们玩耍的完美日子。";
  }

  const langStr = language === Language.ENGLISH ? "English" : "Simplified Chinese";
  let lengthPrompt = "";
  if (difficulty === 'easy') lengthPrompt = "very short paragraph (approx 20-30 words), simple vocabulary";
  else if (difficulty === 'medium') lengthPrompt = "short paragraph (approx 40-60 words), standard vocabulary";
  else lengthPrompt = "paragraph (approx 80-100 words), advanced vocabulary";

  const prompt = `Write a ${lengthPrompt} in ${langStr} for a primary school student to practice typing. Interesting facts or a mini story. Plain text only.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || "";
  } catch (error) {
    return language === Language.ENGLISH 
      ? "The sun is shining brightly today. Birds are singing in the trees. It is a perfect day to go to the park and play with friends."
      : "今天阳光明媚。鸟儿在树上歌唱。这是去公园和朋友们玩耍的完美日子。";
  }
}