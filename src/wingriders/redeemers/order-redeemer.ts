import { BigNum, PlutusData } from '@emurgo/cardano-serialization-lib-nodejs';
import { Builder, Decodable, fromHex } from '../../utils';
import { IReclaim } from './types';

export class OrderRedeemerDecoder implements Decodable<IReclaim> {
  decode(cborHex: string): IReclaim {
    const pd = PlutusData.from_bytes(fromHex(cborHex));
    const cpd = pd.as_constr_plutus_data();
    if (!cpd) throw new Error('Invalid constructor plutus data for order redeemer');

    switch (cpd.alternative().to_str()) {
      case '1':
        return OrderRedeemerBuilder.new().build();
      default:
        throw new Error('Unhandled alternative for order redeemer constructor');
    }
  }
}

export class OrderRedeemerBuilder implements Builder<IReclaim> {
  static new = () => new OrderRedeemerBuilder();

  build(): IReclaim {
    return {
      encode: () => {
        return PlutusData.new_empty_constr_plutus_data(BigNum.one());
      },
    };
  }
}
