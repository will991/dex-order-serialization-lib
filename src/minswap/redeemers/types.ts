import { Encodable } from '../../utils';

export type IMinswapOrderRedeemerType = 'ApplyOrder' | 'CancelOrder';
export interface IMinswapOrderRedeemer extends Encodable {
  type: IMinswapOrderRedeemerType;
}
