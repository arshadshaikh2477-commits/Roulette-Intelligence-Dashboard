document.getElementById("app").innerHTML = `
<div class="rid-shell">

    <header class="rid-header">
        <div>
            <h1>Roulette Intelligence Dashboard <span>(RID)</span></h1>
            <p>Daily analysis and custom strategy performance</p>
        </div>

        <div class="header-actions">
            <label class="upload-btn">
                Upload Excel
                <input id="excelFileInput" type="file" accept=".xlsx,.xls" hidden>
            </label>

            <button class="secondary-btn" type="button">
                Export PDF
            </button>
        </div>
    </header>

    <section class="summary-grid">
        <article class="summary-card">
            <span>Total Spins</span>
            <strong id="totalSpins">0</strong>
        </article>

        <article class="summary-card green-card">
            <span>Apne 16</span>
            <strong id="apne16Rate">0%</strong>
            <small id="apne16Hits">0 hits</small>
        </article>

        <article class="summary-card blue-card">
            <span>Top 16</span>
            <strong id="top16Rate">0%</strong>
            <small id="top16Hits">0 hits</small>
        </article>

        <article class="summary-card gold-card">
            <span>Top 21</span>
            <strong id="top21Rate">0%</strong>
            <small id="top21Hits">0 hits</small>
        </article>

        <article class="summary-card red-card">
            <span>Combined</span>
            <strong id="combinedRate">0%</strong>
            <small id="combinedHits">0 hits</small>
        </article>

        <article class="summary-card">
            <span>Best Hour</span>
            <strong id="bestHour">--:--</strong>
            <small id="bestHourRate">No data loaded</small>
        </article>
    </section>

    <section class="panel strategy-panel">
        <div class="panel-heading">
            <div>
                <h2>Strategy Builder</h2>
                <p>Select any roulette numbers. Analysis will update instantly.</p>
            </div>

            <div class="live-indicator">
                <span></span>
                Live analysis
            </div>
        </div>

        <div class="preset-row">
            <button type="button"
                onclick="RIDStrategyBuilder.loadPreset('Apne 16')">
                Apne 16
            </button>

            <button type="button"
                onclick="RIDStrategyBuilder.loadPreset('Top 16')">
                Top 16
            </button>

            <button type="button"
                onclick="RIDStrategyBuilder.loadPreset('Top 21')">
                Top 21
            </button>

            <button type="button"
                onclick="RIDStrategyBuilder.clearSelection()">
                Clear
            </button>
        </div>

        <div id="numberSelector" class="number-selector"></div>

        <div class="selection-summary">
            <div>
                <span>Selected numbers</span>
                <strong id="selectedNumbersText">None</strong>
            </div>

            <div class="selected-count">
                <strong id="selectedCount">0</strong>
                <span>numbers</span>
            </div>

            <div class="save-strategy">
                <input
                    id="strategyName"
                    type="text"
                    placeholder="Strategy name"
                >
                <button id="saveStrategyBtn" type="button">
                    Save Strategy
                </button>
            </div>
        </div>
    </section>

    <section class="panel chart-panel">
        <div class="panel-heading">
            <div>
                <h2>Hourly Hit % — 24 Hours</h2>
                <p>Percentage and actual hits for each calendar hour</p>
            </div>
        </div>

        <div class="chart-area">
            <canvas id="hourlyPerformanceChart"></canvas>
            <div class="empty-chart-message">
                Upload an Excel file to generate the hourly graph.
            </div>
        </div>
    </section>

    <section class="lower-grid">
        <article class="panel">
            <div class="panel-heading">
                <div>
                    <h2>Hourly Performance Summary</h2>
                    <p>Hit percentage and actual hit count</p>
                </div>
            </div>

            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Hour</th>
                            <th>Spins</th>
                            <th>Apne 16</th>
                            <th>Top 16</th>
                            <th>Top 21</th>
                            <th>Combined</th>
                        </tr>
                    </thead>
                    <tbody id="hourlyTableBody">
                        <tr>
                            <td colspan="6">No Excel file loaded</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </article>

        <article class="panel">
            <div class="panel-heading">
                <div>
                    <h2>Key Statistics</h2>
                    <p>Strategy-level session performance</p>
                </div>
            </div>

            <div id="statisticsContent" class="placeholder-content">
                Statistics will appear after uploading data.
            </div>
        </article>
    </section>

    <section class="lower-grid">
        <article class="panel">
            <div class="panel-heading">
                <div>
                    <h2>Profit / Loss Analysis</h2>
                    <p>Apne 16 and Top 16: ₹100 per number · Top 21: ₹150 per number</p>
                </div>
            </div>

            <div id="profitContent" class="placeholder-content">
                Profit calculations will appear here.
            </div>
        </article>

        <article class="panel">
            <div class="panel-heading">
                <div>
                    <h2>Insights</h2>
                    <p>Automatic summary of the uploaded session</p>
                </div>
            </div>

            <div id="insightsContent" class="placeholder-content">
                Insights will appear after uploading data.
            </div>
        </article>
    </section>

</div>
`;

window.RIDStrategyBuilder.createNumberSelector();

document.addEventListener("strategySelectionChanged", event => {
    console.log("Selected numbers:", event.detail.numbers);
});