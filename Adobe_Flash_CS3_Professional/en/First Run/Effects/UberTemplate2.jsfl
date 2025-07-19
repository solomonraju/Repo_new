// Effect implementation for Fly-In, Fly-Out, Fade-In, Fade-Out, Mask In, Mask Out
//


/**
 * Configure the effect. Create any necessary shared functions.
 */
function configureEffect()
{
	// Load shared functions
	// The runScript path is relative to the Commands directory.
	// shared.jsfl is in the Effects directory
}



function doAlert( str )
{
	//alert( str );
}


	
/**
 * Calls reverse()
 */
function removeEffect()
{
	// Andrew Guldman 6/23/2003
	// Don't parametrize the reverse function because it is called automatically
	// without parameters by the config SWF to generate previews. We want to
	// keep consistency between the SWF UI and the rest of the effects
	// framework.
	
	doAlert("removeEffect");
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

		fl.runScript(fl.configURI + "Effects/shared.jsfl");
		
		// save the selected object
		var selObj = fl.getDocumentDOM().selection[0];
		
		var tmpTL    = fl.getDocumentDOM().getTimeline();
		var tmpLayer = tmpTL.layers[ tmpTL.currentLayer ];
		var tmpFrame = tmpLayer.frames[ tmpTL.currentFrame ];
		var theCurrentFrameNum = tmpFrame.startFrame;
		var theCurrentLayer = tmpTL.currentLayer;

		// enters edit in place mode for selected object
		fl.getDocumentDOM().enterEditMode("inPlace");
		doAlert("edit mode");
		
		var localTL = fl.getDocumentDOM().getTimeline();
		// frame 0 is OK, we created it
		var myLayer = 0;
		localTL.currentLayer = myLayer;
		var layerName = localTL.getLayerProperty("name");	
		
		// if we created the mask layer, delete it and restore type of next layer
		if (layerName == "MASK")
		{	
			localTL.setSelectedLayers(0);
			localTL.setSelectedFrames([myLayer, 0, 1], true);
			doAlert("before deleting mask layer");
			
			// get the mask symbol
			var maskItem = fl.getDocumentDOM().selection[0].libraryItem;
			
			// delete the layer
			localTL.deleteLayer();	
			localTL.currentLayer = 0;
			localTL.setLayerProperty("layerType", "normal");	
			doAlert("after deleting mask layer");
			
			var maskName = maskItem.name;
			doAlert("deleting mask item: " + maskName);
			fl.getDocumentDOM().library.deleteItem( maskName );
		}

		var fcNum = localTL.layers[myLayer].frameCount;
		localTL.setSelectedFrames([myLayer, 0, fcNum], true);
		localTL.removeFrames(1, fcNum);
		localTL.setSelectedFrames([myLayer, 0, 1], true);
		localTL.setFrameProperty('tweenType', 'none', 0);
		localTL.currentFrame = 0;
		fl.getDocumentDOM().selectAll();
		
		// we need to move the object back to it's original position for a fly in
	//	var ef = fl.activeEffect;
	//	if (ef.effectName == "Fly In")
	//	{
			// Andrew Guldman 6/23/2003
			// The problem: the reverse effect can't get information from 
			// fl.activeEffect because the config UI SWF calls reverse
			// to generate the live preview. When the config SWF calls reverse,
			// the active effect can not be set properly because the config UI
			// is still open. The changes the user has made to the effect have not 
			// been committed.
			//
			// We can't parametrize the reverse function because the config SWF calls
			// it automatically without parameters. We want to keep consistency 
			// between the SWF UI and the rest of the effects framework.
			// 
			// One solution would be to create an invisible artifact in the effect
			// symbol to indicate that fly==in has been selected. An empty movie 
			// clip whose instance name is "flyin" would be an example of an
			// invisible artifact. If this artifact existed, the remove function 
			// will know that the original position is the last frame of the 
			// effect symbol.
			//
			// The problems above are only potential problems right now because
			// the SWF UI does not let the user select fly=in. Consequently, this
			// section of the code is never reached. We need to address this issue
			// before we add a fly=in option to the SWF UI.
			//
	//		var xOffset = ef.xpos;
	//		var yOffset = ef.ypos;
	//		fl.getDocumentDOM().moveSelectionBy({x:-xOffset,  y:-yOffset});
	//	}	
		
		// return the symbol to it's original state with a break apart
		var libItem = fl.getDocumentDOM().selection[0].libraryItem;
		fl.getDocumentDOM().breakApart();
		
		// delete the library item
		var dom = fl.getDocumentDOM();
		var libName = libItem.name;
		doAlert("deleting library item: " + libName);
		dom.library.deleteItem( libName );
		
		// go back to the ain timeline
		doAlert("exit edit mode");
		fl.getDocumentDOM().exitEditMode();
		
		// delete the folder if it is empty
		var folderName = Object.fxutil.getEffectsFolderName();
		if (Object.fxutil.folderIsEmpty( folderName ))
		{
			doAlert("deleting folder " + folderName);
			fl.getDocumentDOM().library.deleteItem( folderName );
		}
	    
		//clear out the extra frames added by effects
		var topTL = fl.getDocumentDOM().getTimeline();
		var selectedFrames = topTL.getSelectedFrames();
		
		var removeStart = theCurrentFrameNum + 1;
		var removeEnd   = theCurrentFrameNum + fl.activeEffect.dur - 2;
		topTL.removeFrames(removeStart, removeEnd);
		topTL.currentFrame = selectedFrames[1];
		fl.getDocumentDOM().selectAll();
		var selFrameEnd = selectedFrames[1]+1	;
		
		// reset the selection
		Object.fxutil.resetSelection( selObj, theCurrentFrameNum,  theCurrentLayer );
		
		doAlert( "exit reverse" );
	}
	catch (e)
	{
		fl.trace("Exception in reverse: " + e);
	}
}



