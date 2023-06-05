function criarElemento(tagName, className) {
	const elemento = document.createElement(tagName);
	elemento.className = className;
	return elemento 
}


function Barreira(reversa = false) {
	this.barreira = criarElemento('div', 'barreira');

	const borda = criarElemento('div', 'borda');
	const corpo = criarElemento('div', 'corpo');
	this.barreira.appendChild(reversa ? corpo : borda);
	this.barreira.appendChild(reversa ? borda : corpo);

	this.setAltura = altura => corpo.style.height = `${altura}px`
}


function parDeBarreiras(alturaDivJogo, larguraDivJogo, abertura) {
	this.elemento = criarElemento('div', 'par-de-barreiras');

	this.barreiraSuperior = new Barreira(true);
	this.barreiraInferior = new Barreira(false);

	this.elemento.appendChild(this.barreiraSuperior.barreira);
	this.elemento.appendChild(this.barreiraInferior.barreira);

	this.definirAbertura = () => {
		const alturaSuperior = Math.random() * (alturaDivJogo - abertura);
		const alturaInferior = alturaDivJogo - alturaSuperior - abertura;

		this.barreiraSuperior.setAltura(alturaSuperior);
		this.barreiraInferior.setAltura(alturaInferior);
	}

	this.getX = () => parseInt(this.elemento.style.left.split('px')[0]);
	this.setX = distancia => this.elemento.style.left = `${distancia}px`;
	this.getLargura = () => this.elemento.clientWidth;

	this.definirAbertura();
	this.setX(larguraDivJogo);
}

function BarreirasArray(alturaDivJogo, larguraDivJogo, abertura, espaco, notificarPonto) {

	let deslocamento = 0;
	const dificuldade = document.getElementsByName('dificuldade-escolhida')[0].value
	
	if(dificuldade == "facil"){
		deslocamento = 3;
	}else if (dificuldade == "medio"){
		deslocamento = 7;
	}else if(dificuldade == "dificil") {
		deslocamento = 16;
		espaco += 90;
	}else if (dificuldade == "hardcore"){
		deslocamento = 40;
		espaco += 200;
	}else{
		deslocamento = 80;
		espaco += 200;
	}


	this.paresDeBarreiras = [
		new parDeBarreiras(alturaDivJogo, larguraDivJogo, abertura),
		new parDeBarreiras(alturaDivJogo, larguraDivJogo + espaco, abertura),
		new parDeBarreiras(alturaDivJogo, larguraDivJogo + espaco * 2, abertura),
		new parDeBarreiras(alturaDivJogo, larguraDivJogo + espaco * 3, abertura),
		new parDeBarreiras(alturaDivJogo, larguraDivJogo + espaco * 4, abertura),
		new parDeBarreiras(alturaDivJogo, larguraDivJogo + espaco * 5, abertura),
		new parDeBarreiras(alturaDivJogo, larguraDivJogo + espaco * 6, abertura), 
	]

	this.animarBarreiras = () => {
		this.paresDeBarreiras.forEach(par => {

				par.setX(par.getX() - deslocamento);
				
				if (par.getX() < -par.getLargura()) {
					par.setX( par.getX() + espaco * this.paresDeBarreiras.length);
					par.definirAbertura();

				}

				const meio = larguraDivJogo / 2;
				const larguraPar = par.clientWidth;
				const cruzouMeio = par.getX() + deslocamento >= meio && par.getX() < meio
				if (cruzouMeio){
					notificarPonto();
				}

			}
		)
	}
}

function Player(alturaDivJogo, personagem) {

	let voando = false;

	this.player = criarElemento('img', 'player');
	this.player.src = `imgs/${personagem}.png`;
	// this.player.style.border = "1px solid black"
	this.player.style.padding = '-15px'

	if (personagem === "aviao"){
		this.player.style.height = '30px'

	}


	this.getAltura = () => parseInt(this.player.style.bottom.split('px')[0]);
	this.setAltura = altura => this.player.style.bottom = `${altura}px`;

	window.onkeydown = e => voando = true;
	window.onkeyup = e => voando = false;

	window.onmousedown = e => voando = true;
	window.onmouseup = e => voando = false;

	window.ontocuhstart = e => voando = true;
	window.ontouchend = e => voando = false;

	this.animarPlayer = () => {
		const novaAltura = this.getAltura() + (voando ? 8 : -5);
		const alturaMaxima = alturaDivJogo - this.player.clientHeight;

		if (novaAltura >= alturaMaxima){
			this.setAltura(alturaMaxima);
		}else if (novaAltura <= 0){
			this.setAltura(0);
		}else {
			this.setAltura(novaAltura);
		}
	}

	this.setAltura(alturaDivJogo / 2)



}

