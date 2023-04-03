import { BigNum, ConstrPlutusData, PlutusData, PlutusList } from '@emurgo/cardano-serialization-lib-nodejs';
import { Builder, Decodable, fromHex } from '../../utils';
import { IMinswapOrderRedeemer, IMinswapOrderRedeemerType } from './types';

export class OrderRedeemerDecoder implements Decodable<IMinswapOrderRedeemer> {
  decode(cborHex: string): IMinswapOrderRedeemer {
    const pd = PlutusData.from_bytes(fromHex(cborHex));
    const cpd = pd.as_constr_plutus_data();
    if (!cpd) throw new Error('Invalid constructor plutus data for order datum');

    switch (cpd.alternative().to_str()) {
      case '0':
        return OrderRedeemerBuilder.new().type('ApplyOrder').build();
      case '1':
        return OrderRedeemerBuilder.new().type('CancelOrder').build();
      default:
        throw new Error('Unhandled alternative for order redeemer constructor');
    }
  }
}

export class OrderRedeemerBuilder implements Builder<IMinswapOrderRedeemer> {
  private _type!: IMinswapOrderRedeemerType;

  static new = () => new OrderRedeemerBuilder();

  type(redeemer: IMinswapOrderRedeemerType): OrderRedeemerBuilder {
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