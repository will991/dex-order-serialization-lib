import {
  Address,
  BaseAddress,
  BigNum,
  ConstrPlutusData,
  EnterpriseAddress,
  PlutusData,
  PlutusList,
} from '@emurgo/cardano-serialization-lib-nodejs';
import { fromHex, toHex } from './base16';
import { ManagedFreeableScope } from './freeable';
import { Builder, Decodable, Encodable, Network } from './types';

const PAYMENT_STAKE_ADDRESS_KEY_KEY_PREFIX_TESTNET = '00';
const PAYMENT_STAKE_ADDRESS_KEY_KEY_PREFIX_MAINNET = '01';
const PAYMENT_ADDRESS_PREFIX_TESTNET = '60';
const PAYMENT_ADDRESS_PREFIX_MAINNET = '61';

export type Bech32Address = string;

export interface IAddress extends Encodable {
  bech32: string;
}

export class AddressDecoder implements Decodable<Bech32Address> {
  readonly network: Network;

  constructor(network: Network) {
    this.network = network;
  }

  static new = (network: Network) => new AddressDecoder(network);

  decode(cborHex: string): Bech32Address {
    const mfs = new ManagedFreeableScope();
    const fields = mfs.manage(
      mfs.manage(mfs.manage(PlutusData.from_bytes(fromHex(cborHex))).as_constr_plutus_data())?.data(),
    );

    if (!fields || fields.len() !== 2) {
      const len = fields?.len() ?? 0;
      mfs.dispose();
      throw new Error(`Expected exactly 2 fields for address, received: ${len}`);
    }

    const pkhCpd = mfs.manage(mfs.manage(fields.get(0)).as_constr_plutus_data());
    if (!pkhCpd) {
      mfs.dispose();
      throw new Error('Expected payment credential plutus data constructor');
    }

    const pkhBytes = mfs.manage(mfs.manage(pkhCpd.data()).get(0)).as_bytes();
    if (!pkhBytes) {
      mfs.dispose();
      throw new Error('Expected payment credential byte buffer');
    }

    const spkhCpd = mfs.manage(mfs.manage(fields.get(1)).as_constr_plutus_data());
    if (spkhCpd) {
      const nestedSpkhBytes = mfs.manage(mfs.manage(mfs.manage(spkhCpd.data()).get(0)).as_constr_plutus_data());
      if (!nestedSpkhBytes) {
        mfs.dispose();
        throw new Error('Expected nested staking credential byte buffer');
      }
      const nested2SpkhBytes = mfs.manage(
        mfs.manage(mfs.manage(nestedSpkhBytes.data()).get(0)).as_constr_plutus_data(),
      );
      if (!nested2SpkhBytes) {
        mfs.dispose();
        throw new Error('Expected nested staking credential byte buffer');
      }
      const spkhBytes = mfs.manage(mfs.manage(nested2SpkhBytes.data()).get(0)).as_bytes();
      if (!spkhBytes) {
        mfs.dispose();
        throw new Error('Expected nested staking credential byte buffer');
      }

      const addr =
        this.network === 'Testnet'
          ? mfs
              .manage(
                Address.from_hex(
                  `${PAYMENT_STAKE_ADDRESS_KEY_KEY_PREFIX_TESTNET}${toHex(pkhBytes)}${toHex(spkhBytes!)}`,
                ),
              )
              .to_bech32()
          : mfs
              .manage(
                Address.from_hex(
                  `${PAYMENT_STAKE_ADDRESS_KEY_KEY_PREFIX_MAINNET}${toHex(pkhBytes)}${toHex(spkhBytes!)}`,
                ),
              )
              .to_bech32();

      mfs.dispose();
      return addr;
    } else {
      const addr =
        this.network === 'Testnet'
          ? mfs.manage(Address.from_hex(`${PAYMENT_ADDRESS_PREFIX_TESTNET}${toHex(pkhBytes)}`)).to_bech32()
          : mfs.manage(Address.from_hex(`${PAYMENT_ADDRESS_PREFIX_MAINNET}${toHex(pkhBytes)}`)).to_bech32();
      mfs.dispose();
      return addr;
    }
  }
}

export class EncodableAddressBuilder implements Builder<IAddress> {
  private _bech32Address!: string;

  static new = () => new EncodableAddressBuilder();

  bech32Address(bech32: string): EncodableAddressBuilder {
    this._bech32Address = bech32;
    return this;
  }

  build(): IAddress {
    return {
      bech32: this._bech32Address,

      encode: () => {
        const mfs = new ManagedFreeableScope();
        const address = mfs.manage(Address.from_bech32(this._bech32Address));
        const baseAddress = mfs.manage(BaseAddress.from_address(address));
        const enterpriseAddress = mfs.manage(EnterpriseAddress.from_address(address));

        if (!baseAddress && !enterpriseAddress) {
          mfs.dispose();
          throw new Error('Invalid address type');
        }

        const pkh = mfs.manage(mfs.manage((baseAddress ?? enterpriseAddress)!.payment_cred()).to_keyhash())?.to_bytes();
        let spkh: Uint8Array | undefined;
        if (baseAddress) {
          const spkhCred = mfs.manage(baseAddress.stake_cred());
          if (spkhCred) {
            spkh = mfs.manage(spkhCred.to_keyhash())?.to_bytes();
          }
        }

        if (!pkh) {
          mfs.dispose();
          throw new Error('Invalid address, missing payment credential.');
        }

        const fields = mfs.manage(PlutusList.new());
        // Nested object payment credential
        const pkhFields = mfs.manage(PlutusList.new());
        pkhFields.add(mfs.manage(PlutusData.new_bytes(pkh)));
        fields.add(
          mfs.manage(
            PlutusData.new_constr_plutus_data(mfs.manage(ConstrPlutusData.new(mfs.manage(BigNum.zero()), pkhFields))),
          ),
        );

        if (spkh) {
          const spkhFields = mfs.manage(PlutusList.new());
          spkhFields.add(mfs.manage(PlutusData.new_bytes(spkh)));
          const spkhObj = mfs.manage(
            PlutusData.new_constr_plutus_data(mfs.manage(ConstrPlutusData.new(mfs.manage(BigNum.zero()), spkhFields))),
          );
          const nestedFields1 = mfs.manage(PlutusList.new());
          nestedFields1.add(spkhObj);
          const nestedObj1 = mfs.manage(
            PlutusData.new_constr_plutus_data(
              mfs.manage(ConstrPlutusData.new(mfs.manage(BigNum.zero()), nestedFields1)),
            ),
          );
          const nestedFields2 = mfs.manage(PlutusList.new());
          nestedFields2.add(nestedObj1);

          fields.add(
            mfs.manage(
              PlutusData.new_constr_plutus_data(
                mfs.manage(ConstrPlutusData.new(mfs.manage(BigNum.zero()), nestedFields2)),
              ),
            ),
          );
        } else {
          fields.add(mfs.manage(PlutusData.new_bytes(Buffer.alloc(0)))); // add empty byte string for addresses with no staking credential
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
