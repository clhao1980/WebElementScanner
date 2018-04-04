/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license

Portions Copyright IBM Corp., 2009-2017.
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
	config.plugins =
		'a11yhelp,' +
		'basicstyles,' +
		'bidi,' +
		'blockquote,' +
		'clipboard,' +
		'colorbutton,' +
		'colordialog,' +
		'contextmenu,' +
		'copyformatting,' +
		'dialogadvtab,' +
		// 'elementspath,' +
		'enterkey,' +
		'entities,' +
		'find,' +
		'flash,' +
		'floatingspace,' +
		'font,' +
		'format,' +
		'horizontalrule,' +
		'htmlwriter,' +
		// 'image,' +
		// 'iframe,' +
		'indentlist,' +
		'indentblock,' +
		'justify,' +
		// 'keyboardtooltip,' +
		'language,' +
		'link,' +
		'list,' +
		'liststyle,' +
		// 'magicline,' +
		'maximize,' +
		'newpage,' +
		'pagebreak,' +
		'pastefromword,' +
		'pastetext,' +
		'preview,' +
		'print,' +
		'removeformat,' +
		'save,' +
		'selectall,' +
		'showblocks,' +
		'showborders,' +
		'sourcearea,' +
		'specialchar,' +
		'stylescombo,' +
		'tab,' +
		'table,' +
		'tabletools,' +
		'templates,' +
		'toolbar,' +
		'undo,' +
		'wysiwygarea' +

		//add some extra core plugins
		',tableresize,' +
		// 'autogrow,' +

		//ibm extension plugins
		// 'ibmcustomdialogs,' +
		// 'ibmtoolbars,' +
		// 'ibmurllink,' +
		// 'ibmstatusmessage,' +
		// 'ibmbidi,' +
		// 'ibmpastenotesdatalink,' +
		// 'ibmpastevideo,' +
		// 'ibmpasteiframe,' +
		// 'ibmtabletools,' +
		// 'ibmimagedatauri,' +
		// 'ibmmenuhelpmessage,' +
		// 'ibmlanguagedropdown,' +
		// 'ibmcharactercounter,' +
		// 'ibmbinaryimagehandler,' +
		// 'ibmajax,' +
		// 'ibmpermanentpen,'+
		// 'ibmhtml5player,'+

		//insert media plugins
		// 'ibmwidgets,'+
		// 'embed,'+
		// 'embedbase,'+
		// 'ibminsertmedia,'+
		// 'ibmpastemedialink,'+

		//ibmsametimeemoticons should be configured before smiley so that config.smiley_path is set to use ibmsametimeemoticons/images by default rather than cksource smiley/images
		'ibmsametimeemoticons,' +
		'smiley'
		;
	config.dialog_backgroundCoverColor = 'black';
	config.dialog_backgroundCoverOpacity = 0.3;
    config.fontSize_defaultLabel = '12px';
    config.font_defaultLabel = 'Arial';
	config.skin = 'ibmdesign';
	config.dialog_startupFocusTab = true;
	config.colorButton_enableMore = false;
	config.resize_enabled = false;
	config.toolbarCanCollapse = false;
	config.disableNativeSpellChecker = false;
	// config.forceEnterMode = true;
    config.enterMode = CKEDITOR.ENTER_DIV;
	config.useComputedState = true;
	config.ignoreEmptyParagraph = true;
	config.autoGrow_onStartup = false;
	config.ibmFloatToolbar = true;
	config.ibmFilterPastedDataUriImage = true;
	// config.magicline_color = 'blue';
	// config.magicline_everywhere = false;
	config.removeDialogTabs = 'flash:advanced;image:advanced;';
	config.displayContextMenuHelpMessage = false;
	config.enableTableSort = false;
	config.ibmBinaryImageUploadUrl='';
    config.ibmBinaryImageUploadUrlTimeout=20000;
    config.ibmBinaryImageUploadImageMaxSizeLimit=15;	//in MB
    config.ibmPermanentpenCookies = true;
    config.ibmDisableDraggableWidgets = true;
    config.title = false; // disable tooltip


	//add a border to the default styling for find_highlight (specified in plugins/find/plugin.js) so that found text is also visibly highlighted in high contrast mode
	config.find_highlight = { element : 'span', styles : { 'background-color' : '#004', 'color' : '#fff', 'border' : '1px solid #004' } };

	// Paste from Word (Paste Special) configuration
	config.pasteFromWordRemoveFontStyles = false;
	config.pasteFromWordRemoveStyles = false;

	// Disable Outer Cursor for Copy Formatting
	config.copyFormatting_outerCursor = false;

	//enable the svg icons
	config.ibmEnableSvgIcons = true;

	//allowed domains for the oembed plugin
	config.ibmPasteMediaLink= {
			allowed_domains : ['youtube.com','youtu.be','vimeo.com']
	};

	config.embed_provider = window.location.origin+'/connections/opengraph/api/oembed?url={url}&extended=true';

	//table boarder collapse
	config.ibmModernTable = {
		enable : true, 	// Enable the style at Insert only
		enforceStyle : false 	// Enforces the styles for all tables present and already loaded in the editor.
	};

	//Convert links as you type
	config.ibmAutoConvertUrls = true;

	//ACF configs
	// config.allowedContent = true;			//turn off ACF by default
    config.disallowedContent = 'img';

	//Disable new color palette
	config.colorButton_colorsPerRow = 8;
    config.colorButton_colors = '000,800000,8B4513,2F4F4F,008080,000080,4B0082,696969,' +
    'B22222,A52A2A,DAA520,006400,40E0D0,0000CD,800080,808080,' +
    'F00,FF8C00,FFD700,008000,0FF,00F,EE82EE,A9A9A9,' +
    'FFA07A,FFA500,FFFF00,00FF00,AFEEEE,ADD8E6,DDA0DD,D3D3D3,' +
    'FFF0F5,FAEBD7,FFFFE0,F0FFF0,F0FFFF,F0F8FF,E6E6FA,FFF';

    config.format_h1 = { element: 'h1', attributes: { 'style': 'line-height:normal;' } };
    config.format_h2 = { element: 'h2', attributes: { 'style': 'line-height:normal;' } };
    config.format_h3 = { element: 'h3', attributes: { 'style': 'line-height:normal;' } };
    config.format_p = { element: 'p', attributes: { 'style': 'line-height:normal;' } };
    config.format_pre = { element: 'pre', attributes: { 'style': 'line-height:normal;' } };
    config.format_div = { element: 'div', attributes: { 'style': 'line-height:normal;' } };

    config.toolbar_Medium = [
        { name: 'edit',      items :['Undo','Redo']},
        { name: 'paragraph', items :['Format','Font','FontSize']},
        { name: 'styles',    items :['Bold','Italic','Underline','Strike','TextColor','BGColor','RemoveFormat','NumberedList','BulletedList','Indent','Outdent']}
    ];

	// See the release notes for how to add a custom link dialog to the MenuLink button menu.
	config.menus =
	{
		/* Create a menu called MenuLink containing menu items for the urllink and bookmarks commands.
		   Include 'MenuLink' in the toolbar definition to see this menu in the editor*/
		// link :
		// {
		// 	buttonClass : 'cke_button_link',
		// 	commands : ['link', 'bookmark'],
		// 	toolbar: 'insert,30'
		// },


		// Create a menu called MenuPaste containing menu items for the specified commands.
		paste :
		{
			buttonClass : 'cke_button_pastetext',
			groupName : 'clipboard',
			commands : ['paste', 'pastetext'],
			toolbar: 'editing,0'
			// label will default to editor.lang.ibm.menu.paste
		}
	};
};
CKEDITOR.on('instanceReady', function (ev) {
    var el = ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'pre'];
    el.forEach(function(v) {
        ev.editor.dataProcessor.writer.setRules(v,
            {
                indent: false,
                breakBeforeOpen: false,
                breakAfterOpen: false,
                breakBeforeClose: false,
                breakAfterClose: true
            });
    });
});
