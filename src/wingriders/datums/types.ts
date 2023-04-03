import { Encodable, IAssetClass } from '../../utils';
import { IAddress } from '../../utils/address';

export interface IWingridersOrderDatum extends Encodable {
  readonly direction: IWingridersSwapDirection;
  readonly beneficiary: IAddress;
  readonly owner: IWingridersStakeCredential;
  readonly deadline: BigInt;
  readonly lpAssetA: IAssetClass;
  readonly lpAssetB: IAssetClass;
  readonly minAmount: BigInt;
}

export enum IWingridersSwapDirection {
  ATOB = 0,
  BTOA = 1,
}

export type IWingridersStakeCredential = string;
