
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
//	fl.outputPanel.clear();
//	Object.fxutil.myTrace(0, "RemoveEffect()");
	reverse();
}


/**
 * Performs the operations necessary to remove the effect
 */
function reverse()
{
	try
	{
		doAlert( "reverse" );
		fl.runScript(fl.configURI + "Effects/shared.jsfl");
		Object.fxutil.myTrace(0, "Explode.reverse()");
		
		// save the selection state
		var theCurrentFrameNum = Object.fxutil.getEffectStartFrame();
		var theCurrentLayer = fl.getDocumentDOM().getTimeline().currentLayer;
		fl.getDocumentDOM().getTimeline().currentFrame = theCurrentFrameNum;
		var theEffectObj = fl.getDocumentDOM().selection[0];
		
		//enter edit Symbol of the selected item
		fl.getDocumentDOM().enterEditMode("inPlace");
		doAlert("inPlace");
		
		var local_tl = fl.getDocumentDOM().getTimeline();
		var numLayer = local_tl.layers.length-1;
		
		//remove all layers except for Saved layer
		for (var i = 0; i < numLayer; i++) {
			local_tl.deleteLayer(0);
		}
		doAlert("after delete");
		
		// get the folder names
		var topLevelFolder = Object.fxutil.getEffectsFolderName();
		var effectFolderName = local_tl.layers[0].name;
		
		//
		var fullName = topLevelFolder + "/" + effectFolderName;
		fl.getDocumentDOM().library.moveToFolder("",  fullName);
		var effectItemName = local_tl.layers[0].frames[0].name;
		doAlert("moved " + fullName);
		
		local_tl.setLayerProperty("visible", true);
		local_tl.setLayerProperty("layerType", "normal");
		local_tl.setLayerProperty("locked", false);
		
		//bring current view back to main stage
		fl.getDocumentDOM().exitEditMode();	
		doAlert("out of edit");
		
		//remove the frames added on the main timeline
		var main_tl = fl.getDocumentDOM().getTimeline();
		var selectedFrames = main_tl.getSelectedFrames();
		//main_tl.removeFrames(selectedFrames[1]+1, selectedFrames[2]);
		//main_tl.setSelectedFrames(selectedFrames[1], selectedFrames[1]+1);	
		
		var removeStart = selectedFrames[1] + 1;
		var removeEnd   = selectedFrames[2];
		main_tl.removeFrames(removeStart, removeEnd);
		main_tl.currentFrame = selectedFrames[1];
		fl.getDocumentDOM().selectAll();
		var selFrameEnd = selectedFrames[1]+1	;
		main_tl.setSelectedFrames([selectedFrames[0],selectedFrames[1], selFrameEnd]);
		
		// reset the selection to the effect object
		Object.fxutil.resetSelection( theEffectObj,  theCurrentFrameNum,  theCurrentLayer );
		
		//delete the effect folder with the name as the layer name
		fl.getDocumentDOM().library.moveToFolder("", fl.getDocumentDOM().selection[0].libraryItem.name);
		fl.getDocumentDOM().library.deleteItem(effectFolderName);
		
		// remove the top level folder if it is empty
		if (Object.fxutil.folderIsEmpty())
			fl.getDocumentDOM().library.deleteItem(topLevelFolder);
		
	}
	catch (e)
	{
		fl.trace("Exception in reverse: " + e);
	}
}

//save the original graphics or text to use for removeEffect later
function saveOriginal(libFolderName)
{
	try
	{
		var save_tl = fl.getDocumentDOM().getTimeline();
			
		//add a new layer and give it the same name with the effect folder in the Library, type guide, below the current layer
		save_tl.addNewLayer(arguments[0], "guide", false);
		save_tl.currentLayer = 0;		
		fl.getDocumentDOM().selectAll();
		fl.getDocumentDOM().clipCopy();
		fl.getDocumentDOM().selectNone();
		save_tl.setSelectedFrames([1,0,1], true);
		fl.getDocumentDOM().clipPaste(true);
		save_tl.setLayerProperty("visible", false);
		save_tl.setLayerProperty("locked", true);
	}
	catch (e)
	{
		fl.trace("Exception in saveOriginal: " + e);
	}
}
	
