document.getElementById("app").innerHTML = `
<div class="rid-shell">
  <header class="rid-header">
    <div>
      <h1>Roulette Intelligence Dashboard <span>(RID)</span></h1>
      <p>Accurate session analytics, strategy comparison, bankroll simulation, and custom number testing</p>
    </div>
    <div class="header-actions">
      <label class="upload-btn">Upload Excel<input id="excelFileInput" type="file" accept=".xlsx,.xls" hidden></label>
      <button class="secondary-btn" id="printBtn" type="button">Export PDF</button>
    </div>
  </header>

  <div class="statusbar">
    <div id="statusText">No file loaded</div>
    <div><strong id="sessionRange">—</strong></div>
  </div>


  <section class="panel data-health-panel">
    <div class="panel-heading">
      <div>
        <h2>Historical Data Health Report</h2>
        <p>Automatic cleaning runs before any dashboard analysis.</p>
      </div>
    </div>
    <div id="dataHealthContent" class="health-grid">
      <div class="placeholder-content">Upload the historical Excel workbook to scan all sheets.</div>
    </div>
  </section>

  <section class="summary-grid">
    <article class="summary-card"><span>Total Spins</span><strong id="totalSpins">0</strong><small>Imported records</small></article>
    <article class="summary-card green-card"><span>Apne 16</span><strong id="apne16Rate">0%</strong><small id="apne16Hits">0 hits</small></article>
    <article class="summary-card blue-card"><span>Top 16</span><strong id="top16Rate">0%</strong><small id="top16Hits">0 hits</small></article>
    <article class="summary-card gold-card"><span>Top 21</span><strong id="top21Rate">0%</strong><small id="top21Hits">0 hits</small></article>
    <article class="summary-card"><span>Custom</span><strong id="customRate">0%</strong><small id="customHits">Select numbers</small></article>
    <article class="summary-card"><span>Best Hour</span><strong id="bestHour">--:--</strong><small id="bestHourRate">No custom selection</small></article>
  </section>

  <section class="panel">
    <div class="panel-heading">
      <div><h2>Strategy Builder</h2><p>Select any numbers from 0–36. The custom graph and profit simulation update instantly.</p></div>
      <div class="live-indicator"><span></span>Live analysis</div>
    </div>
    <div class="preset-row">
      <button type="button" data-preset="Apne 16">Apne 16</button>
      <button type="button" data-preset="Top 16">Top 16</button>
      <button type="button" data-preset="Top 21">Top 21</button>
      <button type="button" id="clearSelection">Clear</button>
    </div>
    <div id="numberSelector" class="number-selector"></div>
    <div class="selection-summary">
      <div><span>Selected numbers</span><strong id="selectedNumbersText">None</strong></div>
      <div class="selected-count"><strong id="selectedCount">0</strong><span>numbers</span></div>
      <div class="custom-bankroll-controls">
        <label>Custom bet / number<input id="customBetInput" type="number" min="1" step="10" value="100"></label>
        <label>Custom starting balance<input id="customBalanceInput" type="number" min="1" step="1000" value="30000"></label>
      </div>
    </div>
  </section>

  <section class="panel">
    <div class="panel-heading">
      <div>
        <h2>Hourly Hit % — 24 Hours</h2>
        <p>The six highest-performing individual hours are highlighted in red.</p>
        <p class="mobile-chart-hint">Swipe the graph sideways and tap a point to view its percentage and hits.</p>
      </div>
    </div>
    <div class="chart-area"><canvas id="hourlyPerformanceChart"></canvas></div>
  </section>

  <section class="panel">
    <div class="panel-heading">
      <div><h2>Best Six-Hour Session</h2><p>The strongest consecutive six-hour block, selected from four fixed sessions.</p></div>
    </div>
    <div id="bestSixContent" class="placeholder-content">Select custom numbers and upload data.</div>
  </section>

  <section class="lower-grid">
    <article class="panel">
      <div class="panel-heading"><div><h2>Hourly Performance Summary</h2><p>Actual hits and percentages for every calendar hour.</p></div></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Hour</th><th>Spins</th><th>Custom Hit %</th><th>Custom Hits</th></tr></thead>
          <tbody id="hourlyTableBody"><tr><td colspan="4">No Excel file loaded</td></tr></tbody>
        </table>
      </div>
    </article>
    <article class="panel">
      <div class="panel-heading"><div><h2>Key Statistics</h2><p>Streak, gap, and hit-rate metrics.</p></div></div>
      <div id="statisticsContent" class="metrics-grid"></div>
    </article>
  </section>

  <section class="panel">
    <div class="panel-heading">
      <div>
        <h2>Bankroll-Aware Profit / Loss Analysis</h2>
        <p>Automation stops when an account can no longer afford the next full stake.</p>
      </div>
    </div>
    <div id="profitContent"></div>
  </section>

  
  <section class="panel recommendation-panel">
    <div class="panel-heading">
      <div>
        <h2>Suggested Top 16 for the Next Six Hours</h2>
        <p>Based on the most recent six hours (75% weight) plus full-session frequency (25% weight). This is historical analysis, not a guarantee of future results.</p>
      </div>
    </div>
    <div id="nextSixRecommendation" class="placeholder-content">Upload data to generate the recommendation.</div>
  </section>

  <section class="lower-grid">
    <article class="panel">
      <div class="panel-heading"><div><h2>Daily Insights</h2><p>Calculated from the uploaded session.</p></div></div>
      <div id="insightsContent"></div>
    </article>
    <article class="panel">
      <div class="panel-heading"><div><h2>Top 21 Numbers (Excluding 0)</h2><p>The top 16 are marked with 🔥.</p></div></div>
      <div id="topNumbers" class="top-numbers compact-top-numbers"></div>
    </article>
  </section>


  <section class="panel">
    <div class="panel-heading">
      <div>
        <h2>What Usually Comes Next?</h2>
        <p>For each roulette number, this shows the number that appeared most often immediately afterward in the uploaded data.</p>
      </div>
    </div>
    <div id="nextNumberTable" class="next-number-grid">
      <div class="placeholder-content">Upload data to calculate number-to-number transitions.</div>
    </div>
  </section>

  <div class="footer-note">RID v1.5 · Profit calculations use separate account balances and stop at bankroll exhaustion.</div>
</div>`;

