import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig( {
	build: {
		lib: {
			entry: resolve( __dirname, 'src/index.ts' ),
			name: 'AngieAcfMcp',
			fileName: 'acf-mcp-server',
		},
		rollupOptions: {
			external: [
				'wp',
				'lodash',
				'@modelcontextprotocol/sdk',
				'@modelcontextprotocol/sdk/server/mcp.js',
				'@modelcontextprotocol/sdk/shared/transport.js',
				'@modelcontextprotocol/sdk/types.js',
			 ],
			output: {
				globals: {
					wp: 'wp',
					lodash: '_',
					'@modelcontextprotocol/sdk': 'ModelContextProtocolSDK',
					'@modelcontextprotocol/sdk/server/mcp.js': 'ModelContextProtocolSDK.server',
					'@modelcontextprotocol/sdk/shared/transport.js': 'ModelContextProtocolSDK.transport',
					'@modelcontextprotocol/sdk/types.js': 'ModelContextProtocolSDK.types',
				},
			},
		},
	},
} );
