import React, { useState, useEffect, useMemo } from 'react';
import { format, differenceInDays, isBefore, isAfter, isSameDay } from 'date-fns';
import EditExamModal from './EditExamModal';
import AddExamModal from './AddExamModal';
import ExamDetailModal from './ExamDetailModal';

function ExamManagement({ examRecords, onDelete, onEdit, onAdd }) {
  // 首先定义 getExamStatus 函数
  const getExamStatus = (timeNodes) => {
    if (!timeNodes || timeNodes.length === 0) return '未开始';
    
    const now = new Date();
    const lastNode = timeNodes[timeNodes.length - 1];
    const endTime = new Date(lastNode.endTime);
    
    if (now > endTime) return '已结束';
    return '进行中';
  };

  // 然后再定义状态和其他函数
  const [searchTerm, setSearchTerm] = useState('');
  const [editingExam, setEditingExam] = useState(null);
  const [showingNotes, setShowingNotes] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showingDetail, setShowingDetail] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [announcementSort, setAnnouncementSort] = useState(null); // 'asc', 'desc', 或 null
  const [showAnnouncementSort, setShowAnnouncementSort] = useState(false);

  // 预设的时间节点类型
  const defaultNodeTypes = [
    '公告发布',
    '网上报名',
    '网上缴费',
    '准考证打印',
    '笔试时间',
    '面试时间'
  ];

  // 获取指定类型的时间节点
  const getNodeByType = (nodes, type) => {
    return nodes.find(node => node.label === type) || null;
  };

  // 过滤和搜索考试记录
  const filteredExams = examRecords.filter(exam => {
    const matchesSearch = exam.examName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || exam.examType === typeFilter;
    const matchesStatus = statusFilter === 'all' || getExamStatus(exam.timeNodes) === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // 获取最近的时间节点
  const getNextTimeNode = (timeNodes) => {
    if (!timeNodes || timeNodes.length === 0) return null;
    
    const now = new Date();
    const futureNodes = timeNodes.filter(node => new Date(node.startTime) > now);
    return futureNodes.length > 0 ? futureNodes[0] : timeNodes[timeNodes.length - 1];
  };

  // 排序函数
  const sortExams = (exams) => {
    if (!sortConfig.key) return exams;

    return [...exams].sort((a, b) => {
      if (sortConfig.key === 'examName') {
        return sortConfig.direction === 'asc' 
          ? a.examName.localeCompare(b.examName)
          : b.examName.localeCompare(a.examName);
      }
      
      if (sortConfig.key === 'nextNode') {
        const aNode = getNextTimeNode(a.timeNodes);
        const bNode = getNextTimeNode(b.timeNodes);
        if (!aNode) return sortConfig.direction === 'asc' ? 1 : -1;
        if (!bNode) return sortConfig.direction === 'asc' ? -1 : 1;
        return sortConfig.direction === 'asc'
          ? new Date(aNode.startTime) - new Date(bNode.startTime)
          : new Date(bNode.startTime) - new Date(aNode.startTime);
      }
      
      return 0;
    });
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedExams = useMemo(() => {
    if (!announcementSort) return filteredExams;

    return [...filteredExams].sort((a, b) => {
      const aNode = getNodeByType(a.timeNodes, '公告发布');
      const bNode = getNodeByType(b.timeNodes, '公告发布');
      
      // 处理空值情况
      if (!aNode?.startTime && !bNode?.startTime) return 0;
      if (!aNode?.startTime) return 1;
      if (!bNode?.startTime) return -1;
      
      const aTime = new Date(aNode.startTime).getTime();
      const bTime = new Date(bNode.startTime).getTime();
      
      return announcementSort === 'asc' ? aTime - bTime : bTime - aTime;
    });
  }, [filteredExams, announcementSort]);

  // 添加缺失的函数
  const toggleNotes = (id, e) => {
    e.stopPropagation();
    setShowingNotes(showingNotes === id ? null : id);
  };

  const handleEdit = (id) => {
    const examToEdit = examRecords.find(exam => exam.id === id);
    setEditingExam(examToEdit);
  };

  // 添加时间状态计算函数
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
        return `${daysDiff}天后`;
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
          return `进行中 剩${daysToEnd}天`;
        }
        // 未开始
        if (isBefore(now, startDate)) {
          const daysToStart = differenceInDays(startDate, now);
          return `${daysToStart}天后 开始`;
        }
      }
      
      return '未设置';
    } catch (error) {
      console.error('Date calculation error:', error);
      return '错误';
    }
  };

  // 添加导出功能
  const handleExportData = () => {
    try {
      // 准备导出数据
      const exportData = {
        exportDate: new Date().toISOString(),
        examRecords: examRecords
      };

      // 创建 Blob 对象
      const blob = new Blob(
        [JSON.stringify(exportData, null, 2)], 
        { type: 'application/json' }
      );

      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // 设置文件名（使用当前日期时间）
      const date = new Date();
      const fileName = `exam_records_backup_${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}.json`;
      link.download = fileName;

      // 触发下载
      document.body.appendChild(link);
      link.click();

      // 清理
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert('数据导出成功！');
    } catch (error) {
      console.error('导出失败：', error);
      alert('导出失败，请重试！');
    }
  };

  // 添加导入功能
  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // 验证导入的数据格式
        if (!importedData.examRecords || !Array.isArray(importedData.examRecords)) {
          throw new Error('无效的数据格式');
        }

        // 验证每条记录的必要字段
        importedData.examRecords.forEach(exam => {
          if (!exam.examName || !exam.timeNodes) {
            throw new Error('数据不完整：缺少必要字段');
          }
        });

        // 确认导入
        if (window.confirm(`确定要导入 ${importedData.examRecords.length} 条考试记录吗？这将覆盖现有数据。`)) {
          // 使用导入的数据更新本地存储
          localStorage.setItem('exam_records', JSON.stringify(importedData.examRecords));
          // 刷新页面以加载新数据
          window.location.reload();
        }
      } catch (error) {
        console.error('导入失败：', error);
        alert(`导入失败：${error.message}`);
      }
    };
    reader.readAsText(file);
  };

  // 添加获取所有可能状态的函数
  const getAllPossibleStatuses = () => {
    const statuses = new Set();
    examRecords.forEach(exam => {
      statuses.add(getExamStatus(exam.timeNodes));
    });
    return Array.from(statuses);
  };

  // 在组件内添加 useEffect
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.filter-column') && !event.target.closest('.with-sort')) {
        setShowTypeFilter(false);
        setShowStatusFilter(false);
        setShowAnnouncementSort(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="exam-management">
      <div className="management-header">
        <div className="header-controls">
          <div className="control-group">
            <button 
              className="control-btn primary"
              onClick={() => setShowAddModal(true)}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 20 20" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M10 4V16M4 10H16" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              新增考试
            </button>
            <button 
              className="control-btn secondary"
              onClick={handleExportData}
              title="导出备份数据"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 20 20" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M13 8L10 11L7 8M10 4V11M16 15V16H4V15" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              导出备份
            </button>
            <div className="import-wrapper">
              <input
                type="file"
                id="import-file"
                accept=".json"
                onChange={handleImportData}
                style={{ display: 'none' }}
              />
              <button 
                className="control-btn secondary"
                onClick={() => document.getElementById('import-file').click()}
                title="导入备份数据"
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 20 20" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M7 8L10 5L13 8M10 16V5M4 15V16H16V15" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
                导入备份
              </button>
            </div>
          </div>
          <div className="search-box">
            <span className="search-icon">
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 20 20" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M9 17A8 8 0 109 1A8 8 0 009 17zM19 19L13 13" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <input
              type="text"
              className="search-input"
              placeholder="搜索考试名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="exam-table-container">
        {/* 桌面端表格视图 */}
        <div className="desktop-view">
          <table className="exam-table">
            <colgroup>
              <col style={{ width: '15%' }} /> {/* 考试名称列 - 从20%减少到15% */}
              <col style={{ width: '8%' }} />  {/* 考试类型列 - 从10%减少到8% */}
              <col style={{ width: '6%' }} />  {/* 状态列 - 从8%减少到6% */}
              <col style={{ width: '51%' }} /> {/* 时间节点列 - 增加到51% */}
              <col style={{ width: '10%' }} /> {/* 链接列 */}
              <col style={{ width: '10%' }} /> {/* 操作列 */}
            </colgroup>
            <thead>
              <tr>
                <th>考试名称</th>
                <th className="filter-column">
                  <div className="column-header">
                    <span>考试类型</span>
                    <div className="filter-wrapper">
                      <button 
                        className="filter-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowTypeFilter(!showTypeFilter);
                          setShowStatusFilter(false);
                        }}
                      >
                        <svg 
                          className="filter-icon" 
                          width="12" 
                          height="12" 
                          viewBox="0 0 12 12" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            d={showTypeFilter ? "M2 8L6 4L10 8" : "M2 4L6 8L10 4"} 
                            stroke="currentColor" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      {showTypeFilter && (
                        <div className="filter-dropdown">
                          <div className="filter-option">
                            <label>
                              <input
                                type="radio"
                                name="typeFilter"
                                value="all"
                                checked={typeFilter === 'all'}
                                onChange={(e) => setTypeFilter(e.target.value)}
                              />
                              全部
                            </label>
                          </div>
                          {['civil', 'teacher', 'professional', 'language', 'other'].map(type => (
                            <div key={type} className="filter-option">
                              <label>
                                <input
                                  type="radio"
                                  name="typeFilter"
                                  value={type}
                                  checked={typeFilter === type}
                                  onChange={(e) => setTypeFilter(e.target.value)}
                                />
                                {type === 'civil' ? '公务员' :
                                 type === 'teacher' ? '教师资格' :
                                 type === 'professional' ? '专业资格' :
                                 type === 'language' ? '语言考试' : '其他'}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </th>
                <th className="filter-column">
                  <div className="column-header">
                    <span>状态</span>
                    <div className="filter-wrapper">
                      <button 
                        className="filter-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowStatusFilter(!showStatusFilter);
                          setShowTypeFilter(false);
                        }}
                      >
                        <svg 
                          className="filter-icon" 
                          width="12" 
                          height="12" 
                          viewBox="0 0 12 12" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            d={showStatusFilter ? "M2 8L6 4L10 8" : "M2 4L6 8L10 4"} 
                            stroke="currentColor" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      {showStatusFilter && (
                        <div className="filter-dropdown">
                          <div className="filter-option">
                            <label>
                              <input
                                type="radio"
                                name="statusFilter"
                                value="all"
                                checked={statusFilter === 'all'}
                                onChange={(e) => setStatusFilter(e.target.value)}
                              />
                              全部
                            </label>
                          </div>
                          {getAllPossibleStatuses().map(status => (
                            <div key={status} className="filter-option">
                              <label>
                                <input
                                  type="radio"
                                  name="statusFilter"
                                  value={status}
                                  checked={statusFilter === status}
                                  onChange={(e) => setStatusFilter(e.target.value)}
                                />
                                {status}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </th>
                <th className="time-nodes-header">
                  <div className="time-nodes-labels">
                    <div className="node-label-column with-sort">
                      <div className="column-header">
                        <span>公告发布</span>
                        <div className="filter-wrapper">
                          <button 
                            className="filter-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAnnouncementSort(!showAnnouncementSort);
                            }}
                          >
                            <svg 
                              className="filter-icon" 
                              width="12" 
                              height="12" 
                              viewBox="0 0 12 12" 
                              fill="none" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path 
                                d={showAnnouncementSort ? "M2 8L6 4L10 8" : "M2 4L6 8L10 4"} 
                                stroke="currentColor" 
                                strokeWidth="1.5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                          {showAnnouncementSort && (
                            <div className="filter-dropdown">
                              <div className="filter-option">
                                <label>
                                  <input
                                    type="radio"
                                    name="announcementSort"
                                    value="none"
                                    checked={!announcementSort}
                                    onChange={() => setAnnouncementSort(null)}
                                  />
                                  默认排序
                                </label>
                              </div>
                              <div className="filter-option">
                                <label>
                                  <input
                                    type="radio"
                                    name="announcementSort"
                                    value="asc"
                                    checked={announcementSort === 'asc'}
                                    onChange={() => setAnnouncementSort('asc')}
                                  />
                                  时间升序
                                </label>
                              </div>
                              <div className="filter-option">
                                <label>
                                  <input
                                    type="radio"
                                    name="announcementSort"
                                    value="desc"
                                    checked={announcementSort === 'desc'}
                                    onChange={() => setAnnouncementSort('desc')}
                                  />
                                  时间降序
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {defaultNodeTypes.slice(1).map(type => (
                      <div key={type} className="node-label-column">{type}</div>
                    ))}
                  </div>
                </th>
                <th>链接</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {sortedExams.length > 0 ? (
                // 有数据时显示考试记录
                sortedExams.map(exam => {
                  const status = getExamStatus(exam.timeNodes);

                  return (
                    <React.Fragment key={exam.id}>
                      <tr className={`status-${status.replace(/\s+/g, '-')}`}>
                        <td>
                          <div className="exam-name-cell">
                            {exam.examName}
                            {exam.notes && (
                              <button
                                className="notes-indicator"
                                onClick={(e) => toggleNotes(exam.id, e)}
                                title="查看备注"
                              >
                                📝
                              </button>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`type-badge ${exam.examType}`}>
                            {exam.examType === 'civil' ? '公务员' :
                             exam.examType === 'teacher' ? '教师资格' :
                             exam.examType === 'professional' ? '专业资格' :
                             exam.examType === 'language' ? '语言考试' : '其他'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${status}`}>
                            {status}
                          </span>
                        </td>
                        <td>
                          <div className="time-nodes-grid">
                            {defaultNodeTypes.map(type => {
                              const node = getNodeByType(exam.timeNodes, type);
                              return (
                                <div key={type} className="time-node-cell">
                                  {node && node.startTime ? (
                                    <div className="node-time-info">
                                      {type === '公告发布' ? (
                                        <div>{format(new Date(node.startTime), 'MM/dd HH:mm')}</div>
                                      ) : node.type === 'single' ? (
                                        <>
                                          <div>{format(new Date(node.startTime), 'MM/dd HH:mm')}</div>
                                          <div className={`time-status ${
                                            getTimeStatus(node.startTime, node.startTime, node.type).includes('已结束') ? 'ended' :
                                            getTimeStatus(node.startTime, node.startTime, node.type).includes('今天') ? 'today' : 'upcoming'
                                          }`}>
                                            {getTimeStatus(node.startTime, node.startTime, node.type)}
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <div>{format(new Date(node.startTime), 'MM/dd HH:mm')}</div>
                                          <div>{format(new Date(node.endTime), 'MM/dd HH:mm')}</div>
                                          <div className={`time-status ${
                                            getTimeStatus(node.startTime, node.endTime, node.type).includes('已结束') ? 'ended' :
                                            getTimeStatus(node.startTime, node.endTime, node.type).includes('进行中') ? 'ongoing' :
                                            getTimeStatus(node.startTime, node.endTime, node.type).includes('今天') ? 'today' : 'upcoming'
                                          }`}>
                                            {getTimeStatus(node.startTime, node.endTime, node.type)}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="no-time">-</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td>
                          <div className="link-buttons">
                            {exam.announcementUrl && (
                              <a
                                href={exam.announcementUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link-btn announcement"
                              >
                                公告
                              </a>
                            )}
                            {exam.registrationUrl && (
                              <a
                                href={exam.registrationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link-btn registration"
                              >
                                报名
                              </a>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-btn detail"
                              onClick={() => setShowingDetail(exam)}
                            >
                              详情
                            </button>
                            <button
                              className="action-btn delete"
                              onClick={() => onDelete(exam.id)}
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                      {showingNotes === exam.id && exam.notes && (
                        <tr className="notes-row">
                          <td colSpan="6">
                            <div className="notes-content">
                              <strong>备注：</strong>
                              {exam.notes}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                // 无数据时显示提示行
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="no-records">
                      <p>暂无符合条件的考试记录</p>
                      {(typeFilter !== 'all' || statusFilter !== 'all') && (
                        <button
                          className="reset-filter-btn"
                          onClick={() => {
                            setTypeFilter('all');
                            setStatusFilter('all');
                          }}
                        >
                          重置筛选条件
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 移动端卡视图 */}
        <div className="mobile-view">
          {sortedExams.map(exam => (
            <div key={exam.id} className="exam-card">
              <div className="exam-card-header">
                <div className="exam-title">
                  <h3>{exam.examName}</h3>
                  {exam.notes && (
                    <button
                      className="notes-indicator"
                      onClick={(e) => toggleNotes(exam.id, e)}
                      title="查看备注"
                    >
                      📝
                    </button>
                  )}
                </div>
                <span className={`type-badge ${exam.examType}`}>
                  {exam.examType === 'civil' ? '公务员' :
                   exam.examType === 'teacher' ? '教师资格' :
                   exam.examType === 'professional' ? '专业资格' :
                   exam.examType === 'language' ? '语言考试' : '其他'}
                </span>
              </div>

              <div className="exam-card-status">
                <span className={`status-badge ${getExamStatus(exam.timeNodes)}`}>
                  {getExamStatus(exam.timeNodes)}
                </span>
              </div>

              <div className="exam-card-nodes">
                {defaultNodeTypes.map(type => {
                  const node = getNodeByType(exam.timeNodes, type);
                  return (
                    <div key={type} className="card-node-item">
                      <div className="node-label">{type}</div>
                      <div className="node-content">
                        {node && node.startTime ? (
                          <div className="node-time-info">
                            {type === '公告发布' ? (
                              <div>{format(new Date(node.startTime), 'MM/dd HH:mm')}</div>
                            ) : node.type === 'single' ? (
                              <>
                                <div>{format(new Date(node.startTime), 'MM/dd HH:mm')}</div>
                                <div className={`time-status ${
                                  getTimeStatus(node.startTime, node.startTime, node.type).includes('已结束') ? 'ended' :
                                  getTimeStatus(node.startTime, node.startTime, node.type).includes('今天') ? 'today' : 'upcoming'
                                }`}>
                                  {getTimeStatus(node.startTime, node.startTime, node.type)}
                                </div>
                              </>
                            ) : (
                              <>
                                <div>{format(new Date(node.startTime), 'MM/dd HH:mm')}</div>
                                <div>{format(new Date(node.endTime), 'MM/dd HH:mm')}</div>
                                <div className={`time-status ${
                                  getTimeStatus(node.startTime, node.endTime, node.type).includes('已结束') ? 'ended' :
                                  getTimeStatus(node.startTime, node.endTime, node.type).includes('进行中') ? 'ongoing' :
                                  getTimeStatus(node.startTime, node.endTime, node.type).includes('今天') ? 'today' : 'upcoming'
                                }`}>
                                  {getTimeStatus(node.startTime, node.endTime, node.type)}
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="no-time">-</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="exam-card-links">
                {exam.announcementUrl && (
                  <a
                    href={exam.announcementUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-btn announcement"
                  >
                    公告链接
                  </a>
                )}
                {exam.registrationUrl && (
                  <a
                    href={exam.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-btn registration"
                  >
                    报名链接
                  </a>
                )}
              </div>

              <div className="exam-card-actions">
                <button
                  className="action-btn detail"
                  onClick={() => setShowingDetail(exam)}
                >
                  详情
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => onDelete(exam.id)}
                >
                  删除
                </button>
              </div>

              {showingNotes === exam.id && exam.notes && (
                <div className="exam-card-notes">
                  <strong>备注：</strong>
                  {exam.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {sortedExams.length === 0 && (
        <div className="no-records">
          <p>暂无考试记录</p>
        </div>
      )}

      {editingExam && (
        <EditExamModal
          exam={editingExam}
          onSubmit={onEdit}
          onClose={() => setEditingExam(null)}
        />
      )}

      {showAddModal && (
        <AddExamModal
          onSubmit={onAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showingDetail && (
        <ExamDetailModal
          exam={showingDetail}
          onClose={() => setShowingDetail(null)}
          onEdit={onEdit}
        />
      )}
    </div>
  );
}

export default ExamManagement; 