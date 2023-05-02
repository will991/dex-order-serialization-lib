import {
  BigNum,
  BigInt as CSLBigInt,
  ConstrPlutusData,
  PlutusData,
  PlutusList,
} from '@emurgo/cardano-serialization-lib-browser';
import { CURRENCY_SYMBOL_HASH_BYTE_BUFFER_LENGTH } from '../../constant';
import {
  AddressDecoder,
  Builder,
  Decodable,
  EncodableAddressBuilder,
  IAddress,
  Network,
  fromHex,
  toHex,
} from '../../utils';
import { IMuesliswapOrderDatum } from './types';

export class MuesliswapOrderDatumDecoder implements Decodable<IMuesliswapOrderDatum> {
  readonly network: Network;

  constructor(network: Network) {
    this.network = network;
  }

  static new = (network: Network) => new MuesliswapOrderDatumDecoder(network);

  decode(cborHex: string): IMuesliswapOrderDatum {
    const pd = PlutusData.from_bytes(fromHex(cborHex));
    const cpd = pd.as_constr_plutus_data();
    if (!cpd) throw new Error('Invalid constructor plutus data for muesliswap order datum');
    const fields = cpd.data();
    if (fields.len() !== 1) throw new Error(`Expected exactly 1 fields for order datum, received: ${fields.len()}`);
    const nestedConst = fields.get(0).as_constr_plutus_data();
    if (!nestedConst) throw new Error('Invalid constructor plutus data for muesliswap order datum');
    const nestedFields = nestedConst.data();
    if (nestedFields.len() !== 8)
      throw new Error(`Expected exactly 8 fields for order datum, received: ${fields.len()}`);

    const sender = new AddressDecoder(this.network).decode(nestedFields.get(0).to_hex());
    const buyCurrencySymbol = nestedFields.get(1).as_bytes();
    if (!buyCurrencySymbol) throw new Error('Expected buyCurrencySymbol field.');
    const buyAssetName = nestedFields.get(2).as_bytes();
    if (!buyAssetName) throw new Error('Expected buyAssetName field.');
    const sellCurrencySymbol = nestedFields.get(3).as_bytes();
    if (!sellCurrencySymbol) throw new Error('Expected sellCurrencySymbol field.');
    const sellAssetName = nestedFields.get(4).as_bytes();
    if (!sellAssetName) throw new Error('Expected sellAssetName field.');
    const buyAmount = nestedFields.get(5).as_integer();
    if (!buyAmount) throw new Error('Expected buyAmount integer field.');
    const allowPartial = nestedFields.get(6).as_constr_plutus_data()?.alternative();
    if (!allowPartial) throw new Error('Expected allowPartial plutus constructor.');
    const fee = nestedFields.get(7).as_integer();
    if (!fee) throw new Error('Expected fe integer field.');

    return MuesliswapOrderDatumBuilder.new(this.network)
      .creator(sender.to_bech32())
      .buyCurrencySymbol(toHex(buyCurrencySymbol))
      .buyAssetName(toHex(buyAssetName))
      .buyAmount(BigInt(buyAmount.to_str()))
      .sellCurrencySymbol(toHex(sellCurrencySymbol))
      .sellAssetName(toHex(sellAssetName))
      .allowPartial(allowPartial.is_zero() === false)
      .fee(BigInt(fee.to_str()))
      .build();
  }
}

export class MuesliswapOrderDatumBuilder implements Builder<IMuesliswapOrderDatum> {
  private _creator!: IAddress;
  private _buyCurrencySymbol!: string;
  private _buyAssetName!: string;
  private _sellCurrencySymbol!: string;
  private _sellAssetName!: string;
  private _buyAmount!: BigInt;
  private _allowPartial: boolean = true;
  private _fee!: BigInt;
  readonly network: Network;

  constructor(network: Network) {
    this.network = network;
  }

  static new = (network: Network = 'Mainnet') => new MuesliswapOrderDatumBuilder(network);

  creator(addressBech32: string): MuesliswapOrderDatumBuilder {
    this._creator = EncodableAddressBuilder.new().bech32Address(addressBech32).build();
    return this;
  }

  buyCurrencySymbol(currencySymbol: string): MuesliswapOrderDatumBuilder {
    this._buyCurrencySymbol = currencySymbol;
    return this;
  }

  buyAssetName(assetName: string): MuesliswapOrderDatumBuilder {
    this._buyAssetName = assetName;
    return this;
  }

  buyAmount(amount: BigInt): MuesliswapOrderDatumBuilder {
    this._buyAmount = amount;
    return this;
  }

  sellCurrencySymbol(currencySymbol: string): MuesliswapOrderDatumBuilder {
    this._sellCurrencySymbol = currencySymbol;
    return this;
  }

  sellAssetName(assetName: string): MuesliswapOrderDatumBuilder {
    this._sellAssetName = assetName;
    return this;
  }

  allowPartial(allow: boolean): MuesliswapOrderDatumBuilder {
    this._allowPartial = allow;
    return this;
  }

  fee(feeAmount: BigInt): MuesliswapOrderDatumBuilder {
    this._fee = feeAmount;
    return this;
  }

  build(): IMuesliswapOrderDatum {
    if (!this._creator) throw new Error('"creator" field is missing a value.');
    if (
      this._buyCurrencySymbol.length !== CURRENCY_SYMBOL_HASH_BYTE_BUFFER_LENGTH &&
      this._sellCurrencySymbol.length !== 0
    )
      throw new Error('"buyCurrencySymbol" field is invalid.');
    if (this._buyAssetName === undefined) throw new Error('"buyAssetName" field is missing a value.');
    if (!this._buyAmount) throw new Error('"buyAmount" field is missing a value.');
    if (
      this._sellCurrencySymbol.length !== CURRENCY_SYMBOL_HASH_BYTE_BUFFER_LENGTH &&
      this._sellCurrencySymbol.length !== 0
    )
      throw new Error('"sellCurrencySymbol" field is invalid.');
    if (this._sellAssetName === undefined) throw new Error('"sellAssetName" field is missing a value.');
    if (!this._allowPartial) throw new Error('"allowPartial" field is missing a value.');
    if (!this._fee) throw new Error('"fee" field is missing a value.');

    return {
      creator: this._creator,
      buyCurrencySymbol: this._buyCurrencySymbol,
      buyAssetName: this._buyAssetName,
      buyAmount: this._buyAmount,
      sellCurrencySymbol: this._sellCurrencySymbol,
      sellAssetName: this._sellAssetName,
      allowPartial: this._allowPartial,
      fee: this._fee,

      encode(): PlutusData {
        const fields = PlutusList.new();
        fields.add(this.creator.encode());
        fields.add(PlutusData.new_bytes(fromHex(this.buyCurrencySymbol)));
        fields.add(PlutusData.new_bytes(fromHex(this.buyAssetName)));
        fields.add(PlutusData.new_bytes(fromHex(this.sellCurrencySymbol)));
        fields.add(PlutusData.new_bytes(fromHex(this.sellAssetName)));
        fields.add(PlutusData.new_integer(CSLBigInt.from_str(this.buyAmount.toString())));
        if (this.allowPartial) {
          fields.add(PlutusData.new_empty_constr_plutus_data(BigNum.one()));
        } else {
          fields.add(PlutusData.new_empty_constr_plutus_data(BigNum.zero()));
        }
        fields.add(PlutusData.new_integer(CSLBigInt.from_str(this.fee.toString())));

        const nestedFields = PlutusList.new();
        nestedFields.add(PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), fields)));
        return PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), nestedFields));
      },
    };
  }
}
