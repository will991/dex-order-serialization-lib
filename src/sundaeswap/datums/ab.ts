import { BigNum, ConstrPlutusData, PlutusData, PlutusList } from '@dcspark/cardano-multiplatform-lib-nodejs';
import { Builder, Encodable, ManagedFreeableScope, toHex, toPlutusData } from '../../utils';
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
        const mfs = new ManagedFreeableScope();
        const fields = mfs.manage(PlutusList.new());
        fields.add(mfs.manage(toPlutusData(this._a.encode())));
        fields.add(mfs.manage(toPlutusData(this._b.encode())));
        const result = toHex(
          mfs
            .manage(
              PlutusData.new_constr_plutus_data(mfs.manage(ConstrPlutusData.new(mfs.manage(BigNum.zero()), fields))),
            )
            .to_bytes(),
        );

        mfs.dispose();
        return result;
      },
    };
  }
}
