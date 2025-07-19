

/**
 * Configure the effect. Create any necessary shared functions.
 */
function configureEffect()
{
	// Load shared functions
	// The runScript path is relative to the Commands directory.
	// shared.jsfl is in the Effects directory
}

/**
 * Calls reverse()
 */
function removeEffect()
{
	reverse();
}


/**
 * Performs the operations necessary to remove the effect
 */	
function reverse()
{
	try
	{
		fl.enableImmediateUpdates( true );
		doAlert("reverse");
		
		// initialize the shared functions
		fl.runScript(fl.configURI + "Effects/shared.jsfl");
		
		// set the current frame
		var theCurrentFrameNum = Object.fxutil.getEffectStartFrame();
		var theCurrentLayer = fl.getDocumentDOM().getTimeline().currentLayer;
		fl.getDocumentDOM().getTimeline().currentFrame = theCurrentFrameNum;
		doAlert("after setting current frame: " + theCurrentFrameNum);
		
		// save the selected effect object
		var theEffectObj = fl.getDocumentDOM().selection[0];
		var theEffectLibItem = theEffectObj.libraryItem;
		doAlert("reverse: " + theEffectObj);

		// enters edit in place mode for selected object
   		doAlert("about to enter edit mode");
   		fl.getDocumentDOM().enterEditMode("inPlace");
		var localTL = fl.getDocumentDOM().getTimeline();
		
		var libPath = theEffectObj.getPersistentData("libPath");
		doAlert("in edit mode, lib name: " +  libPath);
		
		// remove all layers except the last
		var layerCount = localTL.layerCount;
		for (var iLayer=0;  iLayer<(layerCount-1);   iLayer++)
		{
			var layer = localTL.layers[0];
			localTL.deleteLayer(0);
		}
		
		doAlert("layers deleted");
		
		// remove the frames from the last remaining symbol
		var myLayer = 0;
		localTL.currentLayer = myLayer;
		var fcNum = localTL.layers[myLayer].frameCount;
		localTL.setSelectedFrames([myLayer, 0, fcNum], true);
		localTL.removeFrames(1, fcNum);
		localTL.setFrameProperty('tweenType', 'none', 0);
		localTL.currentFrame = 0;
		
		// convert the symbol back to whatever it was before the effect was applied
		fl.getDocumentDOM().selectAll();
		fl.getDocumentDOM().breakApart();
		
		// go back to the main timeline
		doAlert("about to exit edit mode");
		fl.getDocumentDOM().exitEditMode();
		doAlert("out of edit mode");
		
		// remove the library symbol
		fl.getDocumentDOM().library.deleteItem( libPath );
		doAlert("deleted lib item: " + libPath);
		
		// remove the folder if it is empty
		if (Object.fxutil.folderIsEmpty())
		{
			var folderName = Object.fxutil.getEffectsFolderName();
			fl.getDocumentDOM().library.deleteItem( folderName );
			doAlert("deleted folder: " + folderName);
		}
		
		//clear out the extra frames added by effects
		var topTL = fl.getDocumentDOM().getTimeline();
		var firstFrameToRemove = theCurrentFrameNum + 1;
		var lastFrameToRemove  = firstFrameToRemove + fl.activeEffect.dur - 1;
		doAlert("before removing frames " + firstFrameToRemove + " to " + lastFrameToRemove);
		topTL.removeFrames(firstFrameToRemove, lastFrameToRemove);
		topTL.currentFrame = theCurrentFrameNum;
		fl.getDocumentDOM().getTimeline().setSelectedFrames(theCurrentFrameNum, theCurrentFrameNum+1, true);
		
		// reset the selection to the effect object
		Object.fxutil.resetSelection( theEffectObj,  theCurrentFrameNum,  theCurrentLayer );
		
		doAlert("reverse finished");
	}
	catch (e)
	{
		fl.trace("Exception in reverse: " + e);
	}
}


function traceparameters(dur, hor, vert, regPoint, blur_amount, baseScale)
{
//	fl.trace("Blur Parameters" ); 
//	fl.trace("dur:" + dur); 
//	fl.trace("hor:" + hor); 
//	fl.trace("vert:" + vert); 
//	fl.trace("regPoint:" + regPoint); 
//	fl.trace("blur_amount:" + blur_amount); 
//	fl.trace("baseScale:" + baseScale); 
}


	
/**
 * Perform the effect. 
 */
function executeEffect()
{
	var ef = fl.activeEffect;
	forward( false, ef.dur, ef.hor, ef.vert, ef.regPoint, ef.blur_amount, ef.baseScale);
}


