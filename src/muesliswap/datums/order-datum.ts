import {
  BigNum,
  BigInt as CSLBigInt,
  ConstrPlutusData,
  PlutusData,
  PlutusList,
} from '@dcspark/cardano-multiplatform-lib-nodejs';
import {
  AddressDecoder,
  Builder,
  Decodable,
  EncodableAddressBuilder,
  IAddress,
  Network,
  PlutusDataBytes,
  fromHex,
  toHex,
} from '../../utils';
import { hasValidCurrencySymbolLength } from '../../utils/currencysymbol';
import { ManagedFreeableScope } from '../../utils/freeable';
import { toPlutusData } from '../../utils/plutusdata';
import { IMuesliswapOrderDatum } from './types';

export class MuesliswapOrderDatumDecoder implements Decodable<IMuesliswapOrderDatum> {
  readonly network: Network;

  constructor(network: Network) {
    this.network = network;
  }

  static new = (network: Network) => new MuesliswapOrderDatumDecoder(network);

  decode(cborHex: string): IMuesliswapOrderDatum {
    const mfs = new ManagedFreeableScope();

    const fields = mfs.manage(
      mfs.manage(mfs.manage(PlutusData.from_bytes(fromHex(cborHex))).as_constr_plutus_data())?.data(),
    );

    if (!fields || fields.len() !== 1) {
      const len = fields?.len() ?? 0;
      mfs.dispose();
      throw new Error(`Expected exactly 1 fields for order datum, received: ${len}`);
    }
    const nestedFields = mfs.manage(mfs.manage(mfs.manage(fields.get(0)).as_constr_plutus_data())?.data());
    if (!nestedFields || nestedFields.len() !== 8) {
      const len = fields.len() ?? 0;
      mfs.dispose();
      throw new Error(`Expected exactly 8 fields for order datum, received: ${len}`);
    }

    const sender = new AddressDecoder(this.network).decode(toHex(mfs.manage(nestedFields.get(0)).to_bytes()));
    const buyCurrencySymbol = mfs.manage(nestedFields.get(1)).as_bytes();
    if (!buyCurrencySymbol) {
      mfs.dispose();
      throw new Error('Expected buyCurrencySymbol field.');
    }

    const buyAssetName = mfs.manage(nestedFields.get(2)).as_bytes();
    if (!buyAssetName) {
      mfs.dispose();
      throw new Error('Expected buyAssetName field.');
    }
    const sellCurrencySymbol = mfs.manage(nestedFields.get(3)).as_bytes();
    if (!sellCurrencySymbol) {
      mfs.dispose();
      throw new Error('Expected sellCurrencySymbol field.');
    }
    const sellAssetName = mfs.manage(nestedFields.get(4)).as_bytes();
    if (!sellAssetName) {
      mfs.dispose();
      throw new Error('Expected sellAssetName field.');
    }
    const buyAmount = mfs.manage(mfs.manage(nestedFields.get(5)).as_integer())?.to_str();
    if (!buyAmount) {
      mfs.dispose();
      throw new Error('Expected buyAmount integer field.');
    }
    const allowPartialCpd = mfs.manage(mfs.manage(nestedFields.get(6)).as_constr_plutus_data());
    if (!allowPartialCpd) {
      mfs.dispose();
      throw new Error('Expected plutus constr');
    }
    const allowPartial = mfs.manage(allowPartialCpd.alternative()).to_str();
    if (!allowPartial) {
      mfs.dispose();
      throw new Error('Expected allowPartial plutus constructor.');
    }
    const fee = mfs.manage(mfs.manage(nestedFields.get(7)).as_integer())?.to_str();
    if (!fee) {
      mfs.dispose();
      throw new Error('Expected fe integer field.');
    }

    mfs.dispose();
    return MuesliswapOrderDatumBuilder.new(this.network)
      .creator(sender)
      .buyCurrencySymbol(toHex(buyCurrencySymbol))
      .buyAssetName(toHex(buyAssetName))
      .buyAmount(BigInt(buyAmount))
      .sellCurrencySymbol(toHex(sellCurrencySymbol))
      .sellAssetName(toHex(sellAssetName))
      .allowPartial(allowPartial === '1')
      .fee(BigInt(fee))
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
    if (!hasValidCurrencySymbolLength(this._buyCurrencySymbol))
      throw new Error('"buyCurrencySymbol" field is invalid.');
    if (this._buyAssetName === undefined) throw new Error('"buyAssetName" field is missing a value.');
    if (!this._buyAmount) throw new Error('"buyAmount" field is missing a value.');
    if (!hasValidCurrencySymbolLength(this._sellCurrencySymbol))
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

      encode(): PlutusDataBytes {
        const mfs = new ManagedFreeableScope();
        const fields = mfs.manage(PlutusList.new());

        fields.add(mfs.manage(toPlutusData(this.creator.encode())));
        fields.add(mfs.manage(PlutusData.new_bytes(fromHex(this.buyCurrencySymbol))));
        fields.add(mfs.manage(PlutusData.new_bytes(fromHex(this.buyAssetName))));
        fields.add(mfs.manage(PlutusData.new_bytes(fromHex(this.sellCurrencySymbol))));
        fields.add(mfs.manage(PlutusData.new_bytes(fromHex(this.sellAssetName))));
        fields.add(mfs.manage(PlutusData.new_integer(mfs.manage(CSLBigInt.from_str(this.buyAmount.toString())))));

        if (this.allowPartial) {
          fields.add(
            mfs.manage(
              PlutusData.new_constr_plutus_data(
                mfs.manage(ConstrPlutusData.new(mfs.manage(BigNum.from_str('1')), mfs.manage(PlutusList.new()))),
              ),
            ),
          );
        } else {
          fields.add(
            mfs.manage(
              PlutusData.new_constr_plutus_data(
                mfs.manage(ConstrPlutusData.new(mfs.manage(BigNum.zero()), mfs.manage(PlutusList.new()))),
              ),
            ),
          );
        }
        fields.add(mfs.manage(PlutusData.new_integer(mfs.manage(CSLBigInt.from_str(this.fee.toString())))));

        const nestedFields = mfs.manage(PlutusList.new());
        nestedFields.add(
          mfs.manage(
            PlutusData.new_constr_plutus_data(mfs.manage(ConstrPlutusData.new(mfs.manage(BigNum.zero()), fields))),
          ),
        );

        const result = toHex(
          mfs
            .manage(
              PlutusData.new_constr_plutus_data(
                mfs.manage(ConstrPlutusData.new(mfs.manage(BigNum.zero()), nestedFields)),
              ),
            )
            .to_bytes(),
        );
        mfs.dispose();
        return result;
      },
    };
  }
}
