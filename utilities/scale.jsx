
/*
No built-in support for Array.some, so adding it here
*/
if (!Array.prototype.some)
{
   Array.prototype.some = function(fun /*, thisp*/)
   {
      var len = this.length;
      if (typeof fun != "function")
      throw new TypeError();
      
      var thisp = arguments[1];
      for (var i = 0; i < len; i++)
      {
         if (i in this && fun.call(thisp, this[i], i, this))
         return true;
      }
      return false;
   };
}		
        
/*
Declaration of constructor function SCALE. This is mimicing class functionality and will 
result in an object with methods and properties.
*/      
function SCALE () {

/*
Variables map_from and map_to contain the value ranges which will be mapped from one to another. These begin 
with default values which can be reassigned later.
*/
		  var map_from = [1, 100];
		  var map_to = [1, 0];

		  var api = function (value) {
/*
If a value is not passed, return a reference to itself so methods can be chained.
If a value is passed, check that it is within the boundaries set out in the map_from array, and reset it to a value
within the map_from boundaries if it is not.
*/
		  	if (isNaN(value)) return api;
		    if (value < map_from[0]) {value = map_from[0]}
		    if (value > map_from[map_from.length-1]) {value = map_from[map_from.length-1]}
/*
Finds which two elements of the map_from array the value is between. 
Assigns the difference between these to map_from_segment, and the difference between the 2 corresponding map_to 
array elements to map_to_segment.
*/
		    var count = 0;
            while (value > map_from[count]) {
                count++   
            }

            var map_from_segment = Math.abs(map_from[count]-map_from[count-1])
            var map_to_segment = Math.abs(map_to[count]-map_to[count-1])

/*
Calculates the ratio of map_to_segment to map_from_segment.
*/
            var ratio = map_to_segment/map_from_segment;

/*
Returns value scaled according to this ratio.
*/
            return map_to[count-1]+((value-map_from[count-1])*ratio)
		  };

		  api.map_from = function (array) {
/*
If no arguments are passed, return map_from.
Else, return a reference to api so that methods can be chained. 
Checks whether all elements of array are numerical, and if they are, assigns array to map_from.
*/
		    if (!arguments.length) return map_from; 
		     
		    if (array.some(isNaN)) return api;

		    map_from = array;

		    return api;
		  };

		  api.map_to = function (array) {
/*
If no arguments are passed, return map_to.
Else, return a reference to api so that methods can be chained. 
Checks whether all elements of array are numerical and that array contains the same number of elements as 
map_from. If this is the case, assigns array to map_from.
*/
		    if (!arguments.length) return map_to;
		    if (array.length != map_from.length) return api;
		    if (array.some(isNaN)) return api;

		    map_to = array;

		    return api;
		  };

		  return api;
		}
