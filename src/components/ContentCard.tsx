// 雅思串题助手 - 通用语料展示卡片组件
import React, { useState } from 'react';
import { Copy, Edit3, Save, X, Check, Smile, Frown, Languages, RotateCcw, RefreshCw } from 'lucide-react';
import { GeneratedContent, MatchingScore } from '../types';
import { getWordCount } from '../utils/wordCount';


interface ContentCardProps {
  content: GeneratedContent;
  onEdit?: (contentId: string, newContent: string) => Promise<void>;
  onEditTranslation?: (contentId: string, instruction: string, isCommon?: boolean) => Promise<void>;
  onRetranslate?: (contentId: string, isCommon?: boolean) => Promise<void>;
  onCopy?: (content: string, contentId: string) => Promise<void>;
  onCopyTranslation?: (content: string, contentId: string) => Promise<void>;
  onCopyBoth?: (englishContent: string, chineseContent: string, contentId: string) => Promise<void>;
  isEditing?: boolean;
  onStartEdit?: (content: GeneratedContent) => void;
  onCancelEdit?: () => void;
  editingText?: string;
  onEditingTextChange?: (text: string) => void;
  copySuccess?: boolean;
  // 匹配度相关
  matchingScore?: MatchingScore;
  isEvaluating?: boolean;
  onEvaluateMatching?: (contentId: string, questionId?: string) => Promise<void>;
  onRegenerateContent?: (contentId: string, customPrompt?: string) => Promise<void>;
  // 类别信息
  categoryName?: string;
  categoryId?: string;
}

