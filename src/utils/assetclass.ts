import { BigNum, ConstrPlutusData, PlutusData, PlutusList } from '@emurgo/cardano-serialization-lib-nodejs';
import { ADA_CURRENCY_SYMBOL, ADA_TOKEN_NAME, CURRENCY_SYMBOL_HASH_BYTE_BUFFER_LENGTH } from '../constant';
import { fromHex, toHex } from './base16';
import { hasValidCurrencySymbolLength } from './currencysymbol';
import { ManagedFreeableScope } from './freeable';
import { Builder, Decodable, IAssetClass, PlutusDataBytes } from './types';

export class AssetClassDecoder implements Decodable<IAssetClass> {
  decode(cborHex: string): IAssetClass {
    const mfs = new ManagedFreeableScope();
    const fields = PlutusData.from_bytes(fromHex(cborHex)).as_constr_plutus_data()?.data();

    mfs.manage(fields);

    if (!fields || fields.len() !== 2) {
      const len = fields?.len() ?? 0;
      mfs.dispose();
      throw new Error(`Expected exactly 2 fields for assetclass, received: ${len}`);
    }

    const csBytes = fields.get(0).as_bytes();
    if (!csBytes) throw new Error('Expected bytes type for currency symbol field.');
    const tknBytes = fields.get(1).as_bytes();
    if (!tknBytes) throw new Error('Expected bytes type for token name field.');

    mfs.dispose();
    return AssetClassBuilder.new().currencySymbol(toHex(csBytes)).assetId(toHex(tknBytes)).build();
  }
}

export class AssetClassBuilder implements Builder<IAssetClass> {
  private _cs!: Uint8Array;
  private _tkn!: Uint8Array;

  static new = () => new AssetClassBuilder();
  static ada = () => AssetClassBuilder.new().currencySymbol(ADA_CURRENCY_SYMBOL).assetId(ADA_TOKEN_NAME).build();

  currencySymbol(csHex: string): AssetClassBuilder {
    const cs = fromHex(csHex);
    if (!hasValidCurrencySymbolLength(csHex))
      throw new Error(`Expected ${CURRENCY_SYMBOL_HASH_BYTE_BUFFER_LENGTH} bytes, received: ${cs.length}`);
    this._cs = cs;
    return this;
  }

  assetId(tknHex: string): AssetClassBuilder {
    this._tkn = fromHex(tknHex);
    return this;
  }

  build(): IAssetClass {
    if (!hasValidCurrencySymbolLength(toHex(this._cs))) throw new Error('"currencySymbol" field has invalid value.');

    return {
      currencySymbol: toHex(this._cs),
      assetId: toHex(this._tkn),

      encode(): PlutusDataBytes {
        const mfs = new ManagedFreeableScope();
        const fields = PlutusList.new();
        mfs.manage(fields);
        fields.add(PlutusData.new_bytes(fromHex(this.currencySymbol)));
        fields.add(PlutusData.new_bytes(fromHex(this.assetId)));
        const result = toHex(PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), fields)).to_bytes());
        mfs.dispose();
        return result;
      },
    };
  }
}
