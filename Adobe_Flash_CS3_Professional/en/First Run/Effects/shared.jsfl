//conforming to live preview requirements

//fl.trace("creating namespace");
Object.fxutil = new Object();

// this is the name of the folder used for all effects
var FOLDER_NAME = "Effects Folder";



Object.fxutil.libCheck = function(libName, libCount) 
{
	var thisName = (libName + libCount);
	var thisNameExists = fl.getDocumentDOM().library.itemExists(thisName);
	if (thisNameExists)
	{
		libCount++;
		Object.fxutil.libCheck(libName, libCount);
	}
	return (libName +  libCount) ;
};


Object.fxutil.folderIsEmpty = function folderIsEmpty()
{
	try
	{
		var lib = fl.getDocumentDOM().library;
		var nItems = lib.items.length;
		if (nItems == 0)  return false;

		// get the index of the folder
		var folderName = Object.fxutil.getEffectsFolderName();
		var indexArray = lib.findItemIndex( folderName );
		if (indexArray.length == 0)  return false;
		var folderIndex = indexArray[0];
		
		var items = lib.items;
		for (var i=0;  i<nItems;  i++)
		{
			var nextName = items[i].name;
			if ((i != folderIndex) && (nextName.indexOf( folderName ) >= 0))
				return false;
		}	
	}
	catch (e)
	{
		fl.trace("Exception in : folderIsEmpty" + e);
	}
	
	return true;
}


//////////////////////////////////////
// Create a safe name that
// will not conflict with anything
// at the top level or the folder
//////////////////////////////////////
Object.fxutil.generateLibName = function generateLibName()
{
	// start with a generic name
	var libName = "effectSymbol";
	
	try
	{
		// get the library for the document
		var cur_lib = fl.getDocumentDOM().library;
		
		// check both the top level and the folder for name collisions
		var folderName = FOLDER_NAME;
		var fullName = folderName + "/" + libName;
		var base = libName;
		var count = 1;
		while (cur_lib.itemExists(fullName) || cur_lib.itemExists(libName))
		{
			libName = base + "_" + count++;
			fullName = folderName + "/" + libName;
		}
	}
	catch (e)
	{
		fl.trace("Exception in generateLibName: " + e);
	}
		
	return libName;
}


Object.fxutil.getEffectsFolderName = function getEffectsFolderName()
{
	return FOLDER_NAME;
}


Object.fxutil.resetSelection = function resetSelection( obj,  frameNum,  layerNum )
{
	try
	{
		fl.getDocumentDOM().getTimeline().currentLayer = layerNum;
		fl.getDocumentDOM().getTimeline().setSelectedFrames(frameNum, frameNum+1, true);
		
		// clear the selection
		fl.getDocumentDOM().selectNone();
		
		// reset the selected object
		var arr = new Array;
		arr[0] = obj;
		fl.getDocumentDOM().selection = arr;
	}
	catch (e)
	{
		fl.trace("Exception in resetSelection: " + e);
	}
}

	
Object.fxutil.getEffectStartFrame = function getEffectStartFrame()
{
	var rtnFrame = 0;
	
	try
	{
		var tmpTL    = fl.getDocumentDOM().getTimeline();
		var tmpLayer = tmpTL.layers[ tmpTL.currentLayer ];
		var tmpFrame = tmpLayer.frames[ tmpTL.currentFrame ];
		rtnFrame = tmpFrame.startFrame;
	}
	catch (e)
	{
		fl.trace("Exception in getEffectStartFrame: " + e);
	}
	
	return rtnFrame;
}




Object.fxutil.sharedFunction = function() 
{
	//fl.trace("inside sharedFunction!");
};

//fl.trace("creating convertBackToForwardSlashes function");
/**
 * This function converts backslashes to forward slashes.
 */
Object.fxutil.convertBackToForwardSlashes = function( path )
{
	var arr = path.split( "\\" );
	var rtnStr = "";
	for (var i=0;  i<arr.length;  i++)
	{
		if (i > 0)
			rtnStr = rtnStr + "/";
		
		rtnStr = rtnStr + arr[i];
	}
	
	return rtnStr;
};


