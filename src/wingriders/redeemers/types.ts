import { Encodable } from '../../utils/types';

export type IWingridersRequestRedeemer = IWingridersApply | IWingridersReclaim;

export type IWingridersReclaim = Encodable;
export interface IWingridersApply extends Encodable {
  poolInputLocation: number;
}
