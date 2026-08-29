# Tome Nota

Aplicativo web de anotações inspirado no [Evernote](https://evernote.com/pt-br), desenvolvido com HTML, CSS e JavaScript puro — sem frameworks ou dependências externas.

## Sobre o projeto

**Tome Nota** permite criar, editar, buscar e excluir anotações com título e descrição. Os dados são salvos automaticamente no navegador via `localStorage`, sem necessidade de backend ou cadastro.

## Funcionalidades

- **Nova anotação** — criação em modal com título e descrição
- **Listagem em grid** — cards organizados em 3 colunas (responsivo)
- **Busca** — filtro em tempo real por título ou descrição
- **Edição** — alteração de anotações existentes
- **Exclusão** — remoção com confirmação
- **Paginação** — 6 anotações por página com navegação Anterior/Próxima
- **Persistência local** — anotações mantidas entre sessões no mesmo navegador

## Tecnologias

| Tecnologia | Uso |
|------------|-----|
| HTML5 | Estrutura e elementos `<dialog>` nativos |
| CSS3 | Layout em grid, variáveis CSS e design responsivo |
| JavaScript (ES6+) | Lógica da aplicação e `localStorage` |

## Como executar

Não há instalação de dependências. Escolha uma das opções:

### Opção 1 — Abrir diretamente

Abra o arquivo `index.html` no navegador.

### Opção 2 — Servidor local (recomendado)

```bash
# Com Python 3
python3 -m http.server 8080

# Com Node.js (npx)
npx serve .
```

Acesse: [http://localhost:8080](http://localhost:8080)

## Estrutura do projeto

```
projeto-tomenota/
├── index.html      # Página principal
├── css/
│   └── style.css   # Estilos e layout
├── js/
│   └── app.js      # Lógica da aplicação
└── README.md
```

## Design

A interface utiliza a paleta de cores do Evernote, com tons de verde:

- Verde principal: `#00a82d`
- Verde escuro: `#008a24`
- Verde claro: `#e8f5ec`

## Licença

Este projeto é de código aberto e está disponível para uso educacional e pessoal.
