import { AddressDecoder, EncodableAddressBuilder as AddressBuilder } from '../../utils/encodable-address';

describe('address module', () => {
  test('encode & decode testnet address with payment credential', () => {
    const expected = 'addr_test1vz3ppzmmzuz0nlsjeyrqjm4pvdxl3cyfe8x06eg6htj2gwgv02qjt';
    const addr_pd_datum = AddressBuilder.new().bech32Address(expected).build().encode().to_hex();
    const address = new AddressDecoder('Testnet').decode(addr_pd_datum);
    expect(address.to_bech32()).toBe(expected);
  });

  test('encode & decode testnet address with payment & staking credential', () => {
    const expected =
      'addr_test1qrqcwuw9ju33z2l0zayt38wsthsldyrgyt82p2p3trccucffejwnp8afwa8v58aw7dpj7hpf9dh8txr0qlksqtcsxheqhekxra';
    const addr_pd_datum = AddressBuilder.new().bech32Address(expected).build().encode().to_hex();
    const address = new AddressDecoder('Testnet').decode(addr_pd_datum);
    expect(address.to_bech32()).toBe(expected);
  });

  test('encode & decode mainnet address with payment credential', () => {
    const expected = 'addr1vx3ppzmmzuz0nlsjeyrqjm4pvdxl3cyfe8x06eg6htj2gwgh87uaw';
    const addr_pd_datum = AddressBuilder.new().bech32Address(expected).build().encode().to_hex();
    const address = new AddressDecoder('Mainnet').decode(addr_pd_datum);
    expect(address.to_bech32()).toBe(expected);
  });

  test('encode & decode mainnet address with payment & staking credential', () => {
    const expected =
      'addr1q8qcwuw9ju33z2l0zayt38wsthsldyrgyt82p2p3trccucffejwnp8afwa8v58aw7dpj7hpf9dh8txr0qlksqtcsxheq50tx0z';
    const addr_pd_datum = AddressBuilder.new().bech32Address(expected).build().encode().to_hex();
    const address = new AddressDecoder('Mainnet').decode(addr_pd_datum);
    expect(address.to_bech32()).toBe(expected);
  });
});