//removed extra frames and keyframes added by other expanded action
function cleanUpSaveLayer(frameNum){
	var cur_tl = fl.getDocumentDOM().getTimeline();
	cur_tl.setSelectedLayers(cur_tl.layers.length-1, true);
	cur_tl.removeFrames(1, frameNum+1);
}	

//converts all current elements on the current timeline to movie clips with a effectSymbols move to Effect folder in the library and center registration point
function convertToGraphics(libFName)
{
	try
	{
		var curLayers = fl.getDocumentDOM().getTimeline().layers;
		var curElements = new Array();		
		var cur_lib = fl.getDocumentDOM().library;
		var symbolName = 'effectSym';
		for (var i=0; i < curLayers.length-1; i++)
		{
			fl.getDocumentDOM().selectNone();
			curElements[0] = curLayers[i].frames[0].elements[0];
			fl.getDocumentDOM().selection = curElements;
			while(cur_lib.itemExists(symbolName+i))
				symbolName=symbolName+1;
			var newSym = fl.getDocumentDOM().convertToSymbol("movie clip", symbolName+i, "center");
			cur_lib.moveToFolder(libFName, newSym.name);
			curLayers[i].locked = true;
		}	
	}
	catch (e)
	{
		fl.trace("Exception in : convertToGraphics" + e);
	}
}

//set colorAlphaPercent, rotate, set height, and move the current selection
function setTween (frameNum, alpha, rotateAngle, xPos, yPos, wid, hei, layerIndex)
{
	try
	{
		//fl.trace("setTween -- frameNum: " + frameNum + ", xPos: " + xPos + ", yPos: " + yPos + ", layerIndex" + layerIndex);
		doAlert("before setTween");
	
		var cur_tl = fl.getDocumentDOM().getTimeline();
		var curSelect = new Array();
		cur_tl.currentFrame = frameNum;
		cur_tl.layers[layerIndex].locked = false;
		curSelect[0] = cur_tl.layers[layerIndex].frames[frameNum].elements[0];	
		fl.getDocumentDOM().selectNone();
		fl.getDocumentDOM().selection = curSelect;
		cur_tl.currentFrame = frameNum;
		doAlert("after selection");
		
		fl.getDocumentDOM().moveSelectionBy({x:xPos, y:yPos});
		doAlert("after move");
			
		cur_tl.layers[layerIndex].frames[arguments[0]].elements[0].colorAlphaPercent = arguments[1];
		fl.getDocumentDOM().rotateSelection(arguments[2]);
		cur_tl.layers[layerIndex].frames[arguments[0]].elements[0].width += wid;
		cur_tl.layers[layerIndex].frames[arguments[0]].elements[0].height += hei;
		cur_tl.layers[layerIndex].locked = true;
		
		doAlert("after setTween");
	}
	catch (e)
	{
		fl.trace("Exception in setTween: " + e);
	}
}

//Explode the graphics to the left
function leftExplode(index, dur, alphaPercent, angle, x, y, w, h, firstIndex)
{
	try
	{
		//fl.trace("leftExplode, index: " + index + ", dur: " + dur + ", angle: " + angle + ", x: " + x + ", y: " + y + ", w: " + w + ", h: " + h + ", firstIndex: " + firstIndex);
		
		var cur_tl = fl.getDocumentDOM().getTimeline();
		var inc   = 1;
		var secondFrame;
		var alpha;

		for (var i=index; i >= firstIndex; i--)
		{
			fl.getDocumentDOM().selectNone();
			secondFrame = Math.ceil(arguments[1]/2)-1;
			cur_tl.currentLayer = i;
			cur_tl.insertKeyframe(secondFrame);
			if(cur_tl.layers[i].frames[secondFrame].elements[0])
			{
				alpha = (cur_tl.layers[i].frames[secondFrame].elements[0].colorAlphaPercent - arguments[2])/2;
				
				//call setTween to move the object vertically to y position
				setTween(secondFrame, alpha, (angle*(-1)/2), (x/2*inc*(-1)), y, (w/2), (h/2), i);								
				
				//call setTween to move the object back to y=0
				setTween(dur-1, alphaPercent, (angle*(-1)), (x*inc*(-1)), 0, w, h, i);	
			}

			inc++;
			cur_tl.setSelectedFrames(0, arguments[1]+1, true);
			cur_tl.setFrameProperty("tweenType", "motion");
			cur_tl.setFrameProperty("motionTweenScale", true);
		}		
	}
	catch (e)
	{
		fl.trace("Exception in leftExplode: " + e);
	}
}

