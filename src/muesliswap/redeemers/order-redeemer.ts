import { BigNum, PlutusData } from '@emurgo/cardano-serialization-lib-browser';
import { Builder, Decodable, fromHex } from '../../utils';
import { IMuesliswapOrderRedeemer, IMuesliswapOrderRedeemerType } from './types';

export class MuesliswapOrderRedeemerDecoder implements Decodable<IMuesliswapOrderRedeemer> {
  decode(cborHex: string): IMuesliswapOrderRedeemer {
    const pd = PlutusData.from_bytes(fromHex(cborHex));
    const cpd = pd.as_constr_plutus_data();
    if (!cpd) throw new Error('Invalid constructor plutus data for order redeemer');

    switch (cpd.alternative().to_str()) {
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
        return PlutusData.new_empty_constr_plutus_data(BigNum.zero());
      },
    };
  }
}
