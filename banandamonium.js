var BoardView = function(player_count) {

    this.view = SVG('board').size(2000, 2000);
    this.layer_coord = [];
    this.board = new Board(player_count);

    this.layer_scale = 0.2;
    this.layer_side_length = 1000;
    this.layer = [];
    this.path_layer = [];

    for(var i = 0; i < this.board.ring_size.length - 1; i++) {

	this.layer.push([]);
	this.path_layer.push([]);

	for(var j = 0; j < player_count; j++) {
	    var vertex = [((1 - i*this.layer_scale)*(this.layer_side_length))*Math.cos(j * 2*Math.PI / player_count) + this.layer_side_length, 
			  ((1 - i*this.layer_scale)*(this.layer_side_length))*Math.sin(j * 2*Math.PI / player_count) + this.layer_side_length];
	    this.layer[i].push(vertex);

	    var path_vertex = [((1 - (i + 0.5)*this.layer_scale)*(this.layer_side_length))*Math.cos(j * 2*Math.PI / player_count) +
			       this.layer_side_length, 
			       ((1 - (i + 0.5)*this.layer_scale)*(this.layer_side_length))*Math.sin(j * 2*Math.PI / player_count) +
			       this.layer_side_length];
	    this.path_layer[i].push(path_vertex);
	}

    }

    this.layer_view = this.layer.map(function (layer) { 
	    return this.view.polygon(layer.reduce(function(a, b) { 
			return a != "" ? a + " " + b.toString() : b.toString(); 
		    }, "")).fill('#'+Math.floor(Math.random()*16777215).toString(16)); 
	}, this);


    this.path_view = this.path_layer.map(function (path_layer) { 
	    return this.view.polygon(path_layer.reduce(function(a, b) { 
			return a != "" ? a + " " + b.toString() : b.toString(); 
		    }, "")).fill('none').stroke({width: 4, opacity: 0.2});
	}, this);

}

var board_view = new BoardView(3);