//fl.trace("creating exportSWF functions");
Object.fxutil.getExportPreviewSWFFullName = function()
{
	// construct the path
	var path = fl.configURI + Object.fxutil.getExportPreviewSWFFileName(true);
	Object.fxutil.myTrace(1, "export SWF path = " + path);
	return path;
};



Object.fxutil.getExportPreviewSWFFileName = function(increment) 
{
	if (increment)
	{
		Object.fxutil.fileSequence++;
	}
	var fileName = "preview" + Object.fxutil.fileSequence + ".swf";
	
	return fileName;
};



/** The sequential preview number */
Object.fxutil.fileSequence = 1;



/**
 * This function exports the library symbol associated with the
 * parameter instance to a swf. The name and location of the swf
 * are well-known, and configurable using the prototype settings.
 */
Object.fxutil.exportPreviewSWF = function(instance) 
{
	try
	{
		// Get a reference to the library symbol
		var libItem = instance.libraryItem;
		
		// The library item needs to be a movie clip to export properly.
		// Graphic symbols do export but they only show a single frame.
		var priorType = libItem.symbolType;
		libItem.symbolType = "movie clip";
		var fileName = Object.fxutil.getExportPreviewSWFFullName();
		Object.fxutil.myTrace(0, "about to export " + libItem.name + " of type " + libItem.symbolType + " to " + fileName);
		
		// previews always want to use version 7 player.
		// import a profile that targets FP7.
		var profileURI = fl.configURI + "Effects/PreviewPublishProfile.xml";
		var profileIndex = fl.getDocumentDOM().importPublishProfile(profileURI);
		
		// export the swf
		libItem.exportSWF( fileName );
		
		// remove the temporary profile
		fl.getDocumentDOM().deletePublishProfile();
		
		// Now switch the symbol type back to what it was
		libItem.symbolType = priorType;
	}
	catch (e)
	{
		fl.trace("Exception in exportPreviewSWF: " + e);
	}
};


/**
 * This function handles trace calls to the output window
 */
//fl.trace("creating myTrace functions");
Object.fxutil.myTrace = function(level, theString) 
{
	/*************************************
	var indentstring = ' ';
	for (var i= 0; i < level  ; i++) 
	{
		indentstring = indentstring + '  ';
	}
	if (level == 0)
	{
//		fl.trace("");
//		fl.trace("----------------------------");
//		fl.trace(theString);
//		fl.trace("----------------------------");
	}else{
//		fl.trace(indentstring + theString);
	}
	*************************************/
};


/**
 * This function moves the symbol to the "Effects" folder in the library.
 * The folder is created if necessary.
 */
Object.fxutil.moveToEffectsFolder = function(symbolName) 
{
	//create a folder in the library, stores all effects graphics in there
	var cur_lib = fl.getDocumentDOM().library;
	var libFolderName = "Effects Folder";
	
	if (!cur_lib.itemExists(libFolderName))
		cur_lib.newFolder(libFolderName);
	
	cur_lib.moveToFolder(libFolderName, symbolName);
};


/**
 * Break the selection apart and remove the underlying symbol 
 * from the library. This is to be called directly from a SWF.
 * This is not currently used, but it is suitable for use.
 */
function breakAndHuck()
{
//	fl.trace("breakAndHuck: start");
	var dom = fl.getDocumentDOM();
	dom.selectAll();
//	fl.trace("about to break apart " + dom.selection[0].name);
	var mainLibItem = dom.selection[0].libraryItem;
//	fl.trace("library item=" + mainLibItem.name);
	dom.breakApart();
	// Delete the main symbol from the library
//	fl.trace("about to remove " + mainLibItem.name + " from the library");
	dom.library.deleteItem(mainLibItem.name);
//	fl.trace("breakAndHuck: end");
};



function echo(orig)
{
	//fl.trace("echoing " + orig);
}
