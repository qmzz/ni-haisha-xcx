// pages/acupoints/acupoints.js — 穴位图页面逻辑
const app = getApp();

Page({
  data: {
    searchKeyword: '',
    activeMeridian: 'all',
    meridians: [
      { id: 'all', name: '全部' },
      { id: '手太阴肺经', name: '肺经' },
      { id: '手阳明大肠经', name: '大肠经' },
      { id: '足阳明胃经', name: '胃经' },
      { id: '足太阴脾经', name: '脾经' },
      { id: '手少阴心经', name: '心经' },
      { id: '手太阳小肠经', name: '小肠经' },
      { id: '足太阳膀胱经', name: '膀胱经' },
      { id: '足少阴肾经', name: '肾经' },
      { id: '手厥阴心包经', name: '心包经' },
      { id: '手少阳三焦经', name: '三焦经' },
      { id: '足少阳胆经', name: '胆经' },
      { id: '足厥阴肝经', name: '肝经' },
      { id: '任脉', name: '任脉' },
      { id: '督脉', name: '督脉' },
    ],
    acupointList: [],
    allAcupoints: [],
    loading: false,
    page: 1,
    pageSize: 20,
    hasMore: true,
    // 是否显示穴位图
    showMap: false,
  },

  onLoad() {
    this.loadMockData();
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true });
    this.filterAcupoints();
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return;
    this.loadMore();
  },

  loadMockData() {
    // 模拟 412 穴数据（部分）
    const mockAcupoints = [
      // 手太阴肺经
      { id: 1, name: '中府', code: 'LU-1', meridian: '手太阴肺经', category: '募穴', location: '胸前壁外上方，前正中线旁开6寸，平第1肋间隙处', functions: '宣肺清热，止咳平喘，清泻肺热', technique: '斜刺或平刺0.5-0.8寸，不可深刺' },
      { id: 2, name: '尺泽', code: 'LU-5', meridian: '手太阴肺经', category: '合穴', location: '肘横纹中，肱二头肌腱桡侧凹陷处', functions: '清热和胃，通络止痛，主治咳嗽、气喘、咯血、咽喉肿痛', technique: '直刺0.8-1.2寸，或点刺出血' },
      { id: 3, name: '列缺', code: 'LU-7', meridian: '手太阴肺经', category: '络穴、八脉交会穴', location: '前臂桡侧缘，桡骨茎突上方，腕横纹上1.5寸', functions: '宣肺解表，通调任脉，主治头痛项强、咳嗽气喘', technique: '向上斜刺0.3-0.5寸' },
      { id: 4, name: '太渊', code: 'LU-9', meridian: '手太阴肺经', category: '输穴、原穴、八会穴(脉会)', location: '腕掌侧横纹桡侧，桡动脉搏动处', functions: '补肺益气，止咳化痰，通调血脉', technique: '避开桡动脉，直刺0.3-0.5寸' },
      { id: 5, name: '少商', code: 'LU-11', meridian: '手太阴肺经', category: '井穴', location: '拇指桡侧指甲角旁0.1寸', functions: '清热利咽，开窍醒神，主治咽喉肿痛、中风昏迷', technique: '浅刺0.1寸，或点刺出血' },
      // 手阳明大肠经
      { id: 6, name: '合谷', code: 'LI-4', meridian: '手阳明大肠经', category: '原穴、四总穴', functions: '镇静止痛，通经活经，清热解表', location: '手背，第1、2掌骨间，第2掌骨桡侧中点', technique: '直刺0.5-1.0寸' },
      { id: 7, name: '曲池', code: 'LI-11', meridian: '手阳明大肠经', category: '合穴', functions: '清热解表，散风止痒，调和气血', location: '肘横纹外侧端，屈肘时尺泽与肱骨外上髁连线中点', technique: '直刺1.0-1.5寸' },
      // 足阳明胃经
      { id: 8, name: '足三里', code: 'ST-36', meridian: '足阳明胃经', category: '合穴、四总穴', functions: '健脾和胃，扶正培元，通经活络', location: '小腿前外侧，犊鼻下3寸，距胫骨前缘一横指', technique: '直刺1.0-2.0寸' },
      { id: 9, name: '天枢', code: 'ST-25', meridian: '足阳明胃经', category: '大肠募穴', functions: '调和肠胃，理气消滞', location: '腹中部，脐中旁开2寸', technique: '直刺1.0-1.5寸' },
      // 足太阴脾经
      { id: 10, name: '三阴交', code: 'SP-6', meridian: '足太阴脾经', category: '足三阴经交会穴', functions: '健脾益血，调肝补肾，安神', location: '小腿内侧，足内踝尖上3寸，胫骨内侧缘后方', technique: '直刺1.0-1.5寸' },
      // 手少阴心经
      { id: 11, name: '神门', code: 'HT-7', meridian: '手少阴心经', category: '输穴、原穴', functions: '宁心安神，通经活络', location: '腕掌侧横纹尺侧端，尺侧腕屈肌腱桡侧凹陷处', technique: '直刺0.3-0.5寸' },
      // 足太阳膀胱经
      { id: 12, name: '风门', code: 'BL-12', meridian: '足太阳膀胱经', category: '足太阳与督脉交会穴', functions: '宣肺解表，祛风散寒', location: '背部，第2胸椎棘突下，旁开1.5寸', technique: '斜刺0.5-0.8寸' },
      { id: 13, name: '肾俞', code: 'BL-23', meridian: '足太阳膀胱经', category: '背俞穴', functions: '补肾助阳，强腰利水', location: '腰部，第2腰椎棘突下，旁开1.5寸', technique: '直刺0.5-1.0寸' },
      // 足少阴肾经
      { id: 14, name: '涌泉', code: 'KI-1', meridian: '足少阴肾经', category: '井穴', functions: '滋阴益肾，平肝熄风，开窍醒神', location: '足底，卷足时足前部凹陷处', technique: '直刺0.5-1.0寸' },
      { id: 15, name: '太溪', code: 'KI-3', meridian: '足少阴肾经', category: '输穴、原穴', functions: '滋阴益肾，壮阳强腰', location: '足内侧，内踝后方，内踝尖与跟腱之间凹陷处', technique: '直刺0.5-1.0寸' },
      // 手厥阴心包经
      { id: 16, name: '内关', code: 'PC-6', meridian: '手厥阴心包经', category: '络穴、八脉交会穴', functions: '宁心安神，理气止痛，和胃降逆', location: '前臂掌侧，腕横纹上2寸，掌长肌腱与桡侧腕屈肌腱之间', technique: '直刺0.5-1.0寸' },
      // 任脉
      { id: 17, name: '关元', code: 'RN-4', meridian: '任脉', category: '小肠募穴、任脉与足三阴经交会穴', functions: '培补元气，导赤通淋', location: '下腹部，前正中线上，脐中下3寸', technique: '直刺1.0-2.0寸' },
      { id: 18, name: '气海', code: 'RN-6', meridian: '任脉', category: '肓之原', functions: '益气助阳，调经固经', location: '下腹部，前正中线上，脐中下1.5寸', technique: '直刺1.0-2.0寸' },
      // 足少阳胆经
      { id: 19, name: '风池', code: 'GB-20', meridian: '足少阳胆经', category: '足少阳与阳维脉交会穴', functions: '祛风解表，清利头目', location: '项部，枕骨之下，胸锁乳突肌与斜方肌上端之间的凹陷处', technique: '针尖微下，向鼻尖方向斜刺0.8-1.2寸' },
      { id: 20, name: '阳陵泉', code: 'GB-34', meridian: '足少阳胆经', category: '合穴、八会穴(筋会)', functions: '疏肝利胆，舒筋活络', location: '小腿外侧，腓骨头前下方凹陷处', technique: '直刺1.0-1.5寸' },
      // 督脉
      { id: 21, name: '百会', code: 'DU-20', meridian: '督脉', category: '督脉与足太阳经交会穴', functions: '开窍醒脑，升阳固脱', location: '头部，前发际正中直上5寸，或两耳尖连线中点处', technique: '平刺0.5-0.8寸' },
      { id: 22, name: '大椎', code: 'DU-14', meridian: '督脉', category: '督脉与手足三阳经交会穴', functions: '清热解表，截疟止痛', location: '后正中线上，第7颈椎棘突下凹陷中', technique: '直刺0.5-1.0寸' },
      // 足厥阴肝经
      { id: 23, name: '太冲', code: 'LR-3', meridian: '足厥阴肝经', category: '输穴、原穴', functions: '平肝熄风，清热利湿，通络止痛', location: '足背侧，第1、2跖骨结合部前方凹陷处', technique: '直刺0.5-1.0寸' },
      { id: 24, name: '期门', code: 'LR-14', meridian: '足厥阴肝经', category: '肝之募穴', functions: '疏肝理气，活血化瘀', location: '胸部，乳头直下第6肋间隙，前正中线旁开4寸', technique: '斜刺或平刺0.5-0.8寸，不可深刺' },
    ];

    this.setData({ allAcupoints: mockAcupoints });
    this.filterAcupoints();
  },

  filterAcupoints() {
    let list = [...this.data.allAcupoints];
    const { searchKeyword, activeMeridian } = this.data;

    if (activeMeridian !== 'all') {
      list = list.filter(item => item.meridian === activeMeridian);
    }

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase();
      list = list.filter(item =>
        item.name.toLowerCase().includes(keyword) ||
        item.code.toLowerCase().includes(keyword) ||
        item.functions.toLowerCase().includes(keyword) ||
        item.meridian.toLowerCase().includes(keyword)
      );
    }

    const pageSize = this.data.pageSize;
    const page = this.data.page;
    const start = (page - 1) * pageSize;
    const paginatedList = list.slice(0, start + pageSize);
    const hasMore = list.length > start + pageSize;

    this.setData({
      acupointList: page === 1 ? paginatedList : paginatedList,
      hasMore
    });
  },

  loadMore() {
    this.setData({ loading: true, page: this.data.page + 1 });
    this.filterAcupoints();
    this.setData({ loading: false });
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value, page: 1 });
    this.filterAcupoints();
  },

  clearSearch() {
    this.setData({ searchKeyword: '', page: 1 });
    this.filterAcupoints();
  },

  switchMeridian(e) {
    const meridian = e.currentTarget.dataset.meridian;
    this.setData({ activeMeridian: meridian, page: 1, hasMore: true });
    this.filterAcupoints();
  },

  toggleMap() {
    this.setData({ showMap: !this.data.showMap });
  },

  onShareAppMessage() {
    return {
      title: '倪海厦经方助手穴位图 — 412处穴位大全',
      path: '/pages/acupoints/acupoints',
    };
  }
});
