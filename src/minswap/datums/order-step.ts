import {
  BigNum,
  BigInt as CSLBigInt,
  ConstrPlutusData,
  PlutusData,
  PlutusList,
} from '@emurgo/cardano-serialization-lib-nodejs';
import { AssetClassDecoder, fromHex, toHex } from '../../utils';
import { ManagedFreeableScope } from '../../utils/freeable';
import { toPlutusData } from '../../utils/plutusdata';
import { Builder, Decodable, Encodable, IAssetClass } from '../../utils/types';
import { IMinswapOrderStep, IMinswapSwapExactIn, IMinswapSwapExactOut } from './types';

export class MinswapOrderStepDecoder implements Decodable<IMinswapOrderStep> {
  decode(cborHex: string): IMinswapOrderStep {
    const mfs = new ManagedFreeableScope();
    const pd = PlutusData.from_bytes(fromHex(cborHex));
    mfs.manage(pd);
    const cpd = pd.as_constr_plutus_data();
    mfs.manage(cpd);
    if (!cpd) throw new Error('Invalid constructor plutus data for order step');
    const fields = cpd.data();
    mfs.manage(fields);
    if (fields.len() !== 2) {
      mfs.dispose();
      throw new Error(`Expected exactly 2 fields for order step, received: ${fields.len()}`);
    }

    const ac = new AssetClassDecoder().decode(fields.get(0).to_hex());
    const amt = fields.get(1).as_integer()?.to_str();
    const alternative = cpd.alternative().to_str();
    mfs.dispose();
    if (!amt) throw new Error('Expected amount field');

    switch (alternative) {
      case '0':
        return MinswapSwapExactInBuilder.new().desiredCoin(ac).minimumReceive(BigInt(amt)).build();
      case '1':
        return MinswapSwapExactOutBuilder.new().desiredCoin(ac).expectedReceive(BigInt(amt)).build();
      default:
        throw new Error(`Unexpected constructor index ${cpd.alternative().to_str()}`);
    }
  }
}

abstract class MinswapOrderStepBuilder<T extends Encodable> implements Builder<T> {
  protected coin!: IAssetClass;
  protected amount!: BigInt;

  abstract build(): T;
}

export class MinswapSwapExactInBuilder extends MinswapOrderStepBuilder<IMinswapSwapExactIn> {
  static new = () => new MinswapSwapExactInBuilder();

  desiredCoin(coin: IAssetClass): MinswapSwapExactInBuilder {
    this.coin = coin;
    return this;
  }

  minimumReceive(amount: BigInt): MinswapSwapExactInBuilder {
    this.amount = amount;
    return this;
  }

  build(): IMinswapSwapExactIn {
    if (!this.coin) throw new Error('"desiredCoin" field is missing a value.');
    if (!this.amount) throw new Error('"minimumReceive" field is missing a value.');
    return {
      desiredCoin: this.coin,
      minimumReceive: this.amount,

      encode: () => {
        const mfs = new ManagedFreeableScope();
        const fields = PlutusList.new();

        mfs.manage(fields);
        fields.add(toPlutusData(this.coin.encode()));
        fields.add(PlutusData.new_integer(CSLBigInt.from_str(this.amount.toString())));

        const result = toHex(PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), fields)).to_bytes());
        mfs.dispose();
        return result;
      },
    };
  }
}
export class MinswapSwapExactOutBuilder extends MinswapOrderStepBuilder<IMinswapSwapExactOut> {
  static new = () => new MinswapSwapExactOutBuilder();

  desiredCoin(coin: IAssetClass): MinswapSwapExactOutBuilder {
    this.coin = coin;
    return this;
  }

  expectedReceive(amount: BigInt): MinswapSwapExactOutBuilder {
    this.amount = amount;
    return this;
  }

  build(): IMinswapSwapExactOut {
    if (!this.coin) throw new Error('"desiredCoin" field is missing a value.');
    if (!this.amount) throw new Error('"expectedReceive" field is missing a value.');
    return {
      desiredCoin: this.coin,
      expectedReceive: this.amount,

      encode: () => {
        const mfs = new ManagedFreeableScope();
        const fields = PlutusList.new();
        mfs.manage(fields);

        fields.add(toPlutusData(this.coin.encode()));
        fields.add(PlutusData.new_integer(CSLBigInt.from_str(`${this.amount}`)));
        const result = toHex(PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.one(), fields)).to_bytes());
        mfs.dispose();
        return result;
      },
    };
  }
}
