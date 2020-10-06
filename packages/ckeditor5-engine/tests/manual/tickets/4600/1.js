/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, document, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

class WidgetEditing extends Plugin {
	init() {
		console.log( 'WidgetEditing#init() got called' );
		this._defineSchema();
		this._defineConverters();
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'widgetElement', {
			isObject: true,
			allowWhere: '$block'
		} );

		schema.register( 'ignoredContainer', {
			isLimit: true,
			allowIn: 'widgetElement',
			allowContentOf: '$root'
		} );

		schema.register( 'regularContainer', {
			isLimit: true,
			allowIn: 'widgetElement',
			allowContentOf: '$root'
		} );
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.elementToElement( {
			model: 'widgetElement',
			view: {
				name: 'section',
				classes: 'widget-element'
			}
		} );

		conversion.elementToElement( {
			model: 'ignoredContainer',
			view: {
				name: 'div',
				classes: 'ignored-container'
			}
		} );

		conversion.elementToElement( {
			model: 'regularContainer',
			view: {
				name: 'div',
				classes: 'regular-container'
			}
		} );
	}
}

class WidgetUI extends Plugin {
	init() {
		console.log( 'WidgetUI#init() got called' );
	}
}

class Widget extends Plugin {
	static get requires() {
		return [ WidgetEditing, WidgetUI ];
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Widget ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( error => {
		console.error( error.stack );
	} );
