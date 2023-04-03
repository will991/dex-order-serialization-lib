import {
  Address,
  BigInt as CSLBigInt,
  BigNum,
  ConstrPlutusData,
  PlutusData,
  PlutusList,
} from '@emurgo/cardano-serialization-lib-nodejs';
import { Builder, Decodable, fromHex, Network, toHex } from '../../utils';
import { AddressDecoder, EncodableAddressBuilder } from '../../utils/encodable-address';
import { MinswapOrderStepDecoder } from './order-step';
import { IMinswapOrderDatum, IMinswapOrderStep } from './types';

export class MinswapOrderDatumDecoder implements Decodable<IMinswapOrderDatum> {
  readonly network: Network;

  constructor(network: Network) {
    this.network = network;
  }

  static new = (network: Network) => new MinswapOrderDatumDecoder(network);

  decode(cborHex: string): IMinswapOrderDatum {
    const pd = PlutusData.from_bytes(fromHex(cborHex));
    const cpd = pd.as_constr_plutus_data();
    if (!cpd) throw new Error('Invalid constructor plutus data for order datum');
    const fields = cpd.data();
    if (fields.len() !== 6) throw new Error(`Expected exactly 6 fields for order datum, received: ${fields.len()}`);
    const sender = new AddressDecoder(this.network).decode(fields.get(0).to_hex());
    const receiver = new AddressDecoder(this.network).decode(fields.get(1).to_hex());

    const receiverDatumHashCpd = fields.get(2).as_constr_plutus_data();
    if (!receiverDatumHashCpd) throw new Error('Expected constructor plutus data for receiver datum hash');

    let receiverDatumHash: string | undefined;
    switch (receiverDatumHashCpd.alternative().to_str()) {
      case '0':
        const datumBytes = receiverDatumHashCpd.data().get(0).as_bytes();
        if (!datumBytes) throw new Error('No byte buffer found for receiver datum hash');
        receiverDatumHash = toHex(datumBytes);
      case '1':
        break;
      default:
        throw new Error('Unhandled alternative for receiver datum hash constructor');
    }

    const orderStep = new MinswapOrderStepDecoder().decode(fields.get(3).to_hex());
    const batcherFee = fields.get(4).as_integer();
    if (!batcherFee) throw new Error('Expected integer for batcher fee.');
    const outputAda = fields.get(5).as_integer();
    if (!outputAda) throw new Error('Expected integer for batcher output ADA.');

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
  private _outputAda!: BigInt;
  private _receiverDatumHash?: string;

  static new = () => new MinswapOrderDatumBuilder();

  sender(address: Address): MinswapOrderDatumBuilder {
    this._sender = address.to_bech32();
    return this;
  }

  receiver(address: Address): MinswapOrderDatumBuilder {
    this._receiver = address.to_bech32();
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
        const senderAddress = Address.from_bech32(this._sender);
        const receiverAddress = Address.from_bech32(this._receiver);

        const fields = PlutusList.new();
        fields.add(EncodableAddressBuilder.new().address(senderAddress).build().encode());
        fields.add(EncodableAddressBuilder.new().address(receiverAddress).build().encode());
        if (this._receiverDatumHash) fields.add(PlutusData.from_hex(this._receiverDatumHash));
        else fields.add(PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.one(), PlutusList.new())));
        fields.add(this._orderStep.encode());
        fields.add(PlutusData.new_integer(CSLBigInt.from_str(this._batcherFee.toString())));
        fields.add(PlutusData.new_integer(CSLBigInt.from_str(this._outputAda.toString())));
        return PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), fields));
      },
    };
  }
}
