import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResetPassword from '../components/ResetPassword';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';

jest.mock('axios');

const renderWithToken = (token = 'testtoken123') => {
  return render(
    <MemoryRouter initialEntries={[`/reset-password/${token}`]}>
      <Routes>
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ResetPassword Component', () => {
  beforeEach(() => jest.clearAllMocks());

  test('renders password input fields', () => {
    renderWithToken();
    expect(screen.getByPlaceholderText(/Enter new password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Confirm new password/i)).toBeInTheDocument();
  });

  test('shows error when passwords do not match', async () => {
    renderWithToken();
    fireEvent.change(screen.getByPlaceholderText(/Enter new password/i), { target: { value: 'Pass@1234' } });
    fireEvent.change(screen.getByPlaceholderText(/Confirm new password/i), { target: { value: 'Diff@1234' } });
    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));
    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  test('calls API and shows success message', async () => {
    axios.put.mockResolvedValueOnce({ data: { message: 'Password reset successful' } });
    renderWithToken();
    fireEvent.change(screen.getByPlaceholderText(/Enter new password/i), { target: { value: 'Pass@1234' } });
    fireEvent.change(screen.getByPlaceholderText(/Confirm new password/i), { target: { value: 'Pass@1234' } });
    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));
    expect(await screen.findByText(/Password reset successful/i)).toBeInTheDocument();
  });

  test('shows error when API fails', async () => {
    axios.put.mockRejectedValueOnce({ response: { data: { message: 'Token expired' } } });
    renderWithToken();
    fireEvent.change(screen.getByPlaceholderText(/Enter new password/i), { target: { value: 'Pass@1234' } });
    fireEvent.change(screen.getByPlaceholderText(/Confirm new password/i), { target: { value: 'Pass@1234' } });
    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));
    expect(await screen.findByText(/Token expired/i)).toBeInTheDocument();
  });
});
