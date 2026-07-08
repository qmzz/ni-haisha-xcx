// pages/chat/chat.js — AI 自由对话页面逻辑
const app = getApp();

const CHAT_PROMPT = '你是一位资深中医师，精通倪海厦经方理论。请根据用户的问题提供专业的中医分析和建议。注意：所有建议仅供学习参考，不构成医疗处方。';

Page({
  data: {
    messages: [],
    inputValue: '',
    loading: false,
    scrollToView: '',
  },

  onLoad() {
    const history = app.globalData.chatHistory || [];
    if (history.length > 0) {
      this.setData({
        messages: history,
        scrollToView: 'msg-' + (history.length - 1)
      });
    } else {
      this.showWelcome();
    }
  },

  showWelcome() {
    const welcomeMsg = {
      id: 'welcome-chat',
      role: 'system',
      content: '👨‍⚕️ 你好！我是倪海厦经方AI助手。\n\n你可以自由提问任何中医相关问题：\n• 方剂配伍原理\n• 辨证思路分析\n• 药材功效对比\n• 经络穴位讲解\n• 中医理论学习\n\n请随时提问～',
      time: this.formatTime(new Date())
    };
    this.setData({ messages: [welcomeMsg], scrollToView: 'msg-welcome-chat' });
  },

  sendMessage() {
    const content = this.data.inputValue.trim();
    if (!content || this.data.loading) return;

    const userMsg = {
      id: 'u-' + Date.now(),
      role: 'user',
      content: content,
      time: this.formatTime(new Date())
    };

    const messages = [...this.data.messages, userMsg];
    this.setData({ messages, inputValue: '', loading: true, scrollToView: 'msg-' + userMsg.id });
    this.callAI(content);
  },

  async callAI(question) {
    const messages = [
      { role: 'system', content: CHAT_PROMPT },
      ...this.getRecentHistory().map(m => ({
        role: m.role === 'system' ? 'assistant' : m.role,
        content: m.content
      })),
      { role: 'user', content: question }
    ];

    const configs = [
      { provider: 'hunyuan-v3', model: 'hy3-preview' },
      { provider: 'cloudbase', model: 'hy3-preview' },
      { provider: 'hunyuan-v3', model: 'hy3' },
    ];

    for (const { provider, model } of configs) {
      try {
        const m = wx.cloud.extend.AI.createModel(provider);
        const res = await m.generateText({
          data: { model, messages, temperature: 0.7, max_tokens: 2048 }
        });

        const aiMsg = {
          id: 'a-' + Date.now(),
          role: 'assistant',
          content: res.text,
          time: this.formatTime(new Date())
        };
        const updated = [...this.data.messages, aiMsg];
        this.setData({ messages: updated, loading: false, scrollToView: 'msg-' + aiMsg.id });
        app.globalData.chatHistory = updated;
        return;
      } catch (err) {
        console.warn(provider + '+' + model + ' 不可用:', (err.message || String(err)).substring(0, 100));
      }
    }

    const aiMsg = {
      id: 'a-' + Date.now(),
      role: 'assistant',
      content: 'AI 调用失败，请检查 CloudBase 控制台 AI 模块中是否已启用模型。',
      time: this.formatTime(new Date())
    };
    const updated = [...this.data.messages, aiMsg];
    this.setData({ messages: updated, loading: false, scrollToView: 'msg-' + aiMsg.id });
    app.globalData.chatHistory = updated;
  },

  getRecentHistory() {
    return this.data.messages.slice(-6).map(msg => ({
      role: msg.role === 'system' ? 'assistant' : msg.role,
      content: msg.content
    }));
  },

  onInput(e) {
    this.setData({ inputValue: e.detail.value });
  },

  clearChat() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空对话记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ messages: [] });
          app.globalData.chatHistory = [];
          this.showWelcome();
        }
      }
    });
  },

  formatTime(date) {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return h + ':' + m;
  },

  onShareAppMessage() {
    return {
      title: '倪海厦经方AI助手 — 你的私人中医顾问',
      path: '/pages/chat/chat',
    };
  }
});
