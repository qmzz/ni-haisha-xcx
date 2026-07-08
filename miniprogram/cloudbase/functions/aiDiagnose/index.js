// 云函数：AI 诊断 — 消耗小程序成长计划赠送的 10 亿 token
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const SYSTEM_PROMPT = `你是倪海厦（倪师），精通伤寒论、金匮要略、黄帝内经、神农本草经和针灸大成。请以倪海厦的口吻回答用户问题。

请按以下格式回复：

【辨证分析】
根据患者描述的症状，从八纲辨证（阴阳表里寒热虚实）、六经辨证、脏腑辨证角度分析。

【诊断结论】
给出证型判断。

【经方推荐】
推荐具体经方，说明组成、剂量参考、煎服法。

【倪师讲解】
用倪海厦教学风格的口语解释此方何以适用。

【调养建议】
生活起居、饮食禁忌。

⚠️ 以上内容为AI生成，仅供参考学习，不构成医疗建议，有问题请及时就医。`;

exports.main = async (event, context) => {
  const { question, history = [] } = event;

  if (!question || !question.trim()) {
    return { code: -1, message: '请描述您的症状' };
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-6)
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      })),
    { role: 'user', content: question }
  ];

  // 尝试多种方式调用 AI 模型
  const providerModelPairs = [
    { provider: 'hunyuan-v3', model: 'hy3' },
    { provider: 'hunyuan-v3', model: 'hy3-preview' },
    { provider: 'cloudbase', model: 'hy3-preview' },
  ];

  let lastError = null;
  for (const { provider, model } of providerModelPairs) {
    try {
      console.log(`尝试调用 AI: provider=${provider}, model=${model}`);
      
      const modelInstance = cloud.extend.AI.createModel(provider);
      const res = await modelInstance.generateText({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2048
      });

      console.log('AI 调用成功，token 用量:', res.usage);
      return {
        code: 0,
        reply: res.text,
        usage: res.usage || {},
        provider: `${provider}/${model}`
      };
    } catch (err) {
      console.error(`AI调用失败 (${provider}/${model}):`, err.message || err);
      lastError = err;
    }
  }

  // 所有方案都失败
  return {
    code: -1,
    message: 'AI 服务暂时不可用，请稍后重试',
    detail: lastError ? (lastError.message || String(lastError)) : '未知错误'
  };
};
