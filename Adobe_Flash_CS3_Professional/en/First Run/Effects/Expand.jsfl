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
		fl.runScript(fl.configURI + "Effects/shared.jsfl");
		Object.fxutil.myTrace(0, "Expand.reverse()");
		
		// save the selected state
		var theEffectObj = fl.getDocumentDOM().selection[0];	
		var tmpTL    = fl.getDocumentDOM().getTimeline();
		var tmpLayer = tmpTL.layers[ tmpTL.currentLayer ];
		var tmpFrame = tmpLayer.frames[ tmpTL.currentFrame ];
		var theCurrentFrameNum = tmpFrame.startFrame;
		var theCurrentLayer = tmpTL.currentLayer;

		//enter edit mode of the selected item
		fl.getDocumentDOM().enterEditMode("inPlace");
		
		var local_tl = fl.getDocumentDOM().getTimeline();
		var numLayer = local_tl.layers.length - 1;
		
		//remove all layers except for Saved layer
		for (var i = 0; i < numLayer; i++)
			local_tl.deleteLayer(0);

		local_tl.setLayerProperty("visible", true);
		local_tl.setLayerProperty("layerType", "normal");
		local_tl.setLayerProperty("locked", false);
		
		//bring current view back to main stage
		fl.getDocumentDOM().exitEditMode();
		
		//remove the frames added on the main timeline
		var main_tl = fl.getDocumentDOM().getTimeline();
		var selectedFrames = main_tl.getSelectedFrames();
		var removeStart = selectedFrames[1];
		var removeEnd   = selectedFrames[2];
		main_tl.removeFrames(selectedFrames[1]+1, selectedFrames[2]);
		main_tl.setSelectedFrames(selectedFrames[1], selectedFrames[1]+1);
		
		// reset the selection
		Object.fxutil.resetSelection( theEffectObj, theCurrentFrameNum,  theCurrentLayer );
	}
	catch (e)
	{
		fl.trace("Exception in reverse: " + e);
	}
}

