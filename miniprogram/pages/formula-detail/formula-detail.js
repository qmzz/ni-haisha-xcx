// pages/formula-detail/formula-detail.js — 方剂详情页面逻辑
const app = getApp();

Page({
  data: {
    formulaId: null,
    formula: null,
    loading: true,
  },

  onLoad(options) {
    const id = options.id;
    this.setData({ formulaId: id });
    this.loadFormulaDetail(id);
  },

  // 解析组成药材列表
  parseHerbs(compositionStr) {
    if (!compositionStr) return [];
    const parts = compositionStr.split(/[,，、;；]/).filter(Boolean);
    return parts.map(part => {
      const trimmed = part.trim();
      // 尝试分离药名和剂量（简单分割会在详情页需要时由模板展示）
      return { name: trimmed, dosage: '', note: '' };
    });
  },

  // 从云函数加载方剂详情
  loadFormulaDetail(id) {
    if (!id) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      this.setData({ loading: false });
      return;
    }

    wx.cloud.callFunction({
      name: 'knowledgeQuery',
      data: {
        collection: 'ni_formulas',
        action: 'detail',
        id
      },
      success: (res) => {
        if (res.result && res.result.code === 0 && res.result.data) {
          const doc = res.result.data;
          const compositionStr = doc.extra && doc.extra['组成'] || '';

          const formula = {
            id: doc._id,
            name: doc.name || '未知方剂',
            source: doc.source || '',
            author: doc.author || '',
            category: doc.category || '',
            subCategory: (doc.extra && doc.extra['分类']) || '',
            usage: (doc.extra && doc.extra['功效']) || (doc.extra && doc.extra['功用']) || '',
            indication: (doc.extra && doc.extra['主治']) || '',
            herbs: this.parseHerbs(compositionStr),
            preparation: (doc.extra && doc.extra['用法']) || '',
            analysis: (doc.extra && doc.extra['方解']) || doc.content || '',
            taboos: (doc.extra && doc.extra['禁忌']) || '',
            relatedFormulas: (doc.extra && doc.extra['附方']) || (doc.extra && doc.extra['相关方剂']) || [],
          };

          this.setData({
            formula,
            loading: false
          });
        } else {
          wx.showToast({ title: '未找到该方剂', icon: 'none' });
          this.setData({ loading: false });
        }
      },
      fail: (err) => {
        console.error('加载方剂详情失败:', err);
        wx.showToast({ title: '加载失败', icon: 'none' });
        this.setData({ loading: false });
      }
    });
  },

  goToHerbDetail(e) {
    const name = e.currentTarget.dataset.name;
    wx.showToast({ title: `查看 ${name} 详情`, icon: 'none', duration: 1500 });
  },

  goToFormula(e) {
    const id = e.currentTarget.dataset.id;
    if (id) {
      wx.redirectTo({
        url: `/pages/formula-detail/formula-detail?id=${id}`
      });
    }
  },

  onShareAppMessage() {
    return {
      title: `${this.data.formula ? this.data.formula.name : '方剂'} — 倪海厦经方助手`,
      path: `/pages/formula-detail/formula-detail?id=${this.data.formulaId}`,
    };
  }
});
