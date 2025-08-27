// 雅思串题助手 - 事物类故事表单组件
import React from 'react';
import { Package, Tag, Eye, Settings, ShoppingCart, MapPin } from 'lucide-react';
import { ThingStory, SentimentType } from '../../types';

interface ThingFormProps {
  data: Partial<ThingStory>;
  onChange: (field: keyof ThingStory, value: string) => void;
  errors: Record<string, string>;
  sentiment?: SentimentType;
}

const ThingForm: React.FC<ThingFormProps> = ({ data, onChange, errors, sentiment = 'positive' }) => {
  const handleChange = (field: keyof ThingStory, value: string) => {
    console.log('📦 [ThingForm] 字段变化', {
      field,
      value: value.substring(0, 50) + (value.length > 50 ? '...' : ''),
      valueLength: value.length,
      previousValue: data[field] || '',
      timestamp: new Date().toISOString()
    });
    
    onChange(field, value);
    
    console.log('✅ [ThingForm] onChange调用完成', {
      field,
      dataKeys: Object.keys(data),
      hasErrors: Object.keys(errors).length > 0
    });
  };

  const formFields = [
    {
      key: 'name' as keyof ThingStory,
      label: '事物名称',
      placeholder: '例如：iPhone、吉他、自行车等',
      icon: Package,
      required: true,
      type: 'input',
      hint: '尽量使用具体的名称'
    },
    {
      key: 'firstTime' as keyof ThingStory,
      label: '第一次接触时间',
      placeholder: '例如：去年夏天、三年前、小时候等',
      icon: Tag,
      required: true,
      type: 'input',
      hint: '描述第一次接触这个事物的时间'
    },
    {
      key: 'firstPlace' as keyof ThingStory,
      label: '第一次接触地点',
      placeholder: '例如：商场、朋友家、学校等',
      icon: MapPin,
      required: true,
      type: 'input',
      hint: '描述第一次接触这个事物的地点'
    },
    {
      key: 'firstEvent' as keyof ThingStory,
      label: '第一次接触时发生的事',
      placeholder: '描述第一次接触这个事物时的具体情况',
      icon: Eye,
      required: true,
      type: 'textarea',
      hint: '详细描述第一次接触时的情况和感受'
    },
    {
      key: 'features' as keyof ThingStory,
      label: '外观或特征',
      placeholder: '描述这个事物的外观、特点或功能',
      icon: Settings,
      required: true,
      type: 'textarea',
      hint: '重点描述最突出的特征'
    },
    {
      key: 'reason' as keyof ThingStory,
      label: '喜欢的原因',
      placeholder: '说明为什么喜欢这个事物',
      icon: ShoppingCart,
      required: true,
      type: 'textarea',
      hint: '描述这个事物吸引你的地方'
    },
    {
      key: 'experience' as keyof ThingStory,
      label: '相关经历',
      placeholder: '描述与这个事物相关的具体经历或故事',
      icon: Package,
      required: true,
      type: 'textarea',
      hint: '分享与这个事物相关的具体经历'
    },
    {
      key: 'impact' as keyof ThingStory,
      label: '对我的影响',
      placeholder: '描述这个事物对你生活的影响或改变',
      icon: Tag,
      required: true,
      type: 'textarea',
      hint: '说明这个事物如何影响了你的生活'
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
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                事物类故事 - {sentiment === 'positive' ? '正面印象' : '负面印象'}
              </h3>
              <p className="text-sm text-gray-600">
                {sentiment === 'positive' 
                  ? '描述一个给你留下积极印象的事物，重点突出其价值和正面影响。' 
                  : '描述一个给你留下深刻印象的事物，可以是具有挑战性或让你反思的物品。'
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
              💡 <strong>提示：</strong>负面印象的事物可以是让你失望、困扰或带来挑战的物品。重点在于这个事物对你的影响和你从中获得的经验教训。
            </p>
          </div>
        )}
      </div>

      {/* 表单字段 */}
      <div className="grid grid-cols-1 gap-6">
        {formFields.map((field) => {
          const IconComponent = field.icon;
          const fieldValue = data[field.key] || '';
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none ${
                    hasError
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-gray-400 focus:border-green-500'
                  }`}
                />
              ) : (
                <input
                  type="text"
                  value={fieldValue}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    hasError
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-gray-400 focus:border-green-500'
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
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(formFields.filter(field => data[field.key]).length / formFields.length) * 100}%`
            }}
          />
        </div>
      </div>

      {/* 填写建议 */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 填写建议</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• 物品名称要具体明确，避免过于宽泛的描述</li>
          <li>• 功能用途重点描述对你最重要的方面</li>
          <li>• 外观描述可以包含特殊的标识或个人化元素</li>
          <li>• 使用场景描述有助于展现物品的实际价值</li>
        </ul>
      </div>
    </div>
  );
};

export default ThingForm;