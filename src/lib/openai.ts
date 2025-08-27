import OpenAI from 'openai';
import type { UserStory, CategoryType, SentimentType, SentimentStoryData } from '../types';
import { QUESTIONS_2025_5_8 } from '../data/questions';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// 延迟函数，用于避免API限制
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // 允许在浏览器中使用
});

// 根据类别获取对应的中文名称
const getCategoryName = (category: CategoryType): string => {
  const categoryNames = {
    person: '人物',
    object: '事物',
    place: '地点',
    experience: '经历'
  };
  return categoryNames[category];
};

// 生成通用语料的提示词
const generateCommonContentPrompt = (story: UserStory): string => {
  const categoryName = getCategoryName(story.category);
  const storyDetails = Object.entries(story.storyData)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  return `请根据以下${categoryName}故事信息，生成一段适合雅思口语Part 2的通用语料。要求：

故事信息：
${storyDetails}

要求：
1. 语言自然流畅，符合雅思口语评分标准
2. 内容丰富，包含具体细节和个人感受
3. 长度控制在150-200词左右
4. 使用多样化的词汇和句式结构
5. 体现个人观点和情感表达
6. 适合作为多个相关题目的基础语料

请直接输出语料内容，不需要额外说明。`;
};

// 生成情绪化通用语料的提示词
const generateSentimentCommonPrompt = (
  category: CategoryType,
  storyData: Record<string, string>,
  sentiment: SentimentType
): string => {
  const categoryName = getCategoryName(category);
  const sentimentDesc = sentiment === 'positive' ? '正面积极' : '负面消极';
  const storyDetails = Object.entries(storyData)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  return `请基于以下${sentimentDesc}的${categoryName}类故事，生成一段通用的雅思口语Part 2语料：

故事信息：
${storyDetails}

要求：
1. 语料应体现${sentimentDesc}的情绪色彩
2. 适用于该类别下所有${sentimentDesc}题目
3. 包含丰富的细节描述和个人感受
4. 语言自然流畅，符合雅思评分标准
5. 长度控制在150-200词左右
6. 使用多样化的词汇和句式结构
7. 突出${sentiment === 'positive' ? '积极正面的体验和感受' : '挑战困难及成长收获'}

请直接输出语料内容，不需要额外说明。`;
};

// 生成情绪化扣题语料的提示词
const generateSentimentSpecificPrompt = (
  commonContent: string,
  questionTitle: string,
  sentiment: SentimentType
): string => {
  const sentimentDesc = sentiment === 'positive' ? '正面积极' : '负面消极';
  
  return `请基于以下通用语料，针对具体题目进行调整优化：

通用语料：
${commonContent}

目标题目：
${questionTitle}

要求：
1. **重要：尽可能多地保留通用语料中的原始词句和表达**
2. 只对必要部分进行最小化调整，以贴合题目要求
3. 保持${sentimentDesc}的情绪基调
4. 保持通用语料的核心结构和主要内容
5. 仅针对题目特定要求添加或修改关键信息
6. 保持语言的自然性和流畅性
7. 长度控制在100-150词左右
8. 体现${sentiment === 'positive' ? '积极的态度和正面的影响' : '面对挑战的勇气和成长的意义'}
9. 优先保留通用语料的精彩表达，便于用户背诵记忆

请直接输出调整后的语料内容，不需要额外说明。`;
};

// 生成扣题语料的提示词
const generateSpecificContentPrompt = (story: UserStory, questionId?: string): string => {
  const categoryName = getCategoryName(story.category);
  const storyDetails = Object.entries(story.storyData)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  const basePrompt = `请根据以下${categoryName}故事信息，生成一段针对特定雅思题目的扣题语料。要求：

故事信息：
${storyDetails}

要求：
1. **重要：如果有通用语料作为参考，请尽可能多地保留其中的原始词句和表达**
2. 紧扣题目要求，直接回答题目问题
3. 在保留核心表达的基础上增加针对性内容
4. 突出与题目相关的关键信息
5. 长度控制在100-150词左右
6. 语言精准，逻辑清晰
7. 体现对题目的深入理解
8. 优先保留精彩的表达方式，便于用户背诵记忆`;

  if (questionId) {
    // 根据questionId获取实际题目信息
    const question = QUESTIONS_2025_5_8.find(q => q.id === questionId);
    const questionTitle = question ? `${question.titleCn} / ${question.titleEn}` : questionId;
    
    return `${basePrompt}

针对题目: ${questionTitle}
请确保语料内容与该题目高度相关。

请直接输出语料内容，不需要额外说明。`;
  }

  return `${basePrompt}

请直接输出语料内容，不需要额外说明。`;
};