/**
 * Perform the effect. 
 */
function executeEffect()
{
	doAlert("executeEffect");
	
	var ef = fl.activeEffect;
	forward( false, ef.dur, ef.xmode, ef.xpos, ef.ymode, ef.ypos, ef.xscalemode,
			ef.xscale, ef.yscalemode, ef.yscale, ef.anglemode, ef.angle, ef.colormode, ef.color,
				ef.easing, ef.direction, ef.changealpha, ef.alpha, ef.fade, ef.wipe, ef.fly);
}


/**
* Implementation of the  effect. This could be called from
* the effect file or from the preview.
*
*      @param preview Boolean: True to create a preview swf.
*	<property name="Effect Duration" variable="dur" min="1" defaultValue="30" type="Number" />
*	<property name="Change X Position" variable="xmode" list="Move By, Move To" defaultValue="0" type="Strings" />
*	<property name="X Position" variable="xpos" defaultValue="0.0" type="Double" />
*	<property name="Change Y Position" variable="ymode" list="Move By, Move To" defaultValue="0" type="Strings" />
*	<property name="Y Position" variable="ypos" defaultValue="0.0" type="Double" />
*	<property name="Change X Scale" variable="xscalemode" list="Resize to Scale, Increase by, Decrease by" defaultValue="0" type="Strings" />
*	<property name="X Scale" variable="xscale" min="-1000.0" max="1000.0" defaultValue="100.0" type="Percent" />
*	<property name="Change Y Scale" variable="yscalemode" list="Resize to Scale, Increase by, Decrease by" defaultValue="0" type="Strings" />
*	<property name="Y Scale" variable="yscale" min="-1000.0" max="1000.0" defaultValue="100.0" type="Percent" />
*	<property name="Change Angle" variable="anglemode" list="Rotate CW By, Rotate CCW By" defaultValue="0" type="Strings" />
*	<property name="Angle" variable="angle" min="-360" max="360" defaultValue="0" type="Double" />
*	<property name="Change Color" variable="colormode" list="No, Fade to Color" defaultValue="0" type="Strings" />
*	<property name="Color" variable="color" min="#FFFFFF" defaultValue="#FFFFFF" type="Color" />
*	<property name="Motion Ease" variable="easing" min="-100" max="100" defaultValue="0" type="Double" />
*	<property name="Direction" variable="direction" list="Wipe Down, Wipe Up, Wipe Left, Wipe Right" defaultValue="0" type="Strings" />
*	<property name="Change Alpha" variable="changealpha" list="yes, no" defaultValue="yes" type="Strings" />
*	<property name="Alpha" variable="alpha" min="0" max="100" defaultValue="0" type="Double" />
*	<property name="Fade" variable="fade" list="none, in,  out, none" defaultValue="none" type="Strings" />
*	<property name="Wipe" variable="wipe" list="none, in,  out, none" defaultValue="none" type="Strings" />
*	<property name="Fly" variable="fly" list="in,  out, none" defaultValue="in" type="Strings" />
*/
function forward(preview, dur, xmode, xpos, ymode, ypos, 
			xscalemode, xscale, yscalemode, yscale, anglemode, angle, colormode, color, 
					easing, direction, changealpha, alpha, fade, wipe, fly)
{
	try
	{
		fl.enableImmediateUpdates( true );
		doAlert("forward");

		changealpha = "yes";
		
		fl.runScript(fl.configURI + "Effects/shared.jsfl");
		traceParameters(preview, dur, xmode, xpos, ymode, ypos, xscalemode, xscale, yscalemode, yscale, 
						anglemode, angle, colormode, color, easing, direction, changealpha, alpha, fade, wipe, fly);

		//var ef = fl.activeEffect;
		var libName = "";
		var frameNum = fl.getDocumentDOM().getTimeline().currentFrame;
		
		var myMainDoc = fl.getDocumentDOM();
		var myMainTL = myMainDoc.getTimeline();	
		var myCurrentFrame = myMainTL.layers[myMainTL.currentLayer].frames[myMainTL.currentFrame];
		var startFrame = myCurrentFrame.startFrame;
		var durationFrames = myCurrentFrame.duration;
		var selectObj = fl.getDocumentDOM().selection;
		
		// save the selection and current frame
		var theEffectObj = selectObj[0];
		var theCurrentFrameNum = fl.getDocumentDOM().getTimeline().currentFrame;
		var theCurrentLayer = fl.getDocumentDOM().getTimeline().currentLayer;
		
		var nToInsert = dur - durationFrames;
		if (nToInsert > 0)
		{
			fl.getDocumentDOM().getTimeline().insertFrames(nToInsert, false);
		}
		
		// reset the selection to the effect object
		Object.fxutil.resetSelection( theEffectObj, theCurrentFrameNum,  theCurrentLayer );
		
		var newXPos = xpos;
		var newYPos = ypos;
		var selXCenter = 0;
		var selYCenter = 0;
		var selXMin = 9999999999;
		var selXMax = -99999999999;
		var selYMin = 999999999999;
		var selYMax = -99999999999;
		var j;
		var tx, ty;
		
		var selectObj = fl.getDocumentDOM().selection;
		var numFramesForEffect = dur - 1;
		
		for (j = 0; j < selectObj.length; j++)
		{
			tx = 0;
			ty = 0;
				
			if ((selectObj[j].top + ty) < selYMin)
				selYMin = selectObj[j].top + tx;
			if ((selectObj[j].left + tx) < selXMin)
				selXMin = selectObj[j].left + tx;
			if ((selectObj[j].top + selectObj[j].height + ty) > selYMax)
				selYMax = (selectObj[j].top + selectObj[j].height + ty);
			if ((selectObj[j].left + selectObj[j].width + tx) > selXMax)
				selXMax = (selectObj[j].left + selectObj[j].width + tx);	
		}
		
		selXCenter = ((selXMin + selXMax) / 2.0);
		selYCenter = ((selYMin + selYMax) / 2.0);
		
		// the delta is calculated off the objects position.
		if (xmode != "Move By")
			newXPos = newXPos - theEffectObj.matrix.tx;
			
		if (ymode != "Move By")
			newYPos = newYPos - theEffectObj.matrix.ty;
		
		// make sure we have the correct selection
		Object.fxutil.resetSelection( theEffectObj, theCurrentFrameNum, theCurrentLayer );
		
		// save the view matrix
		var viewMat = fl.getDocumentDOM().viewMatrix;
		
		// edit the symbol
		doAlert("before enter edit");
		fl.getDocumentDOM().enterEditMode("inPlace");
		doAlert("edit mode");			
		
		// get the selection
		selectObj = fl.getDocumentDOM().selection;
		
		if (fly == "in")
			fl.getDocumentDOM().moveSelectionBy({x:newXPos, y:newYPos});
		
		// find a safe name for the library item
		var cur_lib = fl.getDocumentDOM().library;
		var libFolderName = Object.fxutil.getEffectsFolderName();
		
		// create the folder if necessary
		if (!cur_lib.itemExists(libFolderName) )
		{
			//doAlert( "create folder: " + libFolderName);
			cur_lib.newFolder(libFolderName);
		}
		
		// create the item and move it to the folder
		libName = Object.fxutil.generateLibName();
		//doAlert("moving " + libName + " to " + libFolderName);
		newMc = fl.getDocumentDOM().convertToSymbol("graphic", libName, "center");
		cur_lib.moveToFolder(libFolderName, libName);
			
		var doc = fl.getDocumentDOM();
		var tl = doc.getTimeline();

		tl.convertToKeyframes(numFramesForEffect);

		// take care of alpha
		if (fade != "none" )
		{
			if (fade == "out")
			{
				var instance2 = tl.layers[0].frames[numFramesForEffect].elements[0];
				instance2.colorAlphaPercent = 0;			
			}
			else
			{
				var instance2 = tl.layers[0].frames[0].elements[0];
				instance2.colorAlphaPercent = 0;		
			}
		}

		// fade overrides alpha - fluid add
		if ((changealpha == "yes") && (fade == "none")) // AG Fluid fix 6/22 && (colormode != "No"))
		{
			var instance2 = tl.layers[0].frames[numFramesForEffect].elements[0];
			instance2.colorMode = "advanced";
			instance2.colorAlphaPercent = 0;			
			instance2.colorAlphaAmount = alpha*255/100.0;	
		}
		
		// take care of scale X
		if (xscalemode == "Resize to Scale")
		{
			var instance3 = tl.layers[0].frames[numFramesForEffect].elements[0];
			instance3.width *= (xscale);
		}
		else
		{
			var instance3 = tl.layers[0].frames[numFramesForEffect].elements[0];
			if (xscalemode == "Increase by")
				instance3.width = instance3.width + (instance3.width * xscale);
			else
				instance3.width = instance3.width - (instance3.width * xscale);
		}
		
		// take care of scale Y
		if (yscalemode == "Resize to Scale")
		{
			var instance3 = tl.layers[0].frames[numFramesForEffect].elements[0];
			instance3.height *= (yscale);
		}
		else
		{
			var instance3 = tl.layers[0].frames[numFramesForEffect].elements[0];
			if (yscalemode == "Increase by")
				instance3.height = instance3.height + (instance3.height * yscale);
			else
				instance3.height = instance3.height - (instance3.height * yscale);
		}
		

	//orginal code
		// take care of color tint
		if (colormode != "No")
		{
			var instance4 = tl.layers[0].frames[numFramesForEffect].elements[0];
			instance4.colorMode = "advanced";
			
			instance4.colorRedPercent = 0;
			instance4.colorGreenPercent = 0;
			instance4.colorBluePercent = 0;
			//instance4.colorAlphaPercent = 100;


			instance4.colorRedAmount = ((color & 0xff0000) >> 16);
			instance4.colorGreenAmount = ((color & 0x00ff00) >> 8);
			instance4.colorBlueAmount = (color & 0x0000ff);
			//instance4.colorAlphaAmount = 255;
		}
		
		// set the tween type and easing parameters		
		tl.setFrameProperty('tweenType', 'motion', 0);
		tl.setFrameProperty('tweenEasing', easing, 0);
		
		// set the frame to the end	
		tl.currentFrame = dur;
		doc.selectAll();

		if (fly != "in")
			fl.getDocumentDOM().moveSelectionBy({x:newXPos, y:newYPos});
		else
			fl.getDocumentDOM().moveSelectionBy({x:-newXPos, y:-newYPos});
		
		var numspins = Math.floor(angle/360);
			
		angle = angle - (numspins * 360);
			
		if (anglemode == "Rotate CW By")
		{
			fl.getDocumentDOM().rotateSelection(angle);
			tl.setFrameProperty("motionTweenRotate", "clockwise", dur-1);
			tl.setFrameProperty("motionTweenRotate", "clockwise", 0);
			tl.setFrameProperty("motionTweenRotateTimes", numspins, 0);	
		}

		if (anglemode == "Rotate CCW By")
		{
			fl.getDocumentDOM().rotateSelection(-angle);
			tl.setFrameProperty("motionTweenRotate", "counter-clockwise", dur-1);
			tl.setFrameProperty("motionTweenRotate", "counter-clockwise", 0);
			tl.setFrameProperty("motionTweenRotateTimes", numspins, 0);	
		}
		
		var topLayerIndex = tl.currentLayer;
		if (wipe != "none") 
		{
			var maskLayerIndex = tl.addNewLayer();
			
			tl.setSelectedLayers(maskLayerIndex);
			tl.currentLayer = maskLayerIndex;
			tl.currentFrame = 0;
			
			var maskWidth = selXMax - selXMin;
			var maskHeight = selYMax - selYMin;
			var maskLeftPos = 500;
			var maskTopPos = 500;

			// create a rectangle for rotated strings
			if (angle != 0)
			{
				if (maskHeight > maskWidth)
					maskWidth = maskHeight;
				if (maskWidth > maskHeight)
					maskHeight = maskWidth;
			}

			fl.getDocumentDOM().addNewRectangle({left:maskLeftPos, top:maskTopPos, right:maskLeftPos + maskWidth, bottom:maskTopPos + maskHeight}, 0);
			tl.setSelectedFrames([maskLayerIndex, 0, 1], true);
			fl.getDocumentDOM().setSelectionRect({left:maskLeftPos, top:maskTopPos, right:maskLeftPos + maskWidth, bottom:maskTopPos + maskHeight});
			
			libName = Object.fxutil.generateLibName();
			var myLocalVC = fl.getDocumentDOM().convertToSymbol("graphic", libName, "top left");	
			cur_lib.moveToFolder(libFolderName, myLocalVC.name);
			
			var xLocal = selXMin*viewMat.a + selYMin*viewMat.c + viewMat.tx;
			var yLocal = selXMin*viewMat.b + selYMin*viewMat.d + viewMat.ty;
				
			// move into position				
			fl.getDocumentDOM().moveSelectionBy({x:(-maskLeftPos), y: (-maskTopPos)});	
			fl.getDocumentDOM().moveSelectionBy({x:xLocal, y: yLocal});	

			var wipeX, wipeY;

			if (direction == "Wipe Up")
			{
				wipeX = 0;
				wipeY = maskHeight;
				
				if (wipe == "out")
					wipeY = -wipeY;
			}
			
			if (direction == "Wipe Down")
			{
				wipeX = 0;
				wipeY = -maskHeight;		
				
				if (wipe == "out")
					wipeY = -wipeY;
			}
					
			if (direction == "Wipe Right")
			{
				wipeX = -maskWidth;
				wipeY = 0;		
				
				if (wipe == "out")
					wipeX = -wipeX;
			}
			
			if (direction == "Wipe Left")
			{
				wipeX = maskWidth;
				wipeY = 0;		
				
				if (wipe == "out")
					wipeX = -wipeX;
			}
			
			if (wipe == "out")
				fl.getDocumentDOM().moveSelectionBy({x:wipeX, y:wipeY});		
				
			tl.convertToKeyframes(numFramesForEffect);
			tl.setFrameProperty('tweenType', 'motion', 0);
			tl.currentFrame = numFramesForEffect;
			tl.setSelectedLayers(maskLayerIndex);
			tl.currentLayer = maskLayerIndex;		
			
			// handle wipe in vs. wipe out
			tl.setSelectedFrames([maskLayerIndex, 0, numFramesForEffect], true);
		
			if (wipe == "out")
				fl.getDocumentDOM().moveSelectionBy({x:-wipeX, y:-wipeY});		
			else
				fl.getDocumentDOM().moveSelectionBy({x:wipeX, y:wipeY});		
			
			// set the layer type to mask at the end
			tl.setLayerProperty("layerType", "mask");	
			tl.setLayerProperty("name", "MASK");	
			
			// set the current layer to be masked
			tl.setSelectedLayers(maskLayerIndex + 1);
			tl.setLayerProperty("layerType", "masked");	
		}
			
		// set frame back to 0 to help with removeEffect!
		tl.currentFrame = 0;

		// very important to deselect intermediate objects here!
		doc.selectNone();
		
		// go back to the main timeline
		doAlert("exit edit mode");
		fl.getDocumentDOM().exitEditMode();

		if (fade == "in" || wipe == "in" || fly == "in")
		frameNum = frameNum + dur - 1;
		  
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
				var layerIndex = fl.getDocumentDOM().getTimeline().currentLayer;
				fl.getDocumentDOM().getTimeline().setSelectedFrames([layerIndex, startFrame, startFrame+1], true);
			}
		}
		else
		{
			// remove any extra frames   
			if (nToInsert < 0)
			{
				var	removeStart = startFrame + dur;
				var removeEnd = startFrame + durationFrames;
			
				fl.getDocumentDOM().getTimeline().removeFrames(removeStart,  removeEnd);
				var layerIndex = fl.getDocumentDOM().getTimeline().currentLayer;
				fl.getDocumentDOM().getTimeline().setSelectedFrames([layerIndex, startFrame, startFrame+1,], true);
				
				var selArray = new Array;
				selArray[0] = theEffectObj;
				fl.getDocumentDOM().selection = selArray;
			}
		}

		//bring the keyframe back to the original place before applying effects
		fl.getDocumentDOM().getTimeline().currentFrame = frameNum;
		
		// reset the selection to the effect object
		Object.fxutil.resetSelection( theEffectObj, theCurrentFrameNum,  theCurrentLayer );
		
		if (preview)
		{
			// Export the preview swf
			Object.fxutil.exportPreviewSWF( fl.getDocumentDOM().selection[0] );
		}
		Object.fxutil.myTrace(0,"successful completion");
	}
	catch (e)
	{
		fl.trace("Exception in forward: " + e);
	}
}	





