import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App root', () => {
  it('renders without throwing error and displays cockpit title', async () => {
    render(<App />);
    expect(screen.getAllByText(/PaisaPilot/i).length).toBeGreaterThan(0);
  });
});
