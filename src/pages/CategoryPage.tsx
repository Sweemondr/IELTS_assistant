// 雅思串题助手 - 故事填写页面
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, AlertCircle, Check, Loader2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { CategoryType, UserStory, SentimentType, SentimentStoryData } from '../types';
import { CATEGORIES } from '../data/categories';
import { QUESTIONS_2025_5_8 as QUESTIONS } from '../data/questions';

// 导入表单组件
import PersonForm from '../components/forms/PersonForm';
import ThingForm from '../components/forms/ThingForm';
import PlaceForm from '../components/forms/PlaceForm';
import ExperienceForm from '../components/forms/ExperienceForm';
import SentimentSwitcher from '../components/SentimentSwitcher';


const CategoryPage: React.FC = () => {
  const { categoryType } = useParams<{ categoryType: CategoryType }>();
  const navigate = useNavigate();
  const userStories = useAppStore(state => state.userStories);
  const addUserStory = useAppStore(state => state.addUserStory);
  const updateUserStory = useAppStore(state => state.updateUserStory);
  const updateStoryDataBySentiment = useAppStore(state => state.updateStoryDataBySentiment);
  const getStoryDataBySentiment = useAppStore(state => state.getStoryDataBySentiment);
  const generateContent = useAppStore(state => state.generateContent);
  
  const [currentSentiment, setCurrentSentiment] = useState<SentimentType>('positive');
  const [formData, setFormData] = useState<SentimentStoryData>({
    positive: {},
    negative: {}
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // 保存状态管理
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  
  // 基础调试：确认组件正常加载
  console.log('🚀 [CategoryPage] 组件已加载，当前类型:', categoryType);
  
  // 获取当前类别信息
  const currentCategory = CATEGORIES.find(cat => cat.id === categoryType);
  
  // 获取当前类别的用户故事
  const currentStory = userStories.find(story => story.category === categoryType);
  
  // 获取当前情绪下的表单数据
  const getCurrentFormData = () => formData[currentSentiment] || {};
  
  // 获取填写状态
  const getFillingStatus = () => {
    if (!currentCategory) {
      return {
        hasPositiveData: false,
        hasNegativeData: false,
        positiveProgress: 0,
        negativeProgress: 0
      };
    }
    
    const totalFields = currentCategory.fields.length;
    
    // 计算正面情绪数据的填写情况
    const positiveData = formData.positive || {};
    const positiveFilledFields = currentCategory.fields.filter(field => {
      const value = positiveData[field.key];
      return value && typeof value === 'string' && value.trim() !== '';
    }).length;
    
    // 计算负面情绪数据的填写情况
    const negativeData = formData.negative || {};
    const negativeFilledFields = currentCategory.fields.filter(field => {
      const value = negativeData[field.key];
      return value && typeof value === 'string' && value.trim() !== '';
    }).length;
    
    return {
      hasPositiveData: positiveFilledFields > 0,
      hasNegativeData: negativeFilledFields > 0,
      positiveProgress: totalFields > 0 ? Math.min(1, positiveFilledFields / totalFields) : 0,
      negativeProgress: totalFields > 0 ? Math.min(1, negativeFilledFields / totalFields) : 0
    };
  };
  
  useEffect(() => {
    if (!currentCategory) {
      navigate('/');
      return;
    }
    
    // 如果已有故事数据，加载到表单中
    if (currentStory && currentStory.storyData) {
      // 检查是否为新的情绪分类数据结构
      if ('positive' in currentStory.storyData || 'negative' in currentStory.storyData) {
        setFormData(currentStory.storyData as SentimentStoryData);
      } else {
        // 兼容旧数据结构，将其作为正面情绪数据
        setFormData({
          positive: currentStory.storyData as Record<string, string>,
          negative: {}
        });
      }
    } else {
      // 初始化空表单数据
      const initialFieldData: any = {};
      
      // 为每个字段设置空值
      currentCategory.fields.forEach(field => {
        initialFieldData[field.key] = '';
      });
      
      setFormData({
        positive: { ...initialFieldData },
        negative: { ...initialFieldData }
      });
    }
  }, [categoryType, currentCategory, currentStory, navigate]);
  

  
  // 处理表单字段变化
  const handleFieldChange = (field: string, value: string) => {
    console.log('📝 [CategoryPage] handleFieldChange 被调用', {
      field,
      value,
      currentSentiment,
      timestamp: new Date().toISOString()
    });
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [currentSentiment]: {
          ...prev[currentSentiment],
          [field]: value
        }
      };
      
      console.log('📝 [CategoryPage] handleFieldChange 更新后的数据', {
        field,
        value,
        currentSentiment,
        updatedFormData: updated
      });
      
      return updated;
    });
    
    // 如果有当前故事，立即保存到store
    if (currentStory) {
      const updatedData = {
        ...getCurrentFormData(),
        [field]: value
      };
      updateStoryDataBySentiment(currentStory.id, currentSentiment, updatedData);
      console.log('💾 [CategoryPage] 字段变化时自动保存', {
        storyId: currentStory.id,
        field,
        currentSentiment
      });
    }
    
    // 清除该字段的验证错误
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };
  
  // 处理情绪切换
  const handleSentimentChange = (sentiment: SentimentType) => {
    console.log('🔄 [CategoryPage] 情绪切换', {
      from: currentSentiment,
      to: sentiment,
      timestamp: new Date().toISOString()
    });
    
    setCurrentSentiment(sentiment);
    // 清除验证错误
    setValidationErrors({});
  };
  
  // 验证单个情绪的表单数据
  const validateSentimentData = (sentiment: SentimentType, data: any): { isValid: boolean; errors: Record<string, string> } => {
    if (!currentCategory) {
      return { isValid: false, errors: {} };
    }
    
    const errors: Record<string, string> = {};
    const requiredFields = currentCategory.fields;
    
    // 检查每个必填字段
    for (const field of requiredFields) {
      const value = data[field.key];
      if (!value || value.trim() === '') {
        errors[field.key] = `${field.label}不能为空`;
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  // 验证表单（支持情绪分类）
  const validateForm = (isForGenerate: boolean = false, validateBothSentiments: boolean = false): boolean => {
    console.log('🔍 [CategoryPage] validateForm 开始验证', {
      isForGenerate,
      validateBothSentiments,
      categoryType,
      currentSentiment,
      currentCategoryFields: currentCategory?.fields,
      currentFormData: getCurrentFormData(),
      timestamp: new Date().toISOString()
    });
    
    if (!currentCategory) {
      console.log('❌ [CategoryPage] validateForm: currentCategory 为空');
      return false;
    }
    
    let errors: Record<string, string> = {};
    let isValid = true;
    
    if (validateBothSentiments) {
      // 验证两种情绪的数据
      console.log('🔍 [CategoryPage] validateForm: 验证两种情绪数据');
      
      const positiveValidation = validateSentimentData('positive', formData.positive);
      const negativeValidation = validateSentimentData('negative', formData.negative);
      
      // 至少一种情绪的数据必须完整
      if (!positiveValidation.isValid && !negativeValidation.isValid) {
        isValid = false;
        errors = currentSentiment === 'positive' ? positiveValidation.errors : negativeValidation.errors;
        console.log('❌ [CategoryPage] validateForm: 两种情绪数据都不完整', {
          positiveErrors: positiveValidation.errors,
          negativeErrors: negativeValidation.errors
        });
      } else {
        console.log('✅ [CategoryPage] validateForm: 至少一种情绪数据完整', {
          positiveValid: positiveValidation.isValid,
          negativeValid: negativeValidation.isValid
        });
      }
    } else {
      // 只验证当前选中情绪的数据
      console.log('🔍 [CategoryPage] validateForm: 验证当前情绪数据', { currentSentiment });
      
      const currentValidation = validateSentimentData(currentSentiment, getCurrentFormData());
      isValid = currentValidation.isValid;
      errors = currentValidation.errors;
      
      console.log('🔍 [CategoryPage] validateForm: 当前情绪验证结果', {
        currentSentiment,
        isValid,
        errors
      });
    }
    
    console.log('🔍 [CategoryPage] validateForm: 验证完成', {
      errorsCount: Object.keys(errors).length,
      errors,
      currentSentiment,
      isValid,
      validateBothSentiments
    });
    
    setValidationErrors(errors);
    
    console.log('🔍 [CategoryPage] validateForm: 返回验证结果', {
      isValid,
      currentSentiment,
      errorsCount: Object.keys(errors).length
    });
    
    return isValid;
  };
  
  // 保存故事
  const handleSave = async () => {
    console.log('🚀 [CategoryPage] ===== handleSave 函数开始执行 =====', {
      timestamp: new Date().toISOString(),
      formData,
      currentSentiment,
      categoryType,
      functionCalled: 'handleSave'
    });
    
    // 设置保存状态
    setIsSaving(true);
    setSaveSuccess(false);
    
    console.log('💾 [CategoryPage] handleSave 被调用', {
      timestamp: new Date().toISOString(),
      formData,
      currentSentiment,
      categoryType
    });
    
    try {
      // 模拟保存延迟，让用户看到加载状态
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 保存时进行宽松验证（允许部分字段为空）
      const validationResult = validateForm(false);
      console.log('💾 [CategoryPage] handleSave: 验证结果', {
        isValid: validationResult,
        currentSentiment,
        validationErrors
      });
      
      let storyId: string;
      
      if (currentStory) {
        storyId = currentStory.id;
        // 使用专门的方法更新当前情绪的数据
        updateStoryDataBySentiment(storyId, currentSentiment, getCurrentFormData());
        console.log('✅ [CategoryPage] 更新现有故事的情绪数据成功', {
          storyId,
          category: categoryType,
          currentSentiment
        });
      } else {
        // 创建新故事
        const userStory: UserStory = {
          id: Date.now().toString(),
          category: categoryType!,
          storyData: formData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        addUserStory(userStory);
        storyId = userStory.id;
        console.log('✅ [CategoryPage] 添加新故事成功', {
          storyId,
          category: userStory.category,
          currentSentiment
        });
      }
      
      // 显示保存成功状态
      setIsSaving(false);
      setSaveSuccess(true);
      
      console.log('✅ [CategoryPage] ===== handleSave 保存成功 =====', {
        timestamp: new Date().toISOString(),
        storyId,
        categoryType,
        currentSentiment
      });
      
      // 2.5秒后重置成功状态
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2500);
      
      console.log('🏁 [CategoryPage] ===== handleSave 函数执行完成 =====');
    } catch (error) {
      setIsSaving(false);
      setSaveSuccess(false);
      
      console.error('❌ [CategoryPage] 保存故事时出错', {
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        categoryType,
        currentSentiment,
        isUpdate: !!currentStory,
        timestamp: new Date().toISOString()
      });
      
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      console.log('❌ [CategoryPage] ===== handleSave 保存失败 =====', {
        timestamp: new Date().toISOString(),
        errorMessage,
        categoryType,
        currentSentiment
      });
      alert(`保存失败: ${errorMessage}，请重试`);
      console.log('🏁 [CategoryPage] ===== handleSave 函数执行完成（失败） =====');
    }
  };
  
  // 生成语料
  const handleGenerate = async () => {
    console.log('🎯 [CategoryPage] handleGenerate 开始执行', {
      category: categoryType,
      currentSentiment,
      timestamp: new Date().toISOString()
    });
    
    // 检查是否填写了正向和负向故事信息
    let positiveData: Record<string, string>;
    let negativeData: Record<string, string>;
    
    if (currentStory?.id) {
      // 如果有现有故事，从store获取数据
      positiveData = getStoryDataBySentiment(currentStory.id, 'positive');
      negativeData = getStoryDataBySentiment(currentStory.id, 'negative');
    } else {
      // 如果没有现有故事，从当前formData获取数据
      positiveData = formData.positive || {};
      negativeData = formData.negative || {};
    }
    
    console.log('📋 [CategoryPage] handleGenerate: 获取到的数据', {
      positiveData,
      negativeData,
      hasCurrentStory: !!currentStory?.id
    });
    
    const positiveValidation = validateSentimentData('positive', positiveData);
    const negativeValidation = validateSentimentData('negative', negativeData);
    
    console.log('📋 [CategoryPage] handleGenerate: 验证结果', {
      positiveValid: positiveValidation.isValid,
      negativeValid: negativeValidation.isValid,
      positiveErrors: positiveValidation.errors,
      negativeErrors: negativeValidation.errors
    });
    
    if (!positiveValidation.isValid || !negativeValidation.isValid) {
      alert('请先填写完正向和负向两种情绪的故事信息后再生成语料');
      console.log('❌ [CategoryPage] handleGenerate: 正负向故事信息不完整', {
        positiveValid: positiveValidation.isValid,
        negativeValid: negativeValidation.isValid,
        positiveErrors: positiveValidation.errors,
        negativeErrors: negativeValidation.errors
      });
      return;
    }
    
    setIsGenerating(true);
    setValidationErrors({});
    
    let storyId: string = '';
    
    try {
      // 验证当前情绪的表单数据
      const currentData = getCurrentFormData();
      const validation = validateSentimentData(currentSentiment, currentData);
      
      console.log('📋 [CategoryPage] handleGenerate: 表单验证结果', {
        isValid: validation.isValid,
        errors: validation.errors,
        currentSentiment,
        formData: currentData
      });
      
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        console.log('❌ [CategoryPage] handleGenerate: 表单验证失败', {
          errors: validation.errors,
          currentSentiment
        });
        return;
      }
      
      if (currentStory) {
        // 更新现有故事的情绪数据
        updateStoryDataBySentiment(currentStory.id, currentSentiment, currentData);
        storyId = currentStory.id;
        console.log('✅ [CategoryPage] handleGenerate: 更新现有故事的情绪数据成功', {
          storyId,
          category: categoryType,
          currentSentiment
        });
      } else {
        // 创建新故事
        const userStory: UserStory = {
          id: Date.now().toString(),
          category: categoryType!,
          storyData: formData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        addUserStory(userStory);
        storyId = userStory.id;
        console.log('✅ [CategoryPage] handleGenerate: 添加新故事成功', {
          storyId,
          category: userStory.category,
          currentSentiment
        });
      }
      
      // 生成语料
      console.log('🎯 [CategoryPage] 开始生成语料', {
        storyId,
        category: categoryType,
        timestamp: new Date().toISOString()
      });
      
      // 获取完整的故事数据用于生成语料
      const storyForGeneration = currentStory || {
        id: storyId,
        category: categoryType!,
        storyData: formData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('🔄 [CategoryPage] 调用 generateContent 函数...', {
        storyId,
        category: categoryType
      });
      await generateContent(storyForGeneration);
      console.log('✅ [CategoryPage] generateContent 函数调用完成');
      
      console.log('✅ [CategoryPage] 语料生成成功', {
        storyId,
        category: categoryType,
        currentSentiment
      });
      
      // 跳转到语料生成页面
      console.log('🔄 [CategoryPage] 跳转到语料生成页面', {
        targetRoute: `/generate/${categoryType}`
      });
      navigate(`/generate/${categoryType}`);
    } catch (error) {
      console.error('❌ [CategoryPage] 生成语料失败', {
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        storyId,
        category: categoryType,
        isUpdate: !!currentStory,
        timestamp: new Date().toISOString()
      });
      
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      alert(`生成语料失败: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
      console.log('🏁 [CategoryPage] handleGenerate 执行完成', {
        isGenerating: false,
        timestamp: new Date().toISOString()
      });
    }
  };
  
  // 检查是否可以生成语料（正负向信息都完整）
  const canGenerate = () => {
    if (!currentStory?.id) {
      // 如果没有故事，检查当前formData是否包含正负向数据
      const hasPositiveData = formData.positive && Object.values(formData.positive).some(value => value.trim() !== '');
      const hasNegativeData = formData.negative && Object.values(formData.negative).some(value => value.trim() !== '');
      return hasPositiveData && hasNegativeData;
    }
    
    // 如果有故事，检查正负向数据是否都完整
    const positiveData = getStoryDataBySentiment(currentStory.id, 'positive');
    const negativeData = getStoryDataBySentiment(currentStory.id, 'negative');
    
    const positiveValidation = validateSentimentData('positive', positiveData);
    const negativeValidation = validateSentimentData('negative', negativeData);
    
    return positiveValidation.isValid && negativeValidation.isValid;
  };
  
  // 获取保存按钮的样式和内容
  const getSaveButtonProps = () => {
    if (isSaving) {
      return {
        className: "flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg transition-colors cursor-not-allowed",
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
        text: "保存中...",
        disabled: true
      };
    }
    
    if (saveSuccess) {
      return {
        className: "flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg transition-colors",
        icon: <Check className="w-4 h-4" />,
        text: "已保存",
        disabled: false
      };
    }
    
    return {
      className: "flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors",
      icon: <Save className="w-4 h-4" />,
      text: "保存",
      disabled: false
    };
  };
  
  // 获取保存草稿按钮的样式和内容
  const getSaveDraftButtonProps = () => {
    if (isSaving) {
      return {
        className: "px-6 py-2 bg-blue-100 text-blue-700 rounded-lg transition-colors cursor-not-allowed",
        text: "保存中...",
        disabled: true
      };
    }
    
    if (saveSuccess) {
      return {
        className: "px-6 py-2 bg-green-100 text-green-700 rounded-lg transition-colors",
        text: "已保存",
        disabled: false
      };
    }
    
    return {
      className: "px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors",
      text: "保存草稿",
      disabled: false
    };
  };
  
  if (!currentCategory) {
    return null;
  }
  
  // 渲染对应的表单组件
  const renderForm = () => {
    const commonProps = {
      data: getCurrentFormData(),
      onChange: handleFieldChange,
      errors: validationErrors,
      sentiment: currentSentiment
    };

    switch (categoryType) {
      case 'person':
        return <PersonForm {...commonProps} />;
      case 'thing':
        return <ThingForm {...commonProps} />;
      case 'place':
        return <PlaceForm {...commonProps} />;
      case 'experience':
        return <ExperienceForm {...commonProps} />;
      default:
        return <div>未知的类别类型</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 头部导航 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>返回首页</span>
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">
                {currentCategory.nameCn}故事填写
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={(e) => {
                  console.log('🔘 [CategoryPage] ===== 顶部保存按钮被点击 =====', {
                    event: e,
                    timestamp: new Date().toISOString(),
                    buttonType: 'save',
                    categoryType,
                    currentSentiment,
                    formDataKeys: Object.keys(formData)
                  });
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔄 [CategoryPage] 即将调用 handleSave 函数...');
                  try {
                    handleSave();
                    console.log('✅ [CategoryPage] handleSave 函数调用完成');
                  } catch (error) {
                    console.error('❌ [CategoryPage] handleSave 函数调用失败:', error);
                  }
                }}
                type="button"
                disabled={getSaveButtonProps().disabled}
                className={getSaveButtonProps().className}
              >
                {getSaveButtonProps().icon}
                <span>{getSaveButtonProps().text}</span>
              </button>
              
              <button
                onClick={(e) => {
                  console.log('🔘 [CategoryPage] 生成语料按钮被点击', {
                    event: e,
                    timestamp: new Date().toISOString(),
                    buttonType: 'generate',
                    isGenerating,
                    disabled: isGenerating
                  });
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isGenerating) {
                    handleGenerate();
                  }
                }}
                type="button"
                disabled={isGenerating || !canGenerate()}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? '生成中...' : '生成语料'}</span>
              </button>
              

            </div>
          </div>
        </div>
      </div>
      
      {/* 主要内容区域 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* 类别说明 */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <h2 className="text-2xl font-bold text-gray-900">{currentCategory.nameCn}</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {currentCategory.description}
            </p>
          </div>
          
          {/* 情绪切换器 */}
          <div className="mb-8">
            <SentimentSwitcher
              currentSentiment={currentSentiment}
              onSentimentChange={handleSentimentChange}
              {...getFillingStatus()}
            />
          </div>


          
          {/* 表单区域 */}
          <div className="space-y-6">
            {renderForm()}
          </div>
          
          {/* 底部操作区域 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {currentStory ? '最后保存时间: ' + new Date(currentStory.updatedAt).toLocaleString() : '尚未保存'}
              </p>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={(e) => {
                    console.log('🔘 [CategoryPage] ===== 底部保存草稿按钮被点击 =====', {
                      event: e,
                      timestamp: new Date().toISOString(),
                      buttonType: 'save-draft',
                      categoryType,
                      currentSentiment,
                      formDataKeys: Object.keys(formData)
                    });
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔄 [CategoryPage] 即将调用 handleSave 函数...');
                    try {
                      handleSave();
                      console.log('✅ [CategoryPage] handleSave 函数调用完成');
                    } catch (error) {
                      console.error('❌ [CategoryPage] handleSave 函数调用失败:', error);
                    }
                  }}
                  type="button"
                  disabled={getSaveDraftButtonProps().disabled}
                  className={getSaveDraftButtonProps().className}
                >{getSaveDraftButtonProps().text}</button>
                
                <button
                  onClick={(e) => {
                    console.log('🔘 [CategoryPage] 底部按钮被点击', {
                      event: e,
                      timestamp: new Date().toISOString(),
                      buttonType: currentSentiment === 'positive' ? 'next-step' : 'generate-bottom',
                      currentSentiment,
                      isGenerating,
                      disabled: isGenerating
                    });
                    e.preventDefault();
                    e.stopPropagation();
                    if (!isGenerating) {
                      if (currentSentiment === 'positive') {
                        handleSentimentChange('negative');
                      } else {
                        handleGenerate();
                      }
                    }
                  }}
                  type="button"
                  disabled={isGenerating || (currentSentiment === 'negative' && !canGenerate())}
                  className="px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? '生成中...' : (currentSentiment === 'positive' ? '下一步' : '生成语料')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;