function consultarProfessores() {

    var turma = document.getElementById("turma").value;

    if (turma == "1º 02 IPI") {

        document.getElementById("resultado").innerHTML =
        "Abraao Moises Matos Gama<br>" +
        "Adriana Quemelli Magioni Eller<br>" +
        "Brunelly Pereira Wagner<br>" +
        "Guilherme Moraes Pesente<br>" +
        "Jeferson Rodrigues dos Santos<br>" +
        "Jorge Ayres de Almeida Filho<br>" +
        "Kenia Aparecida dos Santos Mateus<br>" +
        "Lucas Kister<br>" +
        "Marcelo Ferreira Vaz<br>" +
        "Marco Antonio de Paula Dornel<br>" +
        "Mauricio Lago Barros<br>" +
        "Mirian Regina de Olivera Kleaim<br>" +
        "Nicoly Simoes Rangel<br>" +
        "Quezia Bussolar da Silva<br>" +
        "Rafael Cardoso Frohelich<br>" +
        "Simone Carvalho Monteiro Gomes";

    } else {
        document.getElementById("resultado").innerHTML = "";
    }   if (turma == "1º 01 IPI"){
            
        document.getElementById("resultado").innerHTML =
        "Abraao Moises Matos Gama<br>" +
        "Adriana Quemelli Magioni Eller<br>" +
        "Brunelly Pereira Wagner<br>" +
        "Guilherme Moraes Pesente<br>" +
        "Jeferson Rodrigues dos Santos<br>" +
        "Jorge Ayres de Almeida Filho<br>" +
        "Kenia Aparecida dos Santos Mateus<br>" +
        "Lucas Kister<br>" +
        "Marcelo Ferreira Vaz<br>" +
        "Marco Antonio de Paula Dornel<br>" +
        "Mauricio Lago Barros<br>" +
        "Mirian Regina de Olivera Kleaim<br>" +
        "Nicoly Simoes Rangel<br>" +
        "Quezia Bussolar da Silva<br>" +
        "Rafael Cardoso Frohelich<br>" +
        "Simone Carvalho Monteiro Gomes";
        } else {
            document.getElementById("resultado").innerHTML = "";  
    }
    
    
}

 //NOVO CÓDIGO: transforma os nomes em links// 
 
        const resultado = document.getElementById("resultado");

        const observador = new MutationObserver(() => {

            Array.from(resultado.childNodes).forEach(elemento => {

                if (elemento.nodeType === Node.TEXT_NODE) {

                    const nome = elemento.textContent.trim();

                    if (nome !== "") {

                        const link = document.createElement("a");

                        link.textContent = nome;
                        link.href = "link." + nome;
                        link.target = "_blank";
                        link.rel = "noopener noreferrer";

                        resultado.replaceChild(link, elemento);
                    }
                }

            });

        });

        observador.observe(resultado, {
            childList: true,
            subtree: true
        });