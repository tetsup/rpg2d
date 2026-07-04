import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DocumentListItemContent } from '@editor/components/parts/document-list-item-content';

describe('DocumentListItemContent', () => {
  it('renders label only when thumbnail is absent', () => {
    render(<DocumentListItemContent label="grass.v0: floor tile" />);

    expect(screen.getByText('grass.v0: floor tile')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders thumbnail and label when thumbnail is provided', () => {
    render(
      <DocumentListItemContent
        label="grass.v0: floor tile"
        thumbnail={<canvas data-testid="preview-canvas" />}
      />
    );

    expect(screen.getByTestId('preview-canvas')).toBeInTheDocument();
    expect(screen.getByText('grass.v0: floor tile')).toBeInTheDocument();
  });
});
