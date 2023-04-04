import { BigNum, ConstrPlutusData, PlutusData, PlutusList } from '@emurgo/cardano-serialization-lib-nodejs';
import { ADA_CURRENCY_SYMBOL, ADA_TOKEN_NAME, CURRENCY_SYMBOL_HASH_BYTE_BUFFER_LENGTH } from '../constant';
import { fromHex, toHex } from './base16';
import { Builder, Decodable, IAssetClass } from './types';

export class AssetClassDecoder implements Decodable<IAssetClass> {
  decode(cborHex: string): IAssetClass {
    const pd = PlutusData.from_bytes(fromHex(cborHex));
    const cpd = pd.as_constr_plutus_data();
    if (!cpd) throw new Error('Invalid constructor plutus data for asset class');
    const fields = cpd.data();
    if (fields.len() !== 2) throw new Error(`Expected exactly 2 fields for assetclass, received: ${fields.len()}`);
    const csBytes = fields.get(0).as_bytes();
    if (!csBytes) throw new Error('Expected bytes type for currency symbol field.');
    const tknBytes = fields.get(1).as_bytes();
    if (!tknBytes) throw new Error('Expected bytes type for token name field.');

    pd.free();
    cpd.free();
    fields.free();

    return AssetClassBuilder.new().currencySymbol(toHex(csBytes)).tokenName(toHex(tknBytes)).build();
  }
}

export class AssetClassBuilder implements Builder<IAssetClass> {
  private _cs!: Uint8Array;
  private _tkn!: Uint8Array;

  static new = () => new AssetClassBuilder();
  static ada = () => AssetClassBuilder.new().currencySymbol(ADA_CURRENCY_SYMBOL).tokenName(ADA_TOKEN_NAME).build();

  currencySymbol(csHex: string): AssetClassBuilder {
    const cs = fromHex(csHex);
    if (cs.length !== CURRENCY_SYMBOL_HASH_BYTE_BUFFER_LENGTH && cs.length !== 0)
      throw new Error(`Expected ${CURRENCY_SYMBOL_HASH_BYTE_BUFFER_LENGTH} bytes, received: ${cs.length}`);
    this._cs = cs;
    return this;
  }

  tokenName(tknHex: string): AssetClassBuilder {
    this._tkn = fromHex(tknHex);
    return this;
  }

  build(): IAssetClass {
    if (this._cs.length !== CURRENCY_SYMBOL_HASH_BYTE_BUFFER_LENGTH && this._cs.length !== 0)
      throw new Error('"currencySymbol" field has invalid value.');

    return {
      currencySymbol: toHex(this._cs),
      tokenName: toHex(this._tkn),

      encode(): PlutusData {
        const fields = PlutusList.new();
        fields.add(PlutusData.new_bytes(fromHex(this.currencySymbol)));
        fields.add(PlutusData.new_bytes(fromHex(this.tokenName)));
        return PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), fields));
      },
    };
  }
}
