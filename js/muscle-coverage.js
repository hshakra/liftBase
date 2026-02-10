// muscle group coverage analysis and Chart.js visualisation
// Chart.js: https://www.chartjs.org/

let muscleCoverageChartInstance = null;

// compute coverage from workout: { muscleName: { exercises: n, sets: n } }
function getMuscleCoverage(workout) {
  const coverage = {};
  if (!workout || !workout.exercises || !workout.exercises.length) return coverage;

  workout.exercises.forEach((entry) => {
    const muscles = (entry.muscleGroup || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const sets = entry.sets || 0;
    muscles.forEach((m) => {
      if (!coverage[m]) coverage[m] = { exercises: 0, sets: 0 };
      coverage[m].exercises += 1;
      coverage[m].sets += sets;
    });
  });
  return coverage;
}

// balance check: warn if very unbalanced (e.g. only one region)
function getBalanceFeedback(coverage) {
  const keys = Object.keys(coverage);
  if (keys.length <= 1) return { ok: false, message: "Add more muscle groups for balance." };
  const upper = ["Biceps", "Triceps", "Chest", "Shoulders", "Lats", "Traps", "Core / Abs"];
  const lower = ["Quadriceps", "Hamstrings", "Glutes", "Calves"];
  let upperCount = 0;
  let lowerCount = 0;
  keys.forEach((k) => {
    if (upper.some((u) => k.toLowerCase().includes(u.toLowerCase()))) upperCount++;
    if (lower.some((l) => k.toLowerCase().includes(l.toLowerCase()))) lowerCount++;
  });
  if (upperCount > 0 && lowerCount === 0) {
    return { ok: false, message: "Only upper body. Consider adding lower body exercises." };
  }
  if (lowerCount > 0 && upperCount === 0) {
    return { ok: false, message: "Only lower body. Consider adding upper body exercises." };
  }
  return { ok: true, message: "" };
}

// render chart and balance indicator in sidebar
function renderMuscleCoverageChart(workout) {
  const canvas = document.getElementById("muscle-coverage-chart");
  const balanceEl = document.getElementById("muscle-coverage-balance");
  const chartWrap = document.getElementById("muscle-coverage-chart-wrap");

  if (!canvas || !canvas.isConnected) return;

  if (!workout || !workout.exercises || !workout.exercises.length) {
    if (chartWrap) chartWrap.style.display = "none";
    if (balanceEl) balanceEl.style.display = "none";
    if (muscleCoverageChartInstance) {
      muscleCoverageChartInstance.destroy();
      muscleCoverageChartInstance = null;
    }
    return;
  }

  const coverage = getMuscleCoverage(workout);
  const labels = Object.keys(coverage);
  const data = labels.map((m) => coverage[m].exercises);

  if (chartWrap) chartWrap.style.display = "block";

  if (muscleCoverageChartInstance) {
    try {
      muscleCoverageChartInstance.destroy();
    } catch (err) {
      muscleCoverageChartInstance = null;
    }
  }

  try {
    const ctx = canvas.getContext("2d");
    muscleCoverageChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Exercises",
          data: data,
          backgroundColor: "rgba(52, 152, 219, 0.6)",
          borderColor: "rgba(52, 152, 219, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            afterLabel: function (context) {
              const muscle = labels[context.dataIndex];
              const sets = coverage[muscle].sets;
              return "Sets: " + sets;
            },
          },
        },
      },
      scales: {
        x: { beginAtZero: true, ticks: { stepSize: 1 } },
      },
    },
  });
  } catch (err) {
    console.error("Chart render error:", err);
    muscleCoverageChartInstance = null;
  }

  const balance = getBalanceFeedback(coverage);
  if (balanceEl) {
    balanceEl.style.display = "block";
    balanceEl.className = "small " + (balance.ok ? "text-success" : "text-warning");
    balanceEl.textContent = balance.ok ? "Balanced coverage." : balance.message;
  }
}
