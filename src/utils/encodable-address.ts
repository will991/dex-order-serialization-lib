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
import { Builder, Decodable, Encodable, Network } from './types';

const PAYMENT_STAKE_ADDRESS_KEY_KEY_PREFIX_TESTNET = '00';
const PAYMENT_STAKE_ADDRESS_KEY_KEY_PREFIX_MAINNET = '01';
const PAYMENT_ADDRESS_PREFIX_TESTNET = '60';
const PAYMENT_ADDRESS_PREFIX_MAINNET = '61';

export interface IAddress extends Encodable {
  bech32: string;
}

export class AddressDecoder implements Decodable<Address> {
  readonly network: Network;

  constructor(network: Network) {
    this.network = network;
  }

  static new = (network: Network) => new AddressDecoder(network);

  decode(cborHex: string): Address {
    const pd = PlutusData.from_bytes(fromHex(cborHex));
    const cpd = pd.as_constr_plutus_data();
    if (!cpd) throw new Error('Invalid constructor plutus data for address');
    const fields = cpd.data();
    if (fields.len() !== 2) throw new Error(`Expected exactly 2 fields for address, received: ${fields.len()}`);
    const pkhCpd = fields.get(0).as_constr_plutus_data();
    if (!pkhCpd) throw new Error('Expected payment credential plutus data constructor');
    const pkhBytes = pkhCpd.data().get(0).as_bytes();
    if (!pkhBytes) throw new Error('Expected payment credential byte buffer');
    const spkhCpd = fields.get(1).as_constr_plutus_data();

    pd.free();
    cpd.free();
    fields.free();
    if (spkhCpd) {
      const spkhBytes = spkhCpd
        .data()
        .get(0)
        .as_constr_plutus_data()
        ?.data()
        .get(0)
        .as_constr_plutus_data()
        ?.data()
        .get(0)
        .as_bytes();
      if (!spkhBytes) throw new Error('Expected nested staking credential byte buffer');
      return this.network === 'Testnet'
        ? Address.from_hex(`${PAYMENT_STAKE_ADDRESS_KEY_KEY_PREFIX_TESTNET}${toHex(pkhBytes)}${toHex(spkhBytes!)}`)
        : Address.from_hex(`${PAYMENT_STAKE_ADDRESS_KEY_KEY_PREFIX_MAINNET}${toHex(pkhBytes)}${toHex(spkhBytes!)}`);
    } else {
      return this.network === 'Testnet'
        ? Address.from_hex(`${PAYMENT_ADDRESS_PREFIX_TESTNET}${toHex(pkhBytes)}`)
        : Address.from_hex(`${PAYMENT_ADDRESS_PREFIX_MAINNET}${toHex(pkhBytes)}`);
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

  address(addr: Address): EncodableAddressBuilder {
    this._bech32Address = addr.to_bech32();
    return this;
  }

  build(): IAddress {
    const address = Address.from_bech32(this._bech32Address);
    return {
      bech32: this._bech32Address,

      encode: () => {
        const baseAddress = BaseAddress.from_address(address);
        const enterpriseAddress = EnterpriseAddress.from_address(address);

        const pkh = (baseAddress ?? enterpriseAddress)?.payment_cred().to_keyhash()?.to_bytes();
        let spkh: Uint8Array | undefined;
        if (baseAddress) {
          spkh = baseAddress.stake_cred()?.to_keyhash()?.to_bytes();
        }

        baseAddress?.free();
        enterpriseAddress?.free();

        if (!pkh) throw new Error('Invalid address, missing payment credential.');

        const fields = PlutusList.new();
        // Nested object payment credential
        const pkhFields = PlutusList.new();
        pkhFields.add(PlutusData.new_bytes(pkh));
        fields.add(PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), pkhFields)));

        if (spkh) {
          const spkhFields = PlutusList.new();
          spkhFields.add(PlutusData.new_bytes(spkh));
          const spkhObj = PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), spkhFields));

          const nestedFields1 = PlutusList.new();
          nestedFields1.add(spkhObj);
          const nestedObj1 = PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), nestedFields1));

          const nestedFields2 = PlutusList.new();
          nestedFields2.add(nestedObj1);

          fields.add(PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), nestedFields2)));
        } else {
          fields.add(PlutusData.new_bytes(Buffer.alloc(0))); // add empty byte string for addresses with no staking credential
        }

        return PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), fields));
      },
    };
  }
}
