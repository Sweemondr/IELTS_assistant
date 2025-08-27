import React, { useState } from 'react';
import { X, RefreshCw, AlertCircle } from 'lucide-react';
import { GeneratedContent } from '../types';
import { useAppStore } from '../store/useAppStore';

interface RegenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: GeneratedContent;
  onSuccess?: () => void;
}

const REGENERATION_REASONS = [
  { value: 'low_matching', label: '匹配度较低' },
  { value: 'improve_quality', label: '提升语料质量' },
  { value: 'change_style', label: '调整表达风格' },
  { value: 'add_details', label: '增加细节描述' },
  { value: 'simplify', label: '简化表达' },
  { value: 'custom', label: '自定义原因' }
];

export const RegenerationModal: React.FC<RegenerationModalProps> = ({
  isOpen,
  onClose,
  content,
  onSuccess
}) => {
  const [userPrompt, setUserPrompt] = useState('');
  const [selectedReason, setSelectedReason] = useState('low_matching');
  const [customReason, setCustomReason] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { regenerateContent } = useAppStore();

  if (!isOpen) return null;

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      setError(null);
      
      const reason = selectedReason === 'custom' ? customReason : 
        REGENERATION_REASONS.find(r => r.value === selectedReason)?.label || '重新生成';
      
      if (selectedReason === 'custom' && !customReason.trim()) {
        setError('请输入自定义原因');
        return;
      }
      
      await regenerateContent(content.id, userPrompt.trim() || undefined, reason);
      
      onSuccess?.();
      onClose();
      
      // 重置表单
      setUserPrompt('');
      setSelectedReason('low_matching');
      setCustomReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '重生成失败，请重试');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleClose = () => {
    if (!isRegenerating) {
      onClose();
      setUserPrompt('');
      setSelectedReason('low_matching');
      setCustomReason('');
      setError(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">重新生成语料</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isRegenerating}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 当前内容预览 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">当前通用语料</h3>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 max-h-32 overflow-y-auto">
              {content.commonContent}
            </div>
          </div>

          {/* 重生成原因 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">重生成原因</h3>
            <div className="grid grid-cols-2 gap-2">
              {REGENERATION_REASONS.map((reason) => (
                <label
                  key={reason.value}
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    disabled={isRegenerating}
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-700">{reason.label}</span>
                </label>
              ))}
            </div>
            
            {/* 自定义原因输入 */}
            {selectedReason === 'custom' && (
              <div className="mt-3">
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="请输入自定义原因"
                  disabled={isRegenerating}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                />
              </div>
            )}
          </div>

          {/* 自定义提示词 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">自定义提示词（可选）</h3>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="例如：请让语料更加生动有趣，增加具体的细节描述..."
              disabled={isRegenerating}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              提供具体的改进建议，AI将根据您的要求重新生成语料
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={handleClose}
              disabled={isRegenerating}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating || (selectedReason === 'custom' && !customReason.trim())}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isRegenerating && <RefreshCw className="w-4 h-4 animate-spin" />}
              {isRegenerating ? '重新生成中...' : '确认重新生成'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};