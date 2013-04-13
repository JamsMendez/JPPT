module.exports = function(io) {

	var users 		= [],
			index 		= -1;

	io.configure(function(){
		this.disable('log');
	});

	io.sockets.on('connection', function (socket){

		socket.name_user = 'none';
		
		socket.emit('new-user', users);

		socket.on('add-user', function (name){
			if(this.name_user == 'none'){
				if(name != 'none' && isnameValid(name)){
					index++;
					users[index] = name;
					this.name_user = name;
					this.adversary = 'none';
					this.broadcast.emit('new-user', users);
					this.emit('send-user', users[index]);
				}else{
					this.emit('error-nameuser');
				}
			}
		});

		socket.on('challenge-user', function (challenge, user){
			if(!isnameValid(challenge)){
				if(!isFighting(challenge)){
					this.broadcast.emit('new-challenge', challenge, user);
				}else{
					this.emit('challenge-fighting', challenge);
				}
			}else{
				this.emit('nonexistent', challenge);
			}
		});

		socket.on('respond', function (user, challenge, res){
			if(this.name_user == user){
				if(res == 'yes'){
					this.adversary = challenge;
				}
				this.broadcast.emit('respond-origin', user, challenge, res);
			}
		});

		socket.on('update-adversary', function (challenge){
			this.adversary = challenge;
		});

		socket.on('send-weapon', function(user, adversary, weapon){
			if(this.name_user == user && this.adversary == adversary){
				this.broadcast.emit('received-weapon', this.adversary, this.name_user, weapon);
			}
		});

		socket.on('delete-adversary', function (user){
			if(this.name_user == user){
				this.adversary = 'none';
			}
		});
		
		socket.on('remove-adversary', function (user){
			if(this.name_user == user){

				this.broadcast.emit('warn-adversary', this.adversary);

				this.adversary = 'none';
			}
		});

		socket.on('forceDisconnect', function (){
			this.disconnect();
		});		

		socket.on('disconnect', function () {
			if(this.name_user != 'none'){
				deleteUser (this.name_user);
				index = index - 1;
				if(this.adversary != 'none'){
					this.broadcast.emit('adversary-disconnect', this.name_user);
				}
				this.broadcast.emit('new-user', users);
			}
  	});

	});

	var isFighting = function (nameuser){
		var clients = io.sockets.clients();
		for (var client in clients) {
			if(clients.hasOwnProperty(client)){
				client = clients[client];
				if(client.name_user == nameuser){
					if(client.adversary != 'none'){
						return true;
					}else{
						return false;
					}				
				}
			}	
		}
	}

	var isnameValid = function (nameuser){
		var clients = io.sockets.clients();
		for (var client in clients) {
			if(clients.hasOwnProperty(client)){
				client = clients[client];
				if(client.name_user == nameuser){
					return false;
				}
			}	
		}
		return true;
	}

	function deleteUser (user){
		var pos = users.indexOf(user);
		pos > -1 && users.splice(pos, 1);	
	}
}

