import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('App Component', () => {
  beforeEach(() => {
    render(<App />);
  });

  test('renders the app title', () => {
    expect(screen.getByText('DeepSeek Desktop')).toBeInTheDocument();
  });

  test('renders the subtitle', () => {
    expect(screen.getByText('Implementation Plan')).toBeInTheDocument();
  });

  test('renders all navigation items', () => {
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Architecture')).toBeInTheDocument();
    expect(screen.getByText('Project Plan')).toBeInTheDocument();
    expect(screen.getByText('Phases')).toBeInTheDocument();
    expect(screen.getByText('Components')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  test('defaults to Overview view', () => {
    // Overview should be the active view by default
    const overviewButton = screen.getByText('Overview');
    expect(overviewButton).toHaveClass('bg-blue-600/20');
  });

  test('switches views when navigation is clicked', () => {
    // Click on Architecture
    const architectureButton = screen.getByText('Architecture');
    fireEvent.click(architectureButton);
    
    // Architecture should now be active
    expect(architectureButton).toHaveClass('bg-blue-600/20');
  });

  test('renders breadcrumb navigation', () => {
    expect(screen.getByText('DeepSeek Desktop')).toBeInTheDocument();
  });

  test('mobile menu button is present', () => {
    const menuButton = screen.getByRole('button', { name: /menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  test('sidebar opens on mobile menu click', () => {
    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);
    
    // Sidebar should now be visible
    const sidebar = screen.getByRole('navigation');
    expect(sidebar).toBeInTheDocument();
  });
});
