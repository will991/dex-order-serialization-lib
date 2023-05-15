import { BigNum, ConstrPlutusData, PlutusData, PlutusList } from '@dcspark/cardano-multiplatform-lib-nodejs';
import { Builder, Decodable, ManagedFreeableScope, fromHex, toHex } from '../../utils';
import { IMinswapOrderRedeemer, IMinswapOrderRedeemerType } from './types';

export class MinswapOrderRedeemerDecoder implements Decodable<IMinswapOrderRedeemer> {
  decode(cborHex: string): IMinswapOrderRedeemer {
    const mfs = new ManagedFreeableScope();
    const pd = mfs.manage(PlutusData.from_bytes(fromHex(cborHex)));
    const cpd = mfs.manage(pd.as_constr_plutus_data());

    if (!cpd) {
      mfs.dispose();
      throw new Error('Expected plutus constr for minswap order redeemer');
    }
    const alternative = mfs.manage(cpd.alternative()).to_str();
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
        const mfs = new ManagedFreeableScope();
        const result = toHex(
          mfs
            .manage(
              PlutusData.new_constr_plutus_data(
                mfs.manage(
                  ConstrPlutusData.new(
                    this._type === 'ApplyOrder' ? mfs.manage(BigNum.zero()) : mfs.manage(BigNum.from_str('1')),
                    mfs.manage(PlutusList.new()),
                  ),
                ),
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