/**
* <property name="Effect Duration" variable="dur" min="1" defaultValue="16" type="Number" />
* <property name="Allow Horizontal Blur" variable="hor" defaultValue="True" type="Boolean" />
* <property name="Allow Vertical Blur" variable="vert" defaultValue="True" type="Boolean" />
* <property name="Direction of Blur" variable="regPoint" list="From Center,Left,Right,Up,Down,Bottom Right,Bottom Left,Top Right,Top Left" defaultValue="0" type="Strings" />
* <property name="Number of Steps" variable="blur_amount" defaultValue="15" type="Number" />
* <property name="Starting Scale" variable="baseScale" defaultValue=".25" type="Double" />
*/
function forward(preview, dur, hor, vert, regPoint, blur_amount, baseScale)
{
	try
	{
		fl.enableImmediateUpdates( true );
		doAlert("forward");
		
		fl.runScript(fl.configURI + "Effects/shared.jsfl");

		Object.fxutil.myTrace(0, "Blur.forward()");
		traceparameters(dur, hor, vert, regPoint, blur_amount, baseScale);
		
		var ef = fl.activeEffect;	//moved to executeEffect()
		var registrationPoint;
		var addToScale = 10;
		var frameNum = fl.getDocumentDOM().getTimeline().currentFrame;
		
		var myMainTL		= fl.getDocumentDOM().getTimeline();	
		var myCurrentFrame	= myMainTL.layers[myMainTL.currentLayer].frames[myMainTL.currentFrame];
		var startFrame		= myCurrentFrame.startFrame;
		var durationFrames	= myCurrentFrame.duration;
		
		// get the start frame for the effect
		var firstFrameOfEffect = Object.fxutil.getEffectStartFrame();
		
		// save the selected effect object
		var theEffectObj = fl.getDocumentDOM().selection[0];
		
		// save the current layer
		var theCurrentLayer = fl.getDocumentDOM().getTimeline().currentLayer;
		
		var nToInsert = ef.dur - durationFrames;
		if (nToInsert > 0)
		{
			fl.getDocumentDOM().getTimeline().insertFrames(nToInsert, false);
			Object.fxutil.resetSelection( theEffectObj,  firstFrameOfEffect,  theCurrentLayer);
		}
		
		//enters edit Symbol mode for selected object
		doAlert( "about to edit" );
		fl.getDocumentDOM().enterEditMode("inPlace");
		doAlert("in edit mode");

		var pt = new Object;
		var selObj = fl.getDocumentDOM().selection[0];
		
		// get the center of the selection
		var selCtr = new Object;
		selCtr.x = selObj.left + selObj.width/2;
		selCtr.y = selObj.top + selObj.height/2;
			
		switch(regPoint){
			case "Bottom Right":
				registrationPoint = "top left";
				pt.x = selObj.left;
				pt.y = selObj.top;
				break;
			case "Down":
				registrationPoint = "top center";
				pt.x = selObj.left + selObj.width/2;
				pt.y = selObj.top;
				break;
			case "Bottom Left":
				registrationPoint = "top right";
				pt.x = selObj.left + selObj.width;
				pt.y = selObj.top;
				break;
			case "Right":
				registrationPoint = "center left";
				pt.x = selObj.left;
				pt.y = selObj.top + selObj.height/2;
				break;
			case "From Center":
				registrationPoint = "center";			
				pt.x = selObj.left + selObj.width/2;
				pt.y = selObj.top + selObj.height/2;
				break;
			case "Left":
				registrationPoint = "center right";
				pt.x = selObj.left + selObj.width;
				pt.y = selObj.top + selObj.height/2;
				break;
			case "Top Right":
				registrationPoint = "bottom left";
				pt.x = selObj.left;
				pt.y = selObj.top + selObj.height;
				break;
			case "Up":
				registrationPoint = "bottom center";
				pt.x = selObj.left + selObj.width/2;
				pt.y = selObj.top + selObj.height;
				break;
			case "Top Left":
				registrationPoint = "bottom right";
				pt.x = selObj.left + selObj.width;
				pt.y = selObj.top + selObj.height;
				break;
			default:
				registrationPoint = "center";
				pt.x = selObj.left + selObj.width/2;
				pt.y = selObj.top + selObj.height/2;
				break;
		}
		
		// the transformation point needs to be relative to the selected object's center
		pt.x -= selCtr.x;
		pt.y -= selCtr.y;
		
		//Convert the selected objects into a symbol
		var newSym = fl.getDocumentDOM().convertToSymbol("graphic", "", "center");
		
		//create a folder in the library, stores all effects graphics in there
		var cur_lib = fl.getDocumentDOM().library;
		var curLibItem = fl.getDocumentDOM().selection[0].libraryItem;
		var curItemName = curLibItem.name;
		var libFolderName = Object.fxutil.getEffectsFolderName();
		if (!cur_lib.itemExists(libFolderName))
		{
			doAlert("creating folder: " + libFolderName);
			cur_lib.newFolder(libFolderName);
		}
		
		// check if there is a duplicate symbol name
		var fullName = libFolderName + "/" + curItemName;
		while (cur_lib.itemExists(fullName))
		{
			curItemName += "x";
			curLibItem.name = curItemName;
			fullName = libFolderName + "/" + curItemName;
		}	
		cur_lib.moveToFolder(libFolderName, curItemName);
		doAlert("full name: " + fullName);
		
		// save the name of the library object for the remove
		theEffectObj.setPersistentData("libPath",  "string",  fullName); 
		
		// Set the transformation point
		fl.getDocumentDOM().setTransformationPoint(pt);
			
		//Copy the newly created symbol	
		fl.getDocumentDOM().clipCopy();
		
		//Selecting the timeline of the effect symbol created by by applying the effect 	
		var doc = fl.getDocumentDOM();	
		var tl = doc.getTimeline();
		
		//extend the layer generated by the editSymbol function to match duration
		//this also creates a copy of the symbol that was just created based on the selected objects	
		tl.convertToKeyframes(dur-1);
		
		//place the playhead on the last frame where the symbol copy is.	
		tl.currentFrame = dur-1;
		
		//target the sybol on the last frame and set the alpha to 0
		var instance_base = tl.layers[0].frames[dur-1].elements[0];	
		instance_base.colorAlphaPercent = 0;
		
		//Create a motion tween on frame one	
		tl.setFrameProperty('tweenType', 'motion', 0);	
		
		//set the scale	so that the objects scaled the most are on the bottom layers
		var addToBaseScale = (Number(blur_amount) * Number(addToScale));
		var base = baseScale * 100;
		var scale = Number(Number(base) + Number(addToBaseScale));
		
		// make the copies
		for (var i = 0; i < blur_amount; i++)
		{			
			// clear the selection to avoid changing the layer on the paste.
			fl.getDocumentDOM().selectNone();
			
			var layerIndex = 0;
			layerIndex = tl.addNewLayer();	
		
			fl.getDocumentDOM().clipPaste(true);		
			tl.convertToKeyframes(dur-1);		
			tl.setFrameProperty('tweenType', 'motion', 0);			
			var instance1 = tl.layers[layerIndex].frames[0].elements[0];		
			instance1.colorAlphaPercent = 70;
			
			//change the alpha of the object on the last frame		
			var instance2 = tl.layers[layerIndex].frames[dur-1].elements[0];		
			instance2.colorAlphaPercent = 0;
			
			//transform object on the last frame
			if (hor) {			
				instance2.width *= (scale / 100);			
			}		
			if (vert) {			
				instance2.height *= (scale / 100);			
			}		
			scale -= (addToScale);												
		}
		
		// go back to the main timeline
		doAlert("about to exit");
		fl.getDocumentDOM().exitEditMode();
		  
		// get the library item for the top level element
		var selectObj = fl.getDocumentDOM().selection;
		var libItem = selectObj[0].libraryItem;
		if (libItem.itemType == "movie clip")
		{
			var	removeStart = startFrame + durationFrames;
			var removeEnd = startFrame + myCurrentFrame.duration;
			if (removeEnd > removeStart)
			{
				fl.getDocumentDOM().getTimeline().removeFrames(removeStart,  removeEnd);
				fl.getDocumentDOM().getTimeline().currentFrame = firstFrameOfEffect;
				fl.getDocumentDOM().getTimeline().setSelectedFrames([startFrame, 0, 1], true);
			}
		}
		else
		{
			// remove any extra frames   
			if (nToInsert < 0)
			{
				var	removeStart = startFrame + ef.dur;
				var removeEnd = startFrame + durationFrames;
				fl.getDocumentDOM().getTimeline().removeFrames(removeStart,  removeEnd);
			}
		}
		
		//bring the keyframe back to the original place before applying effects
		fl.getDocumentDOM().getTimeline().currentFrame = frameNum;
		
		// reset the selection to the effect object
		Object.fxutil.resetSelection( theEffectObj,  firstFrameOfEffect,  theCurrentLayer );
		doAlert("forward finished");
			
		if (preview)
		{
			// Export the preview swf
			Object.fxutil.exportPreviewSWF( fl.getDocumentDOM().selection[0] );
			doAlert("preview finished");
		}
	}
	catch (e)
	{
		fl.trace("Exception in forward: " + e);
	}
}


function doAlert( str )
{
	//alert( str );
}





