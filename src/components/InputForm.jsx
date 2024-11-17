import React, { useState, useEffect } from 'react';

const TimeNodeInput = ({ node, onTimeChange }) => {
  const formatDate = (dateTimeStr) => {
    if (!dateTimeStr) return { date: '', time: '' };
    const [date, time] = dateTimeStr.split('T');
    return { date, time };
  };

  const combineDateTime = (date, time) => {
    if (!date || !time) return '';
    return `${date}T${time}`;
  };

  const handleDateChange = (type, date) => {
    const current = formatDate(type === 'start' ? node.startTime : node.endTime);
    const newDateTime = combineDateTime(date, current.time || '00:00');
    if (node.type === 'single' && type === 'start') {
      onTimeChange('startTime', newDateTime);
      onTimeChange('endTime', newDateTime);
    } else {
      onTimeChange(type === 'start' ? 'startTime' : 'endTime', newDateTime);
    }
  };

  const handleTimeChange = (type, time) => {
    const current = formatDate(type === 'start' ? node.startTime : node.endTime);
    const newDateTime = combineDateTime(current.date, time);
    if (node.type === 'single' && type === 'start') {
      onTimeChange('startTime', newDateTime);
      onTimeChange('endTime', newDateTime);
    } else {
      onTimeChange(type === 'start' ? 'startTime' : 'endTime', newDateTime);
    }
  };

  const startDateTime = formatDate(node.startTime);
  const endDateTime = formatDate(node.endTime);

  return (
    <div className="time-range">
      <div className="datetime-input">
        <div className="date-time-group">
          <input
            type="date"
            value={startDateTime.date}
            onChange={(e) => handleDateChange('start', e.target.value)}
          />
          <input
            type="time"
            value={startDateTime.time}
            onChange={(e) => handleTimeChange('start', e.target.value)}
          />
        </div>
        {node.type === 'range' && (
          <>
            <span className="time-separator">至</span>
            <div className="date-time-group">
              <input
                type="date"
                value={endDateTime.date}
                onChange={(e) => handleDateChange('end', e.target.value)}
              />
              <input
                type="time"
                value={endDateTime.time}
                onChange={(e) => handleTimeChange('end', e.target.value)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

function InputForm({ onSubmit, editingExam, onCancel, isModal }) {
  // JSON 示例模板 - 移到组件顶部
  const jsonTemplate = [
    {
      "id": "announcement",
      "label": "公告发布",
      "type": "single",
      "startTime": "2024-11-12T09:00",
      "endTime": "2024-11-12T09:00"
    },
    {
      "id": "registration",
      "label": "网上报名",
      "type": "range",
      "startTime": "2024-11-12T09:00",
      "endTime": "2024-11-18T16:00"
    },
    {
      "id": "payment",
      "label": "网上缴费",
      "type": "range",
      "startTime": "2024-11-12T09:00",
      "endTime": "2024-11-21T16:00"
    },
    {
      "id": "admission",
      "label": "准考证打印",
      "type": "range",
      "startTime": "2024-12-04T09:00",
      "endTime": "2024-12-08T17:00"
    },
    {
      "id": "written",
      "label": "笔试时间",
      "type": "range",
      "startTime": "2024-12-07T14:00",
      "endTime": "2024-12-08T16:30"
    },
    {
      "id": "interview",
      "label": "面试时间",
      "type": "range",
      "startTime": "2024-12-20T09:00",
      "endTime": "2024-12-22T18:00"
    },
    {
      "id": "custom_1",
      "label": "资格审查",
      "type": "range",
      "startTime": "2024-11-19T09:00",
      "endTime": "2024-11-21T16:00"
    },
    {
      "id": "custom_2",
      "label": "体检时间",
      "type": "single",
      "startTime": "2024-12-25T09:00",
      "endTime": "2024-12-25T09:00"
    }
  ];

  const defaultTimeNodes = [
    { id: 'announcement', label: '公告发布', type: 'single', startTime: '', endTime: '' },
    { id: 'registration', label: '网上报名', type: 'range', startTime: '', endTime: '' },
    { id: 'payment', label: '网上缴费', type: 'range', startTime: '', endTime: '' },
    { id: 'admission', label: '准考证打印', type: 'range', startTime: '', endTime: '' },
    { id: 'written', label: '笔试时间', type: 'range', startTime: '', endTime: '' },
    { id: 'interview', label: '面试时间', type: 'range', startTime: '', endTime: '' },
  ];

  const [formData, setFormData] = useState(
    editingExam || {
      examName: '',
      examType: 'civil',
      announcementUrl: '',
      registrationUrl: '',
      timeNodes: defaultTimeNodes,
      notes: ''
    }
  );

  // 添加 JSON 文本状态，使用模板作为初始值
  const [jsonText, setJsonText] = useState(JSON.stringify(jsonTemplate, null, 2));

  const [showAddSuccess, setShowAddSuccess] = useState(false);  // 添加成功提示的状态

  // 处理 JSON 文本变化
  const handleJsonTextChange = (e) => {
    setJsonText(e.target.value);
  };

  // 处理 JSON 解析
  const handleJsonParse = () => {
    if (!jsonText.trim()) {
      alert('请输入时间节点数据');
      return;
    }

    try {
      const timeNodes = JSON.parse(jsonText);
      
      // 验证是否为数组
      if (!Array.isArray(timeNodes)) {
        throw new Error('数据格式错误：应为时间节点数组');
      }

      // 验证每个时间节点的必要字段
      timeNodes.forEach(node => {
        if (!node.label || !node.type || !node.startTime) {
          throw new Error('时间节点数据不完整：每个节点必须包含 label、type 和 startTime');
        }
      });

      // 更新表单数据中的时间节点
      setFormData(prev => ({
        ...prev,
        timeNodes: timeNodes.map(node => ({
          ...node,
          id: node.id && !node.id.startsWith('custom_') 
            ? node.id 
            : `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }))
      }));

      alert('时间节点导入成功！');
    } catch (error) {
      alert(`数据格式错误：${error.message}`);
    }
  };

  useEffect(() => {
    if (editingExam) {
      // 如果是编辑模式，合并预设节点和已有节点
      const existingNodeIds = editingExam.timeNodes.map(node => node.id);
      const missingDefaultNodes = defaultTimeNodes.filter(node => 
        !existingNodeIds.includes(node.id)
      );
      
      setFormData({
        ...editingExam,
        timeNodes: [...editingExam.timeNodes, ...missingDefaultNodes]
      });
    }
  }, [editingExam]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addTimeNode = () => {
    setFormData(prev => ({
      ...prev,
      timeNodes: [
        ...prev.timeNodes,
        {
          id: `custom_${Date.now()}`,
          label: '',
          type: 'range',
          startTime: '',
          endTime: ''
        }
      ]
    }));

    // 显示添加成功提示
    setShowAddSuccess(true);
    // 1.5秒后自动隐藏提示
    setTimeout(() => {
      setShowAddSuccess(false);
    }, 1500);
  };

  const removeTimeNode = (id) => {
    // 只允许删除自定义节点
    if (String(id).startsWith('custom_')) {
      setFormData(prev => ({
        ...prev,
        timeNodes: prev.timeNodes.filter(node => node.id !== id)
      }));
    }
  };

  const handleTimeNodeChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      timeNodes: prev.timeNodes.map(node => 
        node.id === id ? { ...node, [field]: value } : node
      )
    }));
  };

  const handleTimeNodeTypeChange = (id) => {
    setFormData(prev => ({
      ...prev,
      timeNodes: prev.timeNodes.map(node => {
        if (node.id === id) {
          // 切换类型时，如果从range切换到single，将结束时间设置为开始时间
          const newType = node.type === 'single' ? 'range' : 'single';
          return {
            ...node,
            type: newType,
            endTime: newType === 'single' ? node.startTime : node.endTime
          };
        }
        return node;
      })
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleCancel = () => {
    if (window.confirm('确定要取消' + (editingExam ? '编辑' : '录入') + '吗？已输入的信息将不会保存。')) {
      onCancel();
    }
  };

  return (
    <div className={`input-form-container ${isModal ? 'modal-form' : ''}`}>
      <div className="form-header">
        <h2>{editingExam ? '编辑考试信息' : '考试信息录入'}</h2>
        <div className="form-header-buttons">
          <button 
            type="button" 
            className="header-btn cancel"
            onClick={handleCancel}
          >
            取消
          </button>
          <button 
            type="button" 
            className="header-btn submit"
            onClick={handleSubmit}
          >
            {editingExam ? '保存修改' : '保存信息'}
          </button>
        </div>
      </div>

      <form className="input-form">
        <div className={`form-layout ${isModal ? 'modal-layout' : ''}`}>
          <div className="form-left">
            <div className="form-section">
              <div className="form-row">
                <div className="form-group">
                  <label>考试名称 <span className="required">*</span></label>
                  <input
                    type="text"
                    name="examName"
                    value={formData.examName}
                    onChange={handleChange}
                    placeholder="例：2025年江苏省省考"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>考试类型</label>
                  <select
                    name="examType"
                    value={formData.examType}
                    onChange={handleChange}
                  >
                    <option value="civil">公务员</option>
                    <option value="teacher">教师资格</option>
                    <option value="professional">专业资格</option>
                    <option value="language">语言考试</option>
                    <option value="other">其他</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>公告链接</label>
                  <div className="url-input">
                    <input
                      type="url"
                      name="announcementUrl"
                      value={formData.announcementUrl}
                      onChange={handleChange}
                      placeholder="请输入考试公告链接（选填）"
                    />
                    {formData.announcementUrl && (
                      <a 
                        href={formData.announcementUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="url-preview"
                      >
                        预览
                      </a>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label>报名地址</label>
                  <div className="url-input">
                    <input
                      type="url"
                      name="registrationUrl"
                      value={formData.registrationUrl}
                      onChange={handleChange}
                      placeholder="请输入报名网站链接（选填）"
                    />
                    {formData.registrationUrl && (
                      <a 
                        href={formData.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="url-preview"
                      >
                        预览
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>备注信息</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="其他需要补充的信息（选填）"
                />
              </div>

              <div className="form-group">
                <label>时间节点导入</label>
                <textarea
                  className="json-input"
                  rows="6"
                  placeholder="粘贴时间节点 JSON 数据以快速导入"
                  value={jsonText}
                  onChange={handleJsonTextChange}
                />
                <div className="json-parse-actions">
                  <button 
                    type="button" 
                    className="parse-btn"
                    onClick={handleJsonParse}
                  >
                    导入时间节点
                  </button>
                  <div className="json-input-tip">
                    提示：修改上方数据后点击导入按钮
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：时间节点 */}
          <div className="form-right">
            <div className="form-section time-nodes-section">
              <div className="section-header">
                <h3>时间节点</h3>
                <div className="add-node-wrapper">
                  {showAddSuccess && (
                    <div className="add-success-tip">
                      添加成功
                    </div>
                  )}
                  <button 
                    type="button" 
                    className="add-node-btn" 
                    onClick={addTimeNode}
                  >
                    <span>+</span> 添加自定义节点
                  </button>
                </div>
              </div>
              <div className="time-nodes-container compact">
                {formData.timeNodes.map((node) => (
                  <div key={node.id} className={`time-node-group ${String(node.id).startsWith('custom_') ? 'custom-node' : 'default-node'}`}>
                    <div className="node-header">
                      {String(node.id).startsWith('custom_') ? (
                        <>
                          <input
                            type="text"
                            className="node-label-input"
                            value={node.label}
                            onChange={(e) => handleTimeNodeChange(node.id, 'label', e.target.value)}
                            placeholder="自定义节点名称"
                          />
                          <button 
                            type="button" 
                            className="remove-node-btn"
                            onClick={() => removeTimeNode(node.id)}
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <div className="node-label">{node.label}</div>
                      )}
                      <div className="node-type-switch">
                        <button
                          type="button"
                          className={`type-switch-btn ${node.type === 'single' ? 'active' : ''}`}
                          onClick={() => handleTimeNodeTypeChange(node.id)}
                          title={node.type === 'single' ? '单日事件' : '时间段事件'}
                        >
                          {node.type === 'single' ? '单日' : '时间段'}
                        </button>
                      </div>
                    </div>
                    <TimeNodeInput 
                      node={node}
                      onTimeChange={(field, value) => handleTimeNodeChange(node.id, field, value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default InputForm; 