//Explode the graphics to the right
function rightExplode(index, dur, alphaPercent, angle, x, y, w, h, lastIndex)
{
	try
	{
		//fl.trace("rightExplode, index: " + index + ", dur: " + dur + ", angle: " + angle + ", x: " + x + ", y: " + y + ", w: " + w + ", h: " + h + ", lastIndex: " + lastIndex);
		
		var cur_tl = fl.getDocumentDOM().getTimeline();
		var inc   = 1;
		var secondFrame;
		var alpha;

		for (var i=index; i <= lastIndex; i++)
		{
			fl.getDocumentDOM().selectNone();
			secondFrame = Math.ceil(dur/2)-1;
			cur_tl.currentLayer = i;
			cur_tl.insertKeyframe(secondFrame);

			if(cur_tl.layers[i].frames[secondFrame].elements[0])
			{
				alpha = (cur_tl.layers[i].frames[secondFrame].elements[0].colorAlphaPercent - arguments[2])/2;
				
				//call setTween to move the object vertically to y position
				setTween(secondFrame, alpha, (angle/2), (x/2*inc), y, (w/2), (h/2), i);								
				
				//call setTween to move the object back to y=0
				setTween(dur-1, alphaPercent, angle, (x*inc), 0, w, h, i);	
			}

			inc++;
			cur_tl.setSelectedFrames(0, arguments[1]+1, true);
			cur_tl.setFrameProperty("tweenType", "motion");
			cur_tl.setFrameProperty("motionTweenScale", true);
		}		
	}
	catch (e)
	{
		fl.trace("Exception in rightExplode: " + e);
	}
}

//move the layer that contains the object on the left to the top
function reorderAllLayers()
{
	try
	{
		var cur_tl = fl.getDocumentDOM().getTimeline();
		var nextLayer;
		var valid = false;
		while(valid==false) {
			nextLayer = 0;
			for (var i=0; i<cur_tl.layers.length-1; i++) {
				nextLayer++;
				if(nextLayer < cur_tl.layers.length-1) {
					if (cur_tl.layers[i].frames[0].elements[0].left > cur_tl.layers[nextLayer].frames[0].elements[0].left) {
						cur_tl.reorderLayer(nextLayer, i);
					}
				}
			}
			valid = checkOrder();
		}
	}
	catch (e)
	{
		fl.trace("Exception in reorderAllLayers: " + e);
	}
}

//check the all the objects in each layer return true if the left side of the object on the top layer is larger
function checkOrder()
{
	var cur_tl = fl.getDocumentDOM().getTimeline();
	var success = true;
	
	try
	{
		for (var j=0; j<cur_tl.layers.length-2; j++) {
			if (cur_tl.layers[j].frames[0].elements[0].left > cur_tl.layers[j+1].frames[0].elements[0].left) {
				success = false;
				j=cur_tl.layers.length;
			}
		}
	}
	catch (e)
	{
		fl.trace("Exception in checkOrder: " + e);
	}

	return success;
}

//break each item to small pieces for single symbol only
function breakItem(pieces, mainLeft, mainTop, mainWidth, mainHeight, libFName)
{
	try
	{
		//fl.trace("breakItem, pieces: " + pieces + ", left: " + mainLeft + ", top: " + mainTop);
	
		var cur_tl  = fl.getDocumentDOM().getTimeline();
		var curItem = cur_tl.layers[0].frames[0].elements[0];
		var div     = Math.sqrt( pieces );
		var mainLeftI = mainLeft;
		var mainTopI  = mainTop;
		var eachHei = mainHeight/div;
		var eachWid = mainWidth/div;
		var sel = new Array();
		sel[0]  = curItem;
		fl.getDocumentDOM().selection = sel;
		fl.getDocumentDOM().breakApart();
		cur_tl.setSelectedLayers(cur_tl.currentLayer, true);
		
		//process the left region of the object
		var j, leftI;
		var topI = mainTopI;
		for (var i=0; i<div; i++)
		{
			leftI = mainLeft;
			
			for (j=0; j<div/2; j++)
			{
				processRect(leftI, topI, eachWid, eachHei, "left"+i+j, libFName);
				leftI += eachWid;
			}
			
			topI += eachHei;
		}
		
		//process the right region of the object
		var rightI = leftI;
		topI = mainTop;
		for (var i=0; i<div; i++)
		{
			leftI = rightI;
			for (var j=0; j<div/2; j++) {
				processRect(leftI, topI, eachWid, eachHei, "right"+i+j, libFName);
				leftI += eachWid;
			}
			topI += eachHei;
		}
		cur_tl.deleteLayer(cur_tl.currentLayer); //delete the layer that contains the original graphic, it is empty now
	}
	catch (e)
	{
		fl.trace("Exception in breakItem: " + e);
	}
}

