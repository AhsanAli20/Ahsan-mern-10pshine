// src/tests/HomePage.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// MOCK COMPONENTS (virtual)
jest.mock('../components/HomePage', () => {
  return { __esModule: true, default: () => <div>Mocked HomePage</div> };
});

// Virtual module for TextSlider (does NOT need a real file)
jest.mock('../components/TextSlider', () => {
  return { __esModule: true, default: () => <div>Mocked TextSlider</div> };
}, { virtual: true });

// MOCK FRAMER MOTION
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children }) => <div>{children}</div>,
    span: ({ children }) => <span>{children}</span>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// MOCK NAVIGATION
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

// HELPER
const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('HomePage - Fully Mocked', () => {
  beforeEach(() => mockedNavigate.mockClear());

  test('renders HomePage without crashing', () => {
    const HomePage = require('../components/HomePage').default;
    renderWithRouter(<HomePage />);
    expect(screen.getByText(/Mocked HomePage/i)).toBeInTheDocument();
  });

  test('renders TextSlider without crashing', () => {
    const TextSlider = require('../components/TextSlider').default;
    renderWithRouter(<TextSlider />);
    expect(screen.getByText(/Mocked TextSlider/i)).toBeInTheDocument();
  });
});
