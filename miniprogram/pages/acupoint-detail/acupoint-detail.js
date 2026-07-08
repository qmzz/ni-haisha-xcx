// pages/acupoint-detail/acupoint-detail.js — 穴位详情页面逻辑
const app = getApp();

Page({
  data: {
    acupointId: null,
    acupoint: null,
    loading: true,
  },

  onLoad(options) {
    const id = options.id;
    this.setData({ acupointId: id });
    this.loadAcupointDetail(id);
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
    return match[1]
      .replace(/\\n/g, '\n')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/^\- /gm, '• ')
      .replace(/^>\s?/gm, '')
      .trim();
  },

  // 从云函数加载穴位详情
  loadAcupointDetail(id) {
    if (!id) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      this.setData({ loading: false });
      return;
    }

    wx.cloud.callFunction({
      name: 'knowledgeQuery',
      data: {
        collection: 'ni_acupoints',
        action: 'detail',
        id
      },
      success: (res) => {
        if (res.result && res.result.code === 0 && res.result.data) {
          const doc = res.result.data;
          // 将字面 \\n 还原为真实换行
          const content = (doc.content || '').replace(/\\n/g, '\n');

          const acupoint = {
            id: doc._id,
            name: doc.name || '未知穴位',
            meridian: doc.meridian || '',
            location: doc.location || this.extractContentField(content, '定位') || '',
            // 从 content 中解析更多字段
            positionDetail: this.extractContentSection(content, '穴位定位') || doc.location || '',
            functions: this.extractContentField(content, '功效') || '',
            indications: this.extractContentSection(content, '功效主治') || this.extractContentSection(content, '主治') || this.extractContentField(content, '主治') || '',
            technique: this.extractContentSection(content, '针刺方法') || '',
            needleMethod: this.extractContentField(content, '刺法') || '',
            moxaMethod: this.extractContentField(content, '灸法') || '',
            combinations: this.extractContentSection(content, '配伍应用') || '',
            // 整体内容（已还原换行）
            fullContent: content,
          };

          this.setData({
            acupoint,
            loading: false
          });
        } else {
          wx.showToast({ title: '未找到该穴位', icon: 'none' });
          this.setData({ loading: false });
        }
      },
      fail: (err) => {
        console.error('加载穴位详情失败:', err);
        wx.showToast({ title: '加载失败', icon: 'none' });
        this.setData({ loading: false });
      }
    });
  },

  // 分享
  onShareAppMessage() {
    return {
      title: `${this.data.acupoint ? this.data.acupoint.name : '穴位'} — 倪海厦经方助手`,
      path: `/pages/acupoint-detail/acupoint-detail?id=${this.data.acupointId}`,
    };
  }
});
