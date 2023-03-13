# DEX Order Serialization Library

This library serves as serialization library for Cardano's decentralized exchanges (DEXs).
It offers types to simplify the transaction construction and cbor encoding for datums and redeemers to place an order for a specfic DEX.
Furthermore, its types are also able to read in cbor and decode it to corresponding types, if valid.

## Type structure

As this library supports decoding from and encoding to cbor, there are generally two types per datum and redeemer.
One for constructing and encoding, which this library refers to as [`builder`](./src/utils/types.ts#L18-23) type. And another one for decoding hex-encoded cbor to a specific type, which this library names [`decoder`](./src/utils/types.ts#L10-16).

### Builder type

Every [`builder`](./src/utils/types.ts#L18-23) type follows the same pattern inspired by [cardano-serialization-lib (CSL)](https://github.com/Emurgo/cardano-serialization-lib) as follows:

Example for creating an [`IAssetClass`](./src/utils/types.ts#L25-L30):

```
const minswapAC: IAssetClass = AssetClassBuilder.new()
  .currencySymbol('29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6')
  .tokenName('4d494e')
  .build();

const plutusData: PlutusData = minswapAC.encode();
const cborBytes: UInt8Array = plutusData.to_bytes();
const cborHex: string = plutusData.to_hex();
```

### Decoder type

A [`decoder`](./src/utils/types.ts#L10-16) usually takes no arguments to be constructed and offer a `decode` method.

Example for decoding an [`IAssetClass`](./src/utils/types.ts#L25-L30):

```

try {
  const minswap: IAssetClass = new AssetClassDecoder()
    .decode('29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6434d494e');
} catch (e) {
  /* invalid asset class cbor passed */
}

```

More specific examples related to orders for each DEX can be found under the following links:

- [Minswap](./src/minswap/README.md)
