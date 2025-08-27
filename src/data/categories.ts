// 雅思串题助手 - 类别配置数据
import { Category, CategoryField } from '../types';

// 人物类表单字段配置
const personFields: CategoryField[] = [
  {
    key: 'name',
    label: '人物名称',
    type: 'text',
    required: true,
    placeholder: '例如：张老师、小明、妈妈等',
    maxLength: 50
  },
  {
    key: 'identity',
    label: '人物身份',
    type: 'text',
    required: true,
    placeholder: '例如：老师、朋友、同事、家人等',
    maxLength: 50
  },
  {
    key: 'relationship',
    label: '与我的关系',
    type: 'text',
    required: true,
    placeholder: '例如：我的高中同学、我妈妈的朋友等',
    maxLength: 50
  },
  {
    key: 'appearance',
    label: '外貌特点',
    type: 'textarea',
    required: false,
    placeholder: '描述这个人的外貌特征，如身高、发型、穿着风格等',
    maxLength: 200
  },
  {
    key: 'personality',
    label: '性格特点',
    type: 'textarea',
    required: true,
    placeholder: '描述这个人的性格特征，如开朗、内向、幽默、严肃等',
    maxLength: 200
  },
  {
    key: 'event',
    label: '共同经历的事件',
    type: 'textarea',
    required: true,
    placeholder: '描述你们一起经历过的具体事件或活动',
    maxLength: 300
  },
  {
    key: 'feeling',
    label: '我的感受',
    type: 'textarea',
    required: true,
    placeholder: '描述你对这个人的感受和看法',
    maxLength: 200
  }
];

// 事物类表单字段配置
const thingFields: CategoryField[] = [
  {
    key: 'name',
    label: '事物名称',
    type: 'text',
    required: true,
    placeholder: '例如：iPhone、吉他、自行车等',
    maxLength: 50
  },
  {
    key: 'firstTime',
    label: '第一次接触时间',
    type: 'text',
    required: true,
    placeholder: '例如：去年夏天、三年前、小时候等',
    maxLength: 50
  },
  {
    key: 'firstPlace',
    label: '第一次接触地点',
    type: 'text',
    required: true,
    placeholder: '例如：商场、朋友家、学校等',
    maxLength: 50
  },
  {
    key: 'firstEvent',
    label: '第一次接触时发生的事',
    type: 'textarea',
    required: true,
    placeholder: '描述第一次接触这个事物时的具体情况',
    maxLength: 300
  },
  {
    key: 'features',
    label: '外观或特征',
    type: 'textarea',
    required: true,
    placeholder: '描述这个事物的外观、特点或功能',
    maxLength: 200
  },
  {
    key: 'reason',
    label: '喜欢的原因',
    type: 'textarea',
    required: true,
    placeholder: '说明为什么喜欢这个事物',
    maxLength: 200
  },
  {
    key: 'experience',
    label: '相关经历',
    type: 'textarea',
    required: true,
    placeholder: '描述与这个事物相关的具体经历或故事',
    maxLength: 300
  },
  {
    key: 'impact',
    label: '对我的影响',
    type: 'textarea',
    required: true,
    placeholder: '描述这个事物对你生活的影响或改变',
    maxLength: 200
  }
];

// 地点类表单字段配置
const placeFields: CategoryField[] = [
  {
    key: 'name',
    label: '地点名称',
    type: 'text',
    required: true,
    placeholder: '例如：星巴克、中央公园、图书馆等',
    maxLength: 50
  },
  {
    key: 'type',
    label: '地点类型',
    type: 'text',
    required: true,
    placeholder: '例如：咖啡厅、公园、商场、学校等',
    maxLength: 50
  },
  {
    key: 'firstVisit',
    label: '第一次去的时间和原因',
    type: 'textarea',
    required: true,
    placeholder: '描述第一次去这个地方的时间和原因',
    maxLength: 200
  },
  {
    key: 'environment',
    label: '环境特征',
    type: 'textarea',
    required: true,
    placeholder: '描述这个地方的环境、氛围、装修风格等',
    maxLength: 300
  },
  {
    key: 'activities',
    label: '在那里的活动',
    type: 'textarea',
    required: true,
    placeholder: '描述你在这个地方通常做什么活动',
    maxLength: 200
  },
  {
    key: 'companions',
    label: '与谁一起去',
    type: 'text',
    required: true,
    placeholder: '例如：朋友、家人、同事、独自一人等',
    maxLength: 50
  },
  {
    key: 'reason',
    label: '喜欢的原因',
    type: 'textarea',
    required: true,
    placeholder: '说明为什么喜欢这个地方',
    maxLength: 200
  }
];

// 经历类表单字段配置
const experienceFields: CategoryField[] = [
  {
    key: 'theme',
    label: '事件主题',
    type: 'text',
    required: true,
    placeholder: '例如：学习新技能、参加比赛、旅行等',
    maxLength: 50
  },
  {
    key: 'time',
    label: '发生时间',
    type: 'text',
    required: true,
    placeholder: '例如：去年夏天、高中时期、上个月等',
    maxLength: 50
  },
  {
    key: 'place',
    label: '发生地点',
    type: 'text',
    required: true,
    placeholder: '例如：学校、家里、公园、旅游景点等',
    maxLength: 50
  },
  {
    key: 'participants',
    label: '参与者',
    type: 'text',
    required: true,
    placeholder: '例如：我和朋友、全家人、同学们等',
    maxLength: 50
  },
  {
    key: 'process',
    label: '事情经过',
    type: 'textarea',
    required: true,
    placeholder: '详细描述事情的发生过程',
    maxLength: 400
  },
  {
    key: 'learning',
    label: '学到的东西/感受',
    type: 'textarea',
    required: true,
    placeholder: '描述从这次经历中学到了什么或有什么感受',
    maxLength: 200
  }
];

// 四大类别配置
export const CATEGORIES: Category[] = [
  {
    id: 'person',
    name: 'Person',
    nameCn: '人物类',
    icon: '👤',
    description: '描述各类人物，包括家人、朋友、老师、同事等',
    fields: personFields
  },
  {
    id: 'thing',
    name: 'Thing',
    nameCn: '事物类',
    icon: '📱',
    description: '描述物品、技能、文章、电影等事物',
    fields: thingFields
  },
  {
    id: 'place',
    name: 'Place',
    nameCn: '地点类',
    icon: '📍',
    description: '描述你去过或想去的地方',
    fields: placeFields
  },
  {
    id: 'experience',
    name: 'Experience',
    nameCn: '经历类',
    icon: '⭐',
    description: '描述你经历过的事件或活动',
    fields: experienceFields
  }
];

// 根据类别ID获取类别配置
export const getCategoryById = (categoryId: string): Category | undefined => {
  return CATEGORIES.find(cat => cat.id === categoryId);
};

// 获取类别的字段配置
export const getCategoryFields = (categoryId: string): CategoryField[] => {
  const category = getCategoryById(categoryId);
  return category ? category.fields : [];
};

// 验证表单数据
export const validateStoryData = (categoryId: string, data: any): { isValid: boolean; errors: string[] } => {
  const fields = getCategoryFields(categoryId);
  const errors: string[] = [];
  
  fields.forEach(field => {
    const value = data[field.key];
    
    // 检查必填字段
    if (field.required && (!value || value.trim() === '')) {
      errors.push(`${field.label}是必填项`);
    }
    
    // 检查字符长度
    if (value && field.maxLength && value.length > field.maxLength) {
      errors.push(`${field.label}不能超过${field.maxLength}个字符`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};