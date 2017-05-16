//this requires scale.jsx

/*
Declaration of constructor function BINS. This is mimicing class functionality and will 
result in an object with methods and properties.
THIS CODE IS DOING SOME QUITE SKETCHY THINGS.
*/
function BINS (_min_val, _max_val, _avg_val) {
  
/*
min_val, max_val and avg_val hold the min and max allowable values, and the average (mean) value. These 
start with default values which are reassigned in the _construct function. 
*/
		var min_val = 0;
		var max_val = 10;
		var avg_val = 5
    
/*
This creates an instance of SCALE which maps our min, avg and max values to -PI, 0 and PI (radians).
*/
		var scale = SCALE ()
			.map_from([min_val, avg_val, max_val])
			.map_to([-Math.PI, 0, Math.PI])

/*
Variable range will contain the difference between min_val and max_val. This is assigned in the public method generate_bins.
*/
		var range;
  
/*
Variable num_of_bins begins with a default value of 10 but can be reassigned through public method set_num_of_bins. 
This refers to the number of bins defining value ranges which will be created.
*/
		var num_of_bins = 10;
  
/*
Variables bin_size refers to the range of acceptable values contained by each bin. This is assigned in the public method generate_bins.
*/
		var bin_size;

/*
Array bins will hold the created bins.
*/
		var bins = [];

		function _construct (_min_val, _max_val, _avg_val) {
      
/*
Checks that all arguments have a value and that those values are correct/coherent. They are then assigned 
accordingly to min_val, max_val and avg_val variables.
*/
			if (isNaN(_min_val) || isNaN(_max_val) || isNaN(avg_val)) {
				return;
			}
			if (_min_val >= _max_val) {
				_max_val = _min_val+10;
			}
			if (_avg_val > _max_val || _avg_val < min_val) {
				_avg_val = _min_val + (_max_val-_min_val)/2
			}

			min_val = _min_val;
			max_val = _max_val;
			avg_val = _avg_val;

/*
Returning 'this' from object methods means that they can be chained.
*/
			return this;

		}

		this.set_num_of_bins = function (_num_of_bins) {
/*
Re-assigns num_of_bins to value of argument, after first checking it is a valid positive number and 
rounding it up to the nearest integer.
*/
			if (isNaN(_num_of_bins) || _num_of_bins <= 0) {
				return;
			}

			num_of_bins = Math.ceil(_num_of_bins);

			return this;
		}

		this.generate_bins = function () {
      
/*
Re-assigns map_from property of scale.
*/
			scale.map_from([min_val, avg_val, max_val])

/*
Sets range and bin_size variables
*/
			range = max_val - min_val;
			bin_size = range/num_of_bins;

/*
Variable sum_of_probability keeps track of the cumulative probability as bins are created and assigned probabilities.
*/
			var sum_of_probability = 0

/*
Creates new bins and adds them to the bins array until the amount of bins is equal to num_of_bins
*/
			while (bins.length < num_of_bins) {
				
/*
Creates new object and assigns it to variable bin. Gives bin min, max and mid variables.
*/
        var bin = {};
				bin.min = min_val + (bins.length*bin_size);
				bin.max = bin.min + bin_size;
				bin.mid = bin.min + (bin_size/2);

/*
THIS IS THE SKETCHY PART
To get the relative probability of each bin, feed its midpoint into our scale function. This will map it to a 
value somewhere between -PI and PI. Feeding that value into Math.cos returns the cosine of that value, which will 
be between -1 and 1. The +1 ensures that all resulting values are positive numbers between 0 and 2.
*/
				bin.probability = Math.cos(scale(bin.mid))+1
        
/*
Add bin.probability to the variable sum_of_probability to keep track of the total of all probability values.
*/
				sum_of_probability += bin.probability;
        
/*
Push newly created bin to the bins array
*/
				bins.push(bin)
			}

/*
Loops through all bins normalising probability values (so that they all add up to 1) and assigning cumultive probability values.
*/
			var i;
			var l = bins.length;
			for (i=0; i<l; i++) {
				bins[i].probability /= sum_of_probability

				if (bins[i-1]) {
					bins[i].cumulative_probability = bins[i-1].cumulative_probability + bins[i].probability;
				}
				else {
					bins[i].cumulative_probability = bins[i].probability;
				}
			}

			return bins;

		}

		this.get = function () {
			return bins;
		}

		_construct (_min_val, _max_val, _avg_val)
	}
