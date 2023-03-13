# Minswap Orders

In its first version, Minswap order transactions require an _embedded_ datum. This is quite common for Plutus v1 based AMM _(Automated Market Maker)_ DEXes _(Decentralized Exchanges)_.

Usually, in the context of Plutus v1, datum hashes are provided by the creator of new transaction outputs and the consumer of such output is required to provide the pre-image of the datum hash in order to spend it. But off-chain order batchers cannot know the order details since the pre-image has never been published on-chain. Hence, _embedded_ datums offer a solution and allow output producers to include the pre-image of the datum hash as part of the transaction plutus witness set. This way, order outputs can be decoded, and inspected from on-chain data such so batchers can process them directly.
DEXes that are using Plutus v2 can make use of inline datums [CIP32](https://cips.cardano.org/cips/cip32/).

## Order Datum Type

The order datum type is open sourced together with the on-chain contract logic and can be found [here](https://github.com/CatspersCoffee/contracts/blob/main/dex/src/Minswap/BatchOrder/Types.hs#L67-L75).

```
data OrderDatum = OrderDatum
  { odSender :: Address,
    odReceiver :: Address,
    odReceiverDatumHash :: Maybe DatumHash,
    odStep :: OrderStep,
    odBatcherFee :: Integer,
    odOutputADA :: Integer
  }
  deriving stock (Haskell.Show)

data OrderStep
  = SwapExactIn
      { seiDesiredCoin :: AssetClass,
        seiMinimumReceive :: Integer
      }
  | SwapExactOut
      { seoDesiredCoin :: AssetClass,
        seoExpectedReceive :: Integer
      }
  -- other non relevant step variants
```

## Order Redeemer Type

The redeemer represents an input to the plutus smart contract and often directly relates to a user's action. For Minswap, a redeemer can be of [two types](https://github.com/CatspersCoffee/contracts/blob/main/dex/src/Minswap/BatchOrder/Types.hs#L80):

```
data OrderRedeemer = ApplyOrder | CancelOrder
```

The `CancelOrder` redeemer is callable by the owner of the order transaction, and `ApplyOrder` is used by batchers that process pending orders.

## Type Reference

### Datum Builders

- [`OrderDatumBuilder`](./datums/order-datum.ts)
- [`SwapExactInBuilder`](./datums/order-step.ts)
- [`SwapExactOutBuilder`](./datums/order-step.ts)

### Datum Decoders

- [`OrderDatumDecoder`](./datums/order-datum.ts)
- [`OrderStepDecoder`](./datums/order-step.ts)

### Redeemer Builders

- [`OrderRedeemerDecoder`](./redeemers/order-redeemer.ts)

### Redeemer Decoders

- [`OrderRedeemerBuilder`](./redeemers/order-redeemer.ts)
