var fundos =[], ranking = {}, pesos = {PVP:25,DYM:50,CCT:15,VOL:10};

function calcVolatilidade(arr) {
	const prices = arr.length > 1 ? arr.slice(1).map((n, i) => n/arr[i]-1) : [0,0];
	const mean = prices.reduce((a,b) => a+b,0)/prices.length;
	const deviationS = prices.map(v => (v-mean)*(v-mean));
	const volatilidade = Math.sqrt(deviationS.reduce((a,b) => a+b,0)/deviationS.length);
	const volatilidadeAnual = Math.sqrt(252)*volatilidade;
	return volatilidadeAnual;
}

const scrapeAll = (...links) => fetch(...links).then(resposta => resposta.text()).then(async fii => {
	const HTML_FII = new DOMParser().parseFromString(fii, "text/html");
	if(HTML_FII.querySelector("#finished-fund") == null) {
		const ticker = HTML_FII.querySelector("#fund-ticker").innerText;
		const linksCot = links.slice().map(link => "https://fiis.com.br/"+ticker.replace(/[0-9]+\w*/, '').replace(/\s/g,'').toLowerCase()+"/cotacoes/?periodo=12+months");
		const VPC = parseFloat(HTML_FII.querySelectorAll("#informations--indexes > div > .value")[3].innerText.split("$")[1].replace(/\./g,"").replace(",","."));
		const PC = parseFloat(HTML_FII.querySelector(".quotation >.value").innerText.replace(/\./g,"").replace(",","."));
		const NC = parseInt(HTML_FII.querySelectorAll("#informations--basic > div > div > .value")[4].innerText.replace(/\./g,""));
		const NCT = parseInt(HTML_FII.querySelectorAll("#informations--basic > div > div > .value")[5].innerText.replace(/\./g,""));
		const UPG = [...HTML_FII.querySelectorAll("#last-revenues--table > tbody > tr > td")].map((t,i) => {if(i%5==1) return parseInt(t.innerText.match(/(?=\/)?\d+$/).toString())}).filter(v => v != undefined);
		if (UPG.length) {
			if(UPG.reduce((a,b) => a+b,0)/UPG.length >= (new Date().getUTCFullYear()-2001)) {
		        const DYArr = [...HTML_FII.querySelectorAll("#last-revenues--table > tbody > tr > td")].map((t,i) => {if(i%5==3) return parseFloat(t.innerText.replace("%","").replace(",","."));}).filter(v => v != undefined);
		        const DYM = DYArr.length ? DYArr.reduce((a,b) => a+b,0)/DYArr.length : 0;
		        if(Math.min(VPC,PC,NC,NCT) != 0) {
			        fundos.push({
                        ticker: ticker,
                        DYM: DYM,
                        VPC: VPC,
                        PC: PC,
                        PVP: VPC!=0?PC/VPC:0,
                        NC: NC,
                        NCT: NCT,
                        CCT: NCT!=0?NC*VPC/NCT:0,
                        href: links.toString()
                    });
		            const respostaP = await fetch(...linksCot);
                    const data = await respostaP.json();
                    const p = ({fundt: respostaP.url.match(/\w+(?=\/cotacoes)/g).toString().toUpperCase(), data: data});
                    const volat = calcVolatilidade(p.data.stockReports.map(v_2 => parseFloat(v_2.fec)));
                    const INDFundo = fundos.slice().map(t_2 => t_2.ticker).findIndex(v_3 => v_3.includes(p.fundt));
                    if (volat > 0) fundos[INDFundo].VOL = volat;
                    else fundos.splice(INDFundo, 1);
                }
            }
         }
    }
    document.getElementById("loadmsg").innerHTML = "Analisando "+fundos.length+" fundos";
});

function atualizarTabela() {
	let trs = '';
	fundos.forEach((fundo) => {
		const MediaPond = {
            PVP:(1-ranking.PVP.indexOf(fundo)/fundos.length)*pesos.PVP,
            DYM:(1-ranking.DYM.indexOf(fundo)/fundos.length)*pesos.DYM,
            CCT:(1-ranking.CCT.indexOf(fundo)/fundos.length)*pesos.CCT,
            VOL:(1-ranking.VOL.indexOf(fundo)/fundos.length)*pesos.VOL
        };
		fundo.rank = MediaPond.PVP+MediaPond.CCT+MediaPond.VOL+MediaPond.DYM;
	});
	ranking.TOTAL = fundos.slice().sort((a,b) => b.rank-a.rank);
	ranking.TOTAL.forEach((fundo,nrank) => {
		trs += `
		<tr>
			<td>#${nrank+1}</td>
			<td>${fundo.ticker}
            <a href="${fundo.href}" target="_blank">[1]</a>
            <a href="https://www.fundsexplorer.com.br/funds/${fundo.ticker}/" target="_blank">[2]</a>
            <a href="https://www.fundamentus.com.br/detalhes.php?papel=${fundo.ticker}" target="_blank">[3]</a></td>
			<td>${Math.round((1-ranking.PVP.indexOf(fundo)/fundos.length)*100)}</td>
			<td>${Math.round((1-ranking.DYM.indexOf(fundo)/fundos.length)*100)}</td>
			<td>${Math.round((1-ranking.CCT.indexOf(fundo)/fundos.length)*100)}</td>
			<td>${Math.round((1-ranking.VOL.indexOf(fundo)/fundos.length)*100)}</td>
			<td class="nota">${Math.round(fundo.rank)}</td>
		</tr>
		`;
	});
	document.getElementById("ranking").innerHTML = trs;
}

function atualizarRange(...elementos) {
	elementos.forEach(elemento => {
	    const elementoR = document.getElementById(elemento+"Range"), elementoV = document.getElementById(elemento+"Value");
	    elementoR.oninput = function() {
		    document.querySelectorAll(".porcentagem").forEach(node => {
			    pesos[node.id.replace("Value","")] = parseInt(document.getElementById(node.id.replace("Value","Range")).value)/[...document.querySelectorAll('input[type="range"]')].map(n => parseInt(n.value)).reduce((a,b) => a+b)*100;
			    document.getElementById(node.id).innerHTML = Math.round(pesos[node.id.replace("Value","")]);
		    });
		    this.style.background = "hsl("+(1.20*this.value).toString(10)+",100%,50%)";
		    atualizarTabela();
	    }
        elementoR.oninput();
    });
}

fetch("https://fiis.com.br/lista-de-fundos-imobiliarios/").then(resposta => resposta.text()).then(fiis => {
	const HTML_FIIS = new DOMParser().parseFromString(fiis, "text/html");
	let links = [...HTML_FIIS.querySelectorAll("div > .item > a")].map(a => a.href);
	Promise.allSettled(links.map(link => scrapeAll(link))).then(() => {
		ranking.PVP = fundos.slice().sort((a,b) => a.PVP-b.PVP);
		ranking.DYM = fundos.slice().sort((a,b) => b.DYM-a.DYM);
		ranking.CCT = fundos.slice().sort((a,b) => a.CCT-b.CCT);
		ranking.VOL = fundos.slice().sort((a,b) => a.VOL-b.VOL);
		atualizarRange("PVP", "CCT", "VOL", "DYM");
		document.getElementById("carregando").style.display = "none";
	});
});