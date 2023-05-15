/** hex encoded cbor */

export type PlutusDataBytes = string;
export type Network = 'Testnet' | 'Mainnet';

/**
 * Defines a type that can be serialized to PlutusData and eventually to cbor.
 */
export interface Encodable {
  encode(): PlutusDataBytes;
}

/**
 * Defines a type that can be deserialized from cbor.
 */
export interface Decodable<T> {
  /** @throws Error for invalid cbor that does not match type <T>. */
  decode(cborHex: string): T;
}

/**
 * Defines a type for constructing complex types <T> using a builder pattern.
 */
export interface Builder<T> {
  build(): T;
}

export interface IAssetClass extends Encodable {
  /** Base16 encoded currency symbol */
  readonly currencySymbol: string;
  /** Base16 encoded asset identifier */
  readonly assetName: string;
}

/** Usually refers to an object that was returned by CSL. */
export interface Freeable {
  free: () => void;
}
