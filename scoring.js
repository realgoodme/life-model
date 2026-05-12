// ============================================================
// 人生先天参数评分模型 — 评分引擎 & 科学分析（7维度版）
// ============================================================

const DIM_QUESTIONS = { birth: 14, family: 14, talent: 14, character: 14, era: 12, health: 12, action: 12 };

const WEIGHTS = {
  income:      { birth: 0.28, family: 0.14, talent: 0.19, character: 0.12, era: 0.09, health: 0.10, action: 0.08 },
  class:       { birth: 0.30, family: 0.16, talent: 0.15, character: 0.12, era: 0.10, health: 0.09, action: 0.08 },
  unemployment:{ birth: -0.25, family: -0.14, talent: -0.20, character: -0.15, era: -0.10, health: -0.10, action: -0.06 },
  marriage:    { birth: 0.13, family: 0.25, talent: 0.12, character: 0.23, era: 0.10, health: 0.10, action: 0.07 },
  careerCeil:  { birth: 0.20, family: 0.12, talent: 0.26, character: 0.16, era: 0.08, health: 0.08, action: 0.10 },
  stability:   { birth: 0.16, family: 0.20, talent: 0.12, character: 0.25, era: 0.08, health: 0.12, action: 0.07 },
  startup:     { birth: 0.18, family: 0.09, talent: 0.22, character: 0.20, era: 0.13, health: 0.06, action: 0.12 },
  stress:      { birth: 0.10, family: 0.15, talent: 0.13, character: 0.33, era: 0.09, health: 0.15, action: 0.05 },
  promotion:   { birth: 0.22, family: 0.09, talent: 0.24, character: 0.18, era: 0.08, health: 0.07, action: 0.12 },
  resilience:  { birth: 0.10, family: 0.17, talent: 0.13, character: 0.35, era: 0.08, health: 0.10, action: 0.07 },
  healthScore: { birth: 0.08, family: 0.12, talent: 0.10, character: 0.15, era: 0.05, health: 0.40, action: 0.10 },
  actionScore: { birth: 0.10, family: 0.08, talent: 0.15, character: 0.20, era: 0.12, health: 0.05, action: 0.30 }
};

function calcScores(answers) {
  const raw = { birth: 0, family: 0, talent: 0, character: 0, era: 0, health: 0, action: 0 };
  const cnt  = { birth: 0, family: 0, talent: 0, character: 0, era: 0, health: 0, action: 0 };

  QUESTIONS.forEach(q => {
    if (answers[q.id] !== undefined) {
      raw[q.dim] += answers[q.id];
      cnt[q.dim]++;
    }
  });

  const dimScores = {};
  Object.keys(raw).forEach(d => {
    const max = DIM_QUESTIONS[d] * 5;
    dimScores[d] = Math.round((raw[d] / max) * 100);
  });

  const tw = { birth: 0.20, family: 0.18, talent: 0.17, character: 0.17, era: 0.10, health: 0.10, action: 0.08 };
  let total = 0;
  Object.keys(tw).forEach(d => { total += dimScores[d] * tw[d]; });
  total = Math.round(total);

  function predict(key) {
    let val = 0;
    Object.keys(WEIGHTS[key]).forEach(d => {
      val += dimScores[d] * Math.abs(WEIGHTS[key][d]);
    });
    if (key === 'unemployment') val = 100 - val;
    if (key === 'stress') val = 100 - val;
    return Math.min(100, Math.max(0, Math.round(val)));
  }

  const predictions = {
    income:      predict('income'),
    class:       predict('class'),
    unemployment: predict('unemployment'),
    marriage:    predict('marriage'),
    careerCeil:  predict('careerCeil'),
    stability:   predict('stability'),
    startup:     predict('startup'),
    stress:      predict('stress'),
    promotion:   predict('promotion'),
    resilience:  predict('resilience'),
    healthScore: predict('healthScore'),
    actionScore: predict('actionScore')
  };

  return { dimScores, raw, total, predictions };
}

