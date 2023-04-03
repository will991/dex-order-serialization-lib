import {
  BigInt as CSLBigInt,
  BigNum,
  ConstrPlutusData,
  PlutusData,
  PlutusList,
} from '@emurgo/cardano-serialization-lib-nodejs';
import { AssetClassDecoder, fromHex } from '../../utils';
import { Builder, Decodable, Encodable, IAssetClass } from '../../utils/types';
import { IMinswapOrderStep, IMinswapSwapExactIn, IMinswapSwapExactOut } from './types';

export class MinswapOrderStepDecoder implements Decodable<IMinswapOrderStep> {
  decode(cborHex: string): IMinswapOrderStep {
    const pd = PlutusData.from_bytes(fromHex(cborHex));
    const cpd = pd.as_constr_plutus_data();
    if (!cpd) throw new Error('Invalid constructor plutus data for order step');
    const fields = cpd.data();
    if (fields.len() !== 2) throw new Error(`Expected exactly 2 fields for order step, received: ${fields.len()}`);

    const ac = new AssetClassDecoder().decode(fields.get(0).to_hex());
    const amt = fields.get(1).as_integer();
    if (!amt) throw new Error('Expected amount field');

    switch (cpd.alternative().to_str()) {
      case '0':
        return MinswapSwapExactInBuilder.new().desiredCoin(ac).minimumReceive(BigInt(amt.to_str())).build();
      case '1':
        return MinswapSwapExactOutBuilder.new().desiredCoin(ac).expectedReceive(BigInt(amt.to_str())).build();
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
        const fields = PlutusList.new();
        fields.add(this.coin.encode());
        fields.add(PlutusData.new_integer(CSLBigInt.from_str(this.amount.toString())));
        return PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), fields));
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
        const fields = PlutusList.new();
        fields.add(this.coin.encode());
        fields.add(PlutusData.new_integer(CSLBigInt.from_str(`${this.amount}`)));
        return PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.one(), fields));
      },
    };
  }
}
