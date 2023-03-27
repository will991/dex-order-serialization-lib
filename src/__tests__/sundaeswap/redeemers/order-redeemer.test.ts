import { OrderRedeemerDecoder } from '../../../sundaeswap/redeemers/order-redeemer';

describe('order redeemer module', () => {
  // Reference transaction: https://cardanoscan.io/transaction/bb38aad4515e30d3e9104a27779940aa977ff1f8e9137b5f9483410fcf8a4968
  test('decode/ encode order scoop redeemer', () => {
    const expected = 'd8799f581c9d1cbb54faf284f5d262f591b1f9201a1858de155157dad49f3881c442d70aff';
    const actual = new OrderRedeemerDecoder().decode(expected);
    expect(actual).toBeTruthy();
    expect(actual.type).toBe('OrderScoop');
    expect(actual.encode().to_hex()).toBe(expected);
  });

  // Reference transaction: https://cardanoscan.io/transaction/d4bf6dc892f71eb0c6dfea7898a7cbe3c9dd456729c078766261017efb57f638
  test('decode/ encode order cancel redeemer', () => {
    const expected = 'd87a80';
    const actual = new OrderRedeemerDecoder().decode(expected);
    expect(actual).toBeTruthy();
    expect(actual.type).toBe('OrderCancel');
    expect(actual.encode().to_hex()).toBe(expected);
  });
});
