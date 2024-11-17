import React, { useState } from 'react';
import { format, differenceInDays, isBefore, isAfter, isSameDay } from 'date-fns';
import InputForm from './InputForm';

function ExamDetailModal({ exam, onClose, onEdit }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '未设置';
    try {
      return format(new Date(dateTimeStr), 'yyyy年MM月dd日 HH:mm');
    } catch (error) {
      console.error('Invalid date:', dateTimeStr);
      return '时间格式错误';
    }
  };

  // 修改时间状态计算函数
  const getTimeStatus = (startTime, endTime, type) => {
    if (!startTime) return '';
    try {
      const startDate = new Date(startTime);
      const endDate = endTime ? new Date(endTime) : null;
      const now = new Date();

      // 单日事件
      if (type === 'single') {
        if (isBefore(startDate, now) && !isSameDay(startDate, now)) {
          return '已结束';
        }
        if (isSameDay(startDate, now)) {
          return '今天';
        }
        const daysDiff = differenceInDays(startDate, now);
        return `剩余 ${daysDiff} 天`;
      }

      // 时间段事件
      if (endDate) {
        // 已结束
        if (isBefore(endDate, now) && !isSameDay(endDate, now)) {
          return '已结束';
        }
        // 进行中
        if ((isAfter(now, startDate) || isSameDay(now, startDate)) && 
            (isBefore(now, endDate) || isSameDay(now, endDate))) {
          const daysToEnd = differenceInDays(endDate, now);
          return `进行中，还剩 ${daysToEnd} 天`;
        }
        // 未开始
        if (isBefore(now, startDate)) {
          const daysToStart = differenceInDays(startDate, now);
          return `未开始，还有 ${daysToStart} 天`;
        }
      }
      
      return '时间未设置完整';
    } catch (error) {
      console.error('Date calculation error:', error);
      return '时间格式错误';
    }
  };

  // 对时间节点进行排序
  const sortedTimeNodes = [...exam.timeNodes].sort((a, b) => {
    if (!a.startTime) return 1;  // 没有开始时间的放到最后
    if (!b.startTime) return -1;
    return new Date(a.startTime) - new Date(b.startTime);
  });

  const handleEditSubmit = (formData) => {
    onEdit(formData);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={`modal-overlay ${isExpanded ? 'expanded' : ''}`}>
        <div className={`modal-content ${isExpanded ? 'expanded' : ''}`}>
          <div className="modal-header-buttons">
            <button 
              className="modal-btn expand"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "还原" : "放大"}
            >
              {isExpanded ? '⊙' : '⊕'}
            </button>
            <button 
              className="modal-btn close"
              onClick={() => setIsEditing(false)}
              title="关闭"
            >
              ×
            </button>
          </div>
          <InputForm 
            editingExam={exam}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditing(false)}
            isModal={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`modal-overlay ${isExpanded ? 'expanded' : ''}`}>
      <div className={`modal-content ${isExpanded ? 'expanded' : ''}`}>
        <div className="modal-header-buttons">
          <button 
            className="modal-btn edit"
            onClick={() => setIsEditing(true)}
            title="编辑"
          >
            ✎
          </button>
          <button 
            className="modal-btn expand"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "还原" : "放大"}
          >
            {isExpanded ? '⊙' : '⊕'}
          </button>
          <button 
            className="modal-btn close"
            onClick={onClose}
            title="关闭"
          >
            ×
          </button>
        </div>
        
        <div className="exam-detail">
          <h2 className="detail-title">{exam.examName}</h2>
          
          <div className="detail-section">
            <h3>基本信息</h3>
            <div className="detail-content">
              <div className="detail-item">
                <label>考试类型：</label>
                <span className={`type-badge ${exam.examType}`}>
                  {exam.examType === 'civil' ? '公务员' :
                   exam.examType === 'teacher' ? '教师资格' :
                   exam.examType === 'professional' ? '专业资格' :
                   exam.examType === 'language' ? '语言考试' : '其他'}
                </span>
              </div>
              {exam.announcementUrl && (
                <div className="detail-item">
                  <label>公告链接：</label>
                  <a href={exam.announcementUrl} target="_blank" rel="noopener noreferrer">
                    查看公告
                  </a>
                </div>
              )}
              {exam.registrationUrl && (
                <div className="detail-item">
                  <label>报名链接：</label>
                  <a href={exam.registrationUrl} target="_blank" rel="noopener noreferrer">
                    进入报名
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="detail-section">
            <h3>时间节点</h3>
            <div className="detail-timeline">
              {sortedTimeNodes.map((node, index) => (
                <div key={node.id || index} className={`timeline-node ${String(node.id).startsWith('custom_') ? 'custom-node' : ''}`}>
                  <div className="node-index">{index + 1}</div>
                  <div className="node-content">
                    <div className="node-header">
                      <h4>{node.label}</h4>
                      <div className="node-status">
                        <span className="node-type">
                          {node.type === 'single' ? '单日事件' : '时间段'}
                        </span>
                        <span className={`countdown-tag ${
                          getTimeStatus(node.startTime, node.endTime, node.type).includes('已结束') ? 'ended' :
                          getTimeStatus(node.startTime, node.endTime, node.type).includes('进行中') ? 'ongoing' :
                          getTimeStatus(node.startTime, node.endTime, node.type).includes('今天') ? 'today' : 'upcoming'
                        }`}>
                          {getTimeStatus(node.startTime, node.endTime, node.type)}
                        </span>
                      </div>
                    </div>
                    <div className="node-times">
                      {node.type === 'single' ? (
                        <div className="time-single">
                          {formatDateTime(node.startTime)}
                        </div>
                      ) : (
                        <>
                          <div className="time-range">
                            <label>开始：</label>
                            {formatDateTime(node.startTime)}
                          </div>
                          <div className="time-range">
                            <label>截止：</label>
                            {formatDateTime(node.endTime)}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {exam.notes && (
            <div className="detail-section">
              <h3>备注信息</h3>
              <div className="detail-notes">
                {exam.notes}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExamDetailModal; 