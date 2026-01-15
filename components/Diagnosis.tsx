
import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, TrendingUp, Info, Upload } from 'lucide-react';
import { BENCHMARKS } from '../constants';

const Diagnosis: React.FC = () => {
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const metrics = [
    { label: '平均线索成本', value: 125, benchmark: BENCHMARKS.LEAD_COST, unit: '元', isGood: false },
    { label: '直播间点击转化率', value: 3.2, benchmark: BENCHMARKS.ENGAGEMENT_RATE, unit: '%', isGood: true },
    { label: '5s完播率', value: 28, benchmark: BENCHMARKS.RETENTION_RATE, unit: '%', isGood: false },
    { label: '每日直播时长', value: 5.5, benchmark: BENCHMARKS.LIVE_DURATION, unit: 'h', isGood: true },
  ];

  const handleStartAnalysis = () => {
    setIsAnalysing(true);
    setTimeout(() => {
      setIsAnalysing(false);
      setShowReport(true);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2329]">运营诊断</h1>
          <p className="text-sm text-gray-500 mt-1">基于大数据模型，深度分析门店经营健康度</p>
        </div>
        <button 
          onClick={handleStartAnalysis}
          disabled={isAnalysing}
          className="bg-[#3370FF] text-white px-6 py-2 rounded-md font-medium hover:bg-blue-600 transition-colors flex items-center disabled:opacity-50"
        >
          {isAnalysing ? '诊断中...' : '开始诊断'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="bg-white p-5 rounded-lg border border-[#E4E5E7] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">{metric.label}</span>
              {metric.isGood ? (
                <CheckCircle2 size={18} className="text-green-500" />
              ) : (
                <AlertCircle size={18} className="text-red-500" />
              )}
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-[#1F2329]">{metric.value}</span>
              <span className="text-xs text-gray-400">{metric.unit}</span>
            </div>
            <div className="mt-3 flex items-center text-xs">
              <span className="text-gray-400">行业基准: {metric.benchmark}{metric.unit}</span>
              <div className="ml-auto flex items-center">
                {metric.isGood ? (
                  <TrendingUp size={14} className="text-green-500 mr-1" />
                ) : (
                  <TrendingUp size={14} className="text-red-500 transform rotate-180 mr-1" />
                )}
                <span className={metric.isGood ? 'text-green-500' : 'text-red-500'}>
                  {Math.abs(((metric.value as number - metric.benchmark) / metric.benchmark) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-[#E4E5E7] overflow-hidden">
        <div className="p-4 border-b border-[#E4E5E7] bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-700 flex items-center">
            <Info size={16} className="mr-2 text-blue-500" />
            基础数据录入
          </h3>
          <span className="text-xs text-gray-400">支持上传后台截图 (OCR识别)</span>
        </div>
        <div className="p-6">
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
            <Upload size={32} className="text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 font-medium">点击或拖拽文件到此处上传</p>
            <p className="text-xs text-gray-400 mt-1">支持 PNG, JPG, PDF (最大 20MB)</p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">后链路信息</label>
              <textarea 
                className="w-full p-3 border border-[#E4E5E7] rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24"
                placeholder="请输入详细的客户留资情况..."
              />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">渠道占比</label>
              <div className="space-y-2">
                <input type="range" className="w-full accent-blue-500" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>自然流量: 40%</span>
                  <span>投流: 60%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showReport && (
        <div className="bg-[#EBF1FF] border border-[#3370FF] rounded-lg p-6 animate-in slide-in-from-bottom duration-500">
          <h4 className="font-bold text-[#3370FF] text-lg mb-4 flex items-center">
            <CheckCircle2 size={20} className="mr-2" />
            智能诊断结论
          </h4>
          <div className="space-y-4 text-sm text-[#1F2329]">
            <p>1. <span className="font-bold">核心瓶颈：</span> 投流成本显著偏高（+38.9%），主要原因是视频前3秒流失率达到62%，未建立有效Hooks。</p>
            <p>2. <span className="font-bold">优化建议：</span> 建议增加“奥迪A5L雨夜系列”视觉脚本，提高互动率。建议将直播时段调整至 19:00 - 23:00 以匹配高净值人群。</p>
            <p>3. <span className="font-bold">预期效果：</span> 优化后预计线索单价可降至 85元 左右，环比提升 32%。</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diagnosis;
