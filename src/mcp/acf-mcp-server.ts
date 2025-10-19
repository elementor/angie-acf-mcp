import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
	ACFFieldSchema,
	ACFFieldGroupSchema,
	ACFPostTypeSchema,
	ACFTaxonomySchema,
} from './schemas';
import { callAcfApi } from './rest-client';

interface McpToolResult {
	[x: string]: unknown;
	content: Array<{
		type: 'text';
		text: string;
	}>;
}

// Field-related parameter interfaces
interface FieldToolParams {
	action: 'get-fields' | 'get-field' | 'create-field' | 'update-field' | 'delete-field';
	fieldId?: string;
	parentId?: string;
	field?: unknown;
	confirmationMessage?: string;
}

// Field Group-related parameter interfaces
interface GroupToolParams {
	action: 'get-field-groups' | 'get-field-group' | 'create-field-group' | 'update-field-group' | 'delete-field-group' | 'suggest-field-structure';
	groupId?: string;
	fieldGroup?: unknown;
	postType?: string;
	purpose?: string;
	confirmationMessage?: string;
}

// Post Type-related parameter interfaces
interface PostTypeToolParams {
	action: 'get-post-types' | 'get-post-type' | 'create-post-type' | 'update-post-type' | 'delete-post-type';
	postType?: string;
	postTypeId?: string;
	postTypeConfig?: unknown;
	confirmationMessage?: string;
}

// Taxonomy-related parameter interfaces
interface TaxonomyToolParams {
	action: 'get-taxonomies' | 'get-taxonomy' | 'create-taxonomy' | 'update-taxonomy' | 'delete-taxonomy';
	taxonomyId?: string;
	taxonomy?: unknown;
	confirmationMessage?: string;
}

export function createAcfServer() {
	const server = new McpServer( {
		name: 'acf-server',
		version: '1.0.0',
	}, {
		capabilities: {
			resources: {
				subscribe: true,
			},
		},
	} );

	// Register all 4 ACF tools
	createAcfFieldTool( server );
	createAcfFieldGroupTool( server );
	createAcfPostTypeTool( server );
	createAcfTaxonomyTool( server );

	return server;
}

// ACF Field Management Tool
function createAcfFieldTool( server: McpServer ) {
	server.tool(
		'acf-field',
		`This tool manages ACF field operations, allowing you to create, update, retrieve, and delete individual fields within field groups.

		**What does it do?**
		- Retrieves individual fields or lists of all fields
		- Creates new fields within existing field groups
		- Updates field configurations and properties
		- Deletes fields from field groups
		- Handles all field types with their specific properties

		**What it returns?**
		Returns JSON data for field configurations, success confirmations for create/update operations, and proper error messages for validation issues.`,
		{
			action: z.enum( [ 'get-fields', 'get-field', 'create-field', 'update-field', 'delete-field' ] )
				.describe( 'The field operation to perform.' ),
			fieldId: z.string().optional()
				.describe( 'The ID of the field (e.g., "field_12345abcde"). Required for get-field, update-field, and delete-field actions.' ),
			parentId: z.string().optional()
				.describe( 'The ID of the parent field group (e.g., "group_12345abcde"). Required for create-field action.' ),
			field: ACFFieldSchema.optional()
				.describe( 'The field configuration object with all field properties. Required for create-field and update-field actions.' ),
			confirmationMessage: z.string().optional()
				.describe( 'A clear explanation of what will be deleted and its impact (shown to user before delete operations). Example: "You\'re about to permanently delete the \'Product Price\' field. This cannot be undone."' ),
		},
		{
			title: 'Manage ACF Fields',
		},
		async ( params: FieldToolParams ): Promise<McpToolResult> => {
			try {
				switch ( params.action ) {
				case 'get-fields':
					return await handleGetFields();
				case 'get-field':
					return await handleGetField( params );
				case 'create-field':
					return await handleCreateField( params );
				case 'update-field':
					return await handleUpdateField( params );
				case 'delete-field':
					return await handleDeleteField( params );
				default:
					throw new Error( `Unknown field action: ${ params.action }` );
				}
			} catch ( error ) {
				return {
					content: [ {
						type: 'text',
						text: `Error performing field operation: ${ ( error as Error ).message }`,
					} ],
				};
			}
		}
	);
}

