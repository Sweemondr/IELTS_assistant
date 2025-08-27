// 雅思串题助手 - 首页
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryType } from '../types';
import SeasonSelector from '../components/SeasonSelector';
import CategoryCards from '../components/CategoryCards';
import StatisticsPanel from '../components/StatisticsPanel';
import { useAppStore } from '../store/useAppStore';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  // const { currentSeason } = useAppStore();

  const handleCategorySelect = (category: CategoryType) => {
    // 导航到对应的类别页面
    navigate(`/category/${category}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部区域 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">
                雅思串题助手
              </h1>
              <p className="mt-2 text-gray-600">生成属于自己的雅思口语语料，8个故事搞定Part2</p>
            </div>
            
            {/* 题季选择器 */}
            <div className="w-full lg:w-80">
              <SeasonSelector />
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 题库统计 */}
          <section>
            <StatisticsPanel />
          </section>

          {/* 选择话题类别 */}
          <section>
            <CategoryCards onCategorySelect={handleCategorySelect} />
          </section>

          {/* 使用说明 */}
          <section className="bg-white rounded-xl p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              使用说明
            </h2>
            
            {/* 桌面端流程图 */}
            <div className="hidden md:block">
              <div className="flex items-center justify-between relative">
                {/* 连接线 */}
                <div className="absolute top-6 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-green-200 via-purple-200 to-orange-200 z-0"></div>
                
                {/* 步骤1 */}
                <div className="flex flex-col items-center relative z-10 bg-white px-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 border-2 border-blue-200">
                    <span className="text-blue-600 font-bold text-lg">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-center">选择类别</h3>
                  <p className="text-sm text-gray-600 text-center max-w-32">从人物、事物、地点、经历四大类别中选择一个</p>
                </div>
                
                {/* 步骤2 */}
                <div className="flex flex-col items-center relative z-10 bg-white px-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 border-2 border-green-200">
                    <span className="text-green-600 font-bold text-lg">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-center">填写信息</h3>
                  <p className="text-sm text-gray-600 text-center max-w-32">根据提示填写你的个人故事和经历</p>
                </div>
                
                {/* 步骤3 */}
                <div className="flex flex-col items-center relative z-10 bg-white px-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 border-2 border-purple-200">
                    <span className="text-purple-600 font-bold text-lg">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-center">生成语料</h3>
                  <p className="text-sm text-gray-600 text-center max-w-32">AI智能生成通用和扣题两种语料内容</p>
                </div>
                
                {/* 步骤4 */}
                <div className="flex flex-col items-center relative z-10 bg-white px-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4 border-2 border-orange-200">
                    <span className="text-orange-600 font-bold text-lg">4</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-center">编辑使用</h3>
                  <p className="text-sm text-gray-600 text-center max-w-32">在线编辑语料内容，一键复制到剪贴板</p>
                </div>
              </div>
            </div>
            
            {/* 移动端垂直流程图 */}
            <div className="md:hidden space-y-6">
              {/* 步骤1 */}
              <div className="flex items-start space-x-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-200">
                    <span className="text-blue-600 font-bold text-lg">1</span>
                  </div>
                  <div className="w-0.5 h-8 bg-blue-200 mt-2"></div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="font-semibold text-gray-900 mb-2">选择类别</h3>
                  <p className="text-sm text-gray-600">
                    从人物、事物、地点、经历四大类别中选择一个
                  </p>
                </div>
              </div>
              
              {/* 步骤2 */}
              <div className="flex items-start space-x-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center border-2 border-green-200">
                    <span className="text-green-600 font-bold text-lg">2</span>
                  </div>
                  <div className="w-0.5 h-8 bg-green-200 mt-2"></div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="font-semibold text-gray-900 mb-2">填写信息</h3>
                  <p className="text-sm text-gray-600">
                    根据提示填写你的个人故事和经历
                  </p>
                </div>
              </div>
              
              {/* 步骤3 */}
              <div className="flex items-start space-x-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center border-2 border-purple-200">
                    <span className="text-purple-600 font-bold text-lg">3</span>
                  </div>
                  <div className="w-0.5 h-8 bg-purple-200 mt-2"></div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="font-semibold text-gray-900 mb-2">生成语料</h3>
                  <p className="text-sm text-gray-600">
                    AI智能生成通用和扣题两种语料内容
                  </p>
                </div>
              </div>
              
              {/* 步骤4 */}
              <div className="flex items-start space-x-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center border-2 border-orange-200">
                    <span className="text-orange-600 font-bold text-lg">4</span>
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="font-semibold text-gray-900 mb-2">编辑使用</h3>
                  <p className="text-sm text-gray-600">
                    在线编辑语料内容，一键复制到剪贴板
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 功能特色 */}
          <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              功能特色
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI智能生成</h3>
                <p className="text-gray-600">
                  基于你的个人信息，智能生成高质量的雅思口语语料
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">串题复用</h3>
                <p className="text-gray-600">
                  一个故事框架可以应用到多个相似题目，提高备考效率
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">在线编辑</h3>
                <p className="text-gray-600">
                  支持在线编辑和优化语料内容，满足个性化需求
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2025 雅思串题助手. 助力雅思口语高分.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;