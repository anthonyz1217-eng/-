
import React, { useState } from 'react';
import { BookOpen, Hash, Smile, Layout, Sparkles, Copy, Type, Tags, RotateCcw, ChevronRight, ChevronLeft, MessageSquare, RefreshCw, Zap, Megaphone } from 'lucide-react';
import { CarModel } from '../types';
import { gemini } from '../services/geminiService';
import { SYSTEM_PROMPTS } from '../lib/prompts';

interface NoteLabProps {
  carModels: CarModel[];
}

const NoteLab: React.FC<NoteLabProps> = ({ carModels }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [titleLoading, setTitleLoading] = useState(false);
  const [tagLoading, setTagLoading] = useState(false);
  
  const [results, setResults] = useState<{ titles: string[], body: string } | null>(null);
  const [optimizedTitles, setOptimizedTitles] = useState<string[]>([]);
  const [optimizedTags, setOptimizedTags] = useState<string[]>([]);
  const [customModelName, setCustomModelName] = useState('');
  const [customPoints, setCustomPoints] = useState('');
  
  const [form, setForm] = useState({
    carId: carModels[0]?.id || 'other',
    case: '',
    policy: '奥迪Q5L限时置换补贴至高25000元，现车首付0元起'
  });

  const selectedCar = carModels.find(m => m.id === form.carId) || carModels[0];
  const isOther = form.carId === 'other';

  const handleGenerateBody = async () => {
    setLoading(true);
    const finalModelName = isOther ? (customModelName || "其他车型") : selectedCar.name;
    const finalPoints = isOther ? (customPoints ? customPoints.split(/[，,]/) : selectedCar.points) : selectedCar.points;

    const prompt = SYSTEM_PROMPTS.XHS_NOTE(form.case, finalModelName, finalPoints, form.policy);
    const res = await gemini.generate(prompt);
    
    setResults({ titles: [], body: res.trim() });
    setLoading(false);
    setActiveStep(2);
  };

  const handleGenerateOptimizedTitles = async () => {
    if (!results?.body) return;
    setTitleLoading(true);
    const res = await gemini.generate(SYSTEM_PROMPTS.XHS_TITLE_ASSISTANT(results.body));
    const titles = res.split('\n')
      .filter(t => t.trim().length > 2)
      .map(t => t.replace(/^\d+\.?\s+/, '').trim())
      .slice(0, 5);
    setOptimizedTitles(titles);
    setTitleLoading(false);
  };

  const handleGenerateOptimizedTags = async () => {
    if (!results?.body) return;
    setTagLoading(true);
    const res = await gemini.generate(SYSTEM_PROMPTS.XHS_TAG_ASSISTANT(results.body));
    const tags = res.match(/#[\w\u4e00-\u9fa5]+/g) || [];
    setOptimizedTags(tags);
    setTagLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Steps Header */}
      <div className="flex items-center justify-center space-x-12 relative">
        {[1, 2, 3].map(step => (
          <div key={step} className="flex flex-col items-center z-10">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 transition-all ${
              activeStep === step ? 'bg-[#3370FF] border-[#3370FF] text-white shadow-lg' : 'bg-white border-gray-200 text-gray-400'
            }`}>
              {step === 1 ? <Layout size={20} /> : step === 2 ? <Smile size={20} /> : <Sparkles size={20} />}
            </div>
            <span className={`text-xs font-bold ${activeStep === step ? 'text-[#3370FF]' : 'text-gray-400'}`}>
              {step === 1 ? '基础配置' : step === 2 ? '内容生成' : '深度优化'}
            </span>
          </div>
        ))}
        <div className="absolute top-5 left-1/3 right-1/3 h-[2px] bg-gray-200 -z-0"></div>
      </div>

      {activeStep === 1 && (
        <div className="bg-white p-8 rounded-xl border border-[#E4E5E7] shadow-sm space-y-6 animate-in slide-in-from-right duration-500">
          <div className="flex items-center space-x-3 pb-4 border-b">
             <BookOpen className="text-red-500" />
             <h2 className="text-lg font-bold text-gray-800">小红书内容实验室</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-600">1. 选择车型卖点</label>
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {carModels.map(car => (
                  <label key={car.id} className={`flex items-start p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${form.carId === car.id ? 'border-red-400 bg-red-50 ring-1 ring-red-400' : 'border-gray-100'}`}>
                    <input type="radio" name="car" className="accent-red-500 mt-1 mr-3" checked={form.carId === car.id} onChange={() => setForm({...form, carId: car.id})} />
                    <div>
                      <div className="text-sm font-bold text-gray-800">{car.name}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{car.points.join(' · ')}</div>
                    </div>
                  </label>
                ))}
                <label className={`flex items-start p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${form.carId === 'other' ? 'border-red-400 bg-red-50 ring-1 ring-red-400' : 'border-gray-100'}`}>
                  <input type="radio" name="car" className="accent-red-500 mt-1 mr-3" checked={form.carId === 'other'} onChange={() => setForm({...form, carId: 'other'})} />
                  <div>
                    <div className="text-sm font-bold text-gray-800">自定义车型</div>
                    <div className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">手动录入最新爆款车型</div>
                  </div>
                </label>
              </div>

              {isOther && (
                <div className="pt-2 space-y-3 animate-in fade-in slide-in-from-top-1">
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-gray-500">车型名称</label>
                    <input type="text" className="p-2 border border-gray-200 rounded text-sm outline-none focus:border-red-400" placeholder="如：奥迪 Q7" value={customModelName} onChange={(e) => setCustomModelName(e.target.value)} />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-gray-500">自定义卖点</label>
                    <textarea className="p-2 border border-gray-200 rounded text-sm h-16 outline-none focus:border-red-400 resize-none" placeholder="输入卖点，以逗号分隔" value={customPoints} onChange={(e) => setCustomPoints(e.target.value)} />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <label className="text-sm font-bold text-gray-600 flex items-center mb-2">
                  <Megaphone size={16} className="mr-2 text-orange-500" />
                  2. 核心促销政策
                </label>
                <textarea className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-400 outline-none resize-none h-20" value={form.policy} onChange={(e) => setForm({...form, policy: e.target.value})} />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-600">3. 爆款案例对标</label>
              <textarea className="w-full h-full min-h-[400px] p-4 border rounded-lg text-sm focus:ring-2 focus:ring-red-400 outline-none resize-none transition-all" value={form.case} onChange={(e) => setForm({...form, case: e.target.value})} />
            </div>
          </div>

          <button onClick={handleGenerateBody} disabled={loading || !form.case} className="w-full py-4 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-red-100 disabled:opacity-50">
            {loading ? <RotateCcw className="animate-spin" size={20} /> : <Zap size={20} />}
            <span>生成极简爆款正文</span>
          </button>
        </div>
      )}

      {activeStep === 2 && results && (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
          <div className="flex items-center justify-between">
            <button onClick={() => setActiveStep(1)} className="text-sm text-gray-500 flex items-center font-medium"><ChevronLeft size={16} className="mr-1" /> 返回修改</button>
            <button onClick={() => setActiveStep(3)} className="bg-[#3370FF] text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md flex items-center">下一步：深度优化 <ChevronRight size={16} className="ml-1" /></button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-800">生成正文</span>
              <button onClick={() => copyToClipboard(results.body)} className="flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-bold text-gray-600"><Copy size={14} className="mr-1.5" /> 复制全文</button>
            </div>
            <div className="p-8 text-base text-gray-700 whitespace-pre-wrap leading-relaxed min-h-[400px]">{results.body}</div>
          </div>
        </div>
      )}

      {activeStep === 3 && results && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in zoom-in-95 duration-500">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
              <span className="text-sm font-bold text-gray-800">标题猎手</span>
              <button onClick={handleGenerateOptimizedTitles} className="text-xs text-blue-600 font-bold">{optimizedTitles.length > 0 ? '重新生成' : '立即生成'}</button>
            </div>
            <div className="p-6 flex-1 space-y-4">
              {optimizedTitles.map((title, i) => (
                <div key={i} className="p-4 bg-blue-50/30 border border-blue-100 rounded-lg text-sm font-bold text-gray-800 cursor-pointer" onClick={() => copyToClipboard(title)}>{title}</div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
              <span className="text-sm font-bold text-gray-800">SEO Tag 助手</span>
              <button onClick={handleGenerateOptimizedTags} className="text-xs text-green-600 font-bold">{optimizedTags.length > 0 ? '重新生成' : '立即生成'}</button>
            </div>
            <div className="p-6 flex-1 flex flex-wrap gap-2">
              {optimizedTags.map((tag, i) => (
                <span key={i} className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100 cursor-pointer" onClick={() => copyToClipboard(tag)}>{tag}</span>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 flex items-center justify-between pt-4">
            <button onClick={() => setActiveStep(2)} className="text-sm text-gray-500 flex items-center"><ChevronLeft size={16} className="mr-1" /> 返回正文</button>
            <button onClick={() => { copyToClipboard(`${optimizedTitles[0] || ''}\n\n${results.body}\n\n${optimizedTags.join(' ')}`); alert('终版已合成并复制！'); }} className="px-8 py-2 bg-red-500 text-white rounded-lg text-sm font-bold">合成终版并复制</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteLab;
