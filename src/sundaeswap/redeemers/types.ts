import { Encodable, IAssetClass } from '../../utils';

export type ISundaeswapOrderRedeemerType = 'OrderScoop' | 'OrderCancel';

export type ISundaeswapBatcher = IAssetClass;

export interface IOrderRedeemer extends Encodable {
  type: ISundaeswapOrderRedeemerType;
  scooper?: ISundaeswapBatcher;
}
