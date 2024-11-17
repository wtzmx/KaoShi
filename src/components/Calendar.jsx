import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import zhCN from 'date-fns/locale/zh-CN';

function Calendar({ examRecords, onShowDetail }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  // 处理考试记录，转换为事件格式
  useEffect(() => {
    const allEvents = examRecords.flatMap(exam => {
      return exam.timeNodes.map(node => ({
        id: `${exam.id}-${node.id}`,
        examId: exam.id,
        examName: exam.examName,
        title: `${exam.examName} - ${node.label}`,
        date: new Date(node.startTime),
        endDate: new Date(node.endTime),
        type: node.type,
        nodeLabel: node.label,
        examType: exam.examType,
        color: getExamColor(exam.examType) // 添加颜色属性
      }));
    });
    setEvents(allEvents);
  }, [examRecords]);

  // 获取考试类型对应的颜色
  const getExamColor = (examType) => {
    switch (examType) {
      case 'civil':
        return 'var(--primary-color)';
      case 'teacher':
        return 'var(--success-color)';
      case 'professional':
        return 'var(--warning-color)';
      case 'language':
        return 'var(--danger-color)';
      default:
        return 'var(--text-secondary)';
    }
  };

  // 获取考试类型的中文名称
  const getExamTypeName = (examType) => {
    switch (examType) {
      case 'civil':
        return '公务员';
      case 'teacher':
        return '教师资格';
      case 'professional':
        return '专业资格';
      case 'language':
        return '语言考试';
      default:
        return '其他';
    }
  };

  // 获取当月的所有日期
  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  // 在 Calendar 组件中添加事件优先级排序函数
  const priorityOrder = {
    '笔试时间': 1,
    '面试时间': 2,
    '准考证打印': 3,
    '网上报名': 4,
    '网上缴费': 5,
    '公告发布': 6
  };

  // 修改获取事件的函数
  const getEventsForDay = (day) => {
    const dayEvents = events.filter(event => {
      if (event.type === 'single') {
        return isSameDay(event.date, day);
      } else {
        return day >= event.date && day <= event.endDate;
      }
    });

    // 按考试类型和节点优先级排序
    return dayEvents.sort((a, b) => {
      // 首先按考试类型分组
      if (a.examName !== b.examName) {
        return a.examName.localeCompare(b.examName);
      }
      // 然后按节点优先级排序
      return (priorityOrder[a.nodeLabel] || 99) - (priorityOrder[b.nodeLabel] || 99);
    });
  };

  // 上一个月
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // 下一个月
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // 返回今天
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 在渲染事件时进行分组显示
  const renderDayEvents = (events) => {
    const groupedEvents = events.reduce((groups, event) => {
      if (!groups[event.examName]) {
        groups[event.examName] = [];
      }
      groups[event.examName].push(event);
      return groups;
    }, {});

    return Object.entries(groupedEvents).map(([examName, examEvents]) => {
      // 获取该考试的完整信息
      const exam = examRecords.find(exam => exam.examName === examName);
      
      return (
        <div key={examName} className="event-group">
          <div 
            className="event-group-header"
            onClick={() => onShowDetail(exam)}
            style={{ cursor: 'pointer' }}
          >
            <span className="event-group-name">{examName}</span>
            <span className="view-detail-icon">👉</span>
          </div>
          {examEvents.map(event => (
            <div 
              key={event.id} 
              className="event-item"
              style={{ borderLeftColor: event.color }}
              title={`${event.examName} - ${event.nodeLabel}`}
            >
              <div className="event-content">
                <span className="event-node-label">{event.nodeLabel}</span>
              </div>
            </div>
          ))}
        </div>
      );
    });
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-title">
          <h2>考试日程表</h2>
          <div className="calendar-legend">
            <div className="legend-title">考试类型：</div>
            {['civil', 'teacher', 'professional', 'language', 'other'].map(type => (
              <div key={type} className="legend-item">
                <span className="legend-dot" style={{ background: getExamColor(type) }}></span>
                <span className="legend-label">{getExamTypeName(type)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="calendar-controls">
          <button onClick={prevMonth} className="month-nav-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h3>{format(currentDate, 'yyyy年 MM月', { locale: zhCN })}</h3>
          <button onClick={nextMonth} className="month-nav-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button onClick={goToToday} className="today-btn">
            今天
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {['日', '一', '二', '三', '四', '五', '六'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        <div className="calendar-days">
          {monthDays.map(day => {
            const dayEvents = getEventsForDay(day);
            return (
              <div 
                key={day.toISOString()} 
                className={`calendar-day ${isToday(day) ? 'today' : ''}`}
              >
                <span className="day-number">{format(day, 'd')}</span>
                <div className="day-events">
                  {renderDayEvents(dayEvents)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Calendar; 