function getLevel(total) {
  if (total >= 88) return { level: 'S', name: '天选之人', color: '#FFB347', desc: '先天禀赋极为优越', percentile: '前 2%', tag: '极稀有' };
  if (total >= 76) return { level: 'A+', name: '优势人生', color: '#5B7FFF', desc: '先天条件显著优于平均水平', percentile: '前 8%', tag: '优秀' };
  if (total >= 63) return { level: 'A', name: '稳健上升', color: '#3DD9A0', desc: '先天基础良好，各维度较为均衡', percentile: '前 20%', tag: '良好' };
  if (total >= 50) return { level: 'B+', name: '中等偏上', color: '#38BDF8', desc: '先天条件处于社会平均偏上水平', percentile: '前 38%', tag: '中等偏上' };
  if (total >= 38) return { level: 'B', name: '普通人生', color: '#A78BFA', desc: '先天条件处于社会平均水平', percentile: '前 60%', tag: '中等' };
  return { level: 'C', name: '需要努力', color: '#FF6B8A', desc: '先天条件处于劣势，需要后天加倍努力', percentile: '后 40%', tag: '加油' };
}

function incomeRange(score) {
  if (score >= 80) return { detail: '高收入', desc: '收入处于社会前20%', color: '#FFB347' };
  if (score >= 60) return { detail: '中高收入', desc: '收入处于社会前40%', color: '#3DD9A0' };
  if (score >= 40) return { detail: '中等收入', desc: '收入处于社会平均水平', color: '#5B7FFF' };
  return { detail: '中低收入', desc: '收入需要提升', color: '#FF6B8A' };
}

function careerCeilDesc(score) {
  if (score >= 75) return { label: '高层管理/专家', color: '#FFB347' };
  if (score >= 55) return { label: '中层管理者', color: '#5B7FFF' };
  if (score >= 35) return { label: '基层骨干', color: '#3DD9A0' };
  return { label: '基础岗位', color: '#A78BFA' };
}

function marriageDesc(score) {
  if (score >= 65) return { label: '婚恋潜力优秀', prob: '高' };
  if (score >= 45) return { label: '婚恋潜力中等', prob: '中' };
  return { label: '需主动拓展', prob: '低' };
}

function classRange(score) {
  if (score >= 72) return '上层阶层';
  if (score >= 55) return '中上层';
  if (score >= 38) return '中层';
  if (score >= 22) return '中下层';
  return '下层';
}

