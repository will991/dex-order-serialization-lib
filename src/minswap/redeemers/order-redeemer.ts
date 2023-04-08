import { BigNum, ConstrPlutusData, PlutusData, PlutusList } from '@emurgo/cardano-serialization-lib-nodejs';
import { Builder, Decodable, fromHex, toHex } from '../../utils';
import { ManagedFreeableScope } from '../../utils/freeable';
import { IMinswapOrderRedeemer, IMinswapOrderRedeemerType } from './types';

export class MinswapOrderRedeemerDecoder implements Decodable<IMinswapOrderRedeemer> {
  decode(cborHex: string): IMinswapOrderRedeemer {
    const mfs = new ManagedFreeableScope();
    const pd = PlutusData.from_bytes(fromHex(cborHex));
    mfs.manage(pd);
    const alternative = pd.as_constr_plutus_data()?.alternative().to_str();

    mfs.dispose();
    if (!alternative) {
      throw new Error('Invalid constructor plutus data for order redeemer');
    }

    switch (alternative) {
      case '0':
        return MinswapOrderRedeemerBuilder.new().type('ApplyOrder').build();
      case '1':
        return MinswapOrderRedeemerBuilder.new().type('CancelOrder').build();
      default:
        throw new Error('Unhandled alternative for order redeemer constructor');
    }
  }
}

export class MinswapOrderRedeemerBuilder implements Builder<IMinswapOrderRedeemer> {
  private _type!: IMinswapOrderRedeemerType;

  static new = () => new MinswapOrderRedeemerBuilder();

  type(redeemer: IMinswapOrderRedeemerType): MinswapOrderRedeemerBuilder {
    this._type = redeemer;
    return this;
  }

  build(): IMinswapOrderRedeemer {
    if (!this._type) throw new Error('"type" field is missing a value.');
    return {
      type: this._type,
      encode: () => {
        return toHex(
          PlutusData.new_constr_plutus_data(
            ConstrPlutusData.new(this._type === 'ApplyOrder' ? BigNum.zero() : BigNum.one(), PlutusList.new()),
          ).to_bytes(),
        );
      },
    };
  }
}
