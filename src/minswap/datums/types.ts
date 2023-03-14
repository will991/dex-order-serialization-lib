import { Encodable, IAssetClass } from '../../utils/types';

export interface IOrderDatum extends Encodable {
  /** Bech32 encoded sender address */
  readonly sender: string;
  /** Bech32 encoded receiver address */
  readonly receiver: string;
  readonly receiverDatumHash?: string;
  readonly orderStep: IOrderStep;
  readonly batcherFee: BigInt;
  readonly outputAda: BigInt;
}

export type IOrderStep = ISwapExactIn | ISwapExactOut;

export interface ISwapExactIn extends Encodable {
  readonly desiredCoin: IAssetClass;
  readonly minimumReceive: BigInt;
}

export interface ISwapExactOut extends Encodable {
  readonly desiredCoin: IAssetClass;
  readonly expectedReceive: BigInt;
}
