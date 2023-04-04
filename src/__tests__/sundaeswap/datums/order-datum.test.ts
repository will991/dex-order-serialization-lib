import { SUNDAESWAP_SCOOPER_FEE_LOVELACE } from '../../../sundaeswap/constant';
import { SundaeswapOrderDatumDecoder } from '../../../sundaeswap/datums/order-datum';
import { ISundaeswapOrderAction, ISundaeswapSwapAction } from '../../../sundaeswap/datums/types';
import { adaToLovelace } from '../../../utils';

describe('order datum module', () => {
  // reference tx:    https://cardanoscan.io/transaction/dc8e74bed71ca3c7413c87fe8e51aa8043ec44488fb1e0fc696f8137f4631595?tab=utxo
  // reference datum: https://cardanoscan.io/datumInspector?datum=d8799f4108d8799fd8799fd8799fd8799f581cc18771c59723112bef1748b89dd05de1f6906822cea0a83158f18e61ffd8799fd8799fd8799f581c29cc9d309fa9774eca1faef3432f5c292b6e75986f07ed002f1035f2ffffffffd87a80ffd87a80ff1a002625a0d8799fd879801a001e8480d8799f1a0286ce64ffffff
  test('decode & encode order datum for ada to min swap', () => {
    const expected =
      'd8799f4108d8799fd8799fd8799fd8799f581cc18771c59723112bef1748b89dd05de1f6906822cea0a83158f18e61ffd8799fd8799fd8799f581c29cc9d309fa9774eca1faef3432f5c292b6e75986f07ed002f1035f2ffffffffd87a80ffd87a80ff1a002625a0d8799fd879801a001e8480d8799f1a0286ce64ffffff';
    const actual = new SundaeswapOrderDatumDecoder('Mainnet').decode(expected);
    expect(actual).toBeTruthy();
    expect(actual.poolIdentifier).toBe('08');
    expect(actual.orderAddress.destination.address).toBe(
      'addr1q8qcwuw9ju33z2l0zayt38wsthsldyrgyt82p2p3trccucffejwnp8afwa8v58aw7dpj7hpf9dh8txr0qlksqtcsxheq50tx0z',
    );
    expect(actual.orderAddress.destination.datumHash).toBeUndefined();
    expect(actual.orderAddress.pubKeyHash).toBeUndefined();
    expect(actual.scooperFee).toBe(SUNDAESWAP_SCOOPER_FEE_LOVELACE);
    expect(actual.action as ISundaeswapSwapAction).toBeTruthy();
    expect((actual.action as ISundaeswapSwapAction).coin).toBe(true);
    expect((actual.action as ISundaeswapSwapAction).depositAmount).toBe(adaToLovelace(2));
    expect((actual.action as ISundaeswapSwapAction).minimumReceivedAmount).toBe(BigInt(42389092));
    expect(actual.encode().to_hex()).toBe(expected);
  });

  // reference tx:    https://cardanoscan.io/transaction/f6c14d27aed081f7f969694ae05253a82d70209c7c2ce75fa4bbf4f38382386a?tab=utxo
  // reference datum: https://cardanoscan.io/datumInspector?datum=d8799f424901d8799fd8799fd8799fd8799f581cc18771c59723112bef1748b89dd05de1f6906822cea0a83158f18e61ffd8799fd8799fd8799f581c29cc9d309fa9774eca1faef3432f5c292b6e75986f07ed002f1035f2ffffffffd87a80ffd87a80ff1a002625a0d8799fd87a801a0133755ed8799f1a000f85acffffff
  test('decode & encode order datum for meld to ada swap', () => {
    const expected =
      'd8799f424901d8799fd8799fd8799fd8799f581cc18771c59723112bef1748b89dd05de1f6906822cea0a83158f18e61ffd8799fd8799fd8799f581c29cc9d309fa9774eca1faef3432f5c292b6e75986f07ed002f1035f2ffffffffd87a80ffd87a80ff1a002625a0d8799fd87a801a0133755ed8799f1a000f85acffffff';
    const actual = new SundaeswapOrderDatumDecoder('Mainnet').decode(expected);
    expect(actual).toBeTruthy();
    expect(actual.poolIdentifier).toBe('4901');
    expect(actual.orderAddress.destination.address).toBe(
      'addr1q8qcwuw9ju33z2l0zayt38wsthsldyrgyt82p2p3trccucffejwnp8afwa8v58aw7dpj7hpf9dh8txr0qlksqtcsxheq50tx0z',
    );
    expect(actual.orderAddress.destination.datumHash).toBeUndefined();
    expect(actual.orderAddress.pubKeyHash).toBeUndefined();
    expect(actual.scooperFee).toBe(SUNDAESWAP_SCOOPER_FEE_LOVELACE);
    expect(actual.action as ISundaeswapOrderAction).toBeTruthy();
    expect((actual.action as ISundaeswapSwapAction).coin).toBe(false);
    expect((actual.action as ISundaeswapSwapAction).depositAmount).toBe(BigInt(20149598));
    expect((actual.action as ISundaeswapSwapAction).minimumReceivedAmount).toBe(BigInt(1017260));
    expect(actual.encode().to_hex()).toBe(expected);
  });
});
