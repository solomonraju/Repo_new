/**
 * The DropShadow effect drops a shadow off the selected items. It can be run
 * with an XMLtoUI parameter panel, or with a SWF parameter panel. It is currently 
 * in SWF mode. To use the XMLtoUI panel, uncomment the "forward(...)" line below.
 *
 * @author Andrew Guldman, Fluid Inc
 */
 
/**
 * Configure the effect. Create any necessary shared functions.
 */
function configureEffect()
{
	// Load shared functions
	// The runScript path is relative to the Commands directory.
	// shared.jsfl is in the Effects directory
	//fl.trace("shared.jsfl path="+ fl.configURI + "Effects/shared.jsfl");
//	fl.runScript(fl.configURI + "Effects/shared.jsfl");
	//fl.trace("configureEffect(dropshadow)");
}


/**
 * Remove the effect.
 */
function removeEffect()
{
	reverse();
}

/**
 * Perform the effect. Don't do anything.
 */
function executeEffect()
{
	var ef = fl.activeEffect;
	forward( false, ef.color, ef.alpha, ef.xOffset, ef.yOffset );
}

/**
 * Implementation of the drop shadow effect. This could be called from
 * the effect file or from the preview.
 *
 * @param preview Boolean: True to create a preview swf.
 * @param color Numeric RGB value
 * @param alpha Numeric alpha (0-100)
 * @param xOffset Number of pixels to move in x direction
 * @param yOffset Number of pixels to move in y direction
 */
function forward(preview, color, alpha, xOffset, yOffset)
{
	try
	{
		doAlert( "forward" );

		// initialize
		fl.enableImmediateUpdates( true );
		fl.runScript(fl.configURI + "Effects/shared.jsfl");
		
		// Shorthand variables
		var dom = fl.getDocumentDOM();
		
		// edit the symbol
		dom.enterEditMode("inPlace");
		
		// convert the shape into specified type
		var libName = Object.fxutil.generateLibName();
		Object.fxutil.myTrace(1, "libName=" + libName);
		var mySymbolName = dom.convertToSymbol("graphic", libName, "top left"); 
		Object.fxutil.moveToEffectsFolder(mySymbolName.name);

		// Copy the selected symbol instance immediately, before monkeying with
		// layers, etc.
		dom.clipCopy();
		
		// Now select none to facilitate layer manipulation.
		// This is important -- the new layer can't be selected if there is
		// an active selection in the old layer.
		dom.selectNone();
		
		// Put the copies on a new layer. This will make it easier
		// to remove the effect later if necessary.
		var tl = dom.getTimeline();
		var mainLayerName = tl.getLayerProperty("name")
		var layerIx = tl.addNewLayer(mainLayerName + " Copy", "normal", false);
		var newLayer = tl.layers[layerIx];
		newLayer.effectLayer = true;
		tl.setSelectedLayers(layerIx, true);
		tl.currentLayer = layerIx;
		Object.fxutil.myTrace(1, "active layer: current=" + tl.currentLayer + ", selected=[" + tl.getSelectedLayers() + "]");
		
		// Paste the copy in place onto the new layer
		dom.clipPaste(true);
		
		// Move the copy
		dom.moveSelectionBy({x:xOffset, y:yOffset});
		var shadow = dom.selection[0];
		
		// Change the color of the copy
		shadow.colorMode = "advanced";
		shadow.colorRedPercent = 0;
		shadow.colorGreenPercent = 0;
		shadow.colorBluePercent = 0;
		shadow.colorRedAmount = ((color & 0xff0000) >> 16);
		shadow.colorGreenAmount = ((color & 0x00ff00) >> 8);
		shadow.colorBlueAmount = (color & 0x0000ff);
		
		// Set the alpha of the copy
		shadow.colorAlphaAmount = 0;
		shadow.colorAlphaPercent = alpha;
		
		// Make sure that the symbol is not interactive. This doesn't work.
		dom.exitEditMode();
		
		if (preview)
		{
			// Export the preview swf
			Object.fxutil.exportPreviewSWF( dom.selection[0] );
		}
	}
	catch (e)
	{
		fl.trace("Exception in forward: " + e);
	}
}


/**
 * Remove the effect.
 */
function reverse()
{
	try
	{
		doAlert( "reverse" );

		fl.runScript(fl.configURI + "Effects/shared.jsfl");
		Object.fxutil.myTrace(1, "CopyToGrid: reverse: start");

		// Shorthand variables
		var dom = fl.getDocumentDOM();
		
		// Get the name of the main lib item to delete it from the library
		var mainLibItem = dom.selection[0].libraryItem;
		
		// edit the symbol
		dom.enterEditMode("inPlace");
		
		// Delete layer 2. It contains the copy.
		var tl = dom.getTimeline();
		tl.deleteLayer(1);
		
		// Break apart the symbol instance on layer 1
		tl.currentLayer = 0;
		tl.currentFrame = 1;
		dom.selectAll();
		
		// Get the name of the library symbol so we can delete it after 
		// we break it apart
		var libItem = dom.selection[0].libraryItem;
		dom.breakApart();
		var libName = libItem.name;
		dom.library.deleteItem(libName);
		
		// go back to the main timeline
		dom.exitEditMode();
		
		// delete the folder if it is empty
		if (Object.fxutil.folderIsEmpty())
		{
			doAlert( "deleting effects folder" );
			fl.getDocumentDOM().library.deleteItem( Object.fxutil.getEffectsFolderName() );
		}
	}
	catch (e)
	{
		fl.trace("Exception in reverse: " + e);
	}
}


function doAlert( str )
{
	//alert( str );
}


