var BoardView = function(player_count) {

    this.canvas_width = 3 * Math.round(window.innerWidth / 4);
    this.canvas_height = 3 * Math.round(window.innerHeight / 4);
    this.scene = new THREE.Scene();
    this.view = new THREE.PerspectiveCamera(75, this.canvas_width / this.canvas_height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer();
    this.view.position.z = 50;

    this.board = new Board(player_count);

    this.layer_thickness = 10;
    this.layer_scale = 0.17;
    this.layer_radius = Math.round(3 * window.innerHeight / 8);
    this.layer = [];
    this.path_layer = [];
    this.monkey_spot = [];
    this.monkey_spot_size = Math.round(this.canvas_width / 50);
    this.card_spot = [];
    this.card_spot_size = Math.round(this.canvas_width / 40);
    this.slide_spot = [];
    this.start_spot = [];
    this.start_spot_size = Math.round(this.canvas_width / 30);
    this.current_moves = [];
    this.selected_spot = 0;

    this._compute_board_positions(player_count);
    this._create_board(player_count);
    this._populate_scene();
    this._render_board();

}

BoardView.prototype.highlight_spot = function(spot) {
}

BoardView.prototype.clear_highlights = function() {
}

BoardView.prototype._calculate_moves = function(rolls) {
    if(rolls.length == 1) {
	this.current_moves.push(rolls[0]);
	return;
    } else {
	this.current_moves.push(rolls.reduce(function(a, b) { return a + b; }, 0));
    }
    for(var i = 0; i < rolls.length; i++) {
	var new_rolls = rolls.slice(0).splice(i, 1);
	this._calculate_moves(new_rolls);
    }
}

BoardView.prototype.put_dice_roll = function(values) {
    this.current_moves = [];
    this._calculate_moves(values);
}

BoardView.prototype.show_valid_moves = function() {
    this.clear_highlights();
    var index = this.selected_spot;
    var current_color = this.board.current_color;
    var space = this.board.path[index];
    var valid_monkeys = space.players.filter(function(monkey) { return monkey == current_color; }).reduce(function(a, b) { return a + 1; }, 0);
    if(index == this.board.player_slides[0][current_color]) {
	valid_monkeys += this.board.monkey_starts[current_color];
    }
    if(valid_monkeys > 0) {
	for(var i = 0; i < this.current_moves.length; i++) {
	    var move = this.current_moves[i];
	    if(index + move < this.board.size) {
		this.highlight_spot(this.monkey_spot_view[this.board.player_paths[current_color][(index + move)]]);
	    }
	}
    }
}

BoardView.prototype.make_spot_selectable = function(index) {
}

BoardView.prototype.make_spot_unselectable = function(index) {
}

BoardView.prototype._move_monkey_view_one = function(color, start, indices) {
}

BoardView.prototype.move_monkey = function(color, start, dist, monkey_count, start_move) {

    if(!this.board.play(color, start, end, monkey_count, start_move)) {
	// exception - TODO throw something
	return;
    }
    var start_spot = this.monkey_spot[start];

    if(start == this.board.player_slides[0][color] && start_move) {
	// put a new monkey onto the board
    }

    for(var i = 0; i < dist; i++) {
	indices = [];
	this._move_monkey_one(color, start, indices);
    }
    
}

BoardView.prototype._select_monkey = function(index) {
    this.selected_spot = index;
    this.highlight_spot(this.monkey_spot_view[index]);
}

BoardView.prototype._render_board = function() {
    requestAnimationFrame(BoardView.prototype._render_board.bind(this));
    this.renderer.render(this.scene, this.view);
}

BoardView.prototype._populate_scene = function() {
    this.layer_view.forEach(function(view) { this.scene.add(view); }, this);
}

BoardView.prototype._create_board = function(player_count) {

    this.layer_view = this.layer.map(function (layer) { 
	var layer_view = new THREE.Shape(layer);
	var extrude_path = new THREE.SplineCurve3([new THREE.Vector3(0, 0, layer[0].z),
						   new THREE.Vector3(0, 0, layer[0].z + this.layer_thickness)]);
	var geometry = layer_view.extrude({steps: 3, bevelEnabled: false, extrudePath: extrude_path});
	var material = new THREE.MeshLambertMaterial({color: 0xaa0000, wireframe: false});
	return new THREE.Mesh(geometry, material);
    }, this);

    this.path_view = this.path_layer.map(function (path_layer) { 
	return new THREE.Path(path_layer);
    }, this);

    this.monkey_spot_view = this.monkey_spot.map(function (monkey_spot) {
	var spot_size = this.monkey_spot_size;
	var geometry = new THREE.SphereGeometry(spot_size, 10, 10);
	var material = new THREE.MeshBasicMaterial({color: 0x000000});
	return new THREE.Mesh(geometry, material);
    }, this);
    this.monkey_view = this.monkey_spot.map(function (monkey_spot) {
	return [];
    });

    this.slide_spot_view = this.slide_spot.map(function (slide_spot) {
	return new THREE.Path(slide_spot.vertices);
    });

    this.card_spot_view = this.card_spot.map(function (card_spot) {
	var spot_size = this.card_spot_size;
	var geometry = new THREE.SphereGeometry(spot_size, 10, 10);
	var material = new THREE.MeshBasicMaterial({color: 0xaaaa00});
	return new THREE.Mesh(geometry, material);
    }, this);

    this.start_spot_view = [];
    this.start_spot_text_view = [];
    for(var i = 0; i < this.board.player_count; i++) {}

}

BoardView.prototype._compute_board_positions = function(player_count) {
    
    for(var i = 0; i < player_count; i++) {
	this.start_spot.unshift(new THREE.Vector3((this.layer_radius)*Math.cos(((i+1)%player_count) * 2*Math.PI / player_count - Math.PI / (player_count)), 
						  (this.layer_radius)*Math.sin(((i+1)%player_count) * 2*Math.PI / player_count - Math.PI / (player_count)),
						  0));
    }
    for(var i = 0; i < this.board.ring_size.length - 1; i++) {

	this.layer.push([]);
	this.path_layer.push([]);

	for(var j = 0; j < player_count; j++) {
	    var vertex = new THREE.Vector3(((1 - i*this.layer_scale)*(this.layer_radius))*Math.cos(j * 2*Math.PI / player_count),
					   ((1 - i*this.layer_scale)*(this.layer_radius))*Math.sin(j * 2*Math.PI / player_count),
					   i * this.layer_thickness);
	    this.layer[i].push(vertex);

	    var path_vertex = new THREE.Vector3(((1 - (i + 0.5)*this.layer_scale)*(this.layer_radius))*Math.cos(j * 2*Math.PI / player_count), 
						((1 - (i + 0.5)*this.layer_scale)*(this.layer_radius))*Math.sin(j * 2*Math.PI / player_count),
						i * this.layer_thickness);
	    this.path_layer[i].push(path_vertex);

	}

    }

    for(var i = 0; i < this.board.ring_size.length; i++) {
	for(var j = 0; j < player_count; j++) {
	    var side_length = Math.floor(this.board.ring_size[i] / player_count);
	    var magnitude_increment = (1 / side_length);
	    var m_0 = 0.5 * magnitude_increment;
	    for(var k = 0; k < side_length; k++) {
		var spot_vertex = new THREE.Vector3(Math.floor((m_0 + magnitude_increment * k) * (this.path_layer[i][(j+1)%player_count][0] - 
												  this.path_layer[i][j][0]) + this.path_layer[i][j][0]),
						    Math.floor((m_0 + magnitude_increment * k) * (this.path_layer[i][(j+1)%player_count][1] - 
												  this.path_layer[i][j][1]) + this.path_layer[i][j][1]),
						    i * this.layer_thickness);

		this.monkey_spot.push(spot_vertex);

		var path_index = this.board.ring_size.slice(0, i).reduce(function (a, b) { return a+b; }, 0) + side_length * j + k;
		if(this.board.has_banana_card(path_index)) {
		    this.card_spot.push(spot_vertex);
		}
		var slide_color = this.board.slide_color(path_index);
		if(slide_color != -1) {
		    this.slide_spot.push({vertices: [spot_vertex], color: this.board.color[slide_color]});
		}
	    }
	}
    }

    this.monkey_spot.push(new THREE.Vector2(0, 0));

    var slide_targets_done = 0;
    for(var i = 0; i < this.monkey_spot.length; i++) {
	var slide_color = this.board.slide_color(i);
	if(slide_color != -1) {
	    var board_level = this.board.level(i);
	    var slide_target_index = this.board.player_slide_targets[board_level][slide_color];
	    this.slide_spot[slide_targets_done].vertices.push(this.monkey_spot[slide_target_index]);
	    slide_targets_done++;
	}
    }

}

