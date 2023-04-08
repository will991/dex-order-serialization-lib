import { MinswapOrderDatumBuilder, MinswapOrderDatumDecoder } from '../../../minswap/datums/order-datum';
import { MinswapSwapExactInBuilder } from '../../../minswap/datums/order-step';
import { IMinswapSwapExactIn } from '../../../minswap/datums/types';
import { AssetClassBuilder, adaToLovelace } from '../../../utils';

describe('order datum module', () => {
  test('builder with incomplete data', () => {
    try {
      MinswapOrderDatumBuilder.new().build();
      throw new Error('Expected field is missing value error');
    } catch (e) {}
  });

  test('encode order datum for swap exact in', () => {
    const minswap = AssetClassBuilder.new()
      .currencySymbol('29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6')
      .assetId('4d494e')
      .build();
    const bech32Address =
      'addr1q8qcwuw9ju33z2l0zayt38wsthsldyrgyt82p2p3trccucffejwnp8afwa8v58aw7dpj7hpf9dh8txr0qlksqtcsxheq50tx0z';
    const sei = MinswapSwapExactInBuilder.new().desiredCoin(minswap).minimumReceive(BigInt(44506401)).build();
    const order = MinswapOrderDatumBuilder.new()
      .sender(bech32Address)
      .receiver(bech32Address)
      .orderStep(sei)
      .batcherFee(adaToLovelace(2))
      .outputAda(adaToLovelace(2))
      .build();
    expect(order.encode()).toBe(
      'd8799fd8799fd8799f581cc18771c59723112bef1748b89dd05de1f6906822cea0a83158f18e61ffd8799fd8799fd8799f581c29cc9d309fa9774eca1faef3432f5c292b6e75986f07ed002f1035f2ffffffffd8799fd8799f581cc18771c59723112bef1748b89dd05de1f6906822cea0a83158f18e61ffd8799fd8799fd8799f581c29cc9d309fa9774eca1faef3432f5c292b6e75986f07ed002f1035f2ffffffffd87a80d8799fd8799f581c29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6434d494eff1a02a71d21ff1a001e84801a001e8480ff',
    );
  });

  test('decode mainnet order datum for swap exact in', () => {
    const minswap = AssetClassBuilder.new()
      .currencySymbol('29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6')
      .assetId('4d494e')
      .build();
    const expected =
      'd8799fd8799fd8799f581cc18771c59723112bef1748b89dd05de1f6906822cea0a83158f18e61ffd8799fd8799fd8799f581c29cc9d309fa9774eca1faef3432f5c292b6e75986f07ed002f1035f2ffffffffd8799fd8799f581cc18771c59723112bef1748b89dd05de1f6906822cea0a83158f18e61ffd8799fd8799fd8799f581c29cc9d309fa9774eca1faef3432f5c292b6e75986f07ed002f1035f2ffffffffd87a80d8799fd8799f581c29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6434d494eff1a02a71d21ff1a001e84801a001e8480ff';
    const actual = new MinswapOrderDatumDecoder('Mainnet').decode(expected);

    expect(actual.sender).toBe(
      'addr1q8qcwuw9ju33z2l0zayt38wsthsldyrgyt82p2p3trccucffejwnp8afwa8v58aw7dpj7hpf9dh8txr0qlksqtcsxheq50tx0z',
    );
    expect(actual.receiver).toBe(
      'addr1q8qcwuw9ju33z2l0zayt38wsthsldyrgyt82p2p3trccucffejwnp8afwa8v58aw7dpj7hpf9dh8txr0qlksqtcsxheq50tx0z',
    );
    expect(actual.orderStep.desiredCoin.currencySymbol).toBe(minswap.currencySymbol);
    expect(actual.orderStep.desiredCoin.assetId).toBe(minswap.assetId);
    expect((actual.orderStep as IMinswapSwapExactIn).minimumReceive).toBe(BigInt(44506401));
    expect(actual.receiverDatumHash).toBeUndefined();
    expect(actual.batcherFee).toBe(adaToLovelace(2));
    expect(actual.outputAda).toBe(adaToLovelace(2));
    expect(actual.encode()).toBe(expected);
  });

  test('decode testnet order datum for swap exact in', () => {
    const minswap = AssetClassBuilder.new()
      .currencySymbol('29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6')
      .assetId('4d494e')
      .build();
    const expected =
      'd8799fd8799fd8799f581cc18771c59723112bef1748b89dd05de1f6906822cea0a83158f18e61ffd8799fd8799fd8799f581c29cc9d309fa9774eca1faef3432f5c292b6e75986f07ed002f1035f2ffffffffd8799fd8799f581cc18771c59723112bef1748b89dd05de1f6906822cea0a83158f18e61ffd8799fd8799fd8799f581c29cc9d309fa9774eca1faef3432f5c292b6e75986f07ed002f1035f2ffffffffd87a80d8799fd8799f581c29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6434d494eff1a02a71d21ff1a001e84801a001e8480ff';
    const actual = new MinswapOrderDatumDecoder('Testnet').decode(expected);

    expect(actual.sender).toBe(
      'addr_test1qrqcwuw9ju33z2l0zayt38wsthsldyrgyt82p2p3trccucffejwnp8afwa8v58aw7dpj7hpf9dh8txr0qlksqtcsxheqhekxra',
    );
    expect(actual.receiver).toBe(
      'addr_test1qrqcwuw9ju33z2l0zayt38wsthsldyrgyt82p2p3trccucffejwnp8afwa8v58aw7dpj7hpf9dh8txr0qlksqtcsxheqhekxra',
    );
    expect(actual.orderStep.desiredCoin.currencySymbol).toBe(minswap.currencySymbol);
    expect(actual.orderStep.desiredCoin.assetId).toBe(minswap.assetId);
    expect((actual.orderStep as IMinswapSwapExactIn).minimumReceive).toBe(BigInt(44506401));
    expect(actual.receiverDatumHash).toBeUndefined();
    expect(actual.batcherFee).toBe(adaToLovelace(2));
    expect(actual.outputAda).toBe(adaToLovelace(2));
    expect(actual.encode()).toBe(expected);
  });
});