// ACF Field Group Management Tool
function createAcfFieldGroupTool( server: McpServer ) {
	server.tool(
		'acf-field-group',
		`This tool manages ACF field groups, which are containers that hold related fields and define where they appear in WordPress.

		**What does it do?**
		- Manages field group creation, updates, and deletion
		- Configures field group display locations and rules
		- Provides ACF plugin status checking
		- Generates intelligent field structure suggestions for a given post type
		- Handles field group properties like positioning, styling, and visibility

		**What it returns?**
		Returns JSON data for field group configurations, success confirmations for create/update operations, ACF status information, and structured field suggestions.`,
		{
			action: z.enum( [ 'get-field-groups', 'get-field-group', 'create-field-group', 'update-field-group', 'delete-field-group', 'suggest-field-structure' ] )
				.describe( 'The field group operation to perform.' ),
			groupId: z.string().optional()
				.describe( 'The ID of the field group. Required for get-field-group, update-field-group, and delete-field-group actions.' ),
			fieldGroup: ACFFieldGroupSchema.optional()
				.describe( 'The field group configuration object with location rules, fields, and display settings. Required for create-field-group and update-field-group actions.' ),
			postType: z.string().optional()
				.describe( 'The post type identifier for field structure suggestions (e.g., "product", "course", "event"). Required for suggest-field-structure action.' ),
			purpose: z.string().optional()
				.describe( 'The purpose or industry context for field structure suggestions (e.g., "education", "ecommerce", "real estate"). Required for suggest-field-structure action.' ),
			confirmationMessage: z.string().optional()
				.describe( 'A clear explanation of what will be deleted and its impact (shown to user before delete operations). Example: "You\'re about to permanently delete the \'Product Information\' field group and all its fields. This cannot be undone."' ),
		},
		{
			title: 'Manage ACF Field Groups',
		},
		async ( params: GroupToolParams ): Promise<McpToolResult> => {
			try {
				switch ( params.action ) {
				case 'get-field-groups':
					return await handleGetFieldGroups();
				case 'get-field-group':
					return await handleGetFieldGroup( params );
				case 'create-field-group':
					return await handleCreateFieldGroup( params );
				case 'update-field-group':
					return await handleUpdateFieldGroup( params );
				case 'delete-field-group':
					return await handleDeleteFieldGroup( params );
				case 'suggest-field-structure':
					return await handleSuggestFieldStructure( params );
				default:
					throw new Error( `Unknown field group action: ${ params.action }` );
				}
			} catch ( error ) {
				return {
					content: [ {
						type: 'text',
						text: `Error performing field group operation: ${ ( error as Error ).message }`,
					} ],
				};
			}
		}
	);
}

// ACF Post Type Management Tool
function createAcfPostTypeTool( server: McpServer ) {
	server.tool(
		'acf-post-type',
		`This tool manages custom post types in WordPress through ACF, allowing you to create specialized content types beyond the default posts and pages.

		**What does it do?**
		- Creates custom post types with full configuration options
		- Retrieves existing post type(s) and their configurations
		- Manages post type properties, labels, and capabilities
		- Updates existing post type settings and permissions
		- Handles post type deletion and cleanup
		- Configures post type behavior (hierarchical, public, searchable, etc.)

		**What it returns?**
		Returns JSON data for post type configurations, success confirmations for create/update operations, and detailed error messages for configuration issues.`,
		{
			action: z.enum( [ 'get-post-types', 'get-post-type', 'create-post-type', 'update-post-type', 'delete-post-type' ] )
				.describe( 'The post type operation to perform.' ),
			postType: z.string().optional()
				.describe( 'The post type identifier (e.g., "product", "course"). Required for get-post-type, update-post-type and delete-post-type actions.' ),
			postTypeConfig: ACFPostTypeSchema.optional()
				.describe( 'The post type configuration object with labels, capabilities, and behavior settings. Required for create-post-type and update-post-type actions.' ),
			confirmationMessage: z.string().optional()
				.describe( 'A clear explanation of what will be deleted and its impact (shown to user before delete operations). Example: "You\'re about to permanently delete the \'Product\' post type. All existing products will become inaccessible. This cannot be undone."' ),
		},
		{
			title: 'Manage ACF Post Types',
		},
		async ( params: PostTypeToolParams ): Promise<McpToolResult> => {
			try {
				switch ( params.action ) {
				case 'get-post-types':
					return await handleGetPostTypes();
				case 'get-post-type':
					return await handleGetPostType( params );
				case 'create-post-type':
					return await handleCreatePostType( params );
				case 'update-post-type':
					return await handleUpdatePostType( params );
				case 'delete-post-type':
					return await handleDeletePostType( params );
				default:
					throw new Error( `Unknown post type action: ${ params.action }` );
				}
			} catch ( error ) {
				return {
					content: [ {
						type: 'text',
						text: `Error performing post type operation: ${ ( error as Error ).message }`,
					} ],
				};
			}
		}
	);
}

