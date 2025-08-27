// 文本差异对比工具

// 差异类型（简化版，只标记新增内容）
export type DiffType = 'added' | 'unchanged';

// 差异片段
export interface DiffSegment {
  text: string;
  type: DiffType;
}

// 简化的文本差异算法（基于句子级别，只标记新增内容）
export function generateTextDiff(originalText: string, modifiedText: string): DiffSegment[] {
  // 将文本按句子分割
  const originalSentences = splitIntoSentences(originalText);
  const modifiedSentences = splitIntoSentences(modifiedText);
  
  // 找出新增的句子
  const diff = findAddedSentences(originalSentences, modifiedSentences);
  
  return diff;
}

// 文本分句函数
function splitIntoSentences(text: string): string[] {
  // 按句号、问号、感叹号分割句子，保留分隔符
  const sentences = text.split(/([.!?]+\s*)/).filter(sentence => sentence.trim().length > 0);
  
  // 进一步处理，将标点符号与前面的句子分开
  const result: string[] = [];
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    // 检查是否是纯标点符号
    if (/^[.!?]+\s*$/.test(sentence)) {
      // 这是标点符号，单独作为一个片段
      result.push(sentence);
    } else {
      // 这是正常句子内容
      result.push(sentence);
    }
  }
  
  return result;
}

// 找出需要高亮的句子（与通用语料相似度达到0.3的内容）
function findAddedSentences(original: string[], modified: string[]): DiffSegment[] {
  const result: DiffSegment[] = [];
  let previousSentenceHighlighted = false;
  
  for (let i = 0; i < modified.length; i++) {
    const sentence = modified[i];
    const trimmedSentence = sentence.trim();
    
    // 空行不高亮
    if (trimmedSentence.length === 0) {
      result.push({ text: sentence, type: 'unchanged' });
      previousSentenceHighlighted = false;
      continue;
    }
    
    // 检查是否是纯标点符号
    const isPunctuation = /^[.!?]+\s*$/.test(trimmedSentence);
    
    if (isPunctuation) {
      // 标点符号的高亮依赖于前面句子的状态
      if (previousSentenceHighlighted) {
        result.push({ text: sentence, type: 'added' });
      } else {
        result.push({ text: sentence, type: 'unchanged' });
      }
      // 标点符号不改变高亮状态
      continue;
    }
    
    // 首先检查是否与原文中的任何句子完全匹配（忽略空格和标点符号的差异）
    const isExactMatch = original.some(originalSentence => 
      normalizeText(trimmedSentence) === normalizeText(originalSentence.trim())
    );
    
    if (isExactMatch) {
      // 完全匹配的句子，标记为added（高亮显示）
      result.push({ text: sentence, type: 'added' });
      previousSentenceHighlighted = true;
    } else {
      // 检查是否与原文中的任何句子相似（降低相似度阈值到0.3）
      const isSimilarToOriginal = original.some(originalSentence => 
        calculateSimilarity(trimmedSentence, originalSentence.trim()) >= 0.3
      );
      
      if (isSimilarToOriginal) {
        // 与原文相似度达到0.3的句子，标记为added（高亮显示）
        result.push({ text: sentence, type: 'added' });
        previousSentenceHighlighted = true;
      } else {
        // 其他内容，标记为unchanged（普通文本样式）
        result.push({ text: sentence, type: 'unchanged' });
        previousSentenceHighlighted = false;
      }
    }
  }
  
  return result;
}

// 标准化文本（移除多余空格和标点符号，用于精确匹配）
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:"'()\[\]{}]/g, '') // 移除标点符号
    .replace(/\s+/g, ' ') // 将多个空格替换为单个空格
    .trim();
}

// 计算两个句子的相似度（基于词汇重叠率）
function calculateSimilarity(sentence1: string, sentence2: string): number {
  // 如果完全相同，返回1
  if (sentence1 === sentence2) return 1;
  
  // 将句子转换为词汇集合
  const words1 = new Set(sentence1.toLowerCase().split(/\s+/).filter(word => word.length > 0));
  const words2 = new Set(sentence2.toLowerCase().split(/\s+/).filter(word => word.length > 0));
  
  // 如果任一句子为空，返回0
  if (words1.size === 0 || words2.size === 0) return 0;
  
  // 计算交集
  const intersection = new Set([...words1].filter(word => words2.has(word)));
  
  // 计算并集
  const union = new Set([...words1, ...words2]);
  
  // 返回Jaccard相似度
  return intersection.size / union.size;
}



// 合并相邻的相同类型片段
export function mergeDiffSegments(segments: DiffSegment[]): DiffSegment[] {
  if (segments.length === 0) return [];
  
  const merged: DiffSegment[] = [];
  let current = { ...segments[0] };
  
  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    
    if (segment.type === current.type) {
      // 相同类型，合并文本
      current.text += segment.text;
    } else {
      // 不同类型，保存当前片段并开始新的
      merged.push(current);
      current = { ...segment };
    }
  }
  
  // 添加最后一个片段
  merged.push(current);
  
  return merged;
}

// 生成高亮HTML（只标记新增内容）
export function generateHighlightedHTML(segments: DiffSegment[]): string {
  return segments.map(segment => {
    switch (segment.type) {
      case 'added':
        return `<span class="diff-added">${escapeHtml(segment.text)}</span>`;
      case 'unchanged':
      default:
        return escapeHtml(segment.text);
    }
  }).join('');
}

// HTML转义
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// React组件用的差异渲染函数（只高亮新增内容）
export function renderDiffSegments(segments: DiffSegment[]): React.ReactNode[] {
  return segments.map((segment, index) => {
    const key = `diff-${index}`;
    
    switch (segment.type) {
      case 'added':
        return (
          <span key={key} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md">
            {segment.text}
          </span>
        );
      case 'unchanged':
      default:
        return <span key={key}>{segment.text}</span>;
    }
  });
}