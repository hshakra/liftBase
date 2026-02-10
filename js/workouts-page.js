// My Workouts page: list saved workouts, load, delete, view detail with chart

let workoutDetailChartInstance = null;

// render list of saved workouts
function renderWorkoutsList() {
  const container = document.getElementById("workouts-list-container");
  if (!container) return;

  const workouts = getWorkouts();
  if (!workouts.length) {
    container.innerHTML =
      '<p class="text-center text-muted">No workouts yet. Build a workout on the Home page and save it.</p>';
    return;
  }

  container.innerHTML = workouts
    .map(
      (w) => {
        const count = (w.exercises || []).length;
        const modified = w.lastModified
          ? new Date(w.lastModified).toLocaleDateString()
          : "";
        return `
    <div class="card mb-3">
      <div class="card-body d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <h5 class="card-title mb-1">${w.name}</h5>
          <p class="card-text small text-muted mb-0">${count} exercise${count !== 1 ? "s" : ""} · Modified ${modified}</p>
        </div>
        <div class="d-flex gap-1">
          <button type="button" class="btn btn-sm btn-outline-primary view-workout-btn" data-workout-id="${w.id}">View</button>
          <button type="button" class="btn btn-sm btn-primary load-workout-btn" data-workout-id="${w.id}">Load</button>
          <button type="button" class="btn btn-sm btn-outline-danger delete-workout-btn" data-workout-id="${w.id}">Delete</button>
        </div>
      </div>
    </div>
    `;
      },
    )
    .join("");

  container.querySelectorAll(".view-workout-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.workoutId;
      showWorkoutDetail(id);
    });
  });
  container.querySelectorAll(".load-workout-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.workoutId;
      loadWorkoutIntoCurrent(id);
      const offcanvas = document.getElementById("workout-offcanvas");
      if (offcanvas) {
        const o = new bootstrap.Offcanvas(offcanvas);
        o.show();
      }
    });
  });
  container.querySelectorAll(".delete-workout-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.workoutId;
      if (!window.confirm("Delete this workout?")) return;
      deleteWorkout(id);
      renderWorkoutsList();
    });
  });
}

// delete workout by id
function deleteWorkout(workoutId) {
  const workouts = getWorkouts().filter((w) => w.id !== workoutId);
  setWorkouts(workouts);
}

// show workout detail modal with chart
function showWorkoutDetail(workoutId) {
  const workouts = getWorkouts();
  const w = workouts.find((x) => x.id === workoutId);
  if (!w) return;

  const content = document.getElementById("workout-detail-content");
  const balanceEl = document.getElementById("workout-detail-balance");
  if (content) {
    content.innerHTML = `
      <p class="small text-muted">${(w.exercises || []).length} exercises · Modified ${w.lastModified ? new Date(w.lastModified).toLocaleDateString() : ""}</p>
      <ol class="mb-0">
        ${(w.exercises || []).map((e) => `<li><strong>${e.name}</strong> (${e.muscleGroup}) – ${e.sets} set(s)${e.notes ? " – " + e.notes : ""}</li>`).join("")}
      </ol>
    `;
  }

  const coverage = getMuscleCoverage(w);
  const balance = getBalanceFeedback(coverage);
  if (balanceEl) {
    balanceEl.className = "small " + (balance.ok ? "text-success" : "text-warning");
    balanceEl.textContent = balance.ok ? "Balanced coverage." : balance.message;
  }

  const canvas = document.getElementById("workout-detail-chart");
  if (canvas) {
    if (workoutDetailChartInstance) workoutDetailChartInstance.destroy();
    const labels = Object.keys(coverage);
    const data = labels.map((m) => coverage[m].exercises);
    const ctx = canvas.getContext("2d");
    workoutDetailChartInstance = new Chart(ctx, {
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
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
      },
    });
  }

  const loadBtn = document.getElementById("workout-detail-load-btn");
  if (loadBtn) {
    loadBtn.onclick = () => {
      loadWorkoutIntoCurrent(workoutId);
      bootstrap.Modal.getInstance(document.getElementById("workout-detail-modal")).hide();
      const offcanvas = document.getElementById("workout-offcanvas");
      if (offcanvas) new bootstrap.Offcanvas(offcanvas).show();
    };
  }

  const modal = new bootstrap.Modal(document.getElementById("workout-detail-modal"));
  modal.show();
}

renderWorkoutsList();
