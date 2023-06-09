# Sundaeswap Orders

Similarly to other Plutus v1 DEXes, Sundaeswap Orders also require an _embedded_ datum (see [Minswap](../minswap/README.md)).

## Order Datum Type

#### Note

> Since Sundaeswap's source code is **not** open source, we will only highlight certain typescript types that can be used to construct an order datum.

The order datum type is called [`IOrderDatum`](./datums/types.ts#L41-L46) which is defined as following:

```
export interface IOrderDatum extends Encodable {
  poolIdentifier: string;
  orderAddress: IOrderAddress;
  scooperFee: BigInt;
  action: IOrderAction;
}

export interface IOrderAddress extends Encodable {
  destination: IOrderDestination;
  /** Hex encoded public key hash that can cancel order in case destination is script */
  pubKeyHash?: string;
}

export interface IOrderDestination extends Encodable {
  /** Bech32 encoded destination address */
  address: string;
  datumHash?: string;
}

export type IOrderAction = ISwapAction | IOrderWithdraw | IOrderDeposit;
```

The [`poolIdentifier`](./datums/types.ts#L42) is used by off-chain batchers to identify what token pair a specific order corresponds to.
An [`orderAddress`](./datums/order-address.ts) defines the destination of the swapped token and may be represented as simple wallet address or a script address (including a datum hash).
The `scooperFee` is the amount of `lovelace` paid to order batchers. Last but not least, [`action`](./datums/order-action.ts) defines what a user intends to do, whereby the `ISwapAction` & `IOrderWithdraw` is currently only implemented.

## Order Redeemer Type

Similarly to [Minswap](../minswap/README.md), there are two redeemers. One, `OrderScoop` which is the redeemer used by Sundaeswap's off-chain batcher (scooper) to execute the swap transaction that interacts with a liquidity pool.
Second, the [`OrderCancel`](./redeemers/types.ts#L3) redeemer which can be used by the owner of the order to cancel the swap before the batcher processed it.

```
export type IOrderRedeemerType = 'OrderScoop' | 'OrderCancel';
```

## Type Reference

### Datum Builders

- [`SundaeswapOrderAddressBuilder`](./datums/order-address.ts)
- [`SundaeswapOrderDatumBuilder`](./datums/order-datum.ts)
- [`SundaeswapOrderDestinationBuilder`](./datums/order-destination.ts)
- [`SundaeswapOrderDepositSingleBuilder`](./datums/order-action.ts) _(untested)_
- `SundaeswapOrderDepositMixedBuilder` _(not implemented)_
- [`SundaeswapOrderSwapBuilder`](./datums/order-action.ts)

### Datum Decoders

- [`SundaeswapOrderActionDecoder`](./datums/order-action.ts)
- [`SundaeswapOrderAddressDecoder`](./datums/order-address.ts)
- [`SundaeswapOrderDestinationDecoder`](./datums/order-destination.ts)
- `SundaeswapOrderDepositMixedDecoder` _(not implemented)_
- [`SundaeswapOrderSwapDecoder`](./datums/order-action.ts)

### Redeemer Builders

- [`SundaeswapOrderRedeemerBuilder`](./redeemers/order-redeemer.ts)

### Redeemer Decoders

- [`SundaeswapOrderRedeemerDecoder`](./redeemers/order-redeemer.ts)