// ACF Taxonomy Management Tool
function createAcfTaxonomyTool( server: McpServer ) {
	server.tool(
		'acf-taxonomy',
		`This tool manages custom taxonomies in WordPress through ACF, enabling you to create, retrieve, update and delete custom taxonomies.

		**What does it do?**
		- Retrieves existing taxonomy(s) and their configurations
		- Creates custom taxonomies with comprehensive configuration options
		- Manages taxonomy properties, labels, and hierarchical structures
		- Deletes existing taxonomies

		**When to use this tool?**
		- When you need to create a new taxonomy
		- When you need to retrieve a taxonomy
		- When you need to update a taxonomy
		- When you need to delete a taxonomy

		**What it returns?**
		Returns JSON data for taxonomy configurations, success confirmations for create/update operations, and detailed error messages for configuration issues.`,
		{
			action: z.enum( [ 'get-taxonomies', 'get-taxonomy', 'create-taxonomy', 'update-taxonomy', 'delete-taxonomy' ] )
				.describe( 'The taxonomy operation to perform.' ),
			taxonomyId: z.string().optional()
				.describe( 'The ID of the taxonomy (e.g., "product_category"). Required for get-taxonomy, update-taxonomy, and delete-taxonomy actions.' ),
			taxonomy: ACFTaxonomySchema.optional()
				.describe( 'The taxonomy configuration object with labels, object types, and behavior settings. Required for create-taxonomy and update-taxonomy actions.' ),
			confirmationMessage: z.string().optional()
				.describe( 'A clear explanation of what will be deleted and its impact (shown to user before delete operations). Example: "You\'re about to permanently delete the \'Product Categories\' taxonomy. All existing category assignments will be lost. This cannot be undone."' ),
		},
		{
			title: 'Manage ACF Taxonomies',
		},
		async ( params: TaxonomyToolParams ): Promise<McpToolResult> => {
			try {
				switch ( params.action ) {
				case 'get-taxonomies':
					return await handleGetTaxonomies();
				case 'get-taxonomy':
					return await handleGetTaxonomy( params );
				case 'create-taxonomy':
					return await handleCreateTaxonomy( params );
				case 'update-taxonomy':
					return await handleUpdateTaxonomy( params );
				case 'delete-taxonomy':
					return await handleDeleteTaxonomy( params );
				default:
					throw new Error( `Unknown taxonomy action: ${ params.action }` );
				}
			} catch ( error ) {
				return {
					content: [ {
						type: 'text',
						text: `Error performing taxonomy operation: ${ ( error as Error ).message }`,
					} ],
				};
			}
		}
	);
}

// Field Groups handlers
async function handleGetFieldGroups(): Promise<McpToolResult> {
	const fieldGroups = await callAcfApi( 'field-groups', 'GET' );
	return {
		content: [ {
			type: 'text',
			text: JSON.stringify( fieldGroups, null, 2 ),
		} ],
	};
}

async function handleGetFieldGroup( params: GroupToolParams ): Promise<McpToolResult> {
	if ( ! params.groupId ) {
		throw new Error( 'groupId is required for get-field-group action' );
	}

	const fieldGroup = await callAcfApi( `field-groups/${ params.groupId }`, 'GET' );
	return {
		content: [ {
			type: 'text',
			text: JSON.stringify( fieldGroup, null, 2 ),
		} ],
	};
}

