import { Encodable, IAssetClass } from '../../utils';

export type IOrderRedeemerType = 'OrderScoop' | 'OrderCancel';

export type IScooper = IAssetClass;

export interface IOrderRedeemer extends Encodable {
  type: IOrderRedeemerType;
  scooper?: IScooper;
}
