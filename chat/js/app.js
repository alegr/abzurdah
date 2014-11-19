var app = {
    step: 0,
    user: '',
    messages: [],
    contacts: {
        Hogweed: {
            color: 'blue'
        },
        Abzurdah: {
            color: 'red'
        },
        Barbarella: {
            color: 'purple'
        },
        Mortadelo: {
            color: 'green'
        },
        Travis: {
            color: 'brown'
        },
        r2d2: {
            color: 'orange'
        },
        Kitty: {
            color: 'violet'
        },
        Alejo: {
            color: 'blue'
        },
        Hiedra: {
            color: 'red'
        }
    },
    start: function (data) {
        var self = this,
            config,
            messages,
            currentNick = '',
            nicks = [],
            software;
        data = data.split('---');

        // Set configuration options
        config = data.shift().split('\n');
        $.each(config, function () {
            var action = this.split(': '),
                method = action.shift(),
                params = action.shift();
            if ($.isFunction(app[method])) {
                app[method](params);
            }
        });

        // Start chat
        if (self.software === '.msn' || self.software === '.icq') {
            messages = data.shift().split('\n');
            $.each(messages, function () {
                var message = this.split(': '),
                    nick = message.shift(),
                    text = message.shift();
                if (nick) {
                    self.messages.push({
                        nick: nick,
                        text: text,
                        color: self.contacts[nick].color || 'black',
                        number: self.contacts[nick].number || false,
                        email: self.contacts[nick].email || false
                    });
                }
            });
            self.chat();
        }

        // Start blog
        if (self.software === '.browser') {

        }
    },
    open: function (software) {
        var software = '.' + software.toLowerCase();

        // Set the current software
        this.software = software;

        // Show the window
        $(software).css({
            marginLeft: 0 - ($(software).width() / 2)
        }).addClass('opened');
    },
    user: function (nick) {

        // Set the logged user data
        this.user = nick;
    },
    contact: function (nicks) {

        // Set the contact's nick
        var software = $(this.software);
        software.find('[data-nick-input]').val(nicks);
        software.find('[data-nick-text]').text(nicks);
    },
    number: function (number) {

        // Set the contact's number
        var software = $(this.software);
        software.find('[data-number-input]').val(number);
    },
    address: function (address) {

        // Set the contact's number
        var software = $(this.software);
        software.find('[data-address-input]').val(address);
    },
    chat: function () {
        var self = this,
            message = self.messages[self.step],
            input = $(self.software).find('[data-message]');

        // Abort if the message does not exists
        if (message === undefined) {
            return false;
        }

        // Set cursor
        input.focus();

        if (message.nick !== self.user) {

            // Show incoming message after 2 seconds
            window.setTimeout(function() {
                self.talk(message);
                self.step++;
                self.chat();
            }, 2000);
        } else {

            // Prepare outcoming message
            input.on('keypress', function (e) {
                if (e.keyCode === 13) {
                    e.preventDefault();

                    // If some text was entered, overwrite the default
                    if (input.val() !== '') {
                        message.text = input.val();
                    }

                    // Clean up
                    input.val('').focus();
                    input.off('keypress');

                    // Show message and continue
                    self.talk(message);
                    self.step++;
                    self.chat();
                }
            });
        }
    },
    talk: function (message) {
        var self = this,
            style = (message.nick !== self.user) ? 'in' : 'out';

        // Add the message to the chat window
        $(self.software).find('[data-messages]').append(
            '<li class="' + style +'">' + message.nick +' dice:<br><span style="color: ' + message.color + '">' + message.text + '</span></li>'
        );
        self.scrollBottom();
    },
    scrollBottom: function () {
        var self = this,
            conversation = $(self.software).find('[data-messages]');

        // Scroll the chat window
        conversation.animate({
            scrollTop: conversation.get(0).scrollHeight
        }, 1000);
    }
};