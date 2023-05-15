import { Address, BaseAddress } from '@dcspark/cardano-multiplatform-lib-nodejs';
import { AssetClassBuilder, ManagedFreeableScope } from '../../../utils';
import { WingridersOrderDatumBuilder, WingridersOrderDatumDecoder } from '../../../wingriders/datums/order-datum';
import { IWingridersSwapDirection } from '../../../wingriders/datums/types';

describe('order datum module', () => {
  test('builder with incomplete data', () => {
    try {
      WingridersOrderDatumBuilder.new().build();
      throw new Error('Expected field is missing value error');
    } catch (e) {}
  });

  test('encode order datum for wingriders swap', () => {
    const mfs = new ManagedFreeableScope();
    const wingriders = AssetClassBuilder.new()
      .currencySymbol('c0ee29a85b13209423b10447d3c2e6a50641a15c57770e27cb9d5073')
      .assetName('57696e67526964657273')
      .build();
    const addr = mfs.manage(
      Address.from_bech32(
        'addr1q8qcwuw9ju33z2l0zayt38wsthsldyrgyt82p2p3trccucffejwnp8afwa8v58aw7dpj7hpf9dh8txr0qlksqtcsxheq50tx0z',
      ),
    );
    const base = mfs.manage(BaseAddress.from_address(addr)!);
    const order = WingridersOrderDatumBuilder.new()
      .direction(IWingridersSwapDirection.ATOB)
      .beneficiary(addr.to_bech32())
      .owner(base.payment_cred().to_keyhash()!.to_hex())
      .deadline(BigInt(1671052263564))
      .assetA(AssetClassBuilder.ada())
      .assetB(wingriders)
      .minAmount(BigInt(6421137))
      .build();
    expect(order.encode()).toBe(
      'd8799fd8799fd8799fd8799f581cc18771c59723112bef1748b89dd05de1f6906822cea0a83158f18e61ffd8799fd8799fd8799f581c29cc9d309fa9774eca1faef3432f5c292b6e75986f07ed002f1035f2ffffffff581cc18771c59723112bef1748b89dd05de1f6906822cea0a83158f18e611b00000185127a008cd8799fd8799f4040ffd8799f581cc0ee29a85b13209423b10447d3c2e6a50641a15c57770e27cb9d50734a57696e67526964657273ffffffd8799fd879801a0061fa91ffff',
    );

    mfs.dispose();
  });

  test('decode mainnet order datum for wingriders swap', () => {
    const wingriders = AssetClassBuilder.new()
      .currencySymbol('c0ee29a85b13209423b10447d3c2e6a50641a15c57770e27cb9d5073')
      .assetName('57696e67526964657273')
      .build();
    const expected =
      'd8799fd8799fd8799fd8799f581cc18771c59723112bef1748b89dd05de1f6906822cea0a83158f18e61ffd8799fd8799fd8799f581c29cc9d309fa9774eca1faef3432f5c292b6e75986f07ed002f1035f2ffffffff581cc18771c59723112bef1748b89dd05de1f6906822cea0a83158f18e611b00000185127a008cd8799fd8799f4040ffd8799f581cc0ee29a85b13209423b10447d3c2e6a50641a15c57770e27cb9d50734a57696e67526964657273ffffffd8799fd879801a0061fa91ffff';
    const actual = new WingridersOrderDatumDecoder('Mainnet').decode(expected);

    expect(actual.beneficiary.bech32).toBe(
      'addr1q8qcwuw9ju33z2l0zayt38wsthsldyrgyt82p2p3trccucffejwnp8afwa8v58aw7dpj7hpf9dh8txr0qlksqtcsxheq50tx0z',
    );
    expect(actual.direction).toBe(IWingridersSwapDirection.ATOB);
    expect(actual.deadline).toBe(BigInt(1671052263564));
    expect(actual.lpAssetA.currencySymbol).toBe(AssetClassBuilder.ada().currencySymbol);
    expect(actual.lpAssetA.assetName).toBe(AssetClassBuilder.ada().assetName);
    expect(actual.lpAssetB.currencySymbol).toBe(wingriders.currencySymbol);
    expect(actual.lpAssetB.assetName).toBe(wingriders.assetName);
    expect(actual.minAmount).toBe(BigInt(6421137));
    expect(actual.owner).toBe('c18771c59723112bef1748b89dd05de1f6906822cea0a83158f18e61');

    expect(actual.encode()).toBe(expected);
  });
});
