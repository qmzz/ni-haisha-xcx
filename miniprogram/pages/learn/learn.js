// pages/learn/learn.js — 学习路径页面逻辑
const app = getApp();

Page({
  data: {
    // 学习阶段
    stages: [
      {
        id: 'beginner',
        title: '🌱 入门：中医基础',
        desc: '掌握阴阳五行、藏象经络、病因病机等中医基础理论',
        completed: 0,
        total: 8,
        courses: [
          { name: '阴阳学说基础', type: '理论', status: 'recommend' },
          { name: '五行学说入门', type: '理论', status: 'recommend' },
          { name: '藏象学说 · 五脏', type: '理论', status: 'pending' },
          { name: '藏象学说 · 六腑', type: '理论', status: 'pending' },
          { name: '气血津液理论', type: '理论', status: 'pending' },
          { name: '病因学说 · 六淫', type: '理论', status: 'pending' },
          { name: '病机学说 · 邪正盛衰', type: '理论', status: 'pending' },
          { name: '经络学说基础', type: '理论', status: 'pending' },
        ]
      },
      {
        id: 'intermediate',
        title: '🌿 进阶：诊断入门',
        desc: '学习望闻问切四诊技术，掌握八纲辨证与脏腑辨证',
        completed: 0,
        total: 10,
        courses: [
          { name: '望诊：舌诊入门', type: '诊断', status: 'recommend' },
          { name: '闻诊：听声音辨虚实', type: '诊断', status: 'pending' },
          { name: '问诊：十问歌详解', type: '诊断', status: 'pending' },
          { name: '脉诊入门：二十八脉', type: '诊断', status: 'pending' },
          { name: '八纲辨证之表里', type: '辨证', status: 'pending' },
          { name: '八纲辨证之寒热', type: '辨证', status: 'pending' },
          { name: '八纲辨证之虚实', type: '辨证', status: 'pending' },
          { name: '八纲辨证之阴阳', type: '辨证', status: 'pending' },
          { name: '脏腑辨证 · 心病', type: '辨证', status: 'pending' },
          { name: '脏腑辨证 · 肝病', type: '辨证', status: 'pending' },
        ]
      },
      {
        id: 'advanced',
        title: '📜 专精：经方入门',
        desc: '研读《伤寒论》《金匮要略》，掌握经方辨证论治体系',
        completed: 0,
        total: 12,
        courses: [
          { name: '《伤寒论》序言导读', type: '经典', status: 'pending' },
          { name: '太阳病篇精讲', type: '经典', status: 'recommend' },
          { name: '阳明病篇精讲', type: '经典', status: 'pending' },
          { name: '少阳病篇精讲', type: '经典', status: 'pending' },
          { name: '太阴病篇精讲', type: '经典', status: 'pending' },
          { name: '少阴病篇精讲', type: '经典', status: 'pending' },
          { name: '厥阴病篇精讲', type: '经典', status: 'pending' },
          { name: '桂枝汤类方精讲', type: '经方', status: 'pending' },
          { name: '麻黄汤类方精讲', type: '经方', status: 'pending' },
          { name: '柴胡汤类方精讲', type: '经方', status: 'pending' },
          { name: '泻心汤类方精讲', type: '经方', status: 'pending' },
          { name: '四逆汤类方精讲', type: '经方', status: 'pending' },
        ]
      },
      {
        id: 'master',
        title: '💎 精通：临床实战',
        desc: '研习倪海厦临床医案，培养辨证思维，提升临床能力',
        completed: 0,
        total: 6,
        courses: [
          { name: '倪海厦医案精选 · 伤寒篇', type: '临床', status: 'pending' },
          { name: '倪海厦医案精选 · 杂病篇', type: '临床', status: 'pending' },
          { name: '倪海厦医案精选 · 妇科篇', type: '临床', status: 'pending' },
          { name: '倪海厦经方剂量观', type: '理论', status: 'pending' },
          { name: '倪海厦针灸临床经验', type: '针灸', status: 'pending' },
          { name: '临床辨证思维训练', type: '临床', status: 'pending' },
        ]
      }
    ],
    // 当前展开的阶段
    expandedStage: 'beginner',
  },

  onLoad() {
    // 从本地存储读取学习进度
    const progress = wx.getStorageSync('learnProgress') || {};
    if (Object.keys(progress).length > 0) {
      this.loadProgress(progress);
    }
  },

  loadProgress(progress) {
    const stages = this.data.stages.map(stage => {
      const stageProgress = progress[stage.id] || { completed: 0, courses: {} };
      stage.completed = stageProgress.completed || 0;
      stage.courses = stage.courses.map((course, index) => {
        const status = stageProgress.courses && stageProgress.courses[index];
        return { ...course, status: status || course.status };
      });
      return stage;
    });
    this.setData({ stages });
  },

  toggleStage(e) {
    const stageId = e.currentTarget.dataset.stage;
    const expandedStage = this.data.expandedStage === stageId ? '' : stageId;
    this.setData({ expandedStage });
  },

  toggleCourse(e) {
    const { stageId, courseIndex } = e.currentTarget.dataset;
    const stages = this.data.stages.map(stage => {
      if (stage.id === stageId) {
        const course = stage.courses[courseIndex];
        // 切换状态
        course.status = course.status === 'completed' ? 'pending' : 'completed';
        // 重新计算完成数
        stage.completed = stage.courses.filter(c => c.status === 'completed').length;
      }
      return stage;
    });
    this.setData({ stages });

    // 保存进度到本地
    const progress = {};
    stages.forEach(stage => {
      progress[stage.id] = {
        completed: stage.completed,
        courses: {}
      };
      stage.courses.forEach((course, index) => {
        progress[stage.id].courses[index] = course.status;
      });
    });
    wx.setStorageSync('learnProgress', progress);

    // 提示
    const course = stages.find(s => s.id === stageId).courses[courseIndex];
    if (course.status === 'completed') {
      wx.showToast({ title: '已标记完成 ✓', icon: 'success', duration: 1200 });
    }
  },

  onShareAppMessage() {
    return {
      title: '倪海厦经方助手学习路径 — 从入门到精通',
      path: '/pages/learn/learn',
    };
  }
});
