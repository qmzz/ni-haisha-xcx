// pages/herb-detail/herb-detail.js — 药材详情页面逻辑
const app = getApp();

Page({
  data: {
    herbId: null,
    herb: null,
    loading: true,
    relatedFormulas: [],
  },

  onLoad(options) {
    const id = options.id;
    this.setData({ herbId: id });
    this.loadHerbDetail(id);
  },

  // 解析性味字符串为 property + flavor
  parsePropertyFlavor(xingwei) {
    if (!xingwei) return { property: '', flavor: '' };
    const parts = xingwei.split(/[,，]/);
    if (parts.length >= 2) {
      return { property: parts[0].trim(), flavor: parts.slice(1).join('，').trim() };
    }
    return { property: xingwei, flavor: '' };
  },

  // 从云函数加载药材详情
  loadHerbDetail(id) {
    if (!id) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      this.setData({ loading: false });
      return;
    }

    wx.cloud.callFunction({
      name: 'knowledgeQuery',
      data: {
        collection: 'ni_herbs',
        action: 'detail',
        id
      },
      success: (res) => {
        if (res.result && res.result.code === 0 && res.result.data) {
          const doc = res.result.data;
          const pf = this.parsePropertyFlavor(doc.extra && doc.extra['性味']);
          const property = pf.property;
          const flavor = pf.flavor;

          const herb = {
            id: doc._id,
            name: doc.name || '未知',
            category: doc.category || '',
            subCategory: (doc.extra && doc.extra['分类']) || '',
            property,
            flavor,
            meridian: (doc.extra && doc.extra['归经']) || '',
            toxicity: (doc.extra && doc.extra['毒性']) || '',
            functions: (doc.extra && doc.extra['功效']) || '',
            dosage: (doc.extra && doc.extra['用法用量']) || (doc.extra && doc.extra['用量']) || '',
            taboos: (doc.extra && doc.extra['禁忌']) || '',
            origin: (doc.extra && doc.extra['产地']) || '',
            harvest: (doc.extra && doc.extra['采收']) || '',
            processing: (doc.extra && doc.extra['炮制']) || '',
            descriptions: (doc.content || '').replace(/\\n/g, '\n'),
          };
          // 只有数据中确实有 pinyin 字段时才设置
          if (doc.pinyin) herb.pinyin = doc.pinyin;
          if (doc.latinName || doc.latin_name) herb.latinName = doc.latinName || doc.latin_name;

          this.setData({
            herb,
            loading: false
          });
        } else {
          wx.showToast({ title: '未找到该药材', icon: 'none' });
          this.setData({ loading: false });
        }
      },
      fail: (err) => {
        console.error('加载药材详情失败:', err);
        wx.showToast({ title: '加载失败', icon: 'none' });
        this.setData({ loading: false });
      }
    });
  },

  // 跳转方剂详情
  goToFormula(e) {
    const id = e.currentTarget.dataset.id;
    if (id) {
      wx.navigateTo({
        url: `/pages/formula-detail/formula-detail?id=${id}`
      });
    }
  },

  // 分享
  onShareAppMessage() {
    return {
      title: `${this.data.herb ? this.data.herb.name : '药材'} — 倪海厦经方助手`,
      path: `/pages/herb-detail/herb-detail?id=${this.data.herbId}`,
    };
  }
});
