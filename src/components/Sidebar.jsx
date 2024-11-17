import React, { useState } from 'react';

function Sidebar({ activeMenu, onMenuSelect }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const menuItems = [
    { id: 'dashboard', icon: '📊', label: '仪表盘' },
    { id: 'exams', icon: '📚', label: '考试管理' },
    { id: 'interviews', icon: '👥', label: '面试管理' },
    { id: 'applications', icon: '📑', label: '申请材料' },
    { id: 'calendar', icon: '📅', label: '日程表' },
    { id: 'settings', icon: '⚙️', label: '设置' }
  ];

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="logo">
        {isCollapsed ? (
          <span className="logo-icon">📚</span>
        ) : (
          <span className="logo-text">📚 考试管理系统</span>
        )}
      </div>
      
      <button 
        className="collapse-btn"
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
      >
        <svg 
          className="collapse-icon" 
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d={isCollapsed ? "M6 12l4-4-4-4" : "M10 12l-4-4 4-4"}
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <ul className="nav-menu">
        {menuItems.map(item => (
          <li
            key={item.id}
            className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
            onClick={() => onMenuSelect(item.id)}
            title={isCollapsed ? item.label : ''}
          >
            <div className="nav-item-content">
              <div className="icon-wrapper">
                <span className="icon">{item.icon}</span>
              </div>
              {!isCollapsed && (
                <span className="label">{item.label}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar; 