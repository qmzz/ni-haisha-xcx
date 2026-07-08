// pages/cases/cases.js — 医案馆页面逻辑
const app = getApp();

Page({
  data: {
    activeCategory: 'all',
    categories: [
      { id: 'all', name: '全部' },
      { id: '伤寒', name: '伤寒' },
      { id: '金匮', name: '金匮' },
      { id: '温病', name: '温病' },
      { id: '杂病', name: '杂病' },
      { id: '儿科', name: '儿科' },
      { id: '妇科', name: '妇科' },
    ],
    caseList: [],
    allCases: [],
  },

  onLoad() {
    this.loadMockData();
  },

  loadMockData() {
    const mockCases = [
      {
        id: 1,
        title: '桂枝汤证治验案',
        source: '伤寒论医案',
        doctor: '倪海厦',
        date: '经方医案',
        category: '伤寒',
        summary: '患者发热汗出，恶风，脉浮缓，符合桂枝汤证。投桂枝汤原方，一剂知，二剂已。',
        details: {
          symptoms: '头痛发热，汗出恶风，鼻鸣干呕，舌苔薄白，脉浮缓',
          diagnosis: '太阳中风表虚证',
          formula: '桂枝汤（桂枝三两、芍药三两、甘草二两炙、生姜三两、大枣十二枚）',
          result: '服药一剂，汗出热减，再剂诸症悉除',
          analysis: '此案典型太阳中风证，桂枝汤调和营卫，解肌发表。方证对应，故效如桴鼓。'
        }
      },
      {
        id: 2,
        title: '小柴胡汤治少阳病案',
        source: '临床治验',
        doctor: '倪海厦',
        date: '经方医案',
        category: '伤寒',
        summary: '妇人伤寒发热，经水适来，昼日明了，暮则谵语，如见鬼状，此为热入血室。',
        details: {
          symptoms: '往来寒热，胸胁苦满，默默不欲饮食，心烦喜呕，口苦咽干',
          diagnosis: '少阳病 · 热入血室',
          formula: '小柴胡汤加减（柴胡半斤、黄芩三两、人参三两、半夏半升、甘草三两炙、生姜三两、大枣十二枚）',
          result: '服三剂热退神安，胸胁舒畅，诸症悉除',
          analysis: '妇人经期伤寒，邪陷少阳血室，小柴胡汤既可和解少阳，又能疏泄血室之热，正合病机。'
        }
      },
      {
        id: 3,
        title: '桂枝茯苓丸治子宫肌瘤案',
        source: '金匮要略临床应用',
        doctor: '倪海厦',
        date: '经方医案',
        category: '妇科',
        summary: '妇人腹中有肌瘤，经来腹痛有血块，投桂枝茯苓丸，三个月肌瘤明显缩小。',
        details: {
          symptoms: '月经不调，经来腹痛，血色暗紫有块，触诊腹部有块状物',
          diagnosis: '血瘀癥瘕',
          formula: '桂枝茯苓丸（桂枝、茯苓、牡丹皮、桃仁、芍药各等分为丸）',
          result: '连服三月，肌瘤显著缩小，腹痛消失',
          analysis: '桂枝茯苓丸活血化瘀消癥，虽为缓剂，久服亦能建功。此即倪师所言"王道无近功，久服自有益"。'
        }
      },
      {
        id: 4,
        title: '葛根汤治颈椎病案',
        source: '临床杂病医案',
        doctor: '倪海厦',
        date: '经方医案',
        category: '杂病',
        summary: '患者颈项强痛，转头困难，投葛根汤原方，三剂痛减大半。',
        details: {
          symptoms: '颈项僵硬酸痛，转头困难，连及肩背疼痛，畏风怕冷',
          diagnosis: '太阳经输不利',
          formula: '葛根汤（葛根四两、麻黄三两、桂枝二两、生姜三两、甘草二两炙、芍药二两、大枣十二枚）',
          result: '三剂后颈项灵活，疼痛大减，再服五剂愈',
          analysis: '"项背强几几"为葛根汤主证，方中葛根升津舒筋，麻黄桂枝散寒解肌，正合颈椎病因风寒束表、经输不利之机。'
        }
      },
      {
        id: 5,
        title: '小青龙汤治哮喘案',
        source: '经方治喘医案',
        doctor: '倪海厦',
        date: '经方医案',
        category: '杂病',
        summary: '小儿哮喘多年，每逢天寒即发，投小青龙汤加味，半月喘平。',
        details: {
          symptoms: '喘咳胸闷，痰多稀白，不能平卧，恶寒发热，无汗',
          diagnosis: '外寒内饮证',
          formula: '小青龙汤加减（麻黄、桂枝、芍药、细辛、干姜、炙甘草、五味子、半夏）',
          result: '三剂喘减，七剂胸畅，半月基本痊愈',
          analysis: '小青龙汤为外寒内饮之要方，外散风寒，内化水饮。小儿哮喘多由此证，辨证准确则收效甚速。'
        }
      },
      {
        id: 6,
        title: '四逆汤救阳脱案',
        source: '危重症医案',
        doctor: '倪海厦',
        date: '经方医案',
        category: '伤寒',
        summary: '患者手足厥冷，脉微欲绝，急投四逆汤加人参，两剂转危为安。',
        details: {
          symptoms: '四肢厥逆，恶寒蜷卧，精神萎靡，脉微欲绝',
          diagnosis: '少阴病 · 亡阳证',
          formula: '四逆汤加人参（生附子一枚、干姜一两半、炙甘草二两、人参三钱）',
          result: '一剂手足转温，两剂神清脉复',
          analysis: '四逆汤为回阳救逆第一方，辨证精准则起死回生。加人参以益气固脱，增益回阳之力。'
        }
      }
    ];

    this.setData({ allCases: mockCases });
    this.filterCases();
  },

  filterCases() {
    let list = [...this.data.allCases];
    const { activeCategory } = this.data;
    if (activeCategory !== 'all') {
      list = list.filter(item => item.category === activeCategory);
    }
    this.setData({ caseList: list });
  },

  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ activeCategory: category });
    this.filterCases();
  },

  // 展开/收起详情
  toggleDetail(e) {
    const id = e.currentTarget.dataset.id;
    const caseList = this.data.caseList.map(item => {
      if (item.id === id) {
        item.expanded = !item.expanded;
      }
      return item;
    });
    this.setData({ caseList });
  },

  onPullDownRefresh() {
    this.filterCases();
    wx.stopPullDownRefresh();
  },

  onShareAppMessage() {
    return {
      title: '倪海厦经方助手医案馆 — 经典经方医案研习',
      path: '/pages/cases/cases',
    };
  }
});