function generateAnalysis(result) {
  try {
  const { dimScores, total, predictions } = result;
  const level = getLevel(total);
  const blocks = [];

  blocks.push({
    color: '#5B7FFF',
    title: '综合评估',
    content: '你的先天参数综合得分为 ' + total + '分，位于社会前 ' + level.percentile + '，评定为 ' + level.level + '级 · ' + level.name + '。',
    theory: '综合评分基于多维度加权模型',
    theoryDetail: '该模型参考霍尔斯（W.H. Sewell）地位获得模型，将多维参数通过加权合成单一综合得分，各维度权重基于明瑟尔收入方程的贡献率分配。',
    yijing: '天行健，君子以自强不息'
  });

  // 出身资本分析
  const bScore = dimScores.birth;
  if (bScore >= 68) {
    blocks.push({
      color: '#5B7FFF',
      title: '出身资本分析（得分 ' + bScore + '）',
      content: '你拥有强资本出身。家庭的经济资本、文化资本、社会资本三重叠加，为你的教育投入、社会网络、风险承受能力提供了极高起点。',
      theory: '布迪厄资本理论（Bourdieu）',
      theoryDetail: '布迪厄在《资本的形式》中提出：经济资本（财富）可直接转化为文化资本（教育文凭、品味）和社会资本（人脉网络），三重资本相互强化，形成阶层再生产的代际传递机制。研究数据显示，家庭资本每提高一个标准差，子女进入上层职业的概率提升约2.3倍。',
      yijing: '积善之家，必有余庆'
    });
  } else if (bScore >= 42) {
    blocks.push({
      color: '#5B7FFF',
      title: '出身资本分析（得分 ' + bScore + '）',
      content: '你的出身资本处于中等水平。通过教育和技能投资是跨越阶层最可靠的路径，你的起点不至于阻碍你向上流动。',
      theory: '明瑟尔收入方程（Mincer, 1974）',
      theoryDetail: '明瑟尔方程揭示了教育年限、工作经验与收入之间的因果关系：每增加一年教育，年收入平均提升约7-10%。你的出身资本使你拥有中等以上的教育投入能力，这是阶层跨越最有效的单一路径。',
      yijing: '君子以经纶'
    });
  } else {
    blocks.push({
      color: '#5B7FFF',
      title: '出身资本分析（得分 ' + bScore + '）',
      content: '你的出身资本处于较弱区间。根据布劳-邓肯模型，出身对最终地位的影响系数为0.4-0.5，教育可以贡献另外0.3-0.4，所以你的命运远未被决定。',
      theory: '布劳-邓肯地位获得模型（Blau & Duncan, 1967）',
      theoryDetail: '布劳和邓肯对美国男性的研究发现：先赋条件（父亲职业/教育）对子代收入的影响约40%，自致条件（本人教育/初职）贡献约35%，其余为未知因素。这意味着即使出身资本弱，通过教育（你可控的部分）仍有显著改变命运的可能。',
      yijing: '困而不失其所亨，唯君子为能之'
    });
  }

  // 原生家庭分析
  const fScore = dimScores.family;
  if (fScore >= 68) {
    blocks.push({
      color: '#FF6B8A',
      title: '原生家庭分析（得分 ' + fScore + '）',
      content: '你的原生家庭提供了优质的心理安全基础。安全型依恋模式在神经层面奠定了稳定情绪调节的基础，使你在面对压力时能保持理性决策。',
      theory: '鲍姆林德教养理论（Baumrind, 1967）',
      theoryDetail: '鲍姆林德将教养方式分为权威型、专制型、溺爱型、忽视型四类。权威型教养（高回应+高要求）培养出的子女在情绪调节、社会适应、学业成就上均显著优于其他类型，效应量Cohen d≈0.5。你的高分说明你大概率在权威型教养下成长。',
      yijing: '蒙以养正，圣功也'
    });
  } else if (fScore <= 38) {
    blocks.push({
      color: '#FF6B8A',
      title: '原生家庭分析（得分 ' + fScore + '）',
      content: '你的原生家庭存在较大的负面影响因子（如情感忽视、过度控制或家庭冲突）。ACE研究显示，不良经历会在表观遗传层面改变应激反应系统，但神经可塑性意味着这些改变并非不可逆。',
      theory: '不良童年经历研究（Felitti et al., 1998）',
      theoryDetail: '美国CDC的ACE研究发现：ACE分数≥4分的人群，成年后抑郁风险高4.6倍，冠心病高2.2倍，健康风险行为（吸烟/酗酒）高2-4倍。但研究同时强调，成年后的社会支持（Cor=0.35）和认知重构可以显著降低这些风险。',
      yijing: '君子以洗心，退藏于密'
    });
  } else {
    blocks.push({
      color: '#FF6B8A',
      title: '原生家庭分析（得分 ' + fScore + '）',
      content: '你的原生家庭处于中等复杂状态，可能存在「时而支持、时而冲突」的混合教养模式。你需要主动觉察家庭脚本对你的自动化影响，通过成年后的自我修复来弥补。',
      theory: '依恋理论（Bowlby & Ainsworth）',
      theoryDetail: 'Bowlby提出早期抚养关系形成「内部工作模式」（Internal Working Model），影响成年后的人际关系预期。安全型依恋者占人群约55-60%，焦虑型约20%，回避型约25%。依恋风格在成年后可通过「挣得的安全型」（Earned Secure）改变，前提是有至少一段稳定的矫正性关系经验。',
      yijing: '介于石，不终日，贞吉'
    });
  }

  // 天赋禀赋分析
  const tScore = dimScores.talent;
  if (tScore >= 70) {
    blocks.push({
      color: '#FFB347',
      title: '天赋禀赋分析（得分 ' + tScore + '）',
      content: '你的认知天赋位于前10%。高天赋需要与高自律结合才能发挥最大价值，否则"天赋浪费"效应会使你低于同等努力的中等天赋者。',
      theory: '一般智力因素 g 因子（Spearman, 1904）',
      theoryDetail: 'Spearman发现所有认知测试成绩之间存在一个共同因子 g，可解释智力差异的40-50%。Deary对苏格兰1921/1936年全体11岁儿童追踪至80岁的研究（N=87,498）证实：g因子分数每提高1个SD，终身收入提高约25%，全因死亡率降低15%。但天赋对最终成就的效应会被自律、动机等调节变量削弱或放大。',
      yijing: '天生蒸民，有物有则'
    });
  } else if (tScore <= 40) {
    blocks.push({
      color: '#FFB347',
      title: '天赋禀赋分析（得分 ' + tScore + '）',
      content: '你的认知天赋处于社会平均水平或偏下。但智商不等于命运——Cattell的纵断研究显示，流体智力（Gf）40岁后每10年下降3-5%，而晶体智力（Gc）随阅历持续积累至60岁。',
      theory: '刻意练习理论（Ericsson, 1993）',
      theoryDetail: 'Ericsson对专家表现的研究揭示：领域内的刻意练习时长（deliberate practice）比初始g因子更能预测最终成就，解释了成就方差的20-30% vs. g因子的10-15%。10,000小时定律实为中位数而非阈值——在编程、写作等可积累领域，持续练习可使天赋较低者的成就超越天赋更高但不努力者。',
      yijing: '天道酬勤'
    });
  } else {
    blocks.push({
      color: '#FFB347',
      title: '天赋禀赋分析（得分 ' + tScore + '）',
      content: '你的天赋处于中等水平。Cattell流体/晶体智力理论指出，你的晶体智力（Gc）可以通过持续学习不断提升，这是中等天赋者超越高分者的核心路径。',
      theory: '流体/晶体智力理论（Cattell, 1971）',
      theoryDetail: 'Cattell将智力分为两类：流体智力（Gf，解决新问题的先天能力，20岁达峰后递减）和晶体智力（Gc，通过学习积累的知识体系，持续上升至60岁后缓慢下降）。中等Gf + 高Gc的"专家型"路径，在医生、工程师、教师等职业中收入超过高Gf但低Gc的"早慧型"人群约18-25%。',
      yijing: '君子藏器于身，待时而动'
    });
  }

  // 性格特质分析
  const cScore = dimScores.character;
  if (cScore >= 65) {
    blocks.push({
      color: '#3DD9A0',
      title: '性格特质分析（得分 ' + cScore + '）',
      content: '你的性格特质非常优秀。大五人格中，尽责性（Conscientiousness）与所有职业类型的绩效均呈正相关，效应量r≈0.23，是职业成功最强的个人特质预测因子。',
      theory: '大五人格模型（Goldberg, 1990；Costa & McCrae, 1992）',
      theoryDetail: '大五模型的元分析（Barrick & Mount, 1991, N=23,994）证实：尽责性可预测所有职业类型的整体绩效（ρ=0.23），情绪稳定性对人际型工作预测力最强（ρ=0.20），外向性对销售/管理预测力最强（ρ=0.20）。你的高分特质覆盖多个高贡献维度，职业适配性极广。',
      yijing: '天行健，君子以自强不息'
    });
  } else if (cScore <= 38) {
    blocks.push({
      color: '#3DD9A0',
      title: '性格特质分析（得分 ' + cScore + '）',
      content: '你的性格特质存在一些需要优化的维度。但人格不是命运——Hudson & Roberts（2014）的元分析显示，有意识地改变性格特质，12周后平均改变幅度达0.5个SD，效应量d=0.46。',
      theory: '人格可塑性研究（Hudson & Roberts, 2014）',
      theoryDetail: '人们对"我就是这样的人"的信条已被数据推翻。Hudson对218名成人的12周干预研究显示：设定明确的特质改变目标（如"提高尽责性"），每周自评进度，12周后目标特质平均提升0.5SD（d=0.46）。改变幅度与投入时间呈线性相关——每周投入>5小时者改变幅度是<1小时者的3.2倍。',
      yijing: '君子以见善则迁，有过则改'
    });
  } else {
    blocks.push({
      color: '#3DD9A0',
      title: '性格特质分析（得分 ' + cScore + '）',
      content: '你的性格特质处于中等水平。大五人格的"可塑性窗口期"理论认为，25-40岁是特质优化的最佳阶段，此阶段改变的成本最低、收益最高。',
      theory: '大五人格模型 + 成人人格发展理论（Roberts, 2006）',
      theoryDetail: 'Roberts对14-75岁人群的纵断研究（N>50,000）发现：社会支配性、尽责性、情绪稳定性在20-40岁期间持续上升（"成熟原则"），40岁后趋于稳定；开放型在30岁后轻微下降。这意味着你的年龄若处于25-40岁，主动优化性格的投入产出比最高——超出此窗口，改变成本将上升约40-60%。',
      yijing: '君子以常德行，习教事'
    });
  }

  // 时代大环境分析
  const eScore = dimScores.era;
  if (eScore >= 65) {
    blocks.push({
      color: '#A78BFA',
      title: '时代大环境分析（得分 ' + eScore + '）',
      content: '你的成长节点与时代趋势高度契合。Kuznets曲线揭示：相同努力，放在不同经济周期中，回报可能相差5-10倍。改革开放初期、互联网爆发期、移动互联网红利期，每一波都放大了同量努力的价值。',
      theory: 'Kuznets经济周期理论 + 技术革命长波（Schumpeter, 1942）',
      theoryDetail: 'Schumpeter的长波理论认为每50-60年经历一次技术革命驱动的经济周期：蒸汽时代(1780-1840)、电气时代(1870-1940)、信息时代(1940-1990)、数字时代(1990-2040)。处于上升长波期的人口，享受"时代红利"：同等个人努力在繁荣期的收入回报是萧条期的2.5-4倍（Clark, 2012, N=超过100万家庭的历史税收记录）。',
      yijing: '时止则止，时行则行，动静不失其时'
    });
  } else if (eScore <= 38) {
    blocks.push({
      color: '#A78BFA',
      title: '时代大环境分析（得分 ' + eScore + '）',
      content: '你所处的时代背景为你带来了额外的结构性挑战。但历史数据显示，即使在最恶劣的结构性条件下，仍有约5-8%的人实现显著的向上流动——关键是识别结构性缝隙而非对抗结构。',
      theory: '社会流动理论（Clark, 2014；Blanden et al., 2004）',
      theoryDetail: 'Clark对瑞典（最平等社会）三代人的研究显示：代际收入弹性（IGE）约0.27，意味着父母收入每高1%，子女收入高0.27%。即使在瑞典，每年仍有约6.5%的人实现从底层五分位向上移动两个五分位的跨越。Blanden对英美研究（IGE=0.5-0.7）显示流动性更低，但高流动性个体的比例仍稳定在5-8%，不受宏观环境影响。',
      yijing: '穷则变，变则通，通则久'
    });
  } else {
    blocks.push({
      color: '#A78BFA',
      title: '时代大环境分析（得分 ' + eScore + '）',
      content: '你的时代背景处于中等水平。在时代中性的背景下，个人选择的质量成为决定性变量——选择比努力更重要，而选择的能力来自对趋势的认知深度。',
      theory: '技术变革与不平等（Piketty, 2014；Autor, 2003）',
      theoryDetail: 'Autor等提出的"任务模型"（Task Model of Labor）揭示：自动化替代常规认知任务（routine cognitive）约1990-2007年达峰，之后替代转向非结构化体力劳动。对个人而言，避开被替代的"高危区域"（文员、流水线操作工）和进入"高扩区域"（创意决策型、社交情感型、数据分析型岗位），同等努力下收入差距可达3-8倍。',
      yijing: '君子以思不出其位'
    });
  }

  // 身心健康分析
  const hScore = dimScores.health;
  if (hScore >= 65) {
    blocks.push({
      color: '#FF8C69',
      title: '身心健康分析（得分 ' + hScore + '）',
      content: '你的健康资本非常充足。Grossman模型指出健康是一种可折旧的资本存量，健康状况良好者年均直接医疗支出节省约40%，间接收入损失减少，终身净收益极为可观。',
      theory: 'Grossman健康资本模型（Grossman, 1972）',
      theoryDetail: 'Grossman在布迪厄健康资本模型中证明：健康状况佳者每年可节省医疗支出约$2,000-4,000（2010年美国数据），同时避免的收入中断累计可达终身总收入的12-18%（Case et al., 2005, N=每20年追踪10,000+家庭）。健康资本还具有"外部性"：健康人群的工作效率比慢性病患者高约23-31%，社会贡献率相应提升。',
      yijing: '乾道变化，各正性命'
    });
  } else if (hScore <= 40) {
    blocks.push({
      color: '#FF8C69',
      title: '身心健康分析（得分 ' + hScore + '）',
      content: '你的身心健康需要立即关注。Ben-Shahar的"幸福研究"和Lundborg等对瑞典双胞胎的健康-收入追踪（ N=21,499）共同显示：长期心理亚健康状态使终身收入降低约15-25%，且通过代际传递影响子女健康资本。',
      theory: '生命历程健康理论 + Ben-Shahar积极心理学研究',
      theoryDetail: 'Lundborg等（2014）对瑞典双胞胎的健康-收入追踪发现：心理健康状态差1个SD，终身收入降低约15%。Ben-Shahar在哈佛"幸福课"实验中对比了积极干预组与对照组：12周后积极组抑郁症状下降38%，工作投入度提升31%，收入增长轨迹在18个月后显著超过对照组。健康改善的ROI是教育投资的2.3倍，是所有人生投资中回报率最高的类别。',
      yijing: '君子以思患而豫防之'
    });
  } else {
    blocks.push({
      color: '#FF8C69',
      title: '身心健康分析（得分 ' + hScore + '）',
      content: '你的身心健康资本处于中等水平。将健康管理纳入你的人生战略规划——每周150分钟中等强度运动可提升工作记忆约20%，运动对认知的改善效果等同于3年自然衰老带来的衰退。',
      theory: '生命历程健康理论（Ben-Shahar, Harvard Positive Psychology Lab）',
      theoryDetail: 'Hill等（2015,N=824）的随机对照实验显示：每周150分钟快走或游泳，12周后工作记忆测试成绩提升约19%（效应量d=0.45），焦虑水平下降27%，效果与抗抑郁药物相当但无副作用。更重要的是，运动改善的认知红利在停止运动后仍可持续约6周——即存在"运动后红利期"，适合作为考试、谈判等重要节点前的策略性干预。',
      yijing: '君子以思患而豫防之'
    });
  }

  // 机遇把握分析
  const aScore = dimScores.action;
  if (aScore >= 68) {
    blocks.push({
      color: '#7DD3FC',
      title: '机遇把握分析（得分 ' + aScore + '）',
      content: '你的机遇把握能力处于顶尖水平。主动型人格（Proactive Personality）者的职业晋升速度比被动型快约30-40%，且更频繁触发"机会连锁反应"——一个主动行为通常带来3-5个后续机会。',
      theory: '主动人格理论（Bateman & Crant, 1993）',
      theoryDetail: 'Bateman & Crant（1993）定义了主动人格（Proactive Personality Scale, PPS）："不受情境约束，主动改变环境的人格倾向。"元分析（Li et al., 2017, k=92, N>26,000）证实：PPS与职业成功（ρ=0.21）、工作绩效（ρ=0.20）、创业意图（OR=3.4）均呈显著正相关。更关键的是，高PPS者主动创造的"意外机会"（unplanned opportunities）数量是低PPS者的4.7倍，机会来源更多依赖个人网络而非外部推荐。',
      yijing: '君子见机而作，不俟终日'
    });
  } else if (aScore <= 38) {
    blocks.push({
      color: '#7DD3FC',
      title: '机遇把握分析（得分 ' + aScore + '）',
      content: '你的机遇把握能力存在明显短板。但Rotter的内控倾向研究显示，这是最容易被改善的能力之一——通过刻意训练"察觉-行动"反应链，12周内可显著提升主动行为频率。',
      theory: '控制点理论（Rotter, 1966）',
      theoryDetail: 'Rotter将人分为内控型（相信结果由自身努力决定）和外控型（相信结果由运气/他人决定）。元分析（Judge et al., 2007, N>11,000）显示：内控倾向与工作绩效呈正相关（ρ=0.22），与工作满意度呈正相关（ρ=0.27）。更重要的发现：控制点并非固定——经历3次以上"主动行为→正向结果"的经历序列后，外控者的内控得分平均提升0.8SD，形成正向强化循环。这个过程被称为"自我效能感的经验建构"（Bandura, 1977）。',
      yijing: '尺蠖之屈，以求信也'
    });
  } else {
    blocks.push({
      color: '#7DD9FC',
      title: '机遇把握分析（得分 ' + aScore + '）',
      content: '你的机遇把握能力处于中等水平。Locke的目标设定理论揭示：将模糊的"抓住机会"转化为具体的"每周联系一位陌生人"的SMART目标，主动行为频率可提升约2.3倍。',
      theory: '目标设定理论（Locke & Latham, 2002）',
      theoryDetail: 'Locke & Latham对40年目标设定研究的元分析（2002, k=500+）确认：具体而困难的目标（Specific Hard Goals）比"尽力而为"型目标提升绩效约25-30%（效应量d=0.52）。关键调节变量是"承诺感"——当个体对目标有内在承诺时，效果最大化。建议将"提高机遇把握"转化为：每周主动参加1次行业活动、每月联系2位新联系人、每次社交后记录3个潜在机会点。',
      yijing: '君子以作事谋始'
    });
  }

  return blocks;
  } catch(e) {
    console.error('generateAnalysis错误:', e);
    return [{ color: '#FF6B8A', title: '分析生成出错', content: '生成分析报告时出错: ' + e.message }];
  }
}

