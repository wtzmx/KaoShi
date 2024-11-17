import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import InputForm from './components/InputForm';
import AddEventForm from './components/AddEventForm';
import Sidebar from './components/Sidebar';
import { examService } from './services/examService';
import ExamManagement from './components/ExamManagement';
import Calendar from './components/Calendar';
import ExamDetailModal from './components/ExamDetailModal';
import './styles/main.css';

function App() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [events, setEvents] = useState([]);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [examRecords, setExamRecords] = useState([]);
  const [editingExam, setEditingExam] = useState(null);
  const [showingDetail, setShowingDetail] = useState(null);

  // 初始加载考试记录
  useEffect(() => {
    examService.initSampleData();  // 初始化示例数据
    const records = examService.getAllExams();
    setExamRecords(records);
  }, []);

  const handleSubmit = (eventData) => {
    setEvents([...events, eventData]);
    setShowAddForm(false);
  };

  const handleInputSubmit = (formData) => {
    try {
      if (editingExam) {
        // 更新现有记录
        const updatedExam = examService.updateExam(editingExam.id, formData);
        setExamRecords(prev => prev.map(record => 
          record.id === editingExam.id ? updatedExam : record
        ));
        setEditingExam(null);  // 清除编辑状态
        alert('考试信息更新成功！');
      } else {
        // 添加新记录
        const newExam = examService.addExam(formData);
        setExamRecords(prev => [...prev, newExam]);
        alert('考试信息保存成功！');
      }
      setActiveMenu('exams');  // 保存后跳转到考试管理页面
    } catch (error) {
      console.error('保存失败：', error);
      alert('保存失败，请重试！');
    }
  };

  const handleDeleteExam = (id) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      try {
        examService.deleteExam(id);
        setExamRecords(prev => prev.filter(record => record.id !== id));
        alert('删除成功！');
      } catch (error) {
        console.error('删除失败：', error);
        alert('删除失败，请重试！');
      }
    }
  };

  const handleEditExam = (formData) => {
    try {
      const updatedExam = examService.updateExam(formData.id, formData);
      setExamRecords(prev => prev.map(record => 
        record.id === formData.id ? updatedExam : record
      ));
      alert('考试信息更新成功！');
    } catch (error) {
      console.error('更新失败：', error);
      alert('更新失败，请重试！');
    }
  };

  const handleCancelEdit = () => {
    setEditingExam(null);
    setActiveMenu('exams');
  };

  const handleAddExam = (formData) => {
    try {
      const newExam = examService.addExam(formData);
      setExamRecords(prev => [...prev, newExam]);
      alert('考试信息添加成功！');
    } catch (error) {
      console.error('添加失败：', error);
      alert('添加失败，请重试！');
    }
  };

  // 处理显示考试详情
  const handleShowExamDetail = (exam) => {
    setShowingDetail(exam);
    // 可选：切换到考试管理页面
    // setActiveMenu('exams');
  };

  return (
    <div className="app">
      <Sidebar 
        activeMenu={activeMenu} 
        onMenuSelect={setActiveMenu}
      />
      <div className="main-content">
        <div className="top-bar">
          <h1 className="page-title">
            {activeMenu === 'dashboard' ? '仪表盘' : 
             activeMenu === 'input' ? (editingExam ? '编辑考试信息' : '信息录入') :
             activeMenu === 'exams' ? '考试管理' :
             activeMenu === 'interviews' ? '面试管理' :
             activeMenu === 'applications' ? '申请材料' :
             activeMenu === 'calendar' ? '日程表' : '设置'}
          </h1>
        </div>
        
        {activeMenu === 'dashboard' && !showAddForm && (
          <Dashboard 
            events={events} 
            examRecords={examRecords}
            onAddClick={() => setShowAddForm(true)} 
          />
        )}
        
        {showAddForm && (
          <AddEventForm onSubmit={handleSubmit} />
        )}
        
        {activeMenu === 'input' && (
          <InputForm 
            onSubmit={handleInputSubmit}
            examRecords={examRecords}
            editingExam={editingExam}
            onCancel={handleCancelEdit}
          />
        )}

        {activeMenu === 'exams' && (
          <ExamManagement
            examRecords={examRecords}
            onDelete={handleDeleteExam}
            onEdit={handleEditExam}
            onAdd={handleAddExam}  // 修改为直接处理添加
          />
        )}

        {activeMenu === 'calendar' && (
          <Calendar 
            examRecords={examRecords} 
            onShowDetail={handleShowExamDetail}
          />
        )}

        {/* 添加详情模态框 */}
        {showingDetail && (
          <ExamDetailModal
            exam={showingDetail}
            onClose={() => setShowingDetail(null)}
            onEdit={handleEditExam}
          />
        )}
      </div>
    </div>
  );
}

export default App; 