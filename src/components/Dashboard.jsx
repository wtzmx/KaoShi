import React from 'react';
import { format } from 'date-fns';

function Dashboard({ events, examRecords, onAddClick }) {
  // 获取所有时间节点并排序
  const getAllTimeNodes = () => {
    return examRecords
      .flatMap(exam => 
        exam.timeNodes
          .filter(node => node.startTime && node.endTime) // 只处理有时间的节点
          .map(node => ({
            ...node,
            examName: exam.examName,
            examType: exam.examType
          }))
      )
      .sort((a, b) => {
        // 确保有有效的时间值再进行比较
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return new Date(a.startTime) - new Date(b.startTime);
      });
  };

  const timeNodes = getAllTimeNodes();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">考试申请管理系统</h1>
        <button className="add-event-btn" onClick={onAddClick}>
          <span>+</span> 添加新事件
        </button>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>考试总数</h3>
          <div className="value">{examRecords.length}</div>
        </div>
        <div className="stat-card">
          <h3>近期时间节点</h3>
          <div className="value">{timeNodes.length}</div>
        </div>
        <div className="stat-card">
          <h3>本月考试</h3>
          <div className="value">
            {examRecords.filter(exam => {
              const now = new Date();
              const firstNode = exam.timeNodes.find(node => node.startTime);
              if (!firstNode) return false;
              const examDate = new Date(firstNode.startTime);
              return examDate.getMonth() === now.getMonth();
            }).length}
          </div>
        </div>
      </div>
      
      <div className="upcoming-events">
        <h2>近期时间节点</h2>
        <div className="timeline">
          {timeNodes.length === 0 ? (
            <div className="empty-state">
              <p>暂无时间节点</p>
            </div>
          ) : (
            timeNodes.map((node, index) => (
              <div key={index} className="timeline-item">
                <div className="date">
                  {node.startTime ? format(new Date(node.startTime), 'yyyy-MM-dd HH:mm') : '未设置'}
                </div>
                <div className="content">
                  <h3>{node.label}</h3>
                  <p>{node.examName}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 