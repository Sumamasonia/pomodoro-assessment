# Frontend Assessment Answers

### 1. How to Run
To run this project on a fresh machine:
1. Ensure you have **Node.js** (v18 or higher recommended) installed.
2. Open your terminal at the project root directory and install dependencies:
   
```bash
   npm install
   Boot up the local development preview server:

Bash
   npm run dev
Click the link provided in the terminal (typically http://localhost:5173) to open the app in your browser.

2. Stack & Design Choices
Frontend Stack Choice: I selected React + Vite + Tailwind CSS. Vite eliminates build overhead and allows instant hot-reloading. React's state hooks elegantly synchronize custom configurations and persistent local logs. Tailwind CSS ensures that responsive changes and state modifications can be handled cleanly inline without writing fragmented custom stylesheets.

Visual/Interaction Decision 1 (Dynamic Context Themes): The root viewport container background dynamically alters colors based on the application state (rose for Focus, teal for Break, and an automated opacity drop with absolute status tracking when paused). This provides immediate visual confirmation of the application state from a distance.

Visual/Interaction Decision 2 (Monospaced Tabular Typography): The primary timer digits use a dedicated system-fallback monospaced layout (font-mono) combined with the utility tracking layout tabular-nums. This decision forces every numerical digit to occupy the exact same horizontal width, completely preventing layout jitters or container size shifting as the clock counts down.

3. Responsive & Accessibility
Device Scaling (360px vs 1440px): On a 360px phone layout, elements collapse to a single, vertical, center-balanced stack, and touch interactions scale to safely cross the 48px minimum target threshold. On 1440px systems, boundaries scale inward via constraint wrappers (max-w-md) to stop inputs from stretching awkwardly across wide viewports.

Accessibility Handled: Interactive elements are fully traversable using keyboard navigation loops. Elements make explicit use of target outline rings via focus:ring-2 to guarantee structural visibility to keyboard-exclusive users.

Accessibility Skipped: Real-time speech announcements for individual seconds passing were omitted by design. Running live updates through screen readers every single second creates overwhelming audio noise, which undermines the core productivity purpose of a focus tool.

4. AI Usage
Tool Used: Gemini

Context Request: "Write a robust hook loop in React for a countdown timer that accounts for performance drift when a browser tab is backgrounded."

Code Provided: The generator supplied an execution model that calculates standard elapsed timestamps (Date.now()) relative to a target future goal, avoiding basic variable decrements.

Refinement Applied: The initial AI snippet reset internal calculations during pause interactions, leading to subtle millisecond inaccuracies. I introduced an absolute reference bridge to store remaining time precisely on pause and regenerate the exact completion target instantly upon resume.

5. Honest Gap
The Unpolished Element: The audio completion alert uses the system's default Web Audio oscillator frequency array. While it works reliably and avoids external dependency asset issues, it sounds somewhat cold and clinical.

The Next-Day Fix: With an extra 24 hours, I would integrate a polished audio manager library or sound assets to allow custom options (such as mechanical chimes or ambient bells) complete with volume curves that fade in gently.


---

