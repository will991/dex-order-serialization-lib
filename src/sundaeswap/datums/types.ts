import { Encodable } from '../../utils';
import { EncodableBigInt } from '../../utils/encodable-bigint';

export interface IOrderAddress extends Encodable {
  destination: IOrderDestination;
  /** Hex encoded public key hash that can cancel order in case destination is script */
  pubKeyHash?: string;
}

export interface IOrderDestination extends Encodable {
  /** Bech32 encoded destination address */
  address: string;
  datumHash?: string;
}

export type IOrderAction = ISwapAction | IOrderWithdraw | IOrderDeposit;

// describes which direction the trade is in
export type ICoin = boolean;
export interface ISwapAction extends Encodable {
  coin: ICoin;
  depositAmount: BigInt;
  minimumReceivedAmount?: BigInt;
}

export type IOrderWithdraw = EncodableBigInt;
export type IOrderDeposit = IDespositSingle | IDepositMixed;

export interface IDespositSingle extends Encodable {
  coin: ICoin;
  amount: BigInt;
}

export type IDepositMixed = IAB<EncodableBigInt>;

export interface IAB<T extends Encodable> extends Encodable {
  a: T;
  b: T;
}

export interface IOrderDatum extends Encodable {
  poolIdentifier: string;
  orderAddress: IOrderAddress;
  scooperFee: BigInt;
  action: IOrderAction;
}
