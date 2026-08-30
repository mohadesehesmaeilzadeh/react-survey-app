# React Survey App

A simple multi-step survey application built with React.

The app collects basic user information, presents one survey question at a time, keeps answers and timer state after refresh, and shows a final thank-you screen when the survey is submitted or the time limit expires.

## Features

- User information form
- Three different question types
  - Single-choice question
  - Descriptive text question
  - Multiple-choice question
- One question displayed at a time
- Previous and Next navigation
- Ability to return to previous questions and edit answers
- Two-minute survey timer
- Timer persists after browser refresh
- Survey answers persist after browser refresh
- Current question persists after browser refresh
- Progress bar
- Form validation
- Animated transitions between questions
- Automatic submission flow when time expires
- Thank-you screen
- Restart / start-new-survey flow
- Final survey result logged to the browser console
- Responsive interface using Bootstrap and React-Bootstrap

## Technologies

- React
- JavaScript
- Create React App
- Bootstrap
- React-Bootstrap
- Framer Motion
- Local Storage

## Project Structure

```text
src/
├── components/
│   ├── SurveyQuestion.js
│   ├── SurveyTimer.js
│   ├── ThankYou.js
│   └── UserInfoForm.js
│
├── data/
│   └── questions.js
│
├── App.css
├── App.js
├── App.test.js
├── index.css
└── index.js
```

## Survey Flow

```text
User Information
       ↓
Start Survey
       ↓
Question 1
       ↓
Question 2
       ↓
Question 3
       ↓
Submit Survey
       ↓
Thank You
```

If the two-minute timer reaches zero before submission, the app automatically ends the survey and displays the time-expired thank-you screen.

## Survey Questions

The project currently includes three React-related questions.

### Question 1 — Single Choice

**What is your preferred way to learn React?**

Options:

- Video courses
- Documentation
- Practice projects
- Online tutorials

### Question 2 — Descriptive

**What do you like most about React?**

The user answers using a textarea.

### Question 3 — Multiple Choice

**Which React topics have you learned?**

Options:

- Components
- Props
- State
- Hooks
- React Router

The user can select more than one answer.

## User Information

Before the survey begins, the user enters basic information such as:

- Name
- Email
- Age

The timer starts only after the survey is started.

## Two-Minute Timer

The survey has a fixed duration of two minutes.

Instead of storing only a countdown number, the app stores the survey end time. This makes the timer continue correctly even after refreshing the browser.

Conceptually:

```js
const endTime = Date.now() + 2 * 60 * 1000;
```

The remaining time is calculated from the saved end time.

This means that if the user refreshes the page after 30 seconds, the timer continues from approximately 1:30 instead of restarting from 2:00.

## Local Storage

The application uses `localStorage` to preserve survey progress.

Stored data includes:

```text
surveyUser
surveyAnswers
surveyCurrentQuestion
surveyEndTime
surveyStatus
```

Because of this, refreshing the browser does not remove:

- User information
- Previous answers
- Current question
- Remaining survey time
- Survey status

## Navigation

Users can move through the survey using:

```text
Previous
Next
Submit Survey
```

The Previous button allows users to return to earlier questions and change their answers.

The first question disables the Previous button.

The final question displays a Submit Survey button instead of Next.

## Validation

The user must answer the current question before moving forward.

Validation rules:

- Single-choice question: one option must be selected
- Descriptive question: the answer cannot be empty
- Multiple-choice question: at least one option must be selected

If validation fails, an error message is displayed.

## Animations

Question transitions are animated with Framer Motion.

The app changes the slide direction depending on whether the user moves forward or backward.

Example behavior:

```text
Next      → slide from right
Previous  → slide from left
```

The animations are intentionally simple and subtle.

## Progress

The app displays survey progress based on the current question.

For three questions:

```text
Question 1 → 33%
Question 2 → 67%
Question 3 → 100%
```

## Survey Result

When the user submits the survey, the collected data is logged to the browser console.

Example:

```js
{
  user: {
    name: "...",
    email: "...",
    age: "..."
  },
  answers: {
    question1: "...",
    question2: "...",
    question3: ["...", "..."]
  },
  completed: true,
  reason: "submitted"
}
```

If the timer expires:

```js
{
  user: {
    name: "...",
    email: "...",
    age: "..."
  },
  answers: {
    question1: "...",
    question2: "...",
    question3: []
  },
  completed: false,
  reason: "time-expired"
}
```

## Installation

Clone the repository:

```bash
git clone https://github.com/mohadesehesmaeilzadeh/react-survey-app.git
```

Open the project directory:

```bash
cd react-survey-app
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

## Production Build

Create an optimized production build with:

```bash
npm run build
```

## Main Dependencies

The project uses:

```text
react
react-dom
react-bootstrap
bootstrap
framer-motion
```

## Repository

You can view the complete source code on GitHub:

[React Survey App - GitHub Repository](https://github.com/mohadesehesmaeilzadeh/react-survey-app)

## Learning Goals

This project practices several important React concepts:

- Functional components
- Props
- `useState`
- `useEffect`
- `useCallback`
- `useRef`
- Controlled forms
- Conditional rendering
- Rendering from data
- Form validation
- Local Storage
- Timers
- Effect cleanup
- Navigation between steps
- Responsive UI
- Animation with Framer Motion

## Author

Developed as a React practice project.
