var chat = {
    step: 0,
    enters: 0,
    go: function () {
        if (this.actions.length > this.step) {
            var action = this.actions[this.step],
                method = action.substr(0, action.indexOf(' ')),
                params = action.substr(action.indexOf(' ') + 1);
            if (this[method] !== undefined) {
                this[method](params);
            } else {
                this.step++;
                this.go();
            }
        }
    },
    me: function (name) {
        this.me = name;
        $('.me').text(name);
        this.step++;
        this.go();
    },
    you: function (name) {
        this.you = name;
        $('.you').text(name);
        this.step++;
        this.go();
    },
    say: function (message) {
        var message = message.replace(/"/g, ''),
            time = this.timestamp();
        $('[data-messages]').append(
            '<li class="in"><span>' + this.you + ' (' + time +'):</span><br>' + message + '</li>'
        );
        this.scrollBottom();
        this.step++;
        this.go();
    },
    wait: function (params) {
        var self = this,
            params = params.split(' '),
            amount = parseInt(params.shift()),
            event = params.shift(),
            timer;
        if (event === 'enter' || event === 'enters') {
            $('[data-message]').on('keypress', function (e) {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    self.enters++;
                    self.respond($(this).val());
                    $(this).val('').focus();
                    if (amount === self.enters) {
                        $(this).off('keypress');
                        self.enters = 0;
                        self.step++;
                        self.go();
                    }
                }
            });
        }
        if (event === 'second' || event === 'seconds') {
            timer = window.setTimeout(function() {
                self.step++;
                self.go();
            }, amount * 1000);
        }
    },
    respond: function (message) {
        var time = this.timestamp();
        $('[data-messages]').append(
            '<li class="out"><span>' + this.me + ' (' + time +'):</span><br>' + message + '</li>'
        );
        this.scrollBottom();
    },
    type: function (params) {
        var self = this,
            params = params.split(' '),
            amount = params.shift(),
            timer,
            delay;
        $('.status').text(this.you + ' is typing...');
        timer = window.setTimeout(function() {
            $('.status').text('');
            delay = window.setTimeout(function() {
                self.step++;
                self.go();
            }, 50);
        }, amount * 1000);
    },
    scrollBottom: function () {
        $('[data-messages]').animate({
            scrollTop: $('[data-messages]')[0].scrollHeight
        }, 1000);
    },
    timestamp: function () {
        var date = new Date();
        return this.addZero(date.getHours()) + ':' + this.addZero(date.getMinutes());
    },
    addZero: function (i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }
};