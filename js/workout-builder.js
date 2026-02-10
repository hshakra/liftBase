// workout builder: sidebar, add/remove/reorder, save/load, export

// build flat exercise entry from WGER exercise object
function exerciseToWorkoutEntry(exercise) {
  if (!exercise || typeof exercise.id === "undefined") return null;
  const engName = exercise.translations && exercise.translations.find((t) => t.language === 2);
  const name = (engName && engName.name) || "Unknown";
  const muscleNames = (exercise.muscles || [])
    .map((m) => m.name_en || m.name)
    .join(", ");
  const muscleGroup = muscleNames || "—";
  const equipment = (exercise.equipment || [])
    .map((eq) => eq.name)
    .join(", ") || "None";
  return {
    exerciseId: String(exercise.id),
    name: name,
    muscleGroup: muscleGroup,
    equipment: equipment,
    sets: 3,
    notes: "",
  };
}

// escape for safe HTML display in sidebar
function escapeHtml(str) {
  if (str == null) return "";
  const s = String(str);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// add exercise to current workout
function addToWorkout(exercise) {
  if (!exercise) return;
  const entry = exerciseToWorkoutEntry(exercise);
  if (!entry) return;
  const current = getCurrentWorkout();
  if (!current.exercises) current.exercises = [];
  current.exercises.push(entry);
  setCurrentWorkout(current);
  renderWorkoutSidebar();
}

// remove exercise at index
function removeFromWorkout(index) {
  const current = getCurrentWorkout();
  if (!current.exercises || index < 0 || index >= current.exercises.length) return;
  current.exercises.splice(index, 1);
  setCurrentWorkout(current);
  renderWorkoutSidebar();
}

// reorder: direction 1 = down, -1 = up
function reorderWorkoutExercise(index, direction) {
  const current = getCurrentWorkout();
  if (!current.exercises) return;
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= current.exercises.length) return;
  const arr = current.exercises;
  [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
  setCurrentWorkout(current);
  renderWorkoutSidebar();
}

// update sets and notes for an entry
function updateWorkoutEntry(index, sets, notes) {
  const current = getCurrentWorkout();
  if (!current.exercises || index < 0 || index >= current.exercises.length) return;
  current.exercises[index].sets = sets;
  current.exercises[index].notes = notes || "";
  setCurrentWorkout(current);
}

// render the workout sidebar content
function renderWorkoutSidebar() {
  const container = document.getElementById("workout-sidebar-list");
  const summaryEl = document.getElementById("workout-summary");
  const emptyEl = document.getElementById("workout-sidebar-empty");
  const nonEmptyEl = document.getElementById("workout-sidebar-list-wrap");
  if (!container) return;

  const current = getCurrentWorkout();
  const exercises = current.exercises || [];

  if (exercises.length === 0) {
    if (emptyEl) emptyEl.style.display = "block";
    if (nonEmptyEl) nonEmptyEl.style.display = "none";
    if (summaryEl) summaryEl.innerHTML = "";
    if (typeof window.renderMuscleCoverageChart === "function") {
      window.renderMuscleCoverageChart(null);
    }
    return;
  }

  if (emptyEl) emptyEl.style.display = "none";
  if (nonEmptyEl) nonEmptyEl.style.display = "block";

  container.innerHTML = exercises
    .map(
      (entry, i) => `
    <div class="workout-sidebar-item" data-index="${i}">
      <div class="d-flex justify-content-between align-items-start mb-1">
        <strong class="workout-item-name">${escapeHtml(entry.name)}</strong>
        <div class="workout-item-actions">
          <button type="button" class="btn btn-sm btn-outline-secondary workout-move-btn" data-index="${i}" data-dir="-1" aria-label="Move up">↑</button>
          <button type="button" class="btn btn-sm btn-outline-secondary workout-move-btn" data-index="${i}" data-dir="1" aria-label="Move down">↓</button>
          <button type="button" class="btn btn-sm btn-outline-danger workout-remove-btn" data-index="${i}" aria-label="Remove">×</button>
        </div>
      </div>
      <p class="small text-muted mb-1">${escapeHtml(entry.muscleGroup)}</p>
      <div class="mb-1">
        <label class="small">Sets</label>
        <input type="number" min="1" max="20" class="form-control form-control-sm workout-sets-input" data-index="${i}" value="${Number(entry.sets) || 1}" />
      </div>
      <div class="mb-1">
        <label class="small">Notes</label>
        <input type="text" class="form-control form-control-sm workout-notes-input" data-index="${i}" placeholder="Optional" value="${escapeHtml(entry.notes || "")}" />
      </div>
    </div>
  `
    )
    .join("");

  // listeners for sets/notes
  container.querySelectorAll(".workout-sets-input").forEach((input) => {
    input.addEventListener("change", (e) => {
      const index = parseInt(e.target.dataset.index, 10);
      const entry = (getCurrentWorkout().exercises || [])[index];
      const sets = parseInt(e.target.value, 10) || 1;
      updateWorkoutEntry(index, sets, entry ? entry.notes : "");
    });
  });
  container.querySelectorAll(".workout-notes-input").forEach((input) => {
    input.addEventListener("input", (e) => {
      const index = parseInt(e.target.dataset.index, 10);
      const entry = (getCurrentWorkout().exercises || [])[index];
      updateWorkoutEntry(index, entry ? entry.sets : 3, e.target.value);
    });
  });
  container.querySelectorAll(".workout-remove-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.currentTarget.dataset.index, 10);
      removeFromWorkout(index);
    });
  });
  container.querySelectorAll(".workout-move-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.currentTarget.dataset.index, 10);
      const dir = parseInt(e.currentTarget.dataset.dir, 10);
      reorderWorkoutExercise(index, dir);
    });
  });

  // summary
  const muscleSet = new Set();
  exercises.forEach((e) => {
    (e.muscleGroup || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((m) => muscleSet.add(m));
  });
  if (summaryEl) {
    summaryEl.innerHTML = `<span class="badge bg-secondary me-1">${exercises.length} exercise${exercises.length !== 1 ? "s" : ""}</span><span class="badge bg-secondary">${muscleSet.size} muscle group${muscleSet.size !== 1 ? "s" : ""}</span>`;
  }

  // defer chart render to avoid reflow/repaint glitches during sidebar update
  if (typeof window.renderMuscleCoverageChart === "function") {
    const workout = getCurrentWorkout();
    setTimeout(function () {
      window.renderMuscleCoverageChart(workout);
    }, 0);
  }
}

