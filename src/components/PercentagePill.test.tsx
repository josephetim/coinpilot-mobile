import { render } from '@testing-library/react-native';

import { PercentagePill } from '@/components/PercentagePill';

describe('PercentagePill', () => {
  it('renders a formatted percentage', () => {
    const { getByText } = render(<PercentagePill value={12.34} />);

    expect(getByText('+12.34%')).toBeTruthy();
  });
});
