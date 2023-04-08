import { BigNum, ConstrPlutusData, PlutusData, PlutusList } from '@emurgo/cardano-serialization-lib-nodejs';
import { AssetClassDecoder, Builder, Decodable, IAssetClass, ManagedFreeableScope, fromHex, toHex } from '../../utils';
import { IOrderRedeemer, ISundaeswapOrderRedeemerType } from './types';

export class SundaeswapOrderRedeemerDecoder implements Decodable<IOrderRedeemer> {
  decode(cborHex: string): IOrderRedeemer {
    const mfs = new ManagedFreeableScope();
    const pd = PlutusData.from_bytes(fromHex(cborHex));
    mfs.manage(pd);

    const alternative = pd.as_constr_plutus_data()?.alternative().to_str();
    const pdHex = pd.to_hex();
    mfs.dispose();

    if (!alternative) throw new Error('Invalid constructor plutus data for order redeemer');
    switch (alternative) {
      case '0':
        return SundaeswapOrderRedeemerBuilder.new()
          .type('OrderScoop')
          .scooper(new AssetClassDecoder().decode(pdHex))
          .build();
      case '1':
        return SundaeswapOrderRedeemerBuilder.new().type('OrderCancel').build();
      default:
        throw new Error('Unhandled alternative for order redeemer constructor');
    }
  }
}

export class SundaeswapOrderRedeemerBuilder implements Builder<IOrderRedeemer> {
  private _type!: ISundaeswapOrderRedeemerType;
  private _scooper?: IAssetClass;

  static new = () => new SundaeswapOrderRedeemerBuilder();

  type(redeemer: ISundaeswapOrderRedeemerType): SundaeswapOrderRedeemerBuilder {
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
        const mfs = new ManagedFreeableScope();
        const fields = PlutusList.new();
        mfs.manage(fields);
        const result = toHex(
          PlutusData.new_constr_plutus_data(
            ConstrPlutusData.new(this._type === 'OrderScoop' ? BigNum.zero() : BigNum.one(), fields),
          ).to_bytes(),
        );
        mfs.dispose();
        return result;
      },
    };
  }
}
