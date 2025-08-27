// 雅思串题助手 - 主应用组件
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import GeneratePage from './pages/GeneratePage';
import HistoryPage from './pages/HistoryPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 首页路由 */}
          <Route path="/" element={<HomePage />} />
          
          {/* 类别页面路由 */}
          <Route path="/category/:categoryType" element={<CategoryPage />} />
          
          {/* 故事创建页面路由 - 暂时重定向到首页 */}
          <Route path="/story/create/:categoryType" element={<Navigate to="/" replace />} />
          
          {/* 故事编辑页面路由 - 暂时重定向到首页 */}
          <Route path="/story/edit/:storyId" element={<Navigate to="/" replace />} />
          
          {/* 语料生成页面路由 */}
          <Route path="/generate/:type" element={<GeneratePage />} />
          
          {/* 语料历史页面路由 */}
          <Route path="/history" element={<HistoryPage />} />
          
          {/* 语料编辑页面路由 - 暂时重定向到首页 */}
          <Route path="/content/edit/:contentId" element={<Navigate to="/" replace />} />
          
          {/* 404 页面 - 重定向到首页 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;