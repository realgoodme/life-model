// ============================================================
// 主应用逻辑
// ============================================================

let currentQ = 0;
let answers = {};
let userName = '';

// ---- 页面导航 ----
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

function goHome() { showPage('page-home'); updateTotalCount(); }

// ---- 开始测评 ----
function startAssessment() {
  openNameModal();
}

// ---- 模态框函数 ----
function openNameModal() {
  const modal = document.getElementById('name-modal');
  const input = document.getElementById('name-input');
  const error = document.getElementById('name-error');

  input.value = '';
  error.textContent = '';
  modal.classList.add('show');
  input.focus();

  // 回车确认
  input.onkeydown = function(e) {
    if (e.key === 'Enter') confirmName();
  };
}

function closeNameModal() {
  const modal = document.getElementById('name-modal');
  modal.classList.remove('show');
}

function confirmName() {
  const input = document.getElementById('name-input');
  const error = document.getElementById('name-error');

  const name = input.value.trim();

  userName = name || '匿名用户';
  closeNameModal();

  answers = {};
  currentQ = 0;
  document.getElementById('q-total').textContent = QUESTIONS.length;
  renderQuestion();
  showPage('page-survey');
}

function restartAssessment() {
  answers = {};
  currentQ = 0;
  showPage('page-home');
}

// ---- 渲染题目 ----
function renderQuestion() {
  const q = QUESTIONS[currentQ];
  const dim = DIMENSIONS[q.dim];

  document.getElementById('q-current').textContent = currentQ + 1;
  document.getElementById('q-dim-tag').textContent = dim.icon + ' ' + dim.name;
  document.getElementById('q-dim-tag').style.background = dim.color + '18';
  document.getElementById('q-dim-tag').style.color = dim.color;
  document.getElementById('q-text').textContent = q.text;
  document.getElementById('q-sub').textContent = q.sub;

  const pct = ((currentQ + 1) / QUESTIONS.length * 100).toFixed(1);
  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('dim-label').textContent = dim.icon + ' 当前维度：' + dim.name;

  const optEl = document.getElementById('options');
  optEl.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    const isSelected = answers[q.id + '_idx'] === i;
    btn.className = 'option-btn' + (isSelected ? ' selected' : '');
    btn.textContent = opt.label;
    btn.addEventListener('click', () => selectOption(opt.score, i));
    optEl.appendChild(btn);
  });

  document.getElementById('btn-prev').disabled = currentQ === 0;
  const nextBtn = document.getElementById('btn-next');
  const isLastQ = currentQ === QUESTIONS.length - 1;
  nextBtn.textContent = isLastQ ? '查看结果 →' : '下一题 →';
  nextBtn.classList.toggle('is-final', isLastQ);

  const card = document.getElementById('question-card');
  card.classList.remove('slide-in');
  void card.offsetWidth;
  card.classList.add('slide-in');
}

function selectOption(score, idx) {
  const q = QUESTIONS[currentQ];
  answers[q.id] = score;
  answers[q.id + '_idx'] = idx;

  document.querySelectorAll('.option-btn').forEach((btn, i) => {
    btn.classList.toggle('selected', i === idx);
  });

  // 最后一题不自动跳转，让用户点击"查看结果"
  if (currentQ === QUESTIONS.length - 1) {
    return;
  }

  setTimeout(() => {
    if (currentQ < QUESTIONS.length - 1) {
      currentQ++;
      renderQuestion();
    }
  }, 280);
}

function nextQuestion() {
  const q = QUESTIONS[currentQ];
  if (answers[q.id] === undefined) { showToast('请选择一个选项'); return; }
  if (currentQ < QUESTIONS.length - 1) { currentQ++; renderQuestion(); }
  else {
    console.log('=== 准备生成结果 ===');
    console.log('已回答问题数:', Object.keys(answers).filter(k => !k.endsWith('_idx')).length);
    showResult();
  }
}

function prevQuestion() {
  if (currentQ > 0) { currentQ--; renderQuestion(); }
}

