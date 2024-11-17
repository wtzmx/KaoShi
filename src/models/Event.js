// 定义事件模型
class Event {
  constructor(id, title, type, description) {
    this.id = id;
    this.title = title;           // 考试/申请名称
    this.type = type;             // 类型：考试/面试/申请材料
    this.description = description;
    this.timeNodes = [];          // 时间节点数组
    this.completed = false;
  }
}

class TimeNode {
  constructor(id, title, deadline, reminder) {
    this.id = id;
    this.title = title;           // 时间节点名称
    this.deadline = deadline;     // 截止日期
    this.reminder = reminder;     // 提醒时间
    this.completed = false;
  }
}

export { Event, TimeNode }; 