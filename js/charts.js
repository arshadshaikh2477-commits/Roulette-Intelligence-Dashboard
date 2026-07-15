window.RIDCharts = (() => {
  let hourlyChart = null;

  const pointLabelsPlugin = {
    id: "ridPointLabels",
    afterDatasetsDraw(chart) {
      const { ctx } = chart;

      chart.data.datasets.forEach((dataset, datasetIndex) => {
        const meta = chart.getDatasetMeta(datasetIndex);
        if (meta.hidden || !dataset.ridHourlySource) return;

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.font = "700 10px Inter, Arial, sans-serif";

        meta.data.forEach((point, index) => {
          // 00:00 is only the visual origin.
          if (index === 0) return;

          const row = dataset.ridHourlySource[index - 1];
          if (!row || row.spins === 0) return;

          const isTopSix = dataset.ridTopSixIndexes.has(index);
          const y = Math.max(point.y - 12, 30);
          const percentage = `${row.rate.toFixed(2)}%`;
          const hits = `(${row.hits})`;

          ctx.lineWidth = 3;
          ctx.strokeStyle = "rgba(7,17,31,.98)";
          ctx.fillStyle = isTopSix ? "#ff4d5f" : "#58d5ff";
          ctx.strokeText(percentage, point.x, y - 11);
          ctx.fillText(percentage, point.x, y - 11);

          ctx.fillStyle = isTopSix ? "#ffc1c7" : "#eaf3ff";
          ctx.strokeText(hits, point.x, y + 1);
          ctx.fillText(hits, point.x, y + 1);
        });

        ctx.restore();
      });
    }
  };

  function getTopSixIndexes(hourlySource) {
    return new Set(
      hourlySource
        .map((row, hour) => ({ ...row, hour }))
        .filter(row => row.spins > 0)
        .sort((a, b) => b.rate - a.rate || b.hits - a.hits || a.hour - b.hour)
        .slice(0, 6)
        .map(row => row.hour + 1)
    );
  }

  function renderHourly(analysis, selectedNumbers = []) {
    const canvas = document.getElementById("hourlyPerformanceChart");
    if (!canvas) return;

    if (hourlyChart) hourlyChart.destroy();

    const labels = [
      "00:00",
      ...Array.from({ length: 23 }, (_, i) => `${String(i + 1).padStart(2, "0")}:00`),
      "00:01"
    ];

    const hasSelection = selectedNumbers.length > 0;
    const source = analysis.hourlyCustom;
    const data = hasSelection ? [0, ...source.map(row => row.rate)] : [];
    const topSixIndexes = hasSelection ? getTopSixIndexes(source) : new Set();

    const pointColors = data.map((_, index) =>
      topSixIndexes.has(index) ? "#ff4d5f" : "#58d5ff"
    );
    const pointBorders = data.map((_, index) =>
      topSixIndexes.has(index) ? "#ffe5e8" : "#07111f"
    );
    const pointRadii = data.map((_, index) => {
      if (index === 0) return 0;
      return topSixIndexes.has(index) ? 6 : 4;
    });

    const datasets = hasSelection ? [{
      label: selectedNumbers.length === 1
        ? `Number ${selectedNumbers[0]}`
        : "Custom Selection",
      data,
      borderColor: "#58d5ff",
      backgroundColor: "rgba(88,213,255,.12)",
      pointBackgroundColor: pointColors,
      pointBorderColor: pointBorders,
      pointBorderWidth: 2,
      pointRadius: pointRadii,
      pointHoverRadius: pointRadii.map(radius => radius ? radius + 2 : 0),
      borderWidth: 3,
      tension: .28,
      fill: true,
      spanGaps: false,
      ridHourlySource: source,
      ridTopSixIndexes: topSixIndexes,
      segment: {
        borderColor(context) {
          // Highlight the six highest-performing hourly portions in red.
          return topSixIndexes.has(context.p1DataIndex) ? "#ff4d5f" : "#58d5ff";
        },
        borderWidth(context) {
          return topSixIndexes.has(context.p1DataIndex) ? 4 : 3;
        }
      }
    }] : [];

    hourlyChart = new Chart(canvas, {
      type: "line",
      data: { labels, datasets },
      plugins: [pointLabelsPlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 50, right: 18, left: 8, bottom: 8 } },
        interaction: { mode: "nearest", intersect: false },
        plugins: {
          legend: {
            display: hasSelection,
            labels: { color: "#dce7f6", usePointStyle: true }
          },
          tooltip: {
            enabled: hasSelection,
            callbacks: {
              title(items) {
                if (!items.length) return "";
                const index = items[0].dataIndex;
                if (index === 0) return "00:00";
                const startHour = index - 1;
                const end = index === 24 ? "00:01" : `${String(index).padStart(2, "0")}:00`;
                return `${String(startHour).padStart(2, "0")}:00–${end}`;
              },
              label(context) {
                if (context.dataIndex === 0) return "";
                const row = source[context.dataIndex - 1];
                return `${row.rate.toFixed(2)}% · ${row.hits} hits`;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: "#8fa1b8", maxRotation: 0, autoSkip: false },
            grid: { color: "rgba(143,161,184,.08)" }
          },
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { color: "#8fa1b8", callback: value => `${value}%` },
            grid: { color: "rgba(143,161,184,.08)" }
          }
        }
      }
    });
  }

  return { renderHourly, getTopSixIndexes };
})();
