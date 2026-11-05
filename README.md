# Ponte Organizada

MVP de um sistema web para gestão de alunos, fila de espera e associados do **Instituto Da Ponte Pra Cá** (Osasco/SP).

Projeto da disciplina de Projeto de Software (Análise e Desenvolvimento de Sistemas). Alinhado ao ODS 4 (Educação de Qualidade).

## Problema

O instituto organiza hoje alunos, fila de espera e grupos por projeto em planilhas, caderno e WhatsApp. Isso dificulta saber quem está ativo, quem aguarda vaga e qual a situação de cada associado.

## Escopo do MVP

- Aplicação web responsiva
- Cadastro de alunos e associados
- Situação do associado
- Fila de espera
- Grupos por projeto
- Perfis de acesso

**Fora do escopo:** doações, aplicativo nativo e integrações externas.

## Estrutura do repositório

```
app/         interface web funcional (HTML, CSS e JavaScript)
src/         regras de negócio testadas (validação, fila e grupos)
tests/       testes unitários e de integração (Jest)
prototipo/   protótipo navegável das telas (HTML e CSS)
docs/        documentação do projeto, como os requisitos do MVP
```

O código do MVP será adicionado em novas pastas conforme o desenvolvimento avançar.

## Como ver o protótipo

Abra `app/index.html` no navegador. O acesso é de demonstração (qualquer email válido e senha com 4 ou mais caracteres), e os dados ficam salvos só no navegador (localStorage). No menu, o botão "Carregar dados de exemplo" preenche a fila para testar. O protótipo original continua em `prototipo/index.html`.

## Convenção de commits

Commits semânticos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`. Mudanças entram por Pull Request a partir de branches `feat/...`, `fix/...` ou `docs/...`.

## Autor

Vinicius Alvino

## Testes e integração contínua

```
npm install
npm test            # executa os testes
npm run test:cov    # executa os testes com relatório de cobertura
```

Os testes (Jest) ficam em `tests/` e cobrem as regras de `src/`: validação de telefone, data e nome, fila de espera, montagem de grupos e o fluxo de integração cadastro, fila e grupo. O pipeline em `.github/workflows/ci.yml` roda os testes a cada push e Pull Request.