// 重试配置
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1秒
  maxDelay: 10000, // 10秒
};

// 延迟函数已在文件开头定义

// 计算重试延迟（指数退避）
const calculateRetryDelay = (attempt: number): number => {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
};

// 带重试的API调用函数
const callOpenAIWithRetry = async (
  prompt: string,
  maxTokens: number = 500,
  attempt: number = 0
): Promise<string> => {
  console.log(`🚀 [OpenAI] 开始API调用 (尝试 ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1})`, {
    promptLength: prompt.length,
    maxTokens,
    timestamp: new Date().toISOString()
  });
  
  try {
    console.log('📡 [OpenAI] 发送请求到OpenAI API...');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: '你是一位专业的雅思口语教师，擅长帮助学生准备口语Part 2的语料。请根据用户提供的故事信息生成高质量的语料内容。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: maxTokens
    });

    console.log('✅ [OpenAI] API调用成功', {
      responseId: response.id,
      model: response.model,
      usage: response.usage,
      timestamp: new Date().toISOString()
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      console.error('❌ [OpenAI] API返回空内容', { response });
      throw new Error('OpenAI API 返回空内容');
    }

    console.log('📝 [OpenAI] 生成内容成功', {
      contentLength: content.length,
      contentPreview: content.substring(0, 100) + '...'
    });

    return content;
  } catch (error) {
    console.error(`❌ [OpenAI] API调用失败 (尝试 ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1}):`, {
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    // 如果还有重试次数且是可重试的错误
    if (attempt < RETRY_CONFIG.maxRetries && isRetryableError(error)) {
      const retryDelay = calculateRetryDelay(attempt);
      console.log(`🔄 [OpenAI] ${retryDelay}ms 后重试...`, {
        nextAttempt: attempt + 2,
        maxRetries: RETRY_CONFIG.maxRetries + 1
      });
      await delay(retryDelay);
      return callOpenAIWithRetry(prompt, maxTokens, attempt + 1);
    }
    
    console.error('💥 [OpenAI] 重试次数用完或遇到不可重试错误，抛出异常', {
      finalAttempt: attempt + 1,
      maxRetries: RETRY_CONFIG.maxRetries + 1,
      isRetryable: isRetryableError(error)
    });
    
    // 重试次数用完或不可重试的错误，抛出原始错误
    throw error;
  }
};

// 判断是否为可重试的错误
const isRetryableError = (error: any): boolean => {
  // 网络错误、超时、服务器错误等可以重试
  if (error?.code === 'ECONNRESET' || 
      error?.code === 'ETIMEDOUT' || 
      error?.status >= 500 || 
      error?.status === 429) { // 429 是速率限制
    return true;
  }
  
  // API密钥错误、权限错误等不应重试
  if (error?.status === 401 || error?.status === 403) {
    return false;
  }
  
  // 其他错误默认可重试
  return true;
};

// 生成通用语料的提示词（合并正负向信息）
const generateUnifiedCommonPrompt = (story: UserStory): string => {
  const categoryName = getCategoryName(story.category);
  
  // 检查是否为情绪化故事数据
  const isEmotionalStory = typeof story.storyData === 'object' && 'positive' in story.storyData;
  
  if (isEmotionalStory) {
    const emotionalData = story.storyData as SentimentStoryData;
    const positiveDetails = Object.entries(emotionalData.positive)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    const negativeDetails = Object.entries(emotionalData.negative)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    return `请基于以下${categoryName}类故事的正负向信息，生成一段通用的雅思口语Part 2语料：

正面情况：
${positiveDetails}

负面情况：
${negativeDetails}

要求：
1. 整合正负向信息，形成完整的故事描述
2. 语料应该平衡展现正负两面，体现真实性
3. 适用于该类别下所有相关题目
4. 包含丰富的细节描述和个人感受
5. 语言自然流畅，符合雅思评分标准
6. 长度控制在200-250词左右
7. 使用多样化的词汇和句式结构
8. 体现个人成长和深度思考

请直接输出语料内容，不需要额外说明。`;
  } else {
    // 传统单一故事数据
    const storyDetails = Object.entries(story.storyData as Record<string, string>)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    return `请根据以下${categoryName}故事信息，生成一段适合雅思口语Part 2的通用语料。要求：

故事信息：
${storyDetails}

要求：
1. 语言自然流畅，符合雅思口语评分标准
2. 内容丰富，包含具体细节和个人感受
3. 长度控制在150-200词左右
4. 使用多样化的词汇和句式结构
5. 体现个人观点和情感表达
6. 适合作为多个相关题目的基础语料

请直接输出语料内容，不需要额外说明。`;
  }
};

// 批量生成扣题语料
export const generateBatchSpecificContent = async (
  commonContent: string,
  category: CategoryType,
  sentiment: SentimentType
): Promise<Array<{ questionId: string; content: string }>> => {
  console.log('🔄 [OpenAI] 开始批量生成扣题语料', {
    category,
    sentiment,
    commonContentLength: commonContent.length
  });
  
  // 筛选该类别下对应情绪的所有题目
  const targetQuestions = QUESTIONS_2025_5_8.filter(q => 
    q.category === category && q.sentiment === sentiment
  );
  
  console.log('📋 [OpenAI] 找到目标题目', {
    count: targetQuestions.length,
    questionIds: targetQuestions.map(q => q.id)
  });
  
  const results: Array<{ questionId: string; content: string }> = [];
  
  // 为每个题目生成扣题语料
  for (const question of targetQuestions) {
    try {
      const questionTitle = `${question.titleCn} / ${question.titleEn}`;
      const specificPrompt = generateSentimentSpecificPrompt(commonContent, questionTitle, sentiment);
      
      console.log(`📝 [OpenAI] 生成题目 ${question.id} 的扣题语料`);
      const specificContent = await callOpenAIWithRetry(specificPrompt, 400);
      
      if (specificContent) {
        results.push({
          questionId: question.id,
          content: specificContent
        });
        console.log(`✅ [OpenAI] 题目 ${question.id} 扣题语料生成成功`);
      } else {
        console.warn(`⚠️ [OpenAI] 题目 ${question.id} 扣题语料生成失败`);
      }
      
      // 添加延迟避免API限制
      await delay(500);
    } catch (error) {
      console.error(`❌ [OpenAI] 题目 ${question.id} 生成失败:`, error);
    }
  }
  
  console.log('🎉 [OpenAI] 批量扣题语料生成完成', {
    totalQuestions: targetQuestions.length,
    successCount: results.length
  });
  
  return results;
};

// 生成单一正向/负向语料的函数
const generateSingleSpecificContent = async (
  commonContent: string,
  category: CategoryType,
  sentiment: SentimentType
): Promise<{ questionId: string; content: string } | null> => {
  console.log('🔄 [OpenAI] 开始生成单一扣题语料', {
    category,
    sentiment,
    commonContentLength: commonContent.length
  });
  
  // 筛选该类别下对应情绪的所有题目
  const targetQuestions = QUESTIONS_2025_5_8.filter(q => 
    q.category === category && q.sentiment === sentiment
  );
  
  if (targetQuestions.length === 0) {
    console.warn('⚠️ [OpenAI] 没有找到对应的题目');
    return null;
  }
  
  // 随机选择一个题目
  const randomQuestion = targetQuestions[Math.floor(Math.random() * targetQuestions.length)];
  
  console.log('📋 [OpenAI] 随机选择题目', {
    questionId: randomQuestion.id,
    title: randomQuestion.titleCn
  });
  
  try {
    const questionTitle = `${randomQuestion.titleCn} / ${randomQuestion.titleEn}`;
    const specificPrompt = generateSentimentSpecificPrompt(commonContent, questionTitle, sentiment);
    
    console.log(`📝 [OpenAI] 生成题目 ${randomQuestion.id} 的扣题语料`);
    const specificContent = await callOpenAIWithRetry(specificPrompt, 400);
    
    if (specificContent) {
      console.log(`✅ [OpenAI] 题目 ${randomQuestion.id} 扣题语料生成成功`);
      return {
        questionId: randomQuestion.id,
        content: specificContent
      };
    } else {
      console.warn(`⚠️ [OpenAI] 题目 ${randomQuestion.id} 扣题语料生成失败`);
      return null;
    }
  } catch (error) {
    console.error(`❌ [OpenAI] 题目 ${randomQuestion.id} 生成失败:`, error);
    return null;
  }
};

// 翻译语料内容为中文
const translateContent = async (content: string): Promise<string> => {
  console.log('🌐 [OpenAI] 开始翻译语料为中文', {
    contentLength: content.length,
    contentPreview: content.substring(0, 50) + '...'
  });
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: '你是一位专业的英中翻译专家，专门翻译雅思口语语料。请将英文语料翻译成自然流畅的中文，保持原文的语气和表达方式。'
        },
        {
          role: 'user',
          content: `请将以下雅思口语语料翻译成中文：\n\n${content}\n\n要求：\n1. 翻译要自然流畅，符合中文表达习惯\n2. 保持原文的语气和情感色彩\n3. 专业术语要准确翻译\n4. 直接输出翻译结果，不需要额外说明`
        }
      ],
      max_tokens: 800,
      temperature: 0.3
    });
    
    const translation = response.choices[0]?.message?.content?.trim() || '';
    console.log('✅ [OpenAI] 语料翻译完成', {
      translationLength: translation.length,
      translationPreview: translation.substring(0, 50) + '...'
    });
    
    return translation;
  } catch (error) {
    console.error('❌ [OpenAI] 翻译失败:', error);
    return ''; // 翻译失败时返回空字符串
  }
};