// ---- 结果展示 ----
function showResult() {
  try {
    // 验证必要变量
    if (typeof QUESTIONS === 'undefined') {
      throw new Error('QUESTIONS未定义！请检查questions.js是否正确加载');
    }
    if (typeof DIMENSIONS === 'undefined') {
      throw new Error('DIMENSIONS未定义！请检查questions.js是否正确加载');
    }
    if (typeof calcScores === 'undefined') {
      throw new Error('calcScores未定义！请检查scoring.js是否正确加载');
    }
    if (QUESTIONS.length !== 92) {
      throw new Error('QUESTIONS数量错误: ' + QUESTIONS.length);
    }

    console.log('=== 验证通过 ===');
    const result = calcScores(answers);
    console.log('calcScores完成:', result);
    const levelInfo = getLevel(result.total);
    console.log('getLevel完成:', levelInfo);
    const income = incomeRange(result.predictions.income);
    console.log('incomeRange完成');
    const suggestions = generateSuggestions(result);
    console.log('generateSuggestions完成');
    const analysisBlocks = generateAnalysis(result);
    console.log('generateAnalysis完成, block数量:', analysisBlocks ? analysisBlocks.length : 0);
    const probTimeline = generateProbTimeline(result);
    console.log('generateProbTimeline完成');

    console.log('=== 结果生成成功 ===');
    console.log('总分:', result.total);
    console.log('等级:', levelInfo.name);

    saveRecord(userName, result, levelInfo);
    showPage('page-result');
    document.getElementById('result-time').textContent = '测评时间：' + new Date().toLocaleString('zh-CN');

    drawScoreRing(result.total, levelInfo.color);
    document.getElementById('total-score-num').textContent = result.total;

    document.getElementById('level-badge').innerHTML =
      `<span class="badge" style="background:${levelInfo.color}">${levelInfo.level} · ${levelInfo.name}</span>`;
    document.getElementById('level-desc').textContent = levelInfo.desc;

    document.getElementById('level-subinfo').innerHTML = `
      <span>📊 综合得分：<strong>${result.total}分</strong></span>
      <span>📈 社会排名：<strong>${levelInfo.percentile}</strong></span>
      <span>🏷️ 标签：<strong>${levelInfo.tag}</strong></span>
    `;

    setTimeout(() => {
      try { drawRadar(result.dimScores); } catch(e) { console.error('雷达图错误:', e); }
    }, 100);

    try {
      renderDimScores(result.dimScores);
      console.log('renderDimScores完成');
    } catch(e) { console.error('renderDimScores错误:', e); }

    try {
      renderPredictions(result.predictions, income);
      console.log('renderPredictions完成');
    } catch(e) { console.error('renderPredictions错误:', e); }

    try {
      renderCareerBars(result.predictions);
      console.log('renderCareerBars完成');
    } catch(e) { console.error('renderCareerBars错误:', e); }

    try {
      renderAnalysisBlocks(analysisBlocks);
      console.log('renderAnalysisBlocks完成');
    } catch(e) { console.error('renderAnalysisBlocks错误:', e); }

    try {
      document.getElementById('prob-timeline').innerHTML = probTimeline;
      console.log('prob-timeline渲染完成');
    } catch(e) { console.error('prob-timeline错误:', e); }

    try {
      renderSuggestions(suggestions);
      console.log('renderSuggestions完成');
    } catch(e) { console.error('renderSuggestions错误:', e); }

    console.log('=== 结果展示完成 ===');
  } catch(e) {
    console.error('showResult详细错误:', e);
    const errMsg = '生成结果时出错：' + e.message;
    console.log('错误堆栈:', e.stack);
    // 在页面上显示错误信息帮助调试
    document.getElementById('page-result') && (document.getElementById('page-result').innerHTML =
      '<div style="padding:40px;text-align:center;color:#FF6B8A"><h2>出错了</h2><p>' + errMsg + '</p><p style="font-size:12px;color:#888">请按F12打开控制台，查看Console中的详细错误信息</p></div>');
    showToast('生成结果时出错，请刷新重试');
  }
}

// ---- 绘制总分环 ----
function drawScoreRing(score, color) {
  const canvas = document.getElementById('score-ring');
  const ctx = canvas.getContext('2d');
  const cx = 100, cy = 100, r = 80;
  ctx.clearRect(0, 0, 200, 200);

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = '#E8EEFF';
  ctx.lineWidth = 14;
  ctx.stroke();

  const angle = (score / 100) * Math.PI * 2 - Math.PI / 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, angle);
  ctx.strokeStyle = color;
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

