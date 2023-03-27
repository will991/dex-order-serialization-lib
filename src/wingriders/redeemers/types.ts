import { Encodable } from '../../utils';

export type RequestRedeemer = IApply | IReclaim;

export interface IReclaim extends Encodable {}
export interface IApply extends Encodable {
  poolInputLocation: number;
}
