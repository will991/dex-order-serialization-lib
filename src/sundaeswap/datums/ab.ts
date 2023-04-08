import { BigNum, ConstrPlutusData, PlutusData, PlutusList } from '@emurgo/cardano-serialization-lib-nodejs';
import { Builder, Encodable, toHex } from '../../utils';
import { toPlutusData } from '../../utils/plutusdata';
import { IAB } from './types';

export class ABBuilder<T extends Encodable> implements Builder<IAB<T>> {
  private _a!: T;
  private _b!: T;

  a(a: T): ABBuilder<T> {
    this._a = a;
    return this;
  }

  b(b: T): ABBuilder<T> {
    this._b = b;
    return this;
  }

  build(): IAB<T> {
    if (!this._a) throw new Error('"a" field is missing a value.');
    if (!this._b) throw new Error('"b" field is missing a value.');

    return {
      a: this._a,
      b: this._b,

      encode: () => {
        const fields = PlutusList.new();
        fields.add(toPlutusData(this._a.encode()));
        fields.add(toPlutusData(this._b.encode()));
        return toHex(PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), fields)).to_bytes());
      },
    };
  }
}
