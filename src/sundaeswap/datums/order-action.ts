import {
  BigNum,
  BigInt as CSLBigInt,
  ConstrPlutusData,
  PlutusData,
  PlutusList,
} from '@dcspark/cardano-multiplatform-lib-nodejs';
import { Builder, Decodable, Encodable, ManagedFreeableScope, fromHex, toHex } from '../../utils';
import { EncodableBigInt } from '../../utils/encodable-bigint';
import { ICoin, IDespositSingle, ISundaeswapOrderAction, ISundaeswapOrderWithdraw } from './types';

abstract class SundaeswapOrderActionBuilder<T extends Encodable> implements Builder<T> {
  protected _amount!: BigInt;

  abstract build(): T;
}

export class SundaeswapOrderActionDecoder implements Decodable<ISundaeswapOrderAction> {
  decode(cborHex: string): ISundaeswapOrderAction {
    const mfs = new ManagedFreeableScope();
    const pd = mfs.manage(PlutusData.from_bytes(fromHex(cborHex)));
    const cpd = mfs.manage(pd.as_constr_plutus_data());
    if (!cpd) {
      mfs.dispose();
      throw new Error('Invalid constructor plutus data for order action');
    }

    const alternative = mfs.manage(cpd.alternative()).to_str();
    switch (alternative) {
      case '0':
        const cbor = toHex(pd.to_bytes());
        mfs.dispose();
        return new OrderSwapDecoder().decode(cbor);
      case '1':
        const withdrawAmount = mfs.manage(mfs.manage(mfs.manage(cpd.data()).get(0)).as_integer())?.to_str();
        mfs.dispose();
        if (!withdrawAmount) {
          throw new Error('Expected withdraw amount as integer.');
        }
        return new EncodableBigInt(BigInt(withdrawAmount)) as ISundaeswapOrderWithdraw;
      case '2':
        throw new Error('Missing implementation');
      default:
        throw new Error(`Unknown constructor alternative for order action ${alternative}`);
    }
  }
}

export class OrderSwapDecoder implements Decodable<ISundaeswapOrderAction> {
  decode(cborHex: string): ISundaeswapOrderAction {
    const mfs = new ManagedFreeableScope();
    const pd = mfs.manage(PlutusData.from_bytes(fromHex(cborHex)));
    const cpd = mfs.manage(pd.as_constr_plutus_data());
    if (!cpd) {
      mfs.dispose();
      throw new Error('Invalid constructor plutus data for order swap');
    }
    const fields = mfs.manage(cpd.data());
    if (fields.len() !== 3) {
      mfs.dispose();
      throw new Error(`Expected exactly 3 fields for order swap datum, received: ${fields.len()}`);
    }

    const coinCpd = mfs.manage(mfs.manage(fields.get(0)).as_constr_plutus_data());
    if (!coinCpd) {
      mfs.dispose();
      throw new Error('Invalid coin type. Expected constructor for plutus data');
    }

    const tradeAInToB = mfs.manage(coinCpd.alternative()).to_str() === '0' ? true : false;
    const depositAmount = mfs.manage(mfs.manage(fields.get(1)).as_integer())?.to_str();
    if (!depositAmount) {
      mfs.dispose();
      throw new Error('Expected integer type for deposit amount.');
    }
    const minimumReceivedAmountCpd = mfs.manage(mfs.manage(fields.get(2)).as_constr_plutus_data());
    if (!minimumReceivedAmountCpd) {
      mfs.dispose();
      throw new Error('Expected constructor plutus data type for minimum received amount.');
    }

    const alternative = mfs.manage(minimumReceivedAmountCpd.alternative()).to_str();

    switch (alternative) {
      case '0':
        const minimumAmount = mfs
          .manage(mfs.manage(mfs.manage(minimumReceivedAmountCpd.data()).get(0)).as_integer())
          ?.to_str();
        mfs.dispose();
        if (!minimumAmount) throw new Error('Expected integer type for minimum received amount.');
        return SundaeswapOrderSwapBuilder.new()
          .coin(tradeAInToB)
          .depositAmount(BigInt(depositAmount))
          .minimumReceivedAmount(BigInt(minimumAmount))
          .build();
      case '1':
        mfs.dispose();
        return SundaeswapOrderSwapBuilder.new().coin(tradeAInToB).depositAmount(BigInt(depositAmount)).build();
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
        const mfs = new ManagedFreeableScope();
        const fields = mfs.manage(PlutusList.new());

        const coinAlternative = mfs.manage(this._coin ? BigNum.zero() : BigNum.from_str('1'));
        fields.add(
          mfs.manage(
            PlutusData.new_constr_plutus_data(
              mfs.manage(ConstrPlutusData.new(coinAlternative, mfs.manage(PlutusList.new()))),
            ),
          ),
        );
        fields.add(mfs.manage(PlutusData.new_integer(mfs.manage(CSLBigInt.from_str(this._amount.toString())))));

        if (this._minimumReceivedAmount) {
          const nestedFields = mfs.manage(PlutusList.new());
          nestedFields.add(
            mfs.manage(PlutusData.new_integer(mfs.manage(CSLBigInt.from_str(this._minimumReceivedAmount.toString())))),
          );
          fields.add(
            mfs.manage(
              PlutusData.new_constr_plutus_data(
                mfs.manage(ConstrPlutusData.new(mfs.manage(BigNum.zero()), nestedFields)),
              ),
            ),
          );
        } else {
          fields.add(
            mfs.manage(
              PlutusData.new_constr_plutus_data(
                mfs.manage(ConstrPlutusData.new(mfs.manage(BigNum.from_str('1')), mfs.manage(PlutusList.new()))),
              ),
            ),
          );
        }

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
        const mfs = new ManagedFreeableScope();
        const fields = mfs.manage(PlutusList.new());
        const coinAlternative = mfs.manage(this._coin ? BigNum.zero() : BigNum.from_str('1'));
        fields.add(
          mfs.manage(
            PlutusData.new_constr_plutus_data(
              mfs.manage(ConstrPlutusData.new(coinAlternative, mfs.manage(PlutusList.new()))),
            ),
          ),
        );
        fields.add(mfs.manage(PlutusData.new_integer(mfs.manage(CSLBigInt.from_str(this._amount.toString())))));

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
