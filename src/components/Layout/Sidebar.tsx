import React from 'react';
import { 
  Home, 
  FileText, 
  Send, 
  Inbox, 
  Search, 
  BarChart3, 
  Users, 
  Settings,
  Building2,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'inward', label: 'Inward DAK', icon: Inbox },
    { id: 'outward', label: 'Outward DAK', icon: Send },
    { id: 'search', label: 'Search & Filter', icon: Search },
    { id: 'tracking', label: 'Track DAK', icon: Clock },
    { id: 'reports', label: 'Reports & MIS', icon: BarChart3 },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'escalations', label: 'Escalations', icon: AlertTriangle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <FileText className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold">DAK Management</h1>
            <p className="text-sm text-slate-400">ERP System</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">JD</span>
          </div>
          <div>
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-slate-400">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;