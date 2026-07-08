// 云函数：知识库查询 — 通用数据查询接口
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const { collection, action, query = {}, data, id } = event;

  try {
    switch (action) {
      case 'list': {
        // 列表查询，支持搜索和分页
        const { keyword = '', page = 1, pageSize = 20, category = '' } = query;
        const _ = db.command;
        let where = {};

        if (keyword) {
          where = _.or([
            { name: db.RegExp({ regexp: keyword, options: 'i' }) },
            { keywords: db.RegExp({ regexp: keyword, options: 'i' }) },
            { summary: db.RegExp({ regexp: keyword, options: 'i' }) }
          ]);
        }
        if (category) {
          where.category = category;
        }

        const countRes = await db.collection(collection).where(where).count();
        const listRes = await db.collection(collection)
          .where(where)
          .field({ content: false })  // 列表不返回正文，减少数据量
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .get();

        return {
          code: 0,
          data: {
            list: listRes.data,
            total: countRes.total,
            page,
            pageSize
          }
        };
      }

      case 'detail': {
        const res = await db.collection(collection).doc(id).get();
        if (!res.data || res.data.length === 0) {
          return { code: -1, message: '未找到该记录' };
        }
        return { code: 0, data: res.data };
      }

      case 'search': {
        const { keyword, limit = 10 } = query;
        const _ = db.command;
        const res = await db.collection(collection)
          .where(_.or([
            { name: db.RegExp({ regexp: keyword, options: 'i' }) },
            { keywords: db.RegExp({ regexp: keyword, options: 'i' }) }
          ]))
          .field({ content: false })
          .limit(limit)
          .get();
        return { code: 0, data: res.data };
      }

      case 'categories': {
        // 获取分类列表（去重）
        const res = await db.collection(collection)
          .field({ category: true })
          .get();
        const cats = [...new Set(res.data.map(r => r.category).filter(Boolean))];
        return { code: 0, data: cats };
      }

      default:
        return { code: -1, message: '未知操作' };
    }
  } catch (err) {
    console.error('知识库查询失败:', err);
    return { code: -1, message: err.message };
  }
};