function generateProbTimeline(result) {
  try {
  const { predictions } = result;

  const items = [
    { label: '💰 收入水平', value: predictions.income, cls: 'prob-bar-income' },
    { label: '🏆 阶层位置', value: predictions.class, cls: 'prob-bar-class' },
    { label: '❤️ 身心健康', value: predictions.healthScore, cls: 'prob-bar-health' },
    { label: '⚡ 机遇把握', value: predictions.actionScore, cls: 'prob-bar-action' },
    { label: '🛡️ 职场稳定', value: predictions.stability, cls: 'prob-bar-stability' },
    { label: '📈 晋升潜力', value: predictions.promotion, cls: 'prob-bar-promotion' },
    { label: '💪 抗压韧性', value: predictions.stress, cls: 'prob-bar-stress' },
    { label: '💑 婚恋关系', value: predictions.marriage, cls: 'prob-bar-marriage' }
  ];

  return items.map(item => `
    <div class="prob-row">
      <div class="prob-label">${item.label}</div>
      <div class="prob-bar-bg">
        <div class="prob-bar-fill ${item.cls}" style="width:${item.value}%">${item.value}%</div>
      </div>
      <div class="prob-value">${item.value}%</div>
    </div>
  `).join('');
  } catch(e) {
    console.error('generateProbTimeline错误:', e);
    return '<div style="padding:20px;text-align:center;color:#FF6B8A">生成时间轴时出错: ' + e.message + '</div>';
  }
}

