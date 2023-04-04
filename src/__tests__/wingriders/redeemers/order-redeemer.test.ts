import { WingridersOrderRedeemerDecoder } from '../../../wingriders/redeemers/order-redeemer';

describe('wingriders order redeemer module', () => {
  test('decode/ encode reclaim order redeemer', () => {
    const expected = 'd87a80';
    const actual = new WingridersOrderRedeemerDecoder().decode(expected);
    expect(actual).toBeTruthy();
    expect(actual.encode().to_hex()).toBe(expected);
  });
});
