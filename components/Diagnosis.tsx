
import React, { useState, useRef } from 'react';
import { AlertCircle, CheckCircle2, TrendingUp, Info, Upload, X, FileText, Loader2 } from 'lucide-react';
import { BENCHMARKS } from '../constants';
import { gemini } from '../services/geminiService';
import { SYSTEM_PROMPTS } from '../lib/prompts';

interface Metric {
  label: string;
  value: number | string;
  benchmark: number;
  unit: string;
  isGood: boolean;
}

const Diagnosis: React.FC = () => {
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<{ data: string, mimeType: string, name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [metrics, setMetrics] = useState<Metric[]>([
    { label: '平均线索成本', value: '--', benchmark: BENCHMARKS.LEAD_COST, unit: '元', isGood: false },
    { label: '直播间点击转化率', value: '--', benchmark: BENCHMARKS.ENGAGEMENT_RATE, unit: '%', isGood: true },
    { label: '5s完播率', value: '--', benchmark: BENCHMARKS.RETENTION_RATE, unit: '%', isGood: false },
    { label: '每日直播时长', value: '--', benchmark: BENCHMARKS.LIVE_DURATION, unit: 'h', isGood: true },
  ]);

  const [conclusions, setConclusions] = useState<string[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        setUploadedImage({ data: base64, mimeType: file.type, name: file.name });
      };
      reader.readAsDataURL(file);
    } else {
      alert('请上传图片格式的后台截图 (PNG/JPG)');
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartAnalysis = async () => {
    if (!uploadedImage) {
      alert('请先上传经销商后台运营截图');
      return;
    }

    setIsAnalysing(true);
    setShowReport(false);

    try {
      const responseText = await gemini.generate(
        [
          { text: SYSTEM_PROMPTS.DIAGNOSIS_ANALYZER },
          {
            inlineData: {
              data: uploadedImage.data,
              mimeType: uploadedImage.mimeType,
            },
          },
        ]
      );

      const cleanedJson = responseText.replace(/```json|```/g, '').trim();
      const result = JSON.parse(cleanedJson);

      if (result.metrics && Array.isArray(result.metrics)) {
        const updatedMetrics = result.metrics.map((m: any) => {
          const benchmarkKey = m.label === '平均线索成本' ? 'LEAD_COST' : 
                               m.label === '直播间点击转化率' ? 'ENGAGEMENT_RATE' :
                               m.label === '5s完播率' ? 'RETENTION_RATE' : 'LIVE_DURATION';
          
          const benchmark = (BENCHMARKS as any)[benchmarkKey] || 0;
          
          return {
            ...m,
            benchmark,
            // Simple logic for isGood if AI didn't provide it reliably
            isGood: m.label === '平均线索成本' ? m.value <= benchmark : m.value >= benchmark
          };
        });
        setMetrics(updatedMetrics);
      }

      if (result.conclusions && Array.isArray(result.conclusions)) {
        setConclusions(result.conclusions);
      }
      
      setShowReport(true);
    } catch (error) {
      console.error("Diagnosis error:", error);
      alert("诊断失败，请确保上传了清晰的数据截图。");
    } finally {
      setIsAnalysing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2329]">运营诊断</h1>
          <p className="text-sm text-gray-500 mt-1">上传后台截图，AI 自动提取关键指标并生成深度报告</p>
        </div>
        <button 
          onClick={handleStartAnalysis}
          disabled={isAnalysing || !uploadedImage}
          className="bg-[#3370FF] text-white px-6 py-2 rounded-md font-medium hover:bg-blue-600 transition-colors flex items-center disabled:opacity-50 shadow-md"
        >
          {isAnalysing ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              智能分析中...
            </>
          ) : '开始诊断'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="bg-white p-5 rounded-lg border border-[#E4E5E7] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">{metric.label}</span>
              {metric.value !== '--' && (
                metric.isGood ? (
                  <CheckCircle2 size={18} className="text-green-500" />
                ) : (
                  <AlertCircle size={18} className="text-red-500" />
                )
              )}
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-[#1F2329]">{metric.value}</span>
              <span className="text-xs text-gray-400">{metric.unit}</span>
            </div>
            <div className="mt-3 flex items-center text-xs">
              <span className="text-gray-400">行业基准: {metric.benchmark}{metric.unit}</span>
              {metric.value !== '--' && typeof metric.value === 'number' && (
                <div className="ml-auto flex items-center">
                  {metric.isGood ? (
                    <TrendingUp size={14} className="text-green-500 mr-1" />
                  ) : (
                    <TrendingUp size={14} className="text-red-500 transform rotate-180 mr-1" />
                  )}
                  <span className={metric.isGood ? 'text-green-500' : 'text-red-500'}>
                    {Math.abs(((metric.value - metric.benchmark) / metric.benchmark) * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-[#E4E5E7] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#E4E5E7] bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-700 flex items-center">
            <Info size={16} className="mr-2 text-blue-500" />
            基础数据录入
          </h3>
          <span className="text-xs text-gray-400">请上传巨量引擎/小红书后台截图</span>
        </div>
        <div className="p-6">
          {!uploadedImage ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group"
            >
              <Upload size={48} className="text-gray-300 group-hover:text-blue-500 mb-4 transition-colors" />
              <p className="text-sm text-gray-600 font-bold">点击或拖拽后台截图到此处</p>
              <p className="text-xs text-gray-400 mt-2">支持：直播总览、视频明细、投流后台等页面截图</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
          ) : (
            <div className="relative group max-w-md mx-auto">
              <div className="absolute -top-2 -right-2 z-10">
                <button 
                  onClick={removeImage}
                  className="bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <img 
                  src={`data:${uploadedImage.mimeType};base64,${uploadedImage.data}`} 
                  alt="Uploaded screenshot" 
                  className="w-full h-auto object-contain bg-gray-50"
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center"><FileText size={12} className="mr-1" /> {uploadedImage.name}</span>
                <span className="uppercase">{uploadedImage.mimeType.split('/')[1]}</span>
              </div>
            </div>
          )}

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700">业务背景描述 (可选)</label>
              <textarea 
                className="w-full p-3 border border-[#E4E5E7] rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                placeholder="例如：本周正在主推 A5L 新车上市活动，希望重点分析自然流转化为线索的情况..."
              />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700">流量构成估算</label>
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div className="space-y-2">
                   <div className="flex justify-between text-xs font-medium">
                    <span className="text-blue-600">自然流量: 40%</span>
                    <span className="text-indigo-600">商业投放: 60%</span>
                  </div>
                  <input type="range" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500" defaultValue="60" />
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed italic">
                  * 此比例将结合截图中的“千次观看成本”辅助计算门店的综合 ROI。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showReport && conclusions.length > 0 && (
        <div className="bg-[#EBF1FF] border border-[#3370FF] rounded-lg p-6 animate-in slide-in-from-bottom duration-500 shadow-lg shadow-blue-100/50">
          <h4 className="font-bold text-[#3370FF] text-lg mb-6 flex items-center">
            <CheckCircle2 size={24} className="mr-3" />
            AI 智能诊断结论
          </h4>
          <div className="grid grid-cols-1 gap-6">
            {conclusions.map((conclusion, i) => {
              const [title, content] = conclusion.split('：');
              return (
                <div key={i} className="flex space-x-4 bg-white/60 p-4 rounded-lg border border-blue-100">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0 text-sm">
                    {i + 1}
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-blue-900 block mb-1 text-base">{title}</span>
                    <p className="text-gray-700 leading-relaxed">{content}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-8 flex justify-center">
            <button className="text-xs font-bold text-blue-600 bg-blue-100 px-4 py-2 rounded-full hover:bg-blue-200 transition-all">
              导出 PDF 诊断报告
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diagnosis;