async function handleCreateFieldGroup( params: GroupToolParams ): Promise<McpToolResult> {
	if ( ! params.fieldGroup ) {
		throw new Error( 'fieldGroup is required for create-field-group action' );
	}

	const result = await callAcfApi( 'field-groups', 'POST', params.fieldGroup as Record<string, unknown> );
	const fieldGroupData = params.fieldGroup as { title: string };
	return {
		content: [ {
			type: 'text',
			text: `Field group "${ fieldGroupData.title }" created successfully. ID: ${ result.key || result.id }`,
		} ],
	};
}

async function handleUpdateFieldGroup( params: GroupToolParams ): Promise<McpToolResult> {
	if ( ! params.groupId || ! params.fieldGroup ) {
		throw new Error( 'groupId and fieldGroup are required for update-field-group action' );
	}

	await callAcfApi( `field-groups/${ params.groupId }`, 'PUT', params.fieldGroup as Record<string, unknown> );
	const fieldGroupData = params.fieldGroup as { title: string };
	return {
		content: [ {
			type: 'text',
			text: `Field group "${ fieldGroupData.title }" updated successfully.`,
		} ],
	};
}

async function handleDeleteFieldGroup( params: GroupToolParams ): Promise<McpToolResult> {
	if ( ! params.groupId ) {
		throw new Error( 'groupId is required for delete-field-group action' );
	}

	await callAcfApi( `field-groups/${ params.groupId }`, 'DELETE' );
	return {
		content: [ {
			type: 'text',
			text: `Field group ${ params.groupId } deleted successfully.`,
		} ],
	};
}

// Fields handlers
async function handleGetFields(): Promise<McpToolResult> {
	const fields = await callAcfApi( 'fields', 'GET' );
	return {
		content: [ {
			type: 'text',
			text: JSON.stringify( fields, null, 2 ),
		} ],
	};
}

async function handleGetField( params: FieldToolParams ): Promise<McpToolResult> {
	if ( ! params.fieldId ) {
		throw new Error( 'fieldId is required for get-field action' );
	}

	const field = await callAcfApi( `fields/${ params.fieldId }`, 'GET' );
	return {
		content: [ {
			type: 'text',
			text: JSON.stringify( field, null, 2 ),
		} ],
	};
}

async function handleCreateField( params: FieldToolParams ): Promise<McpToolResult> {
	if ( ! params.field || ! params.parentId ) {
		throw new Error( 'field and parentId are required for create-field action' );
	}

	// Ensure the parent ID is set in the field
	const fieldWithParent = { ...( params.field as Record<string, unknown> ), parent: params.parentId };

	const result = await callAcfApi( 'fields', 'POST', fieldWithParent as Record<string, unknown> );
	const fieldData = params.field as { label: string };
	return {
		content: [ {
			type: 'text',
			text: `Field "${ fieldData.label }" created successfully. ID: ${ result.key || result.id }`,
		} ],
	};
}

async function handleUpdateField( params: FieldToolParams ): Promise<McpToolResult> {
	if ( ! params.fieldId || ! params.field ) {
		throw new Error( 'fieldId and field are required for update-field action' );
	}

	await callAcfApi( `fields/${ params.fieldId }`, 'PUT', params.field as Record<string, unknown> );
	const fieldData = params.field as { label: string };
	return {
		content: [ {
			type: 'text',
			text: `Field "${ fieldData.label }" updated successfully.`,
		} ],
	};
}

async function handleDeleteField( params: FieldToolParams ): Promise<McpToolResult> {
	if ( ! params.fieldId ) {
		throw new Error( 'fieldId is required for delete-field action' );
	}

	await callAcfApi( `fields/${ params.fieldId }`, 'DELETE' );
	return {
		content: [ {
			type: 'text',
			text: `Field ${ params.fieldId } deleted successfully.`,
		} ],
	};
}

