/**
 * 计算文本的单词数
 * 中文按字符计算，英文按单词计算
 * @param text 要计算的文本
 * @returns 单词数
 */
export function getWordCount(text: string): number {
  if (!text || typeof text !== 'string') {
    return 0;
  }

  // 移除多余的空白字符
  const cleanText = text.trim();
  if (cleanText.length === 0) {
    return 0;
  }

  // 分离中文字符和英文单词
  let chineseCharCount = 0;
  let englishWordCount = 0;

  // 匹配中文字符（包括中文标点符号）
  const chineseRegex = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3300-\u33ff\ufe30-\ufe4f\u3000-\u303f\uff00-\uffef]/g;
  
  // 计算中文字符数
  const chineseMatches = cleanText.match(chineseRegex);
  if (chineseMatches) {
    chineseCharCount = chineseMatches.length;
  }

  // 移除中文字符，只保留英文部分
  const englishText = cleanText.replace(chineseRegex, ' ');
  
  // 匹配英文单词（字母、数字、连字符组成的单词）
  const englishWordRegex = /[a-zA-Z0-9]+(?:[-'][a-zA-Z0-9]+)*/g;
  const englishMatches = englishText.match(englishWordRegex);
  if (englishMatches) {
    englishWordCount = englishMatches.length;
  }

  // 返回总单词数（中文字符数 + 英文单词数）
  return chineseCharCount + englishWordCount;
}

/**
 * 格式化单词数显示
 * @param count 单词数
 * @returns 格式化的字符串
 */
export function formatWordCount(count: number): string {
  return `字数: ${count}`;
}

/**
 * 获取文本的详细统计信息
 * @param text 要分析的文本
 * @returns 包含中文字符数、英文单词数和总数的对象
 */
export function getDetailedWordCount(text: string): {
  chineseChars: number;
  englishWords: number;
  total: number;
} {
  if (!text || typeof text !== 'string') {
    return { chineseChars: 0, englishWords: 0, total: 0 };
  }

  const cleanText = text.trim();
  if (cleanText.length === 0) {
    return { chineseChars: 0, englishWords: 0, total: 0 };
  }

  let chineseChars = 0;
  let englishWords = 0;

  // 匹配中文字符
  const chineseRegex = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3300-\u33ff\ufe30-\ufe4f\u3000-\u303f\uff00-\uffef]/g;
  const chineseMatches = cleanText.match(chineseRegex);
  if (chineseMatches) {
    chineseChars = chineseMatches.length;
  }

  // 移除中文字符，计算英文单词
  const englishText = cleanText.replace(chineseRegex, ' ');
  const englishWordRegex = /[a-zA-Z0-9]+(?:[-'][a-zA-Z0-9]+)*/g;
  const englishMatches = englishText.match(englishWordRegex);
  if (englishMatches) {
    englishWords = englishMatches.length;
  }

  return {
    chineseChars,
    englishWords,
    total: chineseChars + englishWords
  };
}