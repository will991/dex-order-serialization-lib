import { ADA_CURRENCY_SYMBOL, ADA_TOKEN_NAME, CURRENCY_SYMBOL_HASH_BYTE_BUFFER_LENGTH } from '../../constant';
import { AssetClassBuilder } from '../../utils/assetclass';
import { fromHex } from '../../utils/base16';

describe('assetclass builder module', () => {
  test('test assetclass ada builder', () => {
    const ada = AssetClassBuilder.ada();
    expect(ada).toBeTruthy();
    expect(ada.currencySymbol).toBe(ADA_CURRENCY_SYMBOL);
    expect(ada.tokenName).toBe(ADA_TOKEN_NAME);
  });

  test('test assetclass native asset builder', () => {
    const minswap_cs = '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6';
    const minswap_tkn = '4d494e';
    const min = AssetClassBuilder.new().currencySymbol(minswap_cs).tokenName(minswap_tkn).build();
    expect(min).toBeTruthy();
    expect(min.currencySymbol).toBe(minswap_cs);
    expect(min.tokenName).toBe(minswap_tkn);
  });

  test('test assetclass native asset builder with invalid currency symbol', () => {
    const cs = 'abc';
    try {
      const min = AssetClassBuilder.new().currencySymbol(cs).tokenName('4d494e').build();
      fail('Expected assetclass builder to not accept invalid currency symbol');
    } catch (e) {
      if (e instanceof Error) {
        expect(e.message).toBe(
          `Expected ${CURRENCY_SYMBOL_HASH_BYTE_BUFFER_LENGTH} bytes, received: ${fromHex(cs).length}`,
        );
      } else {
        fail(`Expected different exception, received: ${e}`);
      }
    }
  });
});
