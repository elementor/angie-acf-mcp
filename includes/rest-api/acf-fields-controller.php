<?php
/**
 * ACF Fields REST API Controller
 *
 * @package AngieAcfMcp
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once ANGIE_ACF_MCP_PATH . 'includes/rest-api/acf-base-controller.php';

/**
 * ACF Fields REST Controller
 * Handles field CRUD operations via REST API
 */
class Angie_Acf_Mcp_Fields_Controller extends Angie_Acf_Mcp_Base_Controller {

	/**
	 * REST route base
	 *
	 * @var string
	 */
	protected $rest_base = 'fields';

	/**
	 * Register REST API routes
	 */
	public function register_routes() {
		// Get all fields
		register_rest_route( $this->namespace, '/' . $this->rest_base, [
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => [ $this, 'get_items' ],
				'permission_callback' => [ $this, 'get_items_permissions_check' ],
			],
			[
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => [ $this, 'create_item' ],
				'permission_callback' => [ $this, 'create_item_permissions_check' ],
			],
		] );

		// Get/Update/Delete specific field
		register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<id>[\w-]+)', [
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => [ $this, 'get_item' ],
				'permission_callback' => [ $this, 'get_item_permissions_check' ],
			],
			[
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => [ $this, 'update_item' ],
				'permission_callback' => [ $this, 'update_item_permissions_check' ],
			],
			[
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => [ $this, 'delete_item' ],
				'permission_callback' => [ $this, 'delete_item_permissions_check' ],
			],
		] );
	}

	/**
	 * Get all fields
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_items( $request ) {
		$acf_check = $this->validate_acf_active();
		if ( is_wp_error( $acf_check ) ) {
			return $acf_check;
		}

		// Get all field groups first, then get their fields
		$field_groups = acf_get_field_groups();
		$all_fields = [];

		foreach ( $field_groups as $group ) {
			$fields = acf_get_fields( $group['key'] );
			if ( $fields ) {
				$all_fields = array_merge( $all_fields, $fields );
			}
		}

		return new WP_REST_Response( $all_fields, 200 );
	}

	/**
	 * Get a specific field
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_item( $request ) {
		$acf_check = $this->validate_acf_active();
		if ( is_wp_error( $acf_check ) ) {
			return $acf_check;
		}

		$field_id = sanitize_text_field( $request['id'] );
		$field = acf_get_field( $field_id );

		if ( ! $field ) {
			return $this->prepare_error_response( 'Field not found.', 404 );
		}

		return new WP_REST_Response( $field, 200 );
	}

	/**
	 * Create a new field
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function create_item( $request ) {
		$acf_check = $this->validate_acf_active();
		if ( is_wp_error( $acf_check ) ) {
			return $acf_check;
		}

		$field_data = $request->get_json_params();

		if ( empty( $field_data ) ) {
			return $this->prepare_error_response( 'Field data is required.' );
		}

		// Sanitize data
		$field_data = $this->sanitize_acf_data( $field_data );

		// Validate required fields
		if ( empty( $field_data['label'] ) ) {
			return $this->prepare_error_response( 'Field label is required.' );
		}

		if ( empty( $field_data['name'] ) ) {
			return $this->prepare_error_response( 'Field name is required.' );
		}

		if ( empty( $field_data['type'] ) ) {
			return $this->prepare_error_response( 'Field type is required.' );
		}

		if ( empty( $field_data['parent'] ) ) {
			return $this->prepare_error_response( 'Parent field group is required.' );
		}

		// Verify parent field group exists
		$parent_group = acf_get_field_group( $field_data['parent'] );
		if ( ! $parent_group ) {
			return $this->prepare_error_response( 'Parent field group not found.' );
		}

		// Create the field
		$result = $this->handle_acf_call( 'acf_add_local_field', [ $field_data ] );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		// Save it to the database
		$saved_result = $this->handle_acf_call( 'acf_import_field', [ $field_data ] );
		if ( is_wp_error( $saved_result ) ) {
			return $saved_result;
		}

		return new WP_REST_Response( [
			'success' => true,
			'message' => 'Field created successfully.',
			'key' => $field_data['key'] ?? '',
		], 201 );
	}

	/**
	 * Update a field
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_item( $request ) {
		$acf_check = $this->validate_acf_active();
		if ( is_wp_error( $acf_check ) ) {
			return $acf_check;
		}

		$field_id = sanitize_text_field( $request['id'] );
		$field_data = $request->get_json_params();

		if ( empty( $field_data ) ) {
			return $this->prepare_error_response( 'Field data is required.' );
		}

		// Check if field exists
		$existing_field = acf_get_field( $field_id );
		if ( ! $existing_field ) {
			return $this->prepare_error_response( 'Field not found.', 404 );
		}

		// Sanitize data
		$field_data = $this->sanitize_acf_data( $field_data );
		$field_data['key'] = $field_id;

		// Update the field
		$result = $this->handle_acf_call( 'acf_add_local_field', [ $field_data ] );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		// Save it to the database
		$saved_result = $this->handle_acf_call( 'acf_import_field', [ $field_data ] );
		if ( is_wp_error( $saved_result ) ) {
			return $saved_result;
		}

		return new WP_REST_Response( [
			'success' => true,
			'message' => 'Field updated successfully.',
		], 200 );
	}

	/**
	 * Delete a field
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function delete_item( $request ) {
		$acf_check = $this->validate_acf_active();
		if ( is_wp_error( $acf_check ) ) {
			return $acf_check;
		}

		$field_id = sanitize_text_field( $request['id'] );

		// Check if field exists
		$existing_field = acf_get_field( $field_id );
		if ( ! $existing_field ) {
			return $this->prepare_error_response( 'Field not found.', 404 );
		}

		// Delete the field
		$result = $this->handle_acf_call( 'acf_delete_field', [ $field_id ] );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return new WP_REST_Response( [
			'success' => true,
			'message' => 'Field deleted successfully.',
		], 200 );
	}
}
