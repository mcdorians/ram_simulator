/*
 * Logic Objects declatation
 */

function getLogCosts(decimal) {
    return Number(decimal).toString(2).length;
}

function Accumulator() {
    this.map = {};
    this.registerCount = 0;
}
Accumulator.prototype.addRegister = function(value) {
    if (!this.map['R' + this.registerCount]) {
        var newRegister = $$(lineProto, {adress: 'R' + this.registerCount, value: (value) ? value : ''});
        this.map['R' + this.registerCount] = newRegister;
        accumulatorView.trigger('insert', newRegister);
        this.registerCount++;
    } else {
        this.registerCount++;
        this.addRegister(value);
    }
};
Accumulator.prototype.setRegister = function(r, value) {
    if (this.map[r]) {
        this.map[r].model.set({value: value});
    } else {
        var newRegister = $$(lineProto, {adress: r, value: value});
        this.map[r] = newRegister;
        accumulatorView.trigger('insert', newRegister);
    }
};

Accumulator.prototype.getValue = function(r) {
    if (this.map[r]) {
        return this.map[r];
    } else {
        //TODO Error nicht gefunden
    }
};

Accumulator.prototype.reset = function(r) {
    this.map = {};
    this.registerCount = 0;
    accumulatorView.empty();
};


function RAM(accumulator) {
    this.programm = {};
    this.pc = 0;
    this.linecount = 0;
    this.halt = false;
    this.ekm = 0;
    this.lkm = 0;
    this.accu = accumulator;

}

RAM.prototype.load = function(programmcode) {
    this.programm = {};
    this.pc = 0;
    this.linecount = 0;
    this.halt = false;
    this.accu.reset();
    costsView.trigger('reset');
    controllView.model.set({halt: false});
    programmView.trigger('setlineactive', -1);
    var token = programmcode.split('\n');
    var i;
    for (i = 0; i < token.length; i++) {
        this.programm['l' + i] = token[i];
    }
    this.linecount = token.length;
//    programmView.trigger('setlineactive', this.pc);
    inputStrip.trigger('setvalues');
    var inputvalues = inputStrip.model.get('inputvalues');
    for (var i = 0; i < inputvalues.length; i++) {
        this.accu.addRegister(inputvalues[i]);
    }
};

RAM.prototype.next = function() {
    if (this.pc < this.linecount && !this.halt) {
        programmView.trigger('setlineactive', this.pc);
        this.c();
    } else {
        if (this.halt) {
            if (this.pc < this.linecount && this.halt) {
                controllView.trigger('adderror', {type: 'SYNTAX ERROR', msg: 'HALT reached, but still lines remaining:' + (this.pc + 1)});
            }
            //Programm erfolgreich zuende
            programmView.trigger('finish');
            controllView.model.set({halt: true});
        } else {
            //Programm hat Fehler
            controllView.trigger('adderror', {type: 'SYNTAX ERROR', msg: 'HALT missing,reached end od programm on line:' + (this.pc + 1)});
        }
    }
};

RAM.prototype.c = function() {
//    var cmd = $.trim(this.programm['l' + this.pc]).toUpperCase();
    var cmd = this.programm['l' + this.pc];
    if (cmd.indexOf("//") !== -1) {
        cmd = cmd.substring(0, cmd.indexOf("//"));
    }
    cmd = $.trim(cmd).toUpperCase();
    if (cmd.indexOf("=") !== -1) {
        var token = cmd.split("=");
        var cmdObj = {
            r: token[0].replace(/ /g, ''),
            v: this.lexer(token[1])
        };
        if (!this.assertToken(token, [2]) || cmdObj.v.error) {
            controllView.trigger('adderror', {type: 'SYNTAX ERROR', msg: ' on line:' + (this.pc + 1)});
        }
        console.log(cmdObj);
        if (cmdObj.v.val2 !== '') {
            //3
            this.assign(cmdObj.r, this.calc(cmdObj.v.val1, cmdObj.v.op, cmdObj.v.val2));
        } else {
            //1
            var resnts = this.evalNts(cmdObj.v.val1);
            this.assign(cmdObj.r, resnts);
            costsView.trigger('time', getLogCosts(resnts));
        }
        this.pc++;
    } else {
        //HALT,goto,glz,ggz,gz

        if (cmd === 'HALT') {
            this.halt = true;
            this.pc++;
            costsView.trigger('time', 1);
        } else {
            var token = cmd.split(" "), firstToken = token[0], value, jump = false;
            if (!this.assertToken(token, [3, 2]) && firstToken.length <= 0) {
                controllView.trigger('adderror', {type: 'SYNTAX ERROR', msg: ' on line:' + (this.pc + 1)});
            }

            if (token.length === 2) {
                //GOTO
                this.pc = eval(token[1].substring(1, token[1].length)) - 1;
                costsView.trigger('time', 1);
            } else {
                value = this.evalNts(token[1]);
                costsView.trigger('time', getLogCosts(value));
                switch (firstToken) {
                    case 'GZ':
                        jump = (value == 0);
                        break;
                    case 'GGZ':
                        jump = (value > 0);
                        break;
                    case 'GLZ':
                        jump = (value < 0);
                        break;
                    default:
                        controllView.trigger('adderror', {type: 'SYNTAX ERROR', msg: ' on line:' + (this.pc + 1)});
                        break;

                }
                if (jump) {
                    this.pc = eval(token[2].substring(1, token[1].length)) - 1;
                } else {
                    this.pc++;
                }
            }
        }
    }
};

