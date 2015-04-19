var BoardView = function(player_count) {

    this.canvas_width = window.innerWidth;
    this.canvas_height = Math.round(7 * window.innerHeight / 8);

    this.view = SVG('canvas').size(this.canvas_width, this.canvas_height);
    this.layer_coord = [];
    this.board = new Board(player_count);

    this.layer_scale = 0.17;
    this.layer_side_length = Math.round(this.canvas_height / 3);
    this.spot_radius = this.layer_side_length / 40;
    this.monkey_radius = Math.round(this.spot_radius * 3 / 2);

    this.left_padding = this.spot_radius * 5;
    this.top_padding = this.spot_radius * 5;

    this.layer = [];
    this.path_layer = [];
    this.monkey_spot = [];
    this.card_spot = [];
    this.slide_spot = [];
    this.start_spot = [];
    this.current_moves = [];
    this.selected_spot = null;
    this.selected_monkey = null;

    this._compute_board_positions(player_count);
    this._render_board(player_count);

}

BoardView.prototype.highlight_spot = function(spot) {
    return spot.animate(500).radius(this.spot_radius*2).loop();
}

BoardView.prototype.clear_highlights = function() {
    this.monkey_spot_view.forEach(function(s) { s.animate(500).radius(this.spot_radius); }, this);
}

BoardView.prototype.clear_actions = function() {
    this.monkey_spot_view.forEach(function(s) { s.click(null); }, this);
}

BoardView.prototype._calculate_moves = function(rolls) {
    if(rolls.length == 1) {
	this.current_moves.push({"value": rolls[0].value,
				 "dice": rolls[0].dice});
	return;
    } else {
	this.current_moves.push({"value": rolls.map(function(a) { return a.value; }).reduce(function(a, b) { return a + b; }, 0),
				 "dice": rolls.map(function (a) { return a.dice; }).reduce(function (a, b) { return a.concat(b); }, []) });
    }
    for(var i = 0; i < rolls.length; i++) {
	var new_rolls = rolls.slice(0).splice(i, 1);
	this._calculate_moves(new_rolls);
    }
}

BoardView.prototype.put_dice_roll = function(values) {
    this.dice = values;
    this.current_moves = [];
    this._calculate_moves(values.map(function(a, i) { return {"value": a, "dice": [i]}; }));
}

BoardView.prototype.show_valid_moves = function() {
    this.clear_highlights();
    var current_color = this.board.current_color;
    var index = this.selected_spot === -1 ? -1 : this.selected_spot;
    for(var i = 0; i < this.current_moves.length; i++) {
	var move = this.current_moves[i].value;
	if(index + move < this.board.size) {
	    this.highlight_spot(index === -1 ? 
				this.monkey_spot_view[this.board.player_paths[current_color][this.board.ring_size[0]-1 + move]] 
				: this.monkey_spot_view[this.board.player_paths[current_color][index + move]]);
	    this.make_spot_selectable(current_color, index, i);
	}
    }
}

BoardView.prototype.make_spot_selectable = function(color, index, move_index) {
    var monkey = this.selected_monkey;
    var eff_index = index === -1 ? this.board.ring_size[0]-1 : index;
    var dist = this.current_moves[move_index].value;
    this.monkey_spot_view[this.board.player_paths[color][eff_index+dist]].click(BoardView.prototype.move_monkey.bind(this, monkey, color, index, move_index));
}

BoardView.prototype.make_spot_unselectable = function(index) {
    this.monkey_spot_view[index].click(null);
}

BoardView.prototype._move_monkey_one = function(monkey, color, start) {
    monkey.animate(500).move(this.monkey_spot[this.board.player_paths[color][start+1]][0] - this.monkey_radius,
			     this.monkey_spot[this.board.player_paths[color][start+1]][1] - this.monkey_radius);
}

BoardView.prototype.move_monkey = function(monkey, color, start, move_index) {

    var eff_start = start === -1 ? this.board.ring_size[0] - 1 : start;
    var dist = this.current_moves[move_index].value;
    var dice = this.current_moves[move_index].dice.map(function(a) { return this.dice[a]; }, this);
    if(this.board.play(color, start, dist, dice.length)) {

	monkey.stop().radius(this.monkey_radius);
	var i = 0;
	var intervalId = setInterval(function() {
	    this._move_monkey_one(monkey, color, eff_start+i);
	    i += 1;
	    if(!(i < dist)) {
		clearInterval(intervalId);
	    }
	}.bind(this), 500);

	monkey.click(null);
	monkey.click(BoardView.prototype._select_monkey.bind(this, monkey, eff_start+dist, color));

	this.put_dice_roll(this.dice.filter(function(a) { return dice.indexOf(a) === -1; }, this));

	this.selected_monkey = null;
	this.clear_actions();
	this.clear_highlights();

    }

}

BoardView.prototype._select_monkey = function(monkey_view, index, color) {
    if(color === this.board.current_color) {
	this.selected_spot = index;
	this.selected_monkey = monkey_view;
	this.monkey_view.forEach(function(monkey) { monkey.animate(500).radius(this.spot_radius * 3 / 2); }, this);
	monkey_view.animate(500).radius(this.spot_radius * 3).loop();
    }
}

BoardView.prototype._get_valid_monkeys = function(index) {
    var current_color = this.board.current_color;
    if(index === -1) {
	return this.board.monkey_starts[current_color];
    }
    var space = this.board.path[index];
    var valid_monkeys = space.players
	.filter(function(monkey) { return monkey == current_color; })
	.reduce(function(a, b) { return a + 1; }, 0);
    return valid_monkeys;
}

