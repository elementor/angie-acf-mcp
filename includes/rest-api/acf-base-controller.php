<?php
/**
 * Base REST API Controller for ACF MCP
 *
 * @package AngieAcfMcp
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Base ACF REST Controller
 * Provides common functionality for all ACF MCP controllers
 */
abstract class Angie_Acf_Mcp_Base_Controller extends WP_REST_Controller {

	/**
	 * REST API namespace
	 *
	 * @var string
	 */
	protected $namespace = 'angie-acf-mcp/v1';

	/**
	 * Check if user has permission to read ACF data
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return bool
	 */
	public function get_items_permissions_check( $request ) {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Check if user has permission to read a single ACF item
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return bool
	 */
	public function get_item_permissions_check( $request ) {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Check if user has permission to create ACF items
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return bool
	 */
	public function create_item_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Check if user has permission to update ACF items
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return bool
	 */
	public function update_item_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Check if user has permission to delete ACF items
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return bool
	 */
	public function delete_item_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Prepare error response
	 *
	 * @param string $message Error message.
	 * @param int    $status  HTTP status code.
	 * @return WP_Error
	 */
	protected function prepare_error_response( $message, $status = 400 ) {
		return new WP_Error( 'acf_mcp_error', $message, [ 'status' => $status ] );
	}

	/**
	 * Validate that ACF is active
	 *
	 * @return WP_Error|bool
	 */
	protected function validate_acf_active() {
		if ( ! class_exists( 'ACF' ) ) {
			return $this->prepare_error_response( 'Advanced Custom Fields plugin is not active.', 503 );
		}
		return true;
	}

	/**
	 * Sanitize ACF data recursively
	 *
	 * @param mixed $data Data to sanitize.
	 * @return mixed Sanitized data.
	 */
	protected function sanitize_acf_data( $data ) {
		if ( is_array( $data ) ) {
			return array_map( [ $this, 'sanitize_acf_data' ], $data );
		}

		if ( is_string( $data ) ) {
			return sanitize_text_field( $data );
		}

		return $data;
	}

	/**
	 * Handle ACF function call with error handling
	 *
	 * @param callable $callback ACF function to call.
	 * @param array    $args     Arguments for the function.
	 * @return mixed|WP_Error
	 */
	protected function handle_acf_call( $callback, $args = [] ) {
		try {
			$result = call_user_func_array( $callback, $args );
			
			if ( false === $result ) {
				return $this->prepare_error_response( 'ACF operation failed.' );
			}
			
			return $result;
		} catch ( Exception $e ) {
			return $this->prepare_error_response( $e->getMessage() );
		}
	}
}
