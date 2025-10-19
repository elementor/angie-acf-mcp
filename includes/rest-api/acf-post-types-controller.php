<?php
/**
 * ACF Post Types REST API Controller
 *
 * @package AngieAcfMcp
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once ANGIE_ACF_MCP_PATH . 'includes/rest-api/acf-base-controller.php';

/**
 * ACF Post Types REST Controller
 * Handles post type CRUD operations via REST API
 */
class Angie_Acf_Mcp_Post_Types_Controller extends Angie_Acf_Mcp_Base_Controller {

	/**
	 * REST route base
	 *
	 * @var string
	 */
	protected $rest_base = 'post-types';

	/**
	 * Register REST API routes
	 */
	public function register_routes() {
		// Get all post types
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

		// Get/Update/Delete specific post type
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
	 * Get all post types
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_items( $request ) {
		$acf_check = $this->validate_acf_active();
		if ( is_wp_error( $acf_check ) ) {
			return $acf_check;
		}

		$post_types = acf_get_post_types();

		if ( false === $post_types ) {
			return $this->prepare_error_response( 'Failed to retrieve post types.' );
		}

		return new WP_REST_Response( $post_types, 200 );
	}

	/**
	 * Get a specific post type
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_item( $request ) {
		$acf_check = $this->validate_acf_active();
		if ( is_wp_error( $acf_check ) ) {
			return $acf_check;
		}

		$post_type_id = sanitize_text_field( $request['id'] );
		$post_type = acf_get_post_type( $post_type_id );

		if ( ! $post_type ) {
			return $this->prepare_error_response( 'Post type not found.', 404 );
		}

		return new WP_REST_Response( $post_type, 200 );
	}

	/**
	 * Create a new post type
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function create_item( $request ) {
		$acf_check = $this->validate_acf_active();
		if ( is_wp_error( $acf_check ) ) {
			return $acf_check;
		}

		$post_type_data = $request->get_json_params();

		if ( empty( $post_type_data ) ) {
			return $this->prepare_error_response( 'Post type data is required.' );
		}

		// Sanitize data
		$post_type_data = $this->sanitize_acf_data( $post_type_data );

		// Validate required fields
		if ( empty( $post_type_data['post_type'] ) ) {
			return $this->prepare_error_response( 'Post type key is required.' );
		}

		if ( empty( $post_type_data['title'] ) ) {
			return $this->prepare_error_response( 'Post type title is required.' );
		}

		// Create the post type
		$result = $this->handle_acf_call( 'acf_add_local_post_type', [ $post_type_data ] );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return new WP_REST_Response( [
			'success' => true,
			'message' => 'Post type created successfully.',
			'post_type' => $post_type_data['post_type'],
		], 201 );
	}

	/**
	 * Update a post type
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_item( $request ) {
		$acf_check = $this->validate_acf_active();
		if ( is_wp_error( $acf_check ) ) {
			return $acf_check;
		}

		$post_type_id = sanitize_text_field( $request['id'] );
		$post_type_data = $request->get_json_params();

		if ( empty( $post_type_data ) ) {
			return $this->prepare_error_response( 'Post type data is required.' );
		}

		// Check if post type exists
		$existing_post_type = acf_get_post_type( $post_type_id );
		if ( ! $existing_post_type ) {
			return $this->prepare_error_response( 'Post type not found.', 404 );
		}

		// Sanitize data
		$post_type_data = $this->sanitize_acf_data( $post_type_data );
		$post_type_data['post_type'] = $post_type_id;

		// Update the post type
		$result = $this->handle_acf_call( 'acf_add_local_post_type', [ $post_type_data ] );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return new WP_REST_Response( [
			'success' => true,
			'message' => 'Post type updated successfully.',
		], 200 );
	}

	/**
	 * Delete a post type
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function delete_item( $request ) {
		$acf_check = $this->validate_acf_active();
		if ( is_wp_error( $acf_check ) ) {
			return $acf_check;
		}

		$post_type_id = sanitize_text_field( $request['id'] );

		// Check if post type exists
		$existing_post_type = acf_get_post_type( $post_type_id );
		if ( ! $existing_post_type ) {
			return $this->prepare_error_response( 'Post type not found.', 404 );
		}

		// Delete the post type
		$result = $this->handle_acf_call( 'acf_delete_post_type', [ $post_type_id ] );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return new WP_REST_Response( [
			'success' => true,
			'message' => 'Post type deleted successfully.',
		], 200 );
	}
}