//select the rectangle, convert it to symbol, cut, paste to a new layer
function processRect(left, top, wid, hei, layerName, libFName)
{
	try
	{
		//fl.trace("processRect, top: " + top + ", width: " + wid + ", left: " + left + ", height: " + hei);
	
		var cur_tl = fl.getDocumentDOM().getTimeline();
		fl.getDocumentDOM().setSelectionRect({left:left-1, top:top-1, right:left+wid+1, bottom:top+hei+1}, true);		
		
		var cur_lib = fl.getDocumentDOM().library;
		var symbolName = layerName;
		
		if (fl.getDocumentDOM().getSelectionRect() != 0)
		{
			while(cur_lib.itemExists(symbolName))
				symbolName = symbolName+1;
			
			var newSym = fl.getDocumentDOM().convertToSymbol("movie clip", symbolName, "top left");
			cur_lib.moveToFolder(libFName, newSym.name);
			fl.getDocumentDOM().clipCut();
			cur_tl.addNewLayer(layerName);
			cur_tl.setSelectedLayers(cur_tl.currentLayer, true);
			fl.getDocumentDOM().clipPaste(true); 
		} 
		else 
		{
			cur_tl.addNewLayer(layerName);
		} 
		cur_tl.setSelectedLayers(cur_tl.currentLayer+1, true);
		fl.getDocumentDOM().selectNone();
	}
	catch (e)
	{
		fl.trace("Exception in processRect: " + e);
	}
}
	
/**
 * Perform the effect. 
 */
function executeEffect()
{
	var ef = fl.activeEffect;
	forward( false, ef.dur, ef.verticalDir, ef.horizontalDir, ef.y, ef.x, ef.angle, ef.alpha, ef.wid, ef.hei);
}



