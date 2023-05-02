import { BigInt as CSLBigInt, PlutusData } from '@emurgo/cardano-serialization-lib-browser';
import { Encodable } from './types';

export class EncodableBigInt implements Encodable {
  readonly i: BigInt;

  constructor(i: BigInt) {
    this.i = i;
  }

  encode(): PlutusData {
    return PlutusData.new_integer(CSLBigInt.from_str(this.i.toString()));
  }
}
