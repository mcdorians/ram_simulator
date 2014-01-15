/*
 * View
 */
var inputStripEntryProto = $$({
    model: {
        value: '',
        name: ''
    },
    view: {
        format: '<div class="form-group col-md-1">\n\
                <span data-bind="name"/><input type="text" class="form-control" placeholder="input" data-bind="value"/>\n\
                </div>'
    },
    controller: {
        'create': function() {
            this.view.$('input').keyup(function(e) {
                var code = e.which;
                if (code == 13) {
                    e.preventDefault();
                }
                if (code == 32 || code == 13 || code == 188 || code == 186) {
                    inputStrip.trigger('click #addinputbutton');
                }
            });
            this.view.$('input').focus();
        }
    }
});

var inputStrip = $$({
    model: {
        inputvalues: [],
        count: 0,
    },
    view: {
        format: '<div class="row form-inline">\n\
                    <div class="col-md-1"><h4>register init</h4></div>\n\
                    <div class="col-md-2">\n\
                    <button id="addinputbutton" type="button" class="btn btn-primary">\n\
                    <span class="glyphicon glyphicon-plus"> add</span></button>\n\
                    <button id="removeall" type="button" class="btn btn-danger">\n\
                    <span class="glyphicon glyphicon-remove"> remove all</span></button>\n\
                    </div>\n\
                </div>',
        style: '& button {margin:3px;}'
    },
    controller: {
        'create': function() {
            var i, tillmann = [0, 1, 2, 10, 1, 4];
            for (i = 0; i < tillmann.length; i++) {
                this.append($$(inputStripEntryProto, {value: tillmann[i], name: 'R' + i}));
            }
            this.model.set({count: i});
            this.trigger('setvalues');
        },
        'click #removeall': function() {
            this.model.set({count: 0});
            this.empty();
        },
        'click #addinputbutton': function() {
            var count = this.model.get('count');
            this.append($$(inputStripEntryProto, {value: '0', name: 'R' + count}));
            count++;
            this.model.set({count: count});
        },
        'setvalues': function() {
            var values = [];
            this.each(function(index, input) {
                values.push(input.model.get('value'));
            });
            this.model.set({inputvalues: values});
        }
    }
});

var lineProto = $$({
    model: {
        adress: '',
        value: '',
        active: false
    },
    view: {
        format: '<tr data-bind="id=adress"><td class="tiny" data-bind="adress"/><td data-bind="value"/></tr>',
        style: '.tiny {width:80px;}'
    },
    controller: {
        'create': function() {
            this.trigger('change:active');
        },
        'change:active': function() {
            var active = this.model.get('active');
            if (active) {
                this.view.$().addClass('active');
            } else {
                this.view.$().removeClass('active');
            }
        }
    }
});

var accumulatorView = $$({
    model: {
    },
    view: {
        format: '<div>\n\
                <h4>accumulator</h4>\n\
                <table id="accutable" class="table table-condensed">\n\
                   <tr><th>#</th><th>value</th></tr>\n\
                </table></div>'
    },
    controller: {
        'reset': function() {
            this.empty();
        },
        'insert': function(trigger, newAccuRow) {
            if (eval(extractAdressNumberFromObj(newAccuRow)) < 0) {
                controllView.trigger('adderror', {type: 'ACC ERROR', msg: 'negative address'});
            }
            var done = false, self = this, lastId = null;
            this.each(function(index, row) {
                if (eval(extractAdressNumberFromObj(newAccuRow)) < eval(extractAdressNumberFromObj(row))) {
                    self.before(newAccuRow, "#" + row.model.get('adress'));
                    done = true;
                }
            });
            if (!done) {
                self.append(newAccuRow, '#accutable');
            }
        }
    }
});


function extractAdressNumber(adressString) {
    return adressString.substring(1, adressString.length);
}

function extractAdressNumberFromObj(adressObj) {
    return extractAdressNumber(adressObj.model.get('adress'));
}

var errorViewProto = $$({
    model: {
        type: 'Error',
        msg: 'error occured'
    },
    view: {
        format: '<div class="alert alert-danger alert-dismissable">\n\
                   <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>\n\
                    <strong data-bind="type"/> <span data-bind="msg"/>\n\
                </div>'
    },
    controller: {
        'click button': function() {
            this.destroy();
        }
    }
});

