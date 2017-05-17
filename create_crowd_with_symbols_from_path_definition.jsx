
/*
Includes the SCALE constructor - this mimics the basic behaviour of d3.scale
*/
#include utilities/scale.jsx

/*
Includes the BINS constructor - this takes a max, min and avg value and creates probability 'bins' 
to aid in the distribution of generated values across a given range
*/
#include utilities/bins.jsx

/*
Includes the POINTS_IN_A_SQUARE constructor - This will create a semi-random distribution of points in a 
given square, checking whether they are valid according to a passed in function.
*/
#include utilities/points_in_square.jsx

/*
No built-in support for Math.cbrt, so adding it here
*/
Math.cbrt = Math.cbrt || function(x) {
  var y = Math.pow(Math.abs(x), 1/3);
  return x < 0 ? -y : y;
};

/*
No built-in support for Array.indexOf, so adding it here
*/
Array.prototype.indexOf = Array.prototype.indexOf || function(value, start) {  
      for (var i = 0, length = this.length; i < length; i++) {  
        if (this[i] == value) {  
          return i;  
        }  
      }  
      return -1;  
} 

/*
Creates the variable 'doc' and either assigns the current file to it, or opens a new file and assigns that.
*/
var doc; 

if (app.documents.length > 0) {
    doc = app.activeDocument;
}
else {
    doc = app.documents.add()
}

/*
Creates a new layer named 'Crowd_layer'. This will eventually hold the crowd.
*/
var layer = doc.layers.add()
layer.name = "Crowd_layer"

/*
Array selected_symbols will hold the symbols chosen later by the user from the dialog box.
*/
var selected_symbols = [];

/*
Variable crowd_size will gold the number of points in the crowd input later by the user in the dialog box.
*/
var crowd_size;

/*
Calls function to create and display dialog box to user
*/
create_dialog ()

