import { Address } from '@emurgo/cardano-serialization-lib-nodejs';
import { EncodableAddressBuilder as AddressBuilder, AddressDecoder } from '../../utils/encodable-address';

describe('address module', () => {
  test('encode & decode testnet address with payment credential', () => {
    const expected = 'addr_test1vz3ppzmmzuz0nlsjeyrqjm4pvdxl3cyfe8x06eg6htj2gwgv02qjt';
    const addr_pd_datum = AddressBuilder.new().bech32Address(expected).build().encode();
    const address = new AddressDecoder('Testnet').decode(addr_pd_datum);
    expect(address).toBe(expected);
  });

  test('encode & decode testnet address with payment & staking credential', () => {
    const expected =
      'addr_test1qrqcwuw9ju33z2l0zayt38wsthsldyrgyt82p2p3trccucffejwnp8afwa8v58aw7dpj7hpf9dh8txr0qlksqtcsxheqhekxra';
    const addr_pd_datum = AddressBuilder.new().bech32Address(expected).build().encode();
    const address = new AddressDecoder('Testnet').decode(addr_pd_datum);
    expect(address).toBe(expected);
  });

  test('encode & decode mainnet address with payment credential', () => {
    const expected = 'addr1vx3ppzmmzuz0nlsjeyrqjm4pvdxl3cyfe8x06eg6htj2gwgh87uaw';
    const addr_pd_datum = AddressBuilder.new().bech32Address(expected).build().encode();
    const address = new AddressDecoder('Mainnet').decode(addr_pd_datum);
    expect(address).toBe(expected);
  });

  test('encode & decode mainnet address with payment & staking credential', () => {
    const expected =
      'addr1q8qcwuw9ju33z2l0zayt38wsthsldyrgyt82p2p3trccucffejwnp8afwa8v58aw7dpj7hpf9dh8txr0qlksqtcsxheq50tx0z';
    const addr_pd_datum = AddressBuilder.new().bech32Address(expected).build().encode();
    const address = new AddressDecoder('Mainnet').decode(addr_pd_datum);
    expect(address).toBe(expected);
  });

  test('test builder by creating mainnet address with payment & staking credential', () => {
    const expected =
      'addr1q8qcwuw9ju33z2l0zayt38wsthsldyrgyt82p2p3trccucffejwnp8afwa8v58aw7dpj7hpf9dh8txr0qlksqtcsxheq50tx0z';
    const actual = AddressBuilder.new().address(Address.from_bech32(expected)).build().bech32;
    expect(actual).toBe(expected);
  });

  test('test mainnet address encoding & decoding', () => {
    const expectedAddr =
      'addr1q8qcwuw9ju33z2l0zayt38wsthsldyrgyt82p2p3trccucffejwnp8afwa8v58aw7dpj7hpf9dh8txr0qlksqtcsxheq50tx0z';
    const expectedEncoded =
      'd8799fd8799f581cc18771c59723112bef1748b89dd05de1f6906822cea0a83158f18e61ffd8799fd8799fd8799f581c29cc9d309fa9774eca1faef3432f5c292b6e75986f07ed002f1035f2ffffffff';
    const actual = AddressDecoder.new('Mainnet').decode(expectedEncoded);
    expect(actual).toBe(expectedAddr);

    const actualEncoded = AddressBuilder.new().address(Address.from_bech32(expectedAddr)).build().encode();
    expect(actualEncoded).toBe(expectedEncoded);
  });

  test('test builder by creating testet address with payment & staking credential', () => {
    const expected =
      'addr_test1qrqcwuw9ju33z2l0zayt38wsthsldyrgyt82p2p3trccucffejwnp8afwa8v58aw7dpj7hpf9dh8txr0qlksqtcsxheqhekxra';
    const actual = AddressBuilder.new().address(Address.from_bech32(expected)).build().bech32;
    expect(actual).toBe(expected);
  });
});
