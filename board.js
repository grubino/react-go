var Space = function(players) {
    this.players = typeof players !== 'undefined' ? players : [];
};

var Board = function(player_count) {
    // global board
    this.player_count = player_count;
    this.path = [];
    this.ring_size = [4*this.player_count, 4*this.player_count, 3*this.player_count, 3*this.player_count, 2*this.player_count, 1];
    this.size = this.ring_size.reduce(function(a, b) { return a + b; }, 0);
    this.color = ['red', 'white', 'blue', 'yellow', 'orange', 'green', 'brown', 'purple'];
    this.current_color = 0;

    // player specific board
    this.starting_monkeys = 7;
    this.monkey_starts = [];
    for(var i = 0; i < this.player_count; i++) {
	this.monkey_starts.push(this.starting_monkeys);
    }

    this.player_paths = [];
    this.player_slides = [[], [], [], [], [], []];
    this.player_slide_targets = [[], [], [], [], []];

    for (var i = 0; i < this.size; i++) {
	var space = new Space([]);
	this.path.push(space);

	var slide_color = this.slide_color(i);
	if(slide_color != -1 && (level = this.level(i)) < this.ring_size.length) {
	    this.player_slides[level].unshift(i);
	}
    }

    for (var i = 0; i < this.player_slides.length; i++) {
	var ring_progress = this.ring_size.slice(0, i+1).reduce(function (a, b) { return a + b; }, 0);
	for (var j = 0; j < this.player_slides[i].length; j++) {
	    var slide_target_index = ((this.player_slides[i+1][j] - ring_progress)+1) % this.ring_size[i+1] + ring_progress;
	    this.player_slide_targets[i].push(slide_target_index);
	}
    }
    
    for (var i = 0; i < this.player_count; i++) {
	this.player_slide_targets[this.player_slide_targets.length-1].unshift(this.size-1);
    }

    // create player-specific arrays for path and arrays of monkey positions
    for (var color = 0; color < this.player_count; color++) {
	this.player_paths[color] = [];
	for(var i = 0; i < this.ring_size.length; i++) {
	    var modulus = this.ring_size[i];
	    var monkey_start = color * (modulus / this.player_count);
	    var previous_rows = this.ring_size.slice(0, i);
	    var row_start = previous_rows.reduce(function (prev, cur) { return prev + cur; }, 0);
	    for(var j = 0; j < modulus; j++) {
		this.player_paths[color].push(row_start + (monkey_start + j) % modulus);
	    }
	}
    }
};

Board.prototype.level = function(space_index) {

    var accumulator = 0;
    for (var i = 0; i < this.ring_size.length; i++) {
	if ((accumulator + this.ring_size[i]) > space_index) {
	    return i;
	} else {
	    accumulator += this.ring_size[i];
	}
    }
    return this.ring_size.length;

}

Board.prototype.slide_color = function(i) {
    var adjustment = this.ring_size.slice(0, this.level(i)).reduce(function(a, b) { return a + b; }, 0);
    var ring_size = this.ring_size[this.level(i)];
    var ring_progress = i - adjustment;
    var side_length = Math.round(ring_size / this.player_count);
    return (ring_progress + 1) % side_length == 0 ? (ring_size - ring_progress - 1) / side_length : -1;
}


Board.prototype.has_banana_card = function(i) {
    var modulus = Math.round(this.ring_size[this.level(i)] / this.player_count);
    var ring_progress = i - this.ring_size.slice(0, this.level(i)).reduce(function(a, b) { return a + b; }, 0);
    var third_ring_distance = this.ring_size.slice(0, 2).reduce(function(a, b) { return a + b; }, 0);
    var fifth_ring_distance = this.ring_size.slice(0, 4).reduce(function(a, b) { return a + b; }, 0);

    if(this.level(i) < 1 || this.level(i) > 2) {
	return false;
    }

    var translate = this.level(i) == 2 ? 1 : 0;
    return ((ring_progress + translate) % modulus == 0);
}
/*
 * Switches the current player
 */
Board.prototype.switch_player = function() {
    this.current_color = (this.current_color + 1) % this.player_count;
}

Board.prototype.end_game = function() {
    console.log("GAME OVER");
}

Board.prototype.legal_move = function(color, index, pair_move) {

}

/*
 * return true for legal move, false otherwise
 */
Board.prototype.play = function(color, start, end, monkey_count, start_move) {
    if(start_move) {

    }
    this.switch_player();
    return true;
}

