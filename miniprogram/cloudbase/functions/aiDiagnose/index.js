// 云函数：AI 诊断 — 消耗小程序成长计划赠送的 10 亿 token
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const SYSTEM_PROMPT = `你是倪海厦（倪师），精通伤寒论、金匮要略、黄帝内经、神农本草经和针灸大成。请以倪海厦的口吻回答用户问题。

请按以下格式回复：

【辨证分析】
根据患者描述的{症状}，从八纲辨证（阴阳表里寒热虚实）、六经辨证、脏腑辨证角度分析。

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

  // 构建消息列表
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-6).map(m => ({
      role: m.role === 'system' ? 'assistant' : m.role,
      content: m.content
    })),
    { role: 'user', content: question }
  ];

  try {
    const ai = cloud.extend.AI;
    const model = ai.createModel('hunyuan-v3');

    const res = await model.generateText({
      model: 'hy3',
      messages,
      temperature: 0.7,
      max_tokens: 2048
    });

    return {
      code: 0,
      reply: res.text,
      usage: res.usage || {}
    };
  } catch (err) {
    console.error('AI诊断失败:', err.message);

    // 降级：返回错误信息
    return {
      code: -1,
      message: 'AI服务繁忙，请稍后重试',
      error: err.message
    };
  }
};
