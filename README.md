# Angie ACF MCP Plugin

A standalone WordPress plugin that integrates Advanced Custom Fields (ACF) with Angie through the Model Context Protocol (MCP).

## Overview

This plugin provides AI-powered management of ACF field groups, fields, post types, and taxonomies through Angie's intelligent interface. It enables users to create and manage complex ACF structures using natural language commands.

## Features

- **AI-Powered Field Management**: Create, update, and delete ACF fields and field groups using AI
- **Intelligent Structure Suggestions**: Get AI-generated field structure recommendations for different post types
- **Post Type Management**: Create and manage custom post types
- **Taxonomy Management**: Handle custom taxonomies
- **REST API Integration**: Comprehensive REST API for programmatic access
- **TypeScript/JavaScript Client**: Modern client-side implementation with full type safety

## Requirements

- WordPress 6.2+
- PHP 7.4+
- **Angie Plugin** (must be installed and activated)
- **Advanced Custom Fields**

## Installation

1. Ensure the Angie plugin is installed and activated
2. Ensure ACF is installed and activated
3. Upload this plugin to your WordPress site
4. Activate the plugin
5. The plugin will automatically integrate with Angie's MCP system

## Development

### Building the Plugin

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build for development (with watching):
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

### Project Structure

```
angie-acf-mcp-plugin/
├── src/                          # TypeScript source files
│   ├── index.ts                  # Main entry point
│   └── mcp/                      # MCP server implementation
│       ├── acf-mcp-server-v2.ts  # Main MCP server
│       ├── schemas.ts            # Zod validation schemas
│       ├── rest-client.ts        # WordPress REST API client
│       └── utils.ts              # Utility functions
├── includes/                     # PHP backend files
│   ├── acf-mcp-module.php        # Main PHP module
│   └── rest-api/                 # REST API controllers
│       ├── acf-base-controller.php
│       ├── acf-fields-controller.php
│       ├── acf-field-groups-controller.php
│       ├── acf-post-types-controller.php
│       └── acf-taxonomies-controller.php
├── dist/                         # Compiled JavaScript output
├── angie-acf-mcp.php            # Main plugin file
├── package.json                  # Node.js dependencies
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Build configuration
└── README.md                    # This file
```

### Architecture

The plugin consists of two main parts:

1. **PHP Backend**: Handles WordPress integration, REST API endpoints, and ACF function calls
2. **TypeScript Frontend**: Implements the MCP server and provides the AI interface

The TypeScript code is compiled into a single JavaScript file that's loaded in WordPress and registers with Angie's MCP system.

### REST API Endpoints

The plugin provides the following REST API endpoints:

- `GET /wp-json/angie-acf-mcp/v1/field-groups` - List all field groups
- `POST /wp-json/angie-acf-mcp/v1/field-groups` - Create a field group
- `GET /wp-json/angie-acf-mcp/v1/field-groups/{id}` - Get a specific field group
- `PUT /wp-json/angie-acf-mcp/v1/field-groups/{id}` - Update a field group
- `DELETE /wp-json/angie-acf-mcp/v1/field-groups/{id}` - Delete a field group

Similar endpoints exist for fields, post-types, and taxonomies.

### MCP Tools

The plugin registers the following MCP tools with Angie:

- **acf-field**: Manage individual ACF fields
- **acf-field-group**: Manage ACF field groups and get structure suggestions
- **acf-post-type**: Manage custom post types
- **acf-taxonomy**: Manage custom taxonomies
