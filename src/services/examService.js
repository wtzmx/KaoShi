const STORAGE_KEY = 'exam_records';

// 示例数据
const sampleData = [
  {
    id: 1701234567890,  // 使用时间戳作为ID
    examName: '2024年山东省公务员考试',
    examType: 'civil',
    announcementUrl: 'https://gwy.shandong.gov.cn/announcement',
    registrationUrl: 'https://gwy.shandong.gov.cn/register',
    timeNodes: [
      {
        id: 'announcement',
        label: '公告发布',
        type: 'single',
        startTime: '2024-11-12T09:00',
        endTime: '2024-11-18T16:00'
      },
      {
        id: 'registration',
        label: '网上报名',
        type: 'range',
        startTime: '2024-11-22T09:00',
        endTime: '2024-11-22T16:00'
      },
      {
        id: 'payment',
        label: '缴费确认',
        type: 'range',
        startTime: '2024-11-12T09:00',
        endTime: '2024-11-21T16:00'
      },
      {
        id: 'admission',
        label: '准考证打印',
        type: 'range',
        startTime: '2024-12-04T09:00',
        endTime: '2024-12-08T17:00'
      },
      {
        id: 'written',
        label: '笔试时间',
        type: 'range',
        startTime: '2024-12-07T14:00',
        endTime: '2024-12-08T16:30'
      }
    ],
    notes: '招考人数：9504人',
    createdAt: '2023-12-05T10:00:00.000Z',
    updatedAt: '2023-12-05T10:00:00.000Z'
  },
  // 可以添加更多示例数据
  {
    id: 1701234567891,
    examName: '2024年教师资格考试(上半年)',
    examType: 'teacher',
    announcementUrl: 'https://www.ntce.cn/announcement',
    registrationUrl: 'https://www.ntce.cn/register',
    timeNodes: [
      {
        id: 1,
        label: '报名时间',
        startTime: '2024-01-15T09:00',
        endTime: '2024-01-20T16:00'
      },
      {
        id: 2,
        label: '缴费时间',
        startTime: '2024-01-15T09:00',
        endTime: '2024-01-22T16:00'
      },
      {
        id: 3,
        label: '准考证打印',
        startTime: '2024-03-01T09:00',
        endTime: '2024-03-10T16:00'
      },
      {
        id: 4,
        label: '笔试时间',
        startTime: '2024-03-16T09:00',
        endTime: '2024-03-17T16:00'
      }
    ],
    notes: '包含幼儿园、小学、初中、高中各学科类别',
    createdAt: '2023-12-05T11:00:00.000Z',
    updatedAt: '2023-12-05T11:00:00.000Z'
  }
];

export const examService = {
  // 初始化示例数据
  initSampleData() {
    const existingData = localStorage.getItem(STORAGE_KEY);
    if (!existingData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData));
    }
  },

  // 获取所有考试记录
  getAllExams() {
    const records = localStorage.getItem(STORAGE_KEY);
    return records ? JSON.parse(records) : [];
  },

  // 添加新的考试记录
  addExam(examData) {
    const records = this.getAllExams();
    const newExam = {
      id: Date.now(),  // 使用时间戳作为简单的唯一标识
      ...examData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    records.push(newExam);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return newExam;
  },

  // 更新考试记录
  updateExam(id, examData) {
    const records = this.getAllExams();
    const index = records.findIndex(record => record.id === id);
    
    if (index !== -1) {
      records[index] = {
        ...records[index],
        ...examData,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      return records[index];
    }
    return null;
  },

  // 删除考试记录
  deleteExam(id) {
    const records = this.getAllExams();
    const filteredRecords = records.filter(record => record.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRecords));
  },

  // 根据ID获取考试记录
  getExamById(id) {
    const records = this.getAllExams();
    return records.find(record => record.id === id);
  }
}; 