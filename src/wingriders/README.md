# Wingriders Orders

The order datum type was built based on the existing [dex-serializer library](https://github.com/WingRiders/dex-serializer) authored by Wingriders. In addition to swap datums, it also supports (de)serialization for different datum types such as liquidity addition and removal.
This library though focuses on orders and therefore only supports their swap order datum.

## Order Datum Type

The exact order type slightly differs from the implementation by [Wingriders](https://github.com/WingRiders/dex-serializer/blob/main/src/RequestDatum.ts):

```
export interface IOrderDatum extends Encodable {
  direction: ISwapDirection;
  beneficiary: IAddress;
  owner: IStakeCredential;
  deadline: BigInt;
  lpAssetA: IAssetClass;
  lpAssetB: IAssetClass;
  minAmount: BigInt;
}

export enum ISwapDirection {
  ATOB = 0,
  BTOA = 1,
}

export type IStakeCredential = string;
```

## Order Redeemer Type

The redeemer represents an input to the plutus smart contract and often directly relates to a user's action.
There are the `IApply` and `IReclaim` redeemer for processing and cancelling pending swap orders respectively.

This library currently only implements the (de)serialization of the `IReclaim` or cancel redeemer. (see redeemer section below)

```
export type RequestRedeemer = IApply | IReclaim;
```

## Type Reference

### Datum Builders

- [`OrderDatumBuilder`](./datums/order-datum.ts)

### Datum Decoders

- [`OrderDatumDecoder`](./datums/order-datum.ts)

### Redeemer Builders

- [`OrderRedeemerDecoder`](./redeemers/order-redeemer.ts)

### Redeemer Decoders

- [`OrderRedeemerBuilder`](./redeemers/order-redeemer.ts)
