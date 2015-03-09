"use strict";

function dice_initialize(container, w, h, before_roll_callback, after_roll_callback) {
    $t.remove($t.id('loading_text'));

    var canvas = $t.id('dice_box');
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    var label = $t.id('label');
    var set = $t.id('set');
    var info_div = $t.id('info_div');
    on_set_change();

    function on_set_change(ev) { set.style.width = set.value.length + 3 + 'ex'; }
    $t.bind(set, 'keyup', on_set_change);
    $t.bind(set, 'mousedown', function(ev) { ev.stopPropagation(); });
    $t.bind(set, 'mouseup', function(ev) { ev.stopPropagation(); });
    $t.bind(set, 'focus', function(ev) { $t.set(container, { class: '' }); });
    $t.bind(set, 'blur', function(ev) { $t.set(container, { class: 'svg' }); });

    var box = new $t.dice.dice_box(canvas);

    function before_roll(vectors) {
	before_roll_callback();
    }

    function notation_getter() {
        return $t.dice.parse_notation(set.value);
    }

    function after_roll(notation, result) {
	after_roll_callback(result);
    }

    box.bind_mouse(container, notation_getter, before_roll, after_roll);
    box.bind_throw($t.id('throw'), notation_getter, before_roll, after_roll);

    $t.bind(container, ['mouseup', 'touchend', 'touchcancel'], function(ev) {
        var name = box.search_dice_by_mouse(ev);
        if (name != undefined) {
            var notation = $t.dice.parse_notation(set.value);
            notation.set.push(name);
            set.value = $t.dice.stringify_notation(notation);
            on_set_change();
        }
    });


}

