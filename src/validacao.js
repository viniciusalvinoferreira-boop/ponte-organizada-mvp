function telefoneValido(texto) {
  const digitos = String(texto || '').replace(/\D/g, '');
  if (digitos.length !== 10 && digitos.length !== 11) return false;
  const ddd = Number(digitos.slice(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  if (digitos.length === 11 && digitos[2] !== '9') return false;
  return true;
}

function dataNascimentoValida(texto, hoje = new Date()) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(texto || ''));
  if (!m) return false;
  const [, d, mes, a] = m.map(Number);
  const data = new Date(a, mes - 1, d);
  const existe = data.getFullYear() === a && data.getMonth() === mes - 1 && data.getDate() === d;
  return existe && data <= hoje && a >= 1900;
}

function nomeValido(texto) {
  const nome = String(texto || '').trim();
  return nome.length >= 3 && /\s/.test(nome);
}

module.exports = { telefoneValido, dataNascimentoValida, nomeValido };
