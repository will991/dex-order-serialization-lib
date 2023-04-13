import { ADA_CURRENCY_SYMBOL, ADA_TOKEN_NAME } from '../../../constant';
import { MuesliswapOrderDatumBuilder, MuesliswapOrderDatumDecoder } from '../../../muesliswap/datums/order-datum';
import { AssetClassBuilder } from '../../../utils';

describe('muesliswap order datum module', () => {
  test('builder with incomplete data', () => {
    try {
      MuesliswapOrderDatumBuilder.new().build();
      throw new Error('Expected field is missing value error');
    } catch (e) {}
  });

  // https://cardanoscan.io/transaction/1dd87e1097fb609e404d6b62521790931957fb81695bc2b75a5ecf266da482d4?tab=utxo
  test('encode order datum for muesliswap swap', () => {
    const minswap = AssetClassBuilder.new()
      .currencySymbol('29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6')
      .assetName('4d494e')
      .build();
    const bech32Address =
      'addr1q8qcwuw9ju33z2l0zayt38wsthsldyrgyt82p2p3trccucffejwnp8afwa8v58aw7dpj7hpf9dh8txr0qlksqtcsxheq50tx0z';
    const order = MuesliswapOrderDatumBuilder.new()
      .creator(bech32Address)
      .buyCurrencySymbol(minswap.currencySymbol)
      .buyAssetName(minswap.assetName)
      .buyAmount(BigInt('52964147'))
      .sellCurrencySymbol(AssetClassBuilder.ada().currencySymbol)
      .sellAssetName(AssetClassBuilder.ada().assetName)
      .allowPartial(true)
      .fee(BigInt('2650000'))
      .build();
    expect(order.encode()).toBe(
      'd8799fd8799fd8799fd8799f581cc18771c59723112bef1748b89dd05de1f6906822cea0a83158f18e61ffd8799fd8799fd8799f581c29cc9d309fa9774eca1faef3432f5c292b6e75986f07ed002f1035f2ffffffff581c29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6434d494e40401a03282b33d87a801a00286f90ffff',
    );
  });

  // reference tx:    https://cardanoscan.io/transaction/1dd87e1097fb609e404d6b62521790931957fb81695bc2b75a5ecf266da482d4?tab=utxo
  // reference datum: https://cardanoscan.io/datumInspector?datum=d8799fd8799fd8799fd8799f581cc18771c59723112bef1748b89dd05de1f6906822cea0a83158f18e61ffd8799fd8799fd8799f581c29cc9d309fa9774eca1faef3432f5c292b6e75986f07ed002f1035f2ffffffff581c29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6434d494e40401a03282b33d87a801a00286f90ffff
  test('decode & encode order datum for ada to min swap', () => {
    const expected =
      'd8799fd8799fd8799fd8799f581cc18771c59723112bef1748b89dd05de1f6906822cea0a83158f18e61ffd8799fd8799fd8799f581c29cc9d309fa9774eca1faef3432f5c292b6e75986f07ed002f1035f2ffffffff581c29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6434d494e40401a03282b33d87a801a00286f90ffff';
    const actual = new MuesliswapOrderDatumDecoder('Mainnet').decode(expected);
    expect(actual).toBeTruthy();
    expect(actual.creator.bech32).toBe(
      'addr1q8qcwuw9ju33z2l0zayt38wsthsldyrgyt82p2p3trccucffejwnp8afwa8v58aw7dpj7hpf9dh8txr0qlksqtcsxheq50tx0z',
    );
    expect(actual.buyCurrencySymbol).toBe('29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6');
    expect(actual.buyAssetName).toBe('4d494e');
    expect(actual.buyAmount).toBe(BigInt('52964147'));
    expect(actual.sellCurrencySymbol).toBe(ADA_CURRENCY_SYMBOL);
    expect(actual.sellAssetName).toBe(ADA_TOKEN_NAME);
    expect(actual.fee).toBe(BigInt('2650000'));
    expect(actual.allowPartial).toBeTruthy();
    expect(actual.encode()).toBe(expected);
  });
});
