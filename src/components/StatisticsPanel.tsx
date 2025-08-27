// 雅思串题助手 - 统计面板组件
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, Download } from 'lucide-react';
import { useStatistics } from '../store/useAppStore';

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  onClick?: () => void;
  clickable?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value, color, onClick, clickable = false }) => {
  const baseClasses = "flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 transition-all";
  const interactiveClasses = clickable 
    ? "hover:shadow-md hover:border-gray-300 cursor-pointer transform hover:scale-[1.02]" 
    : "hover:shadow-md";
  
  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };
  
  return (
    <div 
      className={`${baseClasses} ${interactiveClasses}`}
      onClick={handleClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
    >
      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${color}`}>
        <div className="text-white">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {clickable && (
          <p className="text-xs text-gray-500 mt-1">
            {label === '当季题库' ? '点击下载题库' : '点击查看详情'}
          </p>
        )}
      </div>
    </div>
  );
};

interface StatisticsPanelProps {
  className?: string;
}

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ className = '' }) => {
  const statistics = useStatistics();
  const navigate = useNavigate();

  const handleViewHistory = () => {
    navigate('/history');
  };

  const handleDownloadFile = async () => {
    try {
      const fileName = '2025年5-8月part2.xlsx';
      
      // 从public目录或相对路径获取文件
      const response = await fetch('/2025年5-8月part2.xlsx');
      
      if (!response.ok) {
        throw new Error('文件下载失败');
      }
      
      const blob = await response.blob();
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      
      // 添加到DOM，点击，然后移除
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理URL对象
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载文件时出错:', error);
      alert('文件下载失败，请检查文件是否存在');
    }
  };

  const generalStats = [
    {
      icon: <Download size={20} />,
      label: '当季题库',
      value: statistics.totalQuestions,
      color: 'bg-green-500',
      clickable: true,
      onClick: handleDownloadFile
    },
    {
      icon: <TrendingUp size={20} />,
      label: '已创建故事',
      value: statistics.generatedStories,
      color: 'bg-pink-500',
      clickable: true,
      onClick: handleViewHistory
    }
  ];

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          题库统计
        </h2>
        <p className="text-gray-600">当前题季的题目总数和创建故事历史</p>
      </div>

      {/* 总体统计 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {generalStats.map((stat, index) => (
          <StatItem
            key={index}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            color={stat.color}
            clickable={stat.clickable}
            onClick={stat.onClick}
          />
        ))}
      </div>

      {/* 情绪分布统计 */}

    </div>
  );
};

export default StatisticsPanel;