// Post Types handlers
async function handleGetPostTypes(): Promise<McpToolResult> {
	const postTypes = await callAcfApi( 'post-types', 'GET' );
	return {
		content: [ {
			type: 'text',
			text: JSON.stringify( postTypes, null, 2 ),
		} ],
	};
}

async function handleGetPostType( params: PostTypeToolParams ): Promise<McpToolResult> {
	if ( ! params.postType ) {
		throw new Error( 'postType is required for get-post-type action' );
	}

	const postTypeData = await callAcfApi( `post-types/${ params.postType }`, 'GET' );
	return {
		content: [ {
			type: 'text',
			text: JSON.stringify( postTypeData, null, 2 ),
		} ],
	};
}

async function handleCreatePostType( params: PostTypeToolParams ): Promise<McpToolResult> {
	if ( ! params.postTypeConfig ) {
		throw new Error( 'postTypeConfig is required for create-post-type action' );
	}

	await callAcfApi( 'post-types', 'POST', params.postTypeConfig as Record<string, unknown> );
	const postTypeData = params.postTypeConfig as { title: string; post_type: string };
	return {
		content: [ {
			type: 'text',
			text: `Post type "${ postTypeData.title }" (${ postTypeData.post_type }) created successfully.`,
		} ],
	};
}

async function handleUpdatePostType( params: PostTypeToolParams ): Promise<McpToolResult> {
	if ( ! params.postType || ! params.postTypeConfig ) {
		throw new Error( 'postType and postTypeConfig are required for update-post-type action' );
	}

	await callAcfApi( `post-types/${ params.postType }`, 'PUT', params.postTypeConfig as Record<string, unknown> );
	const postTypeData = params.postTypeConfig as { title: string };
	return {
		content: [ {
			type: 'text',
			text: `Post type "${ postTypeData.title }" updated successfully.`,
		} ],
	};
}

async function handleDeletePostType( params: PostTypeToolParams ): Promise<McpToolResult> {
	if ( ! params.postType ) {
		throw new Error( 'postType is required for delete-post-type action' );
	}

	await callAcfApi( `post-types/${ params.postType }`, 'DELETE' );
	return {
		content: [ {
			type: 'text',
			text: `Post type ${ params.postType } deleted successfully.`,
		} ],
	};
}

// Taxonomies handlers
async function handleGetTaxonomies(): Promise<McpToolResult> {
	const taxonomies = await callAcfApi( 'taxonomies', 'GET' );
	return {
		content: [ {
			type: 'text',
			text: JSON.stringify( taxonomies, null, 2 ),
		} ],
	};
}

async function handleGetTaxonomy( params: TaxonomyToolParams ): Promise<McpToolResult> {
	if ( ! params.taxonomyId ) {
		throw new Error( 'taxonomyId is required for get-taxonomy action' );
	}

	const taxonomy = await callAcfApi( `taxonomies/${ params.taxonomyId }`, 'GET' );
	return {
		content: [ {
			type: 'text',
			text: JSON.stringify( taxonomy, null, 2 ),
		} ],
	};
}

async function handleCreateTaxonomy( params: TaxonomyToolParams ): Promise<McpToolResult> {
	if ( ! params.taxonomy ) {
		throw new Error( 'taxonomy is required for create-taxonomy action' );
	}

	await callAcfApi( 'taxonomies', 'POST', params.taxonomy as Record<string, unknown> );
	const taxonomyData = params.taxonomy as { label: string; taxonomy: string };
	return {
		content: [ {
			type: 'text',
			text: `Taxonomy "${ taxonomyData.label }" (${ taxonomyData.taxonomy }) created successfully.`,
		} ],
	};
}

async function handleUpdateTaxonomy( params: TaxonomyToolParams ): Promise<McpToolResult> {
	if ( ! params.taxonomyId || ! params.taxonomy ) {
		throw new Error( 'taxonomyId and taxonomy are required for update-taxonomy action' );
	}

	await callAcfApi( `taxonomies/${ params.taxonomyId }`, 'PUT', params.taxonomy as Record<string, unknown> );
	const taxonomyData = params.taxonomy as { label: string };
	return {
		content: [ {
			type: 'text',
			text: `Taxonomy "${ taxonomyData.label }" updated successfully.`,
		} ],
	};
}

