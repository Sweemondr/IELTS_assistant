// 雅思串题助手 - 题目数据
import { Question, CategoryType } from '../types';

// 2025年5-8月题季题目数据
export const QUESTIONS_2025_5_8: Question[] = [
  // 人物类题目 (13道)
  {
    id: 'person-001',
    category: 'person',
    titleCn: '侍花弄果之人',
    titleFullCn: '描述一个你认识的、喜欢种植植物的人',
    titleEn: 'Describe a person you know who enjoys growing plants',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['种植', '植物', '园艺']
  },
  {
    id: 'person-002',
    category: 'person',
    titleCn: '聪明的人',
    titleFullCn: '描述一个你认为很聪明的人',
    titleEn: 'Describe a person you think is very intelligent',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['聪明', '智慧', '才能']
  },
  {
    id: 'person-003',
    category: 'person',
    titleCn: '会打扮的朋友',
    titleFullCn: '描述一位很会打扮、穿搭出色的朋友',
    titleEn: 'Describe a friend who dresses well',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['打扮', '穿搭', '时尚']
  },
  {
    id: 'person-004',
    category: 'person',
    titleCn: '由不喜欢到喜欢的朋友',
    titleFullCn: '描述一位你起初不喜欢但后来成为朋友的人',
    titleEn: 'Describe a person you didn\'t like at first but later became friends with',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['转变', '友谊', '误解']
  },
  {
    id: 'person-005',
    category: 'person',
    titleCn: '劝你的人',
    titleFullCn: '描述一次有人劝说你做某事且你对此感到高兴的经历中的那个人',
    titleEn: 'Describe a person who persuaded you to do something and you felt happy about it',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['劝说', '说服', '建议']
  },
  {
    id: 'person-006',
    category: 'person',
    titleCn: '激励你做有趣事情的人',
    titleFullCn: '描述一个激励你去做一件有趣事情的人',
    titleEn: 'Describe a person who encouraged you to do something interesting',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['激励', '鼓励', '有趣']
  },
  {
    id: 'person-007',
    category: 'person',
    titleCn: '发小',
    titleFullCn: '描述一位你童年的朋友',
    titleEn: 'Describe a childhood friend',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['童年', '发小', '回忆']
  },
  {
    id: 'person-008',
    category: 'person',
    titleCn: '不同文化的朋友',
    titleFullCn: '描述一位与你来自不同文化背景、你喜欢与之相处的人',
    titleEn: 'Describe a person from a different culture that you enjoy spending time with',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['文化', '多元', '交流']
  },
  {
    id: 'person-009',
    category: 'person',
    titleCn: '奇装异服的人',
    titleFullCn: '描述一个穿着风格与众不同的人',
    titleEn: 'Describe a person who wears unusual clothes',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['独特', '风格', '个性']
  },
  {
    id: 'person-010',
    category: 'person',
    titleCn: '喜欢的歌手',
    titleFullCn: '描述一位你喜欢其音乐/歌曲的歌手',
    titleEn: 'Describe a singer you like',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['歌手', '音乐', '喜欢']
  },
  {
    id: 'person-011',
    category: 'person',
    titleCn: '想见的名人',
    titleFullCn: '描述一位你想见的名人',
    titleEn: 'Describe a famous person you would like to meet',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['名人', '偶像', '见面']
  },
  {
    id: 'person-012',
    category: 'person',
    titleCn: '想要一起学习/工作的人',
    titleFullCn: '描述一位你想与之学习/工作的人',
    titleEn: 'Describe a person you would like to study or work with',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['合作', '学习', '工作']
  },
  {
    id: 'person-013',
    category: 'person',
    titleCn: '熊孩子',
    titleFullCn: '描述一次你在公共场合看到小孩行为不当的经历中的那个孩子/孩子们',
    titleEn: 'Describe a naughty child you saw behaving badly in public',
    sentiment: 'negative',
    season: '2025年5-8月',
    keywords: ['熊孩子', '行为不当', '公共场合']
  },

  // 事物类题目 (15道)
  {
    id: 'thing-001',
    category: 'thing',
    titleCn: '健康文章',
    titleFullCn: '描述一篇你在杂志或网络上读到的健康相关文章',
    titleEn: 'Describe a health-related article you read in a magazine or online',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['健康', '文章', '阅读']
  },
  {
    id: 'thing-002',
    category: 'thing',
    titleCn: '教别人的技能',
    titleFullCn: '描述一种你觉得可以教给别人的技能',
    titleEn: 'Describe a skill you think you could teach other people',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['技能', '教学', '分享']
  },
  {
    id: 'thing-003',
    category: 'thing',
    titleCn: '漂亮物品',
    titleFullCn: '描述一个你认为很漂亮的物品',
    titleEn: 'Describe something you think is beautiful',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['漂亮', '美丽', '物品']
  },
  {
    id: 'thing-004',
    category: 'thing',
    titleCn: '想再看的电影',
    titleFullCn: '描述一部你最近看过并想再次观看的电影',
    titleEn: 'Describe a film you watched recently and want to watch again',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['电影', '重看', '喜欢']
  },
  {
    id: 'thing-005',
    category: 'thing',
    titleCn: '让你自豪的照片',
    titleFullCn: '描述一张你拍摄并让你感到自豪的照片',
    titleEn: 'Describe a photo you took that you are proud of',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['照片', '摄影', '自豪']
  },
  {
    id: 'thing-006',
    category: 'thing',
    titleCn: '天空中所见',
    titleFullCn: '描述一次你在天空中看到的事物（如风筝/鸟/日落等）',
    titleEn: 'Describe something you saw in the sky (e.g., a kite, a bird, a sunset)',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['天空', '自然', '观察']
  },
  {
    id: 'thing-007',
    category: 'thing',
    titleCn: '有名产品的广告',
    titleFullCn: '描述一个介绍知名产品的广告',
    titleEn: 'Describe an advertisement for a famous product',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['广告', '产品', '营销']
  },
  {
    id: 'thing-008',
    category: 'thing',
    titleCn: '有趣小说/故事',
    titleFullCn: '描述一本/一个你觉得有趣的小说/故事',
    titleEn: 'Describe an interesting novel or story you have read',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['小说', '故事', '有趣']
  },
  {
    id: 'thing-009',
    category: 'thing',
    titleCn: '搞笑电影',
    titleFullCn: '描述一部让你大笑的电影',
    titleEn: 'Describe a movie that made you laugh',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['电影', '搞笑', '娱乐']
  },
  {
    id: 'thing-010',
    category: 'thing',
    titleCn: '喜欢的节目',
    titleFullCn: '描述一个你喜欢观看的节目',
    titleEn: 'Describe a TV program or show you like to watch',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['节目', '电视', '娱乐']
  },
  {
    id: 'thing-011',
    category: 'thing',
    titleCn: '二手物品网站',
    titleFullCn: '描述一个销售二手物品的网站',
    titleEn: 'Describe a website where people sell second-hand items',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['网站', '二手', '购物']
  },
  {
    id: 'thing-012',
    category: 'thing',
    titleCn: '想尝试的户外运动',
    titleFullCn: '描述一项你想首次尝试的户外运动',
    titleEn: 'Describe an outdoor sport you would like to try for the first time',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['户外运动', '尝试', '新体验']
  },
  {
    id: 'thing-013',
    category: 'thing',
    titleCn: '常用的网站',
    titleFullCn: '描述一个你经常访问的网站',
    titleEn: 'Describe a website you often visit',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['网站', '常用', '互联网']
  },
  {
    id: 'thing-014',
    category: 'thing',
    titleCn: '塑料废品',
    titleFullCn: '描述一次你看到大量塑料垃圾的经历',
    titleEn: 'Describe a time when you saw a lot of plastic waste',
    sentiment: 'negative',
    season: '2025年5-8月',
    keywords: ['塑料垃圾', '环保', '污染']
  },
  {
    id: 'thing-015',
    category: 'thing',
    titleCn: '难用的科技产品',
    titleFullCn: '描述一件你拥有的、但觉得难以使用的科技产品',
    titleEn: 'Describe a piece of technology you own that you find difficult to use',
    sentiment: 'negative',
    season: '2025年5-8月',
    keywords: ['科技产品', '难用', '困难']
  },

  // 地点类题目 (11道)
  {
    id: 'place-001',
    category: 'place',
    titleCn: '喜欢的商店',
    titleFullCn: '描述一家你喜欢去的商店/店铺',
    titleEn: 'Describe a shop you like to visit',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['商店', '购物', '喜欢']
  },
  {
    id: 'place-002',
    category: 'place',
    titleCn: '想再次造访的城市',
    titleFullCn: '描述一座你去过并想再次造访的城市',
    titleEn: 'Describe a city you have been to and would like to visit again',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['城市', '旅行', '重访']
  },
  {
    id: 'place-003',
    category: 'place',
    titleCn: '受欢迎的运动场所',
    titleFullCn: '描述一个受欢迎的运动场所（如体育场）',
    titleEn: 'Describe a popular place for sports',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['运动场所', '体育', '受欢迎']
  },
  {
    id: 'place-004',
    category: 'place',
    titleCn: '他人的房子',
    titleFullCn: '描述一处你认为很棒的他人房子/公寓',
    titleEn: 'Describe someone else\'s house or apartment that you think is good',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['房子', '公寓', '居住']
  },
  {
    id: 'place-005',
    category: 'place',
    titleCn: '推荐给游客的地方',
    titleFullCn: '描述一个你想向游客推荐的本国旅游地',
    titleEn: 'Describe a place in your country you would recommend to tourists',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['旅游地', '推荐', '本国']
  },
  {
    id: 'place-006',
    category: 'place',
    titleCn: '看到很多动物的地方',
    titleFullCn: '描述一个你看到很多动物的地方',
    titleEn: 'Describe a place where you saw many animals',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['动物', '自然', '观察']
  },
  {
    id: 'place-007',
    category: 'place',
    titleCn: '熟悉的人的家',
    titleFullCn: '描述一处你经常拜访、很熟悉的人的家',
    titleEn: 'Describe the home of a person you know well and often visit',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['熟人', '家', '拜访']
  },
  {
    id: 'place-008',
    category: 'place',
    titleCn: '户外活动的地方',
    titleFullCn: '描述一个你去过并进行户外活动的地方',
    titleEn: 'Describe a place you have been to for outdoor activities',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['户外活动', '地点', '运动']
  },
  {
    id: 'place-009',
    category: 'place',
    titleCn: '有趣的建筑',
    titleFullCn: '描述一座你想参观的不寻常但有趣的建筑',
    titleEn: 'Describe an unusual but interesting building you would like to visit',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['建筑', '不寻常', '有趣']
  },
  {
    id: 'place-010',
    category: 'place',
    titleCn: '很吵的地方',
    titleFullCn: '描述一个你去过的很吵的地方',
    titleEn: 'Describe a noisy place you have been to',
    sentiment: 'negative',
    season: '2025年5-8月',
    keywords: ['嘈杂', '噪音', '环境']
  },
  {
    id: 'place-011',
    category: 'place',
    titleCn: '家中放松的地方',
    titleFullCn: '描述你在家中最能让你放松的地方',
    titleEn: 'Describe a place in your home where you feel most relaxed',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['家', '放松', '舒适']
  },

  // 经历类题目 (20道)
  {
    id: 'experience-001',
    category: 'experience',
    titleCn: '收到现金礼物',
    titleFullCn: '描述一次你收到现金作为礼物的经历',
    titleEn: 'Describe a time when you received money as a gift',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['现金', '礼物', '收到']
  },
  {
    id: 'experience-002',
    category: 'experience',
    titleCn: '校外学到的重要事情',
    titleFullCn: '描述一件你在校外学到的重要事情',
    titleEn: 'Describe something important you learned outside of school',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['校外学习', '重要', '经验']
  },
  {
    id: 'experience-003',
    category: 'experience',
    titleCn: '与别人的争论',
    titleFullCn: '描述一次你和别人发生分歧/争论的经历',
    titleEn: 'Describe a disagreement or argument you had with someone',
    sentiment: 'negative',
    season: '2025年5-8月',
    keywords: ['争论', '分歧', '冲突']
  },
  {
    id: 'experience-004',
    category: 'experience',
    titleCn: '制定活动计划',
    titleFullCn: '描述一次你和他人一起制定活动计划的经历',
    titleEn: 'Describe a time when you planned an activity with others',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['计划', '活动', '合作']
  },
  {
    id: 'experience-005',
    category: 'experience',
    titleCn: '有趣的谈话',
    titleFullCn: '描述一次你印象深刻且有趣的谈话',
    titleEn: 'Describe an interesting conversation you had',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['谈话', '有趣', '印象深刻']
  },
  {
    id: 'experience-006',
    category: 'experience',
    titleCn: '印象深刻的英语课',
    titleFullCn: '描述一节让你印象深刻且喜欢的英语课',
    titleEn: 'Describe an English lesson that you enjoyed and found impressive',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['英语课', '印象深刻', '喜欢']
  },
  {
    id: 'experience-007',
    category: 'experience',
    titleCn: '与他人分享东西',
    titleFullCn: '描述一次你必须与他人分享某样东西的经历',
    titleEn: 'Describe a time when you had to share something with others',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['分享', '合作', '互助']
  },
  {
    id: 'experience-008',
    category: 'experience',
    titleCn: '努力实现的目标',
    titleFullCn: '描述一个你设定并尽力实现的目标',
    titleEn: 'Describe a goal you set and tried hard to achieve',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['目标', '努力', '实现']
  },
  {
    id: 'experience-009',
    category: 'experience',
    titleCn: '等待某件事情',
    titleFullCn: '描述一次你决定等待某件事情的经历',
    titleEn: 'Describe a time when you decided to wait for something',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['等待', '耐心', '决定']
  },
  {
    id: 'experience-010',
    category: 'experience',
    titleCn: '朋友间的争执',
    titleFullCn: '描述一次你两位朋友的争执',
    titleEn: 'Describe a time when two of your friends had a disagreement',
    sentiment: 'negative',
    season: '2025年5-8月',
    keywords: ['朋友', '争执', '矛盾']
  },
  {
    id: 'experience-011',
    category: 'experience',
    titleCn: '错过约会',
    titleFullCn: '描述一次你忘记/错过约会的经历',
    titleEn: 'Describe a time when you missed or forgot an appointment',
    sentiment: 'negative',
    season: '2025年5-8月',
    keywords: ['失约', '忘记', '约会']
  },
  {
    id: 'experience-012',
    category: 'experience',
    titleCn: '困难但成功的事情',
    titleFullCn: '描述一件你做起来很难但最终成功的事情',
    titleEn: 'Describe something that was difficult for you but you succeeded in the end',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['困难', '成功', '克服']
  },
  {
    id: 'experience-013',
    category: 'experience',
    titleCn: '观看的体育比赛',
    titleFullCn: '描述一次你观看的体育比赛',
    titleEn: 'Describe a sports match you watched',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['体育比赛', '观看', '运动']
  },
  {
    id: 'experience-014',
    category: 'experience',
    titleCn: '想观看的体育赛事',
    titleFullCn: '描述一场你想以观众身份参加的体育赛事',
    titleEn: 'Describe a sports event you would like to watch as a spectator',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['体育赛事', '观众', '期待']
  },
  {
    id: 'experience-015',
    category: 'experience',
    titleCn: '搜索信息',
    titleFullCn: '描述一次你需要搜索信息的经历',
    titleEn: 'Describe a time when you needed to search for information',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['搜索', '信息', '研究']
  },
  {
    id: 'experience-016',
    category: 'experience',
    titleCn: '与年长者的谈话',
    titleFullCn: '描述一次你与一位年长者进行的有趣谈话',
    titleEn: 'Describe an interesting conversation you had with an elderly person',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['老人', '谈话', '有趣']
  },
  {
    id: 'experience-017',
    category: 'experience',
    titleCn: '收到想要的物品',
    titleFullCn: '描述一次别人送给你真正想要物品的经历',
    titleEn: 'Describe a time when someone gave you something you really wanted',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['礼物', '想要', '收到']
  },
  {
    id: 'experience-018',
    category: 'experience',
    titleCn: '开学第一天',
    titleFullCn: '描述你记得的开学第一天',
    titleEn: 'Describe your first day at school that you remember',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['开学', '第一天', '回忆']
  },
  {
    id: 'experience-019',
    category: 'experience',
    titleCn: '与他人合作完成的事情',
    titleFullCn: '描述一件你和他人/一群人一起完成的事情',
    titleEn: 'Describe something you did with someone or a group of people',
    sentiment: 'positive',
    season: '2025年5-8月',
    keywords: ['合作', '团队', '完成']
  },
  {
    id: 'experience-020',
    category: 'experience',
    titleCn: '购物遇到的问题',
    titleFullCn: '描述一次你在线上或实体店购物遇到的问题',
    titleEn: 'Describe a time when you had a problem while shopping online or in a store',
    sentiment: 'negative',
    season: '2025年5-8月',
    keywords: ['购物', '问题', '困扰']
  }
];

// 按类别分组的题目
export const getQuestionsByCategory = (category: CategoryType): Question[] => {
  return QUESTIONS_2025_5_8.filter(q => q.category === category);
};

// 获取统计数据
export const getQuestionsStatistics = () => {
  const total = QUESTIONS_2025_5_8.length;
  const byCategory = {
    person: getQuestionsByCategory('person').length,
    thing: getQuestionsByCategory('thing').length,
    place: getQuestionsByCategory('place').length,
    experience: getQuestionsByCategory('experience').length
  };
  const bySentiment = {
    positive: QUESTIONS_2025_5_8.filter(q => q.sentiment === 'positive').length,
    negative: QUESTIONS_2025_5_8.filter(q => q.sentiment === 'negative').length
  };
  
  return {
    total,
    byCategory,
    bySentiment
  };
};

// 可用的题季列表
export const AVAILABLE_SEASONS = ['2025年5-8月'];

// 默认题季
export const DEFAULT_SEASON = '2025年5-8月';