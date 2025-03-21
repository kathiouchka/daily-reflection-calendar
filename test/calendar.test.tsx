import { render, screen } from '@testing-library/react';
import CalendarPage from '../app/calendar/page';

describe('CalendarPage', () => {
  it('renders the calendar header', () => {
    render(<CalendarPage />);
    // Expect the current month label (e.g. "March 2025") to appear – adjust as needed
    expect(screen.getByText(/2025/)).toBeInTheDocument();
  });
});
