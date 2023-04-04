import {
  BigInt as CSLBigInt,
  BigNum,
  ConstrPlutusData,
  PlutusData,
  PlutusList,
} from '@emurgo/cardano-serialization-lib-nodejs';
import { AssetClassDecoder, Builder, Decodable, fromHex, IAssetClass, Network, toHex } from '../../utils';
import { AddressDecoder, EncodableAddressBuilder, IAddress } from '../../utils/encodable-address';
import { IWingridersOrderDatum, IWingridersStakeCredential, IWingridersSwapDirection } from './types';

export class WingridersOrderDatumDecoder implements Decodable<IWingridersOrderDatum> {
  readonly network: Network;

  constructor(network: Network) {
    this.network = network;
  }

  static new = (network: Network) => new WingridersOrderDatumDecoder(network);

  decode(cborHex: string): IWingridersOrderDatum {
    const pd = PlutusData.from_bytes(fromHex(cborHex));
    const cpd = pd.as_constr_plutus_data();
    if (cpd?.alternative().is_zero() !== true) throw new Error('Invalid constructor alternative');
    if (!cpd) throw new Error('Invalid constructor plutus data for order datum');
    const globalFields = cpd.data();

    const metadata = globalFields.get(0).as_constr_plutus_data();
    if (!metadata) throw new Error('Expected first field to be metadata data plutus constr');
    const metadataFields = metadata.data();

    const swapFields = globalFields.get(1).as_constr_plutus_data();
    if (!swapFields) throw new Error('Expected second field to be swap data');

    if (metadataFields.len() !== 4)
      throw new Error(`Expected exactly 4 fields for order datum, received: ${metadataFields.len()}`);
    const beneficiary = new AddressDecoder(this.network).decode(
      metadataFields.get(0).as_constr_plutus_data()!.to_hex(),
    );

    const owner = metadataFields.get(1).as_bytes();
    if (!owner) throw new Error(`Expected byte array for owner field`);

    const deadline = metadataFields.get(2).as_integer();
    if (!deadline) throw new Error(`Expected big integer for deadline field`);

    const pair = metadataFields.get(3).as_constr_plutus_data();
    if (!pair) throw new Error('Expected plutus constr for token pair');

    const assetA = new AssetClassDecoder().decode(pair.data().get(0).to_hex());
    const assetB = new AssetClassDecoder().decode(pair.data().get(1).to_hex());

    const directionAlternative = swapFields.data().get(0).as_constr_plutus_data()?.alternative();
    if (!directionAlternative) throw new Error('Invalid direction. Expected plutus constr');
    const direction = directionAlternative.is_zero() ? IWingridersSwapDirection.ATOB : IWingridersSwapDirection.BTOA;

    const minAmount = swapFields.data().get(1).as_integer();
    if (!minAmount) throw new Error('Expected big integer for amount field');

    return WingridersOrderDatumBuilder.new()
      .direction(direction)
      .beneficiary(beneficiary.to_bech32(this.network === 'Mainnet' ? undefined : 'addr_test'))
      .owner(toHex(owner))
      .deadline(BigInt(deadline.to_str()))
      .assetA(assetA)
      .assetB(assetB)
      .minAmount(BigInt(minAmount.to_str()))
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

      encode(): PlutusData {
        const fields = PlutusList.new();
        fields.add(this.beneficiary.encode());
        fields.add(PlutusData.new_bytes(fromHex(this.owner)));
        fields.add(PlutusData.new_integer(CSLBigInt.from_str(this.deadline.toString())));

        const pair = PlutusList.new();
        pair.add(this.lpAssetA.encode());
        pair.add(this.lpAssetB.encode());
        fields.add(PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), pair)));

        const nestedFields = PlutusList.new();
        nestedFields.add(PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), fields)));

        const swap = PlutusList.new();
        swap.add(
          PlutusData.new_empty_constr_plutus_data(
            BigNum.from_str(this.direction === IWingridersSwapDirection.ATOB ? '0' : '1'),
          ),
        );
        swap.add(PlutusData.new_integer(CSLBigInt.from_str(this.minAmount.toString())));

        nestedFields.add(PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), swap)));
        return PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), nestedFields));
      },
    };
  }
}
