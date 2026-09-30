import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders the user information form before the survey starts', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /react survey/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /start survey/i })).toBeInTheDocument();
});

test('completes the existing survey flow', async () => {
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  render(<App />);

  fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Ada' } });
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'ada@example.com' },
  });
  fireEvent.click(screen.getByRole('button', { name: /start survey/i }));

  fireEvent.click(await screen.findByLabelText(/documentation/i));
  fireEvent.click(screen.getByRole('button', { name: /^next$/i }));

  fireEvent.change(screen.getByPlaceholderText(/type your answer here/i), {
    target: { value: 'Reusable components' },
  });
  fireEvent.click(screen.getByRole('button', { name: /^next$/i }));

  fireEvent.click(screen.getByLabelText(/^hooks$/i));
  const submitButton = screen.getByRole('button', { name: /submit survey/i });
  act(() => {
    submitButton.click();
    submitButton.click();
  });

  const completionHeading = await screen.findByRole('heading', { name: /thank you, ada/i });
  expect(completionHeading).toHaveFocus();
  expect(screen.getByRole('heading', { name: /survey summary/i })).toBeInTheDocument();
  expect(screen.getByText('3 of 3')).toBeInTheDocument();
  await waitFor(() => expect(localStorage.getItem('surveyStatus')).toBe('"submitted"'));
  expect(logSpy).toHaveBeenCalledTimes(1);
  expect(logSpy).toHaveBeenCalledWith(
    'Survey Result:',
    expect.objectContaining({ completed: true, reason: 'submitted' })
  );

  fireEvent.click(screen.getByRole('button', { name: /start new survey/i }));

  expect(screen.getByRole('button', { name: /start survey/i })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: /survey summary/i })).not.toBeInTheDocument();
  await waitFor(() => expect(localStorage.getItem('surveyStatus')).toBe('"not-started"'));
  expect(localStorage.getItem('surveyCurrentQuestion')).toBe('0');
  expect(localStorage.getItem('surveyEndTime')).toBe('null');
  expect(localStorage.getItem('surveyAnswers')).toBe(
    JSON.stringify({ question1: '', question2: '', question3: [] })
  );
});

test('preserves answers through back, next, and refresh navigation', async () => {
  const { unmount } = render(<App />);

  fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Ada' } });
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'ada@example.com' },
  });
  fireEvent.click(screen.getByRole('button', { name: /start survey/i }));

  fireEvent.click(await screen.findByLabelText(/documentation/i));
  fireEvent.click(screen.getByRole('button', { name: /^next$/i }));

  const textAnswer = await screen.findByPlaceholderText(/type your answer here/i);
  fireEvent.change(textAnswer, { target: { value: 'Reusable components' } });
  fireEvent.click(screen.getByRole('button', { name: /previous/i }));

  expect(await screen.findByLabelText(/documentation/i)).toBeChecked();
  fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
  expect(await screen.findByPlaceholderText(/type your answer here/i)).toHaveValue(
    'Reusable components'
  );

  await waitFor(() => expect(localStorage.getItem('surveyCurrentQuestion')).toBe('1'));
  unmount();
  render(<App />);

  expect(await screen.findByPlaceholderText(/type your answer here/i)).toHaveValue(
    'Reusable components'
  );
});

test('recovers safely from an invalid persisted question index and answer shape', async () => {
  localStorage.setItem(
    'surveyUser',
    JSON.stringify({ name: 'Ada', email: 'ada@example.com', age: '' })
  );
  localStorage.setItem('surveyStatus', '"in-progress"');
  localStorage.setItem('surveyEndTime', JSON.stringify(Date.now() + 120000));
  localStorage.setItem('surveyCurrentQuestion', '99');
  localStorage.setItem(
    'surveyAnswers',
    JSON.stringify({ question1: 'Documentation', question2: '', question3: 'Hooks' })
  );

  render(<App />);

  expect(
    screen.getByRole('heading', { name: /what do you like most about react/i })
  ).toBeInTheDocument();
  await waitFor(() => expect(localStorage.getItem('surveyCurrentQuestion')).toBe('1'));

  fireEvent.change(screen.getByPlaceholderText(/type your answer here/i), {
    target: { value: 'Components' },
  });
  fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
  expect(screen.getByLabelText(/^hooks$/i)).not.toBeChecked();
});

