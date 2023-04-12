import {
  BigNum,
  BigInt as CSLBigInt,
  ConstrPlutusData,
  PlutusData,
  PlutusList,
} from '@emurgo/cardano-serialization-lib-nodejs';
import { Builder, Decodable, Network, fromHex, toHex } from '../../utils';
import { AddressDecoder, Bech32Address, EncodableAddressBuilder } from '../../utils/encodable-address';
import { ManagedFreeableScope } from '../../utils/freeable';
import { toPlutusData } from '../../utils/plutusdata';
import { MINSWAP_BATCHER_FEE_LOVELACE } from '../constant';
import { MinswapOrderStepDecoder } from './order-step';
import { IMinswapOrderDatum, IMinswapOrderStep } from './types';

export class MinswapOrderDatumDecoder implements Decodable<IMinswapOrderDatum> {
  readonly network: Network;

  constructor(network: Network) {
    this.network = network;
  }

  static new = (network: Network) => new MinswapOrderDatumDecoder(network);

  decode(cborHex: string): IMinswapOrderDatum {
    const mfs = new ManagedFreeableScope();
    const fields = mfs.manage(
      mfs.manage(mfs.manage(PlutusData.from_bytes(fromHex(cborHex))).as_constr_plutus_data())?.data(),
    );
    if (!fields || fields.len() !== 6) {
      const len = fields?.len() ?? 0;
      mfs.dispose();
      throw new Error(`Expected exactly 6 fields for order datum, received: ${len}`);
    }
    const sender = new AddressDecoder(this.network).decode(mfs.manage(fields.get(0)).to_hex());
    const receiver = new AddressDecoder(this.network).decode(mfs.manage(fields.get(1)).to_hex());

    const receiverDatumHashCpd = mfs.manage(mfs.manage(fields.get(2)).as_constr_plutus_data());
    if (!receiverDatumHashCpd) {
      mfs.dispose();
      throw new Error('Expected constructor plutus data for receiver datum hash');
    }

    let receiverDatumHash: string | undefined;
    switch (mfs.manage(receiverDatumHashCpd.alternative()).to_str()) {
      case '0':
        const datumBytes = mfs.manage(mfs.manage(receiverDatumHashCpd.data()).get(0)).as_bytes();
        if (!datumBytes) {
          mfs.dispose();
          throw new Error('No byte buffer found for receiver datum hash');
        }
        receiverDatumHash = toHex(datumBytes);
      case '1':
        break;
      default:
        mfs.dispose();
        throw new Error('Unhandled alternative for receiver datum hash constructor');
    }

    const orderStep = new MinswapOrderStepDecoder().decode(fields.get(3).to_hex());
    const batcherFee = mfs.manage(mfs.manage(fields.get(4)).as_integer());
    if (!batcherFee) {
      mfs.dispose();
      throw new Error('Expected integer for batcher fee.');
    }
    const outputAda = mfs.manage(mfs.manage(fields.get(5)).as_integer());
    if (!outputAda) {
      mfs.dispose();
      throw new Error('Expected integer for batcher output ADA.');
    }

    return MinswapOrderDatumBuilder.new()
      .sender(sender)
      .receiver(receiver)
      .receiverDatumHash(receiverDatumHash)
      .orderStep(orderStep)
      .batcherFee(BigInt(batcherFee.to_str()))
      .outputAda(BigInt(outputAda.to_str()))
      .build();
  }
}

export class MinswapOrderDatumBuilder implements Builder<IMinswapOrderDatum> {
  private _sender!: string;
  private _receiver!: string;
  private _orderStep!: IMinswapOrderStep;
  private _batcherFee!: BigInt;
  private _outputAda: BigInt = MINSWAP_BATCHER_FEE_LOVELACE;
  private _receiverDatumHash?: string;

  static new = () => new MinswapOrderDatumBuilder();

  sender(bech32Address: Bech32Address): MinswapOrderDatumBuilder {
    this._sender = bech32Address;
    return this;
  }

  receiver(bech32Address: Bech32Address): MinswapOrderDatumBuilder {
    this._receiver = bech32Address;
    return this;
  }

  receiverDatumHash(datumHashHex: string | undefined): MinswapOrderDatumBuilder {
    this._receiverDatumHash = datumHashHex;
    return this;
  }

  orderStep(step: IMinswapOrderStep): MinswapOrderDatumBuilder {
    this._orderStep = step;
    return this;
  }

  batcherFee(fee: BigInt): MinswapOrderDatumBuilder {
    this._batcherFee = fee;
    return this;
  }

  outputAda(lovelace: BigInt): MinswapOrderDatumBuilder {
    this._outputAda = lovelace;
    return this;
  }

  build(): IMinswapOrderDatum {
    if (!this._sender) throw new Error('"sender" field is missing a value.');
    if (!this._receiver) throw new Error('"receiver" field is missing a value.');
    if (!this._orderStep) throw new Error('"orderStep" field is missing a value.');
    if (!this._batcherFee) throw new Error('"batcherFee" field is missing a value.');
    if (!this._outputAda) throw new Error('"outputAda" field is missing a value.');
    return {
      sender: this._sender,
      receiver: this._receiver,
      receiverDatumHash: this._receiverDatumHash,
      orderStep: this._orderStep,
      batcherFee: this._batcherFee,
      outputAda: this._outputAda,

      encode: () => {
        const mfs = new ManagedFreeableScope();
        const fields = PlutusList.new();
        mfs.manage(fields);

        fields.add(
          mfs.manage(toPlutusData(EncodableAddressBuilder.new().bech32Address(this._sender).build().encode())),
        );
        fields.add(
          mfs.manage(toPlutusData(EncodableAddressBuilder.new().bech32Address(this._receiver).build().encode())),
        );
        if (this._receiverDatumHash) fields.add(mfs.manage(PlutusData.from_hex(this._receiverDatumHash)));
        else
          fields.add(
            mfs.manage(
              PlutusData.new_constr_plutus_data(
                mfs.manage(ConstrPlutusData.new(mfs.manage(BigNum.one()), mfs.manage(PlutusList.new()))),
              ),
            ),
          );
        fields.add(mfs.manage(toPlutusData(this._orderStep.encode())));
        fields.add(mfs.manage(PlutusData.new_integer(mfs.manage(CSLBigInt.from_str(this._batcherFee.toString())))));
        fields.add(mfs.manage(PlutusData.new_integer(mfs.manage(CSLBigInt.from_str(this._outputAda.toString())))));

        const result = toHex(
          mfs
            .manage(
              PlutusData.new_constr_plutus_data(mfs.manage(ConstrPlutusData.new(mfs.manage(BigNum.zero()), fields))),
            )
            .to_bytes(),
        );
        mfs.dispose();
        return result;
      },
    };
  }
}
