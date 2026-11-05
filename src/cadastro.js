/* istanbul ignore next */
const dep = typeof require === 'function'
  ? { ...require('./validacao'), ...require('./fila') }
  : { ...window.Validacao, ...window.Fila };

function criarSistema(inicial = {}) {
  const alunos = (inicial.alunos || []).map((a) => ({ ...a }));
  const fila = (inicial.fila || []).map((f) => ({ ...f }));
  const grupos = (inicial.grupos || []).map((g) => ({ ...g }));

  const proximoId = () => alunos.reduce((m, a) => Math.max(m, a.id), 0) + 1;

  function cadastrarAluno(dados) {
    const erros = {};
    if (!dep.nomeValido(dados.nome)) erros.nome = 'Informe o nome completo';
    if (!dep.dataNascimentoValida(dados.nascimento)) erros.nascimento = 'Data invalida: use dd/mm/aaaa';
    if (!dep.telefoneValido(dados.telefone)) erros.telefone = 'Telefone invalido: informe DDD e numero';
    if (Object.keys(erros).length) return { ok: false, erros };

    const nome = dados.nome.trim();
    const duplicado = alunos.some(
      (a) => a.nome.toLowerCase() === nome.toLowerCase() && a.nascimento === dados.nascimento
    );
    if (duplicado) return { ok: false, erros: { geral: 'Este aluno ja esta cadastrado' } };

    const aluno = { situacao: 'ativo', vinculo: 'Aluno', ...dados, nome, id: proximoId() };
    alunos.push(aluno);
    return { ok: true, aluno };
  }

  function entrarNaFila(id, projeto, entrada = new Date().toISOString()) {
    const aluno = alunos.find((a) => a.id === id);
    if (!aluno) return { ok: false, erros: { geral: 'Aluno nao encontrado' } };
    if (fila.some((f) => f.id === id && f.projeto === projeto)) {
      return { ok: false, erros: { geral: 'Aluno ja esta na fila deste projeto' } };
    }
    fila.push({ id, nome: aluno.nome, projeto, entrada, situacao: aluno.situacao });
    return { ok: true };
  }

  function definirSituacao(id, situacao) {
    const aluno = alunos.find((a) => a.id === id);
    if (!aluno) return false;
    aluno.situacao = situacao;
    fila.filter((f) => f.id === id).forEach((f) => { f.situacao = situacao; });
    return true;
  }

  function listarFila(projeto) {
    return dep.ordenarFila(fila.filter((f) => f.projeto === projeto));
  }

  function formarGrupo(projeto, vagas) {
    return dep.montarGrupo(fila.filter((f) => f.projeto === projeto), vagas);
  }

  function salvarGrupo(projeto, nomeGrupo, ids, vagas) {
    const nome = String(nomeGrupo || '').trim();
    if (nome.length < 2) return { ok: false, erro: 'Informe o nome do grupo' };
    if (!Number.isInteger(vagas) || vagas < 1) return { ok: false, erro: 'Numero de vagas invalido' };
    if (!ids.length) return { ok: false, erro: 'Selecione ao menos um aluno' };
    if (ids.length > vagas) {
      return { ok: false, erro: `Voce selecionou ${ids.length} alunos para ${vagas} vagas` };
    }
    const escolhidos = dep.ordenarFila(
      fila.filter((f) => f.projeto === projeto && ids.includes(f.id))
    );
    if (escolhidos.length !== ids.length) {
      return { ok: false, erro: 'Aluno fora da fila deste projeto' };
    }
    if (escolhidos.some((f) => f.situacao !== 'ativo')) {
      return { ok: false, erro: 'Aluno com situacao pendente nao pode entrar no grupo' };
    }
    const grupo = {
      id: grupos.reduce((m, g) => Math.max(m, g.id), 0) + 1,
      nome,
      projeto,
      alunos: escolhidos.map((f) => ({ id: f.id, nome: f.nome })),
    };
    grupos.push(grupo);
    for (let i = fila.length - 1; i >= 0; i -= 1) {
      if (fila[i].projeto === projeto && ids.includes(fila[i].id)) fila.splice(i, 1);
    }
    return { ok: true, grupo };
  }

  function exportar() {
    return JSON.parse(JSON.stringify({ alunos, fila, grupos }));
  }

  return {
    cadastrarAluno, entrarNaFila, definirSituacao, listarFila,
    formarGrupo, salvarGrupo, exportar, alunos, grupos,
  };
}

const exportsCadastro = { criarSistema };

/* istanbul ignore else */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = exportsCadastro;
} else {
  window.Cadastro = exportsCadastro;
}
