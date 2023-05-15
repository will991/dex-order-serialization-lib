import { BigNum, ConstrPlutusData, PlutusData, PlutusList } from '@dcspark/cardano-multiplatform-lib-nodejs';
import { Builder, Decodable, ManagedFreeableScope, fromHex, toHex } from '../../utils';
import { IMuesliswapOrderRedeemer, IMuesliswapOrderRedeemerType } from './types';

export class MuesliswapOrderRedeemerDecoder implements Decodable<IMuesliswapOrderRedeemer> {
  decode(cborHex: string): IMuesliswapOrderRedeemer {
    const mfs = new ManagedFreeableScope();
    const cpd = mfs.manage(mfs.manage(PlutusData.from_bytes(fromHex(cborHex))).as_constr_plutus_data());
    if (!cpd) {
      mfs.dispose();
      throw new Error('Expected plutus constr for muesliswap order redeemer');
    }

    const alternative = mfs.manage(cpd.alternative()).to_str();
    mfs.dispose();
    switch (alternative) {
      case '0':
        return MuesliswapOrderRedeemerBuilder.new().type('Cancel').build();
      default:
        throw new Error('Unhandled alternative for order redeemer constructor');
    }
  }
}

export class MuesliswapOrderRedeemerBuilder implements Builder<IMuesliswapOrderRedeemer> {
  private _type: IMuesliswapOrderRedeemerType = 'Cancel';

  static new = () => new MuesliswapOrderRedeemerBuilder();

  type(redeemer: IMuesliswapOrderRedeemerType): MuesliswapOrderRedeemerBuilder {
    this._type = redeemer;
    return this;
  }

  build(): IMuesliswapOrderRedeemer {
    return {
      type: this._type,

      encode: () => {
        const mfs = new ManagedFreeableScope();
        const result = toHex(
          mfs
            .manage(
              PlutusData.new_constr_plutus_data(
                mfs.manage(ConstrPlutusData.new(mfs.manage(BigNum.zero()), mfs.manage(PlutusList.new()))),
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