function create_dialog () {
    
/*
Creates dialog box and assigns it to variable dlg
*/
    var dlg = new Window("dialog"); 
	
	var w = 350;
	var h = 650;
	
/*
Sets size of dialog box
*/
    dlg.size = [w, h]
    
/*
Assigns all symbols present in document to symbols variable.
Loops through these, pushing symbol names to new array symbolNameArray.
*/
    var symbols = doc.symbols;
    var symbolNameArray = []
    
    for (var i = 0; i < symbols.length; i++) {
        symbolNameArray.push(symbols[i].name)
    }

/*
Adds control to input the number of points in the crowd.
*/ 
    dlg.crowdSize = dlg.add('group',undefined, 'Threshold:');
    dlg.crowdSize.label = dlg.crowdSize.add('statictext', [15, 15, (w/2), 35], 'crowd size:');
    dlg.crowdSize.input = dlg.crowdSize.add('edittext', [15, 15, (w/2), 35], "100"); 
    
/*
Adds control to select a symbol from all availabe using a dropdown list.
*/ 
    dlg.symbols = dlg.add('group',undefined, 'Threshold:');
    dlg.symbols.label = dlg.symbols.add('statictext', [15, 15,(w)/2,35], 'select a symbol:');
    dlg.symbols.input = dlg.symbols.add('dropdownlist', [15, 15,(w)/2,35], symbolNameArray); 
    dlg.symbols.orientation='row';
    
    dlg.symbolPanel = dlg.add('group',undefined, 'Threshold:')
    dlg.symbolPanel.label  = dlg.symbolPanel.add('statictext', [15, 15,w,35], '');
    dlg.symbolPanel.orientation='column';
    
/*
Adds control to input probability associated with selected symbol.
The probability (as a decimal proportion of 1) sets how often that symbol should appear compared to the others selected
*/ 
    dlg.symbolPanel.probability = dlg.symbolPanel.add('group',undefined, 'Threshold:');
    dlg.symbolPanel.probability.label  = dlg.symbolPanel.probability.add('statictext',[15, 15,(w)/2,35], 'probability:');
    dlg.symbolPanel.probability.input  = dlg.symbolPanel.probability.add('edittext', [15, 15,(w)/2,35], "1"); 
    dlg.symbolPanel.probability.orientation='row'; 
    

    dlg.symbolPanel.height = dlg.symbolPanel.add('group',undefined, 'Threshold:');

/*
Adds control to choose a height input method.
*/
    dlg.symbolPanel.height.radio = dlg.symbolPanel.height.add('group',undefined, 'Threshold:'); 
    dlg.symbolPanel.height.radio.label = dlg.symbolPanel.height.radio.add('statictext', [15, 15,(w)/2,35], 'set height by:');
    dlg.symbolPanel.height.radio.range = dlg.symbolPanel.height.radio.add ("radiobutton", undefined, "range");    
    dlg.symbolPanel.height.radio.value = dlg.symbolPanel.height.radio.add ("radiobutton", undefined, "value");        
    dlg.symbolPanel.height.radio.orientation='row';

/*
Shows and hides height input controls depending on selected radio button
*/
    dlg.symbolPanel.height.radio.range.onClick = function(k){
        if (this.value == true) {
            dlg.symbolPanel.height.value.hide()
            dlg.symbolPanel.height.range.show()
        }
    }

    dlg.symbolPanel.height.radio.value.onClick = function(k){
        if (this.value == true) {
            dlg.symbolPanel.height.range.hide()
            dlg.symbolPanel.height.value.show()
        }
    }
        
/*
Adds control for 'range' height input method - allows user to input min, max and avg heights.
*/
    dlg.symbolPanel.height.range = dlg.symbolPanel.height.add('group',undefined, 'Threshold:');
    dlg.symbolPanel.height.range.label  = dlg.symbolPanel.height.range.add('statictext', [15, 15,(w)/2,35], 'height (min/normal/max):');
    dlg.symbolPanel.height.range.minInput  = dlg.symbolPanel.height.range.add('edittext', [15, 15, (w)/5.6, 35], "1"); 
    dlg.symbolPanel.height.range.normalInput  = dlg.symbolPanel.height.range.add('edittext', [15, 15, (w)/5.6, 35], "1.5"); 
    dlg.symbolPanel.height.range.maxInput  = dlg.symbolPanel.height.range.add('edittext', [15, 15, (w)/5.6, 35], "2"); 
    dlg.symbolPanel.height.range.orientation='row';
    dlg.symbolPanel.height.range.hide()

/*
Adds control for 'value' height input method - allows user to input single height value.
*/
    dlg.symbolPanel.height.value = dlg.symbolPanel.height.add('group',undefined, 'Threshold:');
    dlg.symbolPanel.height.value.label  = dlg.symbolPanel.height.value.add('statictext', [15, 15,(w)/2,35], 'height:');
    dlg.symbolPanel.height.value.input  = dlg.symbolPanel.height.value.add('edittext', [15, 15, (w)/5.6, 35], "1"); 
    dlg.symbolPanel.height.value.orientation='row';
    dlg.symbolPanel.height.value.hide()
    
    dlg.symbolPanel.height.orientation='column';
    
/*
This listbox displays all added symbols to the user so they can see what they've chosen.
*/
    dlg.chosenSymbols = dlg.add('listbox', [15, 15,(w),100], [])
    
/*
When clicked, this button takes the current symbol, probability and height values and adds them to the array selected_symbols,
also appending to the chosenSymbols listbox.
*/
    dlg.symbolPanel.commit = dlg.symbolPanel.add('button',undefined, "add symbol"); 
    dlg.symbolPanel.commit.addEventListener('click', function(k){
        
        var symbol = {
        	symbol: symbols.getByName(dlg.symbolPanel.label.text),
        	probability: parseFloat(dlg.symbolPanel.probability.input.text)  
        }

/*
Checks which height input field is visible and adds height data to symbol object accordingly.
*/
        if (dlg.symbolPanel.height.range.visible) {
            symbol.height = {
        		min: parseFloat(dlg.symbolPanel.height.range.minInput.text),
        		normal: parseFloat(dlg.symbolPanel.height.range.normalInput.text),
        		max: parseFloat(dlg.symbolPanel.height.range.maxInput.text)
        	}
        }
        else {
            symbol.height = parseFloat(dlg.symbolPanel.height.value.input.text)
        }
     
        selected_symbols.push(symbol)
         
        dlg.chosenSymbols.add("item",  symbol.symbol.name+" "+symbol.probability);
        
    })
    
/*
Shows and hides the symbol settings panel depending on whether a symbol has been selected from the dropdown.
*/
    dlg.symbolPanel.hide()
    
    dlg.symbols.input.addEventListener('change', function(k){
    	
        dlg.symbolPanel.label.text = this.selection
        dlg.symbolPanel.show()
        
    })
    
/*
When clicked, the submit button hides the dialog box and assigns the input crowd size to crowd_size.
If one or more symbols have been chosen then process_input function is called.
*/
    dlg.submit = dlg.add('button',undefined, "submit"); 
    dlg.submit.addEventListener('click', function(k){
        	
        	dlg.hide();
            
            crowd_size = dlg.crowdSize.input.text;
            
            if (selected_symbols.length > 0){
               process_input()
            }
    })

/*
Shows dialog box to user after it has been fully initialised.
*/
    dlg.show()
} 

