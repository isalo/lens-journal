import { describe, expect, it } from 'vitest';

import { approximateRegion, hasValidLocation } from './geo.js';

describe('hasValidLocation', () => {
  it('accepts in-range coordinates', () => {
    expect(hasValidLocation({ latitude: 52.2, longitude: 21.0 })).toBe(true);
  });

  it('rejects null island', () => {
    expect(hasValidLocation({ latitude: 0, longitude: 0 })).toBe(false);
  });

  it('rejects out-of-range and missing', () => {
    expect(hasValidLocation({ latitude: 200, longitude: 0 })).toBe(false);
    expect(hasValidLocation(null)).toBe(false);
    expect(hasValidLocation(undefined)).toBe(false);
  });
});

describe('approximateRegion', () => {
  it('labels hemispheres', () => {
    expect(approximateRegion({ latitude: 52.2297, longitude: 21.0122 })).toBe(
      '52.2\u00b0N, 21.0\u00b0E',
    );
    expect(approximateRegion({ latitude: -33.86, longitude: -70.5 })).toBe(
      '33.9\u00b0S, 70.5\u00b0W',
    );
  });
});
