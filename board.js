var Space = function(players) {
    this.players = typeof players !== 'undefined' ? players : [];
};

var Board = function(player_count) {
    // global board
    this.player_count = player_count;
    this.path = [];
    this.ring_size = [4*this.player_count, 4*this.player_count, 3*this.player_count, 3*this.player_count, 2*this.player_count, 1];
    this.size = this.ring_size.reduce(function(a, b) { return a + b; }, 0) + 1;
    this.current_color = 0;

    // player specific board
    this.player_paths = [];
    this.player_slides = [[], [], [], [], []];

    for (var i = 0; i < this.size; i++) {
	var space = new Space([]);
	this.path.push(space);

	var slide_color = this.slide_color(i);
	if(slide_color != -1 && (level = this.level(i)) < 5) {
	    this.player_slides[level].unshift(i);
	}
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
    var side_length = ring_size / this.player_count;
    return (ring_progress + 1) % side_length == 0 ? this.player_count * (ring_progress + 1) / ring_size : -1;
}


Board.prototype.has_banana_card = function(i) {
    var modulus = this.ring_size[this.level(i)] - 1;
    var translate = (i >= this.ring_size.slice(0, 2).reduce(function(a, b) { a + b; }, 0)) && (i < this.ring_size.slice(0, 4).reduce(function(a, b) { a + b; }, 0)) ? 2 : 0;
    if(!modulus) {
	return false;
    }
    return ((i + translate) % modulus === 0);
}
/*
 * Switches the current player
 */
Board.prototype.switch_player = function() {
    this.current_color = (this.current_color + 1) % this.player_count;
};

Board.prototype.end_game = function() {
    console.log("GAME OVER");
};

/*
 * return true for legal move, false otherwise
 */
Board.prototype.play = function(color, moves, pair_move) {
    console.log("color: "+color);
    moves.forEach(function(move) {
	    var pos = move[0];
	    var move = move[1];
	}, this);
    this.switch_player();
    return true;
};

