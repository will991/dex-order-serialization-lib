import { BigNum, ConstrPlutusData, PlutusData, PlutusList } from '@dcspark/cardano-multiplatform-lib-nodejs';
import {
  AddressDecoder,
  Builder,
  Decodable,
  EncodableAddressBuilder,
  ManagedFreeableScope,
  Network,
  fromHex,
  toHex,
  toPlutusData,
} from '../../utils';
import { ISundaeswapOrderDestination } from './types';

export class SundaeswapOrderDestinationDecoder implements Decodable<ISundaeswapOrderDestination> {
  readonly network: Network;

  constructor(network: Network) {
    this.network = network;
  }

  static new = (network: Network) => new SundaeswapOrderDestinationDecoder(network);

  decode(cborHex: string): ISundaeswapOrderDestination {
    const pd = PlutusData.from_bytes(fromHex(cborHex));
    const cpd = pd.as_constr_plutus_data();
    if (!cpd) throw new Error('Invalid constructor plutus data for order destination');
    const fields = cpd.data();
    if (fields.len() !== 2)
      throw new Error(`Expected exactly 2 fields for order destination datum, received: ${fields.len()}`);
    const address = new AddressDecoder(this.network).decode(toHex(fields.get(0).to_bytes()));

    const datumHashConstr = fields.get(1).as_constr_plutus_data();
    if (!datumHashConstr) throw new Error('Invalid datum hash type. Expected plutus data constructor');
    switch (datumHashConstr.alternative().to_str()) {
      case '0':
        return SundaeswapOrderDestinationBuilder.new()
          .bech32Address(address)
          .datumHash(toHex(datumHashConstr.data().get(0).to_bytes()))
          .build();
      case '1':
        return SundaeswapOrderDestinationBuilder.new().bech32Address(address).build();
      default:
        throw new Error(`Unknown datum hash constructor alternative: ${datumHashConstr.alternative().to_str()}`);
    }
  }
}

export class SundaeswapOrderDestinationBuilder implements Builder<ISundaeswapOrderDestination> {
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

  build(): ISundaeswapOrderDestination {
    if (!this._address) throw new Error('"address" field is missing a value.');
    return {
      address: this._address,
      datumHash: this._datumHash,

      encode: () => {
        const mfs = new ManagedFreeableScope();
        const fields = mfs.manage(PlutusList.new());

        fields.add(
          mfs.manage(toPlutusData(EncodableAddressBuilder.new().bech32Address(this._address).build().encode())),
        );

        if (this._datumHash) {
          const f = mfs.manage(PlutusList.new());
          f.add(mfs.manage(PlutusData.from_bytes(fromHex(this._datumHash))));
          fields.add(
            mfs.manage(
              PlutusData.new_constr_plutus_data(mfs.manage(ConstrPlutusData.new(mfs.manage(BigNum.zero()), f))),
            ),
          );
        } else {
          fields.add(
            mfs.manage(
              PlutusData.new_constr_plutus_data(
                mfs.manage(ConstrPlutusData.new(mfs.manage(BigNum.from_str('1')), mfs.manage(PlutusList.new()))),
              ),
            ),
          );
        }

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
