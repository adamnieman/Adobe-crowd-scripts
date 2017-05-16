
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
This will create a semi-random distribution of points in a given square
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
	var h = 500;
	
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
    
/*
Adds control to input min, max and avg height associated with selected symbol.
*/
    dlg.symbolPanel.height = dlg.symbolPanel.add('group',undefined, 'Threshold:');
    dlg.symbolPanel.height.label  = dlg.symbolPanel.height.add('statictext', [15, 15,(w)/2,35], 'height (min/normal/max):');
    dlg.symbolPanel.height.minInput  = dlg.symbolPanel.height.add('edittext', [15, 15, (w)/5.6, 35], "1"); 
    dlg.symbolPanel.height.normalInput  = dlg.symbolPanel.height.add('edittext', [15, 15, (w)/5.6, 35], "1.5"); 
    dlg.symbolPanel.height.maxInput  = dlg.symbolPanel.height.add('edittext', [15, 15, (w)/5.6, 35], "2"); 
    dlg.symbolPanel.height.orientation='row';
    
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
        	probability: parseFloat(dlg.symbolPanel.probability.input.text),
        	height: {
        		min: parseFloat(dlg.symbolPanel.height.minInput.text),
        		normal: parseFloat(dlg.symbolPanel.height.normalInput.text),
        		max: parseFloat(dlg.symbolPanel.height.maxInput.text)
        	} 
        }
    
        selected_symbols.push(symbol)
        
        dlg.chosenSymbols.add("item",  symbol.symbol.name+" "+symbol.probability+" ("+symbol.height.min+", "+symbol.height.normal+", "+symbol.height.max+")")
        
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
		
		selected_symbols[i].bins =  new BINS( selected_symbols[i].height.min,selected_symbols[i].height.max,selected_symbols[i].height.normal).set_num_of_bins(20).generate_bins()
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
        
         var symbol = select_symbol (); 
         var bin = select_bin(symbol.bins)		
		symbolRef = doc.symbolItems.add(symbol.symbol);
        
		var height = bin.min + (Math.random() * (bin.max-bin.min))
        
        var scale = (height/symbolRef.height)*100
        
        symbolRef.resize(scale, scale)
        
        symbolRef.top =  parseFloat(position.y) + symbolRef.height;
        symbolRef.left = parseFloat(position.x);
	
}

function select_bin (bins) {
    var random_prob_seed = Math.random();
    var bin;
    
     var i;
     var l = bins.length
     for (i=0; i<l; i++) {
           if (random_prob_seed <= bins[i].cumulative_probability ) {
                bin = bins[i]
                break;
           }
     }
 
    return bin;
}

function select_symbol () {
        
        var random_prob_seed = Math.random();
        var symbol;
        
        
        var i;
        var l = selected_symbols.length
        for (i=0; i<l; i++) {
            if (random_prob_seed <= selected_symbols[i].cumulativeProbability.upper) {
                symbol = selected_symbols[i]
                break;
            }
        }
    
        if (!symbol) {
            symbol = selected_symbols[0];
        }

        return symbol;
}

function point_in_polygon (vs, point) { 
        // ray-casting algorithm based on
        // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
        //$.writeln(vs);
        //$.writeln(point);
        
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

function curve4(x1, y1,   //Anchor1

            x2, y2,   //Control1

            x3, y3,   //Control2

            x4, y4,   //Anchor2

            nSteps   // Flattening value

                    )

{

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

