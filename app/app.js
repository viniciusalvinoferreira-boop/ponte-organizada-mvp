(function () {
  var CHAVE = 'ponte-organizada';
  var PROJETOS = ['Futsal Sub-15', 'Informática Básica', 'Reforço Escolar'];

  function carregar() {
    try {
      return window.Cadastro.criarSistema(JSON.parse(localStorage.getItem(CHAVE)) || {});
    } catch (e) {
      return window.Cadastro.criarSistema({});
    }
  }

  var sistema = carregar();

  function salvar() {
    localStorage.setItem(CHAVE, JSON.stringify(sistema.exportar()));
  }

  function el(tag, props, filhos) {
    var n = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      if (k === 'texto') n.textContent = props[k];
      else n.setAttribute(k, props[k]);
    });
    (filhos || []).forEach(function (f) { n.appendChild(f); });
    return n;
  }

  function alerta(tipo, texto, papel) {
    var icone = { ok: '✔', er: '✖', av: '⚠' }[tipo];
    return el('div', { class: 'alerta ' + tipo, role: papel || 'status' }, [
      el('span', { 'aria-hidden': 'true', texto: icone }),
      el('span', { texto: texto })
    ]);
  }

  function mostrarAviso(tipo, texto) {
    var area = document.getElementById('avisos');
    area.innerHTML = '';
    area.appendChild(alerta(tipo, texto, tipo === 'er' ? 'alert' : 'status'));
  }

  function preencherProjetos(select) {
    PROJETOS.forEach(function (p) { select.appendChild(el('option', { value: p, texto: p })); });
  }

  function formatarData(iso) {
    var d = new Date(iso);
    var p = function (n) { return String(n).padStart(2, '0'); };
    return p(d.getDate()) + '/' + p(d.getMonth() + 1) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function exigirAcesso() {
    if (!sessionStorage.getItem('perfil')) { window.location.href = 'index.html'; return false; }
    var saudacao = document.getElementById('perfil');
    if (saudacao) saudacao.textContent = 'Olá, ' + sessionStorage.getItem('perfil') + ' (Equipe)';
    var sair = document.getElementById('sair');
    if (sair) sair.addEventListener('click', function () {
      sessionStorage.removeItem('perfil');
      window.location.href = 'index.html';
    });
    return true;
  }

  /* ---------- Login (demonstração, sem autenticação real) ---------- */
  function paginaLogin() {
    var form = document.getElementById('form-login');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var email = document.getElementById('e').value.trim();
      var senha = document.getElementById('s').value;
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || senha.length < 4) {
        mostrarAviso('er', 'Email ou senha incorretos');
        document.getElementById('e').setAttribute('aria-invalid', 'true');
        return;
      }
      var nome = email.split('@')[0];
      sessionStorage.setItem('perfil', nome.charAt(0).toUpperCase() + nome.slice(1));
      window.location.href = 'menu.html';
    });
  }

  /* ---------- Menu ---------- */
  function paginaMenu() {
    if (!exigirAcesso()) return;
    document.getElementById('exemplo').addEventListener('click', function () {
      var dados = [
        ['Ana Souza', '10/05/2012', '(11) 98765-4321', 'ativo', '2026-10-20T08:12:00'],
        ['Bruno Lima', '03/09/2011', '(11) 97654-3210', 'ativo', '2026-10-20T09:40:00'],
        ['Carla Dias', '21/01/2012', '(11) 96543-2109', 'ativo', '2026-10-21T14:05:00'],
        ['Diego Rocha', '15/07/2010', '(11) 95432-1098', 'pendente', '2026-10-22T10:30:00'],
        ['Elisa Prado', '08/12/2011', '(11) 94321-0987', 'ativo', '2026-10-23T16:20:00']
      ];
      var novos = 0;
      dados.forEach(function (d) {
        var r = sistema.cadastrarAluno({ nome: d[0], nascimento: d[1], telefone: d[2], vinculo: 'Aluno' });
        if (r.ok) {
          sistema.definirSituacao(r.aluno.id, d[3]);
          sistema.entrarNaFila(r.aluno.id, PROJETOS[0], d[4]);
          novos += 1;
        }
      });
      salvar();
      mostrarAviso(novos ? 'ok' : 'av',
        novos ? novos + ' alunos de exemplo carregados na fila de ' + PROJETOS[0]
              : 'Os dados de exemplo já estavam carregados');
    });
    document.getElementById('limpar').addEventListener('click', function () {
      if (window.confirm('Apagar todos os alunos, filas e grupos deste navegador?')) {
        localStorage.removeItem(CHAVE);
        sistema = window.Cadastro.criarSistema({});
        mostrarAviso('ok', 'Dados apagados');
      }
    });
  }

  /* ---------- Cadastro ---------- */
  function paginaCadastro() {
    if (!exigirAcesso()) return;
    preencherProjetos(document.getElementById('p'));
    var campos = ['nome', 'nascimento', 'telefone'];
    var ids = { nome: 'n', nascimento: 'd', telefone: 't' };

    function limparErros() {
      campos.forEach(function (c) {
        var input = document.getElementById(ids[c]);
        input.removeAttribute('aria-invalid');
        input.removeAttribute('aria-describedby');
        input.parentNode.classList.remove('campo-erro');
        var msg = document.getElementById('erro-' + c);
        if (msg) msg.parentNode.removeChild(msg);
      });
      document.getElementById('avisos').innerHTML = '';
    }

    document.getElementById('form-cadastro').addEventListener('submit', function (ev) {
      ev.preventDefault();
      limparErros();
      var r = sistema.cadastrarAluno({
        nome: document.getElementById('n').value,
        nascimento: document.getElementById('d').value.trim(),
        telefone: document.getElementById('t').value.trim(),
        vinculo: document.getElementById('v').value
      });
      if (!r.ok) {
        var primeiro = null;
        campos.forEach(function (c) {
          if (!r.erros[c]) return;
          var input = document.getElementById(ids[c]);
          input.setAttribute('aria-invalid', 'true');
          input.setAttribute('aria-describedby', 'erro-' + c);
          input.parentNode.classList.add('campo-erro');
          input.parentNode.appendChild(el('div', { id: 'erro-' + c, class: 'msg-er', texto: '✖ ' + r.erros[c] }));
          if (!primeiro) primeiro = input;
        });
        if (r.erros.geral) mostrarAviso('av', r.erros.geral);
        if (primeiro) primeiro.focus();
        return;
      }
      var fila = sistema.entrarNaFila(r.aluno.id, document.getElementById('p').value);
      salvar();
      mostrarAviso('ok', r.aluno.nome + ' cadastrado' + (fila.ok ? ' e incluído na fila de ' + document.getElementById('p').value : ''));
      document.getElementById('form-cadastro').reset();
      document.getElementById('n').focus();
    });
  }

  /* ---------- Fila ---------- */
  function paginaFila() {
    if (!exigirAcesso()) return;
    var select = document.getElementById('p');
    preencherProjetos(select);
    var lista = document.getElementById('lista');
    var contador = document.getElementById('contador');
    var vagasInput = document.getElementById('vagas');

    function vagas() { return parseInt(vagasInput.value, 10); }
    function marcados() {
      return Array.prototype.slice.call(lista.querySelectorAll('input[type=checkbox]:checked'))
        .map(function (c) { return parseInt(c.value, 10); });
    }
    function atualizarContador() {
      contador.textContent = (isNaN(vagas()) ? 0 : vagas()) + ' vagas, ' + marcados().length + ' selecionados';
    }

    function desenhar(sugerir) {
      lista.innerHTML = '';
      var entradas = sistema.listarFila(select.value);
      var sugeridos = [];
      if (sugerir && vagas() >= 1) sugeridos = sistema.formarGrupo(select.value, vagas()).map(function (a) { return a.id; });
      if (!entradas.length) lista.appendChild(el('p', { class: 'nota', texto: 'Ninguém aguardando neste projeto.' }));
      entradas.forEach(function (f, i) {
        var pendente = f.situacao !== 'ativo';
        var cb = el('input', { type: 'checkbox', value: f.id, 'aria-label': (pendente ? f.nome + ', situação pendente' : 'Selecionar ' + f.nome) });
        if (pendente) cb.disabled = true;
        if (sugeridos.indexOf(f.id) !== -1) cb.checked = true;
        cb.addEventListener('change', atualizarContador);
        var alternar = el('button', { type: 'button', class: 'btn-sair', style: 'color:#0B4F8A;background:#fff;border-color:#0B4F8A;font-size:14px', texto: pendente ? 'Ativar' : 'Pendente' });
        alternar.setAttribute('aria-label', (pendente ? 'Marcar como ativo: ' : 'Marcar como pendente: ') + f.nome);
        alternar.addEventListener('click', function () {
          sistema.definirSituacao(f.id, pendente ? 'ativo' : 'pendente');
          salvar();
          desenhar(false);
        });
        lista.appendChild(el('div', { class: 'linha' }, [
          cb,
          el('span', { class: 'pos', texto: (i + 1) + 'º' }),
          el('span', { class: 'nome' }, [document.createTextNode(f.nome), el('small', { texto: 'Entrada: ' + formatarData(f.entrada) })]),
          el('span', { class: 'etiqueta ' + (pendente ? 'av' : 'ok'), texto: pendente ? '⚠ Pendente' : '✔ Ativo' }),
          alternar
        ]));
      });
      atualizarContador();
    }

    select.addEventListener('change', function () { desenhar(true); });
    vagasInput.addEventListener('input', function () { desenhar(true); });

    document.getElementById('form-grupo').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var r = sistema.salvarGrupo(select.value, document.getElementById('g').value, marcados(), vagas());
      if (!r.ok) { mostrarAviso('er', r.erro); return; }
      salvar();
      mostrarAviso('ok', 'Grupo ' + r.grupo.nome + ' criado com ' + r.grupo.alunos.length + ' alunos');
      document.getElementById('g').value = '';
      desenhar(true);
    });

    desenhar(true);
  }

  /* ---------- Grupos ---------- */
  function paginaGrupos() {
    if (!exigirAcesso()) return;
    var area = document.getElementById('grupos');
    if (!sistema.grupos.length) area.appendChild(el('p', { class: 'nota', texto: 'Nenhum grupo criado ainda. Monte um grupo pela fila de espera.' }));
    sistema.grupos.forEach(function (g) {
      var ul = el('ul', {}, g.alunos.map(function (a) { return el('li', { texto: a.nome }); }));
      area.appendChild(el('section', { class: 'cartao', style: 'display:block' }, [
        el('div', { texto: g.nome }),
        el('small', { texto: g.projeto + ' · ' + g.alunos.length + ' alunos' }),
        ul
      ]));
    });
  }

  var pagina = document.body.getAttribute('data-pagina');
  var rotas = { login: paginaLogin, menu: paginaMenu, cadastro: paginaCadastro, fila: paginaFila, grupos: paginaGrupos };
  if (rotas[pagina]) rotas[pagina]();
})();
