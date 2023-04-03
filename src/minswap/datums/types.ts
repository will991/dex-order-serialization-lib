import { Encodable, IAssetClass } from '../../utils/types';

export interface IMinswapOrderDatum extends Encodable {
  /** Bech32 encoded sender address */
  readonly sender: string;
  /** Bech32 encoded receiver address */
  readonly receiver: string;
  readonly receiverDatumHash?: string;
  readonly orderStep: IMinswapOrderStep;
  readonly batcherFee: BigInt;
  readonly outputAda: BigInt;
}

export type IMinswapOrderStep = IMinswapSwapExactIn | IMinswapSwapExactOut;

export interface IMinswapSwapExactIn extends Encodable {
  readonly desiredCoin: IAssetClass;
  readonly minimumReceive: BigInt;
}

export interface IMinswapSwapExactOut extends Encodable {
  readonly desiredCoin: IAssetClass;
  readonly expectedReceive: BigInt;
}
