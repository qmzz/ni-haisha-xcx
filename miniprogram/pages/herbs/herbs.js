// pages/herbs/herbs.js — 药材库页面逻辑
const app = getApp();

Page({
  data: {
    // 搜索关键词
    searchKeyword: '',
    // 当前选中的分类
    activeCategory: 'all',
    // 分类列表
    categories: [
      { id: 'all', name: '全部' },
      { id: '解表药', name: '解表药' },
      { id: '清热药', name: '清热药' },
      { id: '补虚药', name: '补虚药' },
      { id: '祛湿药', name: '祛湿药' },
      { id: '温里药', name: '温里药' },
      { id: '理气药', name: '理气药' },
      { id: '活血药', name: '活血药' },
      { id: '化痰药', name: '化痰药' },
      { id: '安神药', name: '安神药' },
      { id: '泻下药', name: '泻下药' },
      { id: '消食药', name: '消食药' },
    ],
    // 药材列表
    herbList: [],
    // 所有药材数据
    allHerbs: [],
    // 加载状态
    loading: false,
    // 分页
    page: 1,
    pageSize: 20,
    hasMore: true,
  },

  onLoad() {
    this.loadMockData();
  },

  onShow() {
    // 刷新数据
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true });
    this.filterHerbs();
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return;
    this.loadMore();
  },

  // 加载模拟药材数据
  loadMockData() {
    // 模拟 416 味药材中的部分数据（后续从云数据库加载）
    const mockHerbs = [
      // 解表药
      { id: 1, name: '麻黄', pinyin: 'Ma Huang', category: '解表药', subCategory: '发散风寒', property: '温', flavor: '辛、微苦', meridian: '肺、膀胱', toxicity: '无毒', functions: '发汗解表，宣肺平喘，利水消肿', dosage: '2-10g', taboos: '表虚自汗、阴虚盗汗、高血压者慎用' },
      { id: 2, name: '桂枝', pinyin: 'Gui Zhi', category: '解表药', subCategory: '发散风寒', property: '温', flavor: '辛、甘', meridian: '心、肺、膀胱', toxicity: '无毒', functions: '发汗解肌，温通经脉，助阳化气', dosage: '3-10g', taboos: '温热病、阴虚火旺、血热妄行者忌用' },
      { id: 3, name: '紫苏叶', pinyin: 'Zi Su Ye', category: '解表药', subCategory: '发散风寒', property: '温', flavor: '辛', meridian: '肺、脾', toxicity: '无毒', functions: '解表散寒，行气和胃', dosage: '5-10g', taboos: '温病及气弱表虚者忌服' },
      { id: 4, name: '生姜', pinyin: 'Sheng Jiang', category: '解表药', subCategory: '发散风寒', property: '微温', flavor: '辛', meridian: '肺、脾、胃', toxicity: '无毒', functions: '解表散寒，温中止呕，化痰止咳', dosage: '3-10g', taboos: '阴虚内热者忌服' },
      { id: 5, name: '荆芥', pinyin: 'Jing Jie', category: '解表药', subCategory: '发散风寒', property: '微温', flavor: '辛', meridian: '肺、肝', toxicity: '无毒', functions: '祛风解表，透疹消疮，止血', dosage: '5-10g', taboos: '表虚自汗、阴虚头痛者忌服' },
      { id: 6, name: '防风', pinyin: 'Fang Feng', category: '解表药', subCategory: '发散风寒', property: '微温', flavor: '辛、甘', meridian: '膀胱、肝、脾', toxicity: '无毒', functions: '祛风解表，胜湿止痛，止痉', dosage: '5-10g', taboos: '阴虚火旺、血虚发痉者慎用' },
      { id: 7, name: '薄荷', pinyin: 'Bo He', category: '解表药', subCategory: '发散风热', property: '凉', flavor: '辛', meridian: '肺、肝', toxicity: '无毒', functions: '疏散风热，清利头目，利咽透疹', dosage: '3-6g', taboos: '表虚自汗、阴虚发热者忌用' },
      { id: 8, name: '柴胡', pinyin: 'Chai Hu', category: '解表药', subCategory: '发散风热', property: '微寒', flavor: '苦、辛', meridian: '肝、胆', toxicity: '无毒', functions: '和解退热，疏肝解郁，升举阳气', dosage: '3-10g', taboos: '肝阳上亢、阴虚火旺者慎用' },
      { id: 9, name: '菊花', pinyin: 'Ju Hua', category: '解表药', subCategory: '发散风热', property: '微寒', flavor: '甘、苦', meridian: '肺、肝', toxicity: '无毒', functions: '疏散风热，平肝明目，清热解毒', dosage: '5-10g', taboos: '气虚胃寒、食少泄泻者慎用' },
      { id: 10, name: '葛根', pinyin: 'Ge Gen', category: '解表药', subCategory: '发散风热', property: '凉', flavor: '甘、辛', meridian: '脾、胃', toxicity: '无毒', functions: '解肌退热，生津止渴，升阳止泻', dosage: '10-15g', taboos: '胃寒者慎用' },
      // 清热药
      { id: 11, name: '石膏', pinyin: 'Shi Gao', category: '清热药', subCategory: '清热泻火', property: '大寒', flavor: '甘、辛', meridian: '肺、胃', toxicity: '无毒', functions: '清热泻火，除烦止渴', dosage: '15-60g', taboos: '脾胃虚寒及阴虚内热者忌用' },
      { id: 12, name: '知母', pinyin: 'Zhi Mu', category: '清热药', subCategory: '清热泻火', property: '寒', flavor: '苦、甘', meridian: '肺、胃、肾', toxicity: '无毒', functions: '清热泻火，滋阴润燥', dosage: '6-12g', taboos: '脾虚便溏者慎用' },
      { id: 13, name: '黄芩', pinyin: 'Huang Qin', category: '清热药', subCategory: '清热燥湿', property: '寒', flavor: '苦', meridian: '肺、胆、脾、胃、大肠、小肠', toxicity: '无毒', functions: '清热燥湿，泻火解毒，止血安胎', dosage: '3-10g', taboos: '脾胃虚寒者忌用' },
      { id: 14, name: '黄连', pinyin: 'Huang Lian', category: '清热药', subCategory: '清热燥湿', property: '寒', flavor: '苦', meridian: '心、肝、胃、大肠', toxicity: '无毒', functions: '清热燥湿，泻火解毒', dosage: '2-5g', taboos: '脾胃虚寒、阴虚津伤者忌用' },
      { id: 15, name: '金银花', pinyin: 'Jin Yin Hua', category: '清热药', subCategory: '清热解毒', property: '寒', flavor: '甘', meridian: '肺、心、胃', toxicity: '无毒', functions: '清热解毒，疏散风热', dosage: '6-15g', taboos: '脾胃虚寒者慎用' },
      { id: 16, name: '连翘', pinyin: 'Lian Qiao', category: '清热药', subCategory: '清热解毒', property: '微寒', flavor: '苦', meridian: '肺、心、小肠', toxicity: '无毒', functions: '清热解毒，散结消肿，疏散风热', dosage: '6-15g', taboos: '脾胃虚寒者慎用' },
      // 补虚药
      { id: 17, name: '人参', pinyin: 'Ren Shen', category: '补虚药', subCategory: '补气', property: '微温', flavor: '甘、微苦', meridian: '脾、肺、心', toxicity: '无毒', functions: '大补元气，补脾益肺，生津安神', dosage: '3-9g', taboos: '实证、热证忌用，反藜芦' },
      { id: 18, name: '黄芪', pinyin: 'Huang Qi', category: '补虚药', subCategory: '补气', property: '微温', flavor: '甘', meridian: '脾、肺', toxicity: '无毒', functions: '补气升阳，固表止汗，利水消肿', dosage: '9-30g', taboos: '表实邪盛、阴虚阳亢者慎用' },
      { id: 19, name: '当归', pinyin: 'Dang Gui', category: '补虚药', subCategory: '补血', property: '温', flavor: '甘、辛', meridian: '肝、心、脾', toxicity: '无毒', functions: '补血活血，调经止痛，润肠通便', dosage: '6-12g', taboos: '湿盛中满、大便溏泄者慎用' },
      { id: 20, name: '白芍', pinyin: 'Bai Shao', category: '补虚药', subCategory: '补血', property: '微寒', flavor: '苦、酸', meridian: '肝、脾', toxicity: '无毒', functions: '养血敛阴，柔肝止痛，平抑肝阳', dosage: '6-15g', taboos: '虚寒腹痛泄泻者慎用，反藜芦' },
      { id: 21, name: '甘草', pinyin: 'Gan Cao', category: '补虚药', subCategory: '补气', property: '平', flavor: '甘', meridian: '心、肺、脾、胃', toxicity: '无毒', functions: '补脾益气，润肺止咳，缓急止痛，调和药性', dosage: '2-10g', taboos: '湿盛胀满、水肿者慎用，反甘遂、大戟、芫花、海藻' },
      { id: 22, name: '枸杞子', pinyin: 'Gou Qi Zi', category: '补虚药', subCategory: '补阴', property: '平', flavor: '甘', meridian: '肝、肾', toxicity: '无毒', functions: '滋补肝肾，益精明目', dosage: '6-12g', taboos: '外邪实热、脾虚湿滞者慎用' },
      // 祛湿药
      { id: 23, name: '茯苓', pinyin: 'Fu Ling', category: '祛湿药', subCategory: '利水渗湿', property: '平', flavor: '甘、淡', meridian: '心、肺、脾、肾', toxicity: '无毒', functions: '利水渗湿，健脾宁心', dosage: '10-15g', taboos: '虚寒精滑者慎用' },
      { id: 24, name: '苍术', pinyin: 'Cang Zhu', category: '祛湿药', subCategory: '化湿', property: '温', flavor: '辛、苦', meridian: '脾、胃、肝', toxicity: '无毒', functions: '燥湿健脾，祛风散寒', dosage: '3-9g', taboos: '阴虚内热、气虚多汗者慎用' },
      { id: 25, name: '泽泻', pinyin: 'Ze Xie', category: '祛湿药', subCategory: '利水渗湿', property: '寒', flavor: '甘', meridian: '肾、膀胱', toxicity: '无毒', functions: '利水渗湿，泄热', dosage: '6-10g', taboos: '肾虚精滑者慎用' },
      // 理气药
      { id: 26, name: '陈皮', pinyin: 'Chen Pi', category: '理气药', subCategory: '理气', property: '温', flavor: '辛、苦', meridian: '脾、肺', toxicity: '无毒', functions: '理气健脾，燥湿化痰', dosage: '3-10g', taboos: '气虚阴虚者慎用' },
      { id: 27, name: '枳实', pinyin: 'Zhi Shi', category: '理气药', subCategory: '理气', property: '微寒', flavor: '苦、辛、酸', meridian: '脾、胃', toxicity: '无毒', functions: '破气消积，化痰散痞', dosage: '3-10g', taboos: '脾胃虚弱及孕妇慎用' },
      { id: 28, name: '木香', pinyin: 'Mu Xiang', category: '理气药', subCategory: '理气', property: '温', flavor: '辛、苦', meridian: '脾、胃、大肠、胆', toxicity: '无毒', functions: '行气止痛，健脾消食', dosage: '3-6g', taboos: '阴虚津液不足者慎用' },
      // 温里药
      { id: 29, name: '附子', pinyin: 'Fu Zi', category: '温里药', subCategory: '温里', property: '大热', flavor: '辛、甘', meridian: '心、肾、脾', toxicity: '有毒', functions: '回阳救逆，补火助阳，散寒止痛', dosage: '3-15g', taboos: '阴虚阳亢及孕妇禁用' },
      { id: 30, name: '干姜', pinyin: 'Gan Jiang', category: '温里药', subCategory: '温里', property: '热', flavor: '辛', meridian: '脾、胃、心、肺', toxicity: '无毒', functions: '温中散寒，回阳通脉，温肺化饮', dosage: '3-10g', taboos: '阴虚内热、血热妄行者忌用' },
      { id: 31, name: '肉桂', pinyin: 'Rou Gui', category: '温里药', subCategory: '温里', property: '大热', flavor: '辛、甘', meridian: '肾、脾、心、肝', toxicity: '无毒', functions: '补火助阳，散寒止痛，温通经脉', dosage: '1-5g', taboos: '阴虚火旺、有出血倾向及孕妇慎用' },
      // 活血药
      { id: 32, name: '川芎', pinyin: 'Chuan Xiong', category: '活血药', subCategory: '活血化瘀', property: '温', flavor: '辛', meridian: '肝、胆、心包', toxicity: '无毒', functions: '活血行气，祛风止痛', dosage: '3-10g', taboos: '阴虚火旺、月经过多者慎用' },
      { id: 33, name: '丹参', pinyin: 'Dan Shen', category: '活血药', subCategory: '活血化瘀', property: '微寒', flavor: '苦', meridian: '心、肝', toxicity: '无毒', functions: '活血祛瘀，通经止痛，清心除烦', dosage: '10-15g', taboos: '无瘀血者及孕妇慎用，反藜芦' },
      { id: 34, name: '桃仁', pinyin: 'Tao Ren', category: '活血药', subCategory: '活血化瘀', property: '平', flavor: '苦、甘', meridian: '心、肝、大肠', toxicity: '有小毒', functions: '活血祛瘀，润肠通便，止咳平喘', dosage: '5-10g', taboos: '孕妇及血虚者忌用' },
      // 安神药
      { id: 35, name: '酸枣仁', pinyin: 'Suan Zao Ren', category: '安神药', subCategory: '养心安神', property: '平', flavor: '甘、酸', meridian: '肝、胆、心', toxicity: '无毒', functions: '养心补肝，宁心安神，敛汗生津', dosage: '10-15g', taboos: '实邪郁火者慎用' },
      { id: 36, name: '远志', pinyin: 'Yuan Zhi', category: '安神药', subCategory: '养心安神', property: '温', flavor: '苦、辛', meridian: '心、肾、肺', toxicity: '无毒', functions: '安神益智，祛痰开窍，消散痈肿', dosage: '3-10g', taboos: '有溃疡及胃炎者慎用' },
      // 化痰药
      { id: 37, name: '半夏', pinyin: 'Ban Xia', category: '化痰药', subCategory: '温化寒痰', property: '温', flavor: '辛', meridian: '脾、胃、肺', toxicity: '有毒', functions: '燥湿化痰，降逆止呕，消痞散结', dosage: '3-9g', taboos: '阴虚燥咳、血证者慎用，反乌头' },
      { id: 38, name: '川贝母', pinyin: 'Chuan Bei Mu', category: '化痰药', subCategory: '清化热痰', property: '微寒', flavor: '苦、甘', meridian: '肺、心', toxicity: '无毒', functions: '清热润肺，化痰止咳，散结消痈', dosage: '3-10g', taboos: '脾胃虚寒及有湿痰者慎用，反乌头' },
      { id: 39, name: '桔梗', pinyin: 'Jie Geng', category: '化痰药', subCategory: '清化热痰', property: '平', flavor: '苦、辛', meridian: '肺', toxicity: '无毒', functions: '宣肺祛痰，利咽排脓', dosage: '3-10g', taboos: '阴虚久咳、气逆及咳血者慎用' },
      // 消食药
      { id: 40, name: '山楂', pinyin: 'Shan Zha', category: '消食药', subCategory: '消食', property: '微温', flavor: '酸、甘', meridian: '脾、胃、肝', toxicity: '无毒', functions: '消食健胃，行气散瘀，化浊降脂', dosage: '9-12g', taboos: '胃酸过多者慎用' },
      { id: 41, name: '麦芽', pinyin: 'Mai Ya', category: '消食药', subCategory: '消食', property: '平', flavor: '甘', meridian: '脾、胃', toxicity: '无毒', functions: '行气消食，健脾开胃，回乳消胀', dosage: '10-15g', taboos: '哺乳期妇女慎用' },
      { id: 42, name: '神曲', pinyin: 'Shen Qu', category: '消食药', subCategory: '消食', property: '温', flavor: '甘、辛', meridian: '脾、胃', toxicity: '无毒', functions: '消食和胃', dosage: '6-15g', taboos: '脾阴虚胃火盛者慎用' },
      // 泻下药
      { id: 43, name: '大黄', pinyin: 'Da Huang', category: '泻下药', subCategory: '攻下', property: '寒', flavor: '苦', meridian: '脾、胃、大肠、肝、心包', toxicity: '无毒', functions: '攻积滞，清湿热，泻火凉血，祛瘀解毒', dosage: '3-12g', taboos: '孕妇、月经期及哺乳期妇女忌用，脾胃虚弱者慎用' },
      { id: 44, name: '火麻仁', pinyin: 'Huo Ma Ren', category: '泻下药', subCategory: '润下', property: '平', flavor: '甘', meridian: '脾、胃、大肠', toxicity: '无毒', functions: '润肠通便', dosage: '10-15g', taboos: '脾虚便溏者慎用' },
      // 更多药材
      { id: 45, name: '大枣', pinyin: 'Da Zao', category: '补虚药', subCategory: '补气', property: '温', flavor: '甘', meridian: '脾、胃', toxicity: '无毒', functions: '补中益气，养血安神', dosage: '6-15g', taboos: '湿盛脘腹胀满者慎用' },
      { id: 46, name: '白术', pinyin: 'Bai Zhu', category: '补虚药', subCategory: '补气', property: '温', flavor: '苦、甘', meridian: '脾、胃', toxicity: '无毒', functions: '健脾益气，燥湿利水，止汗安胎', dosage: '6-12g', taboos: '阴虚内热、津亏燥渴者慎用' },
      { id: 47, name: '山药', pinyin: 'Shan Yao', category: '补虚药', subCategory: '补气', property: '平', flavor: '甘', meridian: '脾、肺、肾', toxicity: '无毒', functions: '补脾养胃，生津益肺，补肾涩精', dosage: '15-30g', taboos: '湿盛中满或有积滞者慎用' },
      { id: 48, name: '杜仲', pinyin: 'Du Zhong', category: '补虚药', subCategory: '补阳', property: '温', flavor: '甘', meridian: '肝、肾', toxicity: '无毒', functions: '补肝肾，强筋骨，安胎', dosage: '6-10g', taboos: '阴虚火旺者慎用' },
      { id: 49, name: '熟地黄', pinyin: 'Shu Di Huang', category: '补虚药', subCategory: '补血', property: '微温', flavor: '甘', meridian: '肝、肾', toxicity: '无毒', functions: '补血滋阴，益精填髓', dosage: '9-15g', taboos: '气滞痰多、脘腹胀痛、食少便溏者慎用' },
      { id: 50, name: '阿胶', pinyin: 'E Jiao', category: '补虚药', subCategory: '补血', property: '平', flavor: '甘', meridian: '肺、肝、肾', toxicity: '无毒', functions: '补血滋阴，润燥止血', dosage: '3-9g', taboos: '脾胃虚弱、消化不良者慎用' },
    ];

    this.setData({ allHerbs: mockHerbs });
    this.filterHerbs();
  },

  // 筛选药材
  filterHerbs() {
    let list = [...this.data.allHerbs];
    const { searchKeyword, activeCategory } = this.data;

    // 按分类筛选
    if (activeCategory !== 'all') {
      list = list.filter(item => item.category === activeCategory);
    }

    // 按关键词搜索
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase();
      list = list.filter(item =>
        item.name.toLowerCase().includes(keyword) ||
        item.pinyin.toLowerCase().includes(keyword) ||
        item.functions.toLowerCase().includes(keyword)
      );
    }

    // 分页
    const pageSize = this.data.pageSize;
    const page = this.data.page;
    const start = (page - 1) * pageSize;
    const paginatedList = list.slice(0, start + pageSize);
    const hasMore = list.length > start + pageSize;

    this.setData({
      herbList: page === 1 ? paginatedList : paginatedList,
      hasMore
    });
  },

  // 加载更多
  loadMore() {
    this.setData({
      loading: true,
      page: this.data.page + 1
    });
    this.filterHerbs();
    this.setData({ loading: false });
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value, page: 1 });
    this.filterHerbs();
  },

  // 清空搜索
  clearSearch() {
    this.setData({ searchKeyword: '', page: 1 });
    this.filterHerbs();
  },

  // 分类切换
  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      activeCategory: category,
      page: 1,
      hasMore: true
    });
    this.filterHerbs();
  },

  // 跳转药材详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/herb-detail/herb-detail?id=${id}`
    });
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '倪海厦经方助手药材库 — 416味中药知识大全',
      path: '/pages/herbs/herbs',
    };
  }
});
