import { BigNum, ConstrPlutusData, PlutusData, PlutusList } from '@emurgo/cardano-serialization-lib-nodejs';
import { Builder, Decodable, fromHex } from '../../utils';
import { IMinswapOrderRedeemer, IMinswapOrderRedeemerType } from './types';

export class MinswapOrderRedeemerDecoder implements Decodable<IMinswapOrderRedeemer> {
  decode(cborHex: string): IMinswapOrderRedeemer {
    const pd = PlutusData.from_bytes(fromHex(cborHex));
    const cpd = pd.as_constr_plutus_data();
    if (!cpd) throw new Error('Invalid constructor plutus data for order redeemer');

    switch (cpd.alternative().to_str()) {
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
        const alternative: BigNum = this._type === 'ApplyOrder' ? BigNum.zero() : BigNum.one();
        return PlutusData.new_constr_plutus_data(ConstrPlutusData.new(alternative, PlutusList.new()));
      },
    };
  }
}