var costsView = $$({
    model: {
        ekmtime: 0,
        ekmmem: 0,
        ekmmemmap: {},
        lkmtime: 0,
        lkmmem: 0,
        lkmmemmap: {}
    },
    view: {
        format: '<div class="row">\n\
                <div class="col-md-1"><h4>Costs</h4></div>\n\
                <div class="col-md-1"><p>EKMTime<span class="badge" data-bind="ekmtime"/></p></div>\n\
                <div class="col-md-1"><p>EKMMem<span class="badge" data-bind="ekmmem"/></p></div>\n\
                <div class="col-md-1"><p>LKMTime<span class="badge" data-bind="lkmtime"/></p></div>\n\
                <div class="col-md-1"><p>LKMMem<span class="badge" data-bind="lkmmem"/></p></div>\n\
                </div>'
    },
    controller: {
        'time': function(trigger, logtime) {
            var ekmtime = this.model.get('ekmtime'),
                    lkmtime = this.model.get('lkmtime');
            ekmtime++;
            lkmtime += logtime;
            this.model.set({ekmtime: ekmtime, lkmtime: lkmtime});
        },
        'mem': function(trigger, mem) {
            var ekmmem = this.model.get('ekmmem'),
                    lkmmem = this.model.get('lkmmem'),
                    ekmmemmap = this.model.get('ekmmemmap'),
                    lkmmemmap = this.model.get('lkmmemmap');
            if (!ekmmemmap[mem.register]) {
                ekmmemmap[mem.register] = 1;
                ekmmem++;
            }
            if ((lkmmemmap[mem.register]
                    && lkmmemmap[mem.register] < mem.log)) {
                lkmmem -= lkmmemmap[mem.register];
                lkmmemmap[mem.register] = mem.log;
                lkmmem += mem.log;
            }
            if (!lkmmemmap[mem.register]) {
                lkmmemmap[mem.register] = mem.log;
                lkmmem += mem.log;
            }

            this.model.set({ekmmem: ekmmem, lkmmem: lkmmem});
        },
        'reset': function() {
            this.model.set({
                ekmtime: 0,
                ekmmem: 0,
                lkmtime: 0,
                lkmmem: 0
            });
        }

    }
});

var controllView = $$({
    model: {
        programm: null,
        halt: false,
        running: null
    },
    view: {
        format: '<div>\n\
                  <h4>controlls</h4>\n\
                    <button id="nextbutton" type="button" disabled="disabled" class="btn btn-success">\n\
                        <span class="glyphicon glyphicon-log-in"></span> next</button>\n\
                    <button id="playbutton" type="button" disabled="disabled" class="btn btn-success">\n\
                        <span class="glyphicon glyphicon-play"></span> play</button>\n\
                    <button id="pausebutton" type="button" disabled="disabled" class="btn btn-success">\n\
                        <span class="glyphicon glyphicon-pause"></span> pause</button>\n\
                    <button id="reloadbutton" type="button" disabled="disabled" class="btn btn-success">\n\
                        <span class="glyphicon glyphicon-repeat"></span> reload</button>\n\
                    \n\
                    <div id="errorbox"/>\n\
                </div>'
    },
    controller: {
        'click #nextbutton': function() {
            var programm = this.model.get('programm');
            programm.next();
        },
        'click #playbutton': function() {
            var running = window.setInterval(this.controller.ramloop, 1000);
            this.model.set({running: running});
            this.trigger('enabblebutton');
        },
        'click #pausebutton': function() {
            this.trigger('stoploop');
        },
        'click #reloadbutton': function() {
            this.trigger('stoploop');
            programmView.trigger('switcheditmode');
            programmView.trigger('switcheditmode');

        },
        'ramloop': function() {
            var running, halt = this.model.get('halt');
            if (!halt) {
                halt = this.model.get('halt');
                this.trigger('click #nextbutton');
            } else {
                running = this.model.get('running');
                window.clearInterval(running);
                this.model.set({running: null});
                this.trigger('enabblebutton');
            }
        },
        'stoploop': function() {
            var running = this.model.get('running');
            if (running) {
                window.clearInterval(running);
                this.model.set({running: null});
            }
            this.trigger('enabblebutton');
        },
        'enabblebutton': function() {
            var running = this.model.get('running');
            if (running) {
                this.view.$('#playbutton').attr('disabled', 'disabled');
                this.view.$('#pausebutton').removeAttr('disabled');

            } else {
                this.view.$('#playbutton').removeAttr('disabled');
                this.view.$('#pausebutton').attr('disabled', 'disabled');
            }
        },
        'setgoable': function(trigger, value) {
            if (!value) {
                this.view.$('button').attr('disabled', 'disabled');
            } else {
                this.view.$('button').removeAttr('disabled');
                this.trigger('enabblebutton');
            }
        },
        'adderror': function(trigger, error) {
            var newError = $$(errorViewProto, error);
            this.append(newError, '#errorbox');
            this.trigger('stoploop');
        }
    }
});

