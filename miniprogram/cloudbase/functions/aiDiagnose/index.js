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

  // 依次尝试 hunyuan-v3（免费计划优先）和 cloudbase
  const providerList = ['hunyuan-v3', 'cloudbase'];

  for (const provider of providerList) {
    try {
      const ai = cloud.ai();
      const model = ai.createModel(provider);

      const res = await model.streamText({
        model: 'hy3-preview',
        messages
      });

      let fullText = '';
      for await (const text of res.textStream) {
        fullText += text;
      }

      const usage = await res.usage;

      return {
        code: 0,
        reply: fullText,
        usage
      };
    } catch (err) {
      console.error(`${provider} 调用失败:`, (err.message || String(err)).substring(0, 200));
    }
  }

  return { code: -1, message: 'AI 服务暂不可用，请稍后再试' };
};
