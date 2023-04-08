import { MinswapSwapExactInBuilder, MinswapSwapExactOutBuilder } from '../../../minswap/datums/order-step';
import { AssetClassBuilder } from '../../../utils/assetclass';

describe('order step module', () => {
  test('swap exact in builder', () => {
    const minswap = AssetClassBuilder.new()
      .currencySymbol('29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6')
      .assetId('4d494e')
      .build();
    const sei = MinswapSwapExactInBuilder.new().desiredCoin(minswap).minimumReceive(BigInt(44506401)).build();
    expect(sei).toBeTruthy();
    expect(sei.encode()).toBe(
      'd8799fd8799f581c29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6434d494eff1a02a71d21ff',
    );
  });

  test('swap exact out builder', () => {
    const minswap = AssetClassBuilder.new()
      .currencySymbol('29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6')
      .assetId('4d494e')
      .build();
    const sei = MinswapSwapExactOutBuilder.new().desiredCoin(minswap).expectedReceive(BigInt(44506401)).build();
    expect(sei).toBeTruthy();
    expect(sei.encode()).toBe(
      'd87a9fd8799f581c29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6434d494eff1a02a71d21ff',
    );
  });
});
