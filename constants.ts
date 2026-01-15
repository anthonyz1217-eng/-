
import { CarModel } from './types';

export const CAR_MODELS: CarModel[] = [
  {
    id: 'a5l',
    name: '奥迪 A5L',
    points: ['全新数字座舱', '运动型格设计', '高效动力总成', '高颜值']
  },
  {
    id: 'a4l',
    name: '奥迪 A4L',
    points: ['全新动感设计', '奢适智享空间', '高能澎湃动力', '豪华先锋科技']
  },
  {
    id: 'a3',
    name: '奥迪 A3',
    points: ['先锋灵动美学', '进取数字座舱', '敏捷随心操控', '精致都市格调']
  },
  {
    id: 'a8l',
    name: '奥迪 A8L',
    points: ['旗舰至臻工艺', '尊崇私享座舱', '智能精控悬架', '时代格局美学']
  },
  {
    id: 'q5l',
    name: '奥迪 Q5L',
    points: ['超长轴距空间', 'quattro ultra 智能四驱', '全地形适应性', '家庭全能SUV']
  },
  {
    id: 'a6l',
    name: '奥迪 A6L',
    points: ['商务旗舰标杆', '豪华行政后排', '矩阵式LED大灯', '48V轻混系统']
  },
  {
    id: 'q4etron',
    name: '奥迪 Q4 e-tron',
    points: ['纯电MEB平台', '605km超长续航', 'AR-HUD抬头显示', '静谧空间体验']
  },
  {
    id: 'other',
    name: '其他车型',
    points: ['自定义核心卖点', '通用促销政策', '品牌综合调性']
  }
];

export const BENCHMARKS = {
  LEAD_COST: 90,
  ENGAGEMENT_RATE: 2.5,
  RETENTION_RATE: 35,
  LIVE_DURATION: 4, // Hours
};
