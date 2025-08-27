// 雅思串题助手 - AI语料生成页面
import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Smile, Frown, List, Search } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { CategoryType, SentimentType, GeneratedContent, MatchingScore } from '../types';
import { CATEGORIES } from '../data/categories';
import { QUESTIONS_2025_5_8 as QUESTIONS } from '../data/questions';
import ContentCard from '../components/ContentCard';
import TopicContentList from '../components/TopicContentList';

const GeneratePage: React.FC = () => {
  const { type } = useParams<{ type: CategoryType }>();
  const navigate = useNavigate();
  const { 
    userStories, 
    generatedContents, 
    generateContent, 
    editContent,
    isLoading,
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
  
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [sentimentFilter, setSentimentFilter] = useState<'all' | SentimentType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  

  
  // 懒加载相关状态
  const observerRef = useRef<IntersectionObserver | null>(null);
  const contentRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [visibleContentIds, setVisibleContentIds] = useState<Set<string>>(new Set());
  const lastEvaluationTrigger = useRef<number>(0);

  // 获取当前类别信息
  const currentCategory = CATEGORIES.find(cat => cat.id === type);
  
  // 获取当前类别的用户故事
  const currentStory = userStories.find(story => story.category === type);
  
  // 获取当前类别的生成内容
  const currentContents = generatedContents.filter(content => {
    const story = userStories.find(s => s.id === content.storyId);
    return story?.category === type;
  });

  // 按情绪筛选内容的函数
  const filterContentsBySentiment = (contents: GeneratedContent[], sentiment: 'all' | SentimentType): GeneratedContent[] => {
    if (sentiment === 'all') return contents;
    return contents.filter(content => content.sentiment === sentiment);
  };

  // 获取筛选后的内容
  const filteredContents = useMemo(() => {
    let filtered = currentContents;
    
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
        
        return commonMatch || specificMatch || translationMatch;
      });
    }
    
    // 按时间排序（最新的在前）
    filtered = [...filtered].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return filtered;
  }, [currentContents, sentimentFilter, searchQuery]);
  
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

  // 统计各情绪类别的语料数量
  const contentStats = {
    all: currentContents.length,
    positive: currentContents.filter(c => c.sentiment === 'positive').length,
    negative: currentContents.filter(c => c.sentiment === 'negative').length
  };

  useEffect(() => {
    // 如果类别不存在，重定向到首页
    if (!currentCategory) {
      navigate('/');
      return;
    }
    
    // 如果没有用户故事，重定向到故事填写页面
    if (!currentStory) {
      navigate(`/category/${type}`);
      return;
    }
    
    // 如果没有生成内容，自动生成
    if (currentContents.length === 0 && !isLoading) {
      handleGenerateContent();
    }
    
    // 预加载当前类别的匹配度评估
    if (currentContents.length > 0 && type) {
      preloadMatchingScores(type as CategoryType);
    }
  }, [type, currentCategory, currentStory, currentContents.length, isLoading, preloadMatchingScores]);
  
  // 内容变化时触发智能评估
  useEffect(() => {
    if (currentContents.length > 0) {
      // 延迟触发，避免阻塞渲染
      const timer = setTimeout(() => {
        smartBatchEvaluate();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [currentContents.length, smartBatchEvaluate]);

  // 生成语料内容
  const handleGenerateContent = async () => {
    if (!currentStory) {
      console.warn('🚨 [GeneratePage] handleGenerateContent: 没有当前故事数据');
      return;
    }
    
    console.log('🎯 [GeneratePage] 开始生成语料', {
      storyId: currentStory.id,
      category: type,
      retryCount,
      timestamp: new Date().toISOString()
    });
    
    setErrorMessage(null);
    
    try {
      console.log('🔄 [GeneratePage] 调用新的批量生成 generateContent...');
      await generateContent(currentStory);
      console.log('✅ [GeneratePage] 语料生成成功', {
        storyId: currentStory.id,
        category: type,
        retryCount
      });
      setRetryCount(0); // 成功后重置重试次数
    } catch (error) {
      console.error('❌ [GeneratePage] 生成语料失败', {
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        storyId: currentStory.id,
        category: type,
        retryCount,
        timestamp: new Date().toISOString()
      });
      
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setErrorMessage(`生成语料失败: ${errorMessage}，请检查网络连接或稍后重试`);
    }
  };

  // 重试生成语料
  const handleRetryGenerate = async () => {
    setRetryCount(prev => prev + 1);
    await handleGenerateContent();
  };

  // 复制内容到剪贴板
  const handleCopyContent = async (content: string, contentId: string): Promise<void> => {
    console.log('📋 [GeneratePage] 开始复制内容', {
      contentId,
      contentLength: content.length,
      contentPreview: content.substring(0, 50) + '...',
      timestamp: new Date().toISOString()
    });
    
    try {
      await navigator.clipboard.writeText(content);
      console.log('✅ [GeneratePage] 内容复制成功', {
        contentId,
        contentLength: content.length
      });
      setCopySuccess(contentId);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('❌ [GeneratePage] 复制失败', {
        error: err instanceof Error ? err.message : String(err),
        errorStack: err instanceof Error ? err.stack : undefined,
        contentId,
        contentLength: content.length,
        timestamp: new Date().toISOString()
      });
    }
  };

  // 复制中文翻译
  const handleCopyTranslation = async (content: string, contentId: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(contentId);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('❌ [GeneratePage] 复制中文翻译失败', err);
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
      console.error('❌ [GeneratePage] 复制中英对照失败', err);
    }
  };

  // 编辑翻译
  const handleEditTranslation = async (contentId: string, instruction: string, isCommon?: boolean): Promise<void> => {
    try {
      await editTranslation(contentId, instruction, isCommon);
    } catch (error) {
      console.error('❌ [GeneratePage] 编辑翻译失败', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setErrorMessage(`编辑翻译失败: ${errorMessage}`);
    }
  };

  // 重新翻译
  const handleRetranslate = async (contentId: string, isCommon?: boolean): Promise<void> => {
    try {
      await retranslateContent(contentId, isCommon);
    } catch (error) {
      console.error('❌ [GeneratePage] 重新翻译失败', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setErrorMessage(`重新翻译失败: ${errorMessage}`);
    }
  };

  // 评估匹配度
  const handleEvaluateMatching = async (contentId: string): Promise<void> => {
    try {
      const content = generatedContents.find(c => c.id === contentId);
      if (!content || !content.commonContent) {
        console.warn('❌ [GeneratePage] 无法找到通用语料内容', { contentId });
        return;
      }
      
      const story = userStories.find(s => s.id === content.storyId);
      if (!story) {
        console.warn('❌ [GeneratePage] 无法找到对应的用户故事', { contentId, storyId: content.storyId });
        return;
      }
      
      await evaluateContentMatching(contentId);
    } catch (error) {
      console.error('❌ [GeneratePage] 评估匹配度失败', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setErrorMessage(`评估匹配度失败: ${errorMessage}`);
    }
  };

  // 重生成语料
  const handleRegenerateContent = async (contentId: string, customPrompt?: string): Promise<void> => {
    try {
      const content = generatedContents.find(c => c.id === contentId);
      if (!content) {
        console.warn('❌ [GeneratePage] 无法找到语料内容', { contentId });
        return;
      }
      
      const story = userStories.find(s => s.id === content.storyId);
      if (!story) {
        console.warn('❌ [GeneratePage] 无法找到对应的用户故事', { contentId, storyId: content.storyId });
        return;
      }
      
      await regenerateContent(contentId, customPrompt);
    } catch (error) {
      console.error('❌ [GeneratePage] 重生成语料失败', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setErrorMessage(`重生成语料失败: ${errorMessage}`);
    }
  };

  // 开始编辑内容
  // const handleStartEdit = (content: any) => {
  //   setEditingContentId(content.id);
  //   setEditingText(content.content);
  // };

  // 保存编辑内容
  const handleSaveEdit = async (contentId: string, newContent: string) => {
    console.log('📝 [GeneratePage] 开始保存编辑内容', {
      contentId,
      newContentLength: newContent.length,
      newContentPreview: newContent.substring(0, 50) + '...',
      timestamp: new Date().toISOString()
    });
    
    try {
      await editContent(contentId, newContent);
      console.log('✅ [GeneratePage] 编辑内容保存成功', {
        contentId,
        newContentLength: newContent.length
      });
      setEditingContentId(null);
      setEditingText('');
      setErrorMessage(null);
    } catch (error) {
      console.error('❌ [GeneratePage] 保存编辑失败', {
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        contentId,
        newContentLength: newContent.length,
        timestamp: new Date().toISOString()
      });
      
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setErrorMessage(`保存失败: ${errorMessage}，请稍后重试`);
      throw error;
    }
  };

  // 取消编辑
  // const handleCancelEdit = () => {
  //   setEditingContentId(null);
  //   setEditingText('');
  // };

  if (!currentCategory || !currentStory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 头部导航 */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/category/${type}`)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors p-2 -ml-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">返回</span>
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  {currentCategory.nameCn}题型语料生成
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  生成个性化雅思口语语料
                </p>
              </div>
            </div>
            <button
              onClick={handleGenerateContent}
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? '生成中...' : '重新生成'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">


        {/* 筛选和排序控制面板 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">语料内容</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>共 {contentStats.all} 条语料</span>
            </div>
          </div>
          
          {/* 情绪筛选标签 */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">按情绪筛选</h4>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setSentimentFilter('all')}
                className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-all duration-200 min-w-0 flex-1 sm:flex-none ${
                  sentimentFilter === 'all'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-sm'
                }`}
              >
                <List className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">全部 ({contentStats.all})</span>
              </button>
              <button
                onClick={() => setSentimentFilter('positive')}
                className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-all duration-200 min-w-0 flex-1 sm:flex-none ${
                  sentimentFilter === 'positive'
                    ? 'bg-green-100 text-green-700 border border-green-200 shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-sm'
                }`}
              >
                <Smile className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">正面语料 ({contentStats.positive})</span>
              </button>
              <button
                onClick={() => setSentimentFilter('negative')}
                className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-all duration-200 min-w-0 flex-1 sm:flex-none ${
                  sentimentFilter === 'negative'
                    ? 'bg-red-100 text-red-700 border border-red-200 shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-sm'
                }`}
              >
                <Frown className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">负面语料 ({contentStats.negative})</span>
              </button>
            </div>
          </div>
          
          {/* 搜索 */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">搜索语料</h4>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="输入题目检索对应语料"
                className="w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="text-red-600">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-red-800 font-medium">{errorMessage}</p>
              </div>
              <div className="flex items-center space-x-2">
                {retryCount < 3 && (
                  <button
                    onClick={handleRetryGenerate}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-800 font-medium text-sm disabled:opacity-50"
                  >
                    重试 {retryCount > 0 && `(${retryCount}/3)`}
                  </button>
                )}
                <button
                  onClick={() => setErrorMessage(null)}
                  className="text-red-400 hover:text-red-600"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 生成的语料内容 */}
        <div className="space-y-8">
          {/* 生成新语料按钮 */}
          <div className="flex justify-center px-4">
            <button
              onClick={handleGenerateContent}
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 w-full sm:w-auto max-w-xs"
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-sm sm:text-base">{isLoading ? '生成中...' : '生成新语料'}</span>
              {isLoading && (
                <div className="ml-2 flex space-x-1">
                  <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              )}
            </button>
          </div>

          {isLoading && currentContents.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI正在生成语料...</h3>
              <p className="text-gray-600 mb-4">请稍候，我们正在为您生成个性化的雅思口语语料</p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span>预计需要 30-60 秒</span>
              </div>
            </div>
          )}

          {/* 通用语料和扣题语料分类展示 */}
          <div className="space-y-8">
            {/* 通用语料部分 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">通用语料</h2>
                <p className="text-sm text-gray-600">适用于多个相关话题的通用表达</p>
              </div>
            </div>
            <div className="space-y-4">
              {filteredContents.filter(content => content.commonContent).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {sentimentFilter === 'all' ? '暂无通用语料' : `暂无${sentimentFilter === 'positive' ? '正面' : '负面'}通用语料`}
                </div>
              ) : (
                filteredContents
                  .filter(content => content.commonContent)
                  .map((content) => {
                    const matchingScore = getMatchingScore(content.id);
                    const isEvaluating = evaluatingContents.has(content.id);
                    
                    return (
                      <div
                        key={content.id}
                        ref={(el) => registerContentRef(content.id, el)}
                      >
                        <ContentCard
                          content={content}
                          onEdit={(contentId, newContent) => handleSaveEdit(contentId, newContent)}
                          onEditTranslation={handleEditTranslation}
                          onRetranslate={handleRetranslate}
                          onCopy={(contentText, contentId) => handleCopyContent(contentText, contentId)}
                          onCopyTranslation={handleCopyTranslation}
                          onCopyBoth={handleCopyBoth}
                          isEditing={editingContentId === content.id}
                          onStartEdit={(content) => {
                            setEditingContentId(content.id);
                            setEditingText(content.commonContent || '');
                          }}
                          onCancelEdit={() => {
                            setEditingContentId(null);
                            setEditingText('');
                          }}
                          editingText={editingText}
                          onEditingTextChange={setEditingText}
                          copySuccess={copySuccess === content.id}
                          matchingScore={matchingScore}
                          isEvaluating={isEvaluating}
                          onEvaluateMatching={handleEvaluateMatching}
                          onRegenerateContent={handleRegenerateContent}
                        />
                      </div>
                    );
                  })
              )}
            </div>
          </div>

            {/* 扣题语料部分 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H15a1 1 0 110 2h-2.47l-.56 2.242a1 1 0 11-1.94-.485L10.47 14H7.53l-.56 2.242a1 1 0 11-1.94-.485L5.47 14H3a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM9.03 8l-1 4h2.94l1-4H9.03z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">扣题语料</h2>
                  <p className="text-sm text-gray-600">针对具体题目的定制化表达</p>
                </div>
              </div>
              <TopicContentList
                  contents={filteredContents}
                  questions={QUESTIONS.filter(q => q.category === type)}
                  onEdit={handleSaveEdit}
                  onEditTranslation={handleEditTranslation}
                  onRetranslate={handleRetranslate}
                  onCopy={handleCopyContent}
                  onCopyTranslation={handleCopyTranslation}
                  onCopyBoth={handleCopyBoth}
                  copySuccess={copySuccess}
                  getMatchingScore={getMatchingScore}
                  isEvaluating={(contentId) => evaluatingContents.has(contentId)}
                  onEvaluateMatching={handleEvaluateMatching}
                  onRegenerateContent={handleRegenerateContent}
                  registerContentRef={registerContentRef}
                />
            </div>
          </div>

          {/* 空状态 */}
          {!isLoading && currentContents.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8 text-center mx-4 sm:mx-0">
              <div className="text-gray-400 mb-4">
                <RefreshCw className="h-10 w-10 sm:h-12 sm:w-12 mx-auto" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">暂无语料内容</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto">点击下方按钮开始生成个性化的雅思口语语料</p>
              <button
                onClick={handleGenerateContent}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors w-full sm:w-auto max-w-xs mx-auto flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>生成语料</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneratePage;