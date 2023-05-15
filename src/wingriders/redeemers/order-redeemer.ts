import { BigNum, ConstrPlutusData, PlutusData, PlutusList } from '@dcspark/cardano-multiplatform-lib-nodejs';
import { Builder, Decodable, ManagedFreeableScope, fromHex, toHex } from '../../utils';
import { IWingridersReclaim } from './types';

export class WingridersOrderRedeemerDecoder implements Decodable<IWingridersReclaim> {
  decode(cborHex: string): IWingridersReclaim {
    const mfs = new ManagedFreeableScope();
    const alternativeCpd = mfs.manage(PlutusData.from_bytes(fromHex(cborHex)).as_constr_plutus_data());
    if (!alternativeCpd) {
      mfs.dispose();
      throw new Error('Expected plutus constr');
    }
    const alternative = mfs.manage(alternativeCpd.alternative()).to_str();
    mfs.dispose();
    switch (alternative) {
      case '1':
        return WingridersOrderRedeemerBuilder.new().build();
      default:
        throw new Error('Unhandled alternative for order redeemer constructor');
    }
  }
}

export class WingridersOrderRedeemerBuilder implements Builder<IWingridersReclaim> {
  static new = () => new WingridersOrderRedeemerBuilder();

  build(): IWingridersReclaim {
    return {
      encode: () => {
        const mfs = new ManagedFreeableScope();
        const result = toHex(
          mfs
            .manage(
              PlutusData.new_constr_plutus_data(
                mfs.manage(ConstrPlutusData.new(mfs.manage(BigNum.from_str('1')), PlutusList.new())),
              ),
            )
            .to_bytes(),
        );
        mfs.dispose();
        return result;
      },
    };
  }
}
