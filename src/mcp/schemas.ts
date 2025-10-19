import { z } from 'zod';

// Field type for recursive definition
type ACFField = {
	key?: string;
	label: string;
	name: string;
	type: string;
	instructions?: string;
	required?: 0 | 1 | boolean;
	default_value?: unknown;
	placeholder?: string;
	prepend?: string;
	append?: string;
	parent?: string;
	choices?: Record<string, string>;
	min?: number;
	max?: number;
	step?: number;
	multiple?: boolean;
	allow_null?: boolean;
	return_format?: string;
	sub_fields?: ACFField[];
	layouts?: Array<{
		key?: string;
		name: string;
		label: string;
		display?: string;
		sub_fields: ACFField[];
	}>;
	library?: string;
	mime_types?: string;
	center_lat?: number;
	center_lng?: number;
	zoom?: number;
	height?: number;
	media_upload?: boolean;
	delay?: number;
	ui?: boolean;
	ui_on_text?: string;
	ui_off_text?: string;
	date_format?: string;
	time_format?: string;
	week_starts_on?: number;
	[key: string]: unknown;
};

export const ACFFieldSchema: z.ZodType<ACFField> = z.object( {
	key: z.string().optional(),
	label: z.string(),
	name: z.string(),
	type: z.string(),
	instructions: z.string().optional(),
	required: z.union( [ z.literal( 0 ), z.literal( 1 ), z.boolean() ] ).optional(),
	default_value: z.any().optional(),
	placeholder: z.string().optional(),
	prepend: z.string().optional(),
	append: z.string().optional(),
	parent: z.string().optional(),
	// Extended field type specific properties
	choices: z.record( z.string(), z.string() ).optional(), // For select, checkbox, radio
	min: z.number().optional(), // For repeaters, number fields
	max: z.number().optional(), // For repeaters, number fields
	step: z.number().optional(), // For number fields
	multiple: z.boolean().optional(), // For select fields
	allow_null: z.boolean().optional(), // For relationship fields, select fields
	return_format: z.string().optional(), // For image, file fields
	sub_fields: z.array( z.lazy( () => ACFFieldSchema ) ).optional(), // For repeater, group fields
	layouts: z.array( z.object( {
		key: z.string().optional(),
		name: z.string(),
		label: z.string(),
		display: z.string().optional(),
		sub_fields: z.array( z.lazy( () => ACFFieldSchema ) ),
	} ) ).optional(), // For flexible content fields
	library: z.string().optional(), // For image fields
	mime_types: z.string().optional(), // For file, image fields
	center_lat: z.number().optional(), // For Google Maps
	center_lng: z.number().optional(), // For Google Maps
	zoom: z.number().optional(), // For Google Maps
	height: z.number().optional(), // For WYSIWYG fields
	media_upload: z.boolean().optional(), // For WYSIWYG fields
	delay: z.number().optional(), // For true/false fields
	ui: z.boolean().optional(), // For true/false fields
	ui_on_text: z.string().optional(), // For true/false fields
	ui_off_text: z.string().optional(), // For true/false fields
	date_format: z.string().optional(), // For date picker
	time_format: z.string().optional(), // For time picker
	week_starts_on: z.number().optional(), // For date picker
} ).catchall( z.any() ); // Allow other custom properties

// Field Group schemas
export const ACFFieldGroupSchema = z.object( {
	key: z.string().optional(),
	title: z.string(),
	fields: z.array( ACFFieldSchema ).optional(),
	location: z.array( z.array( z.object( {
		param: z.string(),
		operator: z.string(),
		value: z.string(),
	} ) ) ).optional(),
	menu_order: z.number().optional(),
	position: z.string().optional(),
	style: z.string().optional(),
	label_placement: z.string().optional(),
	instruction_placement: z.string().optional(),
	hide_on_screen: z.array( z.string() ).optional(),
	active: z.boolean().optional(),
	description: z.string().optional(),
	show_in_rest: z.boolean().optional(),
	acfe_display_title: z.string().optional(), // ACF Extended support
	acfe_autosync: z.array( z.string() ).optional(), // ACF Extended support
	acfe_permissions: z.array( z.string() ).optional(), // ACF Extended support
	acfe_form: z.boolean().optional(), // ACF Extended support
	acfe_meta: z.record( z.string(), z.any() ).optional(), // ACF Extended support
	acfe_note: z.string().optional(), // ACF Extended support
} ).catchall( z.any() );

// Post Type schemas
const ACFPostTypeLabelsSchema = z.object( {
	name: z.string(),
	singular_name: z.string(),
} );

export const ACFPostTypeSchema = z.object( {
	post_type: z.string(),
	title: z.string(),
	labels: ACFPostTypeLabelsSchema.required(),
	description: z.string().optional(),
	supports: z.array( z.string() ).optional(),
	hierarchical: z.boolean().optional(),
	public: z.boolean().optional(),
	show_ui: z.boolean().optional(),
	show_in_menu: z.boolean().optional(),
	menu_position: z.number().optional(),
	menu_icon: z.string().optional(),
	show_in_nav_menus: z.boolean().optional(),
	publicly_queryable: z.boolean().optional(),
	exclude_from_search: z.boolean().optional(),
	has_archive: z.boolean().optional(),
	query_var: z.union( [ z.boolean(), z.string() ] ).optional(),
	can_export: z.boolean().optional(),
	delete_with_user: z.boolean().optional(),
	show_in_rest: z.boolean().optional(),
	rest_base: z.string().optional(),
	rest_controller_class: z.string().optional(),
	map_meta_cap: z.boolean().optional(),
	capability_type: z.string().optional(),
	capabilities: z.record( z.string(), z.string() ).optional(),
	rewrite: z.union( [
		z.boolean(),
		z.object( {
			slug: z.string().optional(),
			with_front: z.boolean().optional(),
			feeds: z.boolean().optional(),
			pages: z.boolean().optional(),
			ep_mask: z.number().optional(),
		} ),
	] ).optional(),
	taxonomies: z.array( z.string() ).optional(),
} ).catchall( z.any() );

// Taxonomy schemas
export const ACFTaxonomySchema = z.object( {
	taxonomy: z.string(),
	object_type: z.array( z.string() ),
	label: z.string(),
	labels: z.object( {
		name: z.string(),
		singular_name: z.string(),
	} ),
	description: z.string().optional(),
	hierarchical: z.boolean().optional(),
	public: z.boolean().optional(),
	publicly_queryable: z.boolean().optional(),
	show_ui: z.boolean().optional(),
	show_in_menu: z.boolean().optional(),
	show_in_nav_menus: z.boolean().optional(),
	show_tagcloud: z.boolean().optional(),
	show_in_quick_edit: z.boolean().optional(),
	show_admin_column: z.boolean().optional(),
	meta_box_cb: z.union( [ z.string(), z.boolean() ] ).optional(),
	meta_box_sanitize_cb: z.string().optional(),
	capabilities: z.record( z.string(), z.string() ).optional(),
	show_in_rest: z.boolean().optional(),
	rest_base: z.string().optional(),
	rest_controller_class: z.string().optional(),
	rewrite: z.union( [
		z.boolean(),
		z.object( {
			slug: z.string().optional(),
			with_front: z.boolean().optional(),
			hierarchical: z.boolean().optional(),
			ep_mask: z.number().optional(),
		} ),
	] ).optional(),
	update_count_callback: z.string().optional(),
	default_term: z.union( [
		z.string(),
		z.object( {
			name: z.string().optional(),
			slug: z.string().optional(),
			description: z.string().optional(),
		} ),
	] ).optional(),
	sort: z.boolean().optional(),
} ).catchall( z.any() );
