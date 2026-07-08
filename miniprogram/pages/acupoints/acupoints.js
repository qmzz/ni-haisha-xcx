// pages/acupoints/acupoints.js — 穴位图页面逻辑
const app = getApp();

Page({
  data: {
    searchKeyword: '',
    activeMeridian: 'all',
    meridians: [{ id: 'all', name: '全部' }],
    acupointList: [],
    loading: false,
    page: 1,
    pageSize: 20,
    hasMore: true,
    total: 0,
    showMap: false,
  },

  onLoad() {
    this.loadMeridians();
    this.loadAcupoints();
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true, acupointList: [] });
    this.loadAcupoints();
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return;
    this.loadMore();
  },

  // 经络标准名称映射到简称
  getShortName(fullName) {
    const map = {
      '手太阴肺经': '肺经', '手阳明大肠经': '大肠经',
      '足阳明胃经': '胃经', '足太阴脾经': '脾经',
      '手少阴心经': '心经', '手太阳小肠经': '小肠经',
      '足太阳膀胱经': '膀胱经', '足少阴肾经': '肾经',
      '手厥阴心包经': '心包经', '手少阳三焦经': '三焦经',
      '足少阳胆经': '胆经', '足厥阴肝经': '肝经',
      '任脉': '任脉', '督脉': '督脉',
    };
    return map[fullName] || fullName;
  },

  // 从云函数获取经络分类列表
  loadMeridians() {
    wx.cloud.callFunction({
      name: 'knowledgeQuery',
      data: {
        collection: 'ni_acupoints',
        action: 'categories',
        query: { categoryField: 'meridian' }
      },
      success: (res) => {
        if (res.result && res.result.code === 0 && res.result.data) {
          const mers = [{ id: 'all', name: '全部' }];
          res.result.data.forEach(name => {
            mers.push({ id: name, name: this.getShortName(name) });
          });
          this.setData({ meridians: mers });
        }
      },
      fail: (err) => {
        console.error('获取经络分类失败:', err);
      }
    });
  },

  // 映射云数据库文档到列表卡片字段
  // 注意：列表查询不返回 content 字段，用 summary + 顶部字段代替
  mapAcupointForList(doc) {
    return {
      id: doc._id,
      name: doc.name || '',
      code: doc.code || '',
      meridian: doc.meridian || '',
      location: doc.location || '',
      summary: doc.summary || '',
    };
  },

  // 从云函数分页加载穴位列表
  loadAcupoints() {
    const searchKeyword = this.data.searchKeyword;
    const activeMeridian = this.data.activeMeridian;
    const page = this.data.page;
    const pageSize = this.data.pageSize;
    this.setData({ loading: true });

    const query = { page, pageSize };
    if (searchKeyword.trim()) {
      query.keyword = searchKeyword.trim();
    }
    if (activeMeridian !== 'all') {
      query.category = activeMeridian;
      query.categoryField = 'meridian';
    }

    wx.cloud.callFunction({
      name: 'knowledgeQuery',
      data: {
        collection: 'ni_acupoints',
        action: 'list',
        query
      },
      success: (res) => {
        if (res.result && res.result.code === 0 && res.result.data) {
          const list = res.result.data.list || [];
          const total = res.result.data.total || 0;
          const mappedList = list.map(doc => this.mapAcupointForList(doc));
          const acupointList = page === 1 ? mappedList : this.data.acupointList.concat(mappedList);
          this.setData({
            acupointList,
            total,
            hasMore: acupointList.length < total,
            loading: false
          });
        } else {
          this.setData({ loading: false });
        }
      },
      fail: (err) => {
        console.error('加载穴位列表失败:', err);
        this.setData({ loading: false });
        wx.showToast({ title: '加载失败', icon: 'none' });
      }
    });
  },

  loadMore() {
    this.setData({ page: this.data.page + 1 }, () => {
      this.loadAcupoints();
    });
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value, page: 1, acupointList: [] });
    this.loadAcupoints();
  },

  clearSearch() {
    this.setData({ searchKeyword: '', page: 1, acupointList: [] });
    this.loadAcupoints();
  },

  switchMeridian(e) {
    const meridian = e.currentTarget.dataset.meridian;
    this.setData({ activeMeridian: meridian, page: 1, hasMore: true, acupointList: [] });
    this.loadAcupoints();
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/acupoint-detail/acupoint-detail?id=${id}`
    });
  },

  toggleMap() {
    this.setData({ showMap: !this.data.showMap });
  },

  onShareAppMessage() {
    return {
      title: '倪海厦经方助手穴位图 — 穴位大全',
      path: '/pages/acupoints/acupoints',
    };
  }
});
