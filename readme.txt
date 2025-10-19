=== Angie ACF MCP ===
Contributors: elementor
Tags: acf, ai, mcp, angie, custom-fields
Requires at least: 6.2
Tested up to: 6.8
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv3
License URI: https://www.gnu.org/licenses/gpl-3.0.html

Advanced Custom Fields Model Context Protocol server integration for Angie AI.

== Description ==

Angie ACF MCP is a WordPress plugin that integrates Advanced Custom Fields (ACF) with Angie AI through the Model Context Protocol (MCP). This plugin enables AI-powered management of ACF field groups, fields, post types, and taxonomies.

**Features:**

* AI-powered ACF field group management
* Intelligent field structure suggestions
* Support for all ACF field types
* Custom post type creation and management
* Taxonomy management through AI
* REST API endpoints for programmatic access
* Seamless integration with Angie AI

**Requirements:**

* Angie plugin (must be installed and activated)
* Advanced Custom Fields plugin (free or Pro)
* WordPress 6.2 or higher
* PHP 7.4 or higher

== Installation ==

1. Ensure the Angie plugin is installed and activated
2. Ensure the Advanced Custom Fields plugin is installed and activated
3. Upload the `angie-acf-mcp` folder to the `/wp-content/plugins/` directory
4. Activate the plugin through the 'Plugins' menu in WordPress
5. The plugin will automatically integrate with Angie AI

== Usage ==

Once activated, the plugin will automatically register ACF management tools with Angie AI. You can then use Angie's AI interface to:

* Create and manage field groups
* Add and configure custom fields
* Create custom post types
* Manage taxonomies
* Get intelligent field structure suggestions

== REST API ==

The plugin provides REST API endpoints under the `/wp-json/angie-acf-mcp/v1/` namespace:

* `/field-groups` - Manage ACF field groups
* `/fields` - Manage ACF fields
* `/post-types` - Manage custom post types (requires ACF Pro)
* `/taxonomies` - Manage custom taxonomies (requires ACF Pro)

== Changelog ==

= 1.0.0 =
* Initial release
* Full ACF field and field group management
* Post type and taxonomy support
* AI-powered field structure suggestions
* REST API integration
