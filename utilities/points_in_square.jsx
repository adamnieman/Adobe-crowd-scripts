
/*
Adding method dist to Math. This returns the distance between two points.
*/
Math.dist=function(x1,y1,x2,y2){ 
	if(!x2) x2=0; 
	if(!y2) y2=0;
	return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1)); 
}

/*
No built-in support for Array.forEach, so adding it here
*/
Array.prototype.forEach = function(callback) {
    for (var i = 0; i < this.length; i++)
        callback(this[i], i, this);
};

/*
Declaration of constructor function POINTS IN SQUARE. This is mimicing class functionality and will 
result in an object with methods and properties.
*/
function POINTS_IN_SQUARE (_dimensions, _number, _callback) {
	
/*
Private variable recursions is how many coordinates will be tested before picking the best option when creating a point.
A higher value results in a more evenly distributed crowd, but significantly slows down code execution.
*/
	var recursions = 5

/*
Private variable dimensions defines the rectangle in which to generate points. This begins with a default 
value which is rewritten in the _construct function.
*/
	var dimensions = {x: 0, y: 0, width: 10, height: 10};
/*
Private variable number defines the number of points we want to end up with. This begins with a default 
value which is rewritten in the _construct function.
*/
	var number = 100
	
/*
Private variable callback contains the function used to check if a particular point is valid or not. This begins with a default 
value which can be rewritten in the _construct function.
*/
	var callback = function () {return true;}
	
/*
Private variable grid will hold an array of arrays of cells, simulating rows and columns. Semantically we can imagine 
the total rectangle defined by dimensions to be split into these rows and columns.
*/
	var grid = [];
	
/*
Private variable grid_divides sets how many rows and columns the grid will have This has a default value of 10 but is 
overwritten in the _construct function.
*/
	var grid_divides = 10;

	function _construct (_dimensions, _number, _callback) {
		/*dimensions comes in format {x, y, width, height}*/
		
		/*
		Private variables dimensions and number overwritten by passed-in values
		*/
		dimensions = _dimensions;
		number = _number;
		
		/*
		Private variable callback overwritten if new callback passed to constructor.
		*/
		callback = _callback ? _callback : callback;
		
		/*
		Private variable grid_divides overwritten based on crowd size.
		*/
		grid_divides = Math.round(Math.cbrt(number))
		
		/*
		Calls generate_grid function, populating grid array with cells.
		*/
		generate_grid();
		generate_points();
	}

	function generate_grid () {
        

		grid = []

		var cell_height = dimensions.height/grid_divides;
		var cell_width = dimensions.width/grid_divides;

		var x_count = dimensions.x;
		var y_count = dimensions.y;

		while (grid.length < grid_divides) {
			var row = []
			while (row.length < grid_divides) {
				var cell = {}
				cell.dimensions = {x: x_count, y: y_count, width: cell_width, height: cell_height};
				cell.points = [];
				cell.row = grid.length;
				cell.column = row.length;
				row.push(cell);
				x_count += cell_width;
			}
			grid.push(row);

			x_count = dimensions.x;
			y_count += cell_height;
		}
	}

	function get_cell (row, column) {


		if (!grid[row]) {return;}
		if (!grid[row][column]) {return;}


		return grid[row][column];
	}

	function get_cell_by_point (x, y) {
        
		var cell_height = dimensions.height/grid_divides;
		var cell_width = dimensions.width/grid_divides;

		var row = Math.floor(Math.abs((y-dimensions.y)/cell_height));
		var column = Math.floor(Math.abs((x-dimensions.x)/cell_width));

		var cell = get_cell(row, column)
        
		return cell;  
	}

	function get_surrounding_cells (row, column) {

		var cells = []

		var i, j;
		for (i=(row-1); i<=(row+1); i++) {
			for (j=(column-1); j<=(column+1); j++) {
				var cell = get_cell(i, j);
				if (cell) {cells.push(cell)}
			}
		}

		return cells;
	}

	function get_distance (point, cells) {
		var min_distance = Infinity;

		cells.forEach(function (a) { 
			a.points.forEach(function (b) {
				var distance = Math.dist(point.x, point.y, b.x, b.y);

				if (distance < min_distance) {
					min_distance = distance;
				}
			})
		})

		return min_distance;
	}

	this.return_points = function () {
		var points = []
		grid.forEach(function (row) {
			row.forEach(function (cell) {
				points = points.concat(cell.points);
			})
		})
    
    points.sort(function (a, b) {
        if (b.y > a.y) {return 1}
        else {return -1}
    })

		return points;
	}

	function generate_points () {
        
		var points_count = 0;
		while (points_count < number) {
			
			var point;
			var cell;
			var maximum_distance = -Infinity;


			var i;
			for (i=0; i<recursions; i++) {
				var temp_point = {
					x: dimensions.x + Math.random()*dimensions.width,
					y: dimensions.y + Math.random()*dimensions.height,
				}
            
				if (!callback(temp_point)) {
					continue;
				}
 
				var temp_cell = get_cell_by_point(temp_point.x, temp_point.y);
				var cells = get_surrounding_cells(temp_cell.row, temp_cell.column);
 
				var distance = get_distance (temp_point, cells); 
				if (distance > maximum_distance) {
					point = temp_point;
					cell = temp_cell;
					maximum_distance = distance;
				}
			}

			if (!point) {
				continue;
			}

			cell.points.push(point);
			points_count++;
            $.writeln("points created: "+points_count);
		}
	}

	_construct (_dimensions, _number, _callback) 
}
