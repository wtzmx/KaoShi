import React, { useState } from 'react';

function AddEventForm({ onSubmit }) {
  const [eventData, setEventData] = useState({
    title: '',
    type: '考试',
    description: '',
    timeNodes: []
  });

  const addTimeNode = () => {
    setEventData({
      ...eventData,
      timeNodes: [
        ...eventData.timeNodes,
        { title: '', deadline: '', reminder: '' }
      ]
    });
  };

  const updateTimeNode = (index, field, value) => {
    const newTimeNodes = [...eventData.timeNodes];
    newTimeNodes[index] = {
      ...newTimeNodes[index],
      [field]: value
    };
    setEventData({
      ...eventData,
      timeNodes: newTimeNodes
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 这里可以添加数据验证
    onSubmit(eventData);
  };

  return (
    <form className="add-event-form">
      <div className="form-group">
        <label>事件名称</label>
        <input 
          type="text" 
          value={eventData.title}
          onChange={e => setEventData({...eventData, title: e.target.value})}
        />
      </div>
      
      <div className="form-group">
        <label>类型</label>
        <select 
          value={eventData.type}
          onChange={e => setEventData({...eventData, type: e.target.value})}
        >
          <option value="考试">考试</option>
          <option value="面试">面试</option>
          <option value="申请材料">申请材料</option>
        </select>
      </div>
      
      <div className="time-nodes">
        <h3>时间节点</h3>
        {eventData.timeNodes.map((node, index) => (
          <div key={index} className="time-node">
            <input 
              type="text" 
              placeholder="节点名称"
              value={node.title}
              onChange={e => updateTimeNode(index, 'title', e.target.value)}
            />
            <input 
              type="date" 
              value={node.deadline}
              onChange={e => updateTimeNode(index, 'deadline', e.target.value)}
            />
          </div>
        ))}
        <button type="button" onClick={addTimeNode}>添加时间节点</button>
      </div>
      
      <button type="submit">保存</button>
    </form>
  );
}

export default AddEventForm; 