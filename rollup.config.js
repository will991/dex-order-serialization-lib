import typescript from '@rollup/plugin-typescript';

export default () => ({
  input: 'src/index.ts',
  plugins: [
    typescript({
      tsconfig: './tsconfig.esm.json',
      composite: false,
    }),
  ],
  output: [
    {
      file: 'lib/esm/index.js',
      format: 'esm',
      sourcemap: true,
    },
  ],
  external: [/node_modules/],
});
