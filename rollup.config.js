import pkg from "./package.json"
import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import { terser } from "rollup-plugin-terser";

export default {
    input: "src/main.ts",
    output: {
        format: "cjs",
        file: pkg.main,
        exports: "auto"
    },
    plugins: [
        typescript({
            useTsconfigDeclarationDir: true
        }),
        json(),
        terser()
    ]
}