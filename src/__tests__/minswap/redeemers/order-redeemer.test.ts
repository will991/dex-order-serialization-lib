import { MinswapOrderRedeemerDecoder } from '../../../minswap/redeemers/order-redeemer';

describe('order redeemer module', () => {
  test('decode/ encode apply order redeemer', () => {
    const expected = 'd87980';
    const actual = new MinswapOrderRedeemerDecoder().decode(expected);
    expect(actual).toBeTruthy();
    expect(actual.type).toBe('ApplyOrder');
    expect(actual.encode().to_hex()).toBe(expected);
  });

  test('decode/ encode cancel order redeemer', () => {
    const expected = 'd87a80';
    const actual = new MinswapOrderRedeemerDecoder().decode(expected);
    expect(actual).toBeTruthy();
    expect(actual.type).toBe('CancelOrder');
    expect(actual.encode().to_hex()).toBe(expected);
  });
});
