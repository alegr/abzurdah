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
            software,
            comments;
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

            // Get post text
            content = data.shift();

            // Set iframe source
            $('iframe').attr('src', 'blog/' + self.mode + '.html');

            window.setTimeout(function() {
                var iframe = $('iframe').contents();

                // Put HTML inside the iframe
                iframe.find('#content').html(content.replace("\n",'<br/>'));
                iframe.find('#textarea').val(content);
                if (self.title) {
                    iframe.find('#title').val(self.title);
                    iframe.find('#title-content').text(self.title);
                }

                if (self.mode === 'admin') {
                    iframe.find('#publish-link').on('click', function(ev){
                        ev.preventDefault();
                        window.location = window.location.href.replace('admin', 'detalle');
                        window.location.reload();
                    })
                }

                // Resize iframe
                $('iframe').height($(window).height() - 150);

                // TODO: show comments
                var myComments = data.shift();
                if ( (self.mode === 'detalle') && (myComments) ) {
                    comments = myComments.split('\n');
                    // console.log(comments);

                    /********************************/
                    $.each(comments, function () {
                        var comment = this.split(': '),
                            nick = comment.shift(),
                            text = comment.shift();

                        if (nick) {
                            self.messages.push({
                                nick: nick,
                                text: text,
                                color: 'black',
                                number: false,
                                email: false
                            });
                        }

                    });
// console.log(self.messages);
                    self.comment();
                    /********************************/

                }

            }, 1000);
        }
    },
    mode: function (mode) {

        // Set browser mode
        this.mode = mode;
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
    script: function (script) {

        // Set the logged user data
        this.script = script;
    },
    title: function (title) {

        // Set the logged user data
        this.title = title;
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
        if (conversation.get(0)) {
            conversation.animate({
                scrollTop: conversation.get(0).scrollHeight
            }, 1000);
        }
    },

    comment: function () {

        var iframe = $('iframe').contents();

        var self = this,
            message = self.messages[self.step],
            input = iframe.find('[data-comment]');

        // Abort if the message does not exists
        if (message === undefined) {
            return false;
        }

        // Set cursor
        input.focus();
        var myForm = iframe.find('#form-comment');

        if (message.nick !== self.user) {

            // Show incoming message after 2 seconds
            window.setTimeout(function() {
                self.addComment(message);
                self.step++;
                self.comment();
            }, 2000);
        } else {

            // Prepare outcoming message
            myForm.on('submit', function (e) {
                e.preventDefault();

                // If some text was entered, overwrite the default
                if (input.val() !== '') {
                    message.text = input.val();
                }

                // Clean up
                input.val('').focus();
                myForm.off('submit');

                // Show message and continue
                self.addComment(message);
                self.step++;
                self.comment();
            });
        }
    },
    addComment: function (message) {
        var self = this,
            style = (message.nick !== self.user) ? 'in' : 'out';

        // Get iframe
        var iframe = $('iframe').contents();
    
        // Get template and replace content
        var template = iframe.find('.avatar-comment-indent > div:first').clone();
        $('.comment-user', template).text(message.nick);
        template.children(".comment-body").text(message.text);

        iframe.find('#comments-block').append(template);
    }

};