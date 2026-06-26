/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Bell, Clock, Calendar, ShieldAlert, CheckCircle, X, Info } from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  time: string;
}

interface NotificationSystemProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onClearAll: () => void;
  onRemoveItem: (id: string) => void;
}

export default function NotificationSystem({ 
  notifications, 
  onClose, 
  onClearAll, 
  onRemoveItem 
}: NotificationSystemProps) {
  
  return (
    <div className="fixed inset-y-0 left-0 w-80 bg-[#111827] border-r border-gray-800 shadow-2xl z-50 flex flex-col justify-between font-sans text-right animate-slide-in">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <button 
          onClick={onClose}
          className="p-1 hover:bg-gray-800 rounded text-gray-500 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-white">مركز الإشعارات والتذكير</h2>
          <Bell className="w-4 h-4 text-emerald-400" />
        </div>
      </div>

      {/* Logs Scroll container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-xs">لا تتوفر أي إشعارات جديدة حالياً.</p>
          </div>
        ) : (
          notifications.map((n) => {
            return (
              <div 
                key={n.id} 
                className="p-3.5 bg-gray-900/60 border border-gray-800/80 rounded-xl space-y-1 text-right relative group hover:border-gray-700 transition-colors"
              >
                {/* Remove single item button */}
                <button
                  onClick={() => onRemoveItem(n.id)}
                  className="absolute left-2.5 top-2.5 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-rose-400 p-0.5 rounded transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2 justify-end">
                  <span className="text-xs font-bold text-white pr-1">{n.title}</span>
                  {n.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  {n.type === 'warning' && <ShieldAlert className="w-4 h-4 text-rose-500" />}
                  {n.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
                </div>

                <p className="text-xs text-gray-400 leading-relaxed pr-6">{n.message}</p>
                <span className="text-[9px] text-gray-600 block pt-1 pr-6">{n.time}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Clear action */}
      {notifications.length > 0 && (
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={onClearAll}
            className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-xs text-gray-400 hover:text-white rounded-lg transition-colors font-medium cursor-pointer"
          >
            مسح وقراءة كافة التنبيهات
          </button>
        </div>
      )}
    </div>
  );
}