RAM.prototype.evalNts = function(nts) {
    if (isNaN(nts)) {
        //Adress
        return this.getValue(this.getAdress(nts));
    } else {
        //Digit
        return nts;
    }
};

RAM.prototype.calc = function(nts1, op, nts2) {
    var result,
            resnts1 = this.evalNts(nts1),
            resnts2 = this.evalNts(nts2),
            evalStr = resnts1 + op + resnts2;
    console.log(evalStr);
    costsView.trigger('time', getLogCosts(resnts1) + getLogCosts(resnts2));
    result = Math.floor(eval(evalStr));
    if (result > 9007199254740992 || result < -9007199254740991) {
        //http://ecma262-5.com/ELS5_HTML.htm#Section_8.5
        controllView.trigger('adderror', {type: 'MATH ERROR', msg: 'Integer overflow on line:' + (this.pc + 1)});
        result = 0;
    }
    return (result ? result : '0');
};

RAM.prototype.assign = function(r, value) {
    costsView.trigger('mem', {log: getLogCosts(value) + getLogCosts(r.replace(/\D/g, '')), register: r});
    this.accu.setRegister(this.getAdress(r), value);
};

RAM.prototype.getValue = function(addr) {
    var value, addrObj = this.accu.getValue(addr);
    if (!addrObj) {
        controllView.trigger('adderror', {type: 'ACC ERROR', msg: addr + ' not defined on line:' + (this.pc + 1)});
    }
    value = addrObj.model.get('value');
    if (value) {
//        costsView.trigger('mem', {log:getLogCosts(value)});
        return value;
    } else {
        controllView.trigger('adderror', {type: 'ACC ERROR', msg: addr + ' not defined on line:' + (this.pc + 1)});
    }
};

RAM.prototype.getAdress = function(addr) {
    if (addr.indexOf("(") === 0) {
        if (addr.indexOf(")") === addr.length - 1) {
            var targetAddr = addr.substring(1, addr.length - 1),
                    newaddr = this.getValue(targetAddr);
            if (newaddr >= 0) {
                return "R" + this.getValue(targetAddr);
            } else {
                controllView.trigger('adderror', {type: 'ACC ERROR', msg: 'negative address on line:' + (this.pc + 1)});
            }
        } else {
            controllView.trigger('adderror', {type: 'SYNTAX ERROR', msg: 'missing ")" on line:' + (this.pc + 1)});
        }
    } else {
        return addr;
    }
};

RAM.prototype.lexer = function(string) {
    var parseObj = {
        r: '',
        val1: '',
        op: '',
        val2: '',
        error: false
    }, i, peek;
    for (i = 0; i < string.length; i++) {
        peek = string[i];
        if (peek === ' ') {
            continue;
        }
        if (peek === ':') {
            parseObj.error = true;
            continue;
        }
        if (peek === '-' && parseObj.val1 === '') {
            parseObj.val1 += peek;
            continue;
        }
        if (peek === '-' && parseObj.op !== '') {
            parseObj.val2 += peek;
            continue;
        }
        if ((peek === '+' ||
                peek === '-' ||
                peek === '*' ||
                peek === '/')) {
            if (parseObj.val1 !== '') {
                if (parseObj.op === '') {
                    parseObj.op = peek;
                    continue;
                } else {
                    parseObj.error = true;
                }
            }
        }
        if (parseObj.op !== '') {
            parseObj.val2 += peek;
        } else {
            parseObj.val1 += peek;
        }

    }
    return parseObj;
};

RAM.prototype.assertToken = function(token, values) {
    return ($.inArray(token.length, values) > -1)
            && (token[token.length - 1] !== "");
};


/*
 * Init
 */
var accu = new Accumulator();
var ram = new RAM(accu);
programmView.model.set({programm: ram});
controllView.model.set({programm: ram});
