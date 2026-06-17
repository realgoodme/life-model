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

  // 根据显示尺寸动态调整画布大小
  const displayW = canvas.clientWidth;
  const displayH = canvas.clientHeight || canvas.clientWidth;
  canvas.width = displayW;
  canvas.height = displayH;

  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  const R = Math.min(W, H) / 2 - (W < 400 ? 50 : 65);
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
      ctx.fillStyle = 'rgba(90,104,153,0.9)';
      const fontSize = Math.max(12, W / 45);
      ctx.font = 'bold ' + fontSize + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ring * 20, cx + 6, cy - R * ring / 5 + fontSize / 3);
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
    const labelR = R + (W < 400 ? 35 : 45);
    const x = cx + Math.cos(a) * labelR;
    const y = cy + Math.sin(a) * labelR;
    ctx.fillStyle = DIMENSIONS[d].color;
    const fontSize1 = Math.max(13, W / 40);
    ctx.font = 'bold ' + fontSize1 + 'px sans-serif';
    ctx.textAlign = Math.abs(Math.cos(a)) < 0.1 ? 'center' : (Math.cos(a) > 0 ? 'left' : 'right');
    ctx.textBaseline = 'middle';
    ctx.fillText(DIMENSIONS[d].icon + ' ' + DIMENSIONS[d].name, x, y);
    ctx.fillStyle = 'rgba(90,104,153,0.9)';
    const fontSize2 = Math.max(11, W / 50);
    ctx.font = 'bold ' + fontSize2 + 'px sans-serif';
    ctx.fillText(dimScores[d] + '分', x, y + fontSize1 + 4);
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
      setTimeout(() => {
        showToast('收到 ' + data.n + ' 的分享！');
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
