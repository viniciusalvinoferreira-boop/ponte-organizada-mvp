const { telefoneValido, dataNascimentoValida, nomeValido } = require('./validacao');
const { montarGrupo } = require('./fila');

function criarSistema() {
  const alunos = [];
  const fila = [];

  function cadastrarAluno(dados) {
    const erros = [];
    if (!nomeValido(dados.nome)) erros.push('Nome completo invalido');
    if (!dataNascimentoValida(dados.nascimento)) erros.push('Data de nascimento invalida');
    if (!telefoneValido(dados.telefone)) erros.push('Telefone invalido: informe DDD e numero');
    if (erros.length) return { ok: false, erros };

    const duplicado = alunos.some(
      (a) => a.nome.toLowerCase() === dados.nome.trim().toLowerCase() && a.nascimento === dados.nascimento
    );
    if (duplicado) return { ok: false, erros: ['Este aluno ja esta cadastrado'] };

    const aluno = { id: alunos.length + 1, situacao: 'ativo', ...dados, nome: dados.nome.trim() };
    alunos.push(aluno);
    return { ok: true, aluno };
  }

  function entrarNaFila(id, projeto, entrada = new Date().toISOString()) {
    const aluno = alunos.find((a) => a.id === id);
    if (!aluno) return { ok: false, erros: ['Aluno nao encontrado'] };
    if (fila.some((f) => f.id === id && f.projeto === projeto)) {
      return { ok: false, erros: ['Aluno ja esta na fila deste projeto'] };
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

  function formarGrupo(projeto, vagas) {
    return montarGrupo(fila.filter((f) => f.projeto === projeto), vagas);
  }

  return { cadastrarAluno, entrarNaFila, definirSituacao, formarGrupo, alunos };
}

module.exports = { criarSistema };