test('restores the timer from its original deadline after refresh', () => {
  const initialTime = new Date('2026-01-01T00:00:00Z').getTime();
  const endTime = initialTime + 120000;
  const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(initialTime);
  localStorage.setItem(
    'surveyUser',
    JSON.stringify({ name: 'Ada', email: 'ada@example.com', age: '' })
  );
  localStorage.setItem('surveyStatus', '"in-progress"');
  localStorage.setItem('surveyEndTime', JSON.stringify(endTime));

  const { unmount } = render(<App />);
  expect(screen.getByText('02:00')).toBeInTheDocument();

  unmount();
  nowSpy.mockReturnValue(initialTime + 30000);
  render(<App />);

  expect(screen.getByText('01:30')).toBeInTheDocument();
  expect(localStorage.getItem('surveyEndTime')).toBe(JSON.stringify(endTime));
});

test('expires a restored survey once its saved deadline has passed', async () => {
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  localStorage.setItem(
    'surveyUser',
    JSON.stringify({ name: 'Ada', email: 'ada@example.com', age: '' })
  );
  localStorage.setItem('surveyStatus', '"in-progress"');
  localStorage.setItem('surveyEndTime', JSON.stringify(Date.now() - 1000));

  render(<App />);

  expect(await screen.findByRole('heading', { name: /time is up/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /survey summary/i })).toBeInTheDocument();
  expect(screen.getByText('0 of 3')).toBeInTheDocument();
  await waitFor(() => expect(localStorage.getItem('surveyStatus')).toBe('"time-expired"'));
  expect(localStorage.getItem('surveyEndTime')).toBe('null');
  expect(logSpy).toHaveBeenCalledTimes(1);
});

test('rejects an invalid persisted deadline instead of resetting the timer', async () => {
  localStorage.setItem(
    'surveyUser',
    JSON.stringify({ name: 'Ada', email: 'ada@example.com', age: '' })
  );
  localStorage.setItem('surveyStatus', '"in-progress"');
  localStorage.setItem('surveyEndTime', '"not-a-timestamp"');

  render(<App />);

  expect(screen.getByRole('button', { name: /start survey/i })).toBeInTheDocument();
  expect(screen.queryByText(/time remaining/i)).not.toBeInTheDocument();
  await waitFor(() => expect(localStorage.getItem('surveyStatus')).toBe('"not-started"'));
  expect(localStorage.getItem('surveyEndTime')).toBe('null');
});

test('blocks unanswered questions at every question type and survey boundary', () => {
  render(<App />);

  fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Ada' } });
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'ada@example.com' },
  });
  fireEvent.click(screen.getByRole('button', { name: /start survey/i }));

  expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
  expect(screen.getByRole('button', { name: /^next$/i })).toBeDisabled();
  expect(screen.getByText(/add an answer to continue/i)).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: /what is your preferred way to learn react/i })
  ).toBeInTheDocument();

  fireEvent.click(screen.getByLabelText(/documentation/i));
  expect(screen.getByRole('button', { name: /^next$/i })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
  fireEvent.change(screen.getByPlaceholderText(/type your answer here/i), {
    target: { value: '   ' },
  });
  expect(screen.getByRole('button', { name: /^next$/i })).toBeDisabled();
  expect(screen.getByText(/add an answer to continue/i)).toBeInTheDocument();

  fireEvent.change(screen.getByPlaceholderText(/type your answer here/i), {
    target: { value: 'Components' },
  });
  fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
  expect(screen.queryByRole('button', { name: /^next$/i })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /previous/i })).toBeEnabled();

  expect(screen.getByRole('button', { name: /submit survey/i })).toBeDisabled();
  expect(screen.getByText(/select at least one answer to continue/i)).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: /which react topics have you learned/i })
  ).toBeInTheDocument();
});

test('falls back to the start screen for an invalid stored survey status', async () => {
  localStorage.setItem('surveyStatus', '"unknown"');
  localStorage.setItem('surveyCurrentQuestion', '2');
  localStorage.setItem('surveyEndTime', JSON.stringify(Date.now() + 120000));

  render(<App />);

  expect(screen.getByRole('button', { name: /start survey/i })).toBeInTheDocument();
  await waitFor(() => expect(localStorage.getItem('surveyStatus')).toBe('"not-started"'));
  expect(localStorage.getItem('surveyCurrentQuestion')).toBe('0');
  expect(localStorage.getItem('surveyEndTime')).toBe('null');
});

test('omits the summary when restored completion data has no usable details', () => {
  localStorage.setItem('surveyStatus', '"submitted"');

  render(<App />);

  expect(screen.getByRole('heading', { name: /^thank you!$/i })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: /survey summary/i })).not.toBeInTheDocument();
});