/**
* Implementation of the  effect. This could be called from
* the effect file or from the preview.
*      @param preview Boolean: True to create a preview swf.
*	<property name="Effect Duration" variable="dur" defaultValue="20" min="1" type="Number" />		
*	<property name="Explode Vertical Direction" variable="verticalDir" list="Up,Down" defaultValue="0" type="Strings" />
*	<property name="Explode Horizontal Direction" variable="horizontalDir" list="Center,Left,Right" defaultValue="0" type="Strings" />
*	<property name="Y Position (End)" variable="y" defaultValue="150" type="Number" />
*	<property name="Explode Spacing" variable="x" defaultValue="100" type="Number" />
*	<property name="Explode Rotate Angle" variable="angle" defaultValue="60" type="Number" />
*	<property name="Alpha Percent" variable="alpha" defaultValue="0" min="0" type="Number" />
*	<property name="Extend Width by" variable="wid" defaultValue="0" type="Number" />
*	<property name="Extend Height by" variable="hei" defaultValue="100" type="Number" />
*/
function forward(preview, dur, verticalDir, horizontalDir, y, x, angle, alpha, wid, hei)
{	
	fl.runScript(fl.configURI + "Effects/shared.jsfl");
	
	Object.fxutil.myTrace(0, "Explode.forward()");
	traceParameters(preview, dur, verticalDir, horizontalDir, y, x, angle, alpha, wid, hei);

	try
	{
		fl.enableImmediateUpdates( true );
		fl.runScript(fl.configURI + "Effects/shared.jsfl");
		
		// save the selection state
		var theCurrentFrameNum = Object.fxutil.getEffectStartFrame();
		var theCurrentLayer = fl.getDocumentDOM().getTimeline().currentLayer;
		fl.getDocumentDOM().getTimeline().currentFrame = theCurrentFrameNum;
		var theEffectObj = fl.getDocumentDOM().selection[0];
		
		//var curFrame = fl.getDocumentDOM().getTimeline().currentFrame;
		var curFrame = Object.fxutil.getEffectStartFrame();
		doAlert("forward, frame: " + curFrame);
		
		//inserts frames on current layer based on the duration set by effect
		var myMainDoc = fl.getDocumentDOM();
		var myMainTL = myMainDoc.getTimeline();	
		var myCurrentFrame = myMainTL.layers[myMainTL.currentLayer].frames[myMainTL.currentFrame];
		var durationFrames = myCurrentFrame.duration;
	
		var nToInsert = dur - durationFrames;
		if (nToInsert > 0)
		{
			fl.getDocumentDOM().getTimeline().insertFrames(nToInsert, false);
			myMainTL.setSelectedFrames(curFrame,  curFrame + dur, true);
			myMainTL.currentFrame = curFrame;
		}
		
		doAlert("after inserting frames, curFrame: " + curFrame);
		
		var singleObject = false;
		var lastLayerIndex, firstLayerIndex;
		
		//save the left and top coordinates
		var xPos = fl.getDocumentDOM().getElementProperty("left");
		var yPos = fl.getDocumentDOM().getElementProperty("top");
		var width = fl.getDocumentDOM().getElementProperty("width");
		var height = fl.getDocumentDOM().getElementProperty("height");
		
		var isSingleChar = false;
		
		// create the top level folder if it does not exist
		var cur_lib = fl.getDocumentDOM().library;
		var topLevelFolderName = Object.fxutil.getEffectsFolderName();
		if (!cur_lib.itemExists(topLevelFolderName))
			cur_lib.newFolder(topLevelFolderName);
		
		//create a folder in the library, stores all effects graphics in there
		var curItemName = fl.getDocumentDOM().selection[0].libraryItem.name;
		var libFolderName = 'Effect' + curItemName;

		if (!cur_lib.itemExists(libFolderName))
			cur_lib.newFolder(libFolderName);
		
		// save the current view matrix
		var curViewMat = fl.getDocumentDOM().viewMatrix;

		//enters edit Symbol mode for selected object, break apart the text, convert all text to graphics, then distributes to layers	
		fl.getDocumentDOM().enterEditMode("inPlace");
	
		//save original graphics or text to a guide layer, set the guide layer to invisible and locked, named the guide layer the same name with the Library folder
		saveOriginal(libFolderName);
		
		fl.getDocumentDOM().selectAll();
		var sel = fl.getDocumentDOM().selection;
		
		//if the effect object is text, break them apart to single characters
		if ((sel.length == 1) && (sel[0].elementType == "text")) {
			fl.getDocumentDOM().breakApart();	
			if(fl.getDocumentDOM().selection.length == 1)
				var isSingleChar = true;
		}

		var main_tl = fl.getDocumentDOM().getTimeline();
		
		//break to 16 pieces on a single object if the effect is a single object
		if (fl.getDocumentDOM().selection.length <= 1)
		{
			// total number of pieces to break the selection into - must be a multiple of 4
			var pieces = 16;
			var sel = fl.getDocumentDOM().selection;
			
			var done = false;
			while (!done)
			{
				while (sel[0].elementType != "shape")
				{
					fl.getDocumentDOM().breakApart();
					sel = fl.getDocumentDOM().selection;
				}
				
				if (sel[0].isGroup)
				{
					fl.getDocumentDOM().unGroup();
					sel = fl.getDocumentDOM().selection;
				}
				else
					done = true;
			}
			
				
			//if the selected object is a single character, convert the break apart graphic to movie clip, get the left and top coordinates then delete the newly created symbol
			if(isSingleChar)
			{
				var temp = fl.getDocumentDOM().convertToSymbol('movie clip', '', 'center');
				fl.getDocumentDOM().exitEditMode();
				xPos = fl.getDocumentDOM().getElementProperty("left");
				yPos = fl.getDocumentDOM().getElementProperty("top");
				width = fl.getDocumentDOM().getElementProperty("width");
				height = fl.getDocumentDOM().getElementProperty("height");
				fl.getDocumentDOM().enterEditMode('inPlace');
				fl.getDocumentDOM().breakApart();
				fl.getDocumentDOM().library.deleteItem(temp.name);
			}
			fl.getDocumentDOM().selection = main_tl.layers[0].frames[0].elements;
			fl.getDocumentDOM().group();
			
			// convert the position up one level in the hierarchy
			var mat = curViewMat;
			var localxPos = xPos;
			var localyPos = yPos;
			xPos = localxPos*mat.a + localyPos*mat.c + mat.tx;
			yPos = localxPos*mat.b + localyPos*mat.d + mat.ty;
			
			var lw = width;
			var lh = height;
			width  = lw*mat.a + lh*mat.c;
			height = lw*mat.b + lh*mat.d
			
			//break the single object to 16 pieces
			breakItem(pieces, xPos, yPos, width, height, libFolderName);
			singleObject = true;
		}
		else
		{
			//if the effect is not a single object, explode each individual object
			fl.getDocumentDOM().distributeToLayers();
			
			//delete the default layer on the top
			main_tl.deleteLayer(0);
			
			//convert all elements in the current timeline to graphics 
			convertToGraphics(libFolderName);
			
			//reorder all layers so that the left most object is on the top layer
			reorderAllLayers();
		}
		
		//inserts duration-1 for outward direction to all layers
		main_tl.insertFrames(dur-1, true); 
		
		//inserts 1 keyframe to the end of the duration on all layers
		main_tl.currentFrame = dur;
		main_tl.insertKeyframe();

		switch (horizontalDir)
		{
			case "Center":
				if (singleObject)
				{
					// the number of layers to process in each chunk
					var nLayersPerChunk = Math.sqrt(pieces);
					var layerIndex0 = 0,  layerIndex1 = layerIndex0 + nLayersPerChunk - 1;
					var yDir = verticalDir == "Down" ? y : -y;
					
					//explode the top left region of the object up
					leftExplode(layerIndex1, dur, alpha, angle, x, yDir, wid, hei, layerIndex0);
					
					//explode the bottom left region of the object down
					layerIndex0 += nLayersPerChunk;  layerIndex1 = layerIndex0 + nLayersPerChunk - 1;
					leftExplode(layerIndex1, dur, alpha, angle, x, yDir, wid, hei, layerIndex0);
					
					//explode the top right region of the object up
					layerIndex0 += nLayersPerChunk;  layerIndex1 = layerIndex0 + nLayersPerChunk - 1;
					rightExplode(layerIndex0, dur, alpha, angle, x, yDir, wid, hei, layerIndex1);
					
					//explode the bottom right region of the object down
					layerIndex0 += nLayersPerChunk;  layerIndex1 = layerIndex0 + nLayersPerChunk - 1;
					rightExplode(layerIndex0, dur, alpha, angle, x, yDir, wid, hei, layerIndex1);
				} 
				else {
					var midIndex = Math.floor((main_tl.layers.length-2)/2);
					if (verticalDir == "Down") {
						leftExplode(midIndex, dur, alpha, angle, x, y, wid, hei, 0);
						rightExplode(midIndex+1, dur, alpha, angle, x, y, wid, hei, main_tl.layers.length-2);
					} else {
						leftExplode(midIndex, dur, alpha, angle, x, y*(-1), wid, hei, 0);
						rightExplode(midIndex+1, dur, alpha, angle, x, y*(-1), wid, hei, main_tl.layers.length-2);
					}
				}
				break;
			
			case "Left":			
				if (singleObject) 
				{
					// the number of layers to process in each chunk
					var nLayersPerChunk = Math.sqrt(pieces);
					var layerIndex0 = 0,  layerIndex1 = layerIndex0 + nLayersPerChunk - 1;
					var yDir = verticalDir == "Down" ? y : -y;
					
					//explode the top left region of the object up
					leftExplode(layerIndex1, dur, alpha, angle, x, yDir, wid, hei, layerIndex0);
					
					//explode the bottom left region of the object down
					layerIndex0 += nLayersPerChunk;  layerIndex1 = layerIndex0 + nLayersPerChunk - 1;
					leftExplode(layerIndex1, dur, alpha, angle, x, yDir, wid, hei, layerIndex0);
					
					//explode the top right region of the object up
					layerIndex0 += nLayersPerChunk;  layerIndex1 = layerIndex0 + nLayersPerChunk - 1;
					leftExplode(layerIndex1, dur, alpha, angle, x, yDir, wid, hei, layerIndex0);
					
					//explode the bottom right region of the object down
					layerIndex0 += nLayersPerChunk;  layerIndex1 = layerIndex0 + nLayersPerChunk - 1;
					leftExplode(layerIndex1, dur, alpha, angle, x, yDir, wid, hei, layerIndex0);
				}
				else
				{
					if (verticalDir == "Down") {
						leftExplode(main_tl.layers.length-2, dur, alpha, angle, x, y, wid, hei, 0);
					} else {
						leftExplode(main_tl.layers.length-2, dur, alpha, angle, x, y*(-1), wid, hei, 0);
					}
				}
				break;
				
			case "Right":
				if (singleObject) 
				{
					// the number of layers to process in each chunk
					var nLayersPerChunk = Math.sqrt(pieces);
					var layerIndex0 = 0,  layerIndex1 = layerIndex0 + nLayersPerChunk - 1;
					var yDir = verticalDir == "Down" ? y : -y;
					
					//explode the top left region of the object up
					rightExplode(layerIndex0, dur, alpha, angle, x, yDir, wid, hei, layerIndex1);
					
					//explode the bottom left region of the object down
					layerIndex0 += nLayersPerChunk;  layerIndex1 = layerIndex0 + nLayersPerChunk - 1;
					rightExplode(layerIndex0, dur, alpha, angle, x, yDir, wid, hei, layerIndex1);
					
					//explode the top right region of the object up
					layerIndex0 += nLayersPerChunk;  layerIndex1 = layerIndex0 + nLayersPerChunk - 1;
					rightExplode(layerIndex0, dur, alpha, angle, x, yDir, wid, hei, layerIndex1);
					
					//explode the bottom right region of the object down
					layerIndex0 += nLayersPerChunk;  layerIndex1 = layerIndex0 + nLayersPerChunk - 1;
					rightExplode(layerIndex0, dur, alpha, angle, x, yDir, wid, hei, layerIndex1);
				} 
				else
				{
					if (verticalDir == "Down") {
						rightExplode(0, dur, alpha, angle, x, y, wid, hei, main_tl.layers.length-2);
					} else {
						rightExplode(0, dur, alpha, angle, x, y*(-1), wid, hei, main_tl.layers.length-2);
					}
				}
				break;
		}		
		
		//clean up the extra keyframes and frames added in saved layer
		cleanUpSaveLayer(dur);
		
		//bring the current view back to the main stage 
		fl.getDocumentDOM().exitEditMode();
		
		// reset the selection to the effect object
		Object.fxutil.resetSelection( theEffectObj,  theCurrentFrameNum,  theCurrentLayer );
		
		// move the folder to the effects folder
		fl.getDocumentDOM().library.moveToFolder(topLevelFolderName,  libFolderName);
		
		//move playhead back to original location
		fl.getDocumentDOM().getTimeline().currentFrame = curFrame;
		
		if (preview)
		{
			// Export the preview swf
			Object.fxutil.exportPreviewSWF( fl.getDocumentDOM().selection[0] );
		}
	} 
	catch (e) {
		alert(e);
	}
}


function doAlert( str )
{
	//alert( str );
}


function traceParameters(preview, dur, verticalDir, horizontalDir, y, x, angle, alpha, wid, hei)
{
	Object.fxutil.myTrace(1, "preview=" + preview);
	Object.fxutil.myTrace(1, "dur=" + dur);
	Object.fxutil.myTrace(1, "verticalDir=" + verticalDir);
	Object.fxutil.myTrace(1, "horizontalDir=" + horizontalDir);
	Object.fxutil.myTrace(1, "y=" + y);
	Object.fxutil.myTrace(1, "x=" + x);
	Object.fxutil.myTrace(1, "angle=" + angle);
	Object.fxutil.myTrace(1, "alpha=" + alpha);
	Object.fxutil.myTrace(1, "wid=" + wid);
	Object.fxutil.myTrace(1, "hei=" + hei);
}