let RID_ROWS = [];
let RID_ANALYSIS = null;

RIDStrategyBuilder.init();

const customBetInput = document.getElementById("customBetInput");
const customBalanceInput = document.getElementById("customBalanceInput");

document.getElementById("excelFileInput").addEventListener("change", async event => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    setStatus(`Reading ${file.name}…`);
    const imported = await RIDExcel.readFile(file);
    RID_ROWS = imported.rows;
    if (!RID_ROWS.length) throw new Error("No valid rows found after cleaning.");
    renderDataHealth(imported.report);
    renderAll();
    setStatus(`${file.name} cleaned successfully · ${RID_ROWS.length.toLocaleString()} usable spins`);
  } catch (error) {
    setStatus(`Error: ${error.message}`, true);
  }
});

document.addEventListener("strategySelectionChanged", () => {
  if (RID_ROWS.length) renderAll();
});

[customBetInput, customBalanceInput].forEach(input => {
  input.addEventListener("input", () => {
    if (RID_ROWS.length) renderAll();
  });
});

document.getElementById("printBtn").addEventListener("click", () => window.print());


function renderDataHealth(report) {
  const removed =
    report.blankRowsRemoved +
    report.repeatedHeadersRemoved +
    report.invalidDrawNumbersRemoved +
    report.invalidDatesRemoved +
    report.duplicateRowsRemoved;

  const cards = [
    ["Sheets scanned", report.sheetsScanned],
    ["Raw rows scanned", report.rawRowsScanned.toLocaleString()],
    ["Usable spins", report.usableSpins.toLocaleString()],
    ["Rows removed", removed.toLocaleString()],
    ["Repeated headers", report.repeatedHeadersRemoved.toLocaleString()],
    ["Blank rows", report.blankRowsRemoved.toLocaleString()],
    ["Invalid draw numbers", report.invalidDrawNumbersRemoved.toLocaleString()],
    ["Invalid dates", report.invalidDatesRemoved.toLocaleString()],
    ["Duplicate rows", report.duplicateRowsRemoved.toLocaleString()],
    ["Date-format switches repaired", report.dateFormatsRepaired.toLocaleString()],
    ["Ambiguous dates resolved", report.ambiguousDatesResolved.toLocaleString()]
  ];

  dataHealthContent.innerHTML = cards.map(([label, value]) => `
    <div class="health-card">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `).join("");
}

