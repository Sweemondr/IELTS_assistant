import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { GeneratedContent, Question, SentimentType, MatchingScore } from '../types';
import ContentCard from './ContentCard';

interface TopicContentListProps {
  contents: GeneratedContent[];
  questions: Question[];
  onEdit: (contentId: string, newContent: string) => Promise<void>;
  onEditTranslation?: (contentId: string, instruction: string, isCommon?: boolean) => Promise<void>;
  onRetranslate?: (contentId: string, isCommon?: boolean) => Promise<void>;
  onCopy: (content: string, contentId: string) => Promise<void>;
  onCopyTranslation?: (content: string, contentId: string) => Promise<void>;
  onCopyBoth?: (englishContent: string, chineseContent: string, contentId: string) => Promise<void>;
  copySuccess: string | null;
  sentimentFilter?: SentimentType | 'all';
  // 匹配度评估相关
  getMatchingScore?: (contentId: string) => MatchingScore | undefined;
  isEvaluating?: (contentId: string) => boolean;
  onEvaluateMatching?: (contentId: string) => Promise<void>;
  onRegenerateContent?: (contentId: string, customPrompt?: string) => Promise<void>;
  // 懒加载相关
  registerContentRef?: (contentId: string, element: HTMLElement | null) => void;
}

const TopicContentList: React.FC<TopicContentListProps> = ({
  contents,
  questions,
  onEdit,
  onEditTranslation,
  onRetranslate,
  onCopy,
  onCopyTranslation,
  onCopyBoth,
  copySuccess,
  sentimentFilter = 'all',
  getMatchingScore,
  isEvaluating,
  onEvaluateMatching,
  onRegenerateContent,
  registerContentRef
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('all');
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // 筛选扣题语料（针对具体题目的语料）
  const topicSpecificContents = useMemo(() => {
    return contents.filter(content => content.type === 'specific' && content.questionId);
  }, [contents]);

  // 根据搜索和筛选条件过滤内容
  const filteredContents = useMemo(() => {
    let filtered = topicSpecificContents;

    // 按情绪筛选
    if (sentimentFilter !== 'all') {
      filtered = filtered.filter(content => content.sentiment === sentimentFilter);
    }

    // 按题目筛选
    if (selectedQuestionId !== 'all') {
      filtered = filtered.filter(content => content.questionId === selectedQuestionId);
    }

    // 按搜索词筛选
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(content => 
        content.specificContent.toLowerCase().includes(term) ||
        questions.find(q => q.id === content.questionId)?.titleCn.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [topicSpecificContents, sentimentFilter, selectedQuestionId, searchTerm, questions]);

  // 按题目分组内容
  const contentsByQuestion = useMemo(() => {
    const grouped: { [questionId: string]: GeneratedContent[] } = {};
    
    filteredContents.forEach(content => {
      if (content.questionId) {
        if (!grouped[content.questionId]) {
          grouped[content.questionId] = [];
        }
        grouped[content.questionId].push(content);
      }
    });
    
    return grouped;
  }, [filteredContents]);

  // 获取题目信息
  const getQuestionById = (questionId: string) => {
    return questions.find(q => q.id === questionId);
  };

  // 开始编辑
  const handleStartEdit = (content: GeneratedContent) => {
    setEditingContentId(content.id);
    setEditingText(content.specificContent);
  };

  // 保存编辑
  const handleSaveEdit = async (contentId: string, newContent: string) => {
    try {
      await onEdit(contentId, newContent);
      setEditingContentId(null);
      setEditingText('');
    } catch (error) {
      console.error('保存编辑失败:', error);
      throw error;
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingContentId(null);
    setEditingText('');
  };



  // 获取有语料的题目列表
  const questionsWithContent = useMemo(() => {
    const questionIds = [...new Set(topicSpecificContents.map(c => c.questionId).filter(Boolean))];
    return questionIds.map(id => questions.find(q => q.id === id)).filter(Boolean) as Question[];
  }, [topicSpecificContents, questions]);

  if (topicSpecificContents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Filter className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无扣题语料</h3>
        <p className="text-gray-600">针对具体题目的语料将在这里显示</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 搜索和筛选栏 */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="搜索语料内容或题目..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* 筛选按钮 */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>筛选</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* 筛选选项 */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  按题目筛选
                </label>
                <select
                  value={selectedQuestionId}
                  onChange={(e) => setSelectedQuestionId(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">所有题目</option>
                  {questionsWithContent.map(question => (
                    <option key={question.id} value={question.id}>
                      {question.titleCn.length > 50 ? `${question.titleCn.substring(0, 50)}...` : question.titleCn}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 统计信息 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-sm text-gray-600">
        <span>共找到 {filteredContents.length} 条扣题语料</span>
        <span>涵盖 {Object.keys(contentsByQuestion).length} 个题目</span>
      </div>

      {/* 语料列表 */}
      {Object.keys(contentsByQuestion).length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <Search className="h-8 w-8 mx-auto" />
          </div>
          <p className="text-gray-600">没有找到匹配的语料内容</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(contentsByQuestion).map(([questionId, questionContents]) => {
            const question = getQuestionById(questionId);
            if (!question) return null;

            return (
              <div key={questionId} className="space-y-4">
                {/* 题目标题 */}
                <div className="bg-indigo-50 rounded-lg p-3 sm:p-4 border border-indigo-200">
                  <h3 className="text-base sm:text-lg font-semibold text-indigo-900 mb-2">
                    {question.titleCn}
                  </h3>
                  <p className="text-sm sm:text-base text-indigo-800 leading-relaxed">
                    {question.titleFullCn}
                  </p>

                </div>

                {/* 该题目的语料列表 */}
                <div className="space-y-4 ml-2 sm:ml-4">
                  {questionContents
                    .sort((a, b) => {
                      // 按情绪排序：positive 在前，negative 在后
                      if (a.sentiment === 'positive' && b.sentiment === 'negative') return -1;
                      if (a.sentiment === 'negative' && b.sentiment === 'positive') return 1;
                      return 0;
                    })
                    .map((content) => (
                    <div
                      key={content.id}
                      ref={(el) => registerContentRef?.(content.id, el)}
                    >
                      <ContentCard
                        content={content}
                        onEdit={handleSaveEdit}
                        onEditTranslation={onEditTranslation}
                        onRetranslate={onRetranslate}
                        onCopy={onCopy}
                        onCopyTranslation={onCopyTranslation}
                        onCopyBoth={onCopyBoth}
                        isEditing={editingContentId === content.id}
                        onStartEdit={handleStartEdit}
                        onCancelEdit={handleCancelEdit}
                        editingText={editingText}
                        onEditingTextChange={setEditingText}
                        copySuccess={copySuccess === content.id}
                        matchingScore={getMatchingScore?.(content.id)}
                        isEvaluating={isEvaluating?.(content.id) || false}
                        onEvaluateMatching={onEvaluateMatching}
                        onRegenerateContent={onRegenerateContent}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TopicContentList;