﻿jQuery.fn.mousehold = function (f) {
    var timeout = 100;
    if (f && typeof f == 'function') {
        var intervalId = 0;
        var firstStep = false;
        var clearMousehold = undefined;
        return this.each(function () {
            $(this).mousedown(function () {
                firstStep = true;
                var ctr = 0;
                var t = this;
                intervalId = setInterval(function () {
                    ctr++;
                    f.call(t, ctr);
                    firstStep = false;
                }, timeout);
            });

            clearMousehold = function () {
                clearInterval(intervalId);
                if (firstStep) f.call(this, 1);
                firstStep = false;
            };

            $(this).mouseout(clearMousehold);
            $(this).mouseup(clearMousehold);
        });
    }
};

!function ($) {

    var SpinEdit = function (element, options) {
        this.element = $(element);
        this.element.addClass("spinedit noSelect");
        this.intervalId = undefined;

        var hasOptions = typeof options == 'object';

        this.minimum = $.fn.spinedit.defaults.minimum;
        if (hasOptions && typeof options.minimum == 'number') {
            this.setMinimum(options.minimum);
        }

        this.maximum = $.fn.spinedit.defaults.maximum;
        if (hasOptions && typeof options.maximum == 'number') {
            this.setMaximum(options.maximum);
        }

        this.numberOfDecimals = $.fn.spinedit.defaults.numberOfDecimals;
        if (hasOptions && typeof options.numberOfDecimals == 'number') {
            this.setNumberOfDecimals(options.numberOfDecimals);
        }        
		
		var value = $.fn.spinedit.defaults.value;
        if (hasOptions && typeof options.value == 'number') {
            value = options.value;
        } else {			
			if (this.element.val()) {
				var initialValue = parseFloat(this.element.val());
				if (!isNaN(initialValue)) value = initialValue.toFixed(this.numberOfDecimals);				
			}
		}
        this.setValue(value);

        this.step = $.fn.spinedit.defaults.step;
        if (hasOptions && typeof options.step == 'number') {
            this.setStep(options.step);
        }

        this.loop = $.fn.spinedit.defaults.loop;
        if (hasOptions && typeof options.loop == 'boolean') {
            this.setLoop(options.loop);
        }

        this.bind = $.fn.spinedit.defaults.bind;
        if (hasOptions && options.bind != null && typeof options.bind != 'boolean') {
            this.setBind(options.bind);
        }

        var template = $(DRPGlobal.template);
        this.element.after(template);
		$(template).each(function (i,x) {
            $(x).bind('selectstart click mousedown', function () { return false; });
        });

        template.find('.icon-chevron-up').mousehold($.proxy(this.increase, this));
        template.find('.icon-chevron-down').mousehold($.proxy(this.decrease, this));
        this.element.on('keyup', $.proxy(this._keypress, this));
        this.element.on('blur', $.proxy(this._checkConstraints, this));
    };

    SpinEdit.prototype = {
        constructor: SpinEdit,

        setMinimum: function (value) {
            this.minimum = parseFloat(value);
        },

        setMaximum: function (value) {
            this.maximum = parseFloat(value);
        },

        setStep: function (value) {
            this.step = parseFloat(value);
        },

        setNumberOfDecimals: function (value) {
            this.numberOfDecimals = parseInt(value);
        },

        setLoop: function (value) {
            this.loop = value;
        },

        setBind: function (value) {
            if((typeof value === 'string' && $(value).length != 0) || value.length != 0) this.bind = $(value);
            else this.bind = false;
            if(this.bind.data('spinedit') == null) this.bind = false;
        },

        setValue: function (value) {
            value = parseFloat(value);
            if (isNaN(value))
                value = this.minimum;
            if (this.value == value)
                return;
            if (value < this.minimum) {
            	if(this.loop) {
            		value = this.maximum;
            		if(this.bind) this.bind.spinedit('decrease');
            	}
            	else value = this.minimum;
            }
            if (value > this.maximum) {
            	if(this.loop) {
            		value = this.minimum;
            		if(this.bind) this.bind.spinedit('increase');
            	}
                else value = this.maximum;
            }
            this.value = value;
            this.element.val(this.value.toFixed(this.numberOfDecimals));
            this.element.change();

            this.element.trigger({
                type: "valueChanged",
                value: parseFloat(this.value.toFixed(this.numberOfDecimals))
            });
        },

        increase: function () {
            var newValue = this.value + this.step;
            this.setValue(newValue);
        },

        decrease: function () {
            var newValue = this.value - this.step;
            this.setValue(newValue);
        },

        _keypress: function (event) {
            var key = event.keyCode || event.charCode;
            if (key == 40) {
            	this.decrease();
            	return
            }
            if (key == 38) {
            	this.increase();
            	return;
            }
            // Allow: -
            if (key == 45) {
                return;
            }
            // Allow decimal separator (.)
            if (this.numberOfDecimals > 0 && key == 46) {
                return;
            }
            // Ensure that it is a number and stop the keypress
            var a = [];
            for (var i = 48; i < 58; i++)
                a.push(i);
            if (!(a.indexOf(key) >= 0))
                event.preventDefault();
        },

        _checkConstraints: function (e) {
            var target = $(e.target);
            this.setValue(target.val());
        }
    };

    $.fn.spinedit = function (option) {
        var args = Array.apply(null, arguments);
        args.shift();
        return this.each(function () {
            var $this = $(this),
				data = $this.data('spinedit'),
				options = typeof option == 'object' && option;

            if (!data) {
                $this.data('spinedit', new SpinEdit(this, $.extend({}, $.fn.spinedit().defaults, options)));
				data = $this.data('spinedit');
            }
            if (typeof option == 'string' && typeof data[option] == 'function') {
                data[option].apply(data, args);
            }
        });
    };

    $.fn.spinedit.defaults = {
        value: 0,
        minimum: 0,
        maximum: 100,
        step: 1,
        numberOfDecimals: 0,
        loop: false,
        bind: false
    };

    $.fn.spinedit.Constructor = SpinEdit;

    var DRPGlobal = {};

    DRPGlobal.template =
	'<div class="spinedit">' +
	'<i class="icon-chevron-up"></i>' +
	'<i class="icon-chevron-down"></i>' +
	'</div>';

}(window.jQuery);