import { BigNum, PlutusData } from '@emurgo/cardano-serialization-lib-nodejs';
import { Builder, Decodable, fromHex } from '../../utils';
import { IWingridersReclaim } from './types';

export class WingridersOrderRedeemerDecoder implements Decodable<IWingridersReclaim> {
  decode(cborHex: string): IWingridersReclaim {
    const pd = PlutusData.from_bytes(fromHex(cborHex));
    const cpd = pd.as_constr_plutus_data();
    if (!cpd) throw new Error('Invalid constructor plutus data for order redeemer');

    switch (cpd.alternative().to_str()) {
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
        return PlutusData.new_empty_constr_plutus_data(BigNum.one());
      },
    };
  }
}