// ---- 雷达图 ----
function drawRadar(dimScores) {
  const canvas = document.getElementById('radar-chart');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2 + 10;
  const R = Math.min(W, H) / 2 - 65;
  ctx.clearRect(0, 0, W, H);

  const dims = Object.keys(DIMENSIONS);
  const n = dims.length;
  const angles = dims.map((_, i) => (i / n) * Math.PI * 2 - Math.PI / 2);

  for (let ring = 1; ring <= 5; ring++) {
    ctx.beginPath();
    angles.forEach((a, i) => {
      const r = R * ring / 5;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.strokeStyle = 'rgba(91,127,255,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (ring % 2 === 0) {
      ctx.fillStyle = 'rgba(90,104,153,0.8)';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ring * 20, cx + 8, cy - R * ring / 5 + 5);
    }
  }

  angles.forEach((a) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
    ctx.strokeStyle = 'rgba(91,127,255,0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  ctx.beginPath();
  dims.forEach((d, i) => {
    const val = dimScores[d] / 100;
    const x = cx + Math.cos(angles[i]) * R * val;
    const y = cy + Math.sin(angles[i]) * R * val;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(91,127,255,0.15)';
  ctx.fill();
  ctx.strokeStyle = '#5B7FFF';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = '#5B7FFF';
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0;

  dims.forEach((d, i) => {
    const val = dimScores[d] / 100;
    const x = cx + Math.cos(angles[i]) * R * val;
    const y = cy + Math.sin(angles[i]) * R * val;
    ctx.beginPath();
    ctx.arc(x, y, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = DIMENSIONS[d].color;
    ctx.shadowColor = DIMENSIONS[d].color;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  dims.forEach((d, i) => {
    const a = angles[i];
    const labelR = R + 45;
    const x = cx + Math.cos(a) * labelR;
    const y = cy + Math.sin(a) * labelR;
    ctx.fillStyle = DIMENSIONS[d].color;
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = Math.abs(Math.cos(a)) < 0.1 ? 'center' : (Math.cos(a) > 0 ? 'left' : 'right');
    ctx.textBaseline = 'middle';
    ctx.fillText(DIMENSIONS[d].icon + ' ' + DIMENSIONS[d].name, x, y);
    ctx.fillStyle = 'rgba(90,104,153,0.9)';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(dimScores[d] + '分', x, y + 20);
  });
}

// ---- 维度得分 ----
function renderDimScores(dimScores) {
  const el = document.getElementById('dim-scores');
  el.innerHTML = Object.keys(DIMENSIONS).map(d => {
    const s = dimScores[d];
    const dim = DIMENSIONS[d];
    const label = s >= 80 ? '优秀' : s >= 65 ? '良好' : s >= 50 ? '中等' : s >= 35 ? '偏弱' : '薄弱';
    return `<div class="dim-score-row">
      <div class="dim-score-label">
        <span>${dim.icon} ${dim.name}</span>
        <span style="color:${dim.color};font-weight:700">${s}分 · ${label}</span>
      </div>
      <div class="dim-bar-bg">
        <div class="dim-bar-fill" style="width:${s}%;background:${dim.color}"></div>
      </div>
    </div>`;
  }).join('');
}

// ---- 预测指标 ----
function renderPredictions(pred, income) {
  const md = marriageDesc(pred.marriage);
  const items = [
    {
      label: '💰 收入水平预测', value: income.detail,
      sub: income.detail + ' | ' + income.desc,
      color: income.color
    },
    {
      label: '🏆 阶层区间预测', value: classRange(pred.class),
      sub: '基于综合参数的阶层预测',
      color: '#5B7FFF'
    },
    {
      label: '🛡️ 职业稳定性指数', value: pred.unemployment >= 65 ? '高稳定' : pred.unemployment >= 45 ? '中等' : '风险偏高',
      sub: '稳定性指数 ' + pred.unemployment,
      color: '#3DD9A0'
    },
    {
      label: '💑 婚恋关系预测', value: md.label,
      sub: '婚恋潜力 ' + md.prob + ' · 关系质量指数 ' + pred.marriage,
      color: '#FF6B8A'
    }
  ];

  document.getElementById('prediction-grid').innerHTML = items.map(item => `
    <div class="pred-card" style="--pred-color:${item.color}">
      <div class="pred-icon">${item.label.split(' ')[0]}</div>
      <div class="pred-label">${item.label.split(' ').slice(1).join(' ')}</div>
      <div class="pred-value" style="color:${item.color}">${item.value}</div>
      <div class="pred-sub">${item.sub}</div>
    </div>
  `).join('');
}

// ---- 职场能力条 ----
function renderCareerBars(pred) {
  const cc = careerCeilDesc(pred.careerCeil);
  const items = [
    { label: '职场上限', value: pred.careerCeil, color: cc.color, desc: cc.label },
    { label: '晋升概率', value: pred.promotion, color: '#5B7FFF' },
    { label: '创业成功概率', value: pred.startup, color: '#FFB347' },
    { label: '抗压韧性', value: pred.stress, color: '#FF9A3C' },
    { label: '职业稳定性', value: pred.stability, color: '#3DD9A0' }
  ];

  document.getElementById('career-bars').innerHTML = items.map(item => `
    <div class="career-row">
      <div class="career-label">
        <span>${item.label}${item.desc ? '：' + item.desc : ''}</span>
        <span style="color:${item.color};font-weight:700">${item.value}%</span>
      </div>
      <div class="career-bar-bg">
        <div class="career-bar-fill" style="width:${item.value}%;background:linear-gradient(90deg,${item.color},${item.color}88)"></div>
      </div>
    </div>
  `).join('');

  document.getElementById('career-legend').innerHTML = `
    <span><span class="dot" style="background:#5B7FFF"></span>晋升潜力</span>
    <span><span class="dot" style="background:#3DD9A0"></span>稳定性</span>
    <span><span class="dot" style="background:#FFB347"></span>创业倾向</span>
    <span><span class="dot" style="background:#FF9A3C"></span>抗压韧性</span>
  `;
}

// ---- 分析报告块 ----
function renderAnalysisBlocks(blocks) {
  const el = document.getElementById('analysis-content');
  el.innerHTML = blocks.map(b => `
    <div class="analysis-block" style="--block-color:${b.color}">
      <div class="block-title">${b.title}</div>
      <div class="block-body">${b.content}</div>
      ${b.theory ? '<div class="theory-tag">📖 ' + b.theory + '</div>' : ''}
      ${b.theoryDetail ? '<div class="theory-detail">' + b.theoryDetail + '</div>' : ''}
      ${b.yijing ? '<div class="yijing-wisdom">💎 ' + b.yijing + '</div>' : ''}
    </div>
  `).join('');
}

// ---- 建议 ----
function renderSuggestions(sugs) {
  document.getElementById('suggestions').innerHTML = sugs.map(s => {
    // 将 ①②③④ 等步骤转换为带样式的换行格式
    const steps = s.desc.split(/(?=[①②③④⑤⑥⑦⑧⑨⑩])/);
    const stepsHtml = steps.map((step, i) => {
      const trimmed = step.trim();
      if (!trimmed) return '';
      return '<div class="sug-step"><span class="sug-step-num">' + (i + 1) + '</span><span>' + trimmed.replace(/^[一二三四五六七八九十][.、]\s*/, '') + '</span></div>';
    }).join('');

    return `
    <div class="sug-card">
      <div class="sug-icon">${s.icon}</div>
      <div class="sug-body">
        <strong>${s.title}</strong>
        <div class="sug-steps">${stepsHtml}</div>
      </div>
    </div>
  `;
  }).join('');
}

// ---- 数据存储 ----
function saveRecord(name, result, levelInfo) {
  const records = JSON.parse(localStorage.getItem('life_model_records') || '[]');
  records.unshift({
    id: Date.now(),
    name,
    time: new Date().toLocaleString('zh-CN'),
    total: result.total,
    dimScores: result.dimScores,
    predictions: result.predictions,
    level: levelInfo.level,
    levelName: levelInfo.name,
    incomeLabel: incomeRange(result.predictions.income).detail
  });
  localStorage.setItem('life_model_records', JSON.stringify(records));
  updateTotalCount();
}

function getRecords() {
  return JSON.parse(localStorage.getItem('life_model_records') || '[]');
}

function updateTotalCount() {
  const el = document.getElementById('total-count');
  if (el) el.textContent = getRecords().length;
}

// ---- 后台管理 ----
function renderAdmin() {
  if (!isLoggedIn()) { goLogin(); return; }

  const records = getRecords();
  document.getElementById('login-time').textContent = sessionStorage.getItem('life_admin_login_time') || '';

  const avgTotal = records.length ? Math.round(records.reduce((s, r) => s + r.total, 0) / records.length) : 0;
  const avgBirth = records.length ? Math.round(records.reduce((s, r) => s + (r.dimScores.birth || 0), 0) / records.length) : 0;
  const avgFamily = records.length ? Math.round(records.reduce((s, r) => s + (r.dimScores.family || 0), 0) / records.length) : 0;
  const avgTalent = records.length ? Math.round(records.reduce((s, r) => s + (r.dimScores.talent || 0), 0) / records.length) : 0;
  const avgChar = records.length ? Math.round(records.reduce((s, r) => s + (r.dimScores.character || 0), 0) / records.length) : 0;
  const avgEra = records.length ? Math.round(records.reduce((s, r) => s + (r.dimScores.era || 0), 0) / records.length) : 0;
  const avgHealth = records.length ? Math.round(records.reduce((s, r) => s + (r.dimScores.health || 0), 0) / records.length) : 0;
  const avgAction = records.length ? Math.round(records.reduce((s, r) => s + (r.dimScores.action || 0), 0) / records.length) : 0;

  const levelCounts = {};
  records.forEach(r => { levelCounts[r.level] = (levelCounts[r.level] || 0) + 1; });

  document.getElementById('admin-stats').innerHTML = `
    <div class="admin-stat-card"><div class="asc-num">${records.length}</div><div class="asc-label">总测评人数</div></div>
    <div class="admin-stat-card"><div class="asc-num">${avgTotal}</div><div class="asc-label">平均综合分</div></div>
    <div class="admin-stat-card"><div class="asc-num" style="font-size:1.2rem">${Object.keys(levelCounts).map(k => k+':'+levelCounts[k]).join(' / ') || '--'}</div><div class="asc-label">等级分布</div></div>
    <div class="admin-stat-card"><div class="asc-num">${records.length ? records[0].total : '--'}</div><div class="asc-label">最新测评分</div></div>
    <div class="admin-stat-card"><div class="asc-num">${avgBirth}</div><div class="asc-label">平均出身资本</div></div>
    <div class="admin-stat-card"><div class="asc-num">${avgFamily}</div><div class="asc-label">平均原生家庭</div></div>
    <div class="admin-stat-card"><div class="asc-num">${avgTalent}</div><div class="asc-label">平均天赋禀赋</div></div>
    <div class="admin-stat-card"><div class="asc-num">${avgChar}</div><div class="asc-label">平均性格特质</div></div>
    <div class="admin-stat-card"><div class="asc-num">${avgEra}</div><div class="asc-label">平均时代环境</div></div>
    <div class="admin-stat-card"><div class="asc-num">${avgHealth}</div><div class="asc-label">平均身心健康</div></div>
    <div class="admin-stat-card"><div class="asc-num">${avgAction}</div><div class="asc-label">平均机遇把握</div></div>
  `;

  renderTable(records);
  setTimeout(() => drawAdminCharts(records), 150);
}

function renderTable(records) {
  const tbody = document.getElementById('table-body');
  if (!records.length) {
    tbody.innerHTML = '<tr><td colspan="14" style="text-align:center;color:#5A6899;padding:40px">暂无数据 · 暂无测评记录</td></tr>';
    return;
  }
  tbody.innerHTML = records.map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${r.name}</strong></td>
      <td style="color:#5A6899;font-size:0.82rem">${r.time}</td>
      <td><strong style="color:#5B7FFF">${r.total}</strong></td>
      <td>${r.dimScores.birth || 0}</td>
      <td>${r.dimScores.family || 0}</td>
      <td>${r.dimScores.talent || 0}</td>
      <td>${r.dimScores.character || 0}</td>
      <td>${r.dimScores.era || 0}</td>
      <td>${r.dimScores.health || 0}</td>
      <td>${r.dimScores.action || 0}</td>
      <td><span class="level-chip">${r.level}·${r.levelName}</span></td>
      <td style="font-size:0.8rem;color:#5A6899">${r.incomeLabel || '--'}</td>
      <td><button class="btn-del" onclick="deleteRecord(${r.id})">删除</button></td>
    </tr>
  `).join('');
}

function drawAdminCharts(records) {
  if (!records.length) return;
  drawLevelPie(records);
  drawDimAvg(records);
}

function drawLevelPie(records) {
  const canvas = document.getElementById('admin-chart');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const counts = {};
  records.forEach(r => { counts[r.level] = (counts[r.level] || 0) + 1; });

  const levels = ['S','A+','A','B+','B','C','D'];
  const colors = ['#FFB347','#5B7FFF','#3DD9A0','#38BDF8','#A78BFA','#FF9A3C','#FF6B8A'];
  const cx = 80, cy = H / 2, r = 60;

  let startAngle = -Math.PI / 2;
  const total = records.length;

  levels.forEach((lv, i) => {
    const count = counts[lv] || 0;
    if (!count) return;
    const angle = (count / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, startAngle + angle);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();

    const midAngle = startAngle + angle / 2;
    if (count / total > 0.05) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(lv + '(' + count + ')', cx + Math.cos(midAngle) * r * 0.65, cy + Math.sin(midAngle) * r * 0.65);
    }
    startAngle += angle;
  });

  // 图例
  ctx.textAlign = 'left';
  levels.forEach((lv, i) => {
    const count = counts[lv] || 0;
    ctx.fillStyle = colors[i];
    ctx.fillRect(175, 20 + i * 24, 12, 12);
    ctx.fillStyle = '#1A2040';
    ctx.font = '12px sans-serif';
    ctx.fillText(lv + ' 级：' + count + '人', 192, 30 + i * 24);
  });
}

function drawDimAvg(records) {
  const canvas = document.getElementById('admin-dim-chart');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const dims = ['birth','family','talent','character','era','health','action'];
  const dimNames = ['出身','家庭','天赋','性格','时代','健康','行动'];
  const dimColors = ['#5B7FFF','#FF6B8A','#FFB347','#3DD9A0','#A78BFA','#FF8C69','#7DD3FC'];

  const avgs = dims.map(d => records.length ? Math.round(records.reduce((s, r) => s + (r.dimScores[d] || 0), 0) / records.length) : 0);

  const maxVal = 100;
  const barW = (W - 100) / dims.length - 16;
  const startX = 50;

  ctx.fillStyle = '#8892BE';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  dims.forEach((_, i) => { ctx.fillText(dimNames[i], startX + i * (barW + 16) + barW / 2, H - 10); });

  avgs.forEach((avg, i) => {
    const barH = (avg / maxVal) * (H - 55);
    const x = startX + i * (barW + 16);
    const y = H - 45 - barH;

    const grad = ctx.createLinearGradient(x, y, x, H - 45);
    grad.addColorStop(0, dimColors[i]);
    grad.addColorStop(1, dimColors[i] + '44');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, [6, 6, 0, 0]);
    ctx.fill();

    ctx.fillStyle = dimColors[i];
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(avg, x + barW / 2, y - 8);
  });

  // 参考线
  [25, 50, 75].forEach(v => {
    const y = H - 45 - (v / maxVal) * (H - 55);
    ctx.strokeStyle = 'rgba(91,127,255,0.08)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(startX - 10, y);
    ctx.lineTo(W - 10, y);
    ctx.stroke();
    ctx.setLineDash([]);
  });
}

function filterTable() {
  const kw = document.getElementById('search-input').value.toLowerCase();
  const records = getRecords().filter(r => r.name.toLowerCase().includes(kw) || r.time.includes(kw));
  renderTable(records);
}

function deleteRecord(id) {
  if (!confirm('确认删除此条记录？')) return;
  const records = getRecords().filter(r => r.id !== id);
  localStorage.setItem('life_model_records', JSON.stringify(records));
  renderAdmin();
}

function clearData() {
  if (!confirm('确认清空全部测评数据？此操作不可恢复！')) return;
  localStorage.removeItem('life_model_records');
  renderAdmin();
}

function exportCSV() {
  const records = getRecords();
  if (!records.length) { showToast('暂无数据可导出'); return; }
  const header = '序号,昵称,测评时间,综合分,出身资本,原生家庭,天赋禀赋,性格特质,时代环境,身心健康,机遇把握,等级,等级名,收入预测\n';
  const rows = records.map((r, i) =>
    `${i+1},${r.name},${r.time},${r.total},${r.dimScores.birth || 0},${r.dimScores.family || 0},${r.dimScores.talent || 0},${r.dimScores.character || 0},${r.dimScores.era || 0},${r.dimScores.health || 0},${r.dimScores.action || 0},${r.level},${r.levelName},${r.incomeLabel || ''}`
  ).join('\n');
  const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '人生先天参数测评数据_' + new Date().toLocaleDateString('zh-CN').replace(/\//g, '-') + '.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

// ---- 分享 ----
let currentShareResult = null;
let currentShareName = '';
let qrcodeInstance = null;

function shareResult() {
  // 获取当前结果数据
  const records = getRecords();
  if (records.length === 0) {
    showToast('暂无测评结果可分享');
    return;
  }
  currentShareResult = records[0];
  currentShareName = currentShareResult.name;
  openShareModal();
}

function openShareModal() {
  const modal = document.getElementById('share-modal');
  const preview = document.getElementById('share-preview');
  const level = getLevel(currentShareResult.total);

  // 更新预览
  preview.innerHTML = `
    <div class="share-preview-name">${currentShareName} 的测评结果</div>
    <div class="share-preview-score">${currentShareResult.total} 分</div>
    <div class="share-preview-level" style="background:${level.color}">${level.level}级 · ${level.name}</div>
  `;

  modal.classList.add('show');
  switchShareTab('image');
}

function closeShareModal() {
  document.getElementById('share-modal').classList.remove('show');
  // 清理二维码实例和标题
  const qrcodeTitle = document.querySelector('.qrcode-title');
  if (qrcodeTitle) qrcodeTitle.remove();
  if (qrcodeInstance) {
    qrcodeInstance.clear();
    qrcodeInstance = null;
  }
}

function switchShareTab(tab) {
  // 更新标签状态
  document.querySelectorAll('.share-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');

  // 更新内容显示
  document.querySelectorAll('.share-tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('share-' + tab + '-tab').classList.add('active');

  // 根据标签执行相应操作
  if (tab === 'image') {
    generateShareImage();
  } else if (tab === 'link') {
    generateShareLink();
  } else if (tab === 'qrcode') {
    generateQRCode();
  }
}

function generateShareImage() {
  const preview = document.getElementById('share-image-preview');
  preview.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text2);">正在生成图片...</div>';
  preview.classList.add('show');

  // 创建用于生成图片的 DOM 结构
  const shareCard = document.createElement('div');
  shareCard.style.cssText = `
    width: 400px;
    padding: 32px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    color: #fff;
    text-align: center;
  `;

  const level = getLevel(currentShareResult.total);
  const pred = currentShareResult.predictions || {};

  shareCard.innerHTML = `
    <div style="font-size: 13px; opacity: 0.85; margin-bottom: 6px;">🏛️ 人生先天参数评分模型</div>
    <div style="font-size: 22px; font-weight: bold; margin-bottom: 16px;">${currentShareName}</div>
    <div style="font-size: 72px; font-weight: 900; margin-bottom: 8px;">${currentShareResult.total}</div>
    <div style="display: inline-block; padding: 5px 18px; background: rgba(255,255,255,0.2); border-radius: 999px; font-size: 13px; font-weight: bold; margin-bottom: 16px;">
      ${level.level}级 · ${level.name} · 前${level.percentile}
    </div>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 12px;">
      <div style="background: rgba(255,255,255,0.15); padding: 6px 8px; border-radius: 8px; font-size: 11px;">
        <div style="opacity: 0.8;">🏛️ 出身</div>
        <div style="font-weight: bold; font-size: 14px;">${currentShareResult.dimScores.birth}</div>
      </div>
      <div style="background: rgba(255,255,255,0.15); padding: 6px 8px; border-radius: 8px; font-size: 11px;">
        <div style="opacity: 0.8;">🏠 家庭</div>
        <div style="font-weight: bold; font-size: 14px;">${currentShareResult.dimScores.family}</div>
      </div>
      <div style="background: rgba(255,255,255,0.15); padding: 6px 8px; border-radius: 8px; font-size: 11px;">
        <div style="opacity: 0.8;">🧠 天赋</div>
        <div style="font-weight: bold; font-size: 14px;">${currentShareResult.dimScores.talent}</div>
      </div>
      <div style="background: rgba(255,255,255,0.15); padding: 6px 8px; border-radius: 8px; font-size: 11px;">
        <div style="opacity: 0.8;">🎭 性格</div>
        <div style="font-weight: bold; font-size: 14px;">${currentShareResult.dimScores.character}</div>
      </div>
      <div style="background: rgba(255,255,255,0.15); padding: 6px 8px; border-radius: 8px; font-size: 11px;">
        <div style="opacity: 0.8;">🌍 时代</div>
        <div style="font-weight: bold; font-size: 14px;">${currentShareResult.dimScores.era}</div>
      </div>
      <div style="background: rgba(255,255,255,0.15); padding: 6px 8px; border-radius: 8px; font-size: 11px;">
        <div style="opacity: 0.8;">🏥 健康</div>
        <div style="font-weight: bold; font-size: 14px;">${currentShareResult.dimScores.health}</div>
      </div>
      <div style="background: rgba(255,255,255,0.15); padding: 6px 8px; border-radius: 8px; font-size: 11px;">
        <div style="opacity: 0.8;">⚡ 行动</div>
        <div style="font-weight: bold; font-size: 14px;">${currentShareResult.dimScores.action}</div>
      </div>
      <div style="background: rgba(255,255,255,0.15); padding: 6px 8px; border-radius: 8px; font-size: 11px;">
        <div style="opacity: 0.8;">💰 收入</div>
        <div style="font-weight: bold; font-size: 14px;">${pred.income || '--'}</div>
      </div>
    </div>
    <div style="font-size: 10px; opacity: 0.5; margin-top: 12px;">基于社会学 · 经济学 · 心理学 · 教育学</div>
  `;

  document.body.appendChild(shareCard);

  // 使用 html2canvas 生成图片
  if (typeof html2canvas !== 'undefined') {
    html2canvas(shareCard, {
      backgroundColor: null,
      scale: 2,
      useCORS: true
    }).then(canvas => {
      document.body.removeChild(shareCard);

      const imgData = canvas.toDataURL('image/png');
      preview.innerHTML = `
        <img src="${imgData}" alt="分享图片" />
        <div class="share-image-actions">
          <button class="btn-save-image" onclick="saveShareImage('${imgData}')">💾 保存图片</button>
          <button class="btn-share-image" onclick="shareImageExternal('${imgData}')">📤 分享图片</button>
        </div>
      `;
      preview.classList.add('show');
    }).catch(err => {
      document.body.removeChild(shareCard);
      preview.innerHTML = '<div style="text-align:center;padding:20px;color:var(--red);">生成失败，请重试</div>';
      console.error('html2canvas error:', err);
    });
  } else {
    document.body.removeChild(shareCard);
    preview.innerHTML = '<div style="text-align:center;padding:20px;color:var(--red);">图片生成库加载失败</div>';
  }
}

function saveShareImage(imgData) {
  const link = document.createElement('a');
  link.download = '人生测评结果_' + currentShareName + '_' + new Date().toLocaleDateString('zh-CN').replace(/\//g, '-') + '.png';
  link.href = imgData;
  link.click();
  showToast('图片已保存');
}

function shareImageExternal(imgData) {
  // 如果支持 Web Share API with files
  if (navigator.share && navigator.canShare) {
    fetch(imgData)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'share.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          navigator.share({
            files: [file],
            title: '人生先天参数测评结果',
            text: currentShareName + '的测评结果：' + currentShareResult.total + '分'
          });
        } else {
          copyImageToClipboard(imgData);
        }
      })
      .catch(() => copyImageToClipboard(imgData));
  } else {
    copyImageToClipboard(imgData);
  }
}

function copyImageToClipboard(imgData) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.onload = function() {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    canvas.toBlob(blob => {
      navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]).then(() => {
        showToast('图片已复制到剪贴板');
      }).catch(() => {
        showToast('图片复制失败，请长按图片保存');
      });
    });
  };
  img.src = imgData;
}

function generateShareLink() {
  const input = document.getElementById('share-link-input');
  if (typeof getShareUrl === 'function') {
    const url = getShareUrl(currentShareResult, currentShareName);
    input.value = url || window.location.href;
  } else {
    input.value = window.location.href;
  }
}

function copyShareLink() {
  const input = document.getElementById('share-link-input');
  input.select();
  document.execCommand('copy');
  showToast('链接已复制到剪贴板');
}

function generateQRCode() {
  const container = document.getElementById('qrcode-container');

  // 修复：先移除旧标题，防止重复
  const oldTitle = document.querySelector('.qrcode-title');
  if (oldTitle) oldTitle.remove();

  container.innerHTML = '';

  // 生成标题
  let shareTitle = '📊 人生先天参数测评';
  if (currentShareResult && currentShareName) {
    const level = getLevel(currentShareResult.total);
    shareTitle = '📊 人生先天参数 | ' + currentShareName + ' | ' + currentShareResult.total + '分 | ' + level.level + '级';
  }

  // 添加标题
  container.insertAdjacentHTML('beforebegin', '<div class="qrcode-title">' + shareTitle + '</div>');

  // 生成分享 URL
  const baseUrl = window.location.origin + window.location.pathname;
  let url = baseUrl;
  if (typeof encodeShareData === 'function' && currentShareResult) {
    const encoded = encodeShareData(currentShareResult, currentShareName);
    if (encoded) {
      url = baseUrl + '?share=' + encoded;
    }
  }

  // 使用二维码
  if (typeof QRCode !== 'undefined') {
    try {
      // 先清空容器
      container.innerHTML = '';

      // 创建美化容器
      const wrapper = document.createElement('div');
      wrapper.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
        padding: 24px;
        border-radius: 20px;
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        box-shadow: 0 12px 40px rgba(102,126,234,0.4), 0 4px 12px rgba(0,0,0,0.1);
        border: 3px solid rgba(255,255,255,0.3);
      `;

      // 顶部品牌标识
      const brand = document.createElement('div');
      brand.style.cssText = 'color: white; font-size: 12px; font-weight: bold; text-shadow: 0 1px 2px rgba(0,0,0,0.2); letter-spacing: 1px;';
      brand.textContent = '🏛️ 人生先天参数';
      wrapper.appendChild(brand);

      // 二维码容器
      const qrWrapper = document.createElement('div');
      qrWrapper.style.cssText = 'background: white; padding: 10px; border-radius: 12px; box-shadow: inset 0 2px 8px rgba(0,0,0,0.1);';
      qrcodeInstance = new QRCode(qrWrapper, {
        text: url,
        width: 180,
        height: 180,
        colorDark: '#1A2040',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
      wrapper.appendChild(qrWrapper);

      // 底部提示
      const tip = document.createElement('div');
      tip.style.cssText = 'color: rgba(255,255,255,0.9); font-size: 11px; text-shadow: 0 1px 2px rgba(0,0,0,0.2);';
      tip.textContent = '👆 扫码查看我的测评结果';
      wrapper.appendChild(tip);

      // 清理多余的子元素
      setTimeout(() => {
        const children = qrWrapper.children;
        for (let i = children.length - 1; i > 0; i--) {
          children[i].remove();
        }
        const firstChild = qrWrapper.firstElementChild;
        if (firstChild) {
          firstChild.style.cssText = 'display: block; border-radius: 4px;';
        }
      }, 50);

      container.appendChild(wrapper);
      console.log('[二维码] 生成成功');
    } catch(e) {
      console.error('[二维码] 生成失败:', e);
      container.innerHTML = '<div style="text-align:center;color:var(--red);padding:20px;">二维码生成失败</div>';
    }
  } else {
    console.error('[二维码] QRCode 未定义');
    container.innerHTML = '<div style="text-align:center;color:var(--red);padding:20px;">二维码库加载失败</div>';
  }
}

function downloadQRCode() {
  const container = document.getElementById('qrcode-container');
  const canvas = container.querySelector('canvas');
  const img = container.querySelector('img');
  
  if (canvas) {
    const link = document.createElement('a');
    link.download = '人生测评二维码_' + currentShareName + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('二维码已下载');
  } else if (img) {
    const link = document.createElement('a');
    link.download = '人生测评二维码_' + currentShareName + '.png';
    link.href = img.src;
    link.click();
    showToast('二维码已下载');
  } else {
    showToast('请先生成二维码');
  }
}

// ---- Toast ----
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 2500);
}

// ---- 初始化 ----
updateTotalCount();

// 检查是否有分享数据
(function() {
  const params = new URLSearchParams(window.location.search);
  const shareData = params.get('share');
  if (shareData && typeof decodeShareData === 'function') {
    const data = decodeShareData(shareData);
    if (data) {
      // 显示分享结果预览
      setTimeout(() => {
        showToast('收到 ' + data.n + ' 的分享！');
        // 可以在这里显示一个分享结果预览弹窗
      }, 500);
    }
  }
})();

// ---- 按钮事件绑定 ----
(function() {
  var startBtn = document.getElementById('btn-start');
  if (startBtn) {
    startBtn.addEventListener('click', function() {
      if (typeof startAssessment === 'function') startAssessment();
    });
  }
})();
