/**
 * Duplicate selected items onto new layers with various interpolations for each duplicate.
 *
 * @author Tamir Scheinok, Fluid Inc
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
	//fl.trace("configureEffect(distributedduplicate)");
}


	
/**
 * Perform the effect. 
 */
function executeEffect()
{
	//set up trace and output window
	//fl.outputPanel.clear();

//	Object.fxutil.myTrace(0,"executeEffect()");
	var ef = fl.activeEffect;
	forward( false, ef.numcopies, ef.offsetx, ef.offsety, ef.offsetrotation, ef.scalex, ef.scaley, ef.scalemethod, ef.changealpha, ef.finalalpha, ef.changetint, ef.finaltint, ef.offsetframes);
//	Object.fxutil.myTrace(0,"successful completion");
}


/**
* Implementation of the  effect. This could be called from
* the effect file or from the preview.
*
*      @param preview Boolean: True to create a preview swf.
*	<property name="Number of Copies" variable="numcopies" min="1" defaultValue="5" type="Number" />
*	<property name="Offset X" variable="offsetx" min="-99999" defaultValue="25" type="Double" />
*	<property name="Offset Y" variable="offsety" min="-99999" defaultValue="25" type="Double" />
*	<property name="Offset Rotation" variable="offsetrotation" min="0" defaultValue="0" type="Double" />
*	<property name="Scale X" variable="scalex" min="0" defaultValue="100" type="Double" />
*	<property name="Scale Y" variable="scaley" min="0" defaultValue="100" type="Double" />
*	<property name="Scale Method" variable="scalemethod" list="exponential,linear" defaultValue="'exponential'" type="Strings" />
*	<property name="Change Alpha" variable="changealpha" list="yes,no" defaultValue="no" type="Strings" />
*	<property name="Final Alpha" variable="finalalpha" min="0" defaultValue="100" type="Double" />
*	<property name="Change Tint" variable="changetint" list="yes,no" defaultValue="no" type="Strings" />
*      <property name="Final Tint" variable="finaltint" min="0" max="17895690" defaultValue="10066329" type="Number" />
*	<property name="Offset Frames" variable="offsetframes" min="0" defaultValue="0" type="Number" />
*/
function forward(preview, numcopies, offsetx, offsety, offsetrotation, scalex, scaley, scalemethod, changealpha, finalalpha, changetint, finaltint, offsetframes)
{
	try
	{
		doAlert("forward");

		fl.enableImmediateUpdates( true );
		fl.runScript(fl.configURI + "Effects/shared.jsfl");
		traceParameters(numcopies, offsetx, offsety, offsetrotation, scalex, scaley, scalemethod, changealpha, finalalpha, changetint, finaltint, offsetframes);

		//main timeline declarations
		var dom = fl.getDocumentDOM();
		var maintl = dom.getTimeline();
		var ef = fl.activeEffect;
		
		// save the state	
		var myCurrentFrame = maintl.layers[maintl.currentLayer].frames[maintl.currentFrame];
		var EffectStartFrame = myCurrentFrame.startFrame;
		var effectLayerIndex = maintl.currentLayer; 

		// save the initial state
		var theEffectObj = fl.getDocumentDOM().selection[0];
		var firstFrameOfEffect = Object.fxutil.getEffectStartFrame();
		var theCurrentLayer = fl.getDocumentDOM().getTimeline().currentLayer;
		
		//get unique library name
		var libName = "";
		libName = Object.fxutil.generateLibName();
		doAlert( "Unique Library Name: " + libName);
				
		// add frames to auto-generated (main) effect layer
		if (offsetframes > 0) //we only need extra frames if the symbol is a graphic
		{
			maintl.insertFrames((numcopies * offsetframes) -1   , false, EffectStartFrame);	
			Object.fxutil.resetSelection( theEffectObj,  firstFrameOfEffect,  theCurrentLayer);
		}
		
		//opens the timeline of the auto-generated graphic symbol
		//moves one level inside the effect's symbol)
		dom.enterEditMode("inPlace");
		doAlert("in edit mode");
		
		// get the fill before converting to a symbol 
		var fill = dom.getCustomFill();
		if (fill.style == "noFill")
			fill = dom.getCustomFill( true );	
		
		// convert the shape into specified type
		var mySymbolName = dom.convertToSymbol("graphic", libName, "center"); 
		Object.fxutil.moveToEffectsFolder(mySymbolName.name);
		
		//copy will be used to make duplicates
		//remember we are copying a symbol, not a shape
		dom.clipCopy(); 

		//set initial values for use in interpolation
		var tl=fl.getDocumentDOM().getTimeline(); //we are one level down, inside the effect's symbol
		var originalinstance = tl.layers[0].frames[0].elements[0];
		
		var lastwidth = originalinstance.width;
		var lastheight = originalinstance.height;
		var alphaoffset = (finalalpha - originalinstance.colorAlphaPercent) / numcopies ;
		
		var fillcolor = parseInt(fill.color.substr(2,6), 16); // fillcolor as a **string** representing hex color (removes the 0x or #)
		var red= 		((fillcolor >> 16 ) & 0xff); 	//(int 0-255)
		var green= 	((fillcolor >> 8) & 0xff); 		//(int 0-255)
		var blue= 	(fillcolor & 0xff);	 		//(int 0-255)
		var redoffset = 	((	((finaltint >> 16 ) & 0xff) - 	((fillcolor >> 16 ) & 0xff)   	) 	/ numcopies); //(int 0-255)
		var greenoffset=	((  	((finaltint >> 8 ) & 0xff)   - 	((fillcolor >> 8 ) & 0xff)  	) 	/ numcopies); //(int 0-255)
		var blueoffset = 	((  	(finaltint & 0xff )   - 			(fillcolor & 0xff)  			) 	/ numcopies); //(int 0-255)
		Object.fxutil.myTrace(1, "original.color=" + fill.color + "  " + ((fillcolor >> 16 ) & 0xff)  + ", " + ((fillcolor >> 8) & 0xff)  + ", " + (fillcolor & 0xff));
		Object.fxutil.myTrace(1, "original.coloroffset =" +  redoffset + ", " + greenoffset  + ", " + blueoffset);

		//set auto generated layer name
		//tl.layers[0].name='Duplicates';  
		
		// add frames to tl.layers[0] of the effect's symbol's timeline
		if (offsetframes > 0) 
		{
			tl.insertFrames((numcopies * offsetframes) -1   , false);	
			Object.fxutil.myTrace (2, "Adding frames " +  ((numcopies * offsetframes)-1 ));
		}
		
		//cycle through duplication and interpolation
		for (var i= 1; i <= numcopies  ; i++) 
		{
			//make new layer if needed and paste duplicate
			//notice the differing value for myinstance
			//dom.selectNone();
			tl.addNewLayer('Distribute ' +( i +1), "normal", false);
			tl.layers[i].effectLayer = true;
			tl.setSelectedLayers(i, true); //set this layer as the selected one
			tl.currentLayer = i;  //set this layer as the current one
			Object.fxutil.myTrace(1, "copy:" + i + " layer:" + i + " element:" + 0);
			dom.clipPaste(true);
			var myinstance = tl.layers[i].frames[0].elements[0]; 
			

			// interpolate position
			if ((offsetx != 0) || (offsety != 0) )
			{
				dom.moveSelectionBy({x:offsetx*i, y:offsety*i});
				Object.fxutil.myTrace(2,"offset: " + offsetx +"," +offsety);
			}			

			// interpolate scale
			if ((scalex != 100) || (scaley != 100) )
			{
				if (scalemethod == 'exponential')
				{		
					myinstance.width = (lastwidth*scalex/100);
					myinstance.height = (lastheight*scaley/100);
					lastwidth = myinstance.width;
					lastheight = myinstance.height;
					Object.fxutil.myTrace(2,"exponential scaling by: " + scalex/100);
				} else {	
					//linear interpolation
					myinstance.width *=   1 + ((scalex - 100) * i /100);
					myinstance.height *=   1 + ((scalex - 100) * i /100);
					Object.fxutil.myTrace(2,"linear scaling by: " + ( 1 + ((scalex - 100) * i /100)));
				}
			}
			
			// interpolate rotation
			if (offsetrotation != 0)
			{
				dom.rotateSelection(i * offsetrotation);
				Object.fxutil.myTrace(2,"rotate: " + i * offsetrotation);
			}

			// interpolate tint
			if (changetint =='yes')
			{			
				red += redoffset ;
				green += greenoffset ;
				blue += blueoffset;
				Object.fxutil.myTrace(2, "color="  + Math.round(red) + ", " + Math.round(green) + ", " +Math.round(blue));
				
				myinstance.colorRedPercent = 0;
				myinstance.colorGreenPercent = 0;
				myinstance.colorBluePercent = 0;
				myinstance.colorRedAmount = Math.round(red);
				myinstance.colorGreenAmount = Math.round(green);
				myinstance.colorBlueAmount = Math.round(blue);
			}

			// interpolate alpha
			if ((changealpha == 'yes') && (alphaoffset !=0))
			{		
				myinstance.colorAlphaPercent += ( i * alphaoffset);
				Object.fxutil.myTrace(2, "alpha=" + myinstance.colorAlphaPercent);
			}

			// offset starting key frame if needed
			if (offsetframes > 0)
			{
				//dom.selectNone();
				tl.clearFrames(0, (i *offsetframes)-1);
				Object.fxutil.myTrace (2, "Clearing Frames 1 to "+ (i *offsetframes) );
			}
			
			// set frame back to 0 to help with removeEffect!
			tl.currentFrame = 0;
		}

		

		// return to the main timeline (the one we started with)
		doAlert("about to exit");
		dom.exitEditMode();
		
		// restore the state
		Object.fxutil.resetSelection( theEffectObj,  firstFrameOfEffect,  theCurrentLayer);
		
		// export a preview
		if (preview)
		{
			// Export the preview swf
			Object.fxutil.exportPreviewSWF( dom.selection[0] );
		}
		
		doAlert("forward finished");
	}
	catch (e)
	{
		fl.trace("Exception in forward: " + e);
	}
}


