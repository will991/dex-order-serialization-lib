## [1.0.2](https://github.com/will991/dex-order-serialization-lib/compare/v1.0.1...v1.0.2) (2023-05-15)


### Bug Fixes

* lock file ([6c61660](https://github.com/will991/dex-order-serialization-lib/commit/6c61660751909e07efa275d116ba34134e586112))
* lock files ([35fb935](https://github.com/will991/dex-order-serialization-lib/commit/35fb9354a612fc4e16618c35fcca0aa8ca50fc12))
* management of feeable CSL types ([ac0a11c](https://github.com/will991/dex-order-serialization-lib/commit/ac0a11c13fc120093254f96713fbed0a4356f4b3))
* merge main & substitue csl for cml ([9391863](https://github.com/will991/dex-order-serialization-lib/commit/939186312f5471d91eec98c930ef4b2a9397b65d))
* merged main ([3c85c83](https://github.com/will991/dex-order-serialization-lib/commit/3c85c83217d88411864da40621ac10ae3b0894bd))
* Refactored assetId to assetName ([e2bfe05](https://github.com/will991/dex-order-serialization-lib/commit/e2bfe054b44a26d78b8228c8621fcfe6a533f4c1))
* refactored naming of token name to assetId ([813e9e9](https://github.com/will991/dex-order-serialization-lib/commit/813e9e974ed9724eaa338354be062784772c303d))
* refactoring freeing up CSL instances ([695e01e](https://github.com/will991/dex-order-serialization-lib/commit/695e01e7228ad59765f59dcb64d9d8a44be0d29e))
* replace csl with cml including resolve merge conflicts ([d9656bd](https://github.com/will991/dex-order-serialization-lib/commit/d9656bd133a18995ae83b0dfaa13655733661ce9))

## [1.0.1](https://github.com/will991/dex-order-serialization-lib/compare/v1.0.0...v1.0.1) (2023-05-02)


### Bug Fixes

* format ([15421a6](https://github.com/will991/dex-order-serialization-lib/commit/15421a6d74b3a150fcd21a658918e32b6b3d44ea))
* remove lock file ([c7ce33f](https://github.com/will991/dex-order-serialization-lib/commit/c7ce33f760a63bbb3885881480a8692124bbb012))

# 1.0.0 (2023-04-27)


### Bug Fixes

* add check for valid currency symbol based on length ([8ed7d39](https://github.com/will991/dex-order-serialization-lib/commit/8ed7d396b4dcf3b49be0ad619b69a8c7a4514132))
* add minswap batcher constant ([4f0014f](https://github.com/will991/dex-order-serialization-lib/commit/4f0014fdedededf55146a9e4537ba9be6a0c5f9a))
* add test coverage ([2b50b15](https://github.com/will991/dex-order-serialization-lib/commit/2b50b1530b4d396e4647f371dd6ff86c49e8f5e9))
* address builder with correct bech32 network prefix ([7f36c49](https://github.com/will991/dex-order-serialization-lib/commit/7f36c49b128f904861ae612cae926998b901b0ca))
* exports of all types; added redeemer test ([388da20](https://github.com/will991/dex-order-serialization-lib/commit/388da2047616e94f8f7e0a9edd8b248bdfeff2e5))
* formatting ([0a6a856](https://github.com/will991/dex-order-serialization-lib/commit/0a6a856ab02906d726197ba5686b0a22f5254fad))
* imports for encodable address ([3ed45a1](https://github.com/will991/dex-order-serialization-lib/commit/3ed45a1140b86ffbe6bcd1586cd72853cdde2b9e))
* links in readme ([436c926](https://github.com/will991/dex-order-serialization-lib/commit/436c926bbd3d21e40b15fa1944471b7d4adb0cf3))
* links with lines to type file ([9e3049c](https://github.com/will991/dex-order-serialization-lib/commit/9e3049ca86b913990a7483d4009908e2ab695494))
* merge main - resolve conflicts ([f73cada](https://github.com/will991/dex-order-serialization-lib/commit/f73cada9d2e16c41d9d8b5eea81bcdbfe2733376))
* minswap naming collisions ([d4d72f3](https://github.com/will991/dex-order-serialization-lib/commit/d4d72f3910ce57aacf62ef31f24ed838a37a2789))
* naming collisions ([a037b95](https://github.com/will991/dex-order-serialization-lib/commit/a037b95909deaf79d7df9f30c2019ade674172f5))
* naming of types for avoiding naming collisions ([e13b522](https://github.com/will991/dex-order-serialization-lib/commit/e13b5221f72e48758e8bd42861d16e8e7fd4dbfb))
* naming sundaeswap ([4ecf9d3](https://github.com/will991/dex-order-serialization-lib/commit/4ecf9d39eeeb7cfc0b4c6b747079ecb6f9a7ad0c))
* refactor testing for naming collisions ([bbc8eee](https://github.com/will991/dex-order-serialization-lib/commit/bbc8eee3bc4fe60226654bafc4db6b46e81695c8))
* refactoring of order action to order swap ([fbf2ad1](https://github.com/will991/dex-order-serialization-lib/commit/fbf2ad136f5ea8da7cb4741ff2ad93fceae1effa))
* remove js - only ts is required ([f428c7d](https://github.com/will991/dex-order-serialization-lib/commit/f428c7d49e97fb8cf6c5953da660c6ccb71f58be))


### Features

* add minswap datum & redeemer decoder and encoder; builder ([dc58f6a](https://github.com/will991/dex-order-serialization-lib/commit/dc58f6ad1f2cefb2fecac1c89726b39a8f77e1b8))
* add muesliswap support ([7e56070](https://github.com/will991/dex-order-serialization-lib/commit/7e5607027bd89593de1fb5e8c6960d81aa9124c7))
* add sundaeswap support for order construction (datums & redeemers) ([829cb38](https://github.com/will991/dex-order-serialization-lib/commit/829cb3829dad0e275bd68ea69f99e36dec06045a))
* add wingrider order & redeemer (de)serialization support ([30efd52](https://github.com/will991/dex-order-serialization-lib/commit/30efd528932ae83643a89ad0dbde513e719d536e))

# 1.0.0 (2023-04-27)


### Bug Fixes

* add check for valid currency symbol based on length ([8ed7d39](https://github.com/will991/dex-order-serialization-lib/commit/8ed7d396b4dcf3b49be0ad619b69a8c7a4514132))
* add minswap batcher constant ([4f0014f](https://github.com/will991/dex-order-serialization-lib/commit/4f0014fdedededf55146a9e4537ba9be6a0c5f9a))
* address builder with correct bech32 network prefix ([7f36c49](https://github.com/will991/dex-order-serialization-lib/commit/7f36c49b128f904861ae612cae926998b901b0ca))
* exports of all types; added redeemer test ([388da20](https://github.com/will991/dex-order-serialization-lib/commit/388da2047616e94f8f7e0a9edd8b248bdfeff2e5))
* imports for encodable address ([3ed45a1](https://github.com/will991/dex-order-serialization-lib/commit/3ed45a1140b86ffbe6bcd1586cd72853cdde2b9e))
* links in readme ([436c926](https://github.com/will991/dex-order-serialization-lib/commit/436c926bbd3d21e40b15fa1944471b7d4adb0cf3))
* links with lines to type file ([9e3049c](https://github.com/will991/dex-order-serialization-lib/commit/9e3049ca86b913990a7483d4009908e2ab695494))
* merge main - resolve conflicts ([f73cada](https://github.com/will991/dex-order-serialization-lib/commit/f73cada9d2e16c41d9d8b5eea81bcdbfe2733376))
* minswap naming collisions ([d4d72f3](https://github.com/will991/dex-order-serialization-lib/commit/d4d72f3910ce57aacf62ef31f24ed838a37a2789))
* naming collisions ([a037b95](https://github.com/will991/dex-order-serialization-lib/commit/a037b95909deaf79d7df9f30c2019ade674172f5))
* naming of types for avoiding naming collisions ([e13b522](https://github.com/will991/dex-order-serialization-lib/commit/e13b5221f72e48758e8bd42861d16e8e7fd4dbfb))
* naming sundaeswap ([4ecf9d3](https://github.com/will991/dex-order-serialization-lib/commit/4ecf9d39eeeb7cfc0b4c6b747079ecb6f9a7ad0c))
* refactor testing for naming collisions ([bbc8eee](https://github.com/will991/dex-order-serialization-lib/commit/bbc8eee3bc4fe60226654bafc4db6b46e81695c8))
* refactoring of order action to order swap ([fbf2ad1](https://github.com/will991/dex-order-serialization-lib/commit/fbf2ad136f5ea8da7cb4741ff2ad93fceae1effa))


### Features

* add minswap datum & redeemer decoder and encoder; builder ([dc58f6a](https://github.com/will991/dex-order-serialization-lib/commit/dc58f6ad1f2cefb2fecac1c89726b39a8f77e1b8))
* add muesliswap support ([7e56070](https://github.com/will991/dex-order-serialization-lib/commit/7e5607027bd89593de1fb5e8c6960d81aa9124c7))
* add sundaeswap support for order construction (datums & redeemers) ([829cb38](https://github.com/will991/dex-order-serialization-lib/commit/829cb3829dad0e275bd68ea69f99e36dec06045a))
* add wingrider order & redeemer (de)serialization support ([30efd52](https://github.com/will991/dex-order-serialization-lib/commit/30efd528932ae83643a89ad0dbde513e719d536e))
