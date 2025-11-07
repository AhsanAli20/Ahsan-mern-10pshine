// File: src/__tests__/ForgotPassword.test.jsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPassword from '../components/ForgotPassword';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Helper to render component with router
const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('ForgotPassword Component', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all UI elements', () => {
    renderWithRouter(<ForgotPassword />);

    // Check header
    expect(screen.getByText(/Forgot Password/i)).toBeInTheDocument();
    expect(screen.getByText(/We'll send you a reset link/i)).toBeInTheDocument();

    // Check email input
    expect(screen.getByPlaceholderText(/Enter your email address/i)).toBeInTheDocument();

    // Check submit button
    expect(screen.getByRole('button', { name: /Send Reset Link/i })).toBeInTheDocument();

    // Check back to login link
    expect(screen.getByRole('link', { name: /Back to Login/i })).toBeInTheDocument();
  });

  test('submits form and shows success message', async () => {
    const successMessage = 'Reset link sent!';
    axios.post.mockResolvedValueOnce({ data: { message: successMessage } });

    renderWithRouter(<ForgotPassword />);

    fireEvent.change(screen.getByPlaceholderText(/Enter your email address/i), {
      target: { value: 'test@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Send Reset Link/i }));

    // Wait for success message
    const msg = await screen.findByText(new RegExp(successMessage, 'i'));
    expect(msg).toBeInTheDocument();

    // Ensure axios was called correctly
    expect(axios.post).toHaveBeenCalledWith('/api/users/forgotpassword', { email: 'test@example.com' });
  });

  test('shows error message when API call fails', async () => {
    const errorMessage = 'Email service failed';
    axios.post.mockRejectedValueOnce({
      response: { data: { message: errorMessage } },
    });

    renderWithRouter(<ForgotPassword />);

    fireEvent.change(screen.getByPlaceholderText(/Enter your email address/i), {
      target: { value: 'test@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Send Reset Link/i }));

    const errorMsg = await screen.findByText(new RegExp(errorMessage, 'i'));
    expect(errorMsg).toBeInTheDocument();
  });

  test('disables submit button while loading', async () => {
    let resolvePromise;
    axios.post.mockImplementationOnce(() => new Promise((res) => { resolvePromise = res; }));

    renderWithRouter(<ForgotPassword />);

    fireEvent.change(screen.getByPlaceholderText(/Enter your email address/i), {
      target: { value: 'loading@example.com' },
    });

    const button = screen.getByRole('button', { name: /Send Reset Link/i });
    fireEvent.click(button);

    // Button should be disabled while loading
    expect(button).toBeDisabled();

    // Resolve axios promise
    resolvePromise({ data: { message: 'Done' } });

    await waitFor(() => expect(button).not.toBeDisabled());
  });

});
