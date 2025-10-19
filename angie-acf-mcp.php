<?php
/**
 * Plugin Name: Angie ACF MCP
 * Description: Advanced Custom Fields Model Context Protocol server integration for Angie AI
 * Plugin URI: https://elementor.com/
 * Version: 1.0.0
 * Author: Elementor.com
 * Author URI: https://elementor.com/
 * Text Domain: angie-acf-mcp
 * Requires at least: 6.2
 * Tested up to: 6.8
 * Requires PHP: 7.4
 * Requires Plugins: Angie
 *
 * @package AngieAcfMcp
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

const ANGIE_ACF_MCP_VERSION = '1.0.0';

define( 'ANGIE_ACF_MCP_PATH', plugin_dir_path( __FILE__ ) );
define( 'ANGIE_ACF_MCP_URL', plugins_url( '/', __FILE__ ) );

/**
 * Angie ACF MCP Plugin Class
 */
final class Angie_Acf_Mcp {

	/**
	 * Constructor
	 */
	public function __construct() {
		add_action( 'plugins_loaded', [ $this, 'init' ] );
	}

	/**
	 * Initialize the plugin
	 */
	public function init() {
		if ( ! $this->is_angie_active() || ! $this->is_acf_active() ) {
			return;
		}

		require_once ANGIE_ACF_MCP_PATH . 'includes/acf-mcp-module.php';

		// Initialize the module
		new Angie_Acf_Mcp_Module();
	}

	/**
	 * Check if Angie plugin is active
	 *
	 * @return bool
	 */
	private function is_angie_active(): bool {
		return class_exists( 'Angie' );
	}

	/**
	 * Check if ACF plugin is active
	 *
	 * @return bool
	 */
	private function is_acf_active(): bool {
		return class_exists( 'ACF' );
	}
}

new Angie_Acf_Mcp();
