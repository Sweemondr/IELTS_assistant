// 雅思串题助手 - 核心类型定义

// 题季类型
export type Season = '2025年1-4月' | '2025年5-8月' | '2025年9-12月';

// 故事类别类型
export type CategoryType = 'person' | 'thing' | 'place' | 'experience';

// 情感倾向类型
export type SentimentType = 'positive' | 'negative';

// 题目接口
export interface Question {
  id: string;
  category: CategoryType;
  titleCn: string;        // 中文题目（简化版）
  titleFullCn: string;    // 中文题目（完整描述）
  titleEn: string;        // 英文题目
  sentiment: SentimentType;  // 情感倾向
  season: string;         // 题季
  keywords?: string[];    // 关键词
}

// 人物类故事数据结构
export interface PersonStory {
  name: string;           // 人物名称
  identity: string;        // 人物身份
  relationship: string;    // 与我的关系
  appearance?: string;     // 外貌特点
  personality: string;     // 性格特点
  event: string;          // 共同经历的事件
  feeling: string;        // 我的感受
}

// 事物类故事数据结构
export interface ThingStory {
  name: string;           // 事物名称
  firstTime: string;      // 第一次接触时间
  firstPlace: string;     // 第一次接触地点
  firstEvent: string;     // 第一次接触时发生的事
  features: string;       // 外观或特征
  reason: string;         // 喜欢的原因
  experience: string;     // 相关经历
  impact: string;         // 对我的影响
}

// 地点类故事数据结构
export interface PlaceStory {
  name: string;           // 地点名称
  type: string;           // 地点类型
  firstVisit: string;     // 第一次去的时间和原因
  environment: string;    // 环境特征
  activities: string;     // 在那里的活动
  companions: string;     // 与谁一起去
  reason: string;         // 喜欢的原因
}

// 经历类故事数据结构
export interface ExperienceStory {
  theme: string;          // 事件主题
  time: string;           // 发生时间
  place: string;          // 发生地点
  participants: string;   // 参与者
  process: string;        // 事情经过
  learning: string;       // 学到的东西/感受
}

// 用户故事联合类型
export type StoryData = PersonStory | ThingStory | PlaceStory | ExperienceStory;

// 情绪化故事数据结构
export interface SentimentStoryData {
  positive?: Record<string, string>;  // 正面印象故事
  negative?: Record<string, string>;  // 负面印象故事
}

// 用户故事接口
export interface UserStory {
  id: string;
  category: CategoryType;
  storyData: SentimentStoryData;  // 支持双情绪数据
  createdAt: Date;
  updatedAt: Date;
}

// 编辑记录接口
export interface EditRecord {
  timestamp: Date;
  instruction: string;
  beforeContent: string;
  afterContent: string;
}

// 匹配度等级类型
export type MatchingLevel = 'high' | 'medium' | 'low';

// 匹配度评估结果接口
export interface MatchingScore {
  questionId: string;
  score: number;           // 0-100的匹配分数
  level: MatchingLevel;    // 匹配度等级
  reasons: string[];       // 评估理由
  suggestions: string[];   // 改进建议
  lastEvaluated: Date;     // 最后评估时间
  isEvaluating?: boolean;  // 是否正在评估中
}

// 重生成记录接口
export interface RegenerationRecord {
  timestamp: Date;
  userPrompt: string;
  originalContent: string;
  newContent: string;
  reason: string;
  matchingScoreBefore?: number;
  matchingScoreAfter?: number;
}

// 生成内容接口
export interface GeneratedContent {
  id: string;
  storyId: string;
  questionId: string;
  sentiment: SentimentType;  // 情绪标识
  commonContent: string;     // 通用语料
  specificContent: string;   // 扣题语料
  commonContentCn?: string;  // 通用语料中文翻译
  specificContentCn?: string; // 扣题语料中文翻译
  translationSource?: 'ai' | 'manual'; // 翻译来源
  type: 'general' | 'specific';  // 内容类型
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  editHistory?: EditRecord[];
  matchingScore?: MatchingScore;  // 匹配度评估结果
  regenerationHistory?: RegenerationRecord[];  // 重生成历史
}

// 类别配置接口
export interface Category {
  id: CategoryType;
  name: string;
  nameCn: string;
  icon: string;
  description: string;
  fields: CategoryField[];
}

// 类别字段配置
export interface CategoryField {
  key: string;
  label: string;
  type: 'text' | 'textarea';
  required: boolean;
  placeholder?: string;
  maxLength?: number;
}

// API响应接口
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// AI生成请求接口
export interface GenerateContentRequest {
  category: CategoryType;
  storyData: Record<string, string>;
  sentiment: SentimentType;
  questionId?: string;
}

// AI生成响应接口
export interface GenerateContentResponse {
  commonContent: string;
  specificContent: string;
}

// 语料编辑请求接口
export interface EditContentRequest {
  originalContent: string;
  editInstruction: string;
  contentType: 'common' | 'specific';
}

// 匹配度评估请求接口
export interface EvaluateMatchingRequest {
  commonContent: string;
  question: Question;
  storyData: Record<string, string>;
}

// 匹配度评估响应接口
export interface EvaluateMatchingResponse {
  score: number;
  level: MatchingLevel;
  reasons: string[];
  suggestions: string[];
}

// 重生成语料请求接口
export interface RegenerateContentRequest {
  storyId: string;
  questionId: string;
  userPrompt?: string;
  currentContent: string;
  reason: string;
}

// 重生成语料响应接口
export interface RegenerateContentResponse {
  newContent: string;
  matchingScore: MatchingScore;
}

// 统计数据接口
export interface Statistics {
  totalQuestions: number;
  questionsByCategory: Record<CategoryType, number>;
  questionsBySentiment: Record<SentimentType, number>;
  generatedStories: number;
  generatedContents: number;
}

// 应用状态接口
export interface AppState {
  // 数据状态
  userStories: UserStory[];
  generatedContents: GeneratedContent[];
  
  // UI状态
  isLoading: boolean;
  error: string | null;
  
  // 操作方法
  addUserStory: (story: UserStory) => void;
  updateUserStory: (storyId: string, updates: Partial<UserStory>) => void;
  deleteUserStory: (storyId: string) => void;
  generateContent: (storyId: string, questionIds: string[]) => Promise<void>;
  editContent: (contentId: string, instruction: string) => Promise<void>;
  editTranslation: (contentId: string, instruction: string, isCommon?: boolean) => Promise<GeneratedContent>;
  retranslateContent: (contentId: string, isCommon?: boolean) => Promise<GeneratedContent>;
  deleteContent: (contentId: string) => void;
  
  // 匹配度评估方法
  evaluateMatching: (contentId: string) => Promise<void>;
  
  // 重生成相关方法
  regenerateContent: (contentId: string, customPrompt?: string, questionTitle?: string) => Promise<void>;
  
  clearError: () => void;
  loadFromStorage: () => void;
}