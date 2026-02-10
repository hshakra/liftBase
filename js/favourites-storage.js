// localStorage API: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

// localStorage key for favourites
const FAVOURITES_KEY = "liftbase_favourites";

// get saved favourites list
function getFavs() {
  try {
    const raw = localStorage.getItem(FAVOURITES_KEY);
    if (raw) {
      return JSON.parse(raw);
    } else {
      return [];
    }
  } catch (e) {
    console.error("Error reading favs:", e);
    return [];
  }
}

// save favourites list
function setFavourites(arr) {
  try {
    localStorage.setItem(FAVOURITES_KEY, JSON.stringify(arr));
  } catch (e) {
    console.error("Error saving favs:", e);
  }
}

// check if exercise id is in favourites
function isFavourite(exerciseId) {
  const favs = getFavs();
  for (let i = 0; i < favs.length; i++) {
    if (favs[i].id === exerciseId) {
      return true;
    }
  }
  return false;
}

// add exercise to favourites
function addFavourite(exercise) {
  if (!exercise) return;
  if (isFavourite(exercise.id)) return;

  const favs = getFavs();
  favs.push(exercise);
  setFavourites(favs);
}

// remove exercise by id
function removeFavourite(exerciseId) {
  const favs = getFavs();
  const updated = [];

  for (let i = 0; i < favs.length; i++) {
    if (favs[i].id !== exerciseId) {
      updated.push(favs[i]);
    }
  }

  setFavourites(updated);
}
