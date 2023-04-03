import { Address } from '@emurgo/cardano-serialization-lib-nodejs';
import { OrderDatumBuilder, OrderDatumDecoder } from '../../../minswap/datums/order-datum';
import { SwapExactInBuilder } from '../../../minswap/datums/order-step';
import { ISwapExactIn } from '../../../minswap/datums/types';
import { adaToLovelace, AssetClassBuilder } from '../../../utils';

describe('order datum module', () => {
  test('builder with incomplete data', () => {
    try {
      OrderDatumBuilder.new().build();
      throw new Error('Expected field is missing value error');
    } catch (e) {}
  });

  test('encode order datum for swap exact in', () => {
    const minswap = AssetClassBuilder.new()
      .currencySymbol('29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6')
      .tokenName('4d494e')
      .build();
    const addr = Address.from_bech32(
      'addr1q8qcwuw9ju33z2l0zayt38wsthsldyrgyt82p2p3trccucffejwnp8afwa8v58aw7dpj7hpf9dh8txr0qlksqtcsxheq50tx0z',
    );
    const sei = SwapExactInBuilder.new().desiredCoin(minswap).minimumReceive(BigInt(44506401)).build();
    const order = OrderDatumBuilder.new()
      .sender(addr)
      .receiver(addr)
      .orderStep(sei)
      .batcherFee(adaToLovelace(2))
      .outputAda(adaToLovelace(2))
      .build();
    expect(order.encode().to_hex()).toBe(
      'd8799fd8799fd8799f581cc18771c59723112bef1748b89dd05de1f6906822cea0a83158f18e61ffd8799fd8799fd8799f581c29cc9d309fa9774eca1faef3432f5c292b6e75986f07ed002f1035f2ffffffffd8799fd8799f581cc18771c59723112bef1748b89dd05de1f6906822cea0a83158f18e61ffd8799fd8799fd8799f581c29cc9d309fa9774eca1faef3432f5c292b6e75986f07ed002f1035f2ffffffffd87a80d8799fd8799f581c29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6434d494eff1a02a71d21ff1a001e84801a001e8480ff',
    );
  });

  test('decode mainnet order datum for swap exact in', () => {
    const minswap = AssetClassBuilder.new()
      .currencySymbol('29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6')
      .tokenName('4d494e')
      .build();
    const expected =
      'd8799fd8799fd8799f581cc18771c59723112bef1748b89dd05de1f6906822cea0a83158f18e61ffd8799fd8799fd8799f581c29cc9d309fa9774eca1faef3432f5c292b6e75986f07ed002f1035f2ffffffffd8799fd8799f581cc18771c59723112bef1748b89dd05de1f6906822cea0a83158f18e61ffd8799fd8799fd8799f581c29cc9d309fa9774eca1faef3432f5c292b6e75986f07ed002f1035f2ffffffffd87a80d8799fd8799f581c29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6434d494eff1a02a71d21ff1a001e84801a001e8480ff';
    const actual = new OrderDatumDecoder('Mainnet').decode(expected);

    expect(actual.sender).toBe(
      'addr1q8qcwuw9ju33z2l0zayt38wsthsldyrgyt82p2p3trccucffejwnp8afwa8v58aw7dpj7hpf9dh8txr0qlksqtcsxheq50tx0z',
    );
    expect(actual.receiver).toBe(
      'addr1q8qcwuw9ju33z2l0zayt38wsthsldyrgyt82p2p3trccucffejwnp8afwa8v58aw7dpj7hpf9dh8txr0qlksqtcsxheq50tx0z',
    );
    expect(actual.orderStep.desiredCoin.currencySymbol).toBe(minswap.currencySymbol);
    expect(actual.orderStep.desiredCoin.tokenName).toBe(minswap.tokenName);
    expect((actual.orderStep as ISwapExactIn).minimumReceive).toBe(BigInt(44506401));
    expect(actual.receiverDatumHash).toBeUndefined();
    expect(actual.batcherFee).toBe(adaToLovelace(2));
    expect(actual.outputAda).toBe(adaToLovelace(2));
    expect(actual.encode().to_hex()).toBe(expected);
  });

  test('decode testnet order datum for swap exact in', () => {
    const minswap = AssetClassBuilder.new()
      .currencySymbol('29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6')
      .tokenName('4d494e')
      .build();
    const expected =
      'd8799fd8799fd8799f581cc18771c59723112bef1748b89dd05de1f6906822cea0a83158f18e61ffd8799fd8799fd8799f581c29cc9d309fa9774eca1faef3432f5c292b6e75986f07ed002f1035f2ffffffffd8799fd8799f581cc18771c59723112bef1748b89dd05de1f6906822cea0a83158f18e61ffd8799fd8799fd8799f581c29cc9d309fa9774eca1faef3432f5c292b6e75986f07ed002f1035f2ffffffffd87a80d8799fd8799f581c29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6434d494eff1a02a71d21ff1a001e84801a001e8480ff';
    const actual = new OrderDatumDecoder('Testnet').decode(expected);

    expect(actual.sender).toBe(
      'addr_test1qrqcwuw9ju33z2l0zayt38wsthsldyrgyt82p2p3trccucffejwnp8afwa8v58aw7dpj7hpf9dh8txr0qlksqtcsxheqhekxra',
    );
    expect(actual.receiver).toBe(
      'addr_test1qrqcwuw9ju33z2l0zayt38wsthsldyrgyt82p2p3trccucffejwnp8afwa8v58aw7dpj7hpf9dh8txr0qlksqtcsxheqhekxra',
    );
    expect(actual.orderStep.desiredCoin.currencySymbol).toBe(minswap.currencySymbol);
    expect(actual.orderStep.desiredCoin.tokenName).toBe(minswap.tokenName);
    expect((actual.orderStep as ISwapExactIn).minimumReceive).toBe(BigInt(44506401));
    expect(actual.receiverDatumHash).toBeUndefined();
    expect(actual.batcherFee).toBe(adaToLovelace(2));
    expect(actual.outputAda).toBe(adaToLovelace(2));
    expect(actual.encode().to_hex()).toBe(expected);
  });
});