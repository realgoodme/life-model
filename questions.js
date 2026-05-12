// ============================================================
// 人生先天参数评分模型 — 专业题库（92题，7大维度）
// 新增维度：身心健康（health）、机遇把握（action）
// ============================================================

const DIMENSIONS = {
  birth:    { name: '出身资本',   color: '#5B7FFF', icon: '🏛️' },
  family:   { name: '原生家庭',   color: '#FF6B8A', icon: '🏠' },
  talent:   { name: '天赋禀赋',   color: '#FFB347', icon: '🧠' },
  character:{ name: '性格特质',   color: '#3DD9A0', icon: '🎭' },
  era:      { name: '时代大环境', color: '#A78BFA', icon: '🌍' },
  health:   { name: '身心健康',   color: '#FF8C69', icon: '🏥' },
  action:   { name: '机遇把握',   color: '#7DD3FC', icon: '⚡' }
};

const QUESTIONS = [
  // ===================== 维度一：出身资本（14题） =====================
  {
    id: 1, dim: 'birth',
    text: '你出生时家庭的经济状况属于哪个层次？',
    sub: '家庭经济资本是布迪厄资本理论的核心维度',
    options: [
      { label: '极度贫困，食物/住所都不稳定', score: 1 },
      { label: '普通农村/城镇低收入家庭', score: 2 },
      { label: '城市普通工薪家庭，温饱无忧', score: 3 },
      { label: '中产偏上，有房有车有余款', score: 4 },
      { label: '富裕家庭/企业主/高收入精英', score: 5 }
    ]
  },
  {
    id: 2, dim: 'birth',
    text: '父母的职业及社会地位如何？',
    sub: '参考社会学职业分层标准（Goldthorpe分类法）',
    options: [
      { label: '无业/务农/流动打工', score: 1 },
      { label: '工人/服务业/个体小摊贩', score: 2 },
      { label: '普通公务员/教师/工程师/医护', score: 3 },
      { label: '中层管理/中小企业主/副高级职称', score: 4 },
      { label: '高管/企业家/政界/学界权威', score: 5 }
    ]
  },
  {
    id: 3, dim: 'birth',
    text: '家庭的房产/不动产状况？',
    sub: '以你18岁前家庭资产为准',
    options: [
      { label: '租房居住或无固定居所', score: 1 },
      { label: '仅有自住一套普通住房', score: 2 },
      { label: '自住房条件良好（100m²以上）', score: 3 },
      { label: '有多套房产或商业地产', score: 4 },
      { label: '多套优质房产+其他固定资产丰厚', score: 5 }
    ]
  },
  {
    id: 4, dim: 'birth',
    text: '家庭的社会关系网络如何？',
    sub: '社会资本理论（科尔曼）：人脉是重要的隐性资产',
    options: [
      { label: '几乎没有有影响力的社会关系', score: 1 },
      { label: '有少量一般性认识的本地人脉', score: 2 },
      { label: '有一定的行业/系统内部人脉', score: 3 },
      { label: '父母在某领域有较强人脉资源', score: 4 },
      { label: '家庭在政界/商界/学界有深厚人脉', score: 5 }
    ]
  },
  {
    id: 5, dim: 'birth',
    text: '你成长的城市层级？',
    sub: '城市化差异对教育资源、机会窗口影响显著',
    options: [
      { label: '偏远农村或贫困县城', score: 1 },
      { label: '普通县城或三四线城市', score: 2 },
      { label: '二线城市或省会城市', score: 3 },
      { label: '新一线城市（成都/杭州/武汉等）', score: 4 },
      { label: '北京/上海/深圳/广州', score: 5 }
    ]
  },
  {
    id: 6, dim: 'birth',
    text: '父母的受教育程度？',
    sub: '文化资本的代际传递是重要的社会学规律',
    options: [
      { label: '小学及以下', score: 1 },
      { label: '初中/高中/中专', score: 2 },
      { label: '大专/本科', score: 3 },
      { label: '本科/硕士（985/211）', score: 4 },
      { label: '名校硕博/博士后/海外名校', score: 5 }
    ]
  },
  {
    id: 7, dim: 'birth',
    text: '家族是否有企业/创业传承？',
    sub: '家族企业为后代提供资源平台和实习土壤',
    options: [
      { label: '从未有过，家族均为打工者', score: 1 },
      { label: '有过小生意但已关闭', score: 2 },
      { label: '有小规模个体工商户/店铺', score: 3 },
      { label: '有一定规模的家族企业', score: 4 },
      { label: '有成熟的企业集团或产业链', score: 5 }
    ]
  },
  {
    id: 8, dim: 'birth',
    text: '你的童年是否接受过课外兴趣教育（音乐/体育/编程等）？',
    sub: '兴趣班投入反映家庭对文化资本的重视程度',
    options: [
      { label: '从未有过，家庭无此条件', score: 1 },
      { label: '偶尔参加，但不持续', score: 2 },
      { label: '有1-2项坚持了数年', score: 3 },
      { label: '有3项以上系统训练', score: 4 },
      { label: '接受过专业化、系统化的精英教育', score: 5 }
    ]
  },
  {
    id: 9, dim: 'birth',
    text: '你就读的中学属于什么层次？',
    sub: '学校质量直接影响知识积累和机会获取',
    options: [
      { label: '村镇普通中学或辍学', score: 1 },
      { label: '县市普通公立中学', score: 2 },
      { label: '市级重点中学', score: 3 },
      { label: '省级重点/示范性高中', score: 4 },
      { label: '顶级名校附中/省状元级高中', score: 5 }
    ]
  },
  {
    id: 10, dim: 'birth',
    text: '家庭是否曾资助过你创业/学习/出国的重大机会？',
    sub: '资本托底能力决定试错成本',
    options: [
      { label: '从未，所有花费都要自己解决', score: 1 },
      { label: '偶尔小额支持', score: 2 },
      { label: '在关键节点提供了支持', score: 3 },
      { label: '多次提供重要财务支持', score: 4 },
      { label: '全力资助，无后顾之忧', score: 5 }
    ]
  },
  {
    id: 11, dim: 'birth',
    text: '家庭是否能获得优先信息/内部机会？',
    sub: '信息不对称是阶层差异的核心机制之一',
    options: [
      { label: '几乎获取不到，信息封闭', score: 1 },
      { label: '有时能通过亲友获得一些信息', score: 2 },
      { label: '在某一行业有较好的信息获取渠道', score: 3 },
      { label: '能经常获取政策/行业内部信息', score: 4 },
      { label: '处于核心信息圈，掌握优质机会先手', score: 5 }
    ]
  },
  {
    id: 12, dim: 'birth',
    text: '你的户籍/民族/政策身份对你有何影响？',
    sub: '制度性资本在中国社会中具有特殊意义',
    options: [
      { label: '户籍/身份明显不利，长期受限制', score: 1 },
      { label: '农村户籍，有一定制度障碍', score: 2 },
      { label: '普通城市户籍，无特殊优劣', score: 3 },
      { label: '有少数民族加分或特殊政策红利', score: 4 },
      { label: '重点城市优质户籍或政策性特权身份', score: 5 }
    ]
  },
  {
    id: 13, dim: 'birth',
    text: '你家庭所在社区的整体层次如何？',
    sub: '社区资本（社区经济学）显著影响社会资本积累和机会获取',
    options: [
      { label: '贫困社区/城中村，环境混乱', score: 1 },
      { label: '普通工人社区/乡镇街道', score: 2 },
      { label: '一般城市社区，邻里关系普通', score: 3 },
      { label: '优质小区/学区房，邻里层次较高', score: 4 },
      { label: '高端社区/别墅区，社区资本极优', score: 5 }
    ]
  },
  {
    id: 14, dim: 'birth',
    text: '你童年时家庭是否有 systemic 的财务规划（保险/信托/理财）？',
    sub: '财务规划能力反映家庭的代际财富管理意识',
    options: [
      { label: '完全没有，家庭财务处于生存线', score: 1 },
      { label: '偶尔储蓄，无系统规划', score: 2 },
      { label: '有基本储蓄和简单理财意识', score: 3 },
      { label: '有系统性财务规划（保险/多元投资）', score: 4 },
      { label: '有信托/税务筹划等级的财富管理', score: 5 }
    ]
  },

  // ===================== 维度二：原生家庭（14题） =====================
  {
    id: 15, dim: 'family',
    text: '你的父母主要采用哪种教养方式？',
    sub: '鲍姆林德教养理论：权威型教养产出最优子女',
    options: [
      { label: '放任/忽视型：几乎不管你', score: 1 },
      { label: '专制型：严格控制，缺乏沟通', score: 2 },
      { label: '溺爱型：过度保护，缺乏界限', score: 2 },
      { label: '混合型：有规则也有温度', score: 4 },
      { label: '权威型：温暖、理性、有规则有沟通', score: 5 }
    ]
  },
  {
    id: 16, dim: 'family',
    text: '家庭氛围总体如何？',
    sub: '家庭情感气候影响依恋类型与心理健康基线',
    options: [
      { label: '长期充满冲突、吵架、暴力', score: 1 },
      { label: '冷漠疏离，缺乏情感联结', score: 2 },
      { label: '普通，偶有矛盾但基本稳定', score: 3 },
      { label: '温暖和谐，亲密感强', score: 4 },
      { label: '高度支持性、充满鼓励与爱的家庭', score: 5 }
    ]
  },
  {
    id: 17, dim: 'family',
    text: '你与父母的亲子关系如何？',
    sub: '安全型依恋是未来人际与职业发展的基础',
    options: [
      { label: '极度疏离，几乎没有情感连接', score: 1 },
      { label: '关系紧张，存在长期矛盾', score: 2 },
      { label: '一般，没有特别亲密也没大矛盾', score: 3 },
      { label: '较为亲密，能沟通和支持', score: 4 },
      { label: '非常亲密，相互支持理解，关系健康', score: 5 }
    ]
  },
  {
    id: 18, dim: 'family',
    text: '你是否曾长期留守（父母长期不在身边）？',
    sub: '留守经历与焦虑、自尊缺失的相关性已有大量实证',
    options: [
      { label: '是，6岁前父母即长期不在', score: 1 },
      { label: '是，小学期间父母大部分时间不在', score: 2 },
      { label: '部分留守，偶尔分离', score: 3 },
      { label: '基本在身边，偶尔短期外出', score: 4 },
      { label: '父母全程在身边，陪伴充分', score: 5 }
    ]
  },
  {
    id: 19, dim: 'family',
    text: '你成长过程中是否经历过家庭暴力（包括语言暴力）？',
    sub: 'ACE研究：童年逆境经历对成年行为有深远影响',
    options: [
      { label: '长期、严重的身体/语言暴力', score: 1 },
      { label: '频繁的语言攻击或偶发肢体冲突', score: 2 },
      { label: '偶有矛盾，未造成明显心理创伤', score: 3 },
      { label: '基本无暴力，偶有争吵但理性处理', score: 4 },
      { label: '从未经历任何形式的家庭暴力', score: 5 }
    ]
  },
  {
    id: 20, dim: 'family',
    text: '父母对你学业的关注和辅导程度？',
    sub: '教育投入是文化资本传递的核心路径',
    options: [
      { label: '完全不关注，从不过问学习', score: 1 },
      { label: '偶尔询问成绩，基本不辅导', score: 2 },
      { label: '有所关注，能在能力范围内辅导', score: 3 },
      { label: '高度关注，积极参与学习规划', score: 4 },
      { label: '高度重视并提供优质资源+专业辅导', score: 5 }
    ]
  },
  {
    id: 21, dim: 'family',
    text: '家庭是否培养了你的阅读/学习习惯？',
    sub: '家庭文化氛围对认知能力有持续影响',
    options: [
      { label: '家里几乎没有书，无阅读氛围', score: 1 },
      { label: '偶尔接触书籍，无明显引导', score: 2 },
      { label: '家里有一定藏书，父母有阅读习惯', score: 3 },
      { label: '家庭重视阅读，从小培养习惯', score: 4 },
      { label: '书香门第，阅读是家庭核心文化', score: 5 }
    ]
  },
  {
    id: 22, dim: 'family',
    text: '父母是否对你的未来有清晰的成长规划？',
    sub: '长远规划能力反映家庭的前瞻性与资源整合力',
    options: [
      { label: '完全没有规划，得过且过', score: 1 },
      { label: '希望你考个大学找份稳定工作', score: 2 },
      { label: '有基本规划，鼓励自我发展', score: 3 },
      { label: '有清晰职业路径规划并积极引导', score: 4 },
      { label: '系统化精英培养路径，资源充足', score: 5 }
    ]
  },
  {
    id: 23, dim: 'family',
    text: '家庭是否经历过重大变故（离婚/破产/重病/丧亲）？',
    sub: '家庭稳定性是儿童安全感的重要来源',
    options: [
      { label: '多次重大变故，家庭长期动荡', score: 1 },
      { label: '经历过严重的单次变故', score: 2 },
      { label: '有过轻度变故，但家庭基本恢复', score: 3 },
      { label: '偶有小波折，整体稳定', score: 4 },
      { label: '家庭长期稳定，无重大负面事件', score: 5 }
    ]
  },
  {
    id: 24, dim: 'family',
    text: '父母是否鼓励你表达情绪和个人意见？',
    sub: '心理安全感与情感表达自由度影响自我认知',
    options: [
      { label: '从不，情绪表达被压制甚至惩罚', score: 1 },
      { label: '较少，父母不善于处理情绪话题', score: 2 },
      { label: '一般，基本可以说话但有限制', score: 3 },
      { label: '较为开放，大多数时候能被倾听', score: 4 },
      { label: '完全支持，家庭是情绪安全港湾', score: 5 }
    ]
  },
  {
    id: 25, dim: 'family',
    text: '你的家庭是否有清晰的价值观和行为规范？',
    sub: '家庭价值观传递是自律性和道德感的早期来源',
    options: [
      { label: '混乱无序，缺乏一致价值观', score: 1 },
      { label: '有些模糊原则，但执行不一致', score: 2 },
      { label: '有基本规范，大体一致', score: 3 },
      { label: '有清晰规范，父母以身作则', score: 4 },
      { label: '家风优良，价值观明确且正向', score: 5 }
    ]
  },
  {
    id: 26, dim: 'family',
    text: '你是否有良好的手足/亲属支持网络？',
    sub: '社会支持系统是韧性的重要缓冲器',
    options: [
      { label: '独生且亲属关系疏远或矛盾', score: 1 },
      { label: '手足/亲属存在但关系一般', score: 2 },
      { label: '有正常的家族支持，关系普通', score: 3 },
      { label: '有1-2个重要的亲属支持关系', score: 4 },
      { label: '家族凝聚力强，是坚实支撑网络', score: 5 }
    ]
  },
  {
    id: 27, dim: 'family',
    text: '父母是否以身作则地展现了良好的亲密关系模式？',
    sub: '父母关系是子女亲密关系模板的直接来源（社会学习理论）',
    options: [
      { label: '父母关系极差，经常冲突或冷战', score: 1 },
      { label: '父母关系冷漠，缺乏情感交流', score: 2 },
      { label: '父母关系普通，偶有矛盾', score: 3 },
      { label: '父母关系良好，有爱的表达', score: 4 },
      { label: '父母是亲密关系的优秀榜样', score: 5 }
    ]
  },
  {
    id: 28, dim: 'family',
    text: '你的家庭是否鼓励独立性和自主决策？',
    sub: '心理独立性是影响成年后决策质量的关键变量',
    options: [
      { label: '完全包办，不允许任何自主决策', score: 1 },
      { label: '高度控制，仅在小事上允许选择', score: 2 },
      { label: '中等，在重要事项上有一定发言权', score: 3 },
      { label: '鼓励自主决策，父母提供建议但不强制', score: 4 },
      { label: '高度鼓励独立，从小培养决策能力', score: 5 }
    ]
  },

  // ===================== 维度三：天赋禀赋（14题） =====================
  {
    id: 29, dim: 'talent',
    text: '你对自己的总体学习能力/智力水平如何评估？',
    sub: '以同龄人横向比较为参照基准',
    options: [
      { label: '明显低于平均水平，学习较为吃力', score: 1 },
      { label: '略低或平均水平', score: 2 },
      { label: '中等，大部分内容能掌握', score: 3 },
      { label: '较高，学习新知识较快', score: 4 },
      { label: '极高，学习速度远超同龄人', score: 5 }
    ]
  },
  {
    id: 30, dim: 'talent',
    text: '你的逻辑推理和抽象思维能力如何？',
    sub: '数理逻辑是高认知职业的核心基础',
    options: [
      { label: '较差，对抽象概念感到困难', score: 1 },
      { label: '一般，能处理简单逻辑', score: 2 },
      { label: '良好，能分析较复杂的问题', score: 3 },
      { label: '优秀，擅长系统性分析和推导', score: 4 },
      { label: '卓越，逻辑思维是突出优势', score: 5 }
    ]
  },
  {
    id: 31, dim: 'talent',
    text: '你的记忆力（尤其是工作记忆）如何？',
    sub: '工作记忆容量是流体智力的重要预测指标',
    options: [
      { label: '较差，经常遗忘重要信息', score: 1 },
      { label: '一般，记忆效果中等', score: 2 },
      { label: '良好，能较好地记住所学内容', score: 3 },
      { label: '优秀，学过的内容记忆持久', score: 4 },
      { label: '超强，过目不忘，记忆是显著天赋', score: 5 }
    ]
  },
  {
    id: 32, dim: 'talent',
    text: '你的语言表达和沟通能力如何？',
    sub: '语言智力影响人际关系、职场晋升和社会影响力',
    options: [
      { label: '较弱，表达困难，常被误解', score: 1 },
      { label: '一般，能完成基本沟通', score: 2 },
      { label: '良好，表达清晰有逻辑', score: 3 },
      { label: '优秀，善于表达，有说服力', score: 4 },
      { label: '卓越，语言是天赋，演讲/写作俱佳', score: 5 }
    ]
  },
  {
    id: 33, dim: 'talent',
    text: '你是否有突出的艺术/创意天赋？',
    sub: '美学感知力和创造力在创意经济中价值日益凸显',
    options: [
      { label: '几乎没有，对艺术不感兴趣', score: 1 },
      { label: '有一般的审美，无特别突出之处', score: 2 },
      { label: '有一定的艺术感知和创意思维', score: 3 },
      { label: '有明显的艺术天赋，某一领域突出', score: 4 },
      { label: '极强，艺术/创意是核心禀赋', score: 5 }
    ]
  },
  {
    id: 34, dim: 'talent',
    text: '你的运动协调能力和体能基础如何？',
    sub: '身体素质影响执行力、精力和社交活动参与度',
    options: [
      { label: '较差，运动协调性低，体能弱', score: 1 },
      { label: '一般，无特别运动天赋', score: 2 },
      { label: '良好，体能不错，协调性较好', score: 3 },
      { label: '优秀，运动能力突出', score: 4 },
      { label: '卓越，有运动天赋，曾获竞技成绩', score: 5 }
    ]
  },
  {
    id: 35, dim: 'talent',
    text: '你的情绪感知力和共情能力如何？',
    sub: '情绪智力（EI）是领导力和人际关系质量的重要预测指标',
    options: [
      { label: '较弱，难以感知自己或他人的情绪', score: 1 },
      { label: '一般，能感知明显情绪', score: 2 },
      { label: '良好，能理解和处理复杂情绪', score: 3 },
      { label: '优秀，共情能力强，善于读懂人心', score: 4 },
      { label: '卓越，情绪洞察力是突出天赋', score: 5 }
    ]
  },
  {
    id: 36, dim: 'talent',
    text: '你是否有数学/理科方面的天赋？',
    sub: 'STEM能力与未来高薪职业路径正相关',
    options: [
      { label: '明显薄弱，数理是短板', score: 1 },
      { label: '一般，勉强应付考试', score: 2 },
      { label: '良好，成绩中等偏上', score: 3 },
      { label: '优秀，数理是强项', score: 4 },
      { label: '卓越，数理天赋突出，竞赛级别', score: 5 }
    ]
  },
  {
    id: 37, dim: 'talent',
    text: '你对新知识/新领域的好奇心和学习动力如何？',
    sub: '智识好奇心是人力资本积累的内在发动机',
    options: [
      { label: '很低，对学习新事物缺乏兴趣', score: 1 },
      { label: '一般，按需学习，缺乏主动', score: 2 },
      { label: '中等，有时会主动探索', score: 3 },
      { label: '较高，喜欢持续学习和探索', score: 4 },
      { label: '极高，终身学习者，好奇心驱动一切', score: 5 }
    ]
  },
  {
    id: 38, dim: 'talent',
    text: '你对规律/模式的识别能力如何？',
    sub: '模式识别是商业直觉和系统思维的基础',
    options: [
      { label: '较弱，难以发现规律', score: 1 },
      { label: '一般，能识别简单模式', score: 2 },
      { label: '良好，能在熟悉领域找到规律', score: 3 },
      { label: '优秀，善于发现跨领域规律', score: 4 },
      { label: '卓越，模式识别是核心优势', score: 5 }
    ]
  },
  {
    id: 39, dim: 'talent',
    text: '你的空间/视觉想象能力如何？',
    sub: '空间智力对工程、设计、建筑等领域影响显著',
    options: [
      { label: '较弱，难以在脑海中构建三维图像', score: 1 },
      { label: '一般', score: 2 },
      { label: '良好，能较好地进行空间想象', score: 3 },
      { label: '优秀，空间思维是强项', score: 4 },
      { label: '卓越，立体想象力极强', score: 5 }
    ]
  },
  {
    id: 40, dim: 'talent',
    text: '你童年时的学业成绩处于什么水平？',
    sub: '早期学业表现是认知能力和努力习惯的综合反映',
    options: [
      { label: '长期处于班级/年级后段', score: 1 },
      { label: '中等偏下', score: 2 },
      { label: '中等水平', score: 3 },
      { label: '班级/年级前段', score: 4 },
      { label: '长期名列前茅，年级第一或竞赛获奖', score: 5 }
    ]
  },
  {
    id: 41, dim: 'talent',
    text: '你的专注力/深度工作能力如何？',
    sub: '专注力是知识经济时代最核心的稀缺资源（Cal Newport, 2016）',
    options: [
      { label: '极差，几乎无法专注超过5分钟', score: 1 },
      { label: '较差，经常分心，效率低下', score: 2 },
      { label: '中等，能专注但容易被打断', score: 3 },
      { label: '较好，能进入深度工作状态', score: 4 },
      { label: '极强，能长时间高度专注', score: 5 }
    ]
  },
  {
    id: 42, dim: 'talent',
    text: '你的多任务处理/并行思考能力如何？',
    sub: '认知灵活性是高复杂度工作的核心能力',
    options: [
      { label: '较弱，只能串行处理，切换成本高', score: 1 },
      { label: '一般，能处理2-3件简单任务', score: 2 },
      { label: '良好，能并行处理多项任务', score: 3 },
      { label: '优秀，多线程思考是强项', score: 4 },
      { label: '卓越，复杂并行处理能力极强', score: 5 }
    ]
  },

  // ===================== 维度四：性格特质（14题） =====================
  {
    id: 43, dim: 'character',
    text: '你的外向性/社交能源如何？',
    sub: '大五人格理论：外向性影响社交网络宽度和机会获取',
    options: [
      { label: '极度内向，社交令我持续消耗', score: 2 },
      { label: '偏内向，倾向独处', score: 3 },
      { label: '内外均衡，灵活适应', score: 4 },
      { label: '偏外向，喜欢社交', score: 4 },
      { label: '极度外向，社交是我的能量来源', score: 3 }
    ]
  },
  {
    id: 44, dim: 'character',
    text: '你的自律性和执行力如何？',
    sub: '尽责性（Conscientiousness）是学业和职业成功最强预测因子之一',
    options: [
      { label: '极差，经常拖延，几乎无法自控', score: 1 },
      { label: '较低，需要外部监督才能完成任务', score: 2 },
      { label: '中等，能完成基本任务但有拖延', score: 3 },
      { label: '较高，有清晰目标且能持续执行', score: 4 },
      { label: '极强，自律是核心竞争力', score: 5 }
    ]
  },
  {
    id: 45, dim: 'character',
    text: '你在高压/逆境下的抗压能力如何？',
    sub: '心理韧性（Resilience）决定在逆境中是崩溃还是成长',
    options: [
      { label: '极差，压力下容易崩溃/放弃', score: 1 },
      { label: '较低，压力大时情绪明显失控', score: 2 },
      { label: '中等，能应对一般压力', score: 3 },
      { label: '较强，高压下仍能保持功能正常', score: 4 },
      { label: '极强，压力是我成长的燃料', score: 5 }
    ]
  },
  {
    id: 46, dim: 'character',
    text: '你的神经质水平（情绪稳定性）如何？',
    sub: '情绪稳定性影响决策质量和人际关系稳定性',
    options: [
      { label: '极高神经质，情绪波动剧烈频繁', score: 1 },
      { label: '较高，容易焦虑、悲观或情绪化', score: 2 },
      { label: '中等，偶有情绪波动但基本可控', score: 3 },
      { label: '较稳定，情绪管理良好', score: 4 },
      { label: '高度稳定，极少情绪化', score: 5 }
    ]
  },
  {
    id: 47, dim: 'character',
    text: '你的冲动性控制能力如何？',
    sub: '延迟满足能力（斯坦福棉花糖实验验证）与长期成就强相关',
    options: [
      { label: '极差，经常冲动行事，无法等待', score: 1 },
      { label: '较差，经常被短期诱惑左右', score: 2 },
      { label: '中等，能在重要场合控制冲动', score: 3 },
      { label: '较好，善于延迟满足', score: 4 },
      { label: '极强，长期主义者，抗诱惑能力强', score: 5 }
    ]
  },
  {
    id: 48, dim: 'character',
    text: '你的亲和力和人际关系质量如何？',
    sub: '亲和性影响合作能力、领导效能和社会资本积累',
    options: [
      { label: '极低，人际关系普遍糟糕', score: 1 },
      { label: '较低，不善于建立良好关系', score: 2 },
      { label: '中等，有正常的人际圈子', score: 3 },
      { label: '较高，能建立深度信任关系', score: 4 },
      { label: '极高，人际魅力是核心优势', score: 5 }
    ]
  },
  {
    id: 49, dim: 'character',
    text: '你对不确定性和变化的适应能力如何？',
    sub: 'VUCA时代，灵活适应性是核心生存能力',
    options: [
      { label: '极差，变化令我高度焦虑和抗拒', score: 1 },
      { label: '较差，需要较长时间适应变化', score: 2 },
      { label: '中等，能逐步适应', score: 3 },
      { label: '较好，对变化有较强适应力', score: 4 },
      { label: '极强，在不确定中找到机会', score: 5 }
    ]
  },
  {
    id: 50, dim: 'character',
    text: '你的进取心和成就动机如何？',
    sub: '麦克利兰成就动机理论：成就需求驱动长期绩效',
    options: [
      { label: '极低，满足现状，缺乏上进心', score: 1 },
      { label: '较低，随遇而安', score: 2 },
      { label: '中等，有基本的上进心', score: 3 },
      { label: '较强，有明确目标并努力追求', score: 4 },
      { label: '极强，强烈的成功欲望是核心驱动', score: 5 }
    ]
  },
  {
    id: 51, dim: 'character',
    text: '你的开放性（接受新思想/体验的意愿）如何？',
    sub: '开放性是创新能力和跨界学习能力的基础',
    options: [
      { label: '极低，保守传统，抗拒新事物', score: 1 },
      { label: '较低，倾向于熟悉路径', score: 2 },
      { label: '中等，有时乐于尝试新事物', score: 3 },
      { label: '较高，对新思想/文化保持开放', score: 4 },
      { label: '极高，终身保持探索者心态', score: 5 }
    ]
  },
  {
    id: 52, dim: 'character',
    text: '你的责任心和可靠性如何？',
    sub: '可信赖性是职场人际关系和晋升机会的核心前提',
    options: [
      { label: '极差，承诺很少兑现', score: 1 },
      { label: '较差，经常不能按时完成任务', score: 2 },
      { label: '一般，基本能履行重要承诺', score: 3 },
      { label: '较高，是团队中可信赖的成员', score: 4 },
      { label: '极强，责任心是他人对我的一致评价', score: 5 }
    ]
  },
  {
    id: 53, dim: 'character',
    text: '你的风险偏好（面对高风险高回报机会时）？',
    sub: '适度的风险承担能力与企业家精神高度相关',
    options: [
      { label: '极度规避风险，宁可不赚也不冒险', score: 2 },
      { label: '偏保守，只接受极低风险', score: 3 },
      { label: '中等，愿意承担经过计算的风险', score: 5 },
      { label: '偏激进，喜欢挑战高风险机会', score: 3 },
      { label: '极度冒险，不计后果押注', score: 2 }
    ]
  },
  {
    id: 54, dim: 'character',
    text: '你的自我效能感（相信自己能做成事）如何？',
    sub: '班杜拉自我效能理论：自我效能是行动力的源头',
    options: [
      { label: '极低，经常怀疑自己什么都做不好', score: 1 },
      { label: '较低，自信不足', score: 2 },
      { label: '中等，大多数时候相信自己', score: 3 },
      { label: '较高，对自己的能力有信心', score: 4 },
      { label: '极高，无论多难都相信自己能找到路', score: 5 }
    ]
  },
  {
    id: 55, dim: 'character',
    text: '你的谦逊/自我客观认知能力如何？',
    sub: '谦逊与自我认知准确性是持续成长的前提（Dunning-Kruger效应）',
    options: [
      { label: '极低，严重高估自己或极度自卑', score: 1 },
      { label: '较低，自我认知明显偏差', score: 2 },
      { label: '中等，基本能客观看待自己', score: 3 },
      { label: '较高，能准确评估自己的优劣势', score: 4 },
      { label: '极高，谦逊且高度自省', score: 5 }
    ]
  },
  {
    id: 56, dim: 'character',
    text: '你的长期主义倾向（愿意为长远收益延迟满足）？',
    sub: '跨期选择理论：长期导向与人生累积回报高度相关',
    options: [
      { label: '极度短期主义，只看眼前利益', score: 1 },
      { label: '偏短期，难以为长远牺牲当下', score: 2 },
      { label: '中等，能平衡短期和长期', score: 3 },
      { label: '偏长期，愿意为未来投资', score: 4 },
      { label: '极度长期主义，以十年为单位规划', score: 5 }
    ]
  },

  // ===================== 维度五：时代大环境（12题） =====================
  {
    id: 57, dim: 'era',
    text: '你出生的年代？',
    sub: '经济周期与代际机会窗口影响一生的大背景',
    options: [
      { label: '1950-1964（文革一代，机会被中断）', score: 2 },
      { label: '1965-1979（改革开放前期，机会渐开）', score: 3 },
      { label: '1980-1989（人口红利+市场化，黄金一代）', score: 5 },
      { label: '1990-1999（互联网+城镇化红利）', score: 5 },
      { label: '2000-2009（增速放缓，内卷加剧）', score: 3 }
    ]
  },
  {
    id: 58, dim: 'era',
    text: '你成长期所在地区的经济发展水平？',
    sub: '区域经济差异决定机会集中度',
    options: [
      { label: '欠发达地区，经济落后', score: 1 },
      { label: '一般发展地区', score: 2 },
      { label: '中等发展地区', score: 3 },
      { label: '较发达地区', score: 4 },
      { label: '高度发达地区（长三角/珠三角/京津冀）', score: 5 }
    ]
  },
  {
    id: 59, dim: 'era',
    text: '你所在或擅长的行业，近年来处于什么周期？',
    sub: '行业周期决定个人努力的放大系数',
    options: [
      { label: '严重衰退行业（煤炭传统制造等）', score: 1 },
      { label: '缓慢衰退或停滞', score: 2 },
      { label: '平稳运行，无明显上升下降', score: 3 },
      { label: '成长型行业，保持增势', score: 4 },
      { label: '爆发型风口行业（AI/新能源/生物等）', score: 5 }
    ]
  },
  {
    id: 60, dim: 'era',
    text: '你是否抓住过时代性的政策/行业红利？',
    sub: '政策套利是中国特色社会流动的重要机制',
    options: [
      { label: '完全没有，一直错过机会', score: 1 },
      { label: '偶尔小红利，影响有限', score: 2 },
      { label: '抓住了1-2次一般性机会', score: 3 },
      { label: '抓住了重要行业/政策红利', score: 4 },
      { label: '多次精准抓住时代红利，显著获益', score: 5 }
    ]
  },
  {
    id: 61, dim: 'era',
    text: '你所处的城镇化阶段对你有什么影响？',
    sub: '城镇化进程创造了大量社会流动机会',
    options: [
      { label: '完全没享受到城镇化红利', score: 1 },
      { label: '有少许受益（农转城等）', score: 2 },
      { label: '中等受益（大城市务工/学习）', score: 3 },
      { label: '较大受益（早期置业/创业）', score: 4 },
      { label: '极大受益（先行者，抓住了最大红利）', score: 5 }
    ]
  },
  {
    id: 62, dim: 'era',
    text: '你的就业/创业时间节点如何？',
    sub: '毕业即入职的经济周期对初始薪酬影响长达10年',
    options: [
      { label: '经济危机/衰退期入场（2002/2008/2020）', score: 2 },
      { label: '普通年份进入职场', score: 3 },
      { label: '经济上行期进入职场', score: 4 },
      { label: '行业高速增长期进入', score: 5 },
      { label: '尚未就业/在校', score: 3 }
    ]
  },
  {
    id: 63, dim: 'era',
    text: '你是否受益于互联网/数字化红利？',
    sub: '数字经济重构了知识传播、创业门槛和收入结构',
    options: [
      { label: '几乎没有，与互联网关联极低', score: 1 },
      { label: '有一些，但受益有限', score: 2 },
      { label: '一般性受益（学习/便利生活）', score: 3 },
      { label: '较大受益（互联网从业/电商创业）', score: 4 },
      { label: '核心受益者（早期互联网人/数字原住民）', score: 5 }
    ]
  },
  {
    id: 64, dim: 'era',
    text: '你的性别/社会文化环境对职业发展的影响？',
    sub: '性别与社会规范仍在影响职业机会和上升通道',
    options: [
      { label: '明显受制，性别障碍导致大量机会流失', score: 1 },
      { label: '有一些隐性障碍', score: 2 },
      { label: '基本中性，无明显影响', score: 3 },
      { label: '略有优势', score: 4 },
      { label: '性别/社会背景为我创造了额外优势', score: 5 }
    ]
  },
  {
    id: 65, dim: 'era',
    text: '你所在地区的教育竞争烈度如何？',
    sub: '高竞争地区形成高密度筛选，影响资质分配效率',
    options: [
      { label: '极低竞争，资源匮乏但门槛也低', score: 2 },
      { label: '低竞争，相对容易出头', score: 3 },
      { label: '中等竞争，需要认真努力', score: 3 },
      { label: '高度竞争，需要付出极大努力', score: 4 },
      { label: '极度内卷（衡中/上海/北京模式）', score: 3 }
    ]
  },
  {
    id: 66, dim: 'era',
    text: '你认为你所处的时代对你总体而言是？',
    sub: '综合时代感知，反映个人与时代互动的主观评价',
    options: [
      { label: '极不友好，时代是我的障碍', score: 1 },
      { label: '总体不利，机会少竞争大', score: 2 },
      { label: '中性，有机会也有挑战', score: 3 },
      { label: '总体有利，努力有回报', score: 4 },
      { label: '极为顺势，我和时代共振', score: 5 }
    ]
  },
  {
    id: 67, dim: 'era',
    text: '你是否受益于全球化/国际贸易红利？',
    sub: '全球化是过去30年最重要的时代红利之一',
    options: [
      { label: '完全未受益，甚至因全球化受损', score: 1 },
      { label: '受益极少', score: 2 },
      { label: '中等受益（出口行业/跨国企业就业）', score: 3 },
      { label: '较大受益（外贸/跨境电商/国际组织）', score: 4 },
      { label: '核心受益者（全球流动人才/跨国精英）', score: 5 }
    ]
  },
  {
    id: 68, dim: 'era',
    text: '你对未来10年的技术变革（AI/自动化）持何态度？',
    sub: '技术变革的适应力决定未来20年的竞争力',
    options: [
      { label: '恐惧，认为会被淘汰', score: 1 },
      { label: '担忧，但不确定如何应对', score: 2 },
      { label: '中性，观望中', score: 3 },
      { label: '积极，正在学习适应新技术', score: 4 },
      { label: '兴奋，视其为巨大机会', score: 5 }
    ]
  },

  // ===================== 维度六：身心健康（12题） =====================
  // 科学基础：Grossman健康资本模型、流行病学、健康经济学
  {
    id: 69, dim: 'health',
    text: '你出生时的体重和早期发育状况如何？',
    sub: '流行病学研究证实：出生体重与成年后健康资本、认知能力显著相关',
    options: [
      { label: '低出生体重（<2.5kg）或有严重新生儿问题', score: 1 },
      { label: '偏低，早期发育有些迟缓', score: 2 },
      { label: '正常，无特殊问题', score: 3 },
      { label: '良好，发育指标优于平均', score: 4 },
      { label: '优秀，出生状况极佳', score: 5 }
    ]
  },
  {
    id: 70, dim: 'health',
    text: '你是否有长期的慢性疾病或健康问题？',
    sub: '健康资本是人力资本的重要组成部分（Grossman, 1972）',
    options: [
      { label: '有多种慢性疾病，严重影响生活', score: 1 },
      { label: '有1-2种需要长期管理的慢性病', score: 2 },
      { label: '有一些小毛病，但不影响正常生活', score: 3 },
      { label: '基本健康，偶尔感冒等小病', score: 4 },
      { label: '极其健康，几乎从不生病', score: 5 }
    ]
  },
  {
    id: 71, dim: 'health',
    text: '你的心理健康状况如何？',
    sub: 'WHO数据显示：心理健康问题导致全球每年损失约 1 万亿美元生产力',
    options: [
      { label: '有确诊的心理健康疾病（抑郁/焦虑等）', score: 1 },
      { label: '经常感到抑郁、焦虑或情绪困扰', score: 2 },
      { label: '基本稳定，但偶尔有情绪波动', score: 3 },
      { label: '良好，心理健康状况稳定', score: 4 },
      { label: '极佳，心理韧性高且情绪健康', score: 5 }
    ]
  },
  {
    id: 72, dim: 'health',
    text: '你的精力和体力水平如何？',
    sub: '精力资本直接影响工作产出和机会把握能力',
    options: [
      { label: '经常疲劳，精力严重不足', score: 1 },
      { label: '偏低，容易感到疲倦', score: 2 },
      { label: '中等，基本能满足日常需求', score: 3 },
      { label: '良好，精力充沛，能应对高强度工作', score: 4 },
      { label: '极强，精力旺盛，不知疲倦', score: 5 }
    ]
  },
  {
    id: 73, dim: 'health',
    text: '你的睡眠质量如何？',
    sub: '睡眠与认知功能、情绪调节、免疫功能高度相关（Walker, 2017）',
    options: [
      { label: '长期失眠或睡眠质量极差', score: 1 },
      { label: '睡眠较浅，经常醒或早醒', score: 2 },
      { label: '一般，偶尔有睡眠问题', score: 3 },
      { label: '良好，入睡快且睡眠深沉', score: 4 },
      { label: '极佳，睡眠是我的恢复利器', score: 5 }
    ]
  },
  {
    id: 74, dim: 'health',
    text: '你的饮食习惯和体重管理如何？',
    sub: '饮食质量与慢性疾病风险、认知衰退速度显著相关',
    options: [
      { label: '饮食极不健康，肥胖或严重营养不良', score: 1 },
      { label: '饮食较差，体重明显偏离健康范围', score: 2 },
      { label: '饮食一般，体重在可接受范围', score: 3 },
      { label: '饮食健康，体重管理良好', score: 4 },
      { label: '极健康，科学饮食且体重理想', score: 5 }
    ]
  },
  {
    id: 75, dim: 'health',
    text: '你的运动习惯如何？',
    sub: '运动与认知功能、情绪健康、寿命延长均有强相关证据',
    options: [
      { label: '几乎不运动，久坐生活方式', score: 1 },
      { label: '偶尔运动，但极不规律', score: 2 },
      { label: '有一定运动，但频率和强度不足', score: 3 },
      { label: '规律运动，每周2-3次', score: 4 },
      { label: '高度自律，每周4次以上且形式多样', score: 5 }
    ]
  },
  {
    id: 76, dim: 'health',
    text: '你的家族遗传病史情况如何？',
    sub: '遗传风险是健康资本的重要决定因素',
    options: [
      { label: '家族有严重遗传病或多发慢性病', score: 1 },
      { label: '家族有1-2种比较严重的遗传风险', score: 2 },
      { label: '家族病史一般，有一些常见病', score: 3 },
      { label: '家族健康状况良好，少有严重疾病', score: 4 },
      { label: '家族长寿且极少严重疾病', score: 5 }
    ]
  },
  {
    id: 77, dim: 'health',
    text: '你的外貌/身体吸引力如何？',
    sub: '身体吸引力在职场、婚恋中的"光环效应"已被大量研究证实',
    options: [
      { label: '明显低于平均，常因外貌受到负面对待', score: 1 },
      { label: '偏低，外貌是我的劣势', score: 2 },
      { label: '中等，不起眼但也不差', score: 3 },
      { label: '较好，外貌是我的优势之一', score: 4 },
      { label: '极好，外貌是显著优势（"颜值红利"）', score: 5 }
    ]
  },
  {
    id: 78, dim: 'health',
    text: '你的健康管理和预防意识如何？',
    sub: '预防医学证实：早期筛查和健康管理的ROI可达 1:10 以上',
    options: [
      { label: '几乎不关注健康，生病才就医', score: 1 },
      { label: '较少关注，缺乏健康知识', score: 2 },
      { label: '基本关注，偶尔体检', score: 3 },
      { label: '较关注，定期体检且有健康计划', score: 4 },
      { label: '极度重视，系统化健康管理（体检/营养/运动）', score: 5 }
    ]
  },
  {
    id: 79, dim: 'health',
    text: '你的物质使用习惯（烟酒/药物）如何？',
    sub: '物质使用是健康资本的重要减损因素',
    options: [
      { label: '有严重的物质依赖问题', score: 1 },
      { label: '经常吸烟/过量饮酒/滥用药物', score: 2 },
      { label: '偶尔饮酒，无严重物质使用问题', score: 3 },
      { label: '极少饮酒，不吸烟，无药物滥用', score: 4 },
      { label: '完全不使用有害物质，生活方式极健康', score: 5 }
    ]
  },
  {
    id: 80, dim: 'health',
    text: '你的日常压力水平和应对机制如何？',
    sub: '慢性压力会导致皮质醇持续升高，损害海马体（Sapolsky, 2004）',
    options: [
      { label: '长期处于极高压力状态，无有效应对机制', score: 1 },
      { label: '压力较大，应对方式不健康（逃避/物质使用）', score: 2 },
      { label: '中等压力，有一些应对方法', score: 3 },
      { label: '压力管理较好，有健康的应对机制', score: 4 },
      { label: '压力管理能力极强，能在高压下保持冷静', score: 5 }
    ]
  },

  // ===================== 维度七：机遇把握（12题） =====================
  // 科学基础：主动人格理论（Bateman&Grant, 1993）、控制点理论（Rotter, 1966）
  {
    id: 81, dim: 'action',
    text: '当发现一个潜在机会时，你通常会？',
    sub: '主动人格（Proactive Personality）是职业成功的重要预测因子',
    options: [
      { label: '观望，等别人先行动再说', score: 1 },
      { label: '思考很久，很少真正行动', score: 2 },
      { label: '会认真评估，有机会才行动', score: 3 },
      { label: '较快行动，不愿错过机会', score: 4 },
      { label: '立即行动，机会意识极强', score: 5 }
    ]
  },
  {
    id: 82, dim: 'action',
    text: '你的决策速度和决策质量如何？',
    sub: '决策科学：在不确定性环境中，决策速度有时比完美决策更重要',
    options: [
      { label: '极度犹豫不决，经常错过时机', score: 1 },
      { label: '决策较慢，需要大量信息才敢决定', score: 2 },
      { label: '中等，能在合理时间内做出决定', score: 3 },
      { label: '决策较快，且质量较高', score: 4 },
      { label: '决策极快且极准，是核心能力', score: 5 }
    ]
  },
  {
    id: 83, dim: 'action',
    text: '面对不确定性时，你的典型反应是？',
    sub: '不确定性容忍度（Intolerance of Uncertainty）影响机会把握能力',
    options: [
      { label: '极度回避不确定性，只做百分百确定的事', score: 1 },
      { label: '较低，需要高度确定性才行动', score: 2 },
      { label: '中等，能在一定不确定性下行动', score: 3 },
      { label: '较高，能在高度不确定下做决策', score: 4 },
      { label: '极高，在不确定性中看到机会', score: 5 }
    ]
  },
  {
    id: 84, dim: 'action',
    text: '你的"控制点"（你认为自己能控制命运的程度）？',
    sub: '控制点理论（Locus of Control, Rotter, 1966）：内控者比外控者成就显著更高',
    options: [
      { label: '极端外控：一切都是命运/运气/他人决定', score: 1 },
      { label: '偏外控：我认为自己能影响的结果很有限', score: 2 },
      { label: '中等：内外控平衡', score: 3 },
      { label: '偏内控：我相信自己能很大程度上改变结果', score: 4 },
      { label: '极端内控：我的人生完全由我掌控', score: 5 }
    ]
  },
  {
    id: 85, dim: 'action',
    text: '当遇到障碍时，你的第一反应是？',
    sub: '坚韧力（Grit, Duckworth, 2007）是长期成就的更强预测因子',
    options: [
      { label: '立即放弃或寻找借口', score: 1 },
      { label: '尝试一下，不行就放弃', score: 2 },
      { label: '会坚持一段时间，但可能放弃', score: 3 },
      { label: '坚持较长时间，寻找替代方案', score: 4 },
      { label: '永不放弃，障碍激发我的创造力', score: 5 }
    ]
  },
  {
    id: 86, dim: 'action',
    text: '你主动寻求反馈和批评的能力如何？',
    sub: '反馈寻求行为（Feedback Seeking Behavior）是职业学习能力的关键指标',
    options: [
      { label: '极度回避反馈，只愿意听赞美', score: 1 },
      { label: '不太愿意主动寻求反馈', score: 2 },
      { label: '偶尔寻求反馈，但有些防御性', score: 3 },
      { label: '主动寻求反馈，用于改进自己', score: 4 },
      { label: '极度渴望反馈，视批评为礼物', score: 5 }
    ]
  },
  {
    id: 87, dim: 'action',
    text: '你的网络构建（Networking）主动性和能力如何？',
    sub: '弱关系理论（Granovetter, 1973）：80%的好工作来自弱关系而非强关系',
    options: [
      { label: '极度内向，几乎不主动建立新关系', score: 1 },
      { label: '较少主动，主要依赖已有关系', score: 2 },
      { label: '中等，会在需要时建立新关系', score: 3 },
      { label: '较主动，持续扩展人脉网络', score: 4 },
      { label: '极度主动，网络构建是核心能力', score: 5 }
    ]
  },
  {
    id: 88, dim: 'action',
    text: '你从想法到行动的典型时间延迟是？',
    sub: '执行功能（Executive Function）的核心指标：想法→行动的转换速度',
    options: [
      { label: '极度拖延，想法很少转化为行动', score: 1 },
      { label: '较慢，想法经常停留在计划阶段', score: 2 },
      { label: '中等，能在合理时间内开始执行', score: 3 },
      { label: '较快，想法能迅速转化为行动', score: 4 },
      { label: '极快，想到就做，执行力极强', score: 5 }
    ]
  },
  {
    id: 89, dim: 'action',
    text: '你对自己时间的掌控和管理能力如何？',
    sub: '时间自主性是职业控制感的核心维度（Kalleberg, 2008）',
    options: [
      { label: '时间完全被他人掌控，毫无自主性', score: 1 },
      { label: '时间自主性较低，经常被干扰', score: 2 },
      { label: '中等，有一定时间掌控能力', score: 3 },
      { label: '较高，能较好地管理自己的时间', score: 4 },
      { label: '极高，时间是我的核心资产且管理极佳', score: 5 }
    ]
  },
  {
    id: 90, dim: 'action',
    text: '你是否经常主动承担超出职责范围的工作？',
    sub: '角色创新行为（Role Innovation）是职业晋升的重要预测因子',
    options: [
      { label: '从不，只做被要求的最低限度', score: 1 },
      { label: '很少，尽量避免额外工作', score: 2 },
      { label: '偶尔，在有利情况下会多做一些', score: 3 },
      { label: '经常，主动寻找增加价值的机会', score: 4 },
      { label: '总是，不断重新定义和扩展自己的角色', score: 5 }
    ]
  },
  {
    id: 91, dim: 'action',
    text: '你从失败中恢复并再次尝试的速度如何？',
    sub: '失败复原力（Failure Resilience）是创业者和创新者的核心特质',
    options: [
      { label: '一次失败就长期不敢再尝试', score: 1 },
      { label: '恢复很慢，需要很长时间才能再次尝试', score: 2 },
      { label: '需要一些时间，但最终能再次尝试', score: 3 },
      { label: '恢复较快，能迅速从失败中学习', score: 4 },
      { label: '极快，失败立即转化为下一次行动的能量', score: 5 }
    ]
  },
  {
    id: 92, dim: 'action',
    text: '你是否有明确的短期（1年）和长期（5-10年）目标并持续推进？',
    sub: '目标设定理论（Goal-setting Theory, Locke & Latham, 1990）是动机心理学的基石',
    options: [
      { label: '完全没有目标，走一步看一步', score: 1 },
      { label: '有模糊方向，但无明确目标', score: 2 },
      { label: '有基本目标，但执行不持续', score: 3 },
      { label: '有清晰目标，且持续推进', score: 4 },
      { label: '有极致清晰的目标体系，且执行极其坚决', score: 5 }
    ]
  }
];
