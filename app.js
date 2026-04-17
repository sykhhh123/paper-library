async function loadPapers() {
  const response = await fetch('./site-data/papers.json');
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

function uniqueValues(items, key) {
  return [...new Set(items.flatMap(item => item[key] || []))].sort();
}

function uniqueTypes(items) {
  return [...new Set(items.map(item => item.type).filter(Boolean))].sort();
}

function matchesQuery(item, query) {
  if (!query) return true;
  const text = [
    item.title,
    item.abstract,
    item.summary,
    item.venue,
    ...(item.keywords || []),
    ...(item.categories || []),
    ...(item.innovations || [])
  ].join(' ').toLowerCase();
  return text.includes(query.toLowerCase());
}

function sortItems(items, sortBy) {
  const result = [...items];
  if (sortBy === 'published_desc') {
    result.sort((a, b) => (b.sort_timestamp || '').localeCompare(a.sort_timestamp || ''));
  } else if (sortBy === 'published_asc') {
    result.sort((a, b) => (a.sort_timestamp || '').localeCompare(b.sort_timestamp || ''));
  } else if (sortBy === 'added_desc') {
    result.sort((a, b) => (b.added_at || '').localeCompare(a.added_at || ''));
  } else if (sortBy === 'title_asc') {
    result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  }
  return result;
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function parseDate(value) {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function getItemDate(item) {
  return parseDate(item.date_published || item.sort_timestamp || item.added_at || '');
}

function formatDateLabel(value, fallback) {
  if (!value) return fallback;
  return value;
}

function matchesDate(item, presetValue, fromValue, toValue) {
  const itemDate = getItemDate(item);
  if (!itemDate) return !presetValue && !fromValue && !toValue;

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (presetValue && presetValue !== 'custom') {
    const days = Number(presetValue);
    if (!Number.isFinite(days)) return true;
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));
    return itemDate >= start && itemDate <= today;
  }

  const fromDate = parseDate(fromValue);
  const toDate = parseDate(toValue);
  if (fromDate && itemDate < fromDate) return false;
  if (toDate) {
    toDate.setHours(23, 59, 59, 999);
    if (itemDate > toDate) return false;
  }
  return true;
}

function render(items) {
  const list = document.getElementById('paperList');
  const stats = document.getElementById('stats');
  stats.textContent = `共 ${items.length} 条收录`;

  if (!items.length) {
    list.innerHTML = document.getElementById('emptyStateTemplate').innerHTML;
    return;
  }

  list.innerHTML = items.map(item => {
    const categories = (item.categories || []).map(v => `<span class="tag">${escapeHtml(v)}</span>`).join('');
    const keywords = (item.keywords || []).slice(0, 8).map(v => `<span class="tag">#${escapeHtml(v)}</span>`).join('');
    const innovations = (item.innovations || []).map(v => `<li>${escapeHtml(v)}</li>`).join('');
    const authors = (item.authors || []).join(', ');

    return `
      <article class="card">
        <div class="card-top">
          <span class="badge">${escapeHtml((item.type || 'paper').toUpperCase())}</span>
          <span class="badge">${escapeHtml(item.year || '')}</span>
          ${item.venue ? `<span class="badge">${escapeHtml(item.venue)}</span>` : ''}
        </div>
        <h2>${escapeHtml(item.title)}</h2>
        <div class="meta">
          ${authors ? `作者：${escapeHtml(authors)} · ` : ''}
          发布时间：${escapeHtml(item.date_published || item.year || '未知')} · 收录时间：${escapeHtml(item.added_at || '未知')}
        </div>
        <p><strong class="section-title">摘要</strong>${escapeHtml(item.abstract || '')}</p>
        <p><strong class="section-title">总结</strong>${escapeHtml(item.summary || '')}</p>
        <div>
          <strong class="section-title">创新点</strong>
          <ul>${innovations}</ul>
        </div>
        <div class="tags">${categories}${keywords}</div>
        <div class="card-footer">
          ${item.source_url ? `<a class="button-link" href="${escapeHtml(item.source_url)}" target="_blank" rel="noopener noreferrer">查看原文</a>` : ''}
          ${item.canonical_url ? `<a class="button-link secondary" href="${escapeHtml(item.canonical_url)}" target="_blank" rel="noopener noreferrer">Canonical 链接</a>` : ''}
        </div>
      </article>
    `;
  }).join('');
}

function setup(items) {
  const searchInput = document.getElementById('searchInput');
  const typeFilter = document.getElementById('typeFilter');
  const categoryFilter = document.getElementById('categoryFilter');
  const sortSelect = document.getElementById('sortSelect');
  const datePresetFilter = document.getElementById('datePresetFilter');
  const dateFrom = document.getElementById('dateFrom');
  const dateTo = document.getElementById('dateTo');
  const dateFromButton = document.getElementById('dateFromButton');
  const dateToButton = document.getElementById('dateToButton');
  const dateFromText = document.getElementById('dateFromText');
  const dateToText = document.getElementById('dateToText');

  uniqueTypes(items).forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    typeFilter.appendChild(option);
  });

  uniqueValues(items, 'categories').forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  function updateDateTexts() {
    dateFromText.textContent = formatDateLabel(dateFrom.value, '选择开始日期');
    dateToText.textContent = formatDateLabel(dateTo.value, '选择结束日期');
  }

  function update() {
    const query = searchInput.value.trim();
    const type = typeFilter.value;
    const category = categoryFilter.value;
    const sortBy = sortSelect.value;
    const presetValue = datePresetFilter.value;
    const fromValue = dateFrom.value;
    const toValue = dateTo.value;

    const filtered = items.filter(item => {
      const okQuery = matchesQuery(item, query);
      const okType = !type || item.type === type;
      const okCategory = !category || (item.categories || []).includes(category);
      const okDate = matchesDate(item, presetValue, fromValue, toValue);
      return okQuery && okType && okCategory && okDate;
    });

    render(sortItems(filtered, sortBy));
  }

  function syncDateModeFromPreset() {
    const isCustom = datePresetFilter.value === 'custom';
    dateFrom.disabled = !isCustom;
    dateTo.disabled = !isCustom;
    dateFromButton.disabled = !isCustom;
    dateToButton.disabled = !isCustom;
    if (!isCustom) {
      dateFrom.value = '';
      dateTo.value = '';
    }
    updateDateTexts();
  }

  function openPicker(input) {
    if (input.disabled) return;
    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }
    input.focus();
    input.click();
  }

  function switchToCustomIfNeeded() {
    if (dateFrom.value || dateTo.value) {
      datePresetFilter.value = 'custom';
    }
    syncDateModeFromPreset();
    update();
  }

  searchInput.addEventListener('input', update);
  typeFilter.addEventListener('change', update);
  categoryFilter.addEventListener('change', update);
  sortSelect.addEventListener('change', update);
  datePresetFilter.addEventListener('change', () => {
    syncDateModeFromPreset();
    update();
  });

  dateFromButton.addEventListener('click', () => openPicker(dateFrom));
  dateToButton.addEventListener('click', () => openPicker(dateTo));
  dateFrom.addEventListener('change', () => {
    updateDateTexts();
    switchToCustomIfNeeded();
  });
  dateTo.addEventListener('change', () => {
    updateDateTexts();
    switchToCustomIfNeeded();
  });

  syncDateModeFromPreset();
  update();
}

loadPapers().then(setup).catch(err => {
  document.getElementById('stats').textContent = `加载失败：${err.message}`;
});
