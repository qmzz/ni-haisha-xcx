// pages/chat/chat.js — AI 自由对话页面逻辑
const app = getApp();

Page({
  data: {
    messages: [],
    inputValue: '',
    loading: false,
    scrollToView: '',
    // 对话提示词
    systemPrompt: '你是一位资深中医师，精通倪海厦经方理论。请根据用户的问题提供专业的中医分析和建议。注意：所有建议仅供学习参考，不构成医疗处方。',
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
    this.setData({
      messages: [welcomeMsg],
      scrollToView: 'msg-welcome-chat'
    });
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

    const messages = this.data.messages.concat([userMsg]);
    this.setData({
      messages,
      inputValue: '',
      loading: true,
      scrollToView: 'msg-' + userMsg.id
    });

    this.callAI(content);
  },

  callAI(question) {
    // 调用 AI 诊断云函数
    wx.cloud.callFunction({
      name: 'aiDiagnose',
      data: {
        question: question,
        history: this.getRecentHistory()
      },
      success: (res) => {
        const reply = (res.result && res.result.reply)
          || (res.result && res.result.content)
          || '抱歉，我暂时无法回答这个问题。';
        const aiMsg = {
          id: 'a-' + Date.now(),
          role: 'assistant',
          content: reply,
          time: this.formatTime(new Date())
        };
        const messages = this.data.messages.concat([aiMsg]);
        this.setData({
          messages,
          loading: false,
          scrollToView: 'msg-' + aiMsg.id
        });
        app.globalData.chatHistory = messages;
      },
      fail: (err) => {
        console.error('云函数调用失败:', err);
        setTimeout(() => {
          const aiMsg = {
            id: 'a-' + Date.now(),
            role: 'assistant',
            content: '感谢您的提问。\n\n目前AI问诊服务暂时繁忙，建议您：\n① 稍后重新提问\n② 浏览「药材库」查阅单味中药知识\n③ 浏览「经方阁」学习经典方剂配伍\n\n🌿 倪海厦经方理论强调方证对应，您也可以通过「学习」板块系统掌握辨证思维。',
            time: this.formatTime(new Date())
          };
          const messages = this.data.messages.concat([aiMsg]);
          this.setData({
            messages,
            loading: false,
            scrollToView: 'msg-' + aiMsg.id
          });
          app.globalData.chatHistory = messages;
        }, 1500);
      }
    });
  },

  getRecentHistory() {
    const recent = this.data.messages.slice(-6);
    return recent.map(msg => ({
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
    return `${h}:${m}`;
  },

  onShareAppMessage() {
    return {
      title: '倪海厦经方AI助手 — 你的私人中医顾问',
      path: '/pages/chat/chat',
    };
  }
});
