import { PlutusData } from '@emurgo/cardano-serialization-lib-nodejs';
import { fromHex } from './base16';
import { PlutusDataBytes } from './types';

export const toPlutusData = (hexByteString: PlutusDataBytes) => PlutusData.from_bytes(fromHex(hexByteString));