function Placar() {
	this.placar = criarElemento('span', 'progresso');

	this.atualizarPontos = pontos => {
		this.placar.innerHTML = pontos;
	}

	this.atualizarPontos(0);
}

function estaoSobrepostos(elementoA, elementoB) {
	const a = elementoA.getBoundingClientRect();
	const b = elementoB.getBoundingClientRect();

	const sobreposicaoHorizontal = a.left + a.width >= b.left && b.left + b.width >= a.left;
	const sobreposicaoVertical = a.top + a.height >= b.top && b.top + b.height >= a.top;

	return sobreposicaoHorizontal && sobreposicaoVertical
}

function colidiu(player, barreirasArray) {
	let colidiu = false;

	barreirasArray.paresDeBarreiras.forEach(par => {
		if (!colidiu) {
			const barreiraSuperior = par.barreiraSuperior.barreira;
			const barreiraInferior = par.barreiraInferior.barreira;
			colidiu = estaoSobrepostos(player, barreiraSuperior) || estaoSobrepostos(player, barreiraInferior);
		}
	})

	return colidiu

}

function jogarFlappyBird() {
	let pontos = 0;

	this.divJogo = document.querySelector("[ag-flappy]")
	const alturaDivJogo = this.divJogo.clientHeight
	const larguraDivJogo = this.divJogo.clientWidth

	console.log(alturaDivJogo, larguraDivJogo)

	const placar = new Placar()



	const personagemEscolhido = document.getElementsByName('personagem-escolhido')[0].value
	console.log(personagemEscolhido)
	const player = new Player(alturaDivJogo, personagemEscolhido);

	const barreiras = new BarreirasArray(alturaDivJogo, larguraDivJogo, 240, 260, () => placar.atualizarPontos(++pontos));

	this.divJogo.appendChild(placar.placar);
	this.divJogo.appendChild(player.player);
	barreiras.paresDeBarreiras.forEach(par => this.divJogo.appendChild(par.elemento));
	console.log(barreiras)

	this.start = () => {
		const temporizador = setInterval(() => {
			barreiras.animarBarreiras();
			player.animarPlayer();

			let imagemGameOver = document.querySelector(".game-over");
			let button = document.getElementById("button-jogar");
			if (colidiu(player.player, barreiras)) {
				imagemGameOver.src = "imgs/game_over.png";
				imagemGameOver.style.display = "block";
				button.style.display = "flex";
				button.style.alignItems = "center";
				button.style.justifyContent = "center";
				clearInterval(temporizador);
			}

		}, 20)
	}
}

function mudarPeriodo(){
	let divJogo = document.querySelector('[ag-flappy]');
	console.log(divJogo)
	divJogo.classList.toggle('noite')
}



const jogo = new jogarFlappyBird()
jogo.start();

const buttonJogar = document.querySelector("#button-jogar");
buttonJogar.onclick = function() {
	// console.log(jogo.divJogo.children)

	if (jogo.divJogo.hasChildNodes()){
		// console.log(jogo.divJogo.children)
		listaDeElmentos = Array.from(jogo.divJogo.children);
		for (let elemento of listaDeElmentos){
			if (elemento.className === "game-over"){
				elemento.style.display = "none";
				console.log("Deu certo");	
			}else{
				elemento.remove()
			}
			
		}
		// const answer = jogo.divJogo.hasChildNodes();
		// console.log(answer)
}
	buttonJogar.style.display = "none";
	const newJogo = new jogarFlappyBird();
	newJogo.start();
	
}




