
import React, { useState } from 'react';
/* Added Edit3 to the import list to fix the reported error */
import { Settings as SettingsIcon, Shield, Database, User, Bell, Save, Plus, Trash2, Edit3 } from 'lucide-react';
import { CAR_MODELS } from '../constants';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'models' | 'api'>('profile');
  const [models, setModels] = useState(CAR_MODELS);

  return (
    <div className="bg-white rounded-xl border border-[#E4E5E7] shadow-sm flex min-h-[600px] overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      {/* Sidebar Tabs */}
      <div className="w-[200px] border-r border-[#E4E5E7] bg-gray-50/50 p-4 shrink-0">
        <h2 className="text-sm font-bold text-gray-500 uppercase px-3 mb-4 tracking-wider">系统配置</h2>
        <nav className="space-y-1">
          {[
            { id: 'profile', label: '个人资料', icon: User },
            { id: 'models', label: '车型卖点库', icon: Database },
            { id: 'api', label: '安全与API', icon: Shield },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-[#3370FF] font-bold shadow-sm ring-1 ring-black/5' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon size={16} className="mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'profile' && (
          <div className="max-w-2xl space-y-8 animate-in slide-in-from-right-4">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 text-2xl font-bold">JD</div>
              <div>
                <h3 className="text-xl font-bold">门店运营专家</h3>
                <p className="text-sm text-gray-500">一汽奥迪华东大区 · 某经销商门店</p>
                <button className="mt-2 text-xs text-blue-500 font-bold hover:underline">更换头像</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">显示名称</label>
                <input type="text" className="w-full p-2 border border-gray-200 rounded-lg text-sm" defaultValue="奥迪运营专家" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">电子邮箱</label>
                <input type="text" className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50" defaultValue="audi_expert@dealership.com" disabled />
              </div>
            </div>

            <div className="pt-6 border-t">
              <button className="bg-[#3370FF] text-white px-6 py-2 rounded-lg font-bold flex items-center space-x-2 shadow-lg shadow-blue-100">
                <Save size={16} />
                <span>保存设置</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'models' && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">车型卖点库管理</h3>
              <button className="text-sm text-blue-600 font-bold flex items-center hover:bg-blue-50 px-3 py-1 rounded transition-colors">
                <Plus size={16} className="mr-1" />
                新增车型
              </button>
            </div>

            <div className="space-y-3">
              {models.map(model => (
                <div key={model.id} className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-all flex items-center justify-between group">
                  <div>
                    <div className="font-bold text-gray-900">{model.name}</div>
                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                      {model.points.map((p, i) => (
                        <span key={i} className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 border border-gray-200">{p}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"><Edit3 size={16} /></button>
                    <button className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="max-w-2xl space-y-6 animate-in slide-in-from-right-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex space-x-4">
              <Shield className="text-blue-500 shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-blue-900 text-sm">系统安全提示</h4>
                <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                  您的 API Key 由系统自动注入。当前已连接至 Gemini 2.0 / GPT-4o 级推理引擎，支持 OCR、脚本深度分镜及文案萃取等高级功能。
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">API 端点状态</label>
                <div className="flex items-center space-x-2 text-sm text-green-600 font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>已连接 (gemini-3-flash-preview)</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">模型偏好</label>
                <select className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                  <option>Gemini 2.0 (推荐 - 速度与逻辑均衡)</option>
                  <option>GPT-4o (专业内容深度萃取)</option>
                  <option>Claude 3.5 (长文本创意生成)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
