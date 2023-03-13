const ADA_TO_LOVELACE = BigInt('1000000');
export const adaToLovelace = (ada: bigint | string | number) => {
  const cast = (value: string) => BigInt(parseFloat(parseFloat(value).toFixed(6)) * Number(ADA_TO_LOVELACE));
  if (typeof ada === 'bigint') {
    return ada * ADA_TO_LOVELACE;
  } else if (typeof ada === 'number') {
    return cast(`${ada}`);
  }
  try {
    return BigInt(ada) * ADA_TO_LOVELACE;
  } catch {
    try {
      return cast(ada);
    } catch (e) {
      console.error(e);
      return BigInt(0);
    }
  }
};

export const lovelaceToAda = (lovelace: bigint | string) => {
  return Number(lovelace) / Number(ADA_TO_LOVELACE);
};