//save the original graphics or text to use for removeEffect later
function saveOriginal()
{
	try
	{
		var save_tl = fl.getDocumentDOM().getTimeline();

		//add a new layer named "Saved", type guide, below the current layer
		save_tl.addNewLayer("Saved x=", "guide", false);
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
function cleanUpSaveLayer(outDur, inDur){
	var cur_tl = fl.getDocumentDOM().getTimeline();
	cur_tl.setSelectedLayers(cur_tl.layers.length-1, true);
	cur_tl.removeFrames(1, outDur+inDur+1);
}


//expand the selected object from right to left from index
function toLeftExpand(index, dur, x, y, wid, hei, inputSpace)
{
	try
	{
		doAlert( "toLeftExpand, layer: " + index );
	
		var cur_tl = fl.getDocumentDOM().getTimeline();
		var leftSpace = inputSpace*(-1);
		var inc   = 1;
		var curSelect = new Array();
		var firstFrame;
		var xScale = 0;
		var yScale = y;
		var firstRound = true;

		for (var i=index; i>=0; i--)
		{
			doAlert( "next left tween, layer: " + i );
				cur_tl.currentLayer = i;
				cur_tl.setSelectedFrames(dur, dur+1, true);
				fl.getDocumentDOM().selectNone();
				doAlert( "after selectNone" );
				
				curSelect[0] = cur_tl.layers[i].frames[dur].elements[0];	
				curSelect[0].width += (wid*inc);
				curSelect[0].height += (hei*inc);
				//cur_tl.layers[i].frames[dur].elements[0] = curSelect;
				fl.getDocumentDOM().selection = curSelect;
				doAlert( "after set selection" );
				
				xScale = (leftSpace*inc) + (x);
				fl.getDocumentDOM().moveSelectionBy({x:xScale, y:yScale});
				leftSpace -= arguments[6];
				inc++;
				firstFrame = dur-dur;
				cur_tl.setSelectedFrames(firstFrame, firstFrame+1, true);
				cur_tl.setFrameProperty("tweenType", "motion");
				
			doAlert( "tween created" );
		}
	}
	catch (e)
	{
		fl.trace("Exception in toLeftExpand: " + e);
	}
}

//expand the selected object from left to right from index
function toRightExpand(index, dur, xPos, yPos, wid, hei, inputSpace)
{
	try
	{
		doAlert( "toRightExpand, layer: " + index );
		
		var cur_tl = fl.getDocumentDOM().getTimeline();
		var rightSpace = inputSpace;
		var inc = 1;
		var curSelect = new Array();
		var firstFrame;
		var xScale = 0;
		var yScale = yPos;
		var firstRound = true;

		for (var i=index; i<cur_tl.layers.length-1; i++) 
		{
			doAlert( "next right tween, layer: " + i );
				
				cur_tl.currentLayer = i;
				cur_tl.setSelectedFrames(dur, dur+1, true);
				fl.getDocumentDOM().selectNone();
				
				curSelect[0] = cur_tl.layers[i].frames[dur].elements[0];
				curSelect[0].width += (wid*inc);
				curSelect[0].height += (hei*inc);
				cur_tl.layers[i].frames[dur].elements[0] = curSelect[0];
				fl.getDocumentDOM().selection = curSelect;
				
				xScale = (rightSpace*inc) + xPos;			
				fl.getDocumentDOM().moveSelectionBy({x:xScale, y:yScale});
				rightSpace += inputSpace;
				
				inc++;
				firstFrame = 0;
				cur_tl.setSelectedFrames(firstFrame, firstFrame+1, true);
				cur_tl.setFrameProperty("tweenType", "motion");
			
			doAlert( "right tween created" );
		}	
	}
	catch (e)
	{
		fl.trace("Exception in toRightExpand: " + e);
	}
}

//move the selected object back in the original position 
function squeeze(odur, idur)
{
	try
	{
		var cur_tl = fl.getDocumentDOM().getTimeline();
		var firstFrame = arguments[0];
		
		//inserts duration for inward direction to all layers
		cur_tl.insertFrames(arguments[1], true, arguments[0]-1); 
			
		// select everything
		cur_tl.selectAllFrames();
		
		//inserts 1 keyframe to the end of the duration on all layers
		cur_tl.currentFrame = arguments[1] + arguments[0];
		cur_tl.insertKeyframe();

		for (var i=0; i<cur_tl.layers.length-1; i++) {
			cur_tl.currentLayer = i;
			cur_tl.setSelectedFrames(firstFrame, firstFrame+1, true);
			cur_tl.setFrameProperty("tweenType", "motion");
		}	
	}
	catch (e)
	{
		fl.trace("Exception in squeeze: " + e);
	}
}

//move the layer that contains the object on the left to the top
function reorderAllLayers()
{
	try
	{
		var cur_tl = fl.getDocumentDOM().getTimeline();
		var nextLayer;
		var correctOrder = checkLayerOrder();

		while(!correctOrder) {
			nextLayer = 0;
			for (var i=0; i<cur_tl.layers.length-1; i++) {
				nextLayer++;
				if(nextLayer < cur_tl.layers.length-1) {
					if (cur_tl.layers[i].frames[0].elements[0].left > cur_tl.layers[nextLayer].frames[0].elements[0].left) {
						cur_tl.reorderLayer(nextLayer, i);
					}
				}
			}

			correctOrder = checkLayerOrder();
		}
	}
	catch (e)
	{
		fl.trace("Exception in reorderAllLayers: " + e);
	}
}

//check all the object in each layer return true if the left side of the object on the top layer is larger than the left side of the object on the bottom layer

function checkLayerOrder()
{
	var success = true;
	try
	{
		var cur_tl = fl.getDocumentDOM().getTimeline();
		for (var j=0; j<cur_tl.layers.length-2; j++) {
			if (cur_tl.layers[j].frames[0].elements[0].left > cur_tl.layers[j+1].frames[0].elements[0].left) {
				success = false;
				j=cur_tl.layers.length;
			}
		}
	}
	catch (e)
	{
		fl.trace("Exception in checkLayerOrder: " + e);
	}
	return success;
}

/**
 * Perform the effect. 
 */
function executeEffect()
{
	var ef = fl.activeEffect;
	forward( false, ef.outDur, ef.inDur, ef.direction, ef.space, ef.xScale, ef.yScale, ef.wid, ef.hei)
}





/**
* Implementation of the  effect. This could be called from
* the effect file or from the preview.
*
*      @param preview Boolean: True to create a preview swf.
*      <property name="Expand Duration" variable="outDur" min="1" defaultValue="20" type="Number" />		
*      <property name="Squeeze Duration" variable="inDur" min="0" defaultValue="0" type="Number" />		
*      <property name="Expand Direction" variable="direction" list="From Center,To Left,To Right" defaultValue="0" type="Strings" />
*      <property name="Expand Spacing" variable="space" defaultValue="20" type="Number" />
*      <property name="Shift Horizontal by" variable="xScale" defaultValue="0" type="Number" />
*      <property name="Shift Vertical by" variable="yScale" defaultValue="0" type="Number" />
*      <property name="Extend Width by" variable="wid" defaultValue="0" type="Number" />
*      <property name="Extend Height by" variable="hei" defaultValue="0" type="Number" />*/
function forward(preview, outDur, inDur, direction, space, xScale, yScale, wid, hei)
{
	try
	{
		doAlert("forward, outDur: " + outDur + ", inDur: " + inDur);
	
		fl.runScript(fl.configURI + "Effects/shared.jsfl");
		Object.fxutil.myTrace(0, "Expand.forward()");
		traceParameters(preview, outDur, inDur, direction, space, xScale, yScale, wid, hei);

		try
		{
			fl.enableImmediateUpdates( true );
			fl.runScript(fl.configURI + "Effects/shared.jsfl");
				
			//var ef = fl.activeEffect;	
			var curFrame = fl.getDocumentDOM().getTimeline().currentFrame;
			
			// save the selected state
			var theEffectObj = fl.getDocumentDOM().selection[0];
			var tmpTL    = fl.getDocumentDOM().getTimeline();
			var tmpLayer = tmpTL.layers[ tmpTL.currentLayer ];
			var tmpFrame = tmpLayer.frames[ tmpTL.currentFrame ];
			var theCurrentFrameNum = tmpFrame.startFrame;
			var theCurrentLayer = tmpTL.currentLayer;

			var effectSymbolName = theEffectObj.libraryItem.name;
			
			//create a folder in the library, stores all effects graphics in there
			var cur_lib = fl.getDocumentDOM().library;
			var curItemName = fl.getDocumentDOM().selection[0].libraryItem.name;
			var libFolderName = Object.fxutil.getEffectsFolderName();

			//insert out duration + in duration frames on the main timeline, on current layer
			var nToInsert = inDur + outDur - 1;
			if (nToInsert > 0)
				fl.getDocumentDOM().getTimeline().insertFrames(nToInsert, false);
			
			// select the frames
			Object.fxutil.resetSelection( theEffectObj,  theCurrentFrameNum,  theCurrentLayer);
			
			//enters edit Symbol mode for selected object created by Effect
			fl.getDocumentDOM().enterEditMode("inPlace");
			doAlert( "edit in place" ); 
			
			// get the timeline for this symbol
			var main_tl = fl.getDocumentDOM().getTimeline();
			
			//save original graphics or text to a guide layer, set the guide layer to invisible and locked
			saveOriginal();
			fl.getDocumentDOM().selectAll();
			var sel = fl.getDocumentDOM().selection;

			//breakapart the selected object if it is text
			if ((sel.length == 1) && (sel[0].elementType == "text") && (sel[0].length > 1)) 
				fl.getDocumentDOM().breakApart();	
			
			// distribute everything to it's own layer
			fl.getDocumentDOM().distributeToLayers();
			doAlert( "after distributeToLayers" );

			//delete the default layer on the top
			main_tl.setSelectedLayers(0, true);
			main_tl.deleteLayer();
			
			//reorder all layers so that the left most object is on the top layer
			reorderAllLayers();
			
			//inserts duration-1 for outward direction to all layers
			main_tl.insertFrames(outDur-1, true);
			
			// select everything
			main_tl.selectAllFrames();
			doAlert("after insertFrames" );
			
			//inserts 1 keyframe to the end of the duration on all layers
			main_tl.currentFrame = outDur;
			main_tl.insertKeyframe();

			if (inDur > 0)
			{
				doAlert("** squeeeeeze: " + outDur + ", " + inDur); 
				squeeze(outDur, inDur);
			}
		
			switch(direction) {
				case "From Center":
					var midIndex = Math.floor((main_tl.layers.length-2)/2);
					toLeftExpand(midIndex, outDur-1, xScale, yScale, wid, hei, space);
					toRightExpand(midIndex+1, outDur-1, xScale, yScale, wid, hei, space);
					break;

				case "To Left":
					toLeftExpand(main_tl.layers.length-2, outDur-1, xScale, yScale, wid, hei, space);
					break;

				case "To Right":
					toRightExpand(0, outDur-1, xScale, yScale, wid, hei, space);
					break;
			}
			doAlert( "after create tweens" );
			
			//clean up the extra keyframes and frames added in saved layer
			cleanUpSaveLayer(outDur, inDur);
			
			//bring the current view back to the main stage
			doAlert( "about to exit" );
			fl.getDocumentDOM().exitEditMode();
			
			// return to the start frame
			fl.getDocumentDOM().getTimeline().currentFrame = curFrame;
			
			//move playhead back to original location
			fl.getDocumentDOM().getTimeline().currentFrame = curFrame;
		
			// reset the selection
			Object.fxutil.resetSelection( theEffectObj, theCurrentFrameNum,  theCurrentLayer );
			
			if (preview)
			{
				// Export the preview swf
				Object.fxutil.exportPreviewSWF( fl.getDocumentDOM().selection[0] );
			}

		
		
		} catch (e) {
			alert(e);
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


function traceParameters(preview, outDur, inDur, direction, space, xScale, yScale, wid, hei)
{
	Object.fxutil.myTrace(1, "Expand Parameters:");
	Object.fxutil.myTrace(2, "preview=" + preview);
	Object.fxutil.myTrace(2, "outDur=" + outDur);
	Object.fxutil.myTrace(2, "inDur=" + inDur);
	Object.fxutil.myTrace(2, "direction=" + direction);
	Object.fxutil.myTrace(2, "space=" + space);
	Object.fxutil.myTrace(2, "xScale=" + xScale);
	Object.fxutil.myTrace(2, "yScale=" + yScale);
	Object.fxutil.myTrace(2, "wid=" + wid);
	Object.fxutil.myTrace(2, "hei=" + hei);
}