async function handleDeleteTaxonomy( params: TaxonomyToolParams ): Promise<McpToolResult> {
	if ( ! params.taxonomyId ) {
		throw new Error( 'taxonomyId is required for delete-taxonomy action' );
	}

	await callAcfApi( `taxonomies/${ params.taxonomyId }`, 'DELETE' );
	return {
		content: [ {
			type: 'text',
			text: `Taxonomy ${ params.taxonomyId } deleted successfully.`,
		} ],
	};
}

async function handleSuggestFieldStructure( params: GroupToolParams ): Promise<McpToolResult> {
	if ( ! params.postType || ! params.purpose ) {
		throw new Error( 'postType and purpose are required for suggest-field-structure action' );
	}

	// This would be where AI-generated suggestions would happen
	// For now, we'll return pre-defined structures for common post types

	let suggestedStructure;

	switch ( ( params.postType as string ).toLowerCase() ) {
	case 'course':
		suggestedStructure = {
			title: 'Course Details',
			fields: [
				{ label: 'Duration', name: 'duration', type: 'text', instructions: 'Course duration (e.g., "8 weeks")' },
				{ label: 'Difficulty Level', name: 'difficulty_level', type: 'select', choices: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' } },
				{ label: 'Prerequisites', name: 'prerequisites', type: 'textarea' },
				{ label: 'Instructor', name: 'instructor', type: 'text' },
				{ label: 'Start Date', name: 'start_date', type: 'date_picker' },
				{ label: 'Syllabus', name: 'syllabus', type: 'wysiwyg' },
			],
			location: [
				[ { param: 'post_type', operator: '==', value: 'course' } ],
			],
		};
		break;

	case 'product':
		suggestedStructure = {
			title: 'Product Information',
			fields: [
				{ label: 'Price', name: 'price', type: 'number', instructions: 'Product price in $' },
				{ label: 'Sale Price', name: 'sale_price', type: 'number', instructions: 'Sale price (if applicable)' },
				{ label: 'SKU', name: 'sku', type: 'text' },
				{ label: 'Weight', name: 'weight', type: 'number' },
				{ label: 'Dimensions', name: 'dimensions', type: 'group', sub_fields: [
					{ label: 'Length', name: 'length', type: 'number' },
					{ label: 'Width', name: 'width', type: 'number' },
					{ label: 'Height', name: 'height', type: 'number' },
				] },
				{ label: 'Features', name: 'features', type: 'repeater', sub_fields: [
					{ label: 'Feature', name: 'feature', type: 'text' },
				] },
			],
			location: [
				[ { param: 'post_type', operator: '==', value: 'product' } ],
			],
		};
		break;

	case 'event':
		suggestedStructure = {
			title: 'Event Details',
			fields: [
				{ label: 'Start Date/Time', name: 'start_datetime', type: 'date_time_picker' },
				{ label: 'End Date/Time', name: 'end_datetime', type: 'date_time_picker' },
				{ label: 'Location', name: 'location', type: 'text' },
				{ label: 'Address', name: 'address', type: 'textarea' },
				{ label: 'Map', name: 'map', type: 'google_map' },
				{ label: 'Organizer', name: 'organizer', type: 'text' },
				{ label: 'Cost', name: 'cost', type: 'number' },
				{ label: 'Registration Link', name: 'registration_link', type: 'url' },
			],
			location: [
				[ { param: 'post_type', operator: '==', value: 'event' } ],
			],
		};
		break;

	default:
		suggestedStructure = {
			title: `${ ( params.postType as string ).charAt( 0 ).toUpperCase() + ( params.postType as string ).slice( 1 ) } Details`,
			fields: [
				{ label: 'Additional Information', name: 'additional_information', type: 'wysiwyg' },
			],
			location: [
				[ { param: 'post_type', operator: '==', value: params.postType } ],
			],
		};
	}

	return {
		content: [ {
			type: 'text',
			text: `Suggested field structure for "${ params.postType }" post type:\n\n${ JSON.stringify( suggestedStructure, null, 2 ) }`,
		} ],
	};
}
