function ordenarFila(entradas) {
  return [...entradas].sort((a, b) => new Date(a.entrada) - new Date(b.entrada));
}

function montarGrupo(fila, vagas) {
  if (!Number.isInteger(vagas) || vagas < 1) {
    throw new Error('Numero de vagas invalido');
  }
  const elegiveis = ordenarFila(fila).filter((a) => a.situacao === 'ativo');
  return elegiveis.slice(0, vagas);
}

module.exports = { ordenarFila, montarGrupo };
