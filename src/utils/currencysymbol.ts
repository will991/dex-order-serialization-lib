import { CURRENCY_SYMBOL_HASH_BYTE_BUFFER_LENGTH } from '../constant';

export const hasValidCurrencySymbolLength = (currencySymbol: string | Uint8Array) => {
  if (typeof currencySymbol === 'string')
    return currencySymbol.length / 2 === CURRENCY_SYMBOL_HASH_BYTE_BUFFER_LENGTH || currencySymbol.length === 0;
  return currencySymbol.length === CURRENCY_SYMBOL_HASH_BYTE_BUFFER_LENGTH || currencySymbol.length === 0;
};