function getCustomSettings() {
  return {
    numbers: RIDStrategyBuilder.getSelected(),
    bet: Math.max(1, Number(customBetInput.value) || 100),
    balance: Math.max(1, Number(customBalanceInput.value) || 30000)
  };
}

function setStatus(text, isError = false) {
  const element = document.getElementById("statusText");
  element.textContent = text;
  element.className = isError ? "error-box" : "";
}

function renderAll() {
  const custom = getCustomSettings();
  RID_ANALYSIS = RIDAnalysis.analyzeAll(RID_ROWS, custom.numbers);

  renderKpis(RID_ANALYSIS, custom.numbers);
  RIDCharts.renderHourly(RID_ANALYSIS, custom.numbers);
  renderHourlyTable(RID_ANALYSIS, custom.numbers);
  renderStats(RID_ANALYSIS, custom.numbers);
  renderProfit(RIDProfit.all(RID_ROWS, custom.numbers, custom.bet, custom.balance));
  renderBestSix(RID_ANALYSIS, custom);
  renderInsights(RIDInsights.build(RID_ANALYSIS));
  renderTopNumbers(RID_ANALYSIS.frequency);
  renderRecommendation(RIDAnalysis.recommendNextSix(RID_ROWS,16));
  renderNextNumberTable(RIDAnalysis.nextNumberMap(RID_ROWS));
  renderRange();
}

function renderKpis(analysis, customNumbers) {
  totalSpins.textContent = analysis.total.toLocaleString();
  apne16Rate.textContent = analysis.a.hitRate.toFixed(2) + "%";
  apne16Hits.textContent = `${analysis.a.hits.toLocaleString()} hits`;
  top16Rate.textContent = analysis.b.hitRate.toFixed(2) + "%";
  top16Hits.textContent = `${analysis.b.hits.toLocaleString()} hits`;
  top21Rate.textContent = analysis.c.hitRate.toFixed(2) + "%";
  top21Hits.textContent = `${analysis.c.hits.toLocaleString()} hits`;

  if (customNumbers.length) {
    customRate.textContent = analysis.custom.hitRate.toFixed(2) + "%";
    customHits.textContent = `${analysis.custom.hits.toLocaleString()} hits`;

    const best = getBestSession(analysis.hourlyCustom);
    if (best) {
      bestHour.textContent = best.label;
      bestHourRate.textContent = `${best.rate.toFixed(2)}% (${best.hits}/${best.spins})`;
    }
  } else {
    customRate.textContent = "0%";
    customHits.textContent = "Select numbers";
    bestHour.textContent = "--:--";
    bestHourRate.textContent = "No custom selection";
  }
}

function hourEndLabel(hour) {
  return hour === 23 ? "00:01" : `${String(hour + 1).padStart(2, "0")}:00`;
}

function hourRangeLabel(hour) {
  return `${String(hour).padStart(2, "0")}:00–${hourEndLabel(hour)}`;
}

function getBestSession(hourlyRows) {
  const sessions = [
    { start: 0, end: 5, label: "00:00–06:00" },
    { start: 6, end: 11, label: "06:00–12:00" },
    { start: 12, end: 17, label: "12:00–18:00" },
    { start: 18, end: 23, label: "18:00–00:01" }
  ].map(session => {
    const rows = hourlyRows.slice(session.start, session.end + 1);
    const hits = rows.reduce((sum, row) => sum + row.hits, 0);
    const spins = rows.reduce((sum, row) => sum + row.spins, 0);
    const rate = spins ? (hits / spins) * 100 : 0;
    return { ...session, hits, spins, rate };
  });

  return sessions.sort((a, b) =>
    b.hits - a.hits || b.rate - a.rate || a.start - b.start
  )[0];
}

function renderHourlyTable(analysis, customNumbers) {
  if (!customNumbers.length) {
    hourlyTableBody.innerHTML = `<tr><td colspan="4">No custom numbers selected</td></tr>`;
    return;
  }

  hourlyTableBody.innerHTML = analysis.hourlyCustom.map((row, hour) => `
    <tr>
      <td>${hourRangeLabel(hour)}</td>
      <td>${row.spins}</td>
      <td>${row.rate.toFixed(2)}%</td>
      <td>${row.hits}</td>
    </tr>
  `).join("");
}

