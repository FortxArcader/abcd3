import React from 'react';
import { 
  FileText, 
  Inbox, 
  Send, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Users
} from 'lucide-react';
import StatsCard from './StatsCard';
import { useDAKData } from '../../hooks/useDAKData';

const DashboardOverview: React.FC = () => {
  const { documents, loading } = useDAKData();
  
  // Calculate real stats from data
  const totalDocuments = documents.length;
  const inwardCount = documents.filter(doc => doc.type === 'inward').length;
  const outwardCount = documents.filter(doc => doc.type === 'outward').length;
  const pendingCount = documents.filter(doc => 
    ['received', 'under_process'].includes(doc.status)
  ).length;
  const overdueCount = documents.filter(doc => 
    doc.due_date && new Date(doc.due_date) < new Date() && 
    !['closed', 'sent'].includes(doc.status)
  ).length;
  const closedTodayCount = documents.filter(doc => {
    const today = new Date().toDateString();
    return ['closed', 'sent'].includes(doc.status) && 
           new Date(doc.updated_at).toDateString() === today;
  }).length;

  const stats = [
    {
      title: 'Total DAK Today',
      value: totalDocuments,
      icon: FileText,
      color: 'blue' as const,
    },
    {
      title: 'Inward DAK',
      value: inwardCount,
      icon: Inbox,
      color: 'green' as const,
    },
    {
      title: 'Outward DAK',
      value: outwardCount,
      icon: Send,
      color: 'purple' as const,
    },
    {
      title: 'Pending Actions',
      value: pendingCount,
      icon: Clock,
      color: 'yellow' as const,
    },
    {
      title: 'Overdue',
      value: overdueCount,
      icon: AlertTriangle,
      color: 'red' as const,
    },
    {
      title: 'Closed Today',
      value: closedTodayCount,
      icon: CheckCircle,
      color: 'green' as const,
    }
  ];

  // Generate recent activity from actual documents
  const recentActivity = documents
    .slice(0, 4)
    .map(doc => ({
      id: doc.id,
      action: doc.type === 'inward' ? 'New Inward DAK Registered' : 'New Outward DAK Created',
      dakNumber: doc.dak_number,
      department: doc.departments?.name || 'Unknown',
      time: getTimeAgo(doc.created_at),
      priority: doc.priority
    }));

  // Calculate department stats from actual data
  const departmentStats = documents.reduce((acc: any[], doc) => {
    const deptName = doc.departments?.name || 'Unknown';
    const existing = acc.find(d => d.name === deptName);
    
    if (existing) {
      if (doc.type === 'inward') existing.inward++;
      else existing.outward++;
      if (['received', 'under_process'].includes(doc.status)) existing.pending++;
    } else {
      acc.push({
        name: deptName,
        inward: doc.type === 'inward' ? 1 : 0,
        outward: doc.type === 'outward' ? 1 : 0,
        pending: ['received', 'under_process'].includes(doc.status) ? 1 : 0
      });
    }
    return acc;
  }, []).slice(0, 5);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  function getTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Recent Activity
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.dakNumber} • {activity.department}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(activity.priority)}`}>
                        {activity.priority}
                      </span>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>No recent activity</p>
                  <p className="text-sm">Create your first DAK document to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Department-wise Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Department-wise Statistics
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {departmentStats.length > 0 ? (
                departmentStats.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="font-medium text-gray-900">{dept.name}</div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                        <span className="text-gray-600">In: {dept.inward}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                        <span className="text-gray-600">Out: {dept.outward}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                        <span className="text-gray-600">Pending: {dept.pending}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>No department data available</p>
                  <p className="text-sm">Data will appear once DAK documents are created</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;