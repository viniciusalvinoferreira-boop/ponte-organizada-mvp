const { telefoneValido, dataNascimentoValida, nomeValido } = require('../src/validacao');

describe('telefoneValido', () => {
  test('aceita celular com DDD', () => expect(telefoneValido('(11) 98765-4321')).toBe(true));
  test('aceita fixo com DDD', () => expect(telefoneValido('1134567890')).toBe(true));
  test('rejeita numero sem DDD', () => expect(telefoneValido('9999-99')).toBe(false));
  test('rejeita celular sem o nove', () => expect(telefoneValido('11887654321')).toBe(false));
  test('rejeita DDD inexistente', () => expect(telefoneValido('0198765432')).toBe(false));
  test('rejeita vazio', () => expect(telefoneValido('')).toBe(false));
});

describe('dataNascimentoValida', () => {
  const hoje = new Date(2026, 10, 5);
  test('aceita data real', () => expect(dataNascimentoValida('10/05/2012', hoje)).toBe(true));
  test('rejeita dia inexistente', () => expect(dataNascimentoValida('31/02/2012', hoje)).toBe(false));
  test('rejeita data futura', () => expect(dataNascimentoValida('01/01/2030', hoje)).toBe(false));
  test('rejeita formato errado', () => expect(dataNascimentoValida('2012-05-10', hoje)).toBe(false));
  test('rejeita ano muito antigo', () => expect(dataNascimentoValida('01/01/1800', hoje)).toBe(false));
});

describe('nomeValido', () => {
  test('aceita nome completo', () => expect(nomeValido('Ana Souza')).toBe(true));
  test('rejeita nome sem sobrenome', () => expect(nomeValido('Ana')).toBe(false));
  test('rejeita vazio', () => expect(nomeValido('  ')).toBe(false));
});
