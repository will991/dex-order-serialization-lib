import { Encodable } from '../../utils';

export type IWingridersRequestRedeemer = IWingridersApply | IWingridersReclaim;

export interface IWingridersReclaim extends Encodable {}
export interface IWingridersApply extends Encodable {
  poolInputLocation: number;
}