function process_input () {
     
	var cumulativeProbability = 0
	
/*
Loops through all selected symbols, and for each assigns it a lower and upper cumulative probability value.
Also assigns an instance of the BINS object to each selected symbol. This provides a means for that symbol
to choose its height based on a randomly generated probability value.
*/
	for (var i = 0; i < selected_symbols.length; i++){  
        
		selected_symbols[i].cumulativeProbability = {
			lower: +cumulativeProbability,
			upper: +cumulativeProbability + parseFloat(selected_symbols[i].probability)
		}
		
		cumulativeProbability += parseFloat(selected_symbols[i].probability);

/*
If a height range has been input, initialise height probability bins.
*/
         
         if (typeof selected_symbols[i].height == "object") {
            selected_symbols[i].bins =  new BINS( selected_symbols[i].height.min,selected_symbols[i].height.max,selected_symbols[i].height.normal).set_num_of_bins(20).generate_bins()
         }
    } 
 
/*
The get_polygon function returns the coordinates of a polygon and assigns it to the polygon variable.
*/
    var polygon = get_polygon ()
    
/*
Passes polygon data to generate_points function.
*/
    generate_points(polygon);
}



function get_polygon () {
    
/*
Gets the path with the name 'crowd-boundary' and assigns it to a vraiable called path.
This will act as the boundary path for our crowd.
*/
    var path = doc.pathItems.getByName("crowd-boundary");
	
/*
Object polygon will hold coordinates and bounding box data for the boundary path.
*/
    var polygon = {}
    
/*
Assigns result of flatten_path function to polygon.co_ordinates.
If the path is already a polygon, the anchor points of that poly will be returned.
If the path contains curves, flatten_path will return a series of points representing those curves.
*/
    polygon.co_ordinates = flatten_path(path);
	
/*
Assigns bounding box data for path to polygon.bounds.
*/
    polygon.bounds = {
        x: path.geometricBounds[0],
        y: path.geometricBounds[1]-path.height,
        width: path.width,
        height: path.height
    }
	
/*
Returns polygon
*/
    return polygon;
}

