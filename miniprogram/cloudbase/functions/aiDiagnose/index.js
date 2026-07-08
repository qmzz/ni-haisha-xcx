// 云函数：AI 诊断
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const SYSTEM_PROMPT = '你是倪海厦（倪师），精通伤寒论、金匮要略、黄帝内经、神农本草经和针灸大成。请以倪海厦的口吻回答用户问题。';

exports.main = async (event, context) => {
  const { question, history = [] } = event;

  if (!question || !question.trim()) {
    return { code: -1, message: '请描述您的症状' };
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-6).filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content
    })),
    { role: 'user', content: question }
  ];

  // 诊断模式：依次尝试所有可能的 API 组合，返回第一个成功的
  const attempts = [
    // 组合1: generateText + hy3 (官方升级指南推荐的 hunyuan-v3 模型)
    async () => {
      const model = cloud.ai.createModel('hunyuan-v3');
      const res = await model.generateText({ data: { model: 'hy3', messages, temperature: 0.7, max_tokens: 1024 } });
      return { text: res.text, usage: res.usage, method: 'generateText+hy3' };
    },
    // 组合2: generateText + hy3-preview
    async () => {
      const model = cloud.ai.createModel('hunyuan-v3');
      const res = await model.generateText({ data: { model: 'hy3-preview', messages, temperature: 0.7, max_tokens: 1024 } });
      return { text: res.text, usage: res.usage, method: 'generateText+hy3-preview' };
    },
    // 组合3: streamText + hy3
    async () => {
      const model = cloud.ai.createModel('hunyuan-v3');
      const res = await model.streamText({ data: { model: 'hy3', messages, temperature: 0.7, max_tokens: 1024 } });
      let text = '';
      for await (let chunk of res.textStream) { text += chunk; }
      return { text, usage: await res.usage, method: 'streamText+hy3' };
    },
    // 组合4: streamText + hy3-preview
    async () => {
      const model = cloud.ai.createModel('hunyuan-v3');
      const res = await model.streamText({ data: { model: 'hy3-preview', messages, temperature: 0.7, max_tokens: 1024 } });
      let text = '';
      for await (let chunk of res.textStream) { text += chunk; }
      return { text, usage: await res.usage, method: 'streamText+hy3-preview' };
    },
    // 组合5: cloudbase provider + hy3-preview (降级到资源点套餐)
    async () => {
      const model = cloud.ai.createModel('cloudbase');
      const res = await model.generateText({ data: { model: 'hy3-preview', messages, temperature: 0.7, max_tokens: 1024 } });
      return { text: res.text, usage: res.usage, method: 'cloudbase+hy3-preview' };
    },
  ];

  const errors = [];
  for (const fn of attempts) {
    try {
      const result = await fn();
      console.log('✅ 调用成功:', result.method);
      return { code: 0, reply: result.text, usage: result.usage || {}, method: result.method };
    } catch (err) {
      const msg = err.message || String(err);
      console.error('❌ 失败:', msg.substring(0, 100));
      errors.push(msg.substring(0, 200));
    }
  }

  return {
    code: -1,
    message: 'AI调用失败，所有组合都不可用',
    errors: errors
  };
};
