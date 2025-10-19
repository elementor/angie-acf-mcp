<?php
/**
 * ACF Taxonomies REST API Controller
 *
 * @package AngieAcfMcp
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once ANGIE_ACF_MCP_PATH . 'includes/rest-api/acf-base-controller.php';

/**
 * ACF Taxonomies REST Controller
 * Handles taxonomy CRUD operations via REST API
 */
class Angie_Acf_Mcp_Taxonomies_Controller extends Angie_Acf_Mcp_Base_Controller {

	/**
	 * REST route base
	 *
	 * @var string
	 */
	protected $rest_base = 'taxonomies';

	/**
	 * Register REST API routes
	 */
	public function register_routes() {
		// Get all taxonomies
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

		// Get/Update/Delete specific taxonomy
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
	 * Get all taxonomies
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_items( $request ) {
		$acf_check = $this->validate_acf_active();
		if ( is_wp_error( $acf_check ) ) {
			return $acf_check;
		}

		$taxonomies = acf_get_taxonomies();

		if ( false === $taxonomies ) {
			return $this->prepare_error_response( 'Failed to retrieve taxonomies.' );
		}

		return new WP_REST_Response( $taxonomies, 200 );
	}

	/**
	 * Get a specific taxonomy
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_item( $request ) {
		$acf_check = $this->validate_acf_active();
		if ( is_wp_error( $acf_check ) ) {
			return $acf_check;
		}

		$taxonomy_id = sanitize_text_field( $request['id'] );
		$taxonomy = acf_get_taxonomy( $taxonomy_id );

		if ( ! $taxonomy ) {
			return $this->prepare_error_response( 'Taxonomy not found.', 404 );
		}

		return new WP_REST_Response( $taxonomy, 200 );
	}

	/**
	 * Create a new taxonomy
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function create_item( $request ) {
		$acf_check = $this->validate_acf_active();
		if ( is_wp_error( $acf_check ) ) {
			return $acf_check;
		}

		$taxonomy_data = $request->get_json_params();

		if ( empty( $taxonomy_data ) ) {
			return $this->prepare_error_response( 'Taxonomy data is required.' );
		}

		// Sanitize data
		$taxonomy_data = $this->sanitize_acf_data( $taxonomy_data );

		// Validate required fields
		if ( empty( $taxonomy_data['taxonomy'] ) ) {
			return $this->prepare_error_response( 'Taxonomy key is required.' );
		}

		if ( empty( $taxonomy_data['label'] ) ) {
			return $this->prepare_error_response( 'Taxonomy label is required.' );
		}

		// Create the taxonomy
		$result = $this->handle_acf_call( 'acf_add_local_taxonomy', [ $taxonomy_data ] );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return new WP_REST_Response( [
			'success' => true,
			'message' => 'Taxonomy created successfully.',
			'taxonomy' => $taxonomy_data['taxonomy'],
		], 201 );
	}

	/**
	 * Update a taxonomy
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_item( $request ) {
		$acf_check = $this->validate_acf_active();
		if ( is_wp_error( $acf_check ) ) {
			return $acf_check;
		}

		$taxonomy_id = sanitize_text_field( $request['id'] );
		$taxonomy_data = $request->get_json_params();

		if ( empty( $taxonomy_data ) ) {
			return $this->prepare_error_response( 'Taxonomy data is required.' );
		}

		// Check if taxonomy exists
		$existing_taxonomy = acf_get_taxonomy( $taxonomy_id );
		if ( ! $existing_taxonomy ) {
			return $this->prepare_error_response( 'Taxonomy not found.', 404 );
		}

		// Sanitize data
		$taxonomy_data = $this->sanitize_acf_data( $taxonomy_data );
		$taxonomy_data['taxonomy'] = $taxonomy_id;

		// Update the taxonomy
		$result = $this->handle_acf_call( 'acf_add_local_taxonomy', [ $taxonomy_data ] );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return new WP_REST_Response( [
			'success' => true,
			'message' => 'Taxonomy updated successfully.',
		], 200 );
	}

	/**
	 * Delete a taxonomy
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function delete_item( $request ) {
		$acf_check = $this->validate_acf_active();
		if ( is_wp_error( $acf_check ) ) {
			return $acf_check;
		}

		$taxonomy_id = sanitize_text_field( $request['id'] );

		// Check if taxonomy exists
		$existing_taxonomy = acf_get_taxonomy( $taxonomy_id );
		if ( ! $existing_taxonomy ) {
			return $this->prepare_error_response( 'Taxonomy not found.', 404 );
		}

		// Delete the taxonomy
		$result = $this->handle_acf_call( 'acf_delete_taxonomy', [ $taxonomy_id ] );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return new WP_REST_Response( [
			'success' => true,
			'message' => 'Taxonomy deleted successfully.',
		], 200 );
	}
}
