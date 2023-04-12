import {
  BigNum,
  BigInt as CSLBigInt,
  ConstrPlutusData,
  PlutusData,
  PlutusList,
} from '@emurgo/cardano-serialization-lib-nodejs';
import {
  AssetClassDecoder,
  Builder,
  Decodable,
  IAssetClass,
  ManagedFreeableScope,
  Network,
  fromHex,
  toHex,
  toPlutusData,
} from '../../utils';
import { AddressDecoder, EncodableAddressBuilder, IAddress } from '../../utils/encodable-address';
import { IWingridersOrderDatum, IWingridersStakeCredential, IWingridersSwapDirection } from './types';

export class WingridersOrderDatumDecoder implements Decodable<IWingridersOrderDatum> {
  readonly network: Network;

  constructor(network: Network) {
    this.network = network;
  }

  static new = (network: Network) => new WingridersOrderDatumDecoder(network);

  decode(cborHex: string): IWingridersOrderDatum {
    const mfs = new ManagedFreeableScope();
    const fields = mfs.manage(
      mfs.manage(mfs.manage(PlutusData.from_bytes(fromHex(cborHex))).as_constr_plutus_data())?.data(),
    );
    if (!fields) {
      mfs.dispose();
      throw new Error('Invalid constructor plutus data for order datum');
    }

    const metadataFields = mfs.manage(mfs.manage(mfs.manage(fields.get(0)).as_constr_plutus_data())?.data());
    if (!metadataFields || metadataFields?.len() !== 4) {
      const len = metadataFields?.len() ?? 0;
      mfs.dispose();
      throw new Error(`Expected exactly 4 fields for order datum, received: ${len}`);
    }

    const swapFields = mfs.manage(mfs.manage(mfs.manage(fields.get(1)).as_constr_plutus_data())?.data());
    if (!swapFields) {
      mfs.dispose();
      throw new Error('Expected second field to be swap data');
    }

    const beneficiary = new AddressDecoder(this.network).decode(
      mfs.manage(mfs.manage(metadataFields.get(0)).as_constr_plutus_data())!.to_hex(),
    );

    const owner = mfs.manage(metadataFields.get(1)).as_bytes();
    if (!owner) {
      mfs.dispose();
      throw new Error(`Expected byte array for owner field`);
    }

    const deadline = mfs.manage(mfs.manage(metadataFields.get(2)).as_integer())?.to_str();
    if (!deadline) {
      mfs.dispose();
      throw new Error(`Expected big integer for deadline field`);
    }

    const pair = mfs.manage(mfs.manage(metadataFields.get(3)).as_constr_plutus_data());
    if (!pair) {
      mfs.dispose();
      throw new Error('Expected plutus constr for token pair');
    }

    const assetA = new AssetClassDecoder().decode(mfs.manage(mfs.manage(pair.data()).get(0)).to_hex());
    const assetB = new AssetClassDecoder().decode(mfs.manage(mfs.manage(pair.data()).get(1)).to_hex());

    const directionAlternativeCpd = mfs.manage(mfs.manage(swapFields.get(0)).as_constr_plutus_data());
    if (!directionAlternativeCpd) {
      mfs.dispose();
      throw new Error('Expected plutus contr');
    }
    const directionAlternative = mfs.manage(directionAlternativeCpd.alternative()).to_str();
    const direction = directionAlternative === '0' ? IWingridersSwapDirection.ATOB : IWingridersSwapDirection.BTOA;

    const minAmount = mfs.manage(mfs.manage(swapFields.get(1)).as_integer())?.to_str();
    if (!minAmount) throw new Error('Expected big integer for amount field');

    return WingridersOrderDatumBuilder.new()
      .direction(direction)
      .beneficiary(beneficiary)
      .owner(toHex(owner))
      .deadline(BigInt(deadline))
      .assetA(assetA)
      .assetB(assetB)
      .minAmount(BigInt(minAmount))
      .build();
  }
}

export class WingridersOrderDatumBuilder implements Builder<IWingridersOrderDatum> {
  private _direction!: IWingridersSwapDirection;
  private _beneficiary!: IAddress;
  private _owner!: IWingridersStakeCredential;
  private _deadline!: BigInt;
  private _assetA!: IAssetClass;
  private _assetB!: IAssetClass;
  private _minAmount!: BigInt;

  static new = () => new WingridersOrderDatumBuilder();

  direction(direction: IWingridersSwapDirection): WingridersOrderDatumBuilder {
    this._direction = direction;
    return this;
  }

  beneficiary(bech32Address: string): WingridersOrderDatumBuilder {
    this._beneficiary = EncodableAddressBuilder.new().bech32Address(bech32Address).build();
    return this;
  }

  owner(owner: string): WingridersOrderDatumBuilder {
    this._owner = owner;
    return this;
  }

  deadline(deadline: bigint): WingridersOrderDatumBuilder {
    this._deadline = deadline;
    return this;
  }

  assetA(asset: IAssetClass): WingridersOrderDatumBuilder {
    this._assetA = asset;
    return this;
  }

  assetB(asset: IAssetClass): WingridersOrderDatumBuilder {
    this._assetB = asset;
    return this;
  }

  minAmount(minAmount: BigInt): WingridersOrderDatumBuilder {
    this._minAmount = minAmount;
    return this;
  }

  build(): IWingridersOrderDatum {
    if (this._direction === undefined) throw new Error('"direction" field is missing a value.');
    if (!this._beneficiary) throw new Error('"beneficiary" field is missing a value.');
    if (!this._owner) throw new Error('"owner" field is missing a value.');
    if (!this._deadline) throw new Error('"deadline" field is missing a value.');
    if (!this._assetA) throw new Error('"assetA" field is missing a value.');
    if (!this._assetB) throw new Error('"assetB" field is missing a value.');
    if (!this._minAmount) throw new Error('"minAmount" field is missing a value.');

    return {
      direction: this._direction,
      beneficiary: this._beneficiary,
      owner: this._owner,
      deadline: this._deadline,
      lpAssetA: this._assetA,
      lpAssetB: this._assetB,
      minAmount: this._minAmount,

      encode() {
        const mfs = new ManagedFreeableScope();
        const fields = PlutusList.new();
        mfs.manage(fields);

        fields.add(toPlutusData(this.beneficiary.encode()));
        fields.add(PlutusData.new_bytes(fromHex(this.owner)));
        fields.add(PlutusData.new_integer(CSLBigInt.from_str(this.deadline.toString())));

        const pair = PlutusList.new();
        pair.add(toPlutusData(this.lpAssetA.encode()));
        pair.add(toPlutusData(this.lpAssetB.encode()));
        fields.add(PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), pair)));

        const nestedFields = PlutusList.new();
        nestedFields.add(PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), fields)));
        mfs.manage(nestedFields);

        const swap = PlutusList.new();
        mfs.manage(swap);

        swap.add(
          PlutusData.new_empty_constr_plutus_data(
            BigNum.from_str(this.direction === IWingridersSwapDirection.ATOB ? '0' : '1'),
          ),
        );
        swap.add(PlutusData.new_integer(CSLBigInt.from_str(this.minAmount.toString())));

        nestedFields.add(PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), swap)));

        const result = toHex(
          PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), nestedFields)).to_bytes(),
        );
        mfs.dispose();
        return result;
      },
    };
  }
}
