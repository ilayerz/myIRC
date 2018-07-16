$(function () {
    var socket = io();
    var connexion = user.pseudo + " s'est connecté";
    var premierpseudo = user.pseudo;
    var curChannel = 'general';
    
    /**new user
     * Envoie au server le pseudo du nouvel utilisateur pour le stocker
     */
    socket.emit('new user', user.pseudo);

    /**Connexion
     * Envoie un message au channel lors de l'arrivée d'un nouvel utilisateur
     */
    socket.emit('chat message', {content: connexion, channel: curChannel} );
    
    
    /**Evenement on click sur les channels (haut de la page)
     * Ajoute la class active au channel sur lequel on clique
     * Enlève la class active au channel principal précédent
     */
    $('.tabs').click(function(event){
        $('.active').removeClass('active');
        $(event.target).addClass('active');
        socket.emit('active channel', event.target.id);
        $('#messages').html('');
        curChannel = event.target.id;
    })
    
    $('form').submit(function(){
        if($('#m').val().substring(0,6) === '/nick '){
            
            var msg = {content :premierpseudo + " a changé son surnom en: " + $('#m').val().substring(6), channel: curChannel};
            
            user.pseudo = $('#m').val().substring(6) + " [ " + premierpseudo + " ]" ;
            socket.emit('chat message', msg);
            
            $('#m').val('');
            return false;
            
        }else if($('#m').val().substring(0,6) === '/join '){
            var channel = $('#m').val().substring(6);
            $('.tabs').append('<li id="'+channel+'">'+channel+'</li>');
            socket.emit('join channel', channel);
            $('#m').val('');
            return false;
            
        }else if($('#m').val().substring(0,6) === '/part '){
            var channel = $('#m').val().substring(6);
            if(channel === "general"){
                $('#messages').append($('<li>').text("Vous ne pouvez pas quitter le channel général"));
                $('#m').val('');
                return false;
            }
            $('li#'+channel).remove();
            curChannel = 'general';
            $('li#general').addClass('active');
            $('#messages').html('');
            socket.emit('leave channel', channel);
            $('#m').val('');
            return false;
            
        }else if($('#m').val().substring(0,5) === '/msg '){
            var msgArray = $('#m').val().split(" ");
            if(msgArray[2]){
                //var destinataire = msgArray[1];
                //var DM = msgArray[2];
                msgArray[3] = user.pseudo;
                var MP = { content : msgArray, by: user.pseudo}
                socket.emit('message privé', MP);
                $('#m').val('');
                return false;
            }
        }else if ($('#m').val().substring(0,7) === '/admin '){
            if(user.pseudo === "admin"){
                var msgArray = $('#m').val().split(" ");
                if(msgArray[1] === "rename"){
                    var room = {actualroom: msgArray[2], nextroom: msgArray[3]};
                    socket.emit('change name room', room);
                }
                if(msgArray[1] === "delete"){
                    if(msgArray[2]){
                        socket.emit('delete room', msgArray[2])
                    }
                }
            }
            $('#m').val('');
            return false;
        }else if ($('#m').val().substring(0,6) === '/users'){
            var test = {pseudo: user.pseudo, channel: curChannel};
            socket.emit('users list', test);
            $('#m').val('');
            return false;  
        }else if($('#m').val().substring(0,5) === '/list'){
            var content = {pseudo: user.pseudo, channel: curChannel};
            socket.emit('channel list', content);
            $('#m').val('');
            return false;
        } else{
            var msg = user.pseudo + ": " + $('#m').val();
            var message = {content: msg, channel: curChannel}
            socket.emit('chat message', message);
            $('#m').val('');
            return false;
        }
    });
    
    /**Évènement message privé
    * Permet d'envoyer un message à un utilisateur existant
    * Prévient l'auteur que le message est envoyé
    */
    socket.on('message privé', function(MP){
        if(user.pseudo == MP.by){
            var msg = "Vous avez envoyé un Message Privé à "+MP.content[1]+ " : "+ MP.content[2] ;
            $('#messages').append($('<li>').text(msg));
        }else{
            var msg = MP.content[3] + " vous a envoyé en privé: "+ MP.content[2];
            $('#messages').append($('<li>').text(msg));
        }
    })
    
    
    /**Évènement message chat
    * Incère dans le channel actif (curChannel) le contenu du message
    */
    socket.on('chat message', function(msg){
        if(msg.channel == curChannel){
            $('#messages').append($('<li>').text(msg.content));
        }
    });
    
    /**Évènement quitter le channel
     * Enlève le channel de la liste en haut de la page
     * Met le channel "général" comme actif
     */
    socket.on('leave', function(channel){
        $('li#'+channel).remove();
        curChannel = 'general';
        $('li#general').addClass('active');
        $('#messages').html('');
    });
    
    /**Évènemenr changer le nom du channel (admin)
     * Change le nom du channel passé en paramètre
     */
    socket.on('change', function(channel){
        $('li#'+channel.actualroom).attr('id', channel.nextroom);
        $('li#'+channel.nextroom).text(channel.nextroom);
    });
});