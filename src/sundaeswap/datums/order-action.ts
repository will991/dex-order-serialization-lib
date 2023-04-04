import {
  BigInt as CSLBigInt,
  BigNum,
  ConstrPlutusData,
  PlutusData,
  PlutusList,
} from '@emurgo/cardano-serialization-lib-nodejs';
import { Builder, Decodable, Encodable, fromHex } from '../../utils';
import { EncodableBigInt } from '../../utils/encodable-bigint';
import { ICoin, IDespositSingle, ISundaeswapOrderAction, ISundaeswapOrderWithdraw } from './types';

abstract class SundaeswapOrderActionBuilder<T extends Encodable> implements Builder<T> {
  protected _amount!: BigInt;

  abstract build(): T;
}

export class SundaeswapOrderActionDecoder implements Decodable<ISundaeswapOrderAction> {
  decode(cborHex: string): ISundaeswapOrderAction {
    const pd = PlutusData.from_bytes(fromHex(cborHex));
    const cpd = pd.as_constr_plutus_data();
    if (!cpd) throw new Error('Invalid constructor plutus data for order action');

    const alternative = cpd.alternative().to_str();
    switch (alternative) {
      case '0':
        return new OrderSwapDecoder().decode(pd.to_hex());
      case '1':
        const withdrawAmount = cpd.data().get(0).as_integer();
        if (!withdrawAmount) throw new Error('Expected withdraw amount as integer.');
        return new EncodableBigInt(BigInt(withdrawAmount.to_str())) as ISundaeswapOrderWithdraw;
      case '2':
        throw new Error('Missing implementation');
      default:
        throw new Error(`Unknown constructor alternative for order action ${alternative}`);
    }
  }
}

export class OrderSwapDecoder implements Decodable<ISundaeswapOrderAction> {
  decode(cborHex: string): ISundaeswapOrderAction {
    const pd = PlutusData.from_bytes(fromHex(cborHex));
    const cpd = pd.as_constr_plutus_data();
    if (!cpd) throw new Error('Invalid constructor plutus data for order swap');
    const fields = cpd.data();
    if (fields.len() !== 3)
      throw new Error(`Expected exactly 3 fields for order swap datum, received: ${fields.len()}`);

    const coinCpd = fields.get(0).as_constr_plutus_data();
    if (!coinCpd) throw new Error('Invalid coin type. Expected constructor for plutus data');

    const tradeAInToB = coinCpd.alternative().to_str() === '0' ? true : false;
    const depositAmount = fields.get(1).as_integer();
    if (!depositAmount) throw new Error('Expected integer type for deposit amount.');
    const minimumReceivedAmountCpd = fields.get(2).as_constr_plutus_data();
    if (!minimumReceivedAmountCpd)
      throw new Error('Expected constructor plutus data type for minimum received amount.');

    switch (minimumReceivedAmountCpd.alternative().to_str()) {
      case '0':
        const minimumAmount = minimumReceivedAmountCpd.data().get(0).as_integer();
        if (!minimumAmount) throw new Error('Expected integer type for minimum received amount.');
        return SundaeswapOrderSwapBuilder.new()
          .coin(tradeAInToB)
          .depositAmount(BigInt(depositAmount.to_str()))
          .minimumReceivedAmount(BigInt(minimumAmount.to_str()))
          .build();
      case '1':
        return SundaeswapOrderSwapBuilder.new().coin(tradeAInToB).depositAmount(BigInt(depositAmount.to_str())).build();
      default:
        throw new Error(
          `Unknown constructor alternative for order swap ${minimumReceivedAmountCpd.alternative().to_str()}`,
        );
    }
  }
}

export class SundaeswapOrderSwapBuilder extends SundaeswapOrderActionBuilder<ISundaeswapOrderAction> {
  private _coin!: ICoin;
  private _minimumReceivedAmount?: BigInt;

  static new = () => new SundaeswapOrderSwapBuilder();

  coin(tradeAInToB: boolean): SundaeswapOrderSwapBuilder {
    this._coin = tradeAInToB;
    return this;
  }

  depositAmount(amount: BigInt): SundaeswapOrderSwapBuilder {
    this._amount = amount;
    return this;
  }

  minimumReceivedAmount(amount: BigInt): SundaeswapOrderSwapBuilder {
    this._minimumReceivedAmount = amount;
    return this;
  }

  build(): ISundaeswapOrderAction {
    if (this._coin === undefined) throw new Error('"coin" field is missing a value.');
    if (!this._amount) throw new Error('"depositAmount" field is missing a value.');

    return {
      coin: this._coin,
      depositAmount: this._amount,
      minimumReceivedAmount: this._minimumReceivedAmount,

      encode: () => {
        const fields = PlutusList.new();
        const coinAlternative = this._coin ? BigNum.zero() : BigNum.one();
        fields.add(PlutusData.new_empty_constr_plutus_data(coinAlternative));
        fields.add(PlutusData.new_integer(CSLBigInt.from_str(this._amount.toString())));

        if (this._minimumReceivedAmount) {
          const nestedFields = PlutusList.new();
          const mrAmount = PlutusData.new_integer(CSLBigInt.from_str(this._minimumReceivedAmount.toString()));
          nestedFields.add(mrAmount);
          fields.add(PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), nestedFields)));
        } else {
          fields.add(PlutusData.new_empty_constr_plutus_data(BigNum.one()));
        }

        return PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), fields));
      },
    };
  }
}

export class SundaeswapOrderDepositSingleBuilder extends SundaeswapOrderActionBuilder<IDespositSingle> {
  private _coin!: ICoin;

  coin(tradeAIntoB: boolean): SundaeswapOrderDepositSingleBuilder {
    this._coin = tradeAIntoB;
    return this;
  }

  amount(amount: BigInt): SundaeswapOrderDepositSingleBuilder {
    this._amount = amount;
    return this;
  }

  build(): IDespositSingle {
    if (!this._coin) throw new Error('"coin" field is missing a value.');
    if (!this._amount) throw new Error('"amount" field is missing a value.');

    return {
      coin: this._coin,
      amount: this._amount,

      encode: () => {
        const fields = PlutusList.new();
        const coinAlternative = this._coin ? BigNum.zero() : BigNum.one();
        fields.add(PlutusData.new_empty_constr_plutus_data(coinAlternative));
        fields.add(PlutusData.new_integer(CSLBigInt.from_str(this._amount.toString())));

        return PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), fields));
      },
    };
  }
}
