<?php
/**
 * ACF MCP Module Class
 *
 * @package AngieAcfMcp
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * ACF MCP Module
 * Integrates ACF MCP server functionality with Angie
 */
class Angie_Acf_Mcp_Module {

	/**
	 * Constructor
	 */
	public function __construct() {
		add_action( 'init', [ $this, 'init' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_assets' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );
		add_action( 'rest_api_init', [ $this, 'register_rest_endpoints' ] );
	}

	/**
	 * Initialize the module
	 */
	public function init() {
		// Initialize ACF REST API endpoints
		$this->init_acf_rest_api();
	}

	/**
	 * Initialize ACF REST API endpoints
	 */
	private function init_acf_rest_api() {
		require_once ANGIE_ACF_MCP_PATH . 'includes/rest-api/acf-fields-controller.php';
		require_once ANGIE_ACF_MCP_PATH . 'includes/rest-api/acf-field-groups-controller.php';
		require_once ANGIE_ACF_MCP_PATH . 'includes/rest-api/acf-post-types-controller.php';
		require_once ANGIE_ACF_MCP_PATH . 'includes/rest-api/acf-taxonomies-controller.php';
	}

	/**
	 * Enqueue plugin assets
	 */
	public function enqueue_assets() {
		// Only load on pages where Angie is active
		if ( ! $this->should_load_assets() ) {
			return;
		}

		wp_enqueue_script(
			'angie-acf-mcp-server',
			ANGIE_ACF_MCP_URL . 'dist/acf-mcp-server.umd.cjs',
			[ 'angie-app' ],
			ANGIE_ACF_MCP_VERSION,
			[
				'strategy' => 'defer',
			]
		);

		// Localize script with WordPress API settings
		wp_localize_script(
			'angie-acf-mcp-server',
			'angieAcfMcpSettings',
			[
				'apiUrl' => rest_url( 'angie-acf-mcp/v1/' ),
				'nonce' => wp_create_nonce( 'wp_rest' ),
				'acfApiUrl' => rest_url( 'acf/v1/' ),
			]
		);
	}

	/**
	 * Check if we should load assets on current page
	 *
	 * @return bool
	 */
	private function should_load_assets(): bool {
		// Load on admin pages where Angie might be active
		if ( is_admin() ) {
			return true;
		}

		// Load on frontend if Angie is being used
		// This would depend on how Angie determines when to load
		return apply_filters( 'angie_acf_mcp_should_load_assets', false );
	}

	/**
	 * Register REST API endpoints
	 */
	public function register_rest_endpoints() {
		// Field endpoints
		$fields_controller = new Angie_Acf_Mcp_Fields_Controller();
		$fields_controller->register_routes();

		// Field Group endpoints
		$field_groups_controller = new Angie_Acf_Mcp_Field_Groups_Controller();
		$field_groups_controller->register_routes();

		// Post Type endpoints
		$post_types_controller = new Angie_Acf_Mcp_Post_Types_Controller();
		$post_types_controller->register_routes();

		// Taxonomy endpoints
		$taxonomies_controller = new Angie_Acf_Mcp_Taxonomies_Controller();
		$taxonomies_controller->register_routes();
	}
}
