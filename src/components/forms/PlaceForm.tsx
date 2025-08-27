// 雅思串题助手 - 地点类故事表单组件
import React from 'react';
import { MapPin, Navigation, Trees, Building, Activity, Heart } from 'lucide-react';
import { PlaceStory, SentimentType } from '../../types';

interface PlaceFormProps {
  data: Partial<PlaceStory>;
  onChange: (field: keyof PlaceStory, value: string) => void;
  errors: Record<string, string>;
  sentiment?: SentimentType;
}

const PlaceForm: React.FC<PlaceFormProps> = ({ data, onChange, errors, sentiment = 'positive' }) => {
  const handleChange = (field: keyof PlaceStory, value: string) => {
    console.log('🗺️ [PlaceForm] 字段变化', {
      field,
      value: value.substring(0, 50) + (value.length > 50 ? '...' : ''),
      valueLength: value.length,
      previousValue: data[field] || '',
      timestamp: new Date().toISOString()
    });
    
    onChange(field, value);
    
    console.log('✅ [PlaceForm] onChange调用完成', {
      field,
      dataKeys: Object.keys(data),
      hasErrors: Object.keys(errors).length > 0
    });
  };

  const formFields = [
    {
      key: 'name' as keyof PlaceStory,
      label: '地点名称',
      placeholder: '例如：星巴克、中央公园、图书馆等',
      icon: MapPin,
      required: true,
      type: 'input',
      hint: '可以是具体的地名、建筑名称或者你给这个地方起的名字'
    },
    {
      key: 'type' as keyof PlaceStory,
      label: '地点类型',
      placeholder: '例如：咖啡厅、公园、商场、学校等',
      icon: Building,
      required: true,
      type: 'input',
      hint: '描述这个地方的类型或性质'
    },
    {
      key: 'firstVisit' as keyof PlaceStory,
      label: '第一次去的时间和原因',
      placeholder: '描述第一次去这个地方的时间和原因',
      icon: Navigation,
      required: true,
      type: 'textarea',
      hint: '说明什么时候第一次去，以及为什么去'
    },
    {
      key: 'environment' as keyof PlaceStory,
      label: '环境特征',
      placeholder: '描述这个地方的环境、氛围、装修风格等',
      icon: Trees,
      required: true,
      type: 'textarea',
      hint: '可以包括自然环境、人文环境、装修风格、氛围等'
    },
    {
      key: 'activities' as keyof PlaceStory,
      label: '在那里的活动',
      placeholder: '描述你在这个地方通常做什么活动',
      icon: Activity,
      required: true,
      type: 'textarea',
      hint: '重点描述最常进行的活动，以及这些活动的意义'
    },
    {
      key: 'companions' as keyof PlaceStory,
      label: '与谁一起去',
      placeholder: '例如：朋友、家人、同事、独自一人等',
      icon: Heart,
      required: true,
      type: 'input',
      hint: '说明通常和谁一起去这个地方'
    },
    {
      key: 'reason' as keyof PlaceStory,
      label: '感受体验',
      placeholder: '描述在这个地方的感受和体验',
      icon: Heart,
      required: true,
      type: 'textarea',
      hint: '可以包括感官体验、情感感受、印象等'
    }
  ];

  // 计算填写进度
  const calculateProgress = () => {
    const filledFields = formFields.filter(field => {
      const value = data[field.key];
      return value && value.trim() !== '';
    }).length;
    return {
      filled: filledFields,
      total: formFields.length,
      percentage: Math.round((filledFields / formFields.length) * 100)
    };
  };
  
  const progress = calculateProgress();

  return (
    <div className="space-y-6">
      {/* 表单标题和进度 */}
      <div className={`p-4 rounded-lg border-2 ${
        sentiment === 'positive' 
          ? 'bg-green-50 border-green-200' 
          : 'bg-orange-50 border-orange-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              sentiment === 'positive' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-orange-100 text-orange-700'
            }`}>
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                地点类故事 - {sentiment === 'positive' ? '正面印象' : '负面印象'}
              </h3>
              <p className="text-sm text-gray-600">
                {sentiment === 'positive' 
                  ? '描述一个给你留下美好印象的地点，重点突出其吸引人的特色和积极体验。' 
                  : '描述一个给你留下深刻印象的地点，可以是具有挑战性或让你反思的场所。'
                }
              </p>
            </div>
          </div>
          
          {/* 进度指示器 */}
          <div className="text-right">
            <div className={`text-sm font-medium ${
              sentiment === 'positive' ? 'text-green-700' : 'text-orange-700'
            }`}>
              {progress.filled}/{progress.total} 已填写
            </div>
            <div className="text-xs text-gray-500">
              {progress.percentage}% 完成
            </div>
          </div>
        </div>
        
        {/* 进度条 */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              sentiment === 'positive' ? 'bg-green-500' : 'bg-orange-500'
            }`}
            style={{ width: `${progress.percentage}%` }}
          ></div>
        </div>
        
        {sentiment === 'negative' && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              💡 <strong>提示：</strong>负面印象的地点不一定是完全糟糕的地方，可以是让你感到不适、挑战或促使你思考的场所。重点在于这个地点对你的影响和你的感受。
            </p>
          </div>
        )}
      </div>

      {/* 表单字段 */}
      <div className="grid grid-cols-1 gap-6">
        {formFields.map((field) => {
          const IconComponent = field.icon;
          const fieldValue = (data[field.key] ?? '') || '';
          const hasError = errors[field.key];

          return (
            <div key={field.key} className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <IconComponent className="w-4 h-4 text-gray-500" />
                <span>{field.label}</span>
                {field.required && <span className="text-red-500">*</span>}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  value={fieldValue}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                    hasError
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
                  }`}
                />
              ) : (
                <input
                  type="text"
                  value={fieldValue}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    hasError
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
                  }`}
                />
              )}

              {hasError && (
                <div className="flex items-center space-x-2 text-sm text-red-600">
                  <div className="w-1 h-1 bg-red-500 rounded-full" />
                  <span>{errors[field.key]}</span>
                </div>
              )}

              {field.hint && !hasError && (
                <p className="text-xs text-gray-500 leading-relaxed">
                  💡 {field.hint}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* 填写进度提示 */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">填写进度</span>
          <span className="font-medium text-gray-900">
            {formFields.filter(field => data[field.key]).length} / {formFields.length} 项已填写
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(formFields.filter(field => data[field.key]).length / formFields.length) * 100}%`
            }}
          />
        </div>
      </div>

      {/* 填写建议 */}
      <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
        <h4 className="text-sm font-medium text-amber-900 mb-2">💡 填写建议</h4>
        <ul className="text-xs text-amber-800 space-y-1">
          <li>• 地点名称可以包含你的个人称呼或特殊意义</li>
          <li>• 环境描述重点突出最印象深刻的特征</li>
          <li>• 主要活动要体现这个地方对你的重要性</li>
          <li>• 感受体验可以包含具体的感官描述</li>
        </ul>
      </div>
    </div>
  );
};

export default PlaceForm;