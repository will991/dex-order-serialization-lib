import { Encodable } from '../../utils';

export type IMuesliswapOrderRedeemerType = 'Cancel';
export interface IMuesliswapOrderRedeemer extends Encodable {
  type: IMuesliswapOrderRedeemerType;
}
