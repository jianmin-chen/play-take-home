import { type NextConfig } from 'next';

export default {
    experimental: {
        esmExternals: 'loose',
        turbo: {
            resolveAlias: {
                canvas: "./empty-module.ts"
            }
        }
    },
    webpack: (config, _) => {
        config.resolve.alias.canvas = false;
        return config;
    }
} as NextConfig;
