import { BigNum, ConstrPlutusData, PlutusData, PlutusList } from '@emurgo/cardano-serialization-lib-nodejs';
import { Builder, Decodable, ManagedFreeableScope, Network, fromHex, toHex, toPlutusData } from '../../utils';
import { SundaeswapOrderDestinationDecoder } from './order-destination';
import { ISundaeswapOrderAddress, ISundaeswapOrderDestination } from './types';

export class SundaeswapOrderAddressDecoder implements Decodable<ISundaeswapOrderAddress> {
  readonly network: Network;

  constructor(network: Network) {
    this.network = network;
  }

  static new = (network: Network) => new SundaeswapOrderAddressDecoder(network);

  decode(cborHex: string): ISundaeswapOrderAddress {
    const mfs = new ManagedFreeableScope();
    const fields = mfs.manage(
      mfs.manage(mfs.manage(PlutusData.from_bytes(fromHex(cborHex))).as_constr_plutus_data())?.data(),
    );
    if (!fields || fields.len() !== 2) {
      const len = fields?.len() ?? 0;
      mfs.dispose();
      throw new Error(`Expected exactly 2 fields for order address datum, received: ${len}`);
    }

    const destAddress = new SundaeswapOrderDestinationDecoder(this.network).decode(mfs.manage(fields.get(0)).to_hex());
    const pkhConstr = mfs.manage(mfs.manage(fields.get(1)).as_constr_plutus_data());
    if (!pkhConstr) {
      mfs.dispose();
      throw new Error('Invalid alternate pubkey hash type. Expected plutus data constructor');
    }

    const alternative = mfs.manage(pkhConstr.alternative()).to_str();
    switch (alternative) {
      case '0':
        const pkhHex = mfs.manage(mfs.manage(pkhConstr.data()).get(0)).to_hex();
        mfs.dispose();
        return SundaeswapOrderAddressBuilder.new().destination(destAddress).pkh(pkhHex).build();
      case '1':
        mfs.dispose();
        return SundaeswapOrderAddressBuilder.new().destination(destAddress).build();
      default:
        mfs.dispose();
        throw new Error(`Unknown alternate pubkeyhash constructor alternative: ${alternative}`);
    }
  }
}

export class SundaeswapOrderAddressBuilder implements Builder<ISundaeswapOrderAddress> {
  private _destination!: ISundaeswapOrderDestination;
  private _pkh?: Uint8Array;

  static new = () => new SundaeswapOrderAddressBuilder();

  pkh(phkHex: string): SundaeswapOrderAddressBuilder {
    this._pkh = fromHex(phkHex);
    return this;
  }

  destination(dest: ISundaeswapOrderDestination): SundaeswapOrderAddressBuilder {
    this._destination = dest;
    return this;
  }

  build(): ISundaeswapOrderAddress {
    if (!this._destination) throw new Error('"destination" field is missing a value.');
    return {
      destination: this._destination,
      pubKeyHash: this._pkh ? toHex(this._pkh) : undefined,

      encode: () => {
        const mfs = new ManagedFreeableScope();
        const fields = mfs.manage(PlutusList.new());
        fields.add(mfs.manage(toPlutusData(this._destination.encode())));
        if (this._pkh) {
          const f = mfs.manage(PlutusList.new());
          f.add(mfs.manage(PlutusData.from_bytes(this._pkh)));
          fields.add(
            mfs.manage(
              PlutusData.new_constr_plutus_data(mfs.manage(ConstrPlutusData.new(mfs.manage(BigNum.zero()), f))),
            ),
          );
        } else {
          fields.add(mfs.manage(PlutusData.new_empty_constr_plutus_data(mfs.manage(BigNum.one()))));
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
