import React from 'react';
import { SentimentType } from '../types';
import { Smile, Frown } from 'lucide-react';

interface SentimentSwitcherProps {
  currentSentiment: SentimentType;
  onSentimentChange: (sentiment: SentimentType) => void;
  hasPositiveData: boolean;
  hasNegativeData: boolean;
  positiveProgress?: number;
  negativeProgress?: number;
}

const SentimentSwitcher: React.FC<SentimentSwitcherProps> = ({
  currentSentiment,
  onSentimentChange,
  hasPositiveData,
  hasNegativeData,
  positiveProgress = 0,
  negativeProgress = 0
}) => {
  return (
    <div className="mb-6">
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {/* 正面印象标签 */}
        <button
          onClick={() => onSentimentChange('positive')}
          className={`flex-1 flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
            currentSentiment === 'positive'
              ? 'bg-white text-green-700 shadow-sm border border-green-200'
              : 'text-gray-600 hover:text-green-600'
          }`}
        >
          <Smile className="w-4 h-4 mr-2" />
          <span>正面印象故事</span>
          {hasPositiveData && (
            <div className="ml-2 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {positiveProgress > 0 && (
                <span className="ml-1 text-xs text-green-600">
                  {Math.round(positiveProgress * 100)}%
                </span>
              )}
            </div>
          )}
        </button>

        {/* 负面印象标签 */}
        <button
          onClick={() => onSentimentChange('negative')}
          className={`flex-1 flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
            currentSentiment === 'negative'
              ? 'bg-white text-orange-700 shadow-sm border border-orange-200'
              : 'text-gray-600 hover:text-orange-600'
          }`}
        >
          <Frown className="w-4 h-4 mr-2" />
          <span>负面印象故事</span>
          {hasNegativeData && (
            <div className="ml-2 flex items-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              {negativeProgress > 0 && (
                <span className="ml-1 text-xs text-orange-600">
                  {Math.round(negativeProgress * 100)}%
                </span>
              )}
            </div>
          )}
        </button>
      </div>

      {/* 进度提示 */}
      <div className="mt-3 text-sm text-gray-500">
        {currentSentiment === 'positive' ? (
          <div className="flex items-center">
            <Smile className="w-4 h-4 mr-1 text-green-500" />
            <span>
              填写正面印象的故事，用于生成积极向上的语料内容
              {positiveProgress > 0 && (
                <span className="ml-2 text-green-600 font-medium">
                  已完成 {Math.round(positiveProgress * 100)}%
                </span>
              )}
            </span>
          </div>
        ) : (
          <div className="flex items-center">
            <Frown className="w-4 h-4 mr-1 text-orange-500" />
            <span>
              填写负面印象的故事，用于生成具有挑战性或反思性的语料内容
              {negativeProgress > 0 && (
                <span className="ml-2 text-orange-600 font-medium">
                  已完成 {Math.round(negativeProgress * 100)}%
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SentimentSwitcher;