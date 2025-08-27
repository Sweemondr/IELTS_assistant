// 雅思串题助手 - 语料历史页面
import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Smile, Frown, List } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { CategoryType, SentimentType, GeneratedContent } from '../types';
import { CATEGORIES } from '../data/categories';
import { QUESTIONS_2025_5_8 } from '../data/questions';
import ContentCard from '../components/ContentCard';


const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    generatedContents, 
    userStories,
    editContent,
    editTranslation,
    retranslateContent,
    evaluateContentMatching,
    getMatchingScore,
    regenerateContent,
    evaluatingContents,
    setVisibleContents,
    smartBatchEvaluate,
    preloadMatchingScores,
    pauseEvaluation,
    resumeEvaluation
  } = useAppStore();
  
  const [categoryFilter, setCategoryFilter] = useState<'all' | CategoryType>('all');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | SentimentType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // 懒加载相关状态
  const observerRef = useRef<IntersectionObserver | null>(null);
  const contentRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [visibleContentIds, setVisibleContentIds] = useState<Set<string>>(new Set());
  const lastEvaluationTrigger = useRef<number>(0);

  // 获取筛选后的内容
  const filteredContents = useMemo(() => {
    let filtered = generatedContents;
    
    // 按类别筛选
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(content => {
        const story = userStories.find(s => s.id === content.storyId);
        return story?.category === categoryFilter;
      });
    }
    
    // 按情绪筛选
    if (sentimentFilter !== 'all') {
      filtered = filtered.filter(content => content.sentiment === sentimentFilter);
    }
    
    // 按搜索关键词筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(content => {
        // 搜索通用语料内容
        const commonMatch = content.commonContent?.toLowerCase().includes(query);
        // 搜索扣题语料内容
        const specificMatch = content.specificContent?.toLowerCase().includes(query);
        // 搜索翻译内容
        const translationMatch = content.commonContentCn?.toLowerCase().includes(query) ||
          content.specificContentCn?.toLowerCase().includes(query);
        
        // 搜索题目标题（支持模糊检索）
        let questionTitleMatch = false;
        if (content.questionId) {
          const question = QUESTIONS_2025_5_8.find(q => q.id === content.questionId);
          if (question) {
            questionTitleMatch = question.titleCn?.toLowerCase().includes(query) ||
                               question.titleFullCn?.toLowerCase().includes(query) ||
                               question.titleEn?.toLowerCase().includes(query) ||
                               question.keywords?.some(keyword => keyword.toLowerCase().includes(query)) || false;
          }
        }
        
        // 搜索题目内容（在正面和负面故事数据中搜索）
        const story = userStories.find(s => s.id === content.storyId);
        const topicMatch = story?.storyData ? (
          Object.values(story.storyData.positive || {}).some(value => 
            value?.toLowerCase().includes(query)
          ) ||
          Object.values(story.storyData.negative || {}).some(value => 
            value?.toLowerCase().includes(query)
          )
        ) : false;
        
        return commonMatch || specificMatch || translationMatch || questionTitleMatch || topicMatch;
      });
    }
    
    // 按时间排序（最新的在前）
    filtered = [...filtered].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return filtered;
  }, [generatedContents, userStories, categoryFilter, sentimentFilter, searchQuery]);

  // 计算基于类别筛选后的统计信息
  const categoryFilteredContents = useMemo(() => {
    return generatedContents.filter(content => {
      const story = userStories.find(s => s.id === content.storyId);
      if (categoryFilter === 'all') return true;
      return story?.category === categoryFilter;
    });
  }, [generatedContents, userStories, categoryFilter]);

  // 统计各类别和情绪的语料数量（基于类别筛选后的结果）
  const contentStats = useMemo(() => {
    return {
      all: categoryFilteredContents.length,
      positive: categoryFilteredContents.filter(c => c.sentiment === 'positive').length,
      negative: categoryFilteredContents.filter(c => c.sentiment === 'negative').length,
      categories: CATEGORIES.reduce((acc, category) => {
        const count = categoryFilteredContents.filter(content => {
          const story = userStories.find(s => s.id === content.storyId);
          return story?.category === category.id;
        }).length;
        acc[category.id] = count;
        return acc;
      }, {} as Record<CategoryType, number>)
    };
  }, [categoryFilteredContents, userStories]);

  // Intersection Observer回调函数
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const newVisibleIds = new Set(visibleContentIds);
    let hasChanges = false;
    
    entries.forEach(entry => {
      const contentId = entry.target.getAttribute('data-content-id');
      if (!contentId) return;
      
      if (entry.isIntersecting) {
        if (!newVisibleIds.has(contentId)) {
          newVisibleIds.add(contentId);
          hasChanges = true;
        }
      } else {
        if (newVisibleIds.has(contentId)) {
          newVisibleIds.delete(contentId);
          hasChanges = true;
        }
      }
    });
    
    if (hasChanges) {
      setVisibleContentIds(newVisibleIds);
      
      // 更新store中的可见内容
      const visibleIds = Array.from(newVisibleIds);
      setVisibleContents(visibleIds);
      
      // 节流触发智能评估
      const now = Date.now();
      if (now - lastEvaluationTrigger.current > 3000) { // 3秒节流
        lastEvaluationTrigger.current = now;
        setTimeout(() => {
          smartBatchEvaluate();
        }, 500); // 延迟500ms执行
      }
    }
  }, [visibleContentIds, setVisibleContents, smartBatchEvaluate]);
  
  // 注册内容元素到Intersection Observer
  const registerContentRef = useCallback((contentId: string, element: HTMLElement | null) => {
    if (!element) {
      // 清理引用
      const oldElement = contentRefs.current.get(contentId);
      if (oldElement && observerRef.current) {
        observerRef.current.unobserve(oldElement);
      }
      contentRefs.current.delete(contentId);
      return;
    }
    
    // 设置data属性用于识别
    element.setAttribute('data-content-id', contentId);
    
    // 保存引用
    contentRefs.current.set(contentId, element);
    
    // 开始观察
    if (observerRef.current) {
      observerRef.current.observe(element);
    }
  }, []);
  
  // 初始化Intersection Observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '50px', // 提前50px开始加载
      threshold: 0.1 // 10%可见时触发
    });
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection]);
  
  // 页面可见性变化处理
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseEvaluation();
      } else {
        resumeEvaluation();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pauseEvaluation, resumeEvaluation]);

  // 复制内容到剪贴板
  const handleCopyContent = async (content: string, contentId: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(contentId);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('❌ [HistoryPage] 复制失败', err);
    }
  };

  // 复制中文翻译
  const handleCopyTranslation = async (content: string, contentId: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(contentId);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('❌ [HistoryPage] 复制中文翻译失败', err);
    }
  };

  // 复制中英对照
  const handleCopyBoth = async (englishContent: string, chineseContent: string, contentId: string): Promise<void> => {
    try {
      const bothContent = `英文：\n${englishContent}\n\n中文：\n${chineseContent}`;
      await navigator.clipboard.writeText(bothContent);
      setCopySuccess(contentId);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('❌ [HistoryPage] 复制中英对照失败', err);
    }
  };

  // 编辑翻译
  const handleEditTranslation = async (contentId: string, instruction: string, isCommon?: boolean): Promise<void> => {
    try {
      await editTranslation(contentId, instruction, isCommon);
    } catch (error) {
      console.error('❌ [HistoryPage] 编辑翻译失败', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setErrorMessage(`编辑翻译失败: ${errorMessage}`);
    }
  };

  // 重新翻译
  const handleRetranslate = async (contentId: string, isCommon?: boolean): Promise<void> => {
    try {
      await retranslateContent(contentId, isCommon);
    } catch (error) {
      console.error('❌ [HistoryPage] 重新翻译失败', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setErrorMessage(`重新翻译失败: ${errorMessage}`);
    }
  };

  // 评估匹配度
  const handleEvaluateMatching = async (contentId: string): Promise<void> => {
    try {
      const content = generatedContents.find(c => c.id === contentId);
      if (!content || !content.commonContent) {
        console.warn('❌ [HistoryPage] 无法找到通用语料内容', { contentId });
        return;
      }
      
      const story = userStories.find(s => s.id === content.storyId);
      if (!story) {
        console.warn('❌ [HistoryPage] 无法找到对应的用户故事', { contentId, storyId: content.storyId });
        return;
      }
      
      await evaluateContentMatching(contentId);
    } catch (error) {
      console.error('❌ [HistoryPage] 评估匹配度失败', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setErrorMessage(`评估匹配度失败: ${errorMessage}`);
    }
  };

  // 重生成语料
  const handleRegenerateContent = async (contentId: string, customPrompt?: string): Promise<void> => {
    try {
      const content = generatedContents.find(c => c.id === contentId);
      if (!content) {
        console.warn('❌ [HistoryPage] 无法找到语料内容', { contentId });
        return;
      }
      
      const story = userStories.find(s => s.id === content.storyId);
      if (!story) {
        console.warn('❌ [HistoryPage] 无法找到对应的用户故事', { contentId, storyId: content.storyId });
        return;
      }
      
      await regenerateContent(contentId, customPrompt);
    } catch (error) {
      console.error('❌ [HistoryPage] 重生成语料失败', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setErrorMessage(`重生成语料失败: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>返回首页</span>
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">语料历史</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        {/* 筛选控件 */}
        <div className="mb-6 space-y-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="输入题目检索对应语料"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 筛选器 */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 类别筛选 */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter size={16} className="inline mr-1" />
                按类别筛选
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as 'all' | CategoryType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">全部类别 ({contentStats.all})</option>
                {CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({contentStats.categories[category.id] || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* 情绪筛选 */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <List size={16} className="inline mr-1" />
                按情绪筛选
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSentimentFilter('all')}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                    sentimentFilter === 'all'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  全部 ({contentStats.all})
                </button>
                <button
                  onClick={() => setSentimentFilter('positive')}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors flex items-center justify-center space-x-1 ${
                    sentimentFilter === 'positive'
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Smile size={16} />
                  <span>正面 ({contentStats.positive})</span>
                </button>
                <button
                  onClick={() => setSentimentFilter('negative')}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors flex items-center justify-center space-x-1 ${
                    sentimentFilter === 'negative'
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Frown size={16} />
                  <span>负面 ({contentStats.negative})</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 筛选标签展示区域 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">当前筛选条件</h3>
            <div className="text-sm text-gray-500">
              共 {filteredContents.length} 条语料
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* 类别标签 */}
            {categoryFilter !== 'all' && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {CATEGORIES.find(c => c.id === categoryFilter)?.name || '未知类别'}
              </span>
            )}
            
            {/* 情绪标签 */}
            {sentimentFilter !== 'all' && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                sentimentFilter === 'positive' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {sentimentFilter === 'positive' ? (
                  <><Smile size={12} /><span>正面</span></>
                ) : (
                  <><Frown size={12} /><span>负面</span></>
                )}
              </span>
            )}
            
            {/* 搜索关键词标签 */}
            {searchQuery && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                搜索: {searchQuery}
              </span>
            )}
            
            {/* 无筛选条件时的提示 */}
            {categoryFilter === 'all' && sentimentFilter === 'all' && !searchQuery && (
              <span className="text-sm text-gray-500">显示全部语料</span>
            )}
          </div>
        </div>

        {/* 错误提示 */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage(null)}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              关闭
            </button>
          </div>
        )}

        {/* 语料列表 */}
        <div className="space-y-6">
          {filteredContents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <List size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无语料</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || categoryFilter !== 'all' || sentimentFilter !== 'all'
                  ? '没有找到符合筛选条件的语料'
                  : '还没有创建任何语料，去创建第一个吧！'
                }
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                开始创建
              </button>
            </div>
          ) : (
            filteredContents.map((content) => {
              const story = userStories.find(s => s.id === content.storyId);
              const category = CATEGORIES.find(c => c.id === story?.category);
              
              return (
                <div key={content.id} ref={(el) => registerContentRef(content.id, el)}>
                  {/* 根据语料类型显示对应内容 */}
                  {content.type === 'general' ? (
                    /* 通用语料 */
                    <ContentCard
                      content={content}
                      onCopy={(text, contentId) => handleCopyContent(text, contentId)}
                      onCopyTranslation={(text, contentId) => handleCopyTranslation(text, contentId)}
                      onCopyBoth={(en, zh, contentId) => handleCopyBoth(en, zh, contentId)}
                      onEditTranslation={async (contentId, instruction) => {
                        await handleEditTranslation(contentId, instruction, true);
                      }}
                      onRetranslate={async (contentId) => {
                        await handleRetranslate(contentId, true);
                      }}
                      copySuccess={copySuccess === content.id}
                      matchingScore={getMatchingScore(content.id)}
                      onEvaluateMatching={() => handleEvaluateMatching(content.id)}
                      isEvaluating={evaluatingContents.has(content.id)}
                      onRegenerateContent={(contentId, customPrompt) => handleRegenerateContent(contentId, customPrompt)}
                      categoryName={category?.name}
                      categoryId={category?.id}
                    />
                  ) : (
                    /* 扣题语料 */
                    <div>
                      {/* 显示对应的题目标题 */}
                      {content.questionId && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <h4 className="text-sm font-medium text-blue-800 mb-2">对应题目：</h4>
                          <div className="space-y-2">
                            {(() => {
                              const question = QUESTIONS_2025_5_8.find(q => q.id === content.questionId);
                              return (
                                <div className="text-sm text-blue-700">
                                  <span className="font-medium">{question?.titleCn || '未知题目'}</span>
                                  {question?.titleFullCn && (
                                    <div className="text-xs text-gray-600 mt-1">
                                      {question.titleFullCn}
                                    </div>
                                  )}
                                </div>
                              );
                            })()} 
                          </div>
                        </div>
                      )}
                      
                      <ContentCard
                        content={content}
                        onCopy={(text, contentId) => handleCopyContent(text, contentId)}
                        onCopyTranslation={(text, contentId) => handleCopyTranslation(text, contentId)}
                        onCopyBoth={(en, zh, contentId) => handleCopyBoth(en, zh, contentId)}
                        onEditTranslation={async (contentId, instruction) => {
                          await handleEditTranslation(contentId, instruction, false);
                        }}
                        onRetranslate={async (contentId) => {
                          await handleRetranslate(contentId, false);
                        }}
                        copySuccess={copySuccess === content.id}
                        matchingScore={getMatchingScore(content.id)}
                        onEvaluateMatching={() => handleEvaluateMatching(content.id)}
                        isEvaluating={evaluatingContents.has(content.id)}
                        onRegenerateContent={(contentId, customPrompt) => handleRegenerateContent(contentId, customPrompt)}
                        categoryName={category?.name}
                        categoryId={category?.id}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;