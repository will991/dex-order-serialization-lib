import { Encodable, IAddress } from '../../utils';

export interface IMuesliswapOrderDatum extends Encodable {
  /** Owner of the order */
  readonly creator: IAddress;
  readonly buyCurrencySymbol: string;
  readonly buyAssetName: string;
  readonly sellCurrencySymbol: string;
  readonly sellAssetName: string;
  readonly buyAmount: BigInt;
  readonly allowPartial: boolean;
  readonly fee: BigInt;
}
