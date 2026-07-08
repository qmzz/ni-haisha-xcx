// pages/index/index.js — 首页逻辑
const app = getApp();

Page({
  data: {
    // 今日问候
    greeting: '',
    dateStr: '',
    // 快捷功能入口
    quickEntries: [
      { id: 'diagnose', name: 'AI诊脉', icon: '🩺', desc: '智能辨证论治', path: '/pages/diagnose/diagnose', color: '#C62828' },
      { id: 'herbs', name: '药材库', icon: '🌿', desc: '416味中药', path: '/pages/herbs/herbs', color: '#2E7D32' },
      { id: 'formulas', name: '经方阁', icon: '📜', desc: '114首经方', path: '/pages/formulas/formulas', color: '#6B3410' },
      { id: 'acupoints', name: '穴位图', icon: '📍', desc: '412处穴位', path: '/pages/acupoints/acupoints', color: '#D2691E' },
    ],
    // 次要功能入口
    secondaryEntries: [
      { id: 'cases', name: '医案馆', icon: '📋', desc: '经典医案研习', path: '/pages/cases/cases' },
      { id: 'learn', name: '学习路径', icon: '📚', desc: '从入门到精通', path: '/pages/learn/learn' },
      { id: 'chat', name: 'AI对话', icon: '💬', desc: '自由提问', path: '/pages/chat/chat' },
    ],
    // 今日推荐方剂
    dailyFormula: null,
    // 入门引导提示
    showGuide: false,
  },

  onLoad() {
    this.setGreeting();
    this.loadDailyRecommendation();
  },

  onShow() {
    // 每次进入首页更新问候
    this.setGreeting();
    // 检查是否首次访问
    const isFirstVisit = wx.getStorageSync('isFirstVisit');
    if (!isFirstVisit) {
      this.setData({ showGuide: true });
      wx.setStorageSync('isFirstVisit', true);
    }
  },

  // 设置问候语
  setGreeting() {
    const hour = new Date().getHours();
    let greeting = '早安';
    if (hour >= 6 && hour < 9) {
      greeting = '早上好 ☀️';
    } else if (hour >= 9 && hour < 12) {
      greeting = '上午好 🌤️';
    } else if (hour >= 12 && hour < 14) {
      greeting = '中午好 ☀️';
    } else if (hour >= 14 && hour < 18) {
      greeting = '下午好 🌥️';
    } else if (hour >= 18 && hour < 22) {
      greeting = '晚上好 🌙';
    } else {
      greeting = '夜深了 🌙';
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekStr = `星期${weekDays[now.getDay()]}`;

    this.setData({
      greeting,
      dateStr: `${dateStr} ${weekStr}`
    });
  },

  // 加载今日推荐
  loadDailyRecommendation() {
    // 模拟今日推荐方剂（后续从云数据库获取）
    const dailyFormula = {
      name: '桂枝汤',
      category: '解表剂',
      usage: '解肌发表，调和营卫。主治外感风寒表虚证。',
      herbs: '桂枝 三两、芍药 三两、甘草 二两（炙）、生姜 三两、大枣 十二枚',
      source: '《伤寒论》'
    };
    this.setData({ dailyFormula });
  },

  // 导航到功能页
  navigateTo(e) {
    const path = e.currentTarget.dataset.path;
    if (!path) return;
    wx.navigateTo({ url: path });
  },

  // 切换 tab 导航
  switchTab(e) {
    const path = e.currentTarget.dataset.path;
    if (!path) return;
    wx.switchTab({ url: path });
  },

  // 关闭引导
  closeGuide() {
    this.setData({ showGuide: false });
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '倪海厦经方助手 — AI智能中医诊疗',
      path: '/pages/index/index',
      imageUrl: ''
    };
  }
});
