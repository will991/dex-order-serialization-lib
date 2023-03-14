import { Encodable } from '../../utils';

export type IOrderRedeemerType = 'ApplyOrder' | 'CancelOrder';
export interface IOrderRedeemer extends Encodable {
  type: IOrderRedeemerType;
}
