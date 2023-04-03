import { Encodable, IAssetClass } from '../../utils';

export type ISundaeSwapOrderRedeemerType = 'OrderScoop' | 'OrderCancel';

export type ISundaeSwapBatcher = IAssetClass;

export interface IOrderRedeemer extends Encodable {
  type: ISundaeSwapOrderRedeemerType;
  scooper?: ISundaeSwapBatcher;
}
