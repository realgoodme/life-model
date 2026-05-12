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
  if (score >= 80) return { detail: '高收入', desc: '收入处于社会前20%' };
  if (score >= 60) return { detail: '中高收入', desc: '收入处于社会前40%' };
  if (score >= 40) return { detail: '中等收入', desc: '收入处于社会平均水平' };
  return { detail: '中低收入', desc: '收入需要提升' };
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
    yijing: '天行健，君子以自强不息'
  });

  // 出身资本分析
  const bScore = dimScores.birth;
  if (bScore >= 68) {
    blocks.push({
      color: '#5B7FFF',
      title: '出身资本分析（得分 ' + bScore + '）',
      content: '你拥有强资本出身。家庭的经济资本、文化资本、社会资本三重叠加。研究表明家庭资本每提高一个标准差，子女进入上层职业的概率提升约2.3倍。',
      theory: '布迪厄资本理论',
      yijing: '积善之家，必有余庆'
    });
  } else if (bScore >= 42) {
    blocks.push({
      color: '#5B7FFF',
      title: '出身资本分析（得分 ' + bScore + '）',
      content: '你的出身资本处于中等水平。通过教育和技能投资是跨越阶层最可靠的路径。',
      theory: '明瑟尔收入方程',
      yijing: '君子以经纶'
    });
  } else {
    blocks.push({
      color: '#5B7FFF',
      title: '出身资本分析（得分 ' + bScore + '）',
      content: '你的出身资本处于较弱区间，但教育仍是阶层跨越最有效的单一路径。',
      theory: '布劳-邓肯路径模型',
      yijing: '困而不失其所亨，唯君子为能之'
    });
  }

  // 原生家庭分析
  const fScore = dimScores.family;
  if (fScore >= 68) {
    blocks.push({
      color: '#FF6B8A',
      title: '原生家庭分析（得分 ' + fScore + '）',
      content: '你的原生家庭提供了优质的心理安全基础。安全型依恋模式在神经层面奠定了稳定情绪调节的基础。',
      theory: '鲍姆林德教养理论',
      yijing: '蒙以养正，圣功也'
    });
  } else if (fScore <= 38) {
    blocks.push({
      color: '#FF6B8A',
      title: '原生家庭分析（得分 ' + fScore + '）',
      content: '你的原生家庭存在较大的负面影响因子。但原生家庭是起点，不是终点。',
      theory: 'ACE研究',
      yijing: '君子以洗心，退藏于密'
    });
  } else {
    blocks.push({
      color: '#FF6B8A',
      title: '原生家庭分析（得分 ' + fScore + '）',
      content: '你的原生家庭处于中等复杂状态，需要主动进行自我觉察训练。',
      theory: '依恋理论',
      yijing: '介于石，不终日，贞吉'
    });
  }

  // 天赋禀赋分析
  const tScore = dimScores.talent;
  if (tScore >= 70) {
    blocks.push({
      color: '#FFB347',
      title: '天赋禀赋分析（得分 ' + tScore + '）',
      content: '你的认知天赋位于前10%。高天赋需要与高自律结合才能发挥最大价值。',
      theory: '一般智力因素(g因子)',
      yijing: '天生蒸民，有物有则'
    });
  } else if (tScore <= 40) {
    blocks.push({
      color: '#FFB347',
      title: '天赋禀赋分析（得分 ' + tScore + '）',
      content: '你的认知天赋处于社会平均水平或偏下。但智商不等于命运，刻意练习可以弥补。',
      theory: '刻意练习理论',
      yijing: '天道酬勤'
    });
  } else {
    blocks.push({
      color: '#FFB347',
      title: '天赋禀赋分析（得分 ' + tScore + '）',
      content: '你的天赋处于中等水平。找到你独特擅长的1-2个领域，建立专家级别的不可替代性。',
      theory: '流体/晶体智力理论',
      yijing: '君子藏器于身，待时而动'
    });
  }

  // 性格特质分析
  const cScore = dimScores.character;
  if (cScore >= 65) {
    blocks.push({
      color: '#3DD9A0',
      title: '性格特质分析（得分 ' + cScore + '）',
      content: '你的性格特质非常优秀。大五人格中，尽责性与所有职业类型的绩效呈正相关。',
      theory: '大五人格模型',
      yijing: '天行健，君子以自强不息'
    });
  } else if (cScore <= 38) {
    blocks.push({
      color: '#3DD9A0',
      title: '性格特质分析（得分 ' + cScore + '）',
      content: '你的性格特质存在一些需要优化的维度。但人格特质具有可塑性。',
      theory: '人格可塑性研究',
      yijing: '君子以见善则迁，有过则改'
    });
  } else {
    blocks.push({
      color: '#3DD9A0',
      title: '性格特质分析（得分 ' + cScore + '）',
      content: '你的性格特质处于中等水平。性格是可以选择优化的软件。',
      theory: '大五人格模型',
      yijing: '君子以常德行，习教事'
    });
  }

  // 时代大环境分析
  const eScore = dimScores.era;
  if (eScore >= 65) {
    blocks.push({
      color: '#A78BFA',
      title: '时代大环境分析（得分 ' + eScore + '）',
      content: '你的成长节点与时代趋势高度契合，是相同的努力，放在不同时代，回报可能相差5-10倍。',
      theory: '经济周期理论',
      yijing: '时止则止，时行则行，动静不失其时'
    });
  } else if (eScore <= 38) {
    blocks.push({
      color: '#A78BFA',
      title: '时代大环境分析（得分 ' + eScore + '）',
      content: '你所处的时代背景为你带来了额外的结构性挑战。但任何时代都有约5-8%的人实现显著的向上流动。',
      theory: '社会流动理论',
      yijing: '穷则变，变则通，通则久'
    });
  } else {
    blocks.push({
      color: '#A78BFA',
      title: '时代大环境分析（得分 ' + eScore + '）',
      content: '你的时代背景处于中等水平。在时代中性的背景下，个人选择的质量成为决定性变量。',
      theory: '技术变革与不平等',
      yijing: '君子以思不出其位'
    });
  }

  // 身心健康分析
  const hScore = dimScores.health;
  if (hScore >= 65) {
    blocks.push({
      color: '#FF8C69',
      title: '身心健康分析（得分 ' + hScore + '）',
      content: '你的健康资本非常充足。身体健康者的终身收入比慢性病患者高约28-35%。',
      theory: 'Grossman健康资本模型',
      yijing: '乾道变化，各正性命'
    });
  } else if (hScore <= 40) {
    blocks.push({
      color: '#FF8C69',
      title: '身心健康分析（得分 ' + hScore + '）',
      content: '你的身心健康需要立即关注。健康管理是最高ROI的人生投资。',
      theory: '生命历程健康理论',
      yijing: '君子以思患而豫防之'
    });
  } else {
    blocks.push({
      color: '#FF8C69',
      title: '身心健康分析（得分 ' + hScore + '）',
      content: '你的身心健康资本处于中等水平。将健康管理纳入你的人生战略规划。',
      theory: '生命历程健康理论',
      yijing: '君子以思患而豫防之'
    });
  }

  // 机遇把握分析
  const aScore = dimScores.action;
  if (aScore >= 68) {
    blocks.push({
      color: '#7DD3FC',
      title: '机遇把握分析（得分 ' + aScore + '）',
      content: '你的机遇把握能力处于顶尖水平。主动型人格者的职业晋升速度比被动型快约30-40%。',
      theory: '主动人格理论',
      yijing: '君子见机而作，不俟终日'
    });
  } else if (aScore <= 38) {
    blocks.push({
      color: '#7DD3FC',
      title: '机遇把握分析（得分 ' + aScore + '）',
      content: '你的机遇把握能力存在明显短板。但这是最容易被改善的能力之一。',
      theory: '控制点理论',
      yijing: '尺蠖之屈，以求信也'
    });
  } else {
    blocks.push({
      color: '#7DD3FC',
      title: '机遇把握分析（得分 ' + aScore + '）',
      content: '你的机遇把握能力处于中等水平。机会不是等来的，是创造出来的。',
      theory: '目标设定理论',
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

  let html = '';
  html += '<div class="prob-row"><div class="prob-label">收入水平</div><div class="prob-bar-bg"><div class="prob-bar-fill" style="width:' + predictions.income + '%">' + predictions.income + '%</div></div></div>';
  html += '<div class="prob-row"><div class="prob-label">阶层位置</div><div class="prob-bar-bg"><div class="prob-bar-fill" style="width:' + predictions.class + '%">' + predictions.class + '%</div></div></div>';
  html += '<div class="prob-row"><div class="prob-label">身心健康</div><div class="prob-bar-bg"><div class="prob-bar-fill" style="width:' + predictions.healthScore + '%">' + predictions.healthScore + '%</div></div></div>';
  html += '<div class="prob-row"><div class="prob-label">机遇把握</div><div class="prob-bar-bg"><div class="prob-bar-fill" style="width:' + predictions.actionScore + '%">' + predictions.actionScore + '%</div></div></div>';
  html += '<div class="prob-row"><div class="prob-label">职场稳定性</div><div class="prob-bar-bg"><div class="prob-bar-fill" style="width:' + predictions.stability + '%">' + predictions.stability + '%</div></div></div>';
  html += '<div class="prob-row"><div class="prob-label">晋升潜力</div><div class="prob-bar-bg"><div class="prob-bar-fill" style="width:' + predictions.promotion + '%">' + predictions.promotion + '%</div></div></div>';
  html += '<div class="prob-row"><div class="prob-label">抗压韧性</div><div class="prob-bar-bg"><div class="prob-bar-fill" style="width:' + predictions.stress + '%">' + predictions.stress + '%</div></div></div>';
  html += '<div class="prob-row"><div class="prob-label">婚恋关系</div><div class="prob-bar-bg"><div class="prob-bar-fill" style="width:' + predictions.marriage + '%">' + predictions.marriage + '%</div></div></div>';

  return html;
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
    sugs.push({ icon: '🏗️', title: '主动构建社会资本网络', desc: '加入行业协会、职业社群、高质量校友网络。' });
  }

  if (dimScores.family < 50) {
    sugs.push({ icon: '🧘', title: '系统化修复情感根基', desc: '通过心理咨询或正念训练，系统性重建安全的内在工作模型。' });
  }

  if (dimScores.talent < 50) {
    sugs.push({ icon: '📚', title: '聚焦单点，构建专家护城河', desc: '天赋一般的情况下，策略是找到1个具体领域进行10,000小时以上的刻意练习。' });
  }

  if (dimScores.health < 50) {
    sugs.push({ icon: '🏥', title: '立即启动健康资本投资计划', desc: '健康管理是最高ROI的人生投资。' });
  }

  if (dimScores.action < 45) {
    sugs.push({ icon: '⚡', title: '训练决策速度，克服行动瘫痪', desc: '采用70%信息决策法则，配合5秒法则。' });
  }

  if (sugs.length === 0) {
    sugs.push({ icon: '✨', title: '保持综合优势，持续精进', desc: '你的先天参数已经相当均衡优秀。' });
  }

  return sugs;
  } catch(e) {
    console.error('generateSuggestions错误:', e);
    return [{ icon: '⚠️', title: '建议生成出错', desc: '生成建议时出错: ' + e.message }];
  }
}
