// pages/herb-detail/herb-detail.js — 药材详情页面逻辑
const app = getApp();

Page({
  data: {
    // 药材 ID
    herbId: null,
    // 药材详情
    herb: null,
    // 加载状态
    loading: true,
    // 相关方剂
    relatedFormulas: [],
  },

  onLoad(options) {
    const id = parseInt(options.id) || 0;
    this.setData({ herbId: id });
    this.loadHerbDetail(id);
  },

  // 加载药材详情
  loadHerbDetail(id) {
    // 模拟数据（后续从云数据库获取）
    const mockHerbs = {
      1: { id: 1, name: '麻黄', pinyin: 'Ma Huang', latinName: 'Ephedrae Herba', category: '解表药', subCategory: '发散风寒', property: '温', flavor: '辛、微苦', meridian: '肺、膀胱', toxicity: '无毒', functions: '发汗解表，宣肺平喘，利水消肿', dosage: '2-10g', taboos: '表虚自汗、阴虚盗汗、高血压者慎用', origin: '主产于内蒙古、山西、甘肃等地', harvest: '秋季采割绿色的草质茎，晒干', processing: '生麻黄：去杂洗净切段。炙麻黄：取麻黄段加蜂蜜拌匀后加热炒制', appearance: '茎呈细长圆柱形，表面淡绿色至黄绿色，质脆易折断', descriptions: '麻黄为麻黄科植物草麻黄、中麻黄或木贼麻黄的干燥草质茎。味辛、微苦，性温，归肺、膀胱经。主要功效为发汗解表、宣肺平喘、利水消肿。常用于风寒感冒、胸闷喘咳、风水浮肿等症。', images: [] },
      2: { id: 2, name: '桂枝', pinyin: 'Gui Zhi', latinName: 'Cinnamomi Ramulus', category: '解表药', subCategory: '发散风寒', property: '温', flavor: '辛、甘', meridian: '心、肺、膀胱', toxicity: '无毒', functions: '发汗解肌，温通经脉，助阳化气', dosage: '3-10g', taboos: '温热病、阴虚火旺、血热妄行者忌用', origin: '主产于广西、广东、云南等地', harvest: '春夏二季采收嫩枝，除去叶，晒干或切片晒干', processing: '生用。除去杂质稍泡洗净润透切薄片晾干', appearance: '呈长圆柱形，多分枝，表面红棕色至棕色，质硬而脆，易折断', descriptions: '桂枝为樟科植物肉桂的干燥嫩枝。味辛、甘，性温，归心、肺、膀胱经。功能发汗解肌，温通经脉，助阳化气。是《伤寒论》中桂枝汤等方的核心药味。', images: [] },
      3: { id: 3, name: '紫苏叶', pinyin: 'Zi Su Ye', latinName: 'Perillae Folium', category: '解表药', subCategory: '发散风寒', property: '温', flavor: '辛', meridian: '肺、脾', toxicity: '无毒', functions: '解表散寒，行气和胃', dosage: '5-10g', origin: '全国各地均有栽培', harvest: '夏季枝叶茂盛时采收，除去杂质，晒干', descriptions: '紫苏叶为唇形科植物紫苏的干燥叶（或带嫩枝）。味辛，性温，归肺、脾经。常用于风寒感冒、咳嗽呕恶、妊娠呕吐、鱼蟹中毒。', images: [] },
      11: { id: 11, name: '石膏', pinyin: 'Shi Gao', latinName: 'Gypsum Fibrosum', category: '清热药', subCategory: '清热泻火', property: '大寒', flavor: '甘、辛', meridian: '肺、胃', toxicity: '无毒', functions: '清热泻火，除烦止渴', dosage: '15-60g', origin: '主产于湖北、安徽、河南等地', descriptions: '石膏为硫酸盐类矿物硬石膏族石膏，主含含水硫酸钙（CaSO₄·2H₂O）。味甘、辛，性大寒，归肺、胃经。为清热泻火之要药，常用于外感热病、高热烦渴、肺热喘咳等。', images: [] },
      17: { id: 17, name: '人参', pinyin: 'Ren Shen', latinName: 'Ginseng Radix et Rhizoma', category: '补虚药', subCategory: '补气', property: '微温', flavor: '甘、微苦', meridian: '脾、肺、心', toxicity: '无毒', functions: '大补元气，补脾益肺，生津安神', dosage: '3-9g', origin: '主产于吉林、辽宁、黑龙江等地', descriptions: '人参为五加科植物人参的干燥根和根茎。味甘、微苦，性微温，归脾、肺、心、肾经。大补元气之要药，《神农本草经》列为上品。', images: [] },
      21: { id: 21, name: '甘草', pinyin: 'Gan Cao', latinName: 'Glycyrrhizae Radix et Rhizoma', category: '补虚药', subCategory: '补气', property: '平', flavor: '甘', meridian: '心、肺、脾、胃', toxicity: '无毒', functions: '补脾益气，润肺止咳，缓急止痛，调和药性', dosage: '2-10g', origin: '主产于内蒙古、甘肃、新疆等地', descriptions: '甘草为豆科植物甘草、胀果甘草或光果甘草的干燥根和根茎。味甘、性平，归心、肺、脾、胃经。有"国老"之称，调和诸药。', images: [] },
    };

    // 默认生成详情
    let herb = mockHerbs[id];
    if (!herb) {
      herb = {
        id: id,
        name: '药材 #' + id,
        pinyin: '',
        latinName: '',
        category: '未知',
        subCategory: '',
        property: '',
        flavor: '',
        meridian: '',
        toxicity: '',
        functions: '',
        dosage: '',
        taboos: '',
        origin: '',
        harvest: '',
        processing: '',
        appearance: '',
        descriptions: '详情数据加载中，请稍后...',
        images: []
      };
    }

    // 相关方剂
    const relatedFormulas = [
      { id: 1, name: '麻黄汤', correlation: '君药', herbs: '麻黄、桂枝、杏仁、甘草' },
      { id: 2, name: '桂枝汤', correlation: herb && herb.name === '桂枝' ? '君药' : '佐使药', herbs: '桂枝、芍药、甘草、生姜、大枣' },
    ];

    this.setData({
      herb,
      relatedFormulas,
      loading: false
    });
  },

  // 跳转方剂详情
  goToFormula(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/formula-detail/formula-detail?id=${id}`
    });
  },

  // 分享
  onShareAppMessage() {
    return {
      title: `${this.data.herb.name} — 倪海厦经方助手药材库`,
      path: `/pages/herb-detail/herb-detail?id=${this.data.herbId}`,
    };
  }
});