// 新的语料生成函数（生成单一正向和负向语料）
export const generateContent = async (story: UserStory): Promise<{
  commonContent: string;
  commonContentCn: string;
  negativeCommonContent: string;
  negativeCommonContentCn: string;
  specificContents: {
    positive: Array<{ questionId: string; content: string; contentCn: string }>;
    negative: Array<{ questionId: string; content: string; contentCn: string }>;
  };
}> => {
  console.log('🚀 [OpenAI] generateContent 开始调用（单一语料逻辑）', {
    storyId: story.id,
    category: story.category,
    storyDataKeys: Object.keys(story.storyData),
    timestamp: new Date().toISOString()
  });
  
  try {
    // 生成正向通用语料
     console.log('📝 [OpenAI] 生成正向通用语料');
     const positiveStoryData = typeof story.storyData === 'object' && 'positive' in story.storyData 
       ? (story.storyData as SentimentStoryData).positive 
       : story.storyData as Record<string, string>;
     const positiveCommonPrompt = generateSentimentCommonPrompt(story.category, positiveStoryData, 'positive');
     const positiveCommonContent = await callOpenAIWithRetry(positiveCommonPrompt, 600);
     
     if (!positiveCommonContent) {
       throw new Error('正向通用语料生成失败');
     }
     
     // 翻译正向通用语料
     console.log('🌐 [OpenAI] 翻译正向通用语料');
     const positiveCommonContentCn = await translateContent(positiveCommonContent);
     
     // 生成负向通用语料
     console.log('📝 [OpenAI] 生成负向通用语料');
     const negativeStoryData = typeof story.storyData === 'object' && 'negative' in story.storyData 
       ? (story.storyData as SentimentStoryData).negative 
       : story.storyData as Record<string, string>;
     const negativeCommonPrompt = generateSentimentCommonPrompt(story.category, negativeStoryData, 'negative');
     const negativeCommonContent = await callOpenAIWithRetry(negativeCommonPrompt, 600);
    
    if (!negativeCommonContent) {
      throw new Error('负向通用语料生成失败');
    }
    
    // 翻译负向通用语料
    console.log('🌐 [OpenAI] 翻译负向通用语料');
    const negativeCommonContentCn = await translateContent(negativeCommonContent);
    
    console.log('✅ [OpenAI] 正负向通用语料生成成功', {
      positiveLength: positiveCommonContent.length,
      negativeLength: negativeCommonContent.length,
      positiveTranslationLength: positiveCommonContentCn.length,
      negativeTranslationLength: negativeCommonContentCn.length
    });
    
    // 生成所有正向扣题语料
    console.log('📝 [OpenAI] 开始批量生成正向扣题语料');
    const positiveContents = await generateBatchSpecificContent(
      positiveCommonContent,
      story.category,
      'positive'
    );
    
    // 翻译正向扣题语料
    console.log('🌐 [OpenAI] 翻译正向扣题语料');
    const positiveContentsWithTranslation = await Promise.all(
      positiveContents.map(async (item) => {
        const contentCn = await translateContent(item.content);
        return { ...item, contentCn };
      })
    );
    
    // 生成所有负向扣题语料
    console.log('📝 [OpenAI] 开始批量生成负向扣题语料');
    const negativeContents = await generateBatchSpecificContent(
      negativeCommonContent,
      story.category,
      'negative'
    );
    
    // 翻译负向扣题语料
    console.log('🌐 [OpenAI] 翻译负向扣题语料');
    const negativeContentsWithTranslation = await Promise.all(
      negativeContents.map(async (item) => {
        const contentCn = await translateContent(item.content);
        return { ...item, contentCn };
      })
    );
    
    console.log('🎉 [OpenAI] 所有语料生成完成', {
      positiveCommonLength: positiveCommonContent.length,
      negativeCommonLength: negativeCommonContent.length,
      positiveSpecificCount: positiveContentsWithTranslation.length,
      negativeSpecificCount: negativeContentsWithTranslation.length
    });
    
    // 返回正向和负向通用语料及翻译
     return {
       commonContent: positiveCommonContent,
       commonContentCn: positiveCommonContentCn,
       negativeCommonContent: negativeCommonContent,
       negativeCommonContentCn: negativeCommonContentCn,
       specificContents: {
         positive: positiveContentsWithTranslation,
         negative: negativeContentsWithTranslation
       }
     };
  } catch (error) {
    console.error('❌ [OpenAI] generateContent 调用失败:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      storyId: story.id,
      category: story.category,
      timestamp: new Date().toISOString()
    });
    throw new Error('生成语料失败，请检查网络连接或API配置');
  }
};

