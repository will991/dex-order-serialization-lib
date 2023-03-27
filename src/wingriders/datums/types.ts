import { Encodable, IAssetClass } from '../../utils';
import { IAddress } from '../../utils/address';

export interface IOrderDatum extends Encodable {
  readonly direction: ISwapDirection;
  readonly beneficiary: IAddress;
  readonly owner: IStakeCredential;
  readonly deadline: BigInt;
  readonly lpAssetA: IAssetClass;
  readonly lpAssetB: IAssetClass;
  readonly minAmount: BigInt;
}

export enum ISwapDirection {
  ATOB = 0,
  BTOA = 1,
}

export type IStakeCredential = string;
