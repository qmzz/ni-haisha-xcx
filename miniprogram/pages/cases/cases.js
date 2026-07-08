// pages/cases/cases.js — 医案馆页面逻辑
const app = getApp();

Page({
  data: {
    activeCategory: 'all',
    categories: [{ id: 'all', name: '全部' }],
    caseList: [],
    loading: false,
    page: 1,
    pageSize: 20,
    hasMore: true,
    total: 0,
  },

  onLoad() {
    this.loadCategories();
    this.loadCases();
  },

  onPullDownRefresh() {
    this.setData({ page: 1, caseList: [], hasMore: true });
    this.loadCases();
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return;
    this.loadMore();
  },

  // 从云函数获取分类列表
  loadCategories() {
    wx.cloud.callFunction({
      name: 'knowledgeQuery',
      data: {
        collection: 'ni_cases',
        action: 'categories'
      },
      success: (res) => {
        if (res.result && res.result.code === 0 && res.result.data) {
          const cats = [{ id: 'all', name: '全部' }];
          res.result.data.forEach(name => {
            cats.push({ id: name, name });
          });
          this.setData({ categories: cats });
        }
      },
      fail: (err) => {
        console.error('获取医案分类失败:', err);
      }
    });
  },

  // 映射云数据库文档到列表卡片字段
  mapCaseForList(doc) {
    return {
      id: doc._id,
      title: doc.name || doc.title || '',
      source: doc.source || '',
      doctor: (doc.extra && doc.extra['医家']) || '倪海厦',
      date: doc.date || '',
      category: doc.category || '',
      summary: (doc.extra && doc.extra['摘要']) || doc.summary || '',
      expanded: false,
      details: {
        symptoms: (doc.extra && doc.extra['症状']) || '',
        diagnosis: (doc.extra && doc.extra['诊断']) || '',
        formula: (doc.extra && doc.extra['方药']) || '',
        result: (doc.extra && doc.extra['疗效']) || '',
        analysis: (doc.extra && doc.extra['按语']) || doc.content || '',
      }
    };
  },

  // 从云函数分页加载医案列表
  loadCases() {
    const { activeCategory, page, pageSize } = this.data;
    this.setData({ loading: true });

    const query = { page, pageSize };
    if (activeCategory !== 'all') {
      query.category = activeCategory;
    }

    wx.cloud.callFunction({
      name: 'knowledgeQuery',
      data: {
        collection: 'ni_cases',
        action: 'list',
        query
      },
      success: (res) => {
        if (res.result && res.result.code === 0 && res.result.data) {
          const { list, total } = res.result.data;
          const mappedList = list.map(doc => this.mapCaseForList(doc));
          const caseList = page === 1 ? mappedList : [...this.data.caseList, ...mappedList];
          this.setData({
            caseList,
            total,
            hasMore: caseList.length < total,
            loading: false
          });
        } else {
          this.setData({ loading: false });
        }
      },
      fail: (err) => {
        console.error('加载医案列表失败:', err);
        this.setData({ loading: false });
        wx.showToast({ title: '加载失败', icon: 'none' });
      }
    });
  },

  loadMore() {
    this.setData({ page: this.data.page + 1 }, () => {
      this.loadCases();
    });
  },

  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ activeCategory: category, page: 1, caseList: [] });
    this.loadCases();
  },

  // 展开/收起详情
  toggleDetail(e) {
    const id = e.currentTarget.dataset.id;
    const caseList = this.data.caseList.map(item => {
      if (item.id === id) {
        item.expanded = !item.expanded;
      }
      return item;
    });
    this.setData({ caseList });
  },

  onShareAppMessage() {
    return {
      title: '倪海厦经方助手医案馆 — 经典经方医案研习',
      path: '/pages/cases/cases',
    };
  }
});
