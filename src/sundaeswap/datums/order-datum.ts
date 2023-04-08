import {
  BigNum,
  BigInt as CSLBigInt,
  ConstrPlutusData,
  PlutusData,
  PlutusList,
} from '@emurgo/cardano-serialization-lib-nodejs';
import { Builder, Decodable, ManagedFreeableScope, Network, fromHex, toHex, toPlutusData } from '../../utils';
import { SUNDAESWAP_SCOOPER_FEE_LOVELACE } from '../constant';
import { SundaeswapOrderActionDecoder } from './order-action';
import { SundaeswapOrderAddressDecoder } from './order-address';
import { ISundaeswapOrderAction, ISundaeswapOrderAddress, ISundaeswapOrderDatum } from './types';

export class SundaeswapOrderDatumDecoder implements Decodable<ISundaeswapOrderDatum> {
  readonly network: Network;

  constructor(network: Network) {
    this.network = network;
  }

  static new = (network: Network) => new SundaeswapOrderDatumDecoder(network);

  decode(cborHex: string): ISundaeswapOrderDatum {
    const mfs = new ManagedFreeableScope();
    const fields = PlutusData.from_bytes(fromHex(cborHex)).as_constr_plutus_data()?.data();
    mfs.manage(fields);
    if (!fields || fields.len() !== 4) {
      const len = fields?.len() ?? 0;
      mfs.dispose();
      throw new Error(`Expected exactly 4 fields for order datum, received: ${len}`);
    }
    const poolIdBytes = fields.get(0).as_bytes();
    if (!poolIdBytes) {
      mfs.dispose();
      throw new Error('No byte buffer found for pool identifier');
    }
    const addr = fields.get(1).to_hex();
    const orderAddress = new SundaeswapOrderAddressDecoder(this.network).decode(addr);
    const scooperFee = fields.get(2).as_integer();
    if (!scooperFee) {
      mfs.dispose();
      throw new Error('No byte buffer found for scooper fee');
    }
    const action = new SundaeswapOrderActionDecoder().decode(fields.get(3).to_hex());

    return SundaeswapOrderDatumBuilder.new()
      .poolIdentifier(toHex(poolIdBytes))
      .orderAddress(orderAddress)
      .scooperFee(BigInt(scooperFee.to_str()))
      .action(action)
      .build();
  }
}

// Reference datum: https://cardanoscan.io/datumInspector?datum=d8799f424901d8799fd8799fd8799fd8799f581cc18771c59723112bef1748b89dd05de1f6906822cea0a83158f18e61ffd8799fd8799fd8799f581c29cc9d309fa9774eca1faef3432f5c292b6e75986f07ed002f1035f2ffffffffd87a80ffd87a80ff1a002625a0d8799fd87a801a0133755ed8799f1a000f85acffffff
export class SundaeswapOrderDatumBuilder implements Builder<ISundaeswapOrderDatum> {
  private _poolIdentifier!: string;
  private _orderAddress!: ISundaeswapOrderAddress;
  private _scooperFee: BigInt = SUNDAESWAP_SCOOPER_FEE_LOVELACE;
  private _action!: ISundaeswapOrderAction;

  static new = () => new SundaeswapOrderDatumBuilder();

  poolIdentifier(ident: string): SundaeswapOrderDatumBuilder {
    this._poolIdentifier = ident;
    return this;
  }

  orderAddress(eAddress: ISundaeswapOrderAddress): SundaeswapOrderDatumBuilder {
    this._orderAddress = eAddress;
    return this;
  }

  scooperFee(fee: BigInt): SundaeswapOrderDatumBuilder {
    this._scooperFee = fee;
    return this;
  }

  action(action: ISundaeswapOrderAction): SundaeswapOrderDatumBuilder {
    this._action = action;
    return this;
  }

  build(): ISundaeswapOrderDatum {
    if (!this._poolIdentifier) throw new Error('"poolIdentifier" field is missing a value.');
    if (!this._orderAddress) throw new Error('"orderAddress" field is missing a value.');
    if (!this._scooperFee) throw new Error('"scooperFee" field is missing a value.');
    if (!this._action) throw new Error('"action" field is missing a value.');

    return {
      poolIdentifier: this._poolIdentifier,
      orderAddress: this._orderAddress,
      scooperFee: this._scooperFee,
      action: this._action,

      encode: () => {
        const mfs = new ManagedFreeableScope();
        const fields = PlutusList.new();
        mfs.manage(fields);

        fields.add(PlutusData.new_bytes(fromHex(this._poolIdentifier)));
        fields.add(toPlutusData(this._orderAddress.encode()));
        fields.add(PlutusData.new_integer(CSLBigInt.from_str(this._scooperFee.toString())));
        fields.add(toPlutusData(this._action.encode()));

        const result = toHex(PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), fields)).to_bytes());
        mfs.dispose();
        return result;
      },
    };
  }
}
