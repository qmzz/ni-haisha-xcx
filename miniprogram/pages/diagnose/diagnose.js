// pages/diagnose/diagnose.js — AI诊脉页面逻辑
const app = getApp();

const SYSTEM_PROMPT = '你是倪海厦（倪师），精通伤寒论、金匮要略、黄帝内经、神农本草经和针灸大成。请以倪海厦的口吻，按以下格式回复：\n【辨证分析】\n【诊断结论】\n【经方推荐】\n【倪师讲解】\n【调养建议】\n\n末尾注明：以上内容为AI生成，仅供参考学习，不构成医疗建议。';

Page({
  data: {
    messages: [],
    inputValue: '',
    loading: false,
    scrollToView: '',
    isFirstChat: true,
    suggestedQuestions: [
      '最近总是头痛，怕冷，是什么问题？',
      '失眠多梦，口干舌燥怎么调理？',
      '胸闷气短，心慌，适合什么方剂？',
      '消化不良，胃胀反酸怎么办？',
      '腰膝酸软，畏寒怕冷什么原因？',
      '小孩咳嗽有痰，怎么用中药？',
    ],
    inputHeight: 42,
  },

  onLoad() {
    const history = app.globalData.diagnoseHistory || [];
    if (history.length > 0) {
      this.setData({
        messages: history,
        isFirstChat: false,
        scrollToView: 'msg-' + (history.length - 1)
      });
    } else {
      this.showWelcome();
    }
  },

  onShow() {
    if (this.data.messages.length > 0) {
      this.scrollToBottom();
    }
  },

  showWelcome() {
    const welcomeMsg = {
      id: 'welcome',
      role: 'system',
      content: '👨‍⚕️ 欢迎使用AI诊脉助手！\n\n请描述您的症状，我会根据倪海厦经方理论为您辨证分析。\n\n您可以描述：\n• 主要症状（头痛、发热、咳嗽等）\n• 持续时间\n• 其他伴随症状\n• 舌象、脉象（如果知道的话）\n\n⚠️ 本系统仅供学习参考，不构成医疗建议。',
      time: this.formatTime(new Date())
    };
    this.setData({ messages: [welcomeMsg], scrollToView: 'msg-welcome' });
  },

  sendMessage() {
    const content = this.data.inputValue.trim();
    if (!content || this.data.loading) return;

    const userMsg = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: content,
      time: this.formatTime(new Date())
    };

    const messages = [...this.data.messages, userMsg];
    this.setData({
      messages,
      inputValue: '',
      isFirstChat: false,
      loading: true,
      scrollToView: 'msg-' + userMsg.id,
      inputHeight: 42
    });

    this.callAI(content);
  },

  async callAI(question) {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...this.getRecentHistory().map(m => ({
        role: m.role === 'system' ? 'assistant' : m.role,
        content: m.content
      })),
      { role: 'user', content: question }
    ];

    const configs = [
      { provider: 'hunyuan-v3', model: 'hy3' },
      { provider: 'hunyuan-v3', model: 'hy3-preview' },
      { provider: 'cloudbase', model: 'hy3-preview' },
    ];

    for (const { provider, model } of configs) {
      try {
        const m = wx.cloud.extend.AI.createModel(provider);
        const res = await m.generateText({
          data: { model, messages, temperature: 0.7, max_tokens: 2048 }
        });

        const aiMsg = {
          id: 'ai-' + Date.now(),
          role: 'assistant',
          content: res.text,
          time: this.formatTime(new Date()),
        };
        const updated = [...this.data.messages, aiMsg];
        this.setData({ messages: updated, loading: false, scrollToView: 'msg-' + aiMsg.id });
        app.globalData.diagnoseHistory = updated;
        return;
      } catch (err) {
        const msg = (err.message || String(err)).substring(0, 200);
        console.warn(provider + '+' + model + ' 不可用:', msg);
      }
    }

    // 全部失败
    this.handleFallbackResponse(question);
  },

  getRecentHistory() {
    return this.data.messages.slice(-6).map(msg => ({
      role: msg.role === 'system' ? 'assistant' : msg.role,
      content: msg.content
    }));
  },

  handleFallbackResponse(question) {
    const aiMsg = {
      id: 'ai-' + Date.now(),
      role: 'assistant',
      content: 'AI 调用失败，请确认：\n1. 小程序基础库 ≥ 3.15.1\n2. 已在 CloudBase 控制台 AI 模块中启用 hy3-preview 模型\n3. 开发者工具中「详情→本地设置→不校验合法域名」已勾选\n\n如以上没问题，可前往云开发控制台 → 日志 → 云函数查看具体错误。',
      time: this.formatTime(new Date())
    };
    const updated = [...this.data.messages, aiMsg];
    this.setData({ messages: updated, loading: false, scrollToView: 'msg-' + aiMsg.id });
    app.globalData.diagnoseHistory = updated;
  },

  onInput(e) {
    this.setData({ inputValue: e.detail.value });
  },

  tapSuggestedQuestion(e) {
    const question = e.currentTarget.dataset.question;
    this.setData({ inputValue: question });
    this.sendMessage();
  },

  clearChat() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空当前对话记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ messages: [], isFirstChat: true });
          app.globalData.diagnoseHistory = [];
          this.showWelcome();
        }
      }
    });
  },

  scrollToBottom() {
    const messages = this.data.messages;
    if (messages.length > 0) {
      this.setData({ scrollToView: 'msg-' + messages[messages.length - 1].id });
    }
  },

  formatTime(date) {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return h + ':' + m;
  },

  onShareAppMessage() {
    return {
      title: 'AI诊脉 — 倪海厦经方助手智能辨证',
      path: '/pages/diagnose/diagnose',
    };
  }
});
