// pages/formulas/formulas.js — 经方阁页面逻辑
const app = getApp();

Page({
  data: {
    searchKeyword: '',
    activeCategory: 'all',
    categories: [{ id: 'all', name: '全部' }],
    formulaList: [],
    loading: false,
    page: 1,
    pageSize: 20,
    hasMore: true,
    total: 0,
  },

  onLoad() {
    this.loadCategories();
    this.loadFormulas();
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true, formulaList: [] });
    this.loadFormulas();
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
        collection: 'ni_formulas',
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
        console.error('获取方剂分类失败:', err);
      }
    });
  },

  // 映射云数据库文档到列表卡片字段
  // 注意：列表查询不返回 content 字段，用 summary 代替
  mapFormulaForList(doc) {
    const composition = doc.composition || [];
    const herbNames = composition.map(c => c.drug).join('、');
    return {
      id: doc._id,
      name: doc.name || '',
      source: doc.source || '',
      category: doc.category || '',
      subCategory: doc.category || '',
      difficulty: 'basic',
      usage: doc.summary || '',
      herbs: herbNames,
      herbCount: composition.length || 0,
    };
  },

  // 从云函数分页加载方剂列表
  loadFormulas() {
    const { searchKeyword, activeCategory, page, pageSize } = this.data;
    this.setData({ loading: true });

    const query = { page, pageSize };
    if (searchKeyword.trim()) {
      query.keyword = searchKeyword.trim();
    }
    if (activeCategory !== 'all') {
      query.category = activeCategory;
    }

    wx.cloud.callFunction({
      name: 'knowledgeQuery',
      data: {
        collection: 'ni_formulas',
        action: 'list',
        query
      },
      success: (res) => {
        if (res.result && res.result.code === 0 && res.result.data) {
          const { list, total } = res.result.data;
          const mappedList = list.map(doc => this.mapFormulaForList(doc));
          const formulaList = page === 1 ? mappedList : [...this.data.formulaList, ...mappedList];
          this.setData({
            formulaList,
            total,
            hasMore: formulaList.length < total,
            loading: false
          });
        } else {
          this.setData({ loading: false });
        }
      },
      fail: (err) => {
        console.error('加载方剂列表失败:', err);
        this.setData({ loading: false });
        wx.showToast({ title: '加载失败', icon: 'none' });
      }
    });
  },

  loadMore() {
    this.setData({ page: this.data.page + 1 }, () => {
      this.loadFormulas();
    });
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value, page: 1, formulaList: [] });
    this.loadFormulas();
  },

  clearSearch() {
    this.setData({ searchKeyword: '', page: 1, formulaList: [] });
    this.loadFormulas();
  },

  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      activeCategory: category,
      page: 1,
      hasMore: true,
      formulaList: []
    });
    this.loadFormulas();
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/formula-detail/formula-detail?id=${id}`
    });
  },

  onShareAppMessage() {
    return {
      title: '倪海厦经方助手经方阁 — 经典方剂大全',
      path: '/pages/formulas/formulas',
    };
  }
});