const ContentCard: React.FC<ContentCardProps> = ({
  content,
  onEdit,
  onEditTranslation,
  onRetranslate,
  onCopy,
  onCopyTranslation,
  onCopyBoth,
  isEditing = false,
  onStartEdit,
  onCancelEdit,
  editingText = '',
  onEditingTextChange,
  copySuccess = false,
  matchingScore,
  isEvaluating = false,
  onEvaluateMatching,
  onRegenerateContent,
  categoryName,
  categoryId
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showChinese, setShowChinese] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // 处理保存编辑
  const handleSaveEdit = async () => {
    if (!onEdit || !editingText.trim()) return;
    
    setIsLoading(true);
    try {
      await onEdit(content.id, editingText);
    } catch (error) {
      console.error('保存编辑失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 智能复制内容 - 根据当前显示的语言状态决定复制内容
  const handleSmartCopy = async () => {
    try {
      if (showChinese && (content.commonContentCn || content.specificContentCn)) {
        // 当前显示中文，复制中文内容
        if (onCopyTranslation) {
          const translationContent = content.commonContentCn || content.specificContentCn || '';
          await onCopyTranslation(translationContent, content.id);
        }
      } else {
        // 当前显示英文，复制英文内容
        if (onCopy) {
          await onCopy(content.commonContent || content.specificContent, content.id);
        }
      }
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 重新翻译
  const handleRetranslate = async () => {
    if (onRetranslate) {
      setIsTranslating(true);
      try {
        await onRetranslate(content.id, !!content.commonContent);
      } finally {
        setIsTranslating(false);
      }
    }
  };

  // 评估匹配度
  const handleEvaluateMatching = async () => {
    if (onEvaluateMatching && content.type === 'general') {
      await onEvaluateMatching(content.id, content.questionId);
    }
  };

  // 重新生成内容
  const handleRegenerateContent = async () => {
    if (onRegenerateContent && content.type === 'general') {
      setIsRegenerating(true);
      try {
        await onRegenerateContent(content.id);
      } finally {
        setIsRegenerating(false);
      }
    }
  };

  // 获取内容类型标签
  const getTypeLabel = () => {
    switch (content.type) {
      case 'general':
        return '通用语料';
      case 'specific':
        return '扣题语料';
      default:
        return '语料内容';
    }
  };

  // 获取内容类型样式
  const getTypeStyle = () => {
    switch (content.type) {
      case 'general':
        return 'bg-blue-100 text-blue-800';
      case 'specific':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取情绪标识
  const getSentimentIcon = () => {
    if (!content.sentiment) return null;
    
    switch (content.sentiment) {
      case 'positive':
        return <Smile className="w-4 h-4 text-green-600" />;
      case 'negative':
        return <Frown className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  // 获取情绪标签
  const getSentimentLabel = () => {
    if (!content.sentiment) return null;
    
    switch (content.sentiment) {
      case 'positive':
        return '正面';
      case 'negative':
        return '负面';
      default:
        return null;
    }
  };

  // 获取情绪样式
  const getSentimentStyle = () => {
    if (!content.sentiment) return '';
    
    switch (content.sentiment) {
      case 'positive':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'negative':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
      {/* 卡片头部 */}
      <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getTypeStyle()}`}>
              {getTypeLabel()}
            </span>
            {content.sentiment && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getSentimentStyle()}`}>
                {getSentimentIcon()}
                <span className="hidden sm:inline">{getSentimentLabel()}</span>
              </div>
            )}
            {categoryName && (
              <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {categoryName}
              </span>
            )}


          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto flex-wrap">
            {/* 语言切换按钮 */}
            {(content.commonContentCn || content.specificContentCn) && (
              <button
                onClick={() => setShowChinese(!showChinese)}
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors text-xs sm:text-sm"
              >
                <Languages className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{showChinese ? '英文' : '中文'}</span>
              </button>
            )}
            
            {/* 重新翻译按钮 */}
            {(content.commonContentCn || content.specificContentCn) && (
              <button
                onClick={handleRetranslate}
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors text-xs sm:text-sm"
                disabled={isTranslating}
              >
                <RotateCcw className={`h-3 w-3 sm:h-4 sm:w-4 ${isTranslating ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isTranslating ? '翻译中' : '重译'}</span>
              </button>
            )}
            
            {/* 匹配度评估按钮 - 仅通用语料显示 */}
            {content.type === 'general' && onEvaluateMatching && !matchingScore && !isEvaluating && (
              <button
                onClick={handleEvaluateMatching}
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-xs sm:text-sm"
              >
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">评估</span>
              </button>
            )}
            
            {/* 重新生成按钮 - 所有类型语料都可使用 */}
            {onRegenerateContent && (
              <button
                onClick={handleRegenerateContent}
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-xs sm:text-sm"
                disabled={isRegenerating}
              >
                <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isRegenerating ? '生成中' : '重生成'}</span>
              </button>
            )}
            
            {/* 编辑按钮 */}
            {onStartEdit && !isEditing && (
              <button
                onClick={() => onStartEdit(content)}
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-xs sm:text-sm"
              >
                <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">编辑</span>
              </button>
            )}
            
            {/* 智能复制按钮 */}
            {!isEditing && (
              <button
                onClick={handleSmartCopy}
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors text-xs sm:text-sm flex-shrink-0"
              >
                {copySuccess ? (
                  <>
                    <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">已复制!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">复制</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 卡片内容 */}
      <div className="p-6">
        {isEditing ? (
          /* 编辑模式 */
          <div className="space-y-4">
            <textarea
              value={editingText}
              onChange={(e) => onEditingTextChange?.(e.target.value)}
              className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm leading-relaxed"
              placeholder="编辑语料内容..."
            />
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                字数: {getWordCount(editingText)}
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={onCancelEdit}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  <span>取消</span>
                </button>
                
                <button
                  onClick={handleSaveEdit}
                  disabled={isLoading || !editingText.trim()}
                  className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{isLoading ? '保存中...' : '保存'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* 展示模式 */
          <div className="space-y-4">
            <div className="prose max-w-none">
              {showChinese && (content.commonContentCn || content.specificContentCn) ? (
                <div className="space-y-4">
                  <div className="whitespace-pre-wrap text-gray-900 leading-relaxed text-sm">
                    {content.commonContentCn || content.specificContentCn}
                  </div>
                  {content.translationSource && (
                    <div className="text-xs text-gray-500 border-t pt-2">
                      翻译来源: {content.translationSource}
                    </div>
                  )}
                </div>
              ) : (
                <div className="whitespace-pre-wrap text-gray-900 leading-relaxed text-sm">
                  {content.commonContent || content.specificContent}
                </div>
              )}
            </div>
            
            {/* 内容元信息 */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>字数: {getWordCount(content.commonContent || content.specificContent || '')}</span>
                {content.createdAt && (
                  <span>创建时间: {new Date(content.createdAt).toLocaleString()}</span>
                )}
              </div>
              
              {content.updatedAt && content.updatedAt !== content.createdAt && (
                <div className="text-xs text-gray-500">
                  最后编辑: {new Date(content.updatedAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentCard;