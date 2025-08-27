// 雅思串题助手 - Zustand状态管理
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CategoryType, UserStory, GeneratedContent, Statistics, SentimentType, SentimentStoryData, MatchingScore, Question, RegenerationRecord } from '../types';
import { getQuestionsByCategory, getQuestionsStatistics, QUESTIONS_2025_5_8 as getAllQuestions } from '../data/questions';
import { generateContent as openaiGenerateContent, editContent as openaiEditContent, editTranslation as openaiEditTranslation, retranslateContent as openaiRetranslateContent, evaluateMatching, regenerateCommonContent } from '../lib/openai';
import { generateId } from '../lib/utils';

interface AppState {
  // 状态
  currentSeason: string;
  questions: any; // 题目数据
  userStories: UserStory[];
  generatedContents: GeneratedContent[];
  isLoading: boolean;
  error: string | null;
  // 匹配度评估相关状态
  matchingEvaluations: Map<string, MatchingScore>; // contentId -> MatchingScore
  evaluatingContents: Set<string>; // 正在评估的内容ID集合
  // 懒加载和缓存优化
  visibleContentIds: Set<string>; // 当前可见的内容ID
  evaluationQueue: string[]; // 待评估队列
  isEvaluationPaused: boolean; // 是否暂停评估（用户正在交互时）
  lastEvaluationTime: number; // 上次评估时间戳

