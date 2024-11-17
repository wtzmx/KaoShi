import React, { useState } from 'react';
import InputForm from './InputForm';

function EditExamModal({ exam, onSubmit, onClose }) {
  const [isExpanded, setIsExpanded] = useState(false);

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
            onClick={onClose}
            title="关闭"
          >
            ×
          </button>
        </div>
        <InputForm 
          editingExam={exam}
          onSubmit={(formData) => {
            onSubmit(formData);
            onClose();
          }}
          onCancel={onClose}
          isModal={true}
        />
      </div>
    </div>
  );
}

export default EditExamModal; 