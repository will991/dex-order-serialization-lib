import { BigNum, ConstrPlutusData, PlutusData, PlutusList } from '@emurgo/cardano-serialization-lib-nodejs';
import { Builder, Decodable, fromHex, Network, toHex } from '../../utils';
import { OrderDestinationDecoder } from './order-destination';
import { IOrderAddress, IOrderDestination } from './types';

export class OrderAddressDecoder implements Decodable<IOrderAddress> {
  readonly network: Network;

  constructor(network: Network) {
    this.network = network;
  }

  static new = (network: Network) => new OrderAddressDecoder(network);

  decode(cborHex: string): IOrderAddress {
    const pd = PlutusData.from_bytes(fromHex(cborHex));
    const cpd = pd.as_constr_plutus_data();
    if (!cpd) throw new Error('Invalid constructor plutus data for order address');
    const fields = cpd.data();
    if (fields.len() !== 2)
      throw new Error(`Expected exactly 2 fields for order address datum, received: ${fields.len()}`);
    const destAddress = new OrderDestinationDecoder(this.network).decode(fields.get(0).to_hex());
    const pkhConstr = fields.get(1).as_constr_plutus_data();
    if (!pkhConstr) throw new Error('Invalid alternate pubkey hash type. Expected plutus data constructor');
    switch (pkhConstr.alternative().to_str()) {
      case '0':
        return OrderAddressBuilder.new().destination(destAddress).pkh(pkhConstr.data().get(0).to_hex()).build();
      case '1':
        return OrderAddressBuilder.new().destination(destAddress).build();
      default:
        throw new Error(`Unknown alternate pubkeyhash constructor alternative: ${pkhConstr.alternative().to_str()}`);
    }
  }
}

export class OrderAddressBuilder implements Builder<IOrderAddress> {
  private _destination!: IOrderDestination;
  private _pkh?: Uint8Array;

  static new = () => new OrderAddressBuilder();

  pkh(phkHex: string): OrderAddressBuilder {
    this._pkh = fromHex(phkHex);
    return this;
  }

  destination(dest: IOrderDestination): OrderAddressBuilder {
    this._destination = dest;
    return this;
  }

  build(): IOrderAddress {
    if (!this._destination) throw new Error('"destination" field is missing a value.');
    return {
      destination: this._destination,
      pubKeyHash: this._pkh ? toHex(this._pkh) : undefined,

      encode: () => {
        const fields = PlutusList.new();
        fields.add(this._destination.encode());
        if (this._pkh) {
          const f = PlutusList.new();
          f.add(PlutusData.from_bytes(this._pkh));
          fields.add(PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), f)));
        } else {
          fields.add(PlutusData.new_empty_constr_plutus_data(BigNum.one()));
        }
        return PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), fields));
      },
    };
  }
}
