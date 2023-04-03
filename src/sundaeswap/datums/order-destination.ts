import { BigNum, ConstrPlutusData, PlutusData, PlutusList } from '@emurgo/cardano-serialization-lib-nodejs';
import { AddressDecoder, Builder, Decodable, EncodableAddressBuilder, fromHex, Network } from '../../utils';
import { ISundaeSwapOrderDestination } from './types';

export class SundaeswapOrderDestinationDecoder implements Decodable<ISundaeSwapOrderDestination> {
  readonly network: Network;

  constructor(network: Network) {
    this.network = network;
  }

  static new = (network: Network) => new SundaeswapOrderDestinationDecoder(network);

  decode(cborHex: string): ISundaeSwapOrderDestination {
    const pd = PlutusData.from_bytes(fromHex(cborHex));
    const cpd = pd.as_constr_plutus_data();
    if (!cpd) throw new Error('Invalid constructor plutus data for order destination');
    const fields = cpd.data();
    if (fields.len() !== 2)
      throw new Error(`Expected exactly 2 fields for order destination datum, received: ${fields.len()}`);
    const address = new AddressDecoder(this.network).decode(fields.get(0).to_hex());

    const datumHashConstr = fields.get(1).as_constr_plutus_data();
    if (!datumHashConstr) throw new Error('Invalid datum hash type. Expected plutus data constructor');
    switch (datumHashConstr.alternative().to_str()) {
      case '0':
        return SundaeswapOrderDestinationBuilder.new()
          .bech32Address(address.to_bech32())
          .datumHash(datumHashConstr.data().get(0).to_hex())
          .build();
      case '1':
        return SundaeswapOrderDestinationBuilder.new().bech32Address(address.to_bech32()).build();
      default:
        throw new Error(`Unknown datum hash constructor alternative: ${datumHashConstr.alternative().to_str()}`);
    }
  }
}

export class SundaeswapOrderDestinationBuilder implements Builder<ISundaeSwapOrderDestination> {
  private _address!: string;
  private _datumHash?: string;

  static new = () => new SundaeswapOrderDestinationBuilder();

  bech32Address(bech32: string): SundaeswapOrderDestinationBuilder {
    this._address = bech32;
    return this;
  }

  datumHash(hash: string): SundaeswapOrderDestinationBuilder {
    this._datumHash = hash;
    return this;
  }

  build(): ISundaeSwapOrderDestination {
    if (!this._address) throw new Error('"address" field is missing a value.');
    return {
      address: this._address,
      datumHash: this._datumHash,

      encode: () => {
        const addressObj = EncodableAddressBuilder.new().bech32Address(this._address).build().encode();
        const fields = PlutusList.new();
        fields.add(addressObj);

        if (this._datumHash) {
          const f = PlutusList.new();
          f.add(PlutusData.from_hex(this._datumHash));
          fields.add(PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), f)));
        } else {
          fields.add(PlutusData.new_empty_constr_plutus_data(BigNum.one()));
        }

        return PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), fields));
      },
    };
  }
}
