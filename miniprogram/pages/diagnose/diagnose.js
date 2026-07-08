// pages/diagnose/diagnose.js — AI诊脉页面逻辑
const app = getApp();

Page({
  data: {
    // 对话消息列表
    messages: [],
    // 输入框内容
    inputValue: '',
    // 是否正在等待AI回复
    loading: false,
    // 自动滚动到最底
    scrollToView: '',
    // 是否首次进入（显示引导问题）
    isFirstChat: true,
    // 建议问题
    suggestedQuestions: [
      '最近总是头痛，怕冷，是什么问题？',
      '失眠多梦，口干舌燥怎么调理？',
      '胸闷气短，心慌，适合什么方剂？',
      '消化不良，胃胀反酸怎么办？',
      '腰膝酸软，畏寒怕冷什么原因？',
      '小孩咳嗽有痰，怎么用中药？',
    ],
    // 输入框高度
    inputHeight: 42,
  },

  onLoad() {
    // 加载历史记录
    const history = app.globalData.diagnoseHistory || [];
    if (history.length > 0) {
      this.setData({
        messages: history,
        isFirstChat: false,
        scrollToView: 'msg-' + (history.length - 1)
      });
    } else {
      // 新用户显示欢迎消息
      this.showWelcome();
    }
  },

  onShow() {
    // 确保最新消息可见
    if (this.data.messages.length > 0) {
      this.scrollToBottom();
    }
  },

  // 显示欢迎消息
  showWelcome() {
    const welcomeMsg = {
      id: 'welcome',
      role: 'system',
      content: '👨‍⚕️ 欢迎使用AI诊脉助手！\n\n请描述您的症状，我会根据倪海厦经方理论为您辨证分析。\n\n您可以描述：\n• 主要症状（头痛、发热、咳嗽等）\n• 持续时间\n• 其他伴随症状\n• 舌象、脉象（如果知道的话）\n\n⚠️ 本系统仅供学习参考，不构成医疗建议。',
      time: this.formatTime(new Date())
    };
    this.setData({
      messages: [welcomeMsg],
      scrollToView: 'msg-welcome'
    });
  },

  // 发送消息
  sendMessage() {
    const content = this.data.inputValue.trim();
    if (!content || this.data.loading) return;

    // 添加用户消息
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

    // 调用云函数进行 AI 诊断
    this.callAIDiagnose(content);
  },

  // 调用 AI 诊断云函数
  callAIDiagnose(question) {
    // 尝试调用云函数
    wx.cloud.callFunction({
      name: 'aiDiagnose',
      data: {
        question: question,
        history: this.getRecentHistory()
      },
      success: (res) => {
        this.handleAIResponse(res.result);
      },
      fail: (err) => {
        console.error('云函数调用失败:', err);
        // 降级：使用本地模拟回复
        this.handleFallbackResponse(question);
      }
    });
  },

  // 处理 AI 回复
  handleAIResponse(result) {
    const aiMsg = {
      id: 'ai-' + Date.now(),
      role: 'assistant',
      content: result.reply || result.content || '抱歉，我暂时无法回答这个问题，请稍后再试。',
      time: this.formatTime(new Date()),
      // 如果有结构化诊断结果
      diagnosis: result.diagnosis || null,
    };

    const messages = [...this.data.messages, aiMsg];
    this.setData({
      messages,
      loading: false,
      scrollToView: 'msg-' + aiMsg.id
    });

    // 更新全局历史
    app.globalData.diagnoseHistory = messages;
  },

  // 降级：本地备用回复（云函数不可用时）
  handleFallbackResponse(question) {
    setTimeout(() => {
      const reply = '感谢您描述的症状。\n\n🔍 根据倪海厦经方辨证思路，建议您关注以下几点：\n\n① 观察舌象：舌质颜色、舌苔厚薄与颜色\n② 确认寒热：是否有恶寒、发热、手足冷热\n③ 辨别虚实：体力状况、脉象有力与否\n④ 回顾六经：症状是否符合六经辨证框架\n\n当前AI辨证服务正在恢复中，建议稍后重试。\n\n📚 提示：您可先浏览「经方阁」对照方证，或查阅「药材库」了解药物性味归经。\n\n⚠️ 本系统提供学习参考，具体诊疗请咨询执业中医师。';

      const aiMsg = {
        id: 'ai-' + Date.now(),
        role: 'assistant',
        content: reply,
        time: this.formatTime(new Date())
      };

      const messages = [...this.data.messages, aiMsg];
      this.setData({
        messages,
        loading: false,
        scrollToView: 'msg-' + aiMsg.id
      });

      app.globalData.diagnoseHistory = messages;
    }, 1500);
  },

  // 获取最近对话历史（给 AI 上下文）
  getRecentHistory() {
    const recent = this.data.messages.slice(-6);
    return recent.map(msg => ({
      role: msg.role === 'system' ? 'assistant' : msg.role,
      content: msg.content
    }));
  },

  // 输入框变化
  onInput(e) {
    this.setData({ inputValue: e.detail.value });
  },

  // 点击建议问题
  tapSuggestedQuestion(e) {
    const question = e.currentTarget.dataset.question;
    this.setData({ inputValue: question });
    this.sendMessage();
  },

  // 清空对话
  clearChat() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空当前对话记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            messages: [],
            isFirstChat: true
          });
          app.globalData.diagnoseHistory = [];
          this.showWelcome();
        }
      }
    });
  },

  // 回到底部
  scrollToBottom() {
    const messages = this.data.messages;
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      this.setData({ scrollToView: 'msg-' + last.id });
    }
  },

  // 格式化时间
  formatTime(date) {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  },

  // 分享
  onShareAppMessage() {
    return {
      title: 'AI诊脉 — 倪海厦经方助手智能辨证',
      path: '/pages/diagnose/diagnose',
    };
  }
});
