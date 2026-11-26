// Banco de dados local: os registros ficam disponíveis após fechar ou atualizar a página.
const CHAVE = "central-atividades-mvp-v1";
const $ = id => document.getElementById(id);
const hoje = () => new Date().toLocaleDateString("sv-SE");
const idNovo = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const texto = value => String(value ?? "");
const seguro = value => texto(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const nomes = (colecao, id) => banco[colecao].find(item => item.id === id)?.nome ?? "Não cadastrado";
function inicializar() {
    const turmas = turmasIniciais.map((nome, i) => ({id:"t"+i,nome}));
    const ipi = turmas.filter(t => /^1.*0[12] IPI$/.test(t.nome)).map(t => t.id);
    const professores = nomesIniciais.map((nome,i) => ({id:"p"+i,nome,turmas:ipi}));
    const professor = professores.find(p=>p.nome.includes("Marco Antonio"))?.id;
    const disciplinas = [{id:"d1",nome:"Introdução ao Desenvolvimento Web"},{id:"d2",nome:"IoT e Robótica Educacional"}];
    const prazo = new Date(); prazo.setDate(prazo.getDate()+7);
    const atividades = ipi.flatMap(turma => [
        {id:turma+"a1",titulo:"Crie um horário de aulas em HTML",descricao:"Monte uma tabela com três dias da semana. Use CSS para destacar os cabeçalhos.",turma,professor,disciplina:"d1",prazo:prazo.toLocaleDateString("sv-SE"),link:"",exemplo:true},
        {id:turma+"a2",titulo:"Programe a parada de um robô",descricao:"Use um simulador e programe o robô para parar ao pressionar o sensor de toque.",turma,professor,disciplina:"d2",prazo:prazo.toLocaleDateString("sv-SE"),link:"",exemplo:true}
    ]);
    return {turmas,professores,disciplinas,atividades,alunos:ipi.map((turma,i)=>({id:"al"+i,nome:"Estudante de demonstração "+(i+1),carteirinha:"DEMO-"+(i+1),turma})),conclusoes:{}};
}
let erroStorage = false;
let banco;
try { banco = JSON.parse(localStorage.getItem(CHAVE)) || inicializar(); }
catch { banco = inicializar(); erroStorage = true; }

// Cada alteração persiste o conjunto de dados. A interface avisa se o navegador bloquear o armazenamento.
function salvar() {
    try {localStorage.setItem(CHAVE,JSON.stringify(banco)); return true;}
    catch {erroStorage=true; return false;}
}
function avisar(mensagem) { $("mensagem").textContent=mensagem+(erroStorage?" | Armazenamento indisponível; alterações podem ser perdidas.":""); }
function opcoes(colecao, selecionado="") {
    return '<option value="">Selecione</option>'+banco[colecao].map(item=>'<option value="'+seguro(item.id)+'" '+(item.id===selecionado?"selected":"")+'>'+seguro(item.nome)+'</option>').join("");
}
let alunoAtual=banco.alunos[0]?.id||"";
function situacao(a) {
    if ((banco.conclusoes[alunoAtual]||[]).includes(a.id)) return "concluida";
    return a.prazo<hoje()?"atrasada":"pendente";
}
const rotulos={pendente:"Pendente",atrasada:"Atrasada",concluida:"Concluída"};
// O painel filtra as atividades da turma vinculada ao estudante e calcula os indicadores.
function renderEstudante() {
    if (!banco.alunos.some(a=>a.id===alunoAtual)) alunoAtual=banco.alunos[0]?.id||"";
    $("aluno").innerHTML=opcoes("alunos",alunoAtual);
    const aluno=banco.alunos.find(a=>a.id===alunoAtual);
    const atividades=aluno?banco.atividades.filter(a=>a.turma===aluno.turma):[];
    $("turma-atual").textContent=aluno?"Turma: "+nomes("turmas",aluno.turma):"Cadastre ou selecione um estudante.";
    const contagem=[["Total",atividades.length],...Object.entries(rotulos).map(([chave,nome])=>[nome,atividades.filter(a=>situacao(a)===chave).length])];
    $("indicadores").innerHTML=contagem.map(([nome,n])=>'<div class="indicador">'+nome+'<strong>'+n+'</strong></div>').join("");
    const busca=$("busca").value.trim().toLowerCase(), filtro=$("filtro").value;
    const lista=atividades.filter(a=>(!filtro||situacao(a)===filtro)&& (a.titulo+" "+nomes("disciplinas",a.disciplina)).toLowerCase().includes(busca));
    $("cartoes").innerHTML=lista.map(a=>{
        const status=situacao(a);
        const link=/^https?:\/\//i.test(a.link)?'<a href="'+seguro(a.link)+'" target="_blank" rel="noopener noreferrer">Abrir material</a>':"";
        return '<article class="cartao"><div class="linha"><span class="tag '+status+'">'+rotulos[status]+'</span>'+ (a.exemplo?'<span class="tag">Exemplo</span>':'')+'</div><h3>'+seguro(a.titulo)+'</h3><small>'+seguro(nomes("disciplinas",a.disciplina))+' · '+seguro(nomes("professores",a.professor))+'</small><p>'+seguro(a.descricao)+'</p><small>Entrega: '+seguro(a.prazo.split("-").reverse().join("/"))+'</small>'+link+'<button data-concluir="'+seguro(a.id)+'">'+(status==="concluida"?"Reabrir atividade":"Marcar como concluída")+'</button></article>';
    }).join("")||'<p class="vazio">Nenhuma atividade encontrada.</p>';
    $("docentes").innerHTML=(aluno?banco.professores.filter(p=>p.turmas.includes(aluno.turma)):[]).map(p=>'<li>'+seguro(p.nome)+'</li>').join("")||"<li>Sem professores cadastrados.</li>";
}
$("aluno").addEventListener("change",e=>{alunoAtual=e.target.value;renderEstudante()});
$("busca").addEventListener("input",renderEstudante);
$("filtro").addEventListener("change",renderEstudante);
$("cartoes").addEventListener("click",e=>{
    const id=e.target.dataset.concluir;if(!id||!alunoAtual)return;
    const feitos=banco.conclusoes[alunoAtual]||[];
    banco.conclusoes[alunoAtual]=feitos.includes(id)?feitos.filter(x=>x!==id):[...feitos,id];
    salvar();renderEstudante();avisar("Situação atualizada.");
});

// A gestão usa um formulário diferente para cada tipo de registro.
const entidades={atividades:"Atividade",turmas:"Turma",professores:"Professor",disciplinas:"Disciplina",alunos:"Estudante"};
let aba="atividades", editando=null;
const campo=(nome,rotulo,valor="",tipo="text",extra="")=>'<label>'+rotulo+'<input name="'+nome+'" type="'+tipo+'" value="'+seguro(valor)+'" '+extra+'></label>';
const seletor=(nome,rotulo,colecao,valor)=>'<label>'+rotulo+'<select name="'+nome+'" required>'+opcoes(colecao,valor)+'</select></label>';
function renderGestao(){
    const item=banco[aba].find(x=>x.id===editando)||{};
    $("form-titulo").textContent=(editando?"Editar ":"Cadastrar ")+entidades[aba].toLowerCase();
    $("lista-titulo").textContent="Registros cadastrados ("+banco[aba].length+")";
    $("cancelar").hidden=!editando;
    let campos="";
    if(aba==="atividades"){
        campos=campo("titulo","Título",item.titulo,"text","required")+seletor("turma","Turma","turmas",item.turma)+seletor("professor","Professor","professores",item.professor)+seletor("disciplina","Disciplina","disciplinas",item.disciplina)+campo("prazo","Prazo de entrega",item.prazo||hoje(),"date","required")+campo("link","Link do material (opcional)",item.link,"url", 'placeholder="https://..."')+'<label class="largo">Descrição<textarea name="descricao" required>'+seguro(item.descricao)+'</textarea></label>';
    }else{
        campos=campo("nome","Nome",item.nome,"text","required");
        if(aba==="alunos")campos+=campo("carteirinha","ID da carteirinha",item.carteirinha,"text","required")+seletor("turma","Turma","turmas",item.turma);
        if(aba==="professores")campos+='<label>Turmas (selecione uma ou mais)<select multiple size="5" name="turmas">'+banco.turmas.map(t=>'<option value="'+seguro(t.id)+'" '+(item.turmas?.includes(t.id)?"selected":"")+'>'+seguro(t.nome)+'</option>').join("")+'</select></label>';
    }
    $("campos").innerHTML=campos;
    $("registros").innerHTML=banco[aba].map(x=>{
        const sub=aba==="atividades"?nomes("turmas",x.turma)+" · "+nomes("disciplinas",x.disciplina):aba==="alunos"?x.carteirinha+" · "+nomes("turmas",x.turma):aba==="professores"?x.turmas.map(t=>nomes("turmas",t)).join(", "):"";
        return '<div class="registro"><div><strong>'+seguro(x.titulo||x.nome)+'</strong><p>'+seguro(sub)+'</p></div><div class="linha"><button data-editar="'+seguro(x.id)+'">Editar</button><button class="perigo" data-excluir="'+seguro(x.id)+'">Excluir</button></div></div>';
    }).join("")||'<p class="vazio">Nenhum registro cadastrado.</p>';
}
// Os cadastros usam identificadores estáveis para preservar os vínculos após uma edição.
$("cadastro").addEventListener("submit",e=>{
    e.preventDefault();const form=new FormData(e.target);
    const item=Object.fromEntries([...form].map(([k,v])=>[k,v.trim()]));
    if(aba==="professores")item.turmas=form.getAll("turmas");
    if((aba==="atividades"&&(!item.titulo||!item.descricao))||(aba!=="atividades"&&!item.nome))return avisar("Preencha os campos obrigatórios.");
    if(aba==="alunos"&&(!item.carteirinha||banco.alunos.some(a=>a.id!==editando&&a.carteirinha.toLowerCase()===item.carteirinha.toLowerCase())))return avisar("Informe uma carteirinha única.");
    if(aba==="atividades"){
        if(item.link&&!/^https?:\/\//i.test(item.link))return avisar("Use um link HTTP ou HTTPS.");
        if(!banco.professores.find(p=>p.id===item.professor)?.turmas.includes(item.turma))return avisar("Vincule o professor à turma antes de cadastrar a atividade.");
        item.exemplo=false;
    }
    if(aba==="professores"&&banco.atividades.some(a=>a.professor===editando&&!item.turmas.includes(a.turma)))return avisar("Existem atividades vinculadas a uma turma que foi removida.");
    if(editando){item.id=editando; banco[aba]=banco[aba].map(x=>x.id===editando?item:x);}
    else{item.id=idNovo();banco[aba].push(item);}
    salvar();editando=null;renderGestao();renderEstudante();avisar("Registro salvo.");
});
$("cancelar").onclick=()=>{editando=null;renderGestao();};
// Impede a exclusão de registros que ainda são utilizados por outros cadastros.
$("registros").addEventListener("click",e=>{
    const editar=e.target.dataset.editar, excluir=e.target.dataset.excluir;
    if(editar){editando=editar;renderGestao();$("cadastro").scrollIntoView({block:"nearest"});return;}
    if(!excluir)return;
    const vinculado=aba==="turmas"&&(banco.alunos.some(a=>a.turma===excluir)||banco.professores.some(p=>p.turmas.includes(excluir))||banco.atividades.some(a=>a.turma===excluir))||aba==="professores"&&banco.atividades.some(a=>a.professor===excluir)||aba==="disciplinas"&&banco.atividades.some(a=>a.disciplina===excluir);
    if(vinculado)return avisar("Remova ou altere os vínculos existentes antes de excluir.");
    if(!confirm("Excluir este registro?"))return;
    banco[aba]=banco[aba].filter(x=>x.id!==excluir);
    if(aba==="alunos")delete banco.conclusoes[excluir];
    if(aba==="atividades")for(const id of Object.keys(banco.conclusoes))banco.conclusoes[id]=banco.conclusoes[id].filter(x=>x!==excluir);
    editando=null;salvar();renderGestao();renderEstudante();avisar("Registro excluído.");
});
document.querySelector("nav").addEventListener("click",e=>{
    const view=e.target.dataset.view;if(!view)return;
    for(const b of document.querySelectorAll("[data-view]"))b.classList.toggle("ativo",b.dataset.view===view);
    $("estudante").hidden=view!=="estudante";$("gestao").hidden=view!=="gestao";
    avisar("");if(view==="gestao")renderGestao();else renderEstudante();
});
$("abas").addEventListener("click",e=>{
    if(!e.target.dataset.tab)return;aba=e.target.dataset.tab;editando=null;
    for(const b of document.querySelectorAll("[data-tab]"))b.classList.toggle("ativo",b.dataset.tab===aba);
    renderGestao();avisar("");
});
salvar();renderEstudante();renderGestao();if(erroStorage)avisar("");

