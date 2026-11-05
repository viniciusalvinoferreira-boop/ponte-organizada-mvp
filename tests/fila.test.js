const { ordenarFila, montarGrupo } = require('../src/fila');

const fila = [
  { nome: 'Carla', entrada: '2026-10-21T14:05:00', situacao: 'ativo' },
  { nome: 'Ana', entrada: '2026-10-20T08:12:00', situacao: 'ativo' },
  { nome: 'Diego', entrada: '2026-10-20T09:00:00', situacao: 'pendente' },
  { nome: 'Bruno', entrada: '2026-10-20T09:40:00', situacao: 'ativo' },
];

describe('ordenarFila', () => {
  test('ordena por data de entrada', () => {
    expect(ordenarFila(fila).map((a) => a.nome)).toEqual(['Ana', 'Diego', 'Bruno', 'Carla']);
  });
  test('nao altera a lista original', () => {
    const copia = JSON.stringify(fila);
    ordenarFila(fila);
    expect(JSON.stringify(fila)).toBe(copia);
  });
});

describe('montarGrupo', () => {
  test('respeita o numero de vagas', () => {
    expect(montarGrupo(fila, 2).map((a) => a.nome)).toEqual(['Ana', 'Bruno']);
  });
  test('pula aluno com situacao pendente', () => {
    expect(montarGrupo(fila, 5).map((a) => a.nome)).not.toContain('Diego');
  });
  test('rejeita numero de vagas invalido', () => {
    expect(() => montarGrupo(fila, 0)).toThrow('Numero de vagas invalido');
  });
});
