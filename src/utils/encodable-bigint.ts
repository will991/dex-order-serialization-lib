import { BigInt as CSLBigInt, PlutusData } from '@emurgo/cardano-serialization-lib-nodejs';
import { toHex } from './base16';
import { ManagedFreeableScope } from './freeable';
import { Encodable, PlutusDataBytes } from './types';

export class EncodableBigInt implements Encodable {
  readonly i: BigInt;

  constructor(i: BigInt) {
    this.i = i;
  }

  encode(): PlutusDataBytes {
    const mfs = new ManagedFreeableScope();
    const result = toHex(
      mfs.manage(PlutusData.new_integer(mfs.manage(CSLBigInt.from_str(this.i.toString())))).to_bytes(),
    );
    mfs.dispose();
    return result;
  }
}
