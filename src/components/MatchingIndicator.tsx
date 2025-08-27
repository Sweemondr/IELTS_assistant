import React, { useState } from 'react';
import { CheckCircle, AlertCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { MatchingLevel, GeneratedContent } from '../types';
import { RegenerationModal } from './RegenerationModal';

interface MatchingIndicatorProps {
  level?: MatchingLevel;
  score?: number;
  reason?: string;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showScore?: boolean;
  className?: string;
  content?: GeneratedContent;
  showRegenerateButton?: boolean;
  onRegenerateSuccess?: () => void;
}

const MatchingIndicator: React.FC<MatchingIndicatorProps> = ({
  level,
  score,
  reason,
  isLoading = false,
  size = 'md',
  showText = true,
  showScore = false,
  className = '',
  content,
  showRegenerateButton = true,
  onRegenerateSuccess
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 加载状态
  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className={`animate-spin text-gray-400 ${
          size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
        }`} />
        {showText && (
          <span className={`text-gray-500 ${
            size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
          }`}>
            评估中...
          </span>
        )}
      </div>
    );
  }

  // 未评估状态
  if (!level) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`rounded-full bg-gray-200 ${
          size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
        }`} />
        {showText && (
          <span className={`text-gray-400 ${
            size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
          }`}>
            未评估
          </span>
        )}
      </div>
    );
  }

  // 根据匹配度等级获取配置
  const getConfig = () => {
    switch (level) {
      case 'high':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          text: '高匹配',
          description: '推荐使用'
        };
      case 'medium':
        return {
          icon: AlertCircle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200',
          text: '中匹配',
          description: '可选优化'
        };
      case 'low':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          text: '低匹配',
          description: '建议重生成'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          text: '未知',
          description: ''
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        {/* 图标 */}
        <Icon className={`${config.color} ${
          size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
        }`} />
        
        {/* 文本信息 */}
        {showText && (
          <div className="flex items-center gap-1">
            <span className={`font-medium ${config.color} ${
              size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
            }`}>
              {config.text}
            </span>
            
            {/* 分数显示 */}
            {showScore && score !== undefined && (
              <span className={`text-gray-500 ${
                size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs'
              }`}>
                ({score}分)
              </span>
            )}
          </div>
        )}
        
        {/* 重生成按钮 - 仅在低匹配度时显示 */}
        {showRegenerateButton && level === 'low' && content && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded transition-colors group"
            title="重新生成语料"
          >
            <RefreshCw className={`${
              size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
            } group-hover:rotate-180 transition-transform duration-300`} />
          </button>
        )}
        
        {/* 悬停提示 */}
        {reason && (
          <div className="group relative">
            <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-10">
              {reason}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>
        )}
      </div>
      
      {/* 重生成模态框 */}
      {content && (
        <RegenerationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          content={content}
          onSuccess={() => {
            setIsModalOpen(false);
            onRegenerateSuccess?.();
          }}
        />
      )}
    </>
  );
};

export default MatchingIndicator;