  // 操作
  setCurrentSeason: (season: string) => void;
  addUserStory: (story: Omit<UserStory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateUserStory: (id: string, updates: Partial<UserStory>) => void;
  deleteUserStory: (id: string) => void;
  generateContent: (story: UserStory) => Promise<void>;
  editContent: (contentId: string, instruction: string) => Promise<void>;
  editTranslation: (contentId: string, instruction: string, isCommon?: boolean) => Promise<void>;
  retranslateContent: (contentId: string, isCommon?: boolean) => Promise<void>;
  getStatistics: () => Statistics;
  getQuestionsByCategory: (category: CategoryType) => any;
  clearError: () => void;
  // 新增情绪相关方法
  updateStoryDataBySentiment: (storyId: string, sentiment: SentimentType, data: Record<string, string>) => void;
  getStoryDataBySentiment: (storyId: string, sentiment: SentimentType) => Record<string, string>;
  // 匹配度评估相关方法
  evaluateContentMatching: (contentId: string) => Promise<void>;
  getMatchingScore: (contentId: string) => MatchingScore | undefined;
  regenerateContent: (contentId: string, customPrompt?: string, reason?: string) => Promise<void>;
  batchEvaluateMatching: (contentIds: string[]) => Promise<void>;
  clearMatchingCache: () => void;
  
  // 懒加载和缓存优化方法
  setVisibleContents: (contentIds: string[]) => void;
  pauseEvaluation: () => void;
  resumeEvaluation: () => void;
  processEvaluationQueue: () => Promise<void>;
  smartBatchEvaluate: () => Promise<void>;
  preloadMatchingScores: (categoryType?: CategoryType, sentiment?: 'positive' | 'negative') => Promise<void>;
}

const DEFAULT_SEASON = '2025-5-8';
const QUESTIONS_2025_5_8: any = [];

// 数据迁移函数：将旧格式的故事数据迁移到新的双情绪格式
const migrateStoryData = (oldData: Record<string, string> | SentimentStoryData): SentimentStoryData => {
  // 如果已经是新格式，直接返回
  if (oldData && typeof oldData === 'object' && 'positive' in oldData && 'negative' in oldData) {
    return oldData as SentimentStoryData;
  }
  
  // 如果是旧格式，迁移到新格式
  const legacyData = oldData as Record<string, string>;
  return {
    positive: legacyData || {},
    negative: {}
  };
};

// 迁移用户故事数组
const migrateUserStories = (stories: UserStory[]): UserStory[] => {
  return stories.map(story => ({
    ...story,
    storyData: migrateStoryData(story.storyData)
  }));
};

export const useAppStore = create<AppState>()(persist(
  (set, get) => ({
    currentSeason: '2025-5-8',
    questions: getAllQuestions,
    userStories: [],
    generatedContents: [],
    isLoading: false,
    error: null,
    // 匹配度评估相关状态
    matchingEvaluations: new Map(),
    evaluatingContents: new Set(),
    // 懒加载和缓存优化
    visibleContentIds: new Set(),
    evaluationQueue: [],
    isEvaluationPaused: false,
    lastEvaluationTime: 0,

    // Actions
    setCurrentSeason: (season: string) => {
      set({ currentSeason: season });
    },

    updateStoryDataBySentiment: (storyId: string, sentiment: SentimentType, data: Record<string, string>) => {
      console.log('🔄 [Store] ===== updateStoryDataBySentiment 开始执行 =====', {
        storyId,
        sentiment,
        data,
        dataKeys: Object.keys(data),
        timestamp: new Date().toISOString()
      });
      
      set(state => {
        const targetStory = state.userStories.find(story => story.id === storyId);
        console.log('📋 [Store] updateStoryDataBySentiment: 找到目标故事', {
          found: !!targetStory,
          storyId,
          existingStoryData: targetStory?.storyData
        });
        
        const newState = {
          userStories: state.userStories.map(story => {
            if (story.id === storyId) {
              const updatedStory = {
                ...story,
                storyData: {
                  ...story.storyData,
                  [sentiment]: data
                },
                updatedAt: new Date()
              };
              console.log('✅ [Store] updateStoryDataBySentiment: 故事更新成功', {
                storyId,
                sentiment,
                updatedStoryData: updatedStory.storyData
              });
              return updatedStory;
            }
            return story;
          })
        };
        
        console.log('🏁 [Store] ===== updateStoryDataBySentiment 执行完成 =====');
        return newState;
      });
    },

    getStoryDataBySentiment: (storyId: string, sentiment: SentimentType) => {
      const { userStories } = get();
      const story = userStories.find(s => s.id === storyId);
      return story?.storyData[sentiment] || {};
    },

    addUserStory: (story: UserStory) => {
      console.log('🔄 [Store] ===== addUserStory 开始执行 =====');
      console.log('[Store] addUserStory 被调用');
      console.log('[Store] 输入的故事数据:', story);
      
      try {
        const newStory: UserStory = {
          ...story,
          id: generateId(),
          storyData: migrateStoryData(story.storyData),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        console.log('[Store] 准备添加的故事:', newStory);
        console.log('[Store] 故事数据迁移结果:', {
          originalData: story.storyData,
          migratedData: newStory.storyData
        });
        
        set(state => {
          console.log('[Store] 当前用户故事数量:', state.userStories.length);
          const newState = {
            userStories: [...state.userStories, newStory]
          };
          console.log('[Store] 添加后用户故事数量:', newState.userStories.length);
          console.log('✅ [Store] addUserStory: 故事添加成功', {
            newStoryId: newStory.id,
            category: newStory.category,
            totalStories: newState.userStories.length
          });
          return newState;
        });
        
        console.log('🏁 [Store] ===== addUserStory 执行完成 =====');
      } catch (error) {
        console.error('❌ [Store] addUserStory 执行失败:', error);
        throw error;
      }
    },

    updateUserStory: (id: string, updates: Partial<UserStory>) => {
      console.log('[Store] updateUserStory 被调用');
      console.log('[Store] 故事ID:', id);
      console.log('[Store] 更新数据:', updates);
      
      set(state => {
        const existingStory = state.userStories.find(story => story.id === id);
        console.log('[Store] 找到的现有故事:', existingStory);
        
        if (!existingStory) {
          console.warn('[Store] 未找到要更新的故事, ID:', id);
          return state;
        }
        
        const updatedStory = { ...existingStory, ...updates, updatedAt: new Date() };
        console.log('[Store] 更新后的故事:', updatedStory);
        
        const newState = {
          userStories: state.userStories.map(story => 
            story.id === id ? updatedStory : story
          )
        };
        
        console.log('[Store] updateUserStory 执行完成');
        return newState;
      });
    },

    deleteUserStory: (id: string) => {
      set(state => ({
        userStories: state.userStories.filter(story => story.id !== id),
        generatedContents: state.generatedContents.filter(content => content.storyId !== id)
      }));
    },

    generateContent: async (story: UserStory) => {
      console.log('🎯 [useAppStore] generateContent 被调用', {
        storyId: story.id,
        timestamp: new Date().toISOString()
      });
      
      const { generatedContents } = get();
      console.log('[Store] 当前生成内容数量:', generatedContents.length);
      
      console.log('[Store] 开始生成内容，设置加载状态');
      set({ isLoading: true, error: null });

      try {
        // 先清除该故事的所有旧语料内容
        console.log('[Store] 清除故事旧语料内容:', story.id);
        set(state => ({
          generatedContents: state.generatedContents.filter(content => content.storyId !== story.id)
        }));
        
        console.log('🚀 [Store] 准备调用 openaiGenerateContent API...', {
          storyId: story.id,
          category: story.category,
          storyDataKeys: Object.keys(story.storyData),
          timestamp: new Date().toISOString()
        });
        
        const result = await openaiGenerateContent(story);
        
        console.log('✅ [Store] openaiGenerateContent API 调用成功', {
          hasCommonContent: !!result.commonContent,
          hasNegativeCommonContent: !!result.negativeCommonContent,
          positiveSpecificCount: result.specificContents?.positive?.length || 0,
          negativeSpecificCount: result.specificContents?.negative?.length || 0,
          timestamp: new Date().toISOString()
        });
        
        console.log('📋 [Store] API 返回的详细结果:', {
          commonContentLength: result.commonContent?.length || 0,
          negativeCommonContentLength: result.negativeCommonContent?.length || 0,
          result: result
        });
        
        // 创建正向通用语料内容
        const positiveCommonContentItem: GeneratedContent = {
          id: generateId(),
          storyId: story.id,
          questionId: '',
          commonContent: result.commonContent, // 这是正向通用语料
          commonContentCn: result.commonContentCn || '', // 正向通用语料中文翻译
          specificContent: '',
          specificContentCn: '',
          translationSource: 'ai',
          type: 'general',
          sentiment: 'positive',
          generatedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          editHistory: []
        };
        
        // 创建负向通用语料内容（需要从API返回中获取）
        const negativeCommonContentItem: GeneratedContent = {
          id: generateId(),
          storyId: story.id,
          questionId: '',
          commonContent: result.negativeCommonContent || '', // 需要API返回负向通用语料
          commonContentCn: result.negativeCommonContentCn || '', // 负向通用语料中文翻译
          specificContent: '',
          specificContentCn: '',
          translationSource: 'ai',
          type: 'general',
          sentiment: 'negative',
          generatedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          editHistory: []
        };
        
        // 创建所有正向扣题语料
        const positiveSpecificItems: GeneratedContent[] = result.specificContents.positive.map(item => ({
          id: generateId(),
          storyId: story.id,
          questionId: item.questionId,
          commonContent: '',
          commonContentCn: '',
          specificContent: item.content,
          specificContentCn: item.contentCn || '', // 正向扣题语料中文翻译
          translationSource: 'ai',
          type: 'specific',
          sentiment: 'positive',
          generatedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          editHistory: []
        }));
        
        // 创建所有负向扣题语料
        const negativeSpecificItems: GeneratedContent[] = result.specificContents.negative.map(item => ({
          id: generateId(),
          storyId: story.id,
          questionId: item.questionId,
          commonContent: '',
          commonContentCn: '',
          specificContent: item.content,
          specificContentCn: item.contentCn || '', // 负向扣题语料中文翻译
          translationSource: 'ai',
          type: 'specific',
          sentiment: 'negative',
          generatedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          editHistory: []
        }));
        
        console.log('[Store] 准备保存的正向通用语料:', positiveCommonContentItem);
        console.log('[Store] 准备保存的负向通用语料:', negativeCommonContentItem);
        console.log('[Store] 准备保存的正向扣题语料数量:', positiveSpecificItems.length);
        console.log('[Store] 准备保存的负向扣题语料数量:', negativeSpecificItems.length);

        set(state => {
          const newGeneratedContents = [
            ...state.generatedContents,
            positiveCommonContentItem,
            negativeCommonContentItem,
            ...positiveSpecificItems,
            ...negativeSpecificItems
          ];
          const newState = {
            generatedContents: newGeneratedContents,
            isLoading: false
          };
          console.log('[Store] 保存后生成内容数量:', newState.generatedContents.length);
          return newState;
        });
        
        console.log('[Store] generateContent 执行成功');
      } catch (error) {
        console.error('[Store] generateContent 执行失败:', error);
        const errorMessage = error instanceof Error ? error.message : '生成内容时发生错误';
        console.error('[Store] 错误信息:', errorMessage);
        
        set({ 
          error: errorMessage,
          isLoading: false 
        });
      }
    },

    editContent: async (contentId: string, instruction: string) => {
      const { generatedContents } = get();
      const content = generatedContents.find(c => c.id === contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      try {
        set({ isLoading: true, error: null });
        
        const editedContent = await openaiEditContent(content.specificContent || content.commonContent, instruction);
        
        const editRecord = {
          id: generateId(),
          timestamp: new Date(),
          instruction,
          beforeContent: content.specificContent || content.commonContent,
          afterContent: editedContent
        };
        
        const updatedContent = {
          ...content,
          ...(content.specificContent ? { specificContent: editedContent } : { commonContent: editedContent }),
          updatedAt: new Date(),
          editHistory: [...(content.editHistory || []), editRecord]
        };
        
        const updatedContents = generatedContents.map(c => 
          c.id === contentId ? updatedContent : c
        );
        
        set({ 
          generatedContents: updatedContents,
          isLoading: false 
        });
      } catch (error) {
        console.error('编辑内容失败:', error);
        set({ 
          error: error instanceof Error ? error.message : '编辑内容失败',
          isLoading: false 
        });
        throw error;
      }
    },

    // 编辑翻译内容
    editTranslation: async (contentId: string, instruction: string, isCommon: boolean = true) => {
      const { generatedContents } = get();
      const content = generatedContents.find(c => c.id === contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      try {
        set({ isLoading: true, error: null });
        
        const originalTranslation = isCommon ? content.commonContentCn : content.specificContentCn;
         const editedTranslation = await openaiEditTranslation(originalTranslation || '', instruction);
        
        const editRecord = {
          id: generateId(),
          timestamp: new Date(),
          instruction: `翻译编辑: ${instruction}`,
          beforeContent: originalTranslation || '',
          afterContent: editedTranslation
        };
        
        const updatedContent = {
          ...content,
          ...(isCommon ? { commonContentCn: editedTranslation } : { specificContentCn: editedTranslation }),
          translationSource: 'manual' as const,
          updatedAt: new Date(),
          editHistory: [...(content.editHistory || []), editRecord]
        };
        
        const updatedContents = generatedContents.map(c => 
          c.id === contentId ? updatedContent : c
        );
        
        set({ 
          generatedContents: updatedContents,
          isLoading: false 
        });
      } catch (error) {
        console.error('编辑翻译失败:', error);
        set({ 
          error: error instanceof Error ? error.message : '编辑翻译失败',
          isLoading: false 
        });
        throw error;
      }
    },

    // 重新翻译内容
    retranslateContent: async (contentId: string, isCommon: boolean = true) => {
      const { generatedContents } = get();
      const content = generatedContents.find(c => c.id === contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      try {
        set({ isLoading: true, error: null });
        
        const originalContent = isCommon ? content.commonContent : content.specificContent;
         const newTranslation = await openaiRetranslateContent(originalContent);
        
        const editRecord = {
          id: generateId(),
          timestamp: new Date(),
          instruction: '重新翻译',
          beforeContent: isCommon ? content.commonContentCn || '' : content.specificContentCn || '',
          afterContent: newTranslation
        };
        
        const updatedContent = {
          ...content,
          ...(isCommon ? { commonContentCn: newTranslation } : { specificContentCn: newTranslation }),
          translationSource: 'ai' as const,
          updatedAt: new Date(),
          editHistory: [...(content.editHistory || []), editRecord]
        };
        
        const updatedContents = generatedContents.map(c => 
          c.id === contentId ? updatedContent : c
        );
        
        set({ 
          generatedContents: updatedContents,
          isLoading: false 
        });
      } catch (error) {
        console.error('重新翻译失败:', error);
        set({ 
          error: error instanceof Error ? error.message : '重新翻译失败',
          isLoading: false 
        });
        throw error;
      }
    },

    getStatistics: (): Statistics => {
      const { questions, userStories, generatedContents } = get();
      const questionsStats = getQuestionsStatistics();
      
      return {
        totalQuestions: questionsStats.total,
        questionsByCategory: questionsStats.byCategory,
        questionsBySentiment: questionsStats.bySentiment,
        generatedStories: userStories.length,
        generatedContents: generatedContents.length
      };
    },

    getQuestionsByCategory: (category: CategoryType) => {
      return getQuestionsByCategory(category);
    },

    clearError: () => {
      set({ error: null });
    },

    // 匹配度评估相关方法
    evaluateContentMatching: async (contentId: string, questionId?: string) => {
      const { generatedContents, userStories, evaluatingContents } = get();
      const content = generatedContents.find(c => c.id === contentId);
      
      if (!content || evaluatingContents.has(contentId)) {
        return; // 内容不存在或正在评估中
      }

      // 只评估通用语料
      if (content.type !== 'general' || !content.commonContent) {
        return;
      }

      try {
        // 标记为评估中
        set(state => ({
          evaluatingContents: new Set([...state.evaluatingContents, contentId])
        }));

        // 获取用户故事
        const story = userStories.find(s => s.id === content.storyId);
        if (!story) {
          throw new Error('未找到对应的用户故事');
        }

        // 获取题目（如果提供了questionId）
        let question: Question | undefined;
        if (questionId) {
          const questions = getQuestionsByCategory(story.category);
          question = questions.find((q: Question) => q.id === questionId);
        }

        // 调用AI评估
        const evaluationResult = await evaluateMatching(
          content.commonContent,
          question?.titleCn || '',
          story.category
        );
        
        // 构建完整的MatchingScore对象
        const matchingScore: MatchingScore = {
          questionId: questionId || '',
          score: evaluationResult.score,
          level: evaluationResult.level,
          reasons: [evaluationResult.reason],
          suggestions: [],
          lastEvaluated: new Date()
        };

        // 更新评估结果
        set(state => {
          const newEvaluations = new Map(state.matchingEvaluations);
          newEvaluations.set(contentId, matchingScore);
          
          const newEvaluatingContents = new Set(state.evaluatingContents);
          newEvaluatingContents.delete(contentId);
          
          // 同时更新GeneratedContent中的matchingScore字段
          const updatedContents = state.generatedContents.map(c => 
            c.id === contentId ? { ...c, matchingScore } : c
          );

          return {
            matchingEvaluations: newEvaluations,
            evaluatingContents: newEvaluatingContents,
            generatedContents: updatedContents
          };
        });

      } catch (error) {
        console.error('匹配度评估失败:', error);
        
        // 移除评估中标记
        set(state => {
          const newEvaluatingContents = new Set(state.evaluatingContents);
          newEvaluatingContents.delete(contentId);
          return { evaluatingContents: newEvaluatingContents };
        });
        
        // 不抛出错误，避免影响用户体验
      }
    },

    getMatchingScore: (contentId: string) => {
      const { matchingEvaluations } = get();
      return matchingEvaluations.get(contentId);
    },

    regenerateContent: async (contentId: string, customPrompt?: string, reason?: string) => {
      const { generatedContents, userStories, matchingEvaluations } = get();
      const content = generatedContents.find(c => c.id === contentId);
      
      if (!content || content.type !== 'general') {
        throw new Error('只能重新生成通用语料');
      }

      const story = userStories.find(s => s.id === content.storyId);
      if (!story) {
        throw new Error('未找到对应的用户故事');
      }

      // 获取题目标题，从匹配度评估中获取
      let targetQuestionTitle: string;
      {
        const matchingScore = matchingEvaluations.get(contentId) || content.matchingScore;
        if (matchingScore && matchingScore.questionId) {
          // 从题库中查找题目标题
          const questions = getQuestionsByCategory(story.category);
          const question = questions.find(q => q.id === matchingScore.questionId);
          targetQuestionTitle = question?.titleCn || '通用题目';
        } else {
          targetQuestionTitle = '通用题目';
        }
      }

      try {
        set({ isLoading: true, error: null });

        // 调用重新生成API
        const result = await regenerateCommonContent(story, content.sentiment, targetQuestionTitle, customPrompt);
        
        // 创建重生成记录
        const regenerationRecord: RegenerationRecord = {
          timestamp: new Date(),
          userPrompt: customPrompt || '',
          originalContent: content.commonContent,
          newContent: result.content,
          reason: reason || customPrompt || '用户手动重生成'
        };

        // 更新内容
        const updatedContent = {
          ...content,
          commonContent: result.content,
          commonContentCn: result.contentCn,
          translationSource: 'ai' as const,
          regenerationHistory: [...(content.regenerationHistory || []), regenerationRecord],
          updatedAt: new Date(),
          // 清除旧的匹配度评估
          matchingScore: undefined
        };

        set(state => {
          const updatedContents = state.generatedContents.map(c => 
            c.id === contentId ? updatedContent : c
          );
          
          // 清除缓存的匹配度评估
          const newEvaluations = new Map(state.matchingEvaluations);
          newEvaluations.delete(contentId);

          return {
            generatedContents: updatedContents,
            matchingEvaluations: newEvaluations,
            isLoading: false
          };
        });

      } catch (error) {
        console.error('重新生成内容失败:', error);
        set({ 
          error: error instanceof Error ? error.message : '重新生成内容失败',
          isLoading: false 
        });
        throw error;
      }
    },

    batchEvaluateMatching: async (contentIds: string[]) => {
      const { generatedContents } = get();
      
      // 过滤出需要评估的通用语料
      const validContentIds = contentIds.filter(id => {
        const content = generatedContents.find(c => c.id === id);
        return content && content.type === 'general' && content.commonContent;
      });

      // 并发评估，但限制并发数量避免API限制
      const batchSize = 3;
      for (let i = 0; i < validContentIds.length; i += batchSize) {
        const batch = validContentIds.slice(i, i + batchSize);
        await Promise.allSettled(
          batch.map(contentId => get().evaluateContentMatching(contentId))
        );
        
        // 批次间稍作延迟
        if (i + batchSize < validContentIds.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    },

    clearMatchingCache: () => {
      set(state => ({
        matchingEvaluations: new Map(),
        evaluatingContents: new Set(),
        generatedContents: state.generatedContents.map(c => ({
          ...c,
          matchingScore: undefined
        })),
        evaluationQueue: [],
        visibleContentIds: new Set()
      }));
    },

    // 懒加载和缓存优化方法
    setVisibleContents: (contentIds: string[]) => {
      const { visibleContentIds, evaluationQueue } = get();
      const newVisibleIds = new Set(contentIds);
      
      // 找出新可见的内容
      const newlyVisible = contentIds.filter(id => !visibleContentIds.has(id));
      
      set(state => ({
        visibleContentIds: newVisibleIds,
        evaluationQueue: [...new Set([...state.evaluationQueue, ...newlyVisible])]
      }));
      
      // 触发懒加载评估
      get().processEvaluationQueue();
    },

    pauseEvaluation: () => {
      set({ isEvaluationPaused: true });
    },

    resumeEvaluation: () => {
      set({ isEvaluationPaused: false });
      // 恢复时处理队列
      setTimeout(() => get().processEvaluationQueue(), 100);
    },

    processEvaluationQueue: async () => {
      const { 
        evaluationQueue, 
        isEvaluationPaused, 
        evaluatingContents, 
        matchingEvaluations,
        lastEvaluationTime,
        generatedContents
      } = get();
      
      // 如果暂停或队列为空，则不处理
      if (isEvaluationPaused || evaluationQueue.length === 0) {
        return;
      }
      
      // 限制评估频率，避免过于频繁的API调用
      const now = Date.now();
      const minInterval = 2000; // 最小间隔2秒
      if (now - lastEvaluationTime < minInterval) {
        setTimeout(() => get().processEvaluationQueue(), minInterval - (now - lastEvaluationTime));
        return;
      }
      
      // 过滤出需要评估的内容
      const validQueue = evaluationQueue.filter(contentId => {
        // 已经在评估中或已有评估结果的跳过
        if (evaluatingContents.has(contentId) || matchingEvaluations.has(contentId)) {
          return false;
        }
        
        // 检查内容是否存在且为通用语料
        const content = generatedContents.find(c => c.id === contentId);
        return content && content.type === 'general' && content.commonContent;
      });
      
      if (validQueue.length === 0) {
        set({ evaluationQueue: [] });
        return;
      }
      
      // 取队列中的第一个进行评估
      const contentId = validQueue[0];
      
      // 更新队列和时间戳
      set(state => ({
        evaluationQueue: state.evaluationQueue.filter(id => id !== contentId),
        lastEvaluationTime: now
      }));
      
      // 执行评估
      try {
        await get().evaluateContentMatching(contentId);
      } catch (error) {
        console.warn('懒加载评估失败:', error);
      }
      
      // 继续处理队列中的下一个（延迟执行）
      if (validQueue.length > 1) {
        setTimeout(() => get().processEvaluationQueue(), 1500);
      }
    },

    // 智能批量评估：优先评估可见内容
    smartBatchEvaluate: async () => {
      const { visibleContentIds, generatedContents, matchingEvaluations } = get();
      
      // 获取所有通用语料
      const generalContents = generatedContents.filter(c => 
        c.type === 'general' && c.commonContent && !matchingEvaluations.has(c.id)
      );
      
      if (generalContents.length === 0) return;
      
      // 按优先级排序：可见的优先，然后按创建时间倒序
      const sortedContents = generalContents.sort((a, b) => {
        const aVisible = visibleContentIds.has(a.id);
        const bVisible = visibleContentIds.has(b.id);
        
        if (aVisible && !bVisible) return -1;
        if (!aVisible && bVisible) return 1;
        
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      // 分批处理，优先处理可见内容
      const visibleContents = sortedContents.filter(c => visibleContentIds.has(c.id));
      const invisibleContents = sortedContents.filter(c => !visibleContentIds.has(c.id));
      
      // 先评估可见内容
      if (visibleContents.length > 0) {
        await get().batchEvaluateMatching(visibleContents.map(c => c.id));
      }
      
      // 然后评估不可见内容（低优先级）
      if (invisibleContents.length > 0) {
        // 延迟执行，避免阻塞用户交互
        setTimeout(async () => {
          if (!get().isEvaluationPaused) {
            await get().batchEvaluateMatching(invisibleContents.slice(0, 5).map(c => c.id));
          }
        }, 3000);
      }
    },

    // 预测性缓存：基于用户行为预加载
    preloadMatchingScores: async (categoryType?: CategoryType, sentiment?: 'positive' | 'negative') => {
      const { generatedContents, userStories } = get();
      
      // 根据条件筛选内容
      let targetContents = generatedContents.filter(c => c.type === 'general' && c.commonContent);
      
      if (categoryType) {
        const categoryStoryIds = userStories
          .filter(s => s.category === categoryType)
          .map(s => s.id);
        targetContents = targetContents.filter(c => categoryStoryIds.includes(c.storyId));
      }
      
      if (sentiment) {
        targetContents = targetContents.filter(c => c.sentiment === sentiment);
      }
      
      // 限制预加载数量，避免过多API调用
      const preloadIds = targetContents
        .slice(0, 10)
        .map(c => c.id);
      
      if (preloadIds.length > 0) {
        // 添加到评估队列，低优先级处理
        set(state => ({
          evaluationQueue: [...new Set([...state.evaluationQueue, ...preloadIds])]
        }));
        
        // 延迟处理预加载
        setTimeout(() => {
          if (!get().isEvaluationPaused) {
            get().processEvaluationQueue();
          }
        }, 5000);
      }
    }
  }),
  {
    name: 'ielts-assistant-storage', // localStorage key
    partialize: (state) => ({
      currentSeason: state.currentSeason,
      userStories: state.userStories,
      generatedContents: state.generatedContents
    }), // 只持久化这些状态，不包括 isLoading 和 error
    onRehydrateStorage: () => (state) => {
      if (state?.userStories) {
        // 数据迁移：确保所有用户故事都使用新的双情绪格式
        state.userStories = migrateUserStories(state.userStories);
        console.log('[Store] 数据迁移完成，用户故事数量:', state.userStories.length);
      }
    },
  }
));

// 选择器函数，用于组件中获取特定状态
export const useCurrentSeason = () => useAppStore(state => state.currentSeason);
export const useQuestions = () => useAppStore(state => state.questions);
export const useUserStories = () => useAppStore(state => state.userStories);
export const useGeneratedContents = () => useAppStore(state => state.generatedContents);
export const useIsLoading = () => useAppStore(state => state.isLoading);
export const useError = () => useAppStore(state => state.error);
export const useStatistics = () => {
  const { questions, userStories, generatedContents } = useAppStore();
  const questionsStats = getQuestionsStatistics();
  
  return {
    totalQuestions: questionsStats.total,
    questionsByCategory: questionsStats.byCategory,
    questionsBySentiment: questionsStats.bySentiment,
    generatedStories: userStories.length,
    generatedContents: generatedContents.length
  };
};

// 操作函数选择器 - 使用浅比较避免无限循环
export const useAppActions = () => {
  const setCurrentSeason = useAppStore(state => state.setCurrentSeason);
  const addUserStory = useAppStore(state => state.addUserStory);
  const updateUserStory = useAppStore(state => state.updateUserStory);
  const deleteUserStory = useAppStore(state => state.deleteUserStory);
  const generateContent = useAppStore(state => state.generateContent);
  const editContent = useAppStore(state => state.editContent);
  const getQuestionsByCategory = useAppStore(state => state.getQuestionsByCategory);
  const clearError = useAppStore(state => state.clearError);
  
  return {
    setCurrentSeason,
    addUserStory,
    updateUserStory,
    deleteUserStory,
    generateContent,
    editContent,
    getQuestionsByCategory,
    clearError
  };
};