#include utilities/scale.jsx
#include utilities/bins.jsx
#include utilities/points_in_square.jsx

Math.cbrt = Math.cbrt || function(x) {
  var y = Math.pow(Math.abs(x), 1/3);
  return x < 0 ? -y : y;
};

Array.prototype.indexOf = Array.prototype.indexOf || function(value, start) {  
      for (var i = 0, length = this.length; i < length; i++) {  
        if (this[i] == value) {  
          return i;  
        }  
      }  
      return -1;  
} 

var doc; 

if (app.documents.length > 0) {
    doc = app.activeDocument;
}
else {
    doc = app.documents.add()
}


var layer = doc.layers.add()
layer.name = "Crowd_layer"

var selected_symbols = [];
var crowd_size;

create_dialog ()

function create_dialog () {
    
    var dlg = new Window("dialog"); 
	
	var w = 350;
	var h = 500;
	
    dlg.size = [w, h]
    
    var symbols = doc.symbols;
    var symbolNameArray = []
    
    for (var i = 0; i < symbols.length; i++) {
        symbolNameArray.push(symbols[i].name)
    }

   
    dlg.crowdSize = dlg.add('group',undefined, 'Threshold:');
    dlg.crowdSize.label = dlg.crowdSize.add('statictext', [15, 15, (w/2), 35], 'crowd size:');
    dlg.crowdSize.input = dlg.crowdSize.add('edittext', [15, 15, (w/2), 35], "100"); 
    
    dlg.symbols = dlg.add('group',undefined, 'Threshold:');
    dlg.symbols.label = dlg.symbols.add('statictext', [15, 15,(w)/2,35], 'select a symbol:');
    dlg.symbols.input = dlg.symbols.add('dropdownlist', [15, 15,(w)/2,35], symbolNameArray); 
    dlg.symbols.orientation='row';
    
    dlg.symbolPanel = dlg.add('group',undefined, 'Threshold:')
    dlg.symbolPanel.label  = dlg.symbolPanel.add('statictext', [15, 15,w,35], '');
    dlg.symbolPanel.orientation='column';
    
    dlg.symbolPanel.probability = dlg.symbolPanel.add('group',undefined, 'Threshold:');
    dlg.symbolPanel.probability.label  = dlg.symbolPanel.probability.add('statictext',[15, 15,(w)/2,35], 'probability:');
    dlg.symbolPanel.probability.input  = dlg.symbolPanel.probability.add('edittext', [15, 15,(w)/2,35], "1"); 
    dlg.symbolPanel.probability.orientation='row';
    
    dlg.symbolPanel.height = dlg.symbolPanel.add('group',undefined, 'Threshold:');
    dlg.symbolPanel.height.label  = dlg.symbolPanel.height.add('statictext', [15, 15,(w)/2,35], 'height (min/normal/max):');
    dlg.symbolPanel.height.minInput  = dlg.symbolPanel.height.add('edittext', [15, 15, (w)/5.6, 35], "1"); 
    dlg.symbolPanel.height.normalInput  = dlg.symbolPanel.height.add('edittext', [15, 15, (w)/5.6, 35], "1.5"); 
    dlg.symbolPanel.height.maxInput  = dlg.symbolPanel.height.add('edittext', [15, 15, (w)/5.6, 35], "2"); 
    dlg.symbolPanel.height.orientation='row';
    
    dlg.chosenSymbols = dlg.add('listbox', [15, 15,(w),100], [])
    
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
    
    dlg.symbolPanel.hide()
    
    dlg.symbols.input.addEventListener('change', function(k){
    	
        dlg.symbolPanel.label.text = this.selection
        dlg.symbolPanel.show()
        
    })
    
    dlg.submit = dlg.add('button',undefined, "submit"); 
    dlg.submit.addEventListener('click', function(k){
        	
        	dlg.hide();
            
            crowd_size = dlg.crowdSize.input.text;
            
            if (selected_symbols.length > 0){
               process_input()
            }
    })

    dlg.show()
} 

function process_input () {
     
	var cumulativeProbability = 0
	
	for (var i = 0; i < selected_symbols.length; i++){  
        
		selected_symbols[i].cumulativeProbability = {
			lower: +cumulativeProbability,
			upper: +cumulativeProbability + parseFloat(selected_symbols[i].probability)
		}
		
		cumulativeProbability += parseFloat(selected_symbols[i].probability);
		
		selected_symbols[i].bins =  new BINS( selected_symbols[i].height.min,selected_symbols[i].height.max,selected_symbols[i].height.normal).set_num_of_bins(20).generate_bins()
	}
 
    
    var polygon = get_polygon ()
    generate_points(polygon);
}



function get_polygon () {
    
    var path = doc.pathItems.getByName("crowd-boundary");
    $.writeln(polygon) 
    
    var polygon = {}
    
    polygon.co_ordinates = flatten_path(path);
    polygon.bounds = {
        x: path.geometricBounds[0],
        y: path.geometricBounds[1]-path.height,
        width: path.width,
        height: path.height
    }

    return polygon;
}

function generate_points (polygon) {
    
    var p_sq = new POINTS_IN_SQUARE (
        polygon.bounds,
        parseInt(crowd_size),
        function (point) {
                var result = point_in_polygon(polygon.co_ordinates ,[point.x, point.y])
                return result  
        } 
    ) 
     
    var points = p_sq.return_points();
    
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

