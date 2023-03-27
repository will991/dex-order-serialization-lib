import {
  BigInt as CSLBigInt,
  BigNum,
  ConstrPlutusData,
  PlutusData,
  PlutusList,
} from '@emurgo/cardano-serialization-lib-nodejs';
import { Builder, Decodable, fromHex, Network, toHex } from '../../utils';
import { SUNDAESWAP_SCOOPER_FEE_LOVELACE } from '../constant';
import { OrderActionDecoder } from './order-action';
import { OrderAddressDecoder } from './order-address';
import { IOrderAction, IOrderAddress, IOrderDatum } from './types';

export class OrderDatumDecoder implements Decodable<IOrderDatum> {
  readonly network: Network;

  constructor(network: Network) {
    this.network = network;
  }

  static new = (network: Network) => new OrderDatumDecoder(network);

  decode(cborHex: string): IOrderDatum {
    const pd = PlutusData.from_bytes(fromHex(cborHex));
    const cpd = pd.as_constr_plutus_data();
    if (!cpd) throw new Error('Invalid constructor plutus data for order datum');
    const fields = cpd.data();
    if (fields.len() !== 4) throw new Error(`Expected exactly 4 fields for order datum, received: ${fields.len()}`);
    const poolIdBytes = fields.get(0).as_bytes();
    if (!poolIdBytes) throw new Error('No byte buffer found for pool identifier');
    const orderAddress = new OrderAddressDecoder(this.network).decode(fields.get(1).to_hex());
    const scooperFee = fields.get(2).as_integer();
    if (!scooperFee) throw new Error('No byte buffer found for scooper fee');
    const action = new OrderActionDecoder().decode(fields.get(3).to_hex());

    return OrderDatumBuilder.new()
      .poolIdentifier(toHex(poolIdBytes))
      .orderAddress(orderAddress)
      .scooperFee(BigInt(scooperFee.to_str()))
      .action(action)
      .build();
  }
}

// Reference datum: https://cardanoscan.io/datumInspector?datum=d8799f424901d8799fd8799fd8799fd8799f581cc18771c59723112bef1748b89dd05de1f6906822cea0a83158f18e61ffd8799fd8799fd8799f581c29cc9d309fa9774eca1faef3432f5c292b6e75986f07ed002f1035f2ffffffffd87a80ffd87a80ff1a002625a0d8799fd87a801a0133755ed8799f1a000f85acffffff
export class OrderDatumBuilder implements Builder<IOrderDatum> {
  private _poolIdentifier!: string;
  private _orderAddress!: IOrderAddress;
  private _scooperFee: BigInt = SUNDAESWAP_SCOOPER_FEE_LOVELACE;
  private _action!: IOrderAction;

  static new = () => new OrderDatumBuilder();

  poolIdentifier(ident: string): OrderDatumBuilder {
    this._poolIdentifier = ident;
    return this;
  }

  orderAddress(eAddress: IOrderAddress): OrderDatumBuilder {
    this._orderAddress = eAddress;
    return this;
  }

  scooperFee(fee: BigInt): OrderDatumBuilder {
    this._scooperFee = fee;
    return this;
  }

  action(action: IOrderAction): OrderDatumBuilder {
    this._action = action;
    return this;
  }

  build(): IOrderDatum {
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
        const fields = PlutusList.new();
        fields.add(PlutusData.new_bytes(fromHex(this._poolIdentifier)));
        fields.add(this._orderAddress.encode());
        fields.add(PlutusData.new_integer(CSLBigInt.from_str(this._scooperFee.toString())));
        fields.add(this._action.encode());

        return PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), fields));
      },
    };
  }
}
