
import React, { useState, useRef } from 'react';
import { PieChart, Upload, FileText, PlayCircle, Sparkles, MessageSquare, ListChecks, ArrowRight, RotateCcw, Video, FileEdit, X, File, Image as ImageIcon } from 'lucide-react';
import { gemini } from '../services/geminiService';
import { SYSTEM_PROMPTS } from '../lib/prompts';

const CaseInsight: React.FC = () => {
  const [type, setType] = useState<'video' | 'note'>('video');
  const [loading, setLoading] = useState(false);
  const [inputContent, setInputContent] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ data: string, mimeType: string, name: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleAnalyse = async () => {
    if (!inputContent.trim() && !uploadedFile) return;
    setLoading(true);
    
    const promptText = type === 'video' 
      ? SYSTEM_PROMPTS.CASE_INSIGHT_VIDEO(inputContent || "基于视觉素材进行拆解")
      : SYSTEM_PROMPTS.CASE_INSIGHT_NOTE(inputContent || "基于视觉素材进行拆解");
    
    const parts: any[] = [{ text: promptText }];
    if (uploadedFile && uploadedFile.mimeType.startsWith('image/')) {
      parts.push({
        inlineData: {
          data: uploadedFile.data,
          mimeType: uploadedFile.mimeType
        }
      });
    }

    const res = await gemini.generate(parts);
    setAnalysisResult(res);
    setLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.onloadeddata = () => {
          if (videoRef.current) videoRef.current.currentTime = 1;
        };
        videoRef.current.onseeked = () => {
          const canvas = canvasRef.current;
          const video = videoRef.current;
          if (canvas && video) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
            const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
            setUploadedFile({ data: base64, mimeType: 'image/jpeg', name: file.name });
            URL.revokeObjectURL(url);
          }
        };
      }
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        setUploadedFile({ data: base64, mimeType: file.type, name: file.name });
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setInputContent(event.target?.result as string);
        setUploadedFile({ data: '', mimeType: 'text/plain', name: file.name });
      };
      reader.readAsText(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <video ref={videoRef} className="hidden" muted />
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2329]">案例萃取</h1>
          <p className="text-sm text-gray-500 mt-1">深度拆解爆款逻辑，将他人经验转化为你的生产力</p>
        </div>
        <div className="flex bg-white rounded-lg p-1 border border-[#E4E5E7] shadow-sm">
          <button 
            onClick={() => { setType('video'); setAnalysisResult(''); setUploadedFile(null); }}
            className={`px-4 py-1.5 text-sm rounded-md transition-all flex items-center ${type === 'video' ? 'bg-[#3370FF] text-white shadow-sm font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Video size={14} className="mr-1.5" />
            视频拆解
          </button>
          <button 
            onClick={() => { setType('note'); setAnalysisResult(''); setUploadedFile(null); }}
            className={`px-4 py-1.5 text-sm rounded-md transition-all flex items-center ${type === 'note' ? 'bg-[#3370FF] text-white shadow-sm font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <FileEdit size={14} className="mr-1.5" />
            笔记拆解
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Area */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-[#E4E5E7] shadow-sm">
            <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center justify-between">
              <span className="flex items-center">
                <Upload size={16} className="mr-2 text-blue-500" />
                上传分析素材 ({type === 'video' ? '视频文件' : '笔记截图'})
              </span>
              {uploadedFile && (
                <button onClick={removeFile} className="text-red-500 hover:underline text-xs flex items-center">
                  <X size={12} className="mr-1" /> 清除
                </button>
              )}
            </label>
            
            {!uploadedFile ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-lg p-10 flex flex-col items-center justify-center hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group"
              >
                <Upload size={32} className="text-gray-300 group-hover:text-blue-400 mb-2" />
                <p className="text-xs text-gray-500 group-hover:text-blue-600 font-medium">点击上传 {type === 'video' ? '爆款视频 (MP4/MOV)' : '爆款笔记截图 (JPG/PNG)'}</p>
                <p className="text-[10px] text-gray-400 mt-1 text-center">系统将自动提取关键帧供 AI 分析</p>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept={type === 'video' ? 'video/*' : 'image/*,text/plain'} />
              </div>
            ) : (
              <div className="border border-blue-100 bg-blue-50 rounded-lg p-4 flex items-center space-x-4 animate-in zoom-in-95">
                {uploadedFile.mimeType.startsWith('image/') ? (
                  <img src={`data:${uploadedFile.mimeType};base64,${uploadedFile.data}`} className="w-20 h-20 rounded-md object-cover shadow-sm" />
                ) : (
                  <div className="w-20 h-20 bg-blue-100 rounded-md flex items-center justify-center text-blue-500">
                    <File size={32} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-blue-900 truncate">{uploadedFile.name}</p>
                  <p className="text-xs text-blue-600 mt-1 uppercase">{uploadedFile.mimeType}</p>
                </div>
                <X size={20} className="text-blue-300 hover:text-red-500 cursor-pointer" onClick={removeFile} />
              </div>
            )}

            <div className="mt-6 space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">
                {type === 'video' ? '视频脚本/亮点描述 (可选)' : '笔记内容 (标题/正文/Tag)'}
              </label>
              <textarea 
                className="w-full h-48 p-4 border border-[#E4E5E7] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
                placeholder={type === 'video' ? "粘贴视频脚本或详细描述视频画面与亮点，AI 将结合视觉素材深度拆解..." : "粘贴笔记标题、正文及标签..."}
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
              />
            </div>

            <button 
              onClick={handleAnalyse}
              disabled={loading || (!inputContent && !uploadedFile)}
              className="w-full mt-6 py-3 bg-[#3370FF] text-white rounded-lg font-bold flex items-center justify-center space-x-2 disabled:opacity-50 hover:bg-blue-600 shadow-lg shadow-blue-100 transition-all"
            >
              {loading ? <RotateCcw className="animate-spin" size={18} /> : <Sparkles size={18} />}
              <span>{loading ? 'AI 专家深度拆解中...' : `开始${type === 'video' ? '视频' : '笔记'}深度萃取`}</span>
            </button>
          </div>
        </div>

        {/* Result Area */}
        <div className="bg-white rounded-xl border border-[#E4E5E7] shadow-sm flex flex-col min-h-[600px] overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700 flex items-center">
              <ListChecks size={16} className="mr-2 text-green-500" />
              {type === 'video' ? '视频亮点拆解报告' : '笔记基因萃取报告'}
            </span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">AI Logic V4.2</span>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            {!analysisResult && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-gray-300">
                <PieChart size={48} className="mb-2 opacity-10" />
                <p className="text-sm">分析结论将在此处生成</p>
                <p className="text-[10px] mt-1 opacity-50 italic">AI 将为您输出：分镜拆解 / 爆款亮点 / 建议学习重点</p>
              </div>
            )}
            
            {loading && (
              <div className="space-y-6">
                <div className="h-4 bg-gray-100 rounded animate-pulse w-1/3"></div>
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <div key={i} className="h-3 bg-gray-50 rounded animate-pulse w-full"></div>)}
                </div>
                <div className="h-48 bg-gray-50 rounded-lg animate-pulse flex items-center justify-center">
                  <RotateCcw className="animate-spin text-gray-200" size={32} />
                </div>
              </div>
            )}

            {analysisResult && !loading && (
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed animate-in fade-in duration-700">
                {analysisResult.split('\n').map((line, i) => {
                  if (line.startsWith('#') || line.includes('###')) {
                    const clean = line.replace(/#+|###/g, '').trim();
                    return <h3 key={i} className="text-base font-bold text-gray-900 mt-6 mb-3 border-l-4 border-blue-500 pl-3 bg-blue-50/30 py-1">{clean}</h3>;
                  }
                  if (line.trim().startsWith('-') || line.trim().match(/^\d\./)) {
                    return <li key={i} className="ml-4 mb-1 list-none flex items-start space-x-2">
                      <span className="text-blue-500 mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span>{line.replace(/^[-\d.]+\s*/, '')}</span>
                    </li>;
                  }
                  if (line.trim().startsWith('|')) {
                    return <div key={i} className="overflow-x-auto my-2">
                      <div className="text-[11px] font-mono bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre">
                        {line}
                      </div>
                    </div>;
                  }
                  return line.trim() ? <p key={i} className="mb-2">{line}</p> : <div key={i} className="h-2"></div>;
                })}
              </div>
            )}
          </div>

          {analysisResult && (
            <div className="p-4 border-t bg-blue-50 flex items-start space-x-3">
              <MessageSquare size={16} className="text-blue-500 mt-0.5 shrink-0" />
              <div className="text-[11px] text-blue-700 leading-relaxed">
                <strong>学习重点建议：</strong> 结合视觉素材分析，该案例在色彩饱和度与前3秒钩子设计上非常成功。建议复刻其分镜逻辑，但针对奥迪品牌调性略微调低背景音乐的分贝值。
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseInsight;
