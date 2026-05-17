// 会议标题池
export const MEETING_TITLES = [
  'Q3 产品路线图评审',
  '前端技术方案评审',
  '周会 - 电商事业部',
  '客户需求对接会',
  'Sprint 回顾会议',
  'UI/UX 设计评审',
  '数据平台架构讨论',
  '季度业务复盘',
  '新员工入职培训',
  '跨部门协作沟通',
  '性能优化专项讨论',
  '大促保障方案评审',
  'OKR 目标对齐会',
  '用户增长策略讨论',
  '技术选型评估会',
  '安全合规专项会议',
  '供应链系统对接',
  'AI 能力建设讨论',
  '商户平台产品规划',
  '支付系统升级评审',
];

// 部门名
export const DEPARTMENTS = [
  '产品部',
  '前端组',
  '后端组',
  '设计部',
  '市场部',
  '运营部',
  '数据平台部',
  '测试部',
  '安全部',
  '算法组',
];

// 议程话题模板
export const AGENDA_TOPICS = [
  '上周工作回顾',
  '本周计划对齐',
  '阻塞问题讨论',
  '技术方案分享',
  '项目进度同步',
  '风险点识别',
  '资源协调',
  '需求变更评审',
  '上线checklist确认',
  '数据分析报告',
];

// 会前准备清单模板
export const CHECKLIST_TEMPLATES = [
  '确认参会人员时间',
  '准备演示文稿',
  '测试音视频设备',
  '提前阅读会议材料',
  '准备讨论要点',
  '预订会议室',
  '发送会议邀请',
  '准备会议纪要模板',
];

// 待办事项模板
export const ACTION_ITEM_TEMPLATES = [
  { title: '完成{module}模块开发', priority: 'high' as const },
  { title: '整理{module}技术文档', priority: 'medium' as const },
  { title: '对接{dept}接口方案', priority: 'high' as const },
  { title: '修复{module}线上问题', priority: 'high' as const },
  { title: '输出{module}测试报告', priority: 'medium' as const },
  { title: '优化{module}性能', priority: 'low' as const },
  { title: '评审{module}代码', priority: 'medium' as const },
  { title: '补充{module}单元测试', priority: 'medium' as const },
  { title: '更新{module}需求文档', priority: 'low' as const },
  { title: '调研{module}技术方案', priority: 'medium' as const },
];

// 模块名
export const MODULES = [
  '订单中心',
  '用户体系',
  '支付网关',
  '商品管理',
  '库存系统',
  '消息推送',
  '数据分析',
  '权限管理',
  '搜索服务',
  '推荐引擎',
];

// 关键决策模板
export const DECISION_TEMPLATES = [
  '采用{dep}的{module}方案作为基线，{time}前完成技术验证',
  '确定{module}模块由{dept}负责，排期至下一迭代',
  '批准{module}架构调整方案，先行在预发环境验证',
  '暂缓{module}需求，优先保障核心链路稳定性',
  '同意增加{dept}人力投入，目标{time}前完成',
];

// 讨论要点模板
export const DISCUSSION_TEMPLATES = [
  { topic: '技术方案选型', content: '对比了{dep}方案和{dep2}方案，综合考虑维护成本和扩展性，倾向于{dep}方案' },
  { topic: '排期评估', content: '当前迭代剩余{time}工作日，需优先处理高优先级需求，低优项可顺延至下个迭代' },
  { topic: '风险预警', content: '{module}模块存在性能瓶颈，大促期间QPS预估增长3倍，需提前扩容' },
  { topic: '资源协调', content: '{dept}和{dept2}需共同支持{module}上线，建议安排联合开发' },
  { topic: '质量标准', content: '确认了上线checklist：单元测试覆盖率>80%，压测通过，灰度验证至少24小时' },
];

// 会议描述模板
export const MEETING_DESC_TEMPLATES = [
  '本次会议主要围绕{dep}近期的项目进展和下一步规划展开讨论，重点关注关键路径上的阻塞项。',
  '同步{dep}各业务线的周度进展，对齐下周目标，识别需要跨团队协调的问题。',
  '针对{module}的技术方案进行深入评审，评估不同方案的优劣势并确定最终技术路线。',
];

// AI 摘要模板
export const SUMMARY_TEMPLATES = [
  '本次会议主要围绕{dep}的工作展开，重点讨论了{module}相关的技术方案和排期问题。与会人员就关键决策达成一致，明确了下一阶段的工作重点和责任人。会议还识别了若干风险点，并制定了相应的应对措施。',
  '会议回顾了上周核心工作进展，{dep}团队在{module}方面取得了阶段性成果。与会者就当前面临的挑战进行了充分讨论，确定了解决方案和后续跟进计划。',
  '这是一个高效的{session}会议，各方就{dep}和{dep2}的协作模式达成共识。关键技术决策已确定，待办事项已清晰分配，后续跟进机制已建立。',
];

// 会议性质
export const SESSION_TYPES = ['站会', '评审', '复盘', '规划', '沟通'];
