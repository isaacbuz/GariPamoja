import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

describe('App', () => {
  it('renders correctly', () => {
    const { getByText } = render(<App />);
    expect(getByText('GariPamoja')).toBeTruthy();
    expect(getByText('Car Sharing Platform')).toBeTruthy();
  });
}); 