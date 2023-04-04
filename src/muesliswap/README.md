# Muesliswap Orders

Muesliswap is a hybrid decentralized exchange offering orderbook based liquidity as well as (Uniswap-style) AMM DEX architecure liquidity - just like Minswap, Sundaeswap etc.

This library only supports creating datums and redeemers for swap order transactions that make use of Muesliswap's liquidity pools.

## Order Datum Type

```
export interface IMuesliswapOrderDatum {
  /** Owner of the order */
  creator: IAddress;
  buyCurrencySymbol: string;
  buyAssetName: string;
  sellCurrencySymbol: string;
  sellAssetName: string;
  buyAmount: BigInt;
  allowPartial: boolean;
  fee: BigInt;
}
```

## Order Redeemer Type

We only support the cancel redeemer which is the empty plutus data constructor.

## Type Reference

### Datum Builders

- [`MuesliswapOrderDatumDecoder`](./datums/order-datum.ts)

### Datum Decoders

- [`MuesliswapOrderDatumDecoder`](./datums/order-datum.ts)

### Redeemer Builders

- [`MuesliswapOrderRedeemerDecoder`](./redeemers/order-redeemer.ts)

### Redeemer Decoders

- [`MuesliswapOrderRedeemerBuilder`](./redeemers/order-redeemer.ts)
