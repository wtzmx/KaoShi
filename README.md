# 考试申请管理系统

## 项目简介
这是一个基于 React 构建的考试申请管理系统，用于帮助用户管理各类考试的时间节点和相关信息。系统提供了直观的界面和便捷的操作方式，支持多种考试类型的管理和时间节点跟踪。

## 主要功能

### 1. 考试信息管理
- 添加、编辑、删除考试记录
- 查看考试详情
- 支持多种考试类型：
  - 公务员考试
  - 教师资格考试
  - 专业资格考试
  - 语言考试
  - 其他类型
- 支持考试信息筛选和排序
- 支持数据导入导出功能

### 2. 时间节点管理
- 预设时间节点：
  - 公告发布
  - 网上报名
  - 网上缴费
  - 准考证打印
  - 笔试时间
  - 面试时间
- 支持自定义时间节点
- 支持单日事件和时间段设置
- 实时显示节点状态（已结束/进行中/即将开始）
- 支持时间节点优先级排序

### 3. 日程表功能
- 月历形式展示所有考试时间节点
- 按考试类型进行颜色区分
- 支持考试事件分组显示
- 支持快速跳转到考试详情
- 今日日期突出显示
- 支持月份切换和返回今天
- 按优先级显示时间节点
- 支持点击考试名称查看详情

### 4. 数据管理
- JSON 格式时间节点数据导入
- 考试记录数据备份导出
- 备份数据恢复导入
- 本地数据持久化存储（LocalStorage）

### 5. 界面特点
- 响应式设计，支持移动端访问
- 可折叠侧边栏
- 表格/卡片双视图模式
- 丰富的交互动画效果
- 支持考试类型和状态筛选
- 支持时间节点排序
- 美观的数据可视化展示

## 技术栈
- React 18
- date-fns（日期处理）
- CSS Variables（主题定制）
- LocalStorage（数据持久化）

## 项目结构
src/
├── components/ # 组件文件夹
│ ├── AddEventForm.jsx # 添加事件表单
│ ├── AddExamModal.jsx # 添加考试模态框
│ ├── Calendar.jsx # 日程表组件
│ ├── Dashboard.jsx # 仪表盘组件
│ ├── EditExamModal.jsx # 编辑考试模态框
│ ├── ExamDetailModal.jsx # 考试详情模态框
│ ├── ExamManagement.jsx # 考试管理组件
│ ├── InputForm.jsx # 信息录入表单
│ └── Sidebar.jsx # 侧边栏组件
├── services/ # 服务层
│ └── examService.js # 考试数据服务
├── styles/ # 样式文件
│ └── main.css # 主样式文件
└── App.js # 应用入口组件


## 开发环境要求
- Node.js >= 14.0.0
- npm >= 6.0.0

## 安装和运行
1. 克隆项目
bash
git clone [项目地址]

2. 安装依赖
bash
npm install

3. 运行开发服务器
bash
npm start

4. 构建生产版本
bash
npm run build

## 浏览器支持
- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 待实现功能
- 面试管理模块
- 申请材料管理
- 系统设置
- 数据导出为 Excel 格式
- 批量导入功能
- 数据统计分析

## 数据结构
javascript
// 考试记录结构
{
id: string,
examName: string,
examType: 'civil' | 'teacher' | 'professional' | 'language' | 'other',
timeNodes: Array<{
id: string,
label: string,
type: 'single' | 'range',
startTime: string,
endTime: string
}>,
notes?: string,
announcementUrl?: string,
registrationUrl?: string
}


## 开发规范

### 组件开发
- 使用函数组件和 Hooks
- 组件文件使用 .jsx 扩展名
- 组件名使用大驼峰命名

### 样式规范
- 使用 CSS Variables 进行主题定制
- 遵循 BEM 命名规范
- 响应式设计断点：
  - 移动端：max-width: 768px
  - 平板：max-width: 1024px
  - 桌面端：min-width: 1025px

### 数据管理
- 使用 LocalStorage 存储数据
- 提供数据导入导出功能
- 确保数据格式符合预定义的结构