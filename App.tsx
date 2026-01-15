
import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  Video, 
  Edit3, 
  BookOpen, 
  Search, 
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Menu,
  Bell,
  Zap
} from 'lucide-react';
import { AppView, UserProfile, CarModel } from './types';
import { CAR_MODELS } from './constants';
import Diagnosis from './components/Diagnosis';
import ScriptGenerator from './components/ScriptGenerator';
import CopyAssistant from './components/CopyAssistant';
import NoteLab from './components/NoteLab';
import CaseInsight from './components/CaseInsight';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.DIAGNOSIS);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Persistence logic for User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('user_profile');
    return saved ? JSON.parse(saved) : {
      name: '奥迪门店专家',
      avatar: '', 
      role: '门店运营专家',
      organization: '一汽奥迪华东大区 · 某经销商门店'
    };
  });

  // Persistence logic for Car Models
  const [carModels, setCarModels] = useState<CarModel[]>(() => {
    const saved = localStorage.getItem('car_models');
    return saved ? JSON.parse(saved) : CAR_MODELS;
  });

  useEffect(() => {
    localStorage.setItem('user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('car_models', JSON.stringify(carModels));
  }, [carModels]);

  const navItems = [
    { id: AppView.DIAGNOSIS, label: '运营诊断', icon: BarChart2, color: 'text-blue-500' },
    { id: AppView.SCRIPT, label: '脚本助手', icon: Video, color: 'text-indigo-500' },
    { id: AppView.COPY, label: '文案助手', icon: Edit3, color: 'text-orange-500' },
    { id: AppView.XHS_NOTE, label: '笔记实验室', icon: BookOpen, color: 'text-red-500' },
    { id: AppView.XHS_CASE, label: '案例萃取', icon: Search, color: 'text-teal-500' },
  ];

  const renderView = () => {
    switch (activeView) {
      case AppView.DIAGNOSIS: return <Diagnosis />;
      case AppView.SCRIPT: return <ScriptGenerator carModels={carModels} />;
      case AppView.COPY: return <CopyAssistant />;
      case AppView.XHS_NOTE: return <NoteLab carModels={carModels} />;
      case AppView.XHS_CASE: return <CaseInsight />;
      case AppView.SETTINGS: return (
        <Settings 
          userProfile={userProfile} 
          setUserProfile={setUserProfile} 
          carModels={carModels} 
          setCarModels={setCarModels} 
        />
      );
      default: return <Diagnosis />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F5F6F7] text-[#1F2329] overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-[64px]' : 'w-[240px]'} bg-[#1F2329] flex flex-col transition-all duration-300 z-50`}>
        <div className="p-4 flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-[#3370FF] rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/20">
            <Zap className="text-white" size={18} />
          </div>
          {!sidebarCollapsed && <span className="text-white font-bold text-lg tracking-tight">AI Ops Pro</span>}
        </div>

        <nav className="flex-1 px-2 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center p-2.5 rounded-lg transition-all ${
                activeView === item.id 
                  ? 'bg-[#3370FF] text-white' 
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon size={20} className={`shrink-0 ${activeView === item.id ? 'text-white' : item.color}`} />
              {!sidebarCollapsed && <span className="ml-3 font-medium text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-white/10">
          <button
            onClick={() => setActiveView(AppView.SETTINGS)}
            className={`w-full flex items-center p-2.5 rounded-lg transition-all ${
              activeView === AppView.SETTINGS 
                ? 'bg-[#3370FF] text-white' 
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <SettingsIcon size={20} className="shrink-0" />
            {!sidebarCollapsed && <span className="ml-3 font-medium text-sm">系统设置</span>}
          </button>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center p-2.5 mt-1 rounded-lg text-gray-400 hover:bg-white/10 transition-all"
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {!sidebarCollapsed && <span className="ml-3 font-medium text-sm">收起导航</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F5F6F7] relative">
        <header className="h-[60px] bg-white border-b border-[#E4E5E7] flex items-center justify-between px-6 shrink-0 z-40">
          <div className="flex items-center space-x-4">
            <Menu className="text-gray-400 lg:hidden" />
            <div className="text-sm font-medium text-gray-500 flex items-center">
              工作台 <ChevronRight size={14} className="mx-1" /> 
              <span className="text-gray-900 font-bold">{navItems.find(n => n.id === activeView)?.label || '系统设置'}</span>
            </div>
          </div>
          <div className="flex items-center space-x-5">
            <div className="relative group">
              <Search size={18} className="text-gray-400 cursor-pointer group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="relative">
              <Bell size={18} className="text-gray-400 cursor-pointer hover:text-blue-500 transition-colors" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
              {userProfile.avatar ? (
                <img src={userProfile.avatar} alt="Avatar" className="w-8 h-8 rounded-full ring-2 ring-white object-cover" />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">
                  {userProfile.name.charAt(0)}
                </div>
              )}
              <span className="text-sm font-medium hidden sm:inline-block">{userProfile.name}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