// clear current workout with confirmation
function clearWorkoutWithConfirm() {
  const current = getCurrentWorkout();
  if (!(current.exercises && current.exercises.length)) return;
  if (!window.confirm("Clear the current workout? This cannot be undone.")) return;
  clearCurrentWorkout();
  renderWorkoutSidebar();
}

// save workout: prompt for name, save to localStorage
function saveWorkoutWithPrompt() {
  const current = getCurrentWorkout();
  if (!(current.exercises && current.exercises.length)) {
    alert("Add at least one exercise to save a workout.");
    return;
  }
  const name = window.prompt("Workout name:", "My Workout");
  if (name === null || !name.trim()) return;

  const workouts = getWorkouts();
  const now = new Date().toISOString();
  const workout = {
    id: generateWorkoutId(),
    name: name.trim(),
    createdAt: now,
    lastModified: now,
    exercises: current.exercises.map((e) => ({
      exerciseId: e.exerciseId,
      name: e.name,
      muscleGroup: e.muscleGroup,
      equipment: e.equipment,
      sets: e.sets,
      notes: e.notes || "",
    })),
  };
  workouts.push(workout);
  setWorkouts(workouts);
  clearCurrentWorkout();
  renderWorkoutSidebar();
  alert("Workout saved.");
  if (window.location.pathname.endsWith("workouts.html")) {
    if (typeof window.renderWorkoutsList === "function") window.renderWorkoutsList();
  }
}

// load workout into current (replace current)
function loadWorkoutIntoCurrent(workoutId) {
  const workouts = getWorkouts();
  const w = workouts.find((x) => x.id === workoutId);
  if (!w) return;
  setCurrentWorkout({ exercises: w.exercises || [] });
  renderWorkoutSidebar();
}

// copy workout to clipboard as formatted text
function copyWorkoutToClipboard() {
  const current = getCurrentWorkout();
  const exercises = current.exercises || [];
  if (!exercises.length) {
    alert("No exercises in workout.");
    return;
  }
  const lines = [
    current.name || "Workout",
    "",
    ...exercises.map(
      (e, i) =>
        `${i + 1}. ${e.name} (${e.muscleGroup}) – ${e.sets} set(s)${e.notes ? " – " + e.notes : ""}`
    ),
  ];
  const text = lines.join("\n");
  navigator.clipboard
    .writeText(text)
    .then(() => alert("Copied to clipboard."))
    .catch(() => alert("Could not copy to clipboard."));
}

// print workout (open print-friendly view in new window)
function printWorkout() {
  const current = getCurrentWorkout();
  const exercises = current.exercises || [];
  if (!exercises.length) {
    alert("No exercises in workout.");
    return;
  }
  const title = (current.name || "Workout").replace(/</g, "&lt;");
  const html = `
    <!DOCTYPE html><html><head><title>${title}</title><style>body{font-family:Segoe UI,sans-serif;padding:2rem;} h1{margin-bottom:0.5rem;} ol{line-height:1.6;}</style></head><body>
    <h1>${title}</h1>
    <p>${new Date().toLocaleDateString()}</p>
    <ol>
      ${exercises.map((e) => `<li><strong>${e.name}</strong> (${e.muscleGroup}) – ${e.sets} set(s)${e.notes ? "<br><em>" + String(e.notes).replace(/</g, "&lt;") + "</em>" : ""}</li>`).join("")}
    </ol>
    </body></html>
  `;
  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 250);
  } else {
    alert("Allow pop-ups to print.");
  }
}

// wire up Add to Workout buttons (call after result cards are rendered)
function attachWorkoutButtons() {
  document.querySelectorAll(".add-to-workout-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(e.currentTarget.dataset.exerciseId, 10);
      if (Number.isNaN(id)) return;
      const exercises = window.currentExercisesForWorkout || [];
      const exercise = exercises.find((ex) => ex && ex.id === id);
      if (exercise) addToWorkout(exercise);
    });
  });
}

// init: render sidebar on load, wire sidebar buttons
function initWorkoutBuilder() {
  const sidebarList = document.getElementById("workout-sidebar-list");
  if (!sidebarList) return;

  renderWorkoutSidebar();

  const btnClear = document.getElementById("workout-btn-clear");
  const btnSave = document.getElementById("workout-btn-save");
  const btnCopy = document.getElementById("workout-btn-copy");
  const btnPrint = document.getElementById("workout-btn-print");

  if (btnClear) btnClear.addEventListener("click", clearWorkoutWithConfirm);
  if (btnSave) btnSave.addEventListener("click", saveWorkoutWithPrompt);
  if (btnCopy) btnCopy.addEventListener("click", copyWorkoutToClipboard);
  if (btnPrint) btnPrint.addEventListener("click", printWorkout);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWorkoutBuilder);
} else {
  initWorkoutBuilder();
}
