import { ADA_CURRENCY_SYMBOL, ADA_TOKEN_NAME, CURRENCY_SYMBOL_HASH_BYTE_BUFFER_LENGTH } from '../../constant';
import { AssetClassBuilder } from '../../utils/assetclass';
import { fromHex } from '../../utils/base16';

describe('assetclass builder module', () => {
  test('test assetclass ada builder', () => {
    const ada = AssetClassBuilder.ada();
    expect(ada).toBeTruthy();
    expect(ada.currencySymbol).toBe(ADA_CURRENCY_SYMBOL);
    expect(ada.assetName).toBe(ADA_TOKEN_NAME);
  });

  test('test assetclass native asset builder', () => {
    const minswapCs = '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6';
    const minswapTkn = '4d494e';
    const min = AssetClassBuilder.new().currencySymbol(minswapCs).assetName(minswapTkn).build();
    expect(min).toBeTruthy();
    expect(min.currencySymbol).toBe(minswapCs);
    expect(min.assetName).toBe(minswapTkn);
  });

  test('test assetclass native asset builder with invalid currency symbol', () => {
    const cs = 'abc';
    try {
      const min = AssetClassBuilder.new().currencySymbol(cs).assetName('4d494e').build();
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
