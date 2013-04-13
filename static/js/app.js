$(document).on('ready', init);

var weapons = ['stone', 'scissors', 'role'],
		nameuser,
		youweapon,
		hisweapon;

var turno = 0;

//Empate
//Que cada usuario no pueda tirar dos veces

function init (){

	var websocket = io.connect('/');

	websocket.on('error-nameuser', function (){
		$('#notification').text('El usuario ya existe');
	});

	websocket.on('nonexistent', function (challenge){
		$('#notification').text('El usuario '+ challenge +' no existe');
	});

	websocket.on('send-user', function (name){
			nameuser = name;
			$('#nameuser').text(nameuser);
			//Vaciar
			$('#user').val('');
	});

	websocket.on('new-user', function (users){
		$('').replaceAll('.users');
		for (var i = 0; i < users.length; i++) {
			if(nameuser !== users[i])
				$('#listuser').append("<li class='users'>"+ users[i] +"</li>");
		}
	});

	websocket.on('challenge-fighting', function (challenge){
		alert(challenge + ' esta en medio un duelo');
	});

	websocket.on('new-challenge', function (challenge, user){
		if(nameuser == challenge){
			if (confirm(user + " te reta a un duelo!!!")) {
				websocket.emit('respond', nameuser, user,'yes');
				$('#yourchallenging').text(user);

				//QUitar el Modo Robot	
				$('#robot').removeAttr('checked');
				$('#robot').hide();
			}else{
				websocket.emit('respond', nameuser, user, 'no');
			}
		}
	});

	websocket.on('respond-origin', function (user, challenge,res){
		if(nameuser == challenge){
			if(res == 'yes'){
				alert(user + " Acepta el Reto!!!");
				websocket.emit('update-adversary', user);
				$('#yourchallenging').text(user);

				//Quitar el Modo Robot
				$('#robot').removeAttr('checked');
				$('#robot').hide();
			}else{
				alert(user + " dice que no :(");
			}
		}
	});

	websocket.on('received-weapon', function (user, adversary, weapon){
		var other_user = $('#yourchallenging').text();
		if(nameuser == user && other_user == adversary){
			hisweapon = weapon;		
			turno++;
			if(turno == 2){
				$('#p2 img').attr('src', '/img/'+ hisweapon +'.png');
				$.timer(1000, function (timer) {
					if(isWinner(youweapon, hisweapon)){
						alert("Ganaste!!!");
					}else{
						alert("Perdiste!!!");
					}
					turno = 0;
					$('div>img').attr('src','/img/none.png');
					$('#p1 img').attr('alt','Arma de Player 1');
					$('#p2 img').attr('alt','Arma de Player 2');
					
					$('.btn').prop('disabled', false);
					timer.stop();
  			});
			}else{
				$('#p2 img').attr('src','/img/ready.png');
			}
		}
	});
	
	websocket.on('warn-adversary', function (user){
		if(nameuser == user){
			var adversary = $('#yourchallenging').text();
			if(adversary != ''){
				$('#yourchallenging').text('');
				websocket.emit('delete-adversary', nameuser);
				alert(adversary + " decidio terminar el Duelo");
			}
		}
	});

	websocket.on('adversary-disconnect', function (user_disconnect){
		var adver = $('#yourchallenging').text();
		if(user_disconnect == adver){
			alert(adver + ' se acabade desconectar');
			$('#yourchallenging').text('');
			websocket.emit('delete-adversary', nameuser);

			//Mostrar el Modo Robot
			$('#robot').show();
		}
	});

	$('#btn-user').on('click', function (){
		if(nameuser == undefined){
			var name = $('#user').val();
			websocket.emit('add-user', name);
			//Vaciar
			$('#notification').text('');
			$('#user').val('');
		}else{
			$('#notification').text('Tu Usuario es: ' + nameuser);
		}
	});

	$('#btn-challenge').on('click', function (){
		if(nameuser !== undefined){
			var user = $('#challenging').val();
			websocket.emit('challenge-user', user, nameuser);
			$('#challenging').val('');
		}else{
			$('#notification').text('No tienes Usuario');
		}
	});

	$('#stone').on('click', function (){
		var challenging = $('#yourchallenging').text();
		websocket.emit('send-weapon', nameuser, challenging, weapons[0]);
		getWinner(weapons[0]);

		$('.btn').prop('disabled', true);
	});

	$('#scissors').on('click', function (){
		var challenging = $('#yourchallenging').text();
		websocket.emit('send-weapon', nameuser, challenging, weapons[1]);
		getWinner(weapons[1]);

		$('.btn').prop('disabled', true);
	});

	$('#role').on('click', function (){
		var challenging = $('#yourchallenging').text();
		websocket.emit('send-weapon', nameuser, challenging, weapons[2]);
		getWinner(weapons[2]);

		$('.btn').prop('disabled', true);
	});

	$('#notification').on('click', function (){
		$(this).text('');
	});
	
	$('#close').on('click', function (){
		var adversary = $('#yourchallenging').text();
		if(adversary != ''){
			$('#yourchallenging').text('');
			websocket.emit('remove-adversary', nameuser);
		}
	});

}

function getWinner(weapon){
	if(!$('#robot').attr('checked')){
		//Modo Live
		$('#p1 img').attr('src', '/img/' + weapon + '.png');
		youweapon = weapon;
		turno++;
		if(turno == 2 && hisweapon !== undefined){
			$('#p2 img').attr('src', '/img/'+ hisweapon +'.png');
			$.timer(1000, function (timer) {
				if(isWinner(youweapon, hisweapon)){
					alert("Ganaste!!!");
				}else{
					alert("Perdiste!!!");
				}
				turno = 0;
				$('div>img').attr('src','/img/none.png');
				$('#p1 img').attr('alt','Arma de Player 1');
				$('#p2 img').attr('alt','Arma de Player 2');

				$('.btn').prop('disabled', false);
				timer.stop();
			});
		}
	}else{
		//Modo Robot
		$('#p1 img').attr('src', '/img/' + weapon + '.png');
		var num = number();
		showBattle(num);
		$.timer(1000, function (timer) {
			if(isWinner(weapon, weapons[num])){
				alert("Ganaste!!!");
			}else{
				alert("Perdiste!!!");
			}
			$('div>img').attr('src','/img/none.png');
			$('#p1 img').attr('alt','Arma de Player 1');
			$('#p2 img').attr('alt','Arma de Player 2');

			$('.btn').prop('disabled', false);
			timer.stop();
		});
	}
}


function isWinner (p1, p2){
	if(p1 == 'stone' && p2 == 'scissors'){
		return true;
	}else if(p1 == 'scissors' && p2 == 'role'){
		return true;
	}else if(p1 == 'role' && p2 == 'stone'){
		return true;
	}else{
		return false;
	}
}

function showBattle(num){
	switch(num){
		case 0:
			$('#p2 img').attr('src', '/img/stone.png');
		break;
		case 1:
			$('#p2 img').attr('src','/img/scissors.png');
		break;
		case 2:
			$('#p2 img').attr('src','/img/role.png');
		break;
	}
}

var number = function (){
	return Math.floor((Math.random()*3));
}



