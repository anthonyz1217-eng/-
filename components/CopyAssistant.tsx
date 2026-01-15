
import React, { useState } from 'react';
import { Edit3, Sparkles, MessageSquare, Copy, CheckCircle } from 'lucide-react';
import { gemini } from '../services/geminiService';
import { SYSTEM_PROMPTS } from '../lib/prompts';

const CopyAssistant: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [input, setInput] = useState({
    target: '',
    policy: '现车交付，置换补贴至高2万元'
  });

  const handleGenerate = async () => {
    setLoading(true);
    const prompt = SYSTEM_PROMPTS.COPY_ASSISTANT(input.target, input.policy);
    const res = await gemini.generate(prompt);
    
    // Split result into items (assumes AI might use numbers or bullet points)
    const splitResults = res.split(/\n?\d+\.?\s+|[•-]\s+/).filter(item => item.trim().length > 2);
    setResults(splitResults.length > 0 ? splitResults : [res]);
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center space-x-2 mb-2">
        <Edit3 className="text-blue-500" />
        <h1 className="text-2xl font-bold text-[#1F2329]">文案助手 - 营销主题提炼</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-[#E4E5E7] shadow-sm space-y-4">
          <h3 className="font-semibold text-gray-700">深度对标分析</h3>
          <textarea 
            className="w-full p-4 border border-[#E4E5E7] rounded-lg text-sm h-48 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="粘贴对标的爆款营销文案，AI 将深度提炼其核心灵魂..."
            value={input.target}
            onChange={(e) => setInput({...input, target: e.target.value})}
          />
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">当前促销政策</label>
            <input 
              type="text"
              className="w-full p-3 border border-[#E4E5E7] rounded-lg text-sm"
              placeholder="核心促销政策..."
              value={input.policy}
              onChange={(e) => setInput({...input, policy: e.target.value})}
            />
          </div>
          <button 
            onClick={handleGenerate}
            disabled={loading || !input.target}
            className="w-full bg-[#3370FF] text-white py-3 rounded-lg font-bold flex items-center justify-center space-x-2 disabled:opacity-50 shadow-md"
          >
            <Sparkles size={18} />
            <span>{loading ? '策略专家提炼中...' : '生成 10 组爆款营销主题'}</span>
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2">
          {results.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-200 rounded-lg p-10">
              <MessageSquare size={48} className="mb-2 opacity-10" />
              <p>营销主题将在此处呈现</p>
            </div>
          )}
          {loading && (
            [1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white p-4 rounded-lg border border-gray-100 animate-pulse h-16"></div>
            ))
          )}
          {results.map((text, i) => (
            <div key={i} className="bg-white p-5 rounded-lg border border-[#E4E5E7] shadow-sm group hover:border-blue-300 transition-all flex items-center justify-between">
              <div className="flex-1">
                <div className="text-xs font-bold text-blue-500 mb-1">主题方案 {i + 1}</div>
                <p className="text-base font-medium text-gray-800">{text.trim()}</p>
              </div>
              <button 
                onClick={() => navigator.clipboard.writeText(text.trim())}
                className="text-gray-400 opacity-0 group-hover:opacity-100 hover:text-blue-500 transition-all p-2"
                title="复制主题"
              >
                <Copy size={16} />
              </button>
            </div>
          ))}
          {results.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100 text-[11px] text-blue-600 flex items-start">
              <CheckCircle size={14} className="mr-2 mt-0.5 shrink-0" />
              <span>以上主题已根据奥迪品牌调性及最新促销政策进行优化，适用于直播间背景、视频标题或广告 Slogan。</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CopyAssistant;
