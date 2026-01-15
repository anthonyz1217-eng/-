
import React, { useState, useRef } from 'react';
import { Settings as SettingsIcon, Shield, Database, User, Bell, Save, Plus, Trash2, Edit3, Upload, X, Check } from 'lucide-react';
import { UserProfile, CarModel } from '../types';

interface SettingsProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  carModels: CarModel[];
  setCarModels: React.Dispatch<React.SetStateAction<CarModel[]>>;
}

const Settings: React.FC<SettingsProps> = ({ userProfile, setUserProfile, carModels, setCarModels }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'models' | 'api'>('profile');
  const [isEditingCar, setIsEditingCar] = useState<string | null>(null);
  const [newCar, setNewCar] = useState<Partial<CarModel>>({ name: '', points: [] });
  const [isAddingCar, setIsAddingCar] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Profile Handlers
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserProfile({ ...userProfile, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Car Model Handlers
  const handleAddCar = () => {
    if (!newCar.name) return;
    const id = Math.random().toString(36).substr(2, 9);
    setCarModels([...carModels, { 
      id, 
      name: newCar.name, 
      points: newCar.points || [] 
    }]);
    setNewCar({ name: '', points: [] });
    setIsAddingCar(false);
  };

  const handleDeleteCar = (id: string) => {
    if (window.confirm('确定要删除该车型吗？此操作不可撤销。')) {
      setCarModels(carModels.filter(m => m.id !== id));
    }
  };

  const handleUpdateCar = (id: string, updates: Partial<CarModel>) => {
    setCarModels(carModels.map(m => m.id === id ? { ...m, ...updates } : m));
    setIsEditingCar(null);
  };

  return (
    <div className="bg-white rounded-xl border border-[#E4E5E7] shadow-sm flex min-h-[600px] overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      {/* Sidebar Tabs */}
      <div className="w-[200px] border-r border-[#E4E5E7] bg-gray-50/50 p-4 shrink-0">
        <h2 className="text-sm font-bold text-gray-500 uppercase px-3 mb-4 tracking-wider text-[10px]">系统配置</h2>
        <nav className="space-y-1">
          {[
            { id: 'profile', label: '个人资料', icon: User },
            { id: 'models', label: '车型卖点库', icon: Database },
            { id: 'api', label: '安全与API', icon: Shield },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center px-3 py-2.5 text-sm rounded-lg transition-all ${
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
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        {activeTab === 'profile' && (
          <div className="max-w-2xl space-y-10 animate-in slide-in-from-right-4">
            <div className="flex items-center space-x-6">
              <div className="relative group">
                {userProfile.avatar ? (
                  <img src={userProfile.avatar} className="w-24 h-24 rounded-2xl object-cover ring-4 ring-blue-50" alt="Profile" />
                ) : (
                  <div className="w-24 h-24 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 text-3xl font-bold">
                    {userProfile.name.charAt(0)}
                  </div>
                )}
                <button 
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-lg shadow-md border border-gray-100 text-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Upload size={14} />
                </button>
                <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{userProfile.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{userProfile.organization}</p>
                <div className="mt-3 flex space-x-2">
                  <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-bold border border-blue-100">{userProfile.role}</span>
                  <span className="bg-green-50 text-green-600 text-[10px] px-2 py-0.5 rounded-full font-bold border border-green-100">AI 专家库授权</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">显示名称</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                  value={userProfile.name}
                  onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                  placeholder="请输入您的姓名"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">门店角色</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                  value={userProfile.role}
                  onChange={(e) => setUserProfile({...userProfile, role: e.target.value})}
                  placeholder="如：门店运营专家"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">当前所属组织</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                  value={userProfile.organization}
                  onChange={(e) => setUserProfile({...userProfile, organization: e.target.value})}
                  placeholder="如：一汽奥迪华东大区 · 上海某门店"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex items-center space-x-4">
              <button 
                onClick={handleProfileSave}
                className="bg-[#3370FF] text-white px-8 py-2.5 rounded-lg font-bold flex items-center space-x-2 shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all"
              >
                <Save size={18} />
                <span>{saveSuccess ? '已成功同步' : '保存资料修改'}</span>
              </button>
              {saveSuccess && (
                <span className="text-green-600 text-sm font-medium flex items-center animate-in fade-in slide-in-from-left-2">
                  <Check size={16} className="mr-1" /> 设置已实时保存至本地
                </span>
              )}
            </div>
          </div>
        )}

        {activeTab === 'models' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 pb-20">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">车型卖点库管理</h3>
                <p className="text-xs text-gray-500 mt-1">定义的车型将出现在脚本助手和笔记实验室的选项中</p>
              </div>
              <button 
                onClick={() => setIsAddingCar(!isAddingCar)}
                className={`text-sm font-bold flex items-center px-4 py-2 rounded-lg transition-all ${
                  isAddingCar ? 'bg-gray-100 text-gray-600' : 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                }`}
              >
                {isAddingCar ? <X size={16} className="mr-2" /> : <Plus size={16} className="mr-2" />}
                {isAddingCar ? '取消新增' : '新增车型'}
              </button>
            </div>

            {isAddingCar && (
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 animate-in slide-in-from-top-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-blue-700">车型名称</label>
                    <input 
                      type="text"
                      className="w-full p-2.5 bg-white border border-blue-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="如：奥迪 Q6"
                      value={newCar.name}
                      onChange={(e) => setNewCar({...newCar, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-blue-700">核心卖点 (以中文逗号分隔)</label>
                    <input 
                      type="text"
                      className="w-full p-2.5 bg-white border border-blue-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="舒适座舱，澎湃动力，奢华设计"
                      onChange={(e) => setNewCar({...newCar, points: e.target.value.split(/[，,]/).filter(p => p.trim())})}
                    />
                  </div>
                </div>
                <button 
                  onClick={handleAddCar}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  确认添加至车型库
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {carModels.map(model => (
                <div key={model.id} className="p-5 border border-gray-200 rounded-xl hover:border-blue-300 transition-all flex flex-col group bg-white shadow-sm hover:shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    {isEditingCar === model.id ? (
                      <input 
                        type="text"
                        className="text-lg font-bold text-gray-900 border-b-2 border-blue-500 outline-none"
                        defaultValue={model.name}
                        onBlur={(e) => handleUpdateCar(model.id, { name: e.target.value })}
                        autoFocus
                      />
                    ) : (
                      <div className="font-bold text-lg text-gray-900">{model.name}</div>
                    )}
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setIsEditingCar(model.id)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteCar(model.id)}
                        className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {model.points.map((p, i) => (
                      <span key={i} className="bg-gray-50 px-3 py-1 rounded-full text-xs text-gray-600 border border-gray-100 flex items-center">
                        {p}
                        {isEditingCar === model.id && (
                          <X size={12} className="ml-1 text-red-400 cursor-pointer" onClick={() => {
                            handleUpdateCar(model.id, { points: model.points.filter((_, idx) => idx !== i) });
                          }} />
                        )}
                      </span>
                    ))}
                    {isEditingCar === model.id && (
                      <button 
                        className="text-xs text-blue-500 font-bold border border-dashed border-blue-200 px-3 py-1 rounded-full hover:bg-blue-50"
                        onClick={() => {
                          const newPoint = window.prompt('请输入新的卖点:');
                          if (newPoint) handleUpdateCar(model.id, { points: [...model.points, newPoint] });
                        }}
                      >
                        + 增加
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="max-w-2xl space-y-6 animate-in slide-in-from-right-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex space-x-4">
              <Shield className="text-blue-500 shrink-0" size={28} />
              <div>
                <h4 className="font-bold text-blue-900 text-sm">系统安全与模型接入状态</h4>
                <p className="text-xs text-blue-700 mt-2 leading-relaxed">
                  本平台深度集成 Google Gemini 3.0 系列推理模型。您的数据均在客户端进行 AI 交互，不存储于第三方服务器。API 密钥由当前部署环境自动托管注入。
                </p>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">推理引擎链路状态</label>
                <div className="flex items-center space-x-3 bg-white p-4 rounded-xl border border-gray-100">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-green-700 uppercase tracking-tight">Gemini-3-Flash (Production Ready)</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">全局内容生成偏好</label>
                <div className="grid grid-cols-1 gap-2">
                  {['深度创意模式', '严谨逻辑模式', '极简风格模式'].map(pref => (
                    <div key={pref} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-blue-200 cursor-pointer transition-all group">
                      <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">{pref}</span>
                      {pref === '深度创意模式' && <Check size={16} className="text-blue-500" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
