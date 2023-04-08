import { BigInt as CSLBigInt, PlutusData } from '@emurgo/cardano-serialization-lib-nodejs';
import { toHex } from './base16';
import { Encodable, PlutusDataBytes } from './types';

export class EncodableBigInt implements Encodable {
  readonly i: BigInt;

  constructor(i: BigInt) {
    this.i = i;
  }

  encode(): PlutusDataBytes {
    return toHex(PlutusData.new_integer(CSLBigInt.from_str(this.i.toString())).to_bytes());
  }
}
