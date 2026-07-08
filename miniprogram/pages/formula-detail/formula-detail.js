// pages/formula-detail/formula-detail.js — 方剂详情页面逻辑
const app = getApp();

Page({
  data: {
    formulaId: null,
    formula: null,
    loading: true,
    herbList: [],
  },

  onLoad(options) {
    const id = parseInt(options.id) || 0;
    this.setData({ formulaId: id });
    this.loadFormulaDetail(id);
  },

  loadFormulaDetail(id) {
    // 模拟数据（后续从云数据库加载）
    const mockFormulas = {
      1: {
        id: 1, name: '桂枝汤', source: '伤寒论', author: '张仲景',
        category: '解表剂', subCategory: '辛温解表',
        usage: '解肌发表，调和营卫',
        indication: '外感风寒表虚证。头痛发热，汗出恶风，鼻鸣干呕，苔白不渴，脉浮缓或浮弱。',
        herbs: [
          { name: '桂枝', dosage: '三两', note: '温经通脉，助阳化气，解肌发表' },
          { name: '芍药', dosage: '三两', note: '益阴敛营，养阴和营' },
          { name: '甘草', dosage: '二两（炙）', note: '调和诸药，益气和中' },
          { name: '生姜', dosage: '三两', note: '辛散表邪，温中止呕' },
          { name: '大枣', dosage: '十二枚', note: '补脾益气，调和营卫' },
        ],
        preparation: '上五味，以水七升，微火煮取三升，去滓，适寒温，服一升。',
        analysis: '桂枝汤为《伤寒论》第一方，被誉为"群方之冠"。方中桂枝为君，辛温发散，温经通脉，助阳化气；芍药为臣，酸收益阴，柔肝止痛，与桂枝相配一散一收，调和营卫；生姜助桂枝辛散，大枣助芍药补养，并为佐；甘草调和诸药为使。全方配伍精妙，既发散表邪，又保护正气，适用于表虚证。',
        taboos: '① 表实无汗者忌用；② 温热病忌用；③ 阴虚火旺者忌用；④ 血热妄行者忌用。',
        relatedFormulas: [
          { id: 4, name: '大柴胡汤', relation: '类方衍化' },
          { id: 8, name: '四物汤', relation: '借鉴补益' },
        ]
      },
      2: { id: 2, name: '麻黄汤', source: '伤寒论', author: '张仲景', category: '解表剂', subCategory: '辛温解表', usage: '发汗解表，宣肺平喘', indication: '外感风寒表实证。恶寒发热，头痛身疼，无汗而喘，舌苔薄白，脉浮紧。', herbs: [{ name: '麻黄', dosage: '三两', note: '发汗解表，宣肺平喘' }, { name: '桂枝', dosage: '二两', note: '温经通脉，助麻黄发汗' }, { name: '杏仁', dosage: '七十个', note: '降肺气平喘' }, { name: '甘草', dosage: '一两（炙）', note: '调和诸药，缓急止咳' }], preparation: '上四味，以水九升，先煮麻黄减二升，去上沫，内诸药，煮取二升半，去滓，温服八合。', analysis: '麻黄汤为发汗峻剂，主治外感风寒表实证。麻黄为君，发汗散寒、宣肺平喘；桂枝为臣，温经散寒、助麻黄发汗；杏仁为佐，降肺气以平喘；甘草调和诸药为使。四药合用，发汗解表、宣肺平喘之力甚强。', taboos: '① 表虚自汗者忌用；② 外感风热者忌用；③ 高血压、心脏病者慎用。', relatedFormulas: [{ id: 1, name: '桂枝汤', relation: '表证类方' }] },
      3: { id: 3, name: '小柴胡汤', source: '伤寒论', author: '张仲景', category: '和解剂', subCategory: '和解少阳', usage: '和解少阳', indication: '伤寒少阳证。往来寒热，胸胁苦满，默默不欲饮食，心烦喜呕，口苦咽干目眩，舌苔薄白，脉弦。', herbs: [{ name: '柴胡', dosage: '半斤', note: '和解少阳，疏肝解郁' }, { name: '黄芩', dosage: '三两', note: '清泄胆热' }, { name: '人参', dosage: '三两', note: '益气健脾' }, { name: '半夏', dosage: '半升', note: '降逆止呕，燥湿化痰' }, { name: '甘草', dosage: '三两（炙）', note: '调和诸药' }, { name: '生姜', dosage: '三两', note: '和胃降逆，助柴胡解表' }, { name: '大枣', dosage: '十二枚', note: '益气和中' }], preparation: '上七味，以水一斗二升，煮取六升，去滓，再煎取三升，温服一升，日三服。', analysis: '小柴胡汤为和解少阳的代表方。柴胡为君，和解少阳、疏利肝胆；黄芩为臣，清泄胆热；人参、半夏、生姜、大枣、甘草为佐使，益气健脾、和胃降逆。全方寒温并用，升降协调，攻补兼施，体现了和解法的精髓。', taboos: '① 肝阳上亢者慎用；② 阴虚火旺者慎用。', relatedFormulas: [{ id: 4, name: '大柴胡汤', relation: '类方衍化' }] },
    };

    let formula = mockFormulas[id];
    if (!formula) {
      formula = {
        id: id, name: '方剂 #' + id, source: '', author: '', category: '', subCategory: '',
        usage: '', indication: '', herbs: [], preparation: '', analysis: '详情数据加载中...', taboos: '', relatedFormulas: []
      };
    }

    this.setData({
      formula,
      loading: false
    });
  },

  goToHerbDetail(e) {
    // 跳转到药材详情（如果有药材ID映射）
    const name = e.currentTarget.dataset.name;
    wx.showToast({ title: `查看 ${name} 详情`, icon: 'none', duration: 1500 });
  },

  goToFormula(e) {
    const id = e.currentTarget.dataset.id;
    wx.redirectTo({
      url: `/pages/formula-detail/formula-detail?id=${id}`
    });
  },

  onShareAppMessage() {
    return {
      title: `${this.data.formula.name} — 倪海厦经方助手经方阁`,
      path: `/pages/formula-detail/formula-detail?id=${this.data.formulaId}`,
    };
  }
});
