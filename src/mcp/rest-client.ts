/**
 * WordPress ACF REST API Client
 * Adapted for WordPress environment with proper nonce handling
 */

export async function callAcfApi( endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: Record<string, unknown> ) {
	// Get WordPress settings from the global object
	const settings = window.angieAcfMcpSettings;
	if ( ! settings ) {
		throw new Error( 'Angie ACF MCP settings not found. Make sure the plugin is properly loaded.' );
	}

	const url = `${ settings.acfApiUrl }${ endpoint }`;

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		'X-WP-Nonce': settings.nonce,
	};

	const options: RequestInit = {
		method,
		headers,
		credentials: 'same-origin',
	};

	if ( data && ( method === 'POST' || method === 'PUT' ) ) {
		options.body = JSON.stringify( data );
	}

	const response = await fetch( url, options );

	if ( ! response.ok ) {
		let errorMessage = `HTTP error ${ response.status }`;
		try {
			const errorText = await response.text();
			errorMessage += `: ${ errorText }`;
		} catch {
			// Ignore error parsing error text
		}
		throw new Error( errorMessage );
	}

	if ( response.status === 204 || response.headers.get( 'content-length' ) === '0' ) {
		return null;
	}

	return await response.json();
}