function renderStats(analysis, customNumbers) {
  const items = customNumbers.length ? [
    ["Selected numbers", customNumbers.length],
    ["Custom hits", analysis.custom.hits],
    ["Custom hit rate", analysis.custom.hitRate.toFixed(2) + "%"],
    ["Longest miss streak", analysis.custom.longestMiss],
    ["Current miss streak", analysis.custom.currentMiss],
    ["Average miss gap", analysis.custom.avgGap.toFixed(2)],
    ["Longest hit streak", analysis.custom.longestHit],
    ["Total spins", analysis.total]
  ] : [
    ["Apne 16 hit rate", analysis.a.hitRate.toFixed(2) + "%"],
    ["Top 16 hit rate", analysis.b.hitRate.toFixed(2) + "%"],
    ["Top 21 hit rate", analysis.c.hitRate.toFixed(2) + "%"],
    ["Total spins", analysis.total]
  ];

  statisticsContent.innerHTML = items
    .map(([label, value]) => `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

function stoppedText(result) {
  if (!result.stopped) return "Completed";
  if (!result.stoppedAt) return "Could not start";
  return `Stopped ${result.stoppedAt.toLocaleString()}`;
}

function renderProfit(results) {
  const rows = [
    ["Apne 16", results.apne],
    ["Top 16", results.top16],
    ["Top 21", results.top21],
    ["Today's Top 16", results.dailyTop16],
    ["Today's Top 21", results.dailyTop21],
    ["Custom Selection", results.custom]
  ];

  profitContent.innerHTML = `
    <div class="table-wrap">
      <table class="profit-table">
        <thead>
          <tr>
            <th>Strategy</th>
            <th>Starting Balance</th>
            <th>Stake / Spin</th>
            <th>Played Spins</th>
            <th>Hits</th>
            <th>Ending Balance</th>
            <th>Net P/L</th>
            <th>ROI</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(([name, result]) => profitRow(name, result)).join("")}
        </tbody>
      </table>
    </div>
    <p class="calculation-note">
      A straight-up winning number returns 36× that number's stake. Every row is simulated in chronological order.
    </p>
  `;
}

function profitRow(name, result) {
  const cls = result.net >= 0 ? "positive" : "negative";
  const noCustom = name === "Custom Selection" && !result.numbers.length;

  if (noCustom) {
    return `<tr><td>${name}</td><td colspan="8">Select custom numbers to calculate this strategy.</td></tr>`;
  }

  return `
    <tr>
      <td>${name}<small class="strategy-numbers">${result.numbers.join(", ")}</small></td>
      <td>${money(result.startingBalance)}</td>
      <td>${money(result.stakePerSpin)}</td>
      <td>${result.playedSpins.toLocaleString()}</td>
      <td>${result.hits.toLocaleString()}</td>
      <td>${money(result.endingBalance)}</td>
      <td class="${cls}">${money(result.net)}</td>
      <td class="${cls}">${result.roi.toFixed(2)}%</td>
      <td class="${result.stopped ? "negative" : "positive"}">${stoppedText(result)}</td>
    </tr>
  `;
}

function renderBestSix(analysis, custom) {
  if (!custom.numbers.length) {
    bestSixContent.innerHTML = "Select custom numbers to calculate the best six-hour session.";
    return;
  }

  const bestSession = getBestSession(analysis.hourlyCustom);
  const hours = Array.from(
    { length: bestSession.end - bestSession.start + 1 },
    (_, index) => bestSession.start + index
  );
  const profits = RIDProfit.forBestHours(
    RID_ROWS,
    hours,
    custom.numbers,
    custom.bet,
    custom.balance
  );

  bestSixContent.innerHTML = `
    <div class="best-session-summary">
      <div>
        <span>Best Session</span>
        <strong>${bestSession.label}</strong>
      </div>
      <div>
        <span>Total Hits</span>
        <strong>${bestSession.hits}</strong>
      </div>
      <div>
        <span>Total Spins</span>
        <strong>${bestSession.spins}</strong>
      </div>
      <div>
        <span>Session Hit Rate</span>
        <strong>${bestSession.rate.toFixed(2)}%</strong>
      </div>
    </div>
    <div class="table-wrap">
      <table class="profit-table">
        <thead>
          <tr>
            <th>Strategy</th>
            <th>Starting Balance</th>
            <th>Played Spins</th>
            <th>Hits</th>
            <th>Ending Balance</th>
            <th>Profit / Loss</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${bestSixProfitRow("Apne 16", profits.apne)}
          ${bestSixProfitRow("Top 16", profits.top16)}
          ${bestSixProfitRow("Top 21", profits.top21)}
          ${bestSixProfitRow("Custom Selection", profits.custom)}
        </tbody>
      </table>
    </div>
  `;
}

function bestSixProfitRow(name, result) {
  const cls = result.net >= 0 ? "positive" : "negative";
  return `
    <tr>
      <td>${name}</td>
      <td>${money(result.startingBalance)}</td>
      <td>${result.playedSpins}</td>
      <td>${result.hits}</td>
      <td>${money(result.endingBalance)}</td>
      <td class="${cls}">${money(result.net)}</td>
      <td>${stoppedText(result)}</td>
    </tr>
  `;
}

function renderInsights(items) {
  insightsContent.innerHTML = `<ul class="insights-list">${items.map(item => `<li>${item}</li>`).join("")}</ul>`;
}

function renderTopNumbers(frequency) {
  const top = frequency
    .map((count, number) => ({ number, count }))
    .filter(item => item.number !== 0)
    .sort((a, b) => b.count - a.count || a.number - b.number)
    .slice(0, 21);

  topNumbers.innerHTML = top.map((item, index) => `
    <div class="top-number ${index < 16 ? "top-fire" : ""}">
      ${index < 16 ? '<span class="fire-badge">🔥</span>' : ""}
      <strong>${item.number}</strong>
      <small>#${index + 1} · ${item.count} hits</small>
    </div>
  `).join("");
}


function renderRecommendation(recommendation) {
  if (!recommendation.numbers.length) {
    nextSixRecommendation.innerHTML = "No valid timestamped data available.";
    return;
  }

  nextSixRecommendation.innerHTML = `
    <div class="recommendation-summary">
      <div>
        <span>Analysis Window</span>
        <strong>${recommendation.windowLabel}</strong>
      </div>
      <div>
        <span>Recent Spins Used</span>
        <strong>${recommendation.recentSpins}</strong>
      </div>
      <div>
        <span>Suggested Set Size</span>
        <strong>16 numbers</strong>
      </div>
    </div>
    <div class="recommended-number-grid">
      ${recommendation.details.map((item,index)=>`
        <div class="recommended-number">
          <span>#${index+1}</span>
          <strong>${item.number}</strong>
          <small>Last 6h: ${item.recentHits} hits · Full session: ${item.fullHits}</small>
        </div>
      `).join("")}
    </div>
    <div class="recommendation-copy">
      <strong>Suggested Top 16:</strong>
      <span>${recommendation.numbers.join(", ")}</span>
    </div>
  `;
}


function renderNextNumberTable(rows) {
  const container = document.getElementById("nextNumberTable");
  if (!container) return;
  container.innerHTML = rows.map(item => `
    <div class="next-number-card">
      <div class="next-number-origin"><span>After</span><strong>${item.number}</strong></div>
      <div class="next-number-arrow">→</div>
      <div class="next-number-result"><span>Most often</span><strong>${item.nextNumber === null ? "—" : item.nextNumber}</strong><small>${item.count} times · ${item.rate.toFixed(2)}%</small></div>
    </div>`).join("");
}

function renderRange() {
  const valid = RID_ROWS.filter(row => row.time);
  if (!valid.length) {
    sessionRange.textContent = "No valid timestamps";
    return;
  }

  const range = valid.reduce((result, row) => {
    const timestamp = row.time.getTime();
    if (timestamp < result.minimum) result.minimum = timestamp;
    if (timestamp > result.maximum) result.maximum = timestamp;
    return result;
  }, { minimum: Infinity, maximum: -Infinity });

  const minimum = new Date(range.minimum);
  const maximum = new Date(range.maximum);
  sessionRange.textContent = `${minimum.toLocaleString()} → ${maximum.toLocaleString()}`;
}
