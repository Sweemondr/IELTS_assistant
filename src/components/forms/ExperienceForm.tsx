// 雅思串题助手 - 经历类故事表单组件
import React from 'react';
import { Calendar, MapPin, Users, PlayCircle, Target, Clock } from 'lucide-react';
import { ExperienceStory, SentimentType } from '../../types';

interface ExperienceFormProps {
  data: Partial<ExperienceStory>;
  onChange: (field: keyof ExperienceStory, value: string) => void;
  errors: Record<string, string>;
  sentiment?: SentimentType;
}

const ExperienceForm: React.FC<ExperienceFormProps> = ({ data, onChange, errors, sentiment = 'positive' }) => {
  const handleChange = (field: keyof ExperienceStory, value: string) => {
    console.log('🎯 [ExperienceForm] 字段变化', {
      field,
      value: value.substring(0, 50) + (value.length > 50 ? '...' : ''),
      valueLength: value.length,
      previousValue: data[field] || '',
      timestamp: new Date().toISOString()
    });
    
    onChange(field, value);
    
    console.log('✅ [ExperienceForm] onChange调用完成', {
      field,
      dataKeys: Object.keys(data),
      hasErrors: Object.keys(errors).length > 0
    });
  };

  const formFields = [
    {
      key: 'theme' as keyof ExperienceStory,
      label: '事件主题',
      placeholder: '例如：学习新技能、参加比赛、旅行等',
      icon: PlayCircle,
      required: true,
      type: 'input',
      hint: '用一句话概括这个经历的主题，如"第一次独自旅行"、"参加演讲比赛"等'
    },
    {
      key: 'time' as keyof ExperienceStory,
      label: '发生时间',
      placeholder: '例如：去年夏天、高中时期、上个月等',
      icon: Calendar,
      required: true,
      type: 'input',
      hint: '可以是具体时间或大概的时间段，重点是让听众有时间概念'
    },
    {
      key: 'place' as keyof ExperienceStory,
      label: '发生地点',
      placeholder: '例如：学校、家里、公园、旅游景点等',
      icon: MapPin,
      required: true,
      type: 'input',
      hint: '可以是具体地点或大致区域，有助于增加故事的真实感'
    },
    {
      key: 'participants' as keyof ExperienceStory,
      label: '参与者',
      placeholder: '例如：我和朋友、全家人、同学们等',
      icon: Users,
      required: true,
      type: 'input',
      hint: '描述参与这个经历的人，包括朋友、家人、老师、陌生人等'
    },
    {
      key: 'process' as keyof ExperienceStory,
      label: '事情经过',
      placeholder: '详细描述事情的发生过程',
      icon: Clock,
      required: true,
      type: 'textarea',
      hint: '按时间顺序描述关键步骤，包括遇到的挑战和解决方法'
    },
    {
      key: 'learning' as keyof ExperienceStory,
      label: '学到的东西/感受',
      placeholder: '描述从这次经历中学到了什么或有什么感受',
      icon: Target,
      required: true,
      type: 'textarea',
      hint: '包括直接结果、个人成长、学到的经验教训等'
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
      <div className={`rounded-lg p-6 border ${
        sentiment === 'positive' 
          ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100' 
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              sentiment === 'positive' ? 'bg-purple-100' : 'bg-blue-100'
            }`}>
              <PlayCircle className={`w-5 h-5 ${
                sentiment === 'positive' ? 'text-purple-600' : 'text-blue-600'
              }`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              经历信息填写 - {sentiment === 'positive' ? '正面印象' : '负面印象'}故事
            </h3>
          </div>
          
          {/* 进度指示器 */}
          <div className="text-right">
            <div className={`text-sm font-medium ${
              sentiment === 'positive' ? 'text-purple-700' : 'text-blue-700'
            }`}>
              {progress.filled}/{progress.total} 已填写
            </div>
            <div className="text-xs text-gray-500">
              {progress.percentage}% 完成
            </div>
          </div>
        </div>
        
        {/* 进度条 */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              sentiment === 'positive' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
            }`}
            style={{ width: `${progress.percentage}%` }}
          ></div>
        </div>
        
        <p className="text-gray-600 text-sm leading-relaxed">
          请详细填写这个经历的相关信息。根据当前选择的情绪类型（{sentiment === 'positive' ? '正面' : '负面'}），
          请着重描述相应的经历和感受。完整的经历描述有助于生成更有说服力和感染力的语料内容。
        </p>
        {sentiment === 'negative' && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-700 text-xs leading-relaxed">
              💡 负面印象故事提示：可以描述挫折、失败或不愉快的经历，
              重点关注从中学到的教训和成长，保持积极的反思态度。
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



      {/* 填写进度显示 */}
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

      {/* 填写建议 */}
      <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
        <h4 className="text-sm font-medium text-amber-900 mb-2">💡 填写建议</h4>
        <ul className="text-xs text-amber-800 space-y-1">
          <li>• 事件名称要简洁明了，突出经历的核心</li>
          <li>• 经历过程要有逻辑性，按时间顺序描述</li>
          <li>• 重点描述遇到的挑战和你的应对方式</li>
          <li>• 结果影响要体现个人成长和收获</li>
          <li>• 可以适当加入情感描述增加感染力</li>
        </ul>
      </div>
    </div>
  );
};

export default ExperienceForm;