BoardView.prototype._render_board = function(player_count) {

    var layer_colors = ['#7a0', '#0a6', '#a92', '#aa4', '#880', '#dd0'];
    this.layer_view = this.layer.map(function (layer) { 
	    var color = layer_colors.shift();
	    return this.view.polygon(layer.reduce(function(a, b) { 
			return a != "" ? a + " " + b.toString() : b.toString(); 
		    }, "")).fill(color); 
	}, this);

    this.path_view = this.path_layer.map(function (path_layer) { 
	    path_view = this.view.polygon(path_layer.reduce(function(a, b) { 
			return a != "" ? a + " " + b.toString() : b.toString(); 
		    }, "")).fill('none').stroke({width: this.spot_radius / 2, opacity: 0.6});
	    return path_view;
	}, this);

    this.monkey_spot_view = this.monkey_spot.map(function (monkey_spot, index) {
	    return this.view.circle().radius(this.spot_radius).move(monkey_spot[0] - this.spot_radius,
								    monkey_spot[1] - this.spot_radius).fill(this.board.has_banana_card(index) ? 'yellow' : '#000');
	}, this);

    this.slide_spot_view = [];
    for(var i = 0; i < this.slide_spot.length; i++) {
	slide_spot = this.slide_spot[i];
	this.slide_spot_view.push(this.view.line(slide_spot.vert[0],
						 slide_spot.vert[1],
						 slide_spot.target[0],
						 slide_spot.target[1]).stroke({width: this.spot_radius / 2, color: slide_spot.color}));
    }

    this.start_spot_text_view = [];
    this.monkey_view = [];
    for(var i = 0; i < this.board.player_count; i++) {
	var color = i;
	for(var j = 0; j < this.board.monkey_starts[i]; j++) {
	    var monkey_view = this.view.circle(this.spot_radius * 3)
				     .fill(this.board.color[i])
				     .stroke({color: 'black', width: this.spot_radius / 2})
				     .move(this.start_spot[color][0], this.start_spot[color][1]);
	    monkey_view.click(BoardView.prototype._select_monkey.bind(this, monkey_view, -1, i));
	    this.monkey_view.push(monkey_view);
	}

	this.start_spot_text_view.push(this.view.text('x '+this.board.monkey_starts[i])
				       .fill('black')
				       .size(this.spot_radius)
				       .move(this.start_spot[i][0] + this.spot_radius, this.start_spot[i][1] + this.spot_radius));
    }

}

BoardView.prototype._compute_board_positions = function(player_count) {
    
    for(var i = 0; i < this.board.ring_size.length - 1; i++) {

	this.layer.push([]);
	this.path_layer.push([]);

	for(var j = 0; j < player_count; j++) {
	    var vertex = [((1 - i*this.layer_scale)*(this.layer_side_length))*Math.cos(-j * 2*Math.PI / player_count) + this.layer_side_length + this.left_padding, 
			  ((1 - i*this.layer_scale)*(this.layer_side_length))*Math.sin(-j * 2*Math.PI / player_count) + this.layer_side_length + this.top_padding];
	    this.layer[i].push(vertex);
	    if(i == 0) {
		var startSpotPos = [vertex[0] - this.spot_radius * 2, vertex[1] - this.spot_radius * 2];
		this.start_spot[j] = startSpotPos;
	    }

	    var path_vertex = [((1 - (i + 0.5)*this.layer_scale)*(this.layer_side_length))*Math.cos(-j * 2*Math.PI / player_count) +
			       this.layer_side_length + this.left_padding, 
			       ((1 - (i + 0.5)*this.layer_scale)*(this.layer_side_length))*Math.sin(-j * 2*Math.PI / player_count) +
			       this.layer_side_length + this.top_padding];
	    this.path_layer[i].push(path_vertex);

	}

    }

    for(var i = 0; i < this.board.ring_size.length; i++) {
	for(var j = 0; j < player_count; j++) {
	    var side_length = Math.floor(this.board.ring_size[i] / player_count);
	    var magnitude_increment = (1 / side_length);
	    var m_0 = 0.5 * magnitude_increment;
	    for(var k = 0; k < side_length; k++) {
		var spot_vertex = [Math.floor((m_0 + magnitude_increment * k) * (this.path_layer[i][(j+1)%player_count][0] - 
										 this.path_layer[i][j][0]) + this.path_layer[i][j][0]),
				   Math.floor((m_0 + magnitude_increment * k) * (this.path_layer[i][(j+1)%player_count][1] - 
										 this.path_layer[i][j][1]) + this.path_layer[i][j][1])];

		this.monkey_spot.push(spot_vertex);

		var path_index = this.board.ring_size.slice(0, i).reduce(function (a, b) { return a+b; }, 0) + side_length * j + k;
		var slide_color = this.board.slide_color(path_index);
		if(slide_color != -1) {
		    this.slide_spot.push({vert: spot_vertex, color: this.board.color[slide_color]});
		}
	    }
	}
    }

    this.monkey_spot.push([this.layer_side_length + this.left_padding,
			   this.layer_side_length + this.top_padding]);

    var slide_targets_done = 0;
    for(var i = 0; i < this.monkey_spot.length; i++) {
	var slide_color = this.board.slide_color(i);
	if(slide_color != -1) {
	    var board_level = this.board.level(i);
	    var slide_target_index = this.board.player_slide_targets[board_level][slide_color];
	    this.slide_spot[slide_targets_done].target = this.monkey_spot[slide_target_index];
	    slide_targets_done++;
	}
    }

}

