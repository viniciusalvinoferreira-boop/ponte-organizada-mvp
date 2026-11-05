const { criarSistema } = require('../src/cadastro');

const aluno = (nome, extra = {}) => ({
  nome,
  nascimento: '10/05/2012',
  telefone: '(11) 98765-4321',
  ...extra,
});

describe('fluxo cadastro, fila e grupo', () => {
  test('cadastra, enfileira e monta grupo na ordem de entrada', () => {
    const s = criarSistema();
    const ana = s.cadastrarAluno(aluno('Ana Souza')).aluno;
    const bruno = s.cadastrarAluno(aluno('Bruno Lima')).aluno;
    const carla = s.cadastrarAluno(aluno('Carla Dias')).aluno;
    s.entrarNaFila(bruno.id, 'Futsal', '2026-10-20T09:40:00');
    s.entrarNaFila(ana.id, 'Futsal', '2026-10-20T08:12:00');
    s.entrarNaFila(carla.id, 'Futsal', '2026-10-21T14:05:00');
    expect(s.formarGrupo('Futsal', 2).map((a) => a.nome)).toEqual(['Ana Souza', 'Bruno Lima']);
  });

  test('aluno que vira pendente deixa de ser elegivel', () => {
    const s = criarSistema();
    const ana = s.cadastrarAluno(aluno('Ana Souza')).aluno;
    const bruno = s.cadastrarAluno(aluno('Bruno Lima')).aluno;
    s.entrarNaFila(ana.id, 'Futsal', '2026-10-20T08:12:00');
    s.entrarNaFila(bruno.id, 'Futsal', '2026-10-20T09:40:00');
    s.definirSituacao(ana.id, 'pendente');
    expect(s.formarGrupo('Futsal', 2).map((a) => a.nome)).toEqual(['Bruno Lima']);
  });

  test('bloqueia cadastro duplicado', () => {
    const s = criarSistema();
    s.cadastrarAluno(aluno('Ana Souza'));
    const r = s.cadastrarAluno(aluno('ana souza'));
    expect(r.ok).toBe(false);
    expect(r.erros).toContain('Este aluno ja esta cadastrado');
  });

  test('retorna todos os erros de validacao', () => {
    const r = criarSistema().cadastrarAluno({
      nome: 'Ana',
      nascimento: '31/02/2012',
      telefone: '9999-99',
    });
    expect(r.ok).toBe(false);
    expect(r.erros).toHaveLength(3);
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