function generate_points (polygon) {
    
/*
Creates new instance of POINTS_IN_SQUARE, initialising with bounding box data for the boundary path
(points will be generated within this area, then checked to see if they are valid), the number of points 
in the crowd, and a callback function (this will check if a generated point falls within the boundary path)
*/
    var p_sq = new POINTS_IN_SQUARE (
        polygon.bounds,
        parseInt(crowd_size),
        function (point) {
                var result = point_in_polygon(polygon.co_ordinates ,[point.x, point.y])
                return result  
        } 
    ) 
 
/*
Gets array of points generated by p_sq and assigns to points variable
*/
    var points = p_sq.return_points();
    
/*
Loops through list of points, calling append_symbol function for each.
*/
    var i;
    var l = points.length;
    for (i=0; i<l; i++) {
        $.writeln("appending "+i)
        append_symbol(points[i]);
    }
}

function append_symbol (position) {
   
/*
The select_symbol function returns a symbol picked from the available list based on each symbol's probability of being chosen.
*/
         var symbol = select_symbol (); 
	
/*
If a bin is necessary, the select_bin function returns a range within which the selected symbol's 
height may fall.
*/
         var bin;
         if (symbol.bins) {bin = select_bin(symbol.bins)}
	 
/*
Appends symbol to document
*/
		symbolRef = doc.symbolItems.add(symbol.symbol);
   
/*
If heights should bedynamically chosen from within a range, selects height by picking a random value 
within the limits of bin.
Else uses statically input height value.
*/
		var height = symbol.bins ? bin.min + (Math.random() * (bin.max-bin.min)) : symbol.height;
       
/*
Based on the desired height and current height of the symbol, works out what the symbol needs to be scaled by to be the desired height.
*/
        var scale = (height/symbolRef.height)*100
        
/*
Applies scale to symbol.
*/
        symbolRef.resize(scale, scale)
        
/*
Moves symbol to correct x,y position according to passed in coordinates.
*/
        symbolRef.top =  parseFloat(position.y) + symbolRef.height;
        symbolRef.left = parseFloat(position.x);
	
}

function select_bin (bins) {
/*
Creates a random number between 0 and 1, assigns it to random_prob_seed
*/
    var random_prob_seed = Math.random();
	
/*
Creates variable bin to hold chosen bin
*/
    var bin;

/*
Iterates over list of available bins until the cumulative probability associated with the bin exceeds random_prob_seed.
Selects that bin then exits the loop.
*/
     var i;
     var l = bins.length
     for (i=0; i<l; i++) {
           if (random_prob_seed <= bins[i].cumulative_probability ) {
                bin = bins[i]
                break;
           }
     }
 /*
Returns the selected bin
*/
    return bin;
}

function select_symbol () {
/*
Creates a random number between 0 and 1, assigns it to random_prob_seed
*/     
        var random_prob_seed = Math.random();
	
/*
Creates variable symbol to hold chosen symbol
*/
        var symbol;
        
/*
Iterates over list of available symbols until the upper cumulative probability associated with the symbol exceeds random_prob_seed.
Selects that symbol then exits the loop.
*/      
        var i;
        var l = selected_symbols.length
        for (i=0; i<l; i++) {
            if (random_prob_seed <= selected_symbols[i].cumulativeProbability.upper) {
                symbol = selected_symbols[i]
                break;
            }
        }
	
/*
If no symbol has been chosen (because the input probabilities for each symbol did not add up to 1) 
uses the first chosen symbol as default.
*/ 
        if (!symbol) {
            symbol = selected_symbols[0];
        }
/*
Returns the selected symbol
*/
        return symbol;
}

function point_in_polygon (vs, point) { 
        // ray-casting algorithm based on
        // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
/*
This function checks whether a point falls inside or outside a particular polygon where point contains 
the x,y coordinates of the point being tested, and vs is an array of x,y coordinates representing the polygon.
I don't really understand how this works.
*/
        
        var xi, xj, i, intersect,
            x = point[0],
            y = point[1],
            inside = false;
        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
          xi = vs[i][0],
          yi = vs[i][1],
          xj = vs[j][0],
          yj = vs[j][1],
          intersect = ((yi > y) != (yj > y))
              && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
          if (intersect) inside = !inside;
          
        }
        
        return inside;
}


