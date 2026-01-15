
import React, { useState, useRef } from 'react';
import { Video, Sparkles, Send, Copy, RotateCcw, MapPin, Zap, User, UserX, Target, Upload, FileText, Edit, List, X, File } from 'lucide-react';
import { CarModel } from '../types';
import { gemini } from '../services/geminiService';
import { SYSTEM_PROMPTS } from '../lib/prompts';
import ScriptTable from './ScriptTable';

interface ScriptGeneratorProps {
  carModels: CarModel[];
}

const ScriptGenerator: React.FC<ScriptGeneratorProps> = ({ carModels }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [customPoints, setCustomPoints] = useState('');
  const [customModelName, setCustomModelName] = useState('');
  const [uploadedFileData, setUploadedFileData] = useState<{ data: string, mimeType: string, fileName: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [config, setConfig] = useState({
    type: '政策类 (30s内)',
    carModelId: carModels[0]?.id || 'other',
    targetInfo: '',
    policy: '首付0元提走奥迪A5L，置换还享14000元现金补贴',
    shootingScene: '门店静态',
    hostType: '有主播',
    rowCount: 5
  });

  const selectedCar = carModels.find(m => m.id === config.carModelId) || carModels[0];
  const isOther = config.carModelId === 'other';

  const handleGenerate = async () => {
    setLoading(true);
    const finalModelName = isOther ? (customModelName || "其他车型") : selectedCar.name;
    const finalPoints = isOther ? (customPoints ? [customPoints] : selectedCar.points) : selectedCar.points;

    const promptText = SYSTEM_PROMPTS.SCRIPT_GENERATOR(
      config.targetInfo || "专业导购节奏",
      finalModelName,
      finalPoints,
      config.policy,
      config.type,
      config.shootingScene,
      config.hostType,
      config.rowCount
    );

    const parts: any[] = [{ text: promptText }];
    if (uploadedFileData && uploadedFileData.mimeType.startsWith('image/')) {
      parts.push({
        inlineData: {
          data: uploadedFileData.data,
          mimeType: uploadedFileData.mimeType
        }
      });
    }

    const res = await gemini.generate(parts);
    setResult(res);
    setTimeout(() => setLoading(false), 500);
  };

  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      alert('已复制到剪贴板');
    }
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setConfig({ ...config, targetInfo: text });
        setUploadedFileData({ data: '', mimeType: 'text/plain', fileName: file.name });
      };
      reader.readAsText(file);
    } else if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.onloadeddata = () => {
          if (videoRef.current && canvasRef.current) {
            videoRef.current.currentTime = 1;
          }
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
            setUploadedFileData({ data: base64, mimeType: 'image/jpeg', fileName: file.name });
            URL.revokeObjectURL(url);
          }
        };
      }
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        setUploadedFileData({ data: base64, mimeType: file.type, fileName: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setUploadedFileData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-right duration-500 pb-10">
      <video ref={videoRef} className="hidden" crossOrigin="anonymous" muted />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Configuration Column */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-lg border border-[#E4E5E7] shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <Video className="mr-2 text-blue-500" size={20} />
            脚本智能配置
          </h2>
          
          <div className="space-y-5">
            {/* Benchmarking Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-500 uppercase">对标素材 (脚本/视频内容)</label>
                {!uploadedFileData ? (
                  <button onClick={handleFileUploadClick} className="text-[10px] text-blue-600 font-bold flex items-center hover:underline">
                    <Upload size={10} className="mr-1" /> 上传素材
                  </button>
                ) : (
                  <button onClick={removeFile} className="text-[10px] text-red-500 font-bold flex items-center hover:underline">
                    <X size={10} className="mr-1" /> 移除文件
                  </button>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt,.md,.mp4,.mov,.jpg,.jpeg,.png" />
              </div>

              {uploadedFileData && (
                <div className="mb-2 p-2 bg-blue-50 border border-blue-100 rounded flex items-center justify-between animate-in fade-in zoom-in-95">
                  <div className="flex items-center text-[11px] font-medium text-blue-700 truncate">
                    {uploadedFileData.mimeType.startsWith('image/') ? (
                      <img src={`data:${uploadedFileData.mimeType};base64,${uploadedFileData.data}`} className="w-8 h-8 rounded object-cover mr-2" />
                    ) : (
                      <File size={14} className="mr-2 shrink-0" />
                    )}
                    <span className="truncate">{uploadedFileData.fileName}</span>
                  </div>
                  <X size={14} className="text-blue-400 cursor-pointer hover:text-red-500" onClick={removeFile} />
                </div>
              )}

              <textarea 
                className="w-full p-2.5 border border-[#E4E5E7] rounded text-sm focus:border-blue-500 outline-none h-24 resize-none transition-all"
                placeholder="粘贴对标的爆款脚本或描述视频内容，AI 将深度模仿其节奏逻辑..."
                value={config.targetInfo}
                onChange={(e) => setConfig({...config, targetInfo: e.target.value})}
              />
            </div>

            <div className="border-t border-gray-100 pt-4">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">视频类型</label>
              <div className="grid grid-cols-1 gap-2">
                {['政策类 (30s内)', '种草类 (30-45s)', '剧情类 (>1min)'].map(t => (
                  <button
                    key={t}
                    onClick={() => setConfig({...config, type: t})}
                    className={`flex items-center px-3 py-2 text-sm rounded border transition-all ${
                      config.type === t 
                        ? 'bg-blue-50 border-blue-500 text-blue-600 font-bold' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Zap size={14} className="mr-2" />
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center">
                <List size={12} className="mr-1" /> 脚本行数 (分镜数量)
              </label>
              <div className="flex space-x-2">
                {[3, 5, 8, 12].map(num => (
                  <button
                    key={num}
                    onClick={() => setConfig({...config, rowCount: num})}
                    className={`flex-1 py-2 text-xs rounded border transition-all ${
                      config.rowCount === num 
                        ? 'bg-blue-50 border-blue-500 text-blue-600 font-bold' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {num} 行
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">主播形式</label>
                <div className="flex space-x-1">
                  {[{ id: '有主播', icon: User }, { id: '无主播', icon: UserX }].map(h => (
                    <button
                      key={h.id}
                      onClick={() => setConfig({...config, hostType: h.id})}
                      className={`flex-1 flex items-center justify-center px-2 py-2 text-xs rounded border transition-all ${
                        config.hostType === h.id 
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' 
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <h.icon size={12} className="mr-1" />
                      {h.id}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">拍摄场景</label>
                <div className="flex space-x-1">
                  {['门店', '户外'].map(s => (
                    <button
                      key={s}
                      onClick={() => setConfig({...config, shootingScene: s})}
                      className={`flex-1 flex items-center justify-center px-2 py-2 text-xs rounded border transition-all ${
                        config.shootingScene.includes(s)
                          ? 'bg-green-50 border-green-500 text-green-700 font-bold' 
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <MapPin size={12} className="mr-1" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">车型选择</label>
              <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                {carModels.map(car => (
                  <button
                    key={car.id}
                    onClick={() => setConfig({...config, carModelId: car.id})}
                    className={`p-2 text-[11px] rounded border transition-all truncate ${
                      config.carModelId === car.id 
                        ? 'bg-blue-50 border-blue-500 text-blue-600 font-bold' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {car.name}
                  </button>
                ))}
                <button
                    onClick={() => setConfig({...config, carModelId: 'other'})}
                    className={`p-2 text-[11px] rounded border transition-all truncate ${
                      config.carModelId === 'other' 
                        ? 'bg-orange-50 border-orange-500 text-orange-600 font-bold' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    自定义录入...
                  </button>
              </div>
            </div>

            {isOther && (
              <div className="space-y-4 animate-in slide-in-from-top-2">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">自定义车型名称</label>
                  <input 
                    type="text"
                    className="w-full p-2 border border-[#E4E5E7] rounded text-sm outline-none focus:border-blue-500"
                    placeholder="输入车型名称..."
                    value={customModelName}
                    onChange={(e) => setCustomModelName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">自定义车型卖点</label>
                  <textarea 
                    className="w-full p-2 border border-[#E4E5E7] rounded text-sm h-16 outline-none focus:border-blue-500"
                    placeholder="输入车型卖点，以逗号分隔..."
                    value={customPoints}
                    onChange={(e) => setCustomPoints(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">核心促销政策</label>
              <textarea 
                className="w-full p-2.5 border border-[#E4E5E7] rounded text-sm focus:border-blue-500 outline-none h-20 resize-none"
                value={config.policy}
                onChange={(e) => setConfig({...config, policy: e.target.value})}
              />
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3 bg-[#3370FF] text-white rounded font-bold hover:bg-blue-600 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-200 mt-2"
            >
              {loading ? <RotateCcw className="animate-spin" size={20} /> : <Sparkles size={20} />}
              <span>{loading ? 'AI 导演深度分镜中...' : '生成 10 组专业化脚本'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Output Column */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg border border-[#E4E5E7] shadow-sm flex flex-col h-full min-h-[700px]">
          <div className="p-4 border-b border-[#E4E5E7] flex items-center justify-between bg-gray-50">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-gray-700">专业分镜脚本库</span>
              <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">{config.type.split(' ')[0]}</span>
              <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">{config.shootingScene}</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">{config.rowCount} 行/脚本</span>
            </div>
          </div>
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            {!result && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-gray-300">
                <Video size={64} className="mb-4 opacity-20" />
                <p>AI 导演已就绪，从左侧配置后开始创作</p>
              </div>
            )}
            {loading && (
              <div className="space-y-12">
                {[1, 2].map(i => (
                  <div key={i} className="space-y-4">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-24"></div>
                    <div className="h-40 bg-gray-50 rounded-lg animate-pulse w-full border border-gray-100"></div>
                  </div>
                ))}
              </div>
            )}
            {result && !loading && <ScriptTable content={result} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptGenerator;
