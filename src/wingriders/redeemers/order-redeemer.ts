import { BigNum, PlutusData } from '@emurgo/cardano-serialization-lib-nodejs';
import { Builder, Decodable, fromHex, toHex } from '../../utils';
import { IWingridersReclaim } from './types';

export class WingridersOrderRedeemerDecoder implements Decodable<IWingridersReclaim> {
  decode(cborHex: string): IWingridersReclaim {
    switch (PlutusData.from_bytes(fromHex(cborHex)).as_constr_plutus_data()?.alternative().to_str() ?? '') {
      case '1':
        return WingridersOrderRedeemerBuilder.new().build();
      default:
        throw new Error('Unhandled alternative for order redeemer constructor');
    }
  }
}

export class WingridersOrderRedeemerBuilder implements Builder<IWingridersReclaim> {
  static new = () => new WingridersOrderRedeemerBuilder();

  build(): IWingridersReclaim {
    return {
      encode: () => {
        return toHex(PlutusData.new_empty_constr_plutus_data(BigNum.one()).to_bytes());
      },
    };
  }
}
