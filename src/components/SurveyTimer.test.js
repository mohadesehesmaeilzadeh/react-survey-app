import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import SurveyTimer from './SurveyTimer';

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-01-01T00:00:00Z'));
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

test('expires once and stops its interval at zero', () => {
  const onTimeExpired = jest.fn();
  const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

  render(<SurveyTimer endTime={Date.now() + 2000} onTimeExpired={onTimeExpired} />);

  expect(screen.getByText('00:02')).toBeInTheDocument();

  act(() => jest.advanceTimersByTime(2000));

  expect(screen.getByText('00:00')).toBeInTheDocument();
  expect(onTimeExpired).toHaveBeenCalledTimes(1);
  expect(clearIntervalSpy).toHaveBeenCalledTimes(1);

  act(() => jest.advanceTimersByTime(5000));
  expect(onTimeExpired).toHaveBeenCalledTimes(1);
});

test('keeps only one interval active and cleans it up on unmount', () => {
  const onTimeExpired = jest.fn();
  const setIntervalSpy = jest.spyOn(global, 'setInterval');
  const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
  const firstEndTime = Date.now() + 120000;
  const { rerender, unmount } = render(
    <SurveyTimer endTime={firstEndTime} onTimeExpired={onTimeExpired} />
  );

  expect(setIntervalSpy).toHaveBeenCalledTimes(1);
  rerender(<SurveyTimer endTime={firstEndTime} onTimeExpired={onTimeExpired} />);
  expect(setIntervalSpy).toHaveBeenCalledTimes(1);

  rerender(<SurveyTimer endTime={Date.now() + 90000} onTimeExpired={onTimeExpired} />);
  expect(setIntervalSpy).toHaveBeenCalledTimes(2);
  expect(clearIntervalSpy).toHaveBeenCalledTimes(1);

  unmount();
  expect(clearIntervalSpy).toHaveBeenCalledTimes(2);
});
