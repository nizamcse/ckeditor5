/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, Event */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import KeyObserver from '@ckeditor/ckeditor5-engine/src/view/observer/keyobserver';

import { toWidget } from '../src/utils';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'Widget - Events', () => {
	const EVENT_NAME = 'keyup';
	let editor, editorElement, fakeEventCallback, buttonIgnored, buttonRegular;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = createEditorElement();
		editor = await createEditor( editorElement );

		setModelData( editor.model, '[<simpleWidgetElement></simpleWidgetElement>]' );
	} );

	afterEach( () => {
		editorElement.remove();

		if ( editor ) {
			return editor.destroy();
		}
	} );

	it( 'should not ignore events from child inside parent without the `data-cke-ignore-events` attribute', () => {
		buttonRegular.dispatchEvent( new Event( EVENT_NAME, { bubbles: true } ) );

		expect( fakeEventCallback.callCount ).to.equal( 1 );
	} );

	it( 'should ignore events from child inside parent with the `data-cke-ignore-events` attribute', () => {
		buttonIgnored.dispatchEvent( new Event( EVENT_NAME, { bubbles: true } ) );

		expect( fakeEventCallback.callCount ).to.equal( 0 );
	} );

	function createEditorElement() {
		const element = document.createElement( 'div' );
		document.body.appendChild( element );
		return element;
	}

	function createEditor( element ) {
		return ClassicEditor
			.create( element, {	plugins: [ simpleWidgetPlugin ]	} )
			.then( editor => {
				const view = editor.editing.view;
				const container = Array
					.from( view.document.getRoot().getChildren() )
					.find( element => element.hasClass( 'simple-widget-container' ) );
				const domFragment = view.domConverter.viewToDom( container );

				buttonIgnored = domFragment.querySelector( '#ignored-button' );
				buttonRegular = domFragment.querySelector( '#regular-button' );
			} );
	}

	function simpleWidgetPlugin( editor ) {
		defineSchema( editor );
		defineConverters( editor );
		addObserver( editor );

		function defineSchema( editor ) {
			editor.model.schema.register( 'simpleWidgetElement', {
				inheritAllFrom: '$block',
				isObject: true
			} );
		}

		function defineConverters( editor ) {
			editor.conversion.for( 'editingDowncast' )
				.elementToElement( {
					model: 'simpleWidgetElement',
					view: ( modelElement, { writer } ) => {
						const widgetElement = createWidgetView( modelElement, { writer } );

						return toWidget( widgetElement, writer );
					}
				} );

			editor.conversion.for( 'dataDowncast' )
				.elementToElement( {
					model: 'simpleWidgetElement',
					view: createWidgetView
				} );

			editor.conversion.for( 'upcast' )
				.elementToElement( {
					model: 'simpleWidgetElement',
					view: {
						name: 'section',
						classes: 'simple-widget-container'
					}
				} );

			function createWidgetView( modelElement, { writer } ) {
				const simpleWidgetContainer = writer.createContainerElement( 'section', { class: 'simple-widget-container' } );
				const simpleWidgetElement = writer.createRawElement( 'div', { class: 'simple-widget-element' }, domElement => {
					domElement.innerHTML = `
						<div data-cke-ignore-events="true">
							<button id="ignored-button">Click!</button>
						</div>
						<div>
							<button id="regular-button">Click!</button>
						</div>
					`;
				} );

				writer.insert( writer.createPositionAt( simpleWidgetContainer, 0 ), simpleWidgetElement );

				return simpleWidgetContainer;
			}
		}

		function addObserver( editor ) {
			fakeEventCallback = sinon.fake();

			editor.editing.view.addObserver( KeyObserver );
			editor.editing.view.document.on( EVENT_NAME, fakeEventCallback );
		}
	}
} );
