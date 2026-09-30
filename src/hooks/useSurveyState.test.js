import { act, renderHook, waitFor } from '@testing-library/react';
import useSurveyState from './useSurveyState';

const user = {
  name: 'Ada',
  email: 'ada@example.com',
  age: '',
};

beforeEach(() => {
  localStorage.clear();
  jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-01-01T00:00:00Z').getTime());
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('bounds Back and Next navigation and retains previous answers', () => {
  const { result } = renderHook(() => useSurveyState());

  act(() => result.current.startSurvey(user));
  expect(result.current.currentQuestion).toBe(0);

  act(() => result.current.goToPreviousQuestion());
  expect(result.current.currentQuestion).toBe(0);

  act(() => result.current.goToNextQuestion());
  expect(result.current.currentQuestion).toBe(0);

  act(() => result.current.setAnswer('question1', 'Documentation'));
  act(() => result.current.goToNextQuestion());
  expect(result.current.currentQuestion).toBe(1);

  act(() => result.current.goToPreviousQuestion());
  expect(result.current.currentQuestion).toBe(0);
  expect(result.current.answers.question1).toBe('Documentation');
});

test('completes once and resets all persisted survey state', async () => {
  const { result } = renderHook(() => useSurveyState());

  act(() => result.current.startSurvey(user));
  act(() => result.current.setAnswer('question1', 'Documentation'));
  act(() => result.current.goToNextQuestion());
  act(() => result.current.setAnswer('question2', 'Reusable components'));
  act(() => result.current.goToNextQuestion());
  act(() => result.current.setAnswer('question3', ['Hooks']));

  act(() => {
    result.current.submitSurvey();
    result.current.submitSurvey();
  });

  expect(result.current.status).toBe('submitted');
  expect(result.current.endTime).toBeNull();
  expect(result.current.answers.question3).toEqual(['Hooks']);

  act(() => result.current.resetSurvey());

  expect(result.current).toMatchObject({
    user: { name: '', email: '', age: '' },
    answers: { question1: '', question2: '', question3: [] },
    currentQuestion: 0,
    endTime: null,
    status: 'not-started',
  });
  await waitFor(() => expect(localStorage.getItem('surveyStatus')).toBe('"not-started"'));
  expect(localStorage.getItem('surveyEndTime')).toBe('null');
});

test('falls back safely when localStorage contains malformed JSON', () => {
  localStorage.setItem('surveyUser', '{invalid');
  localStorage.setItem('surveyAnswers', '[invalid');
  localStorage.setItem('surveyCurrentQuestion', 'not-json');
  localStorage.setItem('surveyStatus', '"in-progress"');
  localStorage.setItem('surveyEndTime', JSON.stringify(Date.now() + 60000));

  const { result } = renderHook(() => useSurveyState());

  expect(result.current).toMatchObject({
    user: { name: '', email: '', age: '' },
    answers: { question1: '', question2: '', question3: [] },
    currentQuestion: 0,
    endTime: null,
    status: 'not-started',
  });
});

test('restores only reachable progress and normalizes stored answers', () => {
  localStorage.setItem('surveyUser', JSON.stringify(user));
  localStorage.setItem('surveyStatus', '"in-progress"');
  localStorage.setItem('surveyEndTime', JSON.stringify(Date.now() + 90000));
  localStorage.setItem('surveyCurrentQuestion', '2');
  localStorage.setItem(
    'surveyAnswers',
    JSON.stringify({
      question1: 'Documentation',
      question2: '',
      question3: ['Hooks', 'Unknown topic', 'Hooks'],
    })
  );

  const { result } = renderHook(() => useSurveyState());

  expect(result.current.status).toBe('in-progress');
  expect(result.current.currentQuestion).toBe(1);
  expect(result.current.answers).toEqual({
    question1: 'Documentation',
    question2: '',
    question3: ['Hooks'],
  });
  expect(result.current.endTime).toBe(Date.now() + 90000);
});
