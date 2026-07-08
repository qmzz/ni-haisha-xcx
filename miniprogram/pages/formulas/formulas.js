// pages/formulas/formulas.js — 经方阁页面逻辑
const app = getApp();

Page({
  data: {
    searchKeyword: '',
    activeCategory: 'all',
    categories: [
      { id: 'all', name: '全部' },
      { id: '解表剂', name: '解表剂' },
      { id: '泻下剂', name: '泻下剂' },
      { id: '和解剂', name: '和解剂' },
      { id: '清热剂', name: '清热剂' },
      { id: '温里剂', name: '温里剂' },
      { id: '补益剂', name: '补益剂' },
      { id: '理气剂', name: '理气剂' },
      { id: '理血剂', name: '理血剂' },
      { id: '祛湿剂', name: '祛湿剂' },
      { id: '祛痰剂', name: '祛痰剂' },
      { id: '消食剂', name: '消食剂' },
    ],
    formulaList: [],
    allFormulas: [],
    loading: false,
    page: 1,
    pageSize: 20,
    hasMore: true,
  },

  onLoad() {
    this.loadMockData();
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true });
    this.filterFormulas();
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return;
    this.loadMore();
  },

  loadMockData() {
    // 模拟 114 首经方数据（部分）
    const mockFormulas = [
      { id: 1, name: '桂枝汤', source: '伤寒论', category: '解表剂', subCategory: '辛温解表', usage: '解肌发表，调和营卫', indication: '外感风寒表虚证。头痛发热，汗出恶风，鼻鸣干呕，苔白不渴，脉浮缓或浮弱。', herbs: '桂枝三两、芍药三两、甘草二两（炙）、生姜三两、大枣十二枚', herbCount: 5, difficulty: '基础' },
      { id: 2, name: '麻黄汤', source: '伤寒论', category: '解表剂', subCategory: '辛温解表', usage: '发汗解表，宣肺平喘', indication: '外感风寒表实证。恶寒发热，头痛身疼，无汗而喘，舌苔薄白，脉浮紧。', herbs: '麻黄三两、桂枝二两、杏仁七十个、甘草一两（炙）', herbCount: 4, difficulty: '基础' },
      { id: 3, name: '小柴胡汤', source: '伤寒论', category: '和解剂', subCategory: '和解少阳', usage: '和解少阳', indication: '伤寒少阳证。往来寒热，胸胁苦满，默默不欲饮食，心烦喜呕，口苦咽干目眩，舌苔薄白，脉弦。', herbs: '柴胡半斤、黄芩三两、人参三两、半夏半升、甘草三两（炙）、生姜三两、大枣十二枚', herbCount: 7, difficulty: '进阶' },
      { id: 4, name: '大柴胡汤', source: '伤寒论', category: '和解剂', subCategory: '和解少阳', usage: '和解少阳，内泻热结', indication: '少阳阳明合病。往来寒热，胸胁苦满，呕不止，郁郁微烦，心下痞硬，或心下满痛，大便不解或协热下利，舌苔黄，脉弦数有力。', herbs: '柴胡半斤、黄芩三两、芍药三两、半夏半升、枳实四枚、大黄二两、生姜五两、大枣十二枚', herbCount: 8, difficulty: '进阶' },
      { id: 5, name: '白虎汤', source: '伤寒论', category: '清热剂', subCategory: '清气分热', usage: '清热生津', indication: '气分热盛证。壮热面赤，烦渴引饮，汗出恶热，脉洪大有力。', herbs: '石膏一斤、知母六两、甘草二两（炙）、粳米六合', herbCount: 4, difficulty: '基础' },
      { id: 6, name: '四逆汤', source: '伤寒论', category: '温里剂', subCategory: '回阳救逆', usage: '回阳救逆', indication: '少阴病，四肢厥逆，恶寒蜷卧，呕吐不渴，腹痛下利，神衰欲寐，舌苔白滑，脉微细。', herbs: '附子一枚（生用）、干姜一两半、甘草二两（炙）', herbCount: 3, difficulty: '专业' },
      { id: 7, name: '四君子汤', source: '太平惠民和剂局方', category: '补益剂', subCategory: '补气', usage: '益气健脾', indication: '脾胃气虚证。面色萎白，语声低微，气短乏力，食少便溏，舌淡苔白，脉虚弱。', herbs: '人参、白术、茯苓、甘草（炙）各等分', herbCount: 4, difficulty: '基础' },
      { id: 8, name: '四物汤', source: '太平惠民和剂局方', category: '补益剂', subCategory: '补血', usage: '补血调血', indication: '营血虚滞证。心悸失眠，头晕目眩，面色无华，妇人月经不调，量少或经闭不行，脐腹作痛，舌淡，脉细弦或细涩。', herbs: '当归、川芎、白芍、熟地黄各等分', herbCount: 4, difficulty: '基础' },
      { id: 9, name: '六味地黄丸', source: '小儿药证直诀', category: '补益剂', subCategory: '补阴', usage: '滋补肝肾', indication: '肝肾阴虚证。腰膝酸软，头晕目眩，耳鸣耳聋，盗汗，遗精，消渴，骨蒸潮热，手足心热，口燥咽干，牙齿动摇，足跟作痛，小便淋沥，舌红少苔，脉沉细数。', herbs: '熟地黄八钱、山茱萸四钱、干山药四钱、泽泻三钱、茯苓三钱、丹皮三钱', herbCount: 6, difficulty: '基础' },
      { id: 10, name: '肾气丸', source: '金匮要略', category: '补益剂', subCategory: '补阳', usage: '温补肾阳，化气行水', indication: '肾阳不足证。腰痛脚软，身半以下常有冷感，少腹拘急，小便不利或小便反多，入夜尤甚，阳痿早泄，舌淡胖，脉虚弱尺部沉细。', herbs: '干地黄八两、山药四两、山茱萸四两、泽泻三两、茯苓三两、丹皮三两、桂枝一两、附子一两', herbCount: 8, difficulty: '进阶' },
      { id: 11, name: '葛根汤', source: '伤寒论', category: '解表剂', subCategory: '辛温解表', usage: '发汗解表，生津舒筋', indication: '外感风寒表实证。项背强几几，无汗恶风。', herbs: '葛根四两、麻黄三两、桂枝二两、生姜三两、甘草二两（炙）、芍药二两、大枣十二枚', herbCount: 7, difficulty: '基础' },
      { id: 12, name: '小青龙汤', source: '伤寒论', category: '解表剂', subCategory: '辛温解表', usage: '解表散寒，温肺化饮', indication: '外寒内饮证。恶寒发热，无汗，胸痞喘咳，痰多而稀，或痰饮喘咳不得平卧，或身体疼重，头面四肢浮肿，舌苔白滑，脉浮。', herbs: '麻黄、芍药、细辛、干姜、甘草（炙）、桂枝各三两、五味子半升、半夏半升', herbCount: 8, difficulty: '进阶' },
      { id: 13, name: '半夏泻心汤', source: '伤寒论', category: '和解剂', subCategory: '调和肠胃', usage: '寒热平调，消痞散结', indication: '寒热错杂之痞证。心下痞但满而不痛，或呕吐，肠鸣下利，舌苔腻而微黄。', herbs: '半夏半升、黄芩、干姜、人参、甘草（炙）各三两、黄连一两、大枣十二枚', herbCount: 7, difficulty: '进阶' },
      { id: 14, name: '五苓散', source: '伤寒论', category: '祛湿剂', subCategory: '利水渗湿', usage: '利水渗湿，温阳化气', indication: '膀胱气化不利之蓄水证。小便不利，头痛微热，烦渴欲饮，甚则水入即吐，或脐下动悸，吐涎沫而头眩，或短气而咳，或水肿泄泻，舌苔白，脉浮或浮数。', herbs: '猪苓十八铢、泽泻一两六铢、白术十八铢、茯苓十八铢、桂枝半两', herbCount: 5, difficulty: '基础' },
      { id: 15, name: '真武汤', source: '伤寒论', category: '祛湿剂', subCategory: '温化水湿', usage: '温阳利水', indication: '阳虚水泛证。畏寒肢厥，小便不利，心下悸动不宁，头目眩晕，身体筋肉瞤动，站立不稳，四肢沉重疼痛，浮肿腰以下为甚，或腹痛泄泻，或咳喘呕逆，舌质淡胖，边有齿痕，舌苔白滑，脉沉细。', herbs: '茯苓三两、芍药三两、白术二两、生姜三两、附子一枚', herbCount: 5, difficulty: '进阶' },
      { id: 16, name: '当归芍药散', source: '金匮要略', category: '理血剂', subCategory: '活血祛瘀', usage: '养血调肝，健脾利湿', indication: '妇人妊娠或经期，腹中拘急，绵绵作痛，头晕心悸，或下肢浮肿，小便不利，舌质淡苔白腻。', herbs: '当归三两、芍药一斤、茯苓四两、白术四两、泽泻半斤、川芎半斤', herbCount: 6, difficulty: '进阶' },
      { id: 17, name: '理中汤', source: '伤寒论', category: '温里剂', subCategory: '温中祛寒', usage: '温中祛寒，补气健脾', indication: '脾胃虚寒证。脘腹绵绵作痛，喜温喜按，呕吐，大便稀溏，脘痞食少，畏寒肢冷，口不渴，舌淡苔白润，脉沉细或沉迟无力。', herbs: '人参、干姜、甘草（炙）、白术各三两', herbCount: 4, difficulty: '基础' },
      { id: 18, name: '酸枣仁汤', source: '金匮要略', category: '安神剂', subCategory: '养血安神', usage: '养血安神，清热除烦', indication: '肝血不足，虚热内扰证。虚烦失眠，心悸不安，头目眩晕，咽干口燥，舌红，脉弦细。', herbs: '酸枣仁二升、甘草一两、知母二两、茯苓二两、川芎二两', herbCount: 5, difficulty: '基础' },
      { id: 19, name: '半夏厚朴汤', source: '金匮要略', category: '理气剂', subCategory: '行气', usage: '行气散结，降逆化痰', indication: '梅核气。咽中如有物阻，咯吐不出，吞咽不下，胸膈满闷，或咳或呕，舌苔白润或白滑，脉弦缓或弦滑。', herbs: '半夏一升、厚朴三两、茯苓四两、生姜五两、紫苏叶二两', herbCount: 5, difficulty: '基础' },
      { id: 20, name: '炙甘草汤', source: '伤寒论', category: '补益剂', subCategory: '气血双补', usage: '益气滋阴，通阳复脉', indication: '阴血阳气虚弱，心脉失养证。脉结代，心动悸，虚羸少气，舌光少苔，或质干而瘦小者。', herbs: '甘草四两（炙）、生姜三两、桂枝三两、人参二两、生地黄一斤、阿胶二两、麦门冬半升、麻仁半升、大枣三十枚', herbCount: 9, difficulty: '进阶' },
    ];

    this.setData({ allFormulas: mockFormulas });
    this.filterFormulas();
  },

  filterFormulas() {
    let list = [...this.data.allFormulas];
    const { searchKeyword, activeCategory } = this.data;

    if (activeCategory !== 'all') {
      list = list.filter(item => item.category === activeCategory);
    }

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase();
      list = list.filter(item =>
        item.name.toLowerCase().includes(keyword) ||
        item.usage.toLowerCase().includes(keyword) ||
        item.indication.toLowerCase().includes(keyword) ||
        item.herbs.toLowerCase().includes(keyword)
      );
    }

    const pageSize = this.data.pageSize;
    const page = this.data.page;
    const start = (page - 1) * pageSize;
    const paginatedList = list.slice(0, start + pageSize);
    const hasMore = list.length > start + pageSize;

    this.setData({
      formulaList: page === 1 ? paginatedList : paginatedList,
      hasMore
    });
  },

  loadMore() {
    this.setData({
      loading: true,
      page: this.data.page + 1
    });
    this.filterFormulas();
    this.setData({ loading: false });
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value, page: 1 });
    this.filterFormulas();
  },

  clearSearch() {
    this.setData({ searchKeyword: '', page: 1 });
    this.filterFormulas();
  },

  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      activeCategory: category,
      page: 1,
      hasMore: true
    });
    this.filterFormulas();
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/formula-detail/formula-detail?id=${id}`
    });
  },

  onShareAppMessage() {
    return {
      title: '倪海厦经方助手经方阁 — 114首经典方剂大全',
      path: '/pages/formulas/formulas',
    };
  }
});