// ef.effectName /s fade || wipe

function traceParameters(preview, dur, xmode, xpos, ymode, ypos, xscalemode, xscale, yscalemode, yscale, anglemode, angle, colormode, color, easing, direction, changealpha, alpha, fade, wipe, fly)
{
//	fl.trace( "preview=" + preview);
//	fl.trace( "dur=" + dur);
//	fl.trace( "xmode=" + xmode);
//	fl.trace( "xpos=" + xpos);
//	fl.trace( "ymode=" + ymode);
//	fl.trace( "ypos=" + ypos);
//	fl.trace( "xscalemode=" + xscalemode);
//	fl.trace( "xscale=" + xscale);
//	fl.trace( "yscalemode=" + yscalemode);
//	fl.trace( "yscale=" + yscale);
//	fl.trace( "anglemode=" + anglemode);
//	fl.trace( "angle=" + angle);
//	fl.trace( "colormode=" + colormode);
//	fl.trace( "color=" + color);
//	fl.trace( "easing=" + easing);
//	fl.trace( "direction=" + direction);
//	fl.trace( "changealpha=" + changealpha);
//	fl.trace( "alpha=" + alpha);
//	fl.trace( "fade=" + fade);
//	fl.trace( "wipe=" + wipe);
//	fl.trace( "fly=" + fly);
}
