// ============================================================
// 后台管理模块 — 数据查看、统计、导出
// ============================================================

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
  const blob = new Blob(['﻿' + header + rows], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '人生先天参数测评数据_' + new Date().toLocaleDateString('zh-CN').replace(/\//g, '-') + '.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}