// 编辑语料内容
export const editContent = async (originalContent: string, instruction: string): Promise<string> => {
  console.log('✏️ [OpenAI] editContent 开始调用', {
    originalContentLength: originalContent.length,
    instructionLength: instruction.length,
    originalContentPreview: originalContent.substring(0, 50) + '...',
    instruction: instruction,
    timestamp: new Date().toISOString()
  });
  
  try {
    console.log('⏳ [OpenAI] 开始编辑API调用...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: '你是一位专业的雅思口语教师。请根据用户的指令对语料内容进行编辑和优化，保持语料的质量和雅思口语标准。'
        },
        {
          role: 'user',
          content: `请根据以下指令编辑语料内容：

原始语料：
${originalContent}

编辑指令：
${instruction}

要求：
1. 保持语料的整体结构和风格
2. 确保编辑后的内容符合雅思口语标准
3. 语言自然流畅，逻辑清晰
4. 直接输出编辑后的语料，不需要额外说明

请输出编辑后的语料内容：`
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });
    
    console.log('✅ [OpenAI] 编辑API调用完成', {
      responseStatus: response.choices[0] ? 'success' : 'empty',
      tokens: response.usage?.total_tokens
    });
    
    const editedContent = response.choices[0]?.message?.content?.trim() || originalContent;
    
    console.log('📝 [OpenAI] 语料编辑结果', {
      editedContentLength: editedContent.length,
      editedContentPreview: editedContent.substring(0, 50) + '...',
      contentChanged: editedContent !== originalContent
    });

    return editedContent;
  } catch (error) {
    console.error('❌ [OpenAI] editContent 调用失败:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      originalContentLength: originalContent.length,
      instruction: instruction,
      timestamp: new Date().toISOString()
    });
    throw new Error('编辑语料失败，请检查网络连接或API配置');
  }
};

