# Assignment 1 - LiftBase

## Author

- **Name:** Husam Abo Shakra
- **B00/B01:** B00980313
- **Email:** hs407359@dal.ca

**Project:** https://git.cs.dal.ca/courses/2026-winter/csci-2170/assignments/a1/hshakra

---

## Application

**Name:** LiftBase

**Description:** LiftBase is a web-based exercise database application designed to help fitness enthusiasts discover and learn about exercises targeting specific muscle groups. I chose to build an exercise database because it addresses a common problem I've experienced: not knowing which exercises effectively target certain muscles when planning workouts. The application allows users to select a muscle group from a dropdown menu (such as Chest, Biceps, Lats, or Core) and instantly browse through relevant exercises. Each exercise is displayed with key information including the category, required equipment, and primary muscles worked. Users can click "Learn More" on any exercise to view a detailed modal with complete instructions. This project combines practical utility with technical learning, allowing me to work with real fitness data from the WGER API while building an interactive, responsive web application.

---

## Setup and Run

1. Clone or download this project.
2. Open `index.html` in a browser
3. No build step or extra steps needed, Bootstrap is loaded from a CDN.

---

## Features

- **Muscle group search** - Dropdown to choose a muscle group (Chest, Lats, Shoulders, Biceps, Triceps, Glutes, Quadriceps, Hamstrings, Calves, Core/Abs, Traps) and a Search button.
- **Exercise result cards** - After searching, exercises are shown as cards with name, category, equipment, muscles, and a short description preview.
- **Learn More modal** - Each card has a "Learn More" button that opens a Bootstrap modal with full exercise details (category, equipment, muscles, full description). The same modal works on the Home results and on the Favourites page.
- **Favourites** - "Add to Favourites" / "Remove from Favourites" toggle on each result card. Favourites are stored in the browser (localStorage) and persist across page refreshes.
- **Favourites page** - Lists all saved exercises as cards (same style as search results). Each card has "Learn More" (opens the same detail modal) and "Remove from Favourites". Shows "No favourites yet." when empty. Linked from the navbar.
- **About page** - Short explanation of what LiftBase is and how to use it. Linked from the navbar.
- **Responsive layout** - Bootstrap 5 for layout and components; navbar collapses on small screens; cards stack on narrow viewports.
- **Light styling** - Custom CSS for search area and a slight hover effect on result cards.

---

## APIs

API: WGER Workout Manager. Base URL: https://wger.de/ No API key required.

- Exercises by muscle: https://wger.de/api/v2/exerciseinfo/?muscles={id}&language=2&limit=6
- Muscle name (optional): https://wger.de/api/v2/muscle/{id}

---

## Notes

- English exercises use `language=2` in the exerciseinfo request.
- If the API is slow or unavailable, the results area may stay on "Loading..." or show no results; check the browser console for errors.
- Favourites are stored in the browser only (localStorage). Clearing site data or using a different browser/device will not show your saved favourites.

---

## Citations and Resources

**External Libraries:**

Bootstrap. (n.d.). _Bootstrap 5.3 documentation_. Retrieved February 9, 2025, from https://getbootstrap.com/

**APIs:**

WGER Workout Manager. (n.d.). _API documentation_. Retrieved February 9, 2025, from https://wger.de/en/software/api

**Documentation References:**

Bootstrap. (n.d.). _Modal component_. Retrieved February 9, 2025, from https://getbootstrap.com/docs/5.3/components/modal/

Bootstrap. (n.d.). _Navbar component_. Retrieved February 9, 2025, from https://getbootstrap.com/docs/5.3/components/navbar/

Mozilla. (n.d.). _Window.localStorage_. MDN Web Docs. Retrieved February 9, 2025, from https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
