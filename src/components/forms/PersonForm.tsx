// 雅思串题助手 - 人物类故事表单组件
import React from 'react';
import { User, Heart, Eye, Briefcase, Gamepad2, Users } from 'lucide-react';
import { PersonStory, SentimentType } from '../../types';

interface PersonFormProps {
  data: Partial<PersonStory>;
  onChange: (field: keyof PersonStory, value: string) => void;
  errors: Record<string, string>;
  sentiment?: SentimentType;
}

const PersonForm: React.FC<PersonFormProps> = ({ data, onChange, errors, sentiment = 'positive' }) => {
  const handleChange = (field: keyof PersonStory, value: string) => {
    console.log('📝 [PersonForm] 字段变化', {
      field,
      value: value.substring(0, 50) + (value.length > 50 ? '...' : ''),
      valueLength: value.length,
      previousValue: data[field] || '',
      timestamp: new Date().toISOString()
    });
    
    onChange(field, value);
    
    console.log('✅ [PersonForm] onChange调用完成', {
      field,
      dataKeys: Object.keys(data),
      hasErrors: Object.keys(errors).length > 0
    });
  };

  const formFields = [
    {
      key: 'name' as keyof PersonStory,
      label: '人物名称',
      placeholder: '请输入这个人的姓名或称呼',
      icon: User,
      required: true,
      type: 'input',
      hint: '可以是真实姓名、昵称或其他称呼方式'
    },
    {
      key: 'identity' as keyof PersonStory,
      label: '人物身份',
      placeholder: '请描述这个人的身份，如学生、老师、朋友、家人等',
      icon: User,
      required: true,
      type: 'input',
      hint: '可以是职业身份、社会角色或与你的关系身份'
    },
    {
      key: 'relationship' as keyof PersonStory,
      label: '与你的关系',
      placeholder: '如：朋友、同事、家人、老师等',
      icon: Users,
      required: true,
      type: 'input',
      hint: '描述这个人与你的具体关系'
    },
    {
      key: 'appearance' as keyof PersonStory,
      label: '外貌特征',
      placeholder: '描述这个人的外貌特点，如身高、发型、穿着风格等',
      icon: Eye,
      required: true,
      type: 'textarea',
      hint: '可以描述身高、体型、发型、穿着风格、特殊标识等'
    },
    {
      key: 'personality' as keyof PersonStory,
      label: '性格特点',
      placeholder: '描述这个人的性格特征，如开朗、内向、幽默、严肃等',
      icon: Heart,
      required: true,
      type: 'textarea',
      hint: '重点描述最突出的性格特征，这对语料生成很重要'
    },
    {
      key: 'event' as keyof PersonStory,
      label: '共同经历的事件',
      placeholder: '描述你们一起经历的重要事件或难忘时刻',
      icon: Briefcase,
      required: true,
      type: 'textarea',
      hint: '可以是一起做过的事情、共同的回忆、特殊的经历等'
    },
    {
      key: 'feeling' as keyof PersonStory,
      label: '我的感受',
      placeholder: '描述这个人给你的感受或你对这个人的看法',
      icon: Heart,
      required: true,
      type: 'textarea',
      hint: '可以描述感激、敬佩、喜爱等情感，以及这个人对你的影响'
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
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                人物类故事 - {sentiment === 'positive' ? '正面印象' : '负面印象'}
              </h3>
              <p className="text-sm text-gray-600">
                {sentiment === 'positive' 
                  ? '描述一个给你留下积极印象的人物，重点突出其优秀品质和正面影响。' 
                  : '描述一个给你留下深刻印象的人物，可以是挑战性的经历或让你反思的人物。'
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
              💡 <strong>提示：</strong>负面印象不等于完全负面的人，可以是让你学到教训、促使你成长，或者在某些方面给你带来挑战的人物。重点在于这个人物对你的影响和你从中获得的感悟。
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none ${
                    hasError
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-gray-400 focus:border-purple-500'
                  }`}
                />
              ) : (
                <input
                  type="text"
                  value={fieldValue}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    hasError
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-gray-400 focus:border-purple-500'
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
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(formFields.filter(field => data[field.key]).length / formFields.length) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonForm;