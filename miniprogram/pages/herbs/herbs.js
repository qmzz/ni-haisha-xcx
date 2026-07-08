// pages/herbs/herbs.js — 药材库页面逻辑
const app = getApp();

Page({
  data: {
    // 搜索关键词
    searchKeyword: '',
    // 当前选中的分类
    activeCategory: 'all',
    // 分类列表
    categories: [{ id: 'all', name: '全部' }],
    // 药材列表
    herbList: [],
    // 加载状态
    loading: false,
    // 分页
    page: 1,
    pageSize: 20,
    hasMore: true,
    total: 0,
  },

  onLoad() {
    this.loadCategories();
    this.loadHerbs();
  },

  onShow() {
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true, herbList: [] });
    this.loadHerbs();
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
        collection: 'ni_herbs',
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
        console.error('获取分类失败:', err);
      }
    });
  },

  // 解析性味字符串为 property + flavor
  parsePropertyFlavor(xingwei) {
    if (!xingwei) return { property: '', flavor: '' };
    // 格式如 "温，辛、微苦" 或 "微寒，苦"
    const parts = xingwei.split(/[,，]/);
    if (parts.length >= 2) {
      return { property: parts[0].trim(), flavor: parts.slice(1).join('，').trim() };
    }
    return { property: xingwei, flavor: '' };
  },

  // 映射云数据库文档到列表卡片字段
  mapHerbForList(doc) {
    const { property, flavor } = this.parsePropertyFlavor(doc.extra && doc.extra['性味']);
    return {
      id: doc._id,
      name: doc.name || '',
      pinyin: doc.pinyin || '',
      category: doc.category || '',
      property,
      flavor,
      functions: (doc.extra && doc.extra['功效']) || '',
    };
  },

  // 从云函数分页加载药材列表
  loadHerbs() {
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
        collection: 'ni_herbs',
        action: 'list',
        query
      },
      success: (res) => {
        if (res.result && res.result.code === 0 && res.result.data) {
          const { list, total } = res.result.data;
          const mappedList = list.map(doc => this.mapHerbForList(doc));
          const herbList = page === 1 ? mappedList : [...this.data.herbList, ...mappedList];
          this.setData({
            herbList,
            total,
            hasMore: herbList.length < total,
            loading: false
          });
        } else {
          this.setData({ loading: false });
          if (res.result && res.result.code !== 0) {
            wx.showToast({ title: res.result.message || '查询失败', icon: 'none' });
          }
        }
      },
      fail: (err) => {
        console.error('加载药材列表失败:', err);
        this.setData({ loading: false });
        wx.showToast({ title: '加载失败', icon: 'none' });
      }
    });
  },

  // 加载更多
  loadMore() {
    this.setData({ page: this.data.page + 1 }, () => {
      this.loadHerbs();
    });
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value, page: 1, herbList: [] });
    this.loadHerbs();
  },

  // 清空搜索
  clearSearch() {
    this.setData({ searchKeyword: '', page: 1, herbList: [] });
    this.loadHerbs();
  },

  // 分类切换
  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      activeCategory: category,
      page: 1,
      hasMore: true,
      herbList: []
    });
    this.loadHerbs();
  },

  // 跳转药材详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/herb-detail/herb-detail?id=${id}`
    });
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '倪海厦经方助手药材库 — 中药知识大全',
      path: '/pages/herbs/herbs',
    };
  }
});
