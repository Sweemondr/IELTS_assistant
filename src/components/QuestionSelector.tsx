// 雅思串题助手 - 题目选择器组件
import React from 'react';
import { Question, CategoryType, SentimentType } from '../types';
import { ChevronDown, Target } from 'lucide-react';

interface QuestionSelectorProps {
  category: CategoryType;
  sentiment: SentimentType;
  questions: Question[];
  selectedQuestionId: string | null;
  onQuestionSelect: (questionId: string | null) => void;
}

const QuestionSelector: React.FC<QuestionSelectorProps> = ({
  category,
  sentiment,
  questions,
  selectedQuestionId,
  onQuestionSelect
}) => {
  // 筛选当前类别和情绪的题目
  const filteredQuestions = questions.filter(q => 
    q.category === category && q.sentiment === sentiment
  );

  const selectedQuestion = selectedQuestionId 
    ? questions.find(q => q.id === selectedQuestionId)
    : null;

  return (
    <div className="mb-6">
      <div className="flex items-center space-x-2 mb-3">
        <Target className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">选择题目</h3>
        <span className="text-sm text-gray-500">({filteredQuestions.length}道题目)</span>
      </div>
      
      <div className="relative">
        <select
          value={selectedQuestionId || ''}
          onChange={(e) => onQuestionSelect(e.target.value || null)}
          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 appearance-none cursor-pointer"
        >
          <option value="">请选择一个题目进行扣题语料生成</option>
          {filteredQuestions.map((question) => (
            <option key={question.id} value={question.id}>
              {question.titleCn}
            </option>
          ))}
        </select>
        
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      
      {selectedQuestion && (
        <div className="mt-3 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-indigo-800">中文题目：</span>
              <p className="text-indigo-700">{selectedQuestion.titleCn}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-indigo-800">英文题目：</span>
              <p className="text-indigo-700 italic">{selectedQuestion.titleEn}</p>
            </div>
            {selectedQuestion.keywords && selectedQuestion.keywords.length > 0 && (
              <div>
                <span className="text-sm font-medium text-indigo-800">关键词：</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedQuestion.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {filteredQuestions.length === 0 && (
        <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-center">
            当前{sentiment === 'positive' ? '正面' : '负面'}情绪下暂无{category}类题目
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionSelector;