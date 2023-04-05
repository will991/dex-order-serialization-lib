import { MuesliswapOrderRedeemerDecoder } from '../../../muesliswap/redeemers/order-redeemer';

describe('order redeemer module', () => {
  test('decode/ encode order cancel redeemer', () => {
    const expected = 'd87980';
    const actual = new MuesliswapOrderRedeemerDecoder().decode(expected);
    expect(actual).toBeTruthy();
    expect(actual.type).toBe('Cancel');
    expect(actual.encode().to_hex()).toBe(expected);
  });
});