// 编辑翻译内容
export const editTranslation = async (originalTranslation: string, instruction: string): Promise<string> => {
  console.log('✏️ [OpenAI] editTranslation 开始调用', {
    originalTranslationLength: originalTranslation.length,
    instructionLength: instruction.length,
    originalTranslationPreview: originalTranslation.substring(0, 50) + '...',
    instruction: instruction,
    timestamp: new Date().toISOString()
  });
  
  try {
    console.log('⏳ [OpenAI] 开始编辑翻译API调用...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: '你是一位专业的中文编辑和雅思口语教师。请根据用户的指令对中文翻译内容进行编辑和优化，保持翻译的准确性和中文表达的自然流畅。'
        },
        {
          role: 'user',
          content: `请根据以下指令编辑中文翻译内容：\n\n原始翻译：\n${originalTranslation}\n\n编辑指令：\n${instruction}\n\n要求：\n1. 保持翻译的准确性和完整性\n2. 确保中文表达自然流畅\n3. 符合中文语言习惯\n4. 直接输出编辑后的翻译，不需要额外说明\n\n请输出编辑后的翻译内容：`
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });
    
    console.log('✅ [OpenAI] 编辑翻译API调用完成', {
      responseStatus: response.choices[0] ? 'success' : 'empty',
      tokens: response.usage?.total_tokens
    });
    
    const editedTranslation = response.choices[0]?.message?.content?.trim() || originalTranslation;
    
    console.log('📝 [OpenAI] 翻译编辑结果', {
      editedTranslationLength: editedTranslation.length,
      editedTranslationPreview: editedTranslation.substring(0, 50) + '...',
      contentChanged: editedTranslation !== originalTranslation
    });

    return editedTranslation;
  } catch (error) {
    console.error('❌ [OpenAI] editTranslation 调用失败:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      originalTranslationLength: originalTranslation.length,
      instruction: instruction,
      timestamp: new Date().toISOString()
    });
    throw new Error('编辑翻译失败，请检查网络连接或API配置');
  }
};

