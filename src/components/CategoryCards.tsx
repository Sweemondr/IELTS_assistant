// 雅思串题助手 - 四大类别导航卡片组件
import React from 'react';
import { User, Package, MapPin, Calendar } from 'lucide-react';
import { CategoryType } from '../types';
import { useAppActions, useStatistics } from '../store/useAppStore';

interface CategoryCardProps {
  category: CategoryType;
  title: string;
  description: string;
  icon: React.ReactNode;
  questionCount: number;
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  title,
  description,
  icon,
  questionCount,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className="
        group relative p-6 bg-white rounded-xl border-2 border-gray-200
        hover:border-blue-300 hover:shadow-lg
        transition-all duration-300 ease-in-out
        cursor-pointer transform hover:-translate-y-1
      "
    >
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-bl-3xl opacity-50 group-hover:opacity-70 transition-opacity" />
      
      {/* 图标 */}
      <div className="relative z-10 flex items-center justify-center w-12 h-12 mb-4 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
        <div className="text-blue-600 group-hover:text-blue-700">
          {icon}
        </div>
      </div>
      
      {/* 内容 */}
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          {description}
        </p>
        
        {/* 题目数量 */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {questionCount} 道题目
          </span>
          <div className="text-blue-500 group-hover:text-blue-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CategoryCardsProps {
  onCategorySelect: (category: CategoryType) => void;
  className?: string;
}

export const CategoryCards: React.FC<CategoryCardsProps> = ({ 
  onCategorySelect, 
  className = '' 
}) => {
  const statistics = useStatistics();
  
  const categories = [
    {
      category: 'person' as CategoryType,
      title: '人物类',
      description: '描述你认识的人、崇拜的人或想见的人，包括家人、朋友、名人等',
      icon: <User size={24} />,
      questionCount: statistics.questionsByCategory.person || 0
    },
    {
      category: 'thing' as CategoryType,
      title: '事物类',
      description: '描述物品、技能、文章、电影等具体的事物或抽象概念',
      icon: <Package size={24} />,
      questionCount: statistics.questionsByCategory.thing || 0
    },
    {
      category: 'place' as CategoryType,
      title: '地点类',
      description: '描述你去过的地方、想去的地方或特殊的场所',
      icon: <MapPin size={24} />,
      questionCount: statistics.questionsByCategory.place || 0
    },
    {
      category: 'experience' as CategoryType,
      title: '经历类',
      description: '描述你的个人经历、难忘的事件或特殊的体验',
      icon: <Calendar size={24} />,
      questionCount: statistics.questionsByCategory.experience || 0
    }
  ];

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">选择话题类别</h2>
        <p className="text-gray-600">
          选择一个类别开始创建你的故事框架，生成个性化的雅思口语语料
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.category}
            category={cat.category}
            title={cat.title}
            description={cat.description}
            icon={cat.icon}
            questionCount={cat.questionCount}
            onClick={() => onCategorySelect(cat.category)}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryCards;