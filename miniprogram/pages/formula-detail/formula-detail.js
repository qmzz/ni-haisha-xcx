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

  // 从 content markdown 中提取 **key：** value 格式的字段
  extractContentField(content, label) {
    if (!content) return '';
    const regex = new RegExp(`\\*\\*${label}[：:]\\*\\*\\s*(.+?)(?:\\n|$)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : '';
  },

  // 从 content markdown 中提取 ## 标题 下的整段内容
  extractContentSection(content, sectionName) {
    if (!content) return '';
    const regex = new RegExp(`##\\s+.*${sectionName}.*\\n+([\\s\\S]*?)(?=\\n##\\s|$)`, 'i');
    const match = content.match(regex);
    if (!match) return '';
    // 基本清洗：去掉加粗标记和列表标记
    return match[1]
      .replace(/\\n/g, '\n')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/^\-\s/gm, '• ')
      .replace(/^>\s?/gm, '')
      .trim();
  },

  // 解析组成药材列表
  parseHerbs(compositionStr) {
    if (!compositionStr) return [];
    const parts = compositionStr.split(/[,，、;；]/).filter(Boolean);
    return parts.map(part => {
      const trimmed = part.trim();
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
          // 将字面 \\n 还原为真实换行
          const content = (doc.content || '').replace(/\\n/g, '\n');
          const composition = doc.composition || [];

          const formula = {
            id: doc._id,
            name: doc.name || '未知方剂',
            source: this.extractContentField(content, '来源') || doc.source || '',
            category: doc.category || '',
            subCategory: this.extractContentField(content, '分类') || doc.category || '',
            usage: this.extractContentField(content, '功效') || '',
            indication: this.extractContentSection(content, '主治') || this.extractContentField(content, '主治') || '',
            herbs: composition.map(c => ({
              name: c.drug || '',
              dosage: c.dosage || '',
              note: c.role || ''
            })),
            preparation: this.extractContentField(content, '用法') || '',
            analysis: this.extractContentSection(content, '倪师讲解') || this.extractContentSection(content, '方解') || content,
            taboos: this.extractContentField(content, '禁忌') || '',
            relatedFormulas: [],
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