// 重新翻译内容
export const retranslateContent = async (content: string): Promise<string> => {
  console.log('🔄 [OpenAI] retranslateContent 开始调用', {
    contentLength: content.length,
    contentPreview: content.substring(0, 50) + '...'
  });
  
  return await translateContent(content);
};

// 评估通用语料与题目的匹配度
export const evaluateMatching = async (
  commonContent: string,
  questionTitle: string,
  category: CategoryType
): Promise<{ score: number; level: 'high' | 'medium' | 'low'; reason: string }> => {
  console.log('🎯 [OpenAI] evaluateMatching 开始调用', {
    commonContentLength: commonContent.length,
    questionTitle,
    category,
    timestamp: new Date().toISOString()
  });
  
  try {
    const categoryName = getCategoryName(category);
    const evaluationPrompt = `你是一位专业的雅思口语评估专家。请评估以下通用语料与具体题目的匹配度。

题目类别：${categoryName}
题目：${questionTitle}

通用语料：
${commonContent}

请从以下几个维度评估匹配度：
1. 内容相关性：语料内容是否与题目要求高度相关
2. 适用性：语料是否能够直接或稍作调整后回答该题目
3. 完整性：语料是否涵盖了题目可能涉及的关键要点
4. 自然度：语料内容是否自然流畅，符合口语表达习惯

评分标准：
- 90-100分：高匹配度，语料与题目高度相关，可直接使用
- 70-89分：中匹配度，语料基本相关，需要少量调整
- 0-69分：低匹配度，语料相关性较低，建议重新生成

请按以下JSON格式输出评估结果：
{
  "score": 评分(0-100的整数),
  "level": "匹配等级(high/medium/low)",
  "reason": "详细的评估理由(50字以内)"
}

只输出JSON，不要其他内容。`;
    
    console.log('⏳ [OpenAI] 开始匹配度评估API调用...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: '你是一位专业的雅思口语评估专家，擅长分析语料与题目的匹配度。请严格按照要求输出JSON格式的评估结果。'
        },
        {
          role: 'user',
          content: evaluationPrompt
        }
      ],
      max_tokens: 300,
      temperature: 0.3
    });
    
    const responseContent = response.choices[0]?.message?.content?.trim() || '';
    console.log('📊 [OpenAI] 匹配度评估原始响应', {
      responseContent,
      responseLength: responseContent.length
    });
    
    // 解析JSON响应
    try {
      const result = JSON.parse(responseContent);
      
      // 验证响应格式
      if (typeof result.score !== 'number' || 
          !['high', 'medium', 'low'].includes(result.level) ||
          typeof result.reason !== 'string') {
        throw new Error('响应格式不正确');
      }
      
      // 确保分数在有效范围内
      const score = Math.max(0, Math.min(100, result.score));
      
      // 根据分数确定等级
      let level: 'high' | 'medium' | 'low';
      if (score >= 90) {
        level = 'high';
      } else if (score >= 70) {
        level = 'medium';
      } else {
        level = 'low';
      }
      
      const finalResult = {
        score,
        level,
        reason: result.reason || '评估完成'
      };
      
      console.log('✅ [OpenAI] 匹配度评估完成', {
        score: finalResult.score,
        level: finalResult.level,
        reason: finalResult.reason,
        questionTitle
      });
      
      return finalResult;
    } catch (parseError) {
      console.warn('⚠️ [OpenAI] JSON解析失败，使用默认评估', {
        parseError: parseError instanceof Error ? parseError.message : String(parseError),
        responseContent
      });
      
      // 解析失败时返回默认中等匹配度
      return {
        score: 75,
        level: 'medium',
        reason: '评估解析失败，默认中等匹配度'
      };
    }
  } catch (error) {
    console.error('❌ [OpenAI] evaluateMatching 调用失败:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      questionTitle,
      category,
      timestamp: new Date().toISOString()
    });
    
    // API调用失败时返回默认评估
    return {
      score: 75,
      level: 'medium',
      reason: 'API调用失败，默认中等匹配度'
    };
  }
};

