/**
 * Angie ACF MCP Server
 *
 * This is the main entry point for the ACF MCP server that runs in WordPress.
 * It creates and registers the ACF MCP server with Angie's MCP system.
 */

import { AngieMcpSdk } from '@elementor/angie-sdk';
import { createAcfServer } from './mcp';

// Declare global WordPress API
declare global {
	interface Window {
		angieAcfMcpSettings: {
			apiUrl: string;
			nonce: string;
			acfApiUrl: string;
		};
	}
}

const init = async () => {
	// Create the ACF MCP server
	const server = createAcfServer();
	const sdk = new AngieMcpSdk();

	await sdk.waitForReady();

	// Register with Angie's MCP system
	await sdk.registerServer( {
		name: 'acf-server',
		version: '1.0.0',
		description: 'Advanced Custom Fields (ACF) MCP Server - Provides comprehensive tools for managing ACF field groups, fields, custom post types, and taxonomies in WordPress.',
		server,
	} );
};

init();
