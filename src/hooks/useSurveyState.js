import { useCallback, useEffect, useReducer } from 'react';
import questions from '../data/questions';

const SURVEY_DURATION = 2 * 60 * 1000;

const storageKeys = {
  user: 'surveyUser',
  answers: 'surveyAnswers',
  currentQuestion: 'surveyCurrentQuestion',
  endTime: 'surveyEndTime',
  status: 'surveyStatus',
};

const validStatuses = new Set(['not-started', 'in-progress', 'submitted', 'time-expired']);
const completionStatuses = new Set(['submitted', 'time-expired']);

function createEmptyUser() {
  return {
    name: '',
    email: '',
    age: '',
  };
}

function normalizeUser(value) {
  const user = value && typeof value === 'object' && !Array.isArray(value) ? value : {};

  return {
    name: typeof user.name === 'string' ? user.name : '',
    email: typeof user.email === 'string' ? user.email : '',
    age: typeof user.age === 'string' ? user.age : '',
  };
}

function isValidUser(user) {
  return Boolean(user.name.trim() && user.email.trim());
}

function normalizeAnswer(question, value) {
  if (question.type === 'multiple') {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter(
      (option, index) => question.options.includes(option) && value.indexOf(option) === index
    );
  }

  if (question.type === 'single') {
    return question.options.includes(value) ? value : '';
  }

  return typeof value === 'string' ? value : '';
}

function normalizeAnswers(value) {
  const answers = value && typeof value === 'object' && !Array.isArray(value) ? value : {};

  return questions.reduce(
    (normalizedAnswers, question) => ({
      ...normalizedAnswers,
      [question.id]: normalizeAnswer(question, answers[question.id]),
    }),
    {}
  );
}

export function isQuestionAnswered(question, answer) {
  if (!question) {
    return false;
  }

  if (question.type === 'multiple') {
    return Array.isArray(answer) && answer.length > 0;
  }

  if (question.type === 'single') {
    return question.options.includes(answer);
  }

  return typeof answer === 'string' && Boolean(answer.trim());
}

function getReachableQuestionIndex(requestedIndex, answers) {
  for (let questionIndex = 0; questionIndex < requestedIndex; questionIndex += 1) {
    const question = questions[questionIndex];

    if (!isQuestionAnswered(question, answers[question.id])) {
      return questionIndex;
    }
  }

  return requestedIndex;
}

function readStorageValue(key, fallbackValue) {
  try {
    const savedValue = localStorage.getItem(key);
    return savedValue === null ? fallbackValue : JSON.parse(savedValue);
  } catch {
    return fallbackValue;
  }
}

function createDefaultState() {
  return {
    user: createEmptyUser(),
    answers: normalizeAnswers({}),
    currentQuestion: 0,
    endTime: null,
    status: 'not-started',
  };
}

function getInitialState() {
  const user = normalizeUser(readStorageValue(storageKeys.user, createEmptyUser()));
  const answers = normalizeAnswers(readStorageValue(storageKeys.answers, {}));
  const savedEndTime = readStorageValue(storageKeys.endTime, null);
  const maximumValidEndTime = Date.now() + SURVEY_DURATION;
  let endTime =
    Number.isFinite(savedEndTime) && savedEndTime > 0 && savedEndTime <= maximumValidEndTime
      ? savedEndTime
      : null;
  const savedStatus = readStorageValue(storageKeys.status, 'not-started');
  const validStatus = validStatuses.has(savedStatus) ? savedStatus : 'not-started';
  let status = validStatus;
  const savedQuestion = readStorageValue(storageKeys.currentQuestion, 0);
  const boundedQuestion = Number.isInteger(savedQuestion)
    ? Math.min(Math.max(savedQuestion, 0), questions.length - 1)
    : 0;
  let currentQuestion = boundedQuestion;

  if (status === 'in-progress' && (endTime === null || !isValidUser(user))) {
    status = 'not-started';
    currentQuestion = 0;
    endTime = null;
  } else if (status === 'in-progress') {
    currentQuestion = getReachableQuestionIndex(boundedQuestion, answers);
  } else {
    endTime = null;

    if (status === 'not-started') {
      currentQuestion = 0;
    }
  }

  return {
    user,
    answers,
    currentQuestion,
    endTime,
    status,
  };
}

function surveyReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_USER':
      return state.status === 'not-started'
        ? { ...state, user: normalizeUser(action.user) }
        : state;
    case 'START_SURVEY': {
      const user = normalizeUser(action.user);
      const now = Date.now();
      const validEndTime =
        Number.isFinite(action.endTime) &&
        action.endTime > now &&
        action.endTime <= now + SURVEY_DURATION;

      return state.status === 'not-started' && isValidUser(user) && validEndTime
        ? {
            ...state,
            user,
            currentQuestion: 0,
            endTime: action.endTime,
            status: 'in-progress',
          }
        : state;
    }
    case 'UPDATE_ANSWER': {
      const question = questions.find(({ id }) => id === action.questionId);
      const activeQuestion = questions[state.currentQuestion];

      if (
        state.status !== 'in-progress' ||
        !question ||
        !activeQuestion ||
        question.id !== activeQuestion.id
      ) {
        return state;
      }

      return {
        ...state,
        answers: {
          ...state.answers,
          [action.questionId]: normalizeAnswer(question, action.value),
        },
      };
    }
    case 'PREVIOUS_QUESTION':
      return state.status === 'in-progress' && state.currentQuestion > 0
        ? { ...state, currentQuestion: state.currentQuestion - 1 }
        : state;
    case 'NEXT_QUESTION':
      return state.status === 'in-progress' &&
        state.currentQuestion < questions.length - 1 &&
        isQuestionAnswered(
          questions[state.currentQuestion],
          state.answers[questions[state.currentQuestion].id]
        )
        ? {
            ...state,
            currentQuestion: state.currentQuestion + 1,
          }
        : state;
    case 'COMPLETE_SURVEY':
      return state.status === 'in-progress' &&
        completionStatuses.has(action.status) &&
        (action.status === 'time-expired' ||
          (state.currentQuestion === questions.length - 1 &&
            isQuestionAnswered(
              questions[state.currentQuestion],
              state.answers[questions[state.currentQuestion].id]
            )))
        ? { ...state, endTime: null, status: action.status }
        : state;
    case 'RESET_SURVEY':
      return createDefaultState();
    default:
      return state;
  }
}

function writeStorageValue(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The survey remains usable when browser storage is unavailable.
  }
}

function useSurveyState() {
  const [state, dispatch] = useReducer(surveyReducer, undefined, getInitialState);

  useEffect(() => {
    writeStorageValue(storageKeys.user, state.user);
    writeStorageValue(storageKeys.answers, state.answers);
    writeStorageValue(storageKeys.currentQuestion, state.currentQuestion);
    writeStorageValue(storageKeys.endTime, state.endTime);
    writeStorageValue(storageKeys.status, state.status);
  }, [state]);

  const setUser = useCallback((user) => dispatch({ type: 'UPDATE_USER', user }), []);
  const startSurvey = useCallback(
    (user) =>
      dispatch({
        type: 'START_SURVEY',
        user,
        endTime: Date.now() + SURVEY_DURATION,
      }),
    []
  );
  const setAnswer = useCallback(
    (questionId, value) => dispatch({ type: 'UPDATE_ANSWER', questionId, value }),
    []
  );
  const goToPreviousQuestion = useCallback(() => dispatch({ type: 'PREVIOUS_QUESTION' }), []);
  const goToNextQuestion = useCallback(() => dispatch({ type: 'NEXT_QUESTION' }), []);
  const submitSurvey = useCallback(
    () => dispatch({ type: 'COMPLETE_SURVEY', status: 'submitted' }),
    []
  );
  const expireSurvey = useCallback(
    () => dispatch({ type: 'COMPLETE_SURVEY', status: 'time-expired' }),
    []
  );
  const resetSurvey = useCallback(() => {
    Object.values(storageKeys).forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // State still resets when browser storage is unavailable.
      }
    });
    dispatch({ type: 'RESET_SURVEY' });
  }, []);

  return {
    ...state,
    setUser,
    startSurvey,
    setAnswer,
    goToPreviousQuestion,
    goToNextQuestion,
    submitSurvey,
    expireSurvey,
    resetSurvey,
  };
}

export default useSurveyState;
