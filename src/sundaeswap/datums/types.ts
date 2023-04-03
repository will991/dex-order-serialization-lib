import { Encodable } from '../../utils';
import { EncodableBigInt } from '../../utils/encodable-bigint';

export interface ISundaeSwapOrderAddress extends Encodable {
  destination: ISundaeSwapOrderDestination;
  /** Hex encoded public key hash that can cancel order in case destination is script */
  pubKeyHash?: string;
}

export interface ISundaeSwapOrderDestination extends Encodable {
  /** Bech32 encoded destination address */
  address: string;
  datumHash?: string;
}

export type ISundaeSwapOrderAction = ISundaeSwapSwapAction | ISundaeSwapOrderWithdraw | ISundaeSwapOrderDeposit;

// describes which direction the trade is in
export type ICoin = boolean;
export interface ISundaeSwapSwapAction extends Encodable {
  coin: ICoin;
  depositAmount: BigInt;
  minimumReceivedAmount?: BigInt;
}

export type ISundaeSwapOrderWithdraw = EncodableBigInt;
export type ISundaeSwapOrderDeposit = IDespositSingle | IDepositMixed;

export interface IDespositSingle extends Encodable {
  coin: ICoin;
  amount: BigInt;
}

export type IDepositMixed = IAB<EncodableBigInt>;

export interface IAB<T extends Encodable> extends Encodable {
  a: T;
  b: T;
}

export interface ISundaeSwapOrderDatum extends Encodable {
  poolIdentifier: string;
  orderAddress: ISundaeSwapOrderAddress;
  scooperFee: BigInt;
  action: ISundaeSwapOrderAction;
}
