import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the user information form before the survey starts', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /survey app/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /start survey/i })).toBeInTheDocument();
});