// 重新生成通用语料（针对低匹配度题目）
export const regenerateCommonContent = async (
  story: UserStory,
  sentiment: SentimentType,
  questionTitle: string,
  customPrompt?: string
): Promise<{ content: string; contentCn: string }> => {
  console.log('🔄 [OpenAI] regenerateCommonContent 开始调用', {
    storyId: story.id,
    category: story.category,
    sentiment,
    questionTitle,
    hasCustomPrompt: !!customPrompt,
    timestamp: new Date().toISOString()
  });
  
  try {
    const categoryName = getCategoryName(story.category);
    
    // 获取对应情绪的故事数据
    const storyData = typeof story.storyData === 'object' && 'positive' in story.storyData
      ? (story.storyData as SentimentStoryData)[sentiment]
      : story.storyData as Record<string, string>;
    
    const storyDetails = Object.entries(storyData)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    // 构建重新生成的提示词
    const regenerationPrompt = `作为雅思口语专家，请基于以下${categoryName}类故事信息，针对特定题目重新生成一段高度匹配的雅思口语Part 2语料。

🎯 目标题目：${questionTitle}

📖 故事信息：
${storyDetails}

${customPrompt ? `🔧 用户特殊要求：
${customPrompt}

` : ''}📋 生成要求：
1. **高度匹配性**：语料必须精准回答目标题目，避免泛泛而谈
2. **故事融合**：巧妙融入故事细节，使内容具体生动
3. **语言质量**：
   - 使用地道的英语表达和高级词汇
   - 运用多样化的句式结构（简单句、复合句、复杂句）
   - 确保语法准确，语言自然流畅
4. **内容结构**：
   - 开头：直接回应题目要求
   - 主体：详细描述，包含具体细节和个人感受
   - 结尾：总结感想或影响
5. **评分标准对应**：
   - Fluency & Coherence: 逻辑清晰，连接词恰当
   - Lexical Resource: 词汇丰富，用词准确
   - Grammatical Range: 语法多样，结构复杂
   - Pronunciation: 易于理解的表达方式
6. **长度控制**：200-250词，内容充实但不冗余
7. **情感表达**：体现真实的个人观点和情感体验

💡 提示：请确保语料能够获得雅思口语7分以上的评分标准。

请直接输出优化后的语料内容，不需要额外说明。`;
    
    console.log('📝 [OpenAI] 开始重新生成语料');
    const regeneratedContent = await callOpenAIWithRetry(regenerationPrompt, 600);
    
    if (!regeneratedContent) {
      throw new Error('重新生成语料失败');
    }
    
    // 翻译重新生成的语料
    console.log('🌐 [OpenAI] 翻译重新生成的语料');
    const regeneratedContentCn = await translateContent(regeneratedContent);
    
    console.log('✅ [OpenAI] 语料重新生成完成', {
      contentLength: regeneratedContent.length,
      translationLength: regeneratedContentCn.length,
      questionTitle
    });
    
    return {
      content: regeneratedContent,
      contentCn: regeneratedContentCn
    };
  } catch (error) {
    console.error('❌ [OpenAI] regenerateCommonContent 调用失败:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      storyId: story.id,
      category: story.category,
      sentiment,
      questionTitle,
      timestamp: new Date().toISOString()
    });
    throw new Error('重新生成语料失败，请检查网络连接或API配置');
  }
};