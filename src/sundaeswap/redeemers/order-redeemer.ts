import { BigNum, ConstrPlutusData, PlutusData, PlutusList } from '@emurgo/cardano-serialization-lib-nodejs';
import { AssetClassDecoder, Builder, Decodable, fromHex, IAssetClass } from '../../utils';
import { IOrderRedeemer, ISundaeSwapOrderRedeemerType } from './types';

export class SundaeswapOrderRedeemerDecoder implements Decodable<IOrderRedeemer> {
  decode(cborHex: string): IOrderRedeemer {
    const pd = PlutusData.from_bytes(fromHex(cborHex));
    const cpd = pd.as_constr_plutus_data();
    if (!cpd) throw new Error('Invalid constructor plutus data for order redeemer');

    switch (cpd.alternative().to_str()) {
      case '0':
        return SundaeswapOrderRedeemerBuilder.new()
          .type('OrderScoop')
          .scooper(new AssetClassDecoder().decode(pd.to_hex()))
          .build();
      case '1':
        return SundaeswapOrderRedeemerBuilder.new().type('OrderCancel').build();
      default:
        throw new Error('Unhandled alternative for order redeemer constructor');
    }
  }
}

export class SundaeswapOrderRedeemerBuilder implements Builder<IOrderRedeemer> {
  private _type!: ISundaeSwapOrderRedeemerType;
  private _scooper?: IAssetClass;

  static new = () => new SundaeswapOrderRedeemerBuilder();

  type(redeemer: ISundaeSwapOrderRedeemerType): SundaeswapOrderRedeemerBuilder {
    this._type = redeemer;
    return this;
  }

  scooper(assetClass: IAssetClass): SundaeswapOrderRedeemerBuilder {
    this._scooper = assetClass;
    return this;
  }

  build(): IOrderRedeemer {
    if (!this._type) throw new Error('"type" field is missing a value.');
    return {
      type: this._type,
      scooper: this._scooper,

      encode: () => {
        if (this._scooper) return this._scooper.encode();
        const fields = PlutusList.new();
        const alternative: BigNum = this._type === 'OrderScoop' ? BigNum.zero() : BigNum.one();
        return PlutusData.new_constr_plutus_data(ConstrPlutusData.new(alternative, fields));
      },
    };
  }
}
