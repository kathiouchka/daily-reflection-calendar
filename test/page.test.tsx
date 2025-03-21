import { render, screen, waitFor } from '@testing-library/react';
import HomePage from '../app/page';
import { SessionProvider } from 'next-auth/react';

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ phrase: { text: "Test phrase" } }),
  })
) as jest.Mock;

describe('HomePage', () => {
  it('renders the phrase of the day', async () => {
    render(
      <SessionProvider session={{ user: { name: 'Test User', email: 'test@example.com', image: '' } }}>
        <HomePage />
      </SessionProvider>
    );
    await waitFor(() => {
      expect(screen.getByText("Test phrase")).toBeInTheDocument();
    });
  });
});