var programmView = $$({
    model: {
        editmode: true,
        programmcode: 'R0 = R1 + 4\n\
(R0) = R3 + (R4)\n\
GOTO Z5\n\
R3 = 0\n\
R4 = R3 / R2\n\
R5 = R5 * R2\n\
GGZ R5 Z6\n\
R5 = -100\n\
GLZ (R0) Z11\n\
R6 = 1\n\
HALT',
        programm: null,
        lastactive: null,
        tablemap: {},
        linecount: 0
    },
    view: {
        format: '<div>\n\
                    <h4>programm</h4>\n\
                 <div id="nonedit">\n\
                    <h4><span class="label label-success">executionmodus</span></h4>\n\
                    <button id="editbutton" type="button" class="btn btn-primary">\n\
                    <span class="glyphicon glyphicon-pencil"></span> edit\n\
                </button>\n\
                \n\
                <table id="programmtable" class="table table-condensed">\n\
                <tr><th>line</th><th>cmd</th></tr></table>\n\
                </div>\n\
                <div id="edit">\n\
                <h4><span class="label label-primary">editormodus</span></h5>\n\
                <div id="inputstripcontainer"/>\n\
                \n\
                <textarea data-bind="programmcode" id="programmcode" class="form-control" rows="10">\n\
                </textarea>\n\
                <button id="okbutton" type="button" class="btn btn-primary">\n\
                    <span class="glyphicon glyphicon-ok-sign"></span> ok\n\
                </button>\n\
                </div>\n\
                </div>',
        style: '& button {margin:3px;}'
    },
    controller: {
        'create': function() {
            this.append(inputStrip, "#inputstripcontainer")
            this.trigger('switcheditmode');
        },
        'click #okbutton': function() {
            this.trigger('switcheditmode');
        },
        'click #editbutton': function() {
            this.trigger('switcheditmode');
        },
        'switcheditmode': function() {
            var nonedit = this.view.$('#nonedit');
            var edit = this.view.$('#edit');
            var editmode = this.model.get('editmode');
            var programm = this.model.get('programm');
            if (editmode) {
                nonedit.hide();
                edit.show();
                controllView.trigger('setgoable', false);
            } else {
                nonedit.show();
                edit.hide();
                this.trigger('buildprogrammtable');
                controllView.trigger('setgoable', true);
                if (programm) {
                    var programmcode = this.model.get('programmcode');
                    programm.load(programmcode);

                }
            }
            this.model.set({editmode: !editmode});
        },
        'buildprogrammtable': function() {
            var programmcode = this.model.get('programmcode').toUpperCase();
            var tablemap = this.model.get('tablemap');
            var linecount = this.model.get('linecount');
            var token = programmcode.split('\n');
            var i;
            for (i = 0; i < token.length; i++) {
                if (tablemap['l' + i]) {
                    tablemap['l' + i].model.set({value: token[i]});
                } else {
                    if ($.trim(token[i]) === '' || $.trim(token[i]) === ' ') {
                        controllView.trigger('adderror', {type: 'SYNTAX ERROR', msg: 'empty line:' + i + 1});
                    }
                    var newCmdLine = $$(lineProto, {adress: 'l' + (i + 1), value: token[i]});
                    this.append(newCmdLine, '#programmtable');
                    tablemap['l' + i] = newCmdLine;
                }
            }
            while (i < linecount) {
                tablemap['l' + i].destroy();
                i++;
            }
            this.model.set({linecount: token.length});
        },
        'setlineactive': function(trigger, linenum) {
            var tablemap = this.model.get('tablemap');
            var lastactive = this.model.get('lastactive');
            if (lastactive) {
                lastactive.model.set({active: false});
                if (linenum === -1) {
                    lastactive.view.$().removeClass('success');
                }
            }
            if (linenum > -1) {
                var currentactive = tablemap['l' + linenum];
                currentactive.model.set({active: true});
                this.model.set({lastactive: currentactive});
            }
        },
        'finish': function() {
            var lastactive = this.model.get('lastactive');
            lastactive.view.$().removeClass('active').addClass('success');
        }
    }
});


var containerProto = $$({
    model: {
        childs: []
    },
    view: {
        format: '<div class="container well"></div>'
    },
    controller: {
        'create': function() {
            var childs = this.model.get('childs'),
                    self = this;
            $.each(childs, function(key, value) {
                self.append(value);
            });
        }
    }
});
var controllContainer = $$(containerProto, {childs: [
        $$({}, '<a href="readme.html"><button type="button" class="btn btn-default">README</button></a>'),
        controllView
    ]});
var inputContainer = $$(containerProto, {childs: []});
var costsContainer = $$(containerProto, {childs: [costsView]});
var accuContainer = $$(containerProto, {childs: [programmView, accumulatorView]});

$$.document.append(controllContainer);
//$$.document.append(inputContainer);
$$.document.append(costsContainer);
$$.document.append(accuContainer);