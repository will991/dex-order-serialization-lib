import { Encodable } from '../../utils';
import { EncodableBigInt } from '../../utils/encodable-bigint';

export interface ISundaeswapOrderAddress extends Encodable {
  destination: ISundaeswapOrderDestination;
  /** Hex encoded public key hash that can cancel order in case destination is script */
  pubKeyHash?: string;
}

export interface ISundaeswapOrderDestination extends Encodable {
  /** Bech32 encoded destination address */
  address: string;
  datumHash?: string;
}

export type ISundaeswapOrderAction = ISundaeswapSwapAction | ISundaeswapOrderWithdraw | ISundaeswapOrderDeposit;

// describes which direction the trade is in
export type ICoin = boolean;
export interface ISundaeswapSwapAction extends Encodable {
  coin: ICoin;
  depositAmount: BigInt;
  minimumReceivedAmount?: BigInt;
}

export type ISundaeswapOrderWithdraw = EncodableBigInt;
export type ISundaeswapOrderDeposit = IDespositSingle | IDepositMixed;

export interface IDespositSingle extends Encodable {
  coin: ICoin;
  amount: BigInt;
}

export type IDepositMixed = IAB<EncodableBigInt>;

export interface IAB<T extends Encodable> extends Encodable {
  a: T;
  b: T;
}

export interface ISundaeswapOrderDatum extends Encodable {
  poolIdentifier: string;
  orderAddress: ISundaeswapOrderAddress;
  scooperFee: BigInt;
  action: ISundaeswapOrderAction;
}