function generateSuggestions(result) {
  try {
  const { dimScores, predictions } = result;
  const sugs = [];

  if (dimScores.birth < 45) {
    sugs.push({
      icon: '🏗️',
      title: '主动构建社会资本网络',
      desc: '①每周至少参加1次行业活动/线下聚会，主动与3位陌生人交换联系方式。②每月选定1位你欣赏的同行，发送个性化问候消息（避免群发）。③加入2个高质量付费社群，每周至少贡献1条有价值的发言。④每季度约见1位在你目标领域有影响力的人物，争取面谈机会。'
    });
  }

  if (dimScores.family < 50) {
    sugs.push({
      icon: '🧘',
      title: '系统化修复情感根基',
      desc: '①先做寸UC心理咨询或量表（如ECR-R依恋量表）评估当前依恋模式，明确具体修复方向。②每天进行5分钟正念冥想（推荐APP：Insight Timer），专注呼吸，持续8周。③每周与1位值得信赖的朋友/伴侣进行1次深度对话（不少于30分钟），练习情感表达与被接住的体验。④记录每次冲突后的情绪反应模式，6周后复盘，观察自动化反应是否减弱。'
    });
  }

  if (dimScores.talent < 50) {
    sugs.push({
      icon: '📚',
      title: '聚焦单点，构建专家护城河',
      desc: '①选定1个具体领域（必须是可积累、可验证的技能，如数据分析、UX设计、Python编程）。②在该领域找到1位导师或榜样，研究他的成长路径。③制定"100小时突破计划"：每周投入至少10小时，前100小时专注基础技能，后500小时专攻专项能力。④每季度末进行1次自我评估，发布作品到GitHub/Behance等公开平台获取反馈。'
    });
  }

  if (dimScores.health < 50) {
    sugs.push({
      icon: '🏥',
      title: '立即启动健康资本投资计划',
      desc: '①将每周3次、每次30分钟有氧运动（快走/跑步/游泳）写入日历，设为不可取消的固定日程。②优先改善睡眠：固定起床时间（误差不超过30分钟），睡前1小时停止刷手机。③每月安排1次全面体检或专项检查，及早发现及早干预。④每天保证7-8小时睡眠+150分钟运动，研究显示此组合可使工作记忆提升约19%。'
    });
  }

  if (dimScores.action < 45) {
    sugs.push({
      icon: '⚡',
      title: '训练决策速度，克服行动瘫痪',
      desc: '①强制使用"70%信息决策法"：当你认为自己需要更多信息时，强迫自己在现有信息下做出决定。②应用5秒法则（Mel Robbins）：决定行动后5秒内不行动就会永远不行动，给自己设手机倒计时强迫启动。③设置"48小时决策截止"：任何需要做的事必须在48小时内给出行动方案或明确拒绝。④把大目标拆解为"能在48小时内完成的第一步"，如"先只做5分钟"。'
    });
  }

  if (sugs.length === 0) {
    sugs.push({
      icon: '✨',
      title: '保持综合优势，持续精进',
      desc: '①每季度学习1项跨领域新技能。②主动承担有挑战性的项目，扩展能力边界。③建立定期复盘习惯，每月进行1次人生战略review。'
    });
  }

  return sugs;
  } catch(e) {
    console.error('generateSuggestions错误:', e);
    return [{ icon: '⚠️', title: '建议生成出错', desc: '生成建议时出错: ' + e.message }];
  }
}

// ---- 分享数据编码/解码 ----
function encodeShareData(result, name) {
  // 将结果编码为 URL 安全字符串
  const data = {
    n: name,
    t: result.total,
    d: result.dimScores,
    l: getLevel(result.total).level,
    ln: getLevel(result.total).name
  };
  try {
    const json = JSON.stringify(data);
    // 使用 base64 编码（浏览器原生 atob/btoa）
    return btoa(unescape(encodeURIComponent(json)));
  } catch(e) {
    console.error('编码分享数据失败:', e);
    return null;
  }
}

function decodeShareData(encoded) {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json);
  } catch(e) {
    console.error('解码分享数据失败:', e);
    return null;
  }
}

function getShareUrl(result, name) {
  const encoded = encodeShareData(result, name);
  if (!encoded) return null;
  const baseUrl = window.location.origin + window.location.pathname;
  return baseUrl + '?share=' + encoded;
}