/**
 * Calls reverse()
 */
function removeEffect()
{
//	fl.outputPanel.clear();
//	Object.fxutil.myTrace(0, "Distributed Duplication: clear");
	reverse();
}


/**
 * Performs the operations necessary to remove the effect
 */
function reverse()
{
	try
	{
		doAlert("reverse");
	
		fl.runScript(fl.configURI + "Effects/shared.jsfl");
		Object.fxutil.myTrace(0, "DDup.reverse()");

		// save the initial state
		var theEffectObj = fl.getDocumentDOM().selection[0];
		var firstFrameOfEffect = Object.fxutil.getEffectStartFrame();
		var theCurrentLayer = fl.getDocumentDOM().getTimeline().currentLayer;
		
		var dom = fl.getDocumentDOM();
		//opens the timeline of the auto-generated symbol
		//moves one level inside the effect's symbol)
		dom.enterEditMode("inPlace");
		doAlert("in edit mode"); 
		
		var localTL = fl.getDocumentDOM().getTimeline();

		//remove all layers except for original layer [0]
		var numLayer = localTL.layers.length-1;
		for (var i = numLayer; i >0 ; i--) 
		{

			if (localTL.layers[i].effectLayer == true)
			{
				Object.fxutil.myTrace(2, "Removing Layer[" + i + "]");
				localTL.deleteLayer(i);
			}
		}
		doAlert("layers deleted");
		
		var myLayer = 0;	
		localTL.currentLayer = myLayer;
		var fcNum = localTL.layers[myLayer].frameCount;
		localTL.setSelectedFrames([myLayer, 0, fcNum], true);
		if (fcNum > 1 ) //if there are more than one frames we need to delete them
		{
			Object.fxutil.myTrace(3, "Removing Effect Timeline Layer["+myLayer+ "]" + "Frames[1," + (fcNum-1)+"]"   );
			localTL.removeFrames(1, fcNum - 1);
		}
		doAlert("frames removed");
		

		localTL.currentFrame = 0;
		fl.getDocumentDOM().selectAll();
		var libItem = dom.selection[0].libraryItem;
		fl.getDocumentDOM().breakApart();
		
		// delete the library item
		var libName = libItem.name;
		dom.library.deleteItem(libName);
		
		// go back to the main timeline
		doAlert("before exit");
		fl.getDocumentDOM().exitEditMode();
		
		// delete the folder if it is empty
		if (Object.fxutil.folderIsEmpty())
		{
			doAlert( "deleting effects folder" );
			fl.getDocumentDOM().library.deleteItem( Object.fxutil.getEffectsFolderName() );
		}
	    
		//clear out the extra frames added by effects
		var topTL = fl.getDocumentDOM().getTimeline();
		var currentLayer = topTL.currentLayer;
		var selectedFrames = topTL.getSelectedFrames();
		if (selectedFrames[1]+1 < selectedFrames[2] )  //if we added frames we need to delete them from the right layer
		{
			Object.fxutil.myTrace(3, "Removing Timeline Layer["+selectedFrames[0]+ "]" + " Frames[" + (selectedFrames[1]+1)+ "," + (selectedFrames[2]) +"]" );
			topTL.removeFrames(selectedFrames[1]+1, selectedFrames[2]);
		}
		
		var myArray = new Array(currentLayer, selectedFrames[1], selectedFrames[1]+1);
		Object.fxutil.myTrace(3, "Selecting Timeline " + myArray);
		topTL.setSelectedFrames(myArray, true);	
		
		Object.fxutil.resetSelection( theEffectObj,  firstFrameOfEffect,  theCurrentLayer);

		doAlert("reverse finished");
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


function traceParameters(numcopies, offsetx, offsety, offsetrotation, scalex, scaley, scalemethod, changealpha, finalalpha, changetint, finaltint, offsetframes)
{
	Object.fxutil.myTrace(1,"DDup Parameters" ); 
	Object.fxutil.myTrace(2,"numcopies=" + numcopies ); 
	Object.fxutil.myTrace(2,"offsetx,y=" + offsetx + "," + offsety );
	Object.fxutil.myTrace(2,"offsetrotation=" + offsetrotation ); 
	Object.fxutil.myTrace(2,"scalex,y=" + scalex + "," + scaley + " scalemethod=" + scalemethod);
	Object.fxutil.myTrace(2,"changealpha=" + changealpha + " finalalpha=" + finalalpha ); 
	Object.fxutil.myTrace(2,"changetint=" + changetint );  //yes,no
	Object.fxutil.myTrace(2,"finaltint=" +  ((finaltint >> 16 ) & 0xff) +", " +((finaltint >> 8 ) & 0xff) +", " +(finaltint & 0xff) );
	Object.fxutil.myTrace(2,"offsetframes=" + offsetframes);
}
	
