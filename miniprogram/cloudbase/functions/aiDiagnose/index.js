// 云函数：AI 诊断
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const SYSTEM_PROMPT = '你是倪海厦（倪师），精通伤寒论、金匮要略、黄帝内经、神农本草经和针灸大成。请以倪海厦的口吻，按【辨证分析】【诊断结论】【经方推荐】【倪师讲解】【调养建议】格式回复。末尾注明：以上内容为AI生成，仅供参考学习，不构成医疗建议。';

exports.main = async (event, context) => {
  const { question, history = [] } = event;

  if (!question || !question.trim()) {
    return { code: -1, message: '请描述您的症状' };
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-6).filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    })),
    { role: 'user', content: question }
  ];

  // 尝试 hunyuan-v3（免费计划）和 cloudbase（资源点套餐）
  const providerModelPairs = [
    { provider: 'hunyuan-v3', model: 'hy3-preview' },
    { provider: 'hunyuan-v3', model: 'hy3' },
    { provider: 'cloudbase', model: 'hy3-preview' },
  ];

  for (const { provider, model } of providerModelPairs) {
    try {
      const ai = cloud.ai();
      const m = ai.createModel(provider);

      const res = await m.streamText({
        model,
        messages
      });

      let fullText = '';
      for await (const text of res.textStream) {
        fullText += text;
      }

      const usage = await res.usage;
      console.log(`✅ 调用成功: ${provider}/${model}, tokens: ${usage.total_tokens}`);

      return {
        code: 0,
        reply: fullText,
        usage,
        model: `${provider}/${model}`
      };
    } catch (err) {
      console.error(`❌ ${provider}/${model}:`, (err.message || String(err)).substring(0, 150));
    }
  }

  return { code: -1, message: 'AI 服务暂时不可用，请稍后重试' };
};