function flatten_path (obj)
{
/*
This function takes path data and returns an array containing the coordinates of that path represented as a polygon.
*/
	var newpath = new Array();
	var curveList;
	var pt, nextpt;
	var isFlattened = false;

	if (!obj.hasOwnProperty ("pathPoints"))
		return null;

	for (pt=0; pt<obj.pathPoints.length; pt++)
	{
		nextpt = pt+1;
		if (nextpt == obj.pathPoints.length)
			nextpt = 0;
		if (obj.pathPoints[pt].anchor[0] == obj.pathPoints[pt].rightDirection[0] && obj.pathPoints[pt].anchor[1] == obj.pathPoints[pt].rightDirection[1] &&
			obj.pathPoints[nextpt].anchor[0] == obj.pathPoints[nextpt].leftDirection[0] && obj.pathPoints[nextpt].anchor[1] == obj.pathPoints[nextpt].leftDirection[1])
		{
			newpath.push (obj.pathPoints[pt].anchor);
		} else
		{
			isFlattened = true;
			curveList = curve4 (obj.pathPoints[pt].anchor[0],obj.pathPoints[pt].anchor[1],
					obj.pathPoints[pt].rightDirection[0],obj.pathPoints[pt].rightDirection[1],
					obj.pathPoints[nextpt].leftDirection[0],obj.pathPoints[nextpt].leftDirection[1],
					obj.pathPoints[nextpt].anchor[0],obj.pathPoints[nextpt].anchor[1],
				4);
			newpath = newpath.concat (curveList);
		}
	}
//	Make path round
//	newpath.push (newpath[0]);
	return newpath;
}

function curve4(
x1, y1,   //Anchor1

            x2, y2,   //Control1

            x3, y3,   //Control2

            x4, y4,   //Anchor2

            nSteps   // Flattening value

                    )

{
	
/*
This function takes a set of bezier anchor points and returns a representation of that curve as a series of co-ordinates.
I don't really know how it works.
*/

          var pointList = new Array();

    var dx1 = x2 - x1;

    var dy1 = y2 - y1;

    var dx2 = x3 - x2;

    var dy2 = y3 - y2;

    var dx3 = x4 - x3;

    var dy3 = y4 - y3;

 

 

    var subdiv_step  = 1.0 / (nSteps + 1);

    var subdiv_step2 = subdiv_step*subdiv_step;

    var subdiv_step3 = subdiv_step*subdiv_step*subdiv_step;

 

 

    var pre1 = 3.0 * subdiv_step;

    var pre2 = 3.0 * subdiv_step2;

    var pre4 = 6.0 * subdiv_step2;

    var pre5 = 6.0 * subdiv_step3;

 

 

    var tmp1x = x1 - x2 * 2.0 + x3;

    var tmp1y = y1 - y2 * 2.0 + y3; 

 

 

    var tmp2x = (x2 - x3)*3.0 - x1 + x4;

    var tmp2y = (y2 - y3)*3.0 - y1 + y4;

 

 

    var fx = x1;

    var fy = y1;

 

 

    var dfx = (x2 - x1)*pre1 + tmp1x*pre2 + tmp2x*subdiv_step3;

    var dfy = (y2 - y1)*pre1 + tmp1y*pre2 + tmp2y*subdiv_step3;

 

 

    var ddfx = tmp1x*pre4 + tmp2x*pre5;

    var ddfy = tmp1y*pre4 + tmp2y*pre5;

 

 

    var dddfx = tmp2x*pre5;

    var dddfy = tmp2y*pre5;

 

 

    var step = nSteps;

 

 

          pointList.push ([x1, y1]);          // Start Here

    while(step--)

    {

        fx   += dfx;

        fy   += dfy;

        dfx  += ddfx;

        dfy  += ddfy;

        ddfx += dddfx;

        ddfy += dddfy;

        pointList.push ([fx, fy]);

    }

//    pointList.push ([x4, y4]); // Last step must go exactly to x4, y4

    return pointList;

}

