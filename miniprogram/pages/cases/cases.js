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
  // 注意：列表查询不返回 content 字段，医案数据没有 extra 字段
  mapCaseForList(doc) {
    return {
      id: doc._id,
      title: doc.name || '',
      source: '',
      doctor: '倪海厦',
      category: doc.category || '',
      summary: doc.summary || '',
      expanded: false,
      details: {}
    };
  },

  // 从云函数分页加载医案列表
  loadCases() {
    const activeCategory = this.data.activeCategory;
    const page = this.data.page;
    const pageSize = this.data.pageSize;
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
          const list = res.result.data.list || [];
          const total = res.result.data.total || 0;
          const mappedList = list.map(doc => this.mapCaseForList(doc));
          const caseList = page === 1 ? mappedList : this.data.caseList.concat(mappedList);
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

  // 展开/收起详情 — 展开时从云函数加载完整内容
  toggleDetail(e) {
    const id = e.currentTarget.dataset.id;
    const caseList = this.data.caseList.map(item => {
      if (item.id === id) {
        item.expanded = !item.expanded;
        // 展开时加载详情
        if (item.expanded && !item.detailContent) {
          item.loadingDetail = true;
          this.setData({ caseList });
          wx.cloud.callFunction({
            name: 'knowledgeQuery',
            data: { collection: 'ni_cases', action: 'detail', id },
            success: (res) => {
              if (res.result && res.result.code === 0 && res.result.data) {
                const content = (res.result.data.content || '').replace(/\\n/g, '\n')
                  .replace(/\*\*([^*]+)\*\*/g, '$1')
                  .replace(/^#+ /gm, '')
                  .replace(/^\- /gm, '• ');
                const updated = this.data.caseList.map(c => {
                  if (c.id === id) { c.detailContent = content; c.loadingDetail = false; }
                  return c;
                });
                this.setData({ caseList: updated });
              }
            },
            fail: () => {
              const updated = this.data.caseList.map(c => {
                if (c.id === id) { c.loadingDetail = false; }
                return c;
              });
              this.setData({ caseList: updated });
            }
          });
        }
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
