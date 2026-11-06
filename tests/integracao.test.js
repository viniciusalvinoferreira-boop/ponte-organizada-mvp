const { criarSistema } = require('../src/cadastro');

const aluno = (nome, extra = {}) => ({
  nome,
  nascimento: '10/05/2012',
  telefone: '(11) 98765-4321',
  ...extra,
});

function sistemaComFila() {
  const s = criarSistema();
  const ana = s.cadastrarAluno(aluno('Ana Souza')).aluno;
  const bruno = s.cadastrarAluno(aluno('Bruno Lima')).aluno;
  const carla = s.cadastrarAluno(aluno('Carla Dias')).aluno;
  s.entrarNaFila(bruno.id, 'Futsal', '2026-10-20T09:40:00');
  s.entrarNaFila(ana.id, 'Futsal', '2026-10-20T08:12:00');
  s.entrarNaFila(carla.id, 'Futsal', '2026-10-21T14:05:00');
  return { s, ana, bruno, carla };
}

describe('fluxo cadastro, fila e grupo', () => {
  test('cadastra, enfileira e monta grupo na ordem de entrada', () => {
    const { s } = sistemaComFila();
    expect(s.formarGrupo('Futsal', 2).map((a) => a.nome)).toEqual(['Ana Souza', 'Bruno Lima']);
  });

  test('aluno que vira pendente deixa de ser elegivel', () => {
    const { s, ana } = sistemaComFila();
    s.definirSituacao(ana.id, 'pendente');
    expect(s.formarGrupo('Futsal', 2).map((a) => a.nome)).toEqual(['Bruno Lima', 'Carla Dias']);
  });

  test('bloqueia cadastro duplicado', () => {
    const s = criarSistema();
    s.cadastrarAluno(aluno('Ana Souza'));
    const r = s.cadastrarAluno(aluno('ana souza'));
    expect(r.ok).toBe(false);
    expect(r.erros.geral).toBe('Este aluno ja esta cadastrado');
  });

  test('retorna erro por campo na validacao', () => {
    const r = criarSistema().cadastrarAluno({
      nome: 'Ana',
      nascimento: '31/02/2012',
      telefone: '9999-99',
    });
    expect(r.ok).toBe(false);
    expect(Object.keys(r.erros).sort()).toEqual(['nascimento', 'nome', 'telefone']);
  });

  test('nao enfileira o mesmo aluno duas vezes no projeto', () => {
    const s = criarSistema();
    const ana = s.cadastrarAluno(aluno('Ana Souza')).aluno;
    expect(s.entrarNaFila(ana.id, 'Futsal').ok).toBe(true);
    expect(s.entrarNaFila(ana.id, 'Futsal').ok).toBe(false);
  });

  test('rejeita aluno inexistente na fila e na situacao', () => {
    const s = criarSistema();
    expect(s.entrarNaFila(99, 'Futsal').ok).toBe(false);
    expect(s.definirSituacao(99, 'pendente')).toBe(false);
  });
});

describe('salvarGrupo', () => {
  test('cria o grupo e retira os alunos da fila', () => {
    const { s, ana, bruno } = sistemaComFila();
    const r = s.salvarGrupo('Futsal', 'Futsal A', [ana.id, bruno.id], 2);
    expect(r.ok).toBe(true);
    expect(r.grupo.alunos.map((a) => a.nome)).toEqual(['Ana Souza', 'Bruno Lima']);
    expect(s.listarFila('Futsal').map((f) => f.nome)).toEqual(['Carla Dias']);
    expect(s.grupos).toHaveLength(1);
  });

  test('numera os grupos em sequencia', () => {
    const { s, ana, bruno } = sistemaComFila();
    expect(s.salvarGrupo('Futsal', 'Grupo 1', [ana.id], 2).grupo.id).toBe(1);
    expect(s.salvarGrupo('Futsal', 'Grupo 2', [bruno.id], 2).grupo.id).toBe(2);
  });

  test('rejeita mais alunos do que vagas', () => {
    const { s, ana, bruno, carla } = sistemaComFila();
    const r = s.salvarGrupo('Futsal', 'Futsal A', [ana.id, bruno.id, carla.id], 2);
    expect(r.ok).toBe(false);
    expect(r.erro).toBe('Voce selecionou 3 alunos para 2 vagas');
  });

  test('rejeita aluno pendente', () => {
    const { s, ana } = sistemaComFila();
    s.definirSituacao(ana.id, 'pendente');
    const r = s.salvarGrupo('Futsal', 'Futsal A', [ana.id], 2);
    expect(r.ok).toBe(false);
    expect(r.erro).toMatch(/pendente/);
  });

  test('rejeita nome vazio, sem selecao, vagas invalidas e aluno fora da fila', () => {
    const { s, ana } = sistemaComFila();
    expect(s.salvarGrupo('Futsal', ' ', [ana.id], 2).ok).toBe(false);
    expect(s.salvarGrupo('Futsal', 'Futsal A', [], 2).ok).toBe(false);
    expect(s.salvarGrupo('Futsal', 'Futsal A', [ana.id], 0).ok).toBe(false);
    expect(s.salvarGrupo('Outro', 'Grupo X', [ana.id], 2).erro).toBe('Aluno fora da fila deste projeto');
  });
});

describe('persistencia do estado', () => {
  test('exportar e recriar preserva alunos, fila e grupos', () => {
    const { s, ana } = sistemaComFila();
    s.salvarGrupo('Futsal', 'Futsal A', [ana.id], 2);
    const novo = criarSistema(s.exportar());
    expect(novo.alunos).toHaveLength(3);
    expect(novo.grupos).toHaveLength(1);
    expect(novo.listarFila('Futsal')).toHaveLength(2);
  });

  test('ids continuam em sequencia depois de recarregar', () => {
    const { s } = sistemaComFila();
    const novo = criarSistema(s.exportar());
    expect(novo.cadastrarAluno(aluno('Diego Rocha')).aluno.id).toBe(4);
  });
});
