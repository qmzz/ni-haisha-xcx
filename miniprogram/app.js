// app.js — 倪海厦经方助手 小程序全局逻辑
App({
  onLaunch() {
    // 初始化 CloudBase
    if (wx.cloud) {
      wx.cloud.init({
        env: 'big-d4gdk8twf4163a129',
        traceUser: true
      });
    }

    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    this.globalData.systemInfo = systemInfo;
    this.globalData.statusBarHeight = systemInfo.statusBarHeight;
    this.globalData.navBarHeight = systemInfo.statusBarHeight + 44;
  },

  onShow(options) {
    // 小程序进入前台
    console.log('倪海厦经方助手 — 前台展示', options);
  },

  onHide() {
    // 小程序进入后台
    console.log('倪海厦经方助手 — 进入后台');
  },

  onError(err) {
    console.error('小程序全局错误:', err);
  },

  globalData: {
    envId: 'big-d4gdk8twf4163a129',
    systemInfo: null,
    statusBarHeight: 0,
    navBarHeight: 0,
    // 用户信息
    userInfo: null,
    // AI 对话历史
    chatHistory: [],
    // 诊断历史
    diagnoseHistory: []
  }
});
