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
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for( 'downcast' ).elementToElement( {
			model: 'widgetElement',
			view: ( modelElement, { writer } ) => {
				const widgetElement = writer.createContainerElement( 'section', { class: 'widget-element' } );

				const ignoredContainer = writer.createContainerElement( 'div', { class: 'ignored-container' } );
				const ignoredContainerInput = writer.createEmptyElement( 'input', { type: 'text' } );
				const ignoredContainerButton = writer.createElement( 'button' );

				writer.insert( writer.createPositionAt( ignoredContainer, 0 ), ignoredContainerInput );
				writer.insert( writer.createPositionAt( ignoredContainer, 1 ), ignoredContainerButton );

				const regularContainer = writer.createContainerElement( 'div', { class: 'regular-container' } );
				const regularContainerInput = writer.createEmptyElement( 'input', { type: 'text' } );
				const regularContainerButton = writer.createEmptyElement( 'button' );

				writer.insert( writer.createPositionAt( regularContainer, 0 ), regularContainerInput );
				writer.insert( writer.createPositionAt( regularContainer, 1 ), regularContainerButton );

				writer.insert( writer.createPositionAt( widgetElement, 0 ), ignoredContainer );
				writer.insert( writer.createPositionAt( widgetElement, 1 ), regularContainer );

				return widgetElement;
			}
		} );

		conversion.for( 'upcast' ).elementToElement( {
			model: 'widgetElement',
			view: {
				name: 'section',
				classes: 'widget-element'
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
