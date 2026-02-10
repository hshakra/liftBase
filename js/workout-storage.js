// localStorage API: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

// localStorage keys for workouts
const WORKOUTS_KEY = "liftbase_workouts";
const CURRENT_WORKOUT_KEY = "liftbase_current_workout";

// generate unique id for workouts
function generateWorkoutId() {
  return "wb-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);
}

// get all saved workouts
function getWorkouts() {
  try {
    const raw = localStorage.getItem(WORKOUTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    } else {
      return [];
    }
  } catch (e) {
    console.error("Error reading workouts:", e);
    return [];
  }
}

// save workouts array
function setWorkouts(arr) {
  try {
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(arr));
  } catch (e) {
    console.error("Error saving workouts:", e);
  }
}

// get current workout being built (in-memory shape: { exercises: [...] })
function getCurrentWorkout() {
  try {
    const raw = localStorage.getItem(CURRENT_WORKOUT_KEY);
    if (raw) {
      return JSON.parse(raw);
    } else {
      return { exercises: [] };
    }
  } catch (e) {
    console.error("Error reading current workout:", e);
    return { exercises: [] };
  }
}

// save current workout (object with exercises array)
function setCurrentWorkout(obj) {
  try {
    localStorage.setItem(CURRENT_WORKOUT_KEY, JSON.stringify(obj));
  } catch (e) {
    console.error("Error saving current workout:", e);
  }
}

// clear current workout
function clearCurrentWorkout() {
  setCurrentWorkout({ exercises: [] });
}
