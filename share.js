// ============================================================
// 分享模块 — 生成图片、链接、二维码分享
// ============================================================

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
