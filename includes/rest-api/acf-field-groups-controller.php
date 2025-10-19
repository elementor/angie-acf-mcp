<?php
/**
 * ACF Field Groups REST API Controller
 *
 * @package AngieAcfMcp
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once ANGIE_ACF_MCP_PATH . 'includes/rest-api/acf-base-controller.php';

/**
 * ACF Field Groups REST Controller
 * Handles field group CRUD operations via REST API
 */
class Angie_Acf_Mcp_Field_Groups_Controller extends Angie_Acf_Mcp_Base_Controller {

	/**
	 * REST route base
	 *
	 * @var string
	 */
	protected $rest_base = 'field-groups';

	/**
	 * Register REST API routes
	 */
	public function register_routes() {
		// Get all field groups
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

		// Get/Update/Delete specific field group
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
	 * Get all field groups
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_items( $request ) {
		$acf_check = $this->validate_acf_active();
		if ( is_wp_error( $acf_check ) ) {
			return $acf_check;
		}

		$field_groups = acf_get_field_groups();

		if ( false === $field_groups ) {
			return $this->prepare_error_response( 'Failed to retrieve field groups.' );
		}

		return new WP_REST_Response( $field_groups, 200 );
	}

	/**
	 * Get a specific field group
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_item( $request ) {
		$acf_check = $this->validate_acf_active();
		if ( is_wp_error( $acf_check ) ) {
			return $acf_check;
		}

		$group_id = sanitize_text_field( $request['id'] );
		$field_group = acf_get_field_group( $group_id );

		if ( ! $field_group ) {
			return $this->prepare_error_response( 'Field group not found.', 404 );
		}

		// Get fields for this group
		$fields = acf_get_fields( $group_id );
		if ( $fields ) {
			$field_group['fields'] = $fields;
		}

		return new WP_REST_Response( $field_group, 200 );
	}

	/**
	 * Create a new field group
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function create_item( $request ) {
		$acf_check = $this->validate_acf_active();
		if ( is_wp_error( $acf_check ) ) {
			return $acf_check;
		}

		$field_group_data = $request->get_json_params();

		if ( empty( $field_group_data ) ) {
			return $this->prepare_error_response( 'Field group data is required.' );
		}

		// Sanitize data
		$field_group_data = $this->sanitize_acf_data( $field_group_data );

		// Validate required fields
		if ( empty( $field_group_data['title'] ) ) {
			return $this->prepare_error_response( 'Field group title is required.' );
		}

		// Create the field group
		$result = $this->handle_acf_call( 'acf_add_local_field_group', [ $field_group_data ] );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		// Save it to the database
		$saved_result = $this->handle_acf_call( 'acf_import_field_group', [ $field_group_data ] );
		if ( is_wp_error( $saved_result ) ) {
			return $saved_result;
		}

		return new WP_REST_Response( [
			'success' => true,
			'message' => 'Field group created successfully.',
			'key' => $field_group_data['key'] ?? '',
		], 201 );
	}

	/**
	 * Update a field group
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_item( $request ) {
		$acf_check = $this->validate_acf_active();
		if ( is_wp_error( $acf_check ) ) {
			return $acf_check;
		}

		$group_id = sanitize_text_field( $request['id'] );
		$field_group_data = $request->get_json_params();

		if ( empty( $field_group_data ) ) {
			return $this->prepare_error_response( 'Field group data is required.' );
		}

		// Check if field group exists
		$existing_group = acf_get_field_group( $group_id );
		if ( ! $existing_group ) {
			return $this->prepare_error_response( 'Field group not found.', 404 );
		}

		// Sanitize data
		$field_group_data = $this->sanitize_acf_data( $field_group_data );
		$field_group_data['key'] = $group_id;

		// Update the field group
		$result = $this->handle_acf_call( 'acf_add_local_field_group', [ $field_group_data ] );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		// Save it to the database
		$saved_result = $this->handle_acf_call( 'acf_import_field_group', [ $field_group_data ] );
		if ( is_wp_error( $saved_result ) ) {
			return $saved_result;
		}

		return new WP_REST_Response( [
			'success' => true,
			'message' => 'Field group updated successfully.',
		], 200 );
	}

	/**
	 * Delete a field group
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function delete_item( $request ) {
		$acf_check = $this->validate_acf_active();
		if ( is_wp_error( $acf_check ) ) {
			return $acf_check;
		}

		$group_id = sanitize_text_field( $request['id'] );

		// Check if field group exists
		$existing_group = acf_get_field_group( $group_id );
		if ( ! $existing_group ) {
			return $this->prepare_error_response( 'Field group not found.', 404 );
		}

		// Delete the field group
		$result = $this->handle_acf_call( 'acf_delete_field_group', [ $group_id ] );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return new WP_REST_Response( [
			'success' => true,
			'message' => 'Field group deleted successfully.',
		], 200 );
	}
}
