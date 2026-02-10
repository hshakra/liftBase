# Assignment 1 - LiftBase

## Author

- **Name:** Husam Abo Shakra

---

## Application

**Name:** LiftBase

**Description:** LiftBase is a web-based exercise database application designed to help fitness enthusiasts discover and learn about exercises targeting specific muscle groups. I chose to build an exercise database because it addresses a common problem I've experienced: not knowing which exercises effectively target certain muscles when planning workouts. The application allows users to select a muscle group from a dropdown menu (such as Chest, Biceps, Lats, or Core) and instantly browse through relevant exercises. Each exercise is displayed with key information including the category, required equipment, and primary muscles worked. Users can click "Learn More" on any exercise to view a detailed modal with complete instructions. This project combines practical utility with technical learning, allowing me to work with real fitness data from the WGER API while building an interactive, responsive web application.

---

## Setup and Run

1. Clone or download this project.
2. Open `index.html` in a browser (landing page). Use "Get Started" or "Exercises" to open the exercise browser (`exercises.html`).
3. No build step or extra steps needed; Bootstrap and Chart.js are loaded from CDNs.

---

## Features

- **Landing page (index.html)** - Entry point with hero ("Build Smarter Workouts with LiftBase"), features overview, How it works (4 steps), About (WGER API), and footer links. "Get Started" and "Browse Exercises" go to the Exercises page.
- **Exercises page (exercises.html)** - Main app: muscle group search, filters, results, workout offcanvas. Nav: Home (landing), Exercises (active), My Workouts, Favourites, About, Workout.
- **Muscle group search** - Dropdown to choose a muscle group (Chest, Lats, Shoulders, Biceps, Triceps, Glutes, Quadriceps, Hamstrings, Calves, Core/Abs, Traps) and a Search button.
- **Exercise result cards** - After searching, exercises are shown as cards with name, category, equipment, muscles, and a short description preview.
- **Learn More modal** - Each card has a "Learn More" button that opens a Bootstrap modal with full exercise details (category, equipment, muscles, full description). The same modal works on the Home results and on the Favourites page.
- **Favourites** - "Add to Favourites" / "Remove from Favourites" toggle on each result card. Favourites are stored in the browser (localStorage) and persist across page refreshes.
- **Favourites page** - Lists all saved exercises as cards (same style as search results). Each card has "Learn More" (opens the same detail modal) and "Remove from Favourites". Shows "No favourites yet." when empty. Linked from the navbar.
- **About page** - Short explanation of what LiftBase is and how to use it. Linked from the navbar.
- **Responsive layout** - Bootstrap 5 for layout and components; navbar collapses on small screens; cards stack on narrow viewports.
- **Light styling** - Custom CSS for search area and a slight hover effect on result cards.

**Enhanced features:**

- **Filtering** - After searching by muscle group, a collapsible filter panel appears. Search by exercise name (real-time, debounced) and filter by equipment (checkboxes). Clear filters button and active filter count.
- **Workout builder** - "Add to Workout" on each exercise card (Exercises and Favourites). Workout panel (offcanvas) shows current workout with sets and notes per exercise, reorder (up/down), remove, and summary. Save workout (prompt for name, stored in localStorage), Clear (with confirmation), Export: copy to clipboard or print (new window).
- **My Workouts** - Page listing all saved workouts. View (modal with exercise list and muscle coverage chart), Load (into builder), Delete.
- **Muscle coverage charts** - Chart.js bar chart in the workout builder sidebar (exercises per muscle group) and on the My Workouts detail modal. Balance indicator suggests adding upper/lower variety when the workout is one-sided.

---

## APIs

API: WGER Workout Manager. Base URL: https://wger.de/ No API key required.

- Exercises by muscle: https://wger.de/api/v2/exerciseinfo/?muscles={id}&language=2&limit=6
- Muscle name (optional): https://wger.de/api/v2/muscle/{id}

---

## Notes

- English exercises use `language=2` in the exerciseinfo request.
- If the API is slow or unavailable, the results area may stay on "Loading..." or show no results; check the browser console for errors.
- Favourites and workouts are stored in the browser only (localStorage). Clearing site data or using a different browser/device will not show your saved data.

---

## Citations and Resources

**External Libraries:**

Bootstrap. (n.d.). _Bootstrap 5.3 documentation_. Retrieved February 9, 2025, from https://getbootstrap.com/

Chart.js. (n.d.). _Chart.js documentation_. Retrieved February 9, 2025, from https://www.chartjs.org/

**APIs:**

WGER Workout Manager. (n.d.). _API documentation_. Retrieved February 9, 2025, from https://wger.de/en/software/api

**Documentation References:**

Bootstrap. (n.d.). _Modal component_. Retrieved February 9, 2025, from https://getbootstrap.com/docs/5.3/components/modal/

Bootstrap. (n.d.). _Navbar component_. Retrieved February 9, 2025, from https://getbootstrap.com/docs/5.3/components/navbar/

Mozilla. (n.d.). _Window.localStorage_. MDN Web Docs. Retrieved February 9, 2025, from https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
