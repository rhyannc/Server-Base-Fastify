<h1 align="center">Template SaaS API Base</h1>

Uma base moderna e robusta para construção de APIs SaaS (Software as a Service). 
Construída com as melhores práticas de Clean Architecture e SOLID, utilizando **TypeScript**, **Fastify**, e **Prisma ORM**.

<br>
## 📋 Descrição

Este projeto serve como motor (Backend API RESTful) para um sistema SaaS completo, onde empresas podem se registrar, convidar colaboradores, gerenciar acessos e ser faturadas via Stripe. O objetivo é fornecer uma API de alta performance e pronta para produção, focada em segurança, manutenibilidade e escalabilidade.
<br>

### ✨ O que já temos implementado
- 🏢 **Multi-tenancy B2B**: Gestão de Empresas (Tenants) e Colaboradores com Níveis de Acesso.
- 🔐 **Autenticação & Segurança**: Rotas com suporte a rate limiting, Login com JWT, Recuperação de Esquecimento de Senha e Verificação obrigatória de conta por E-mail.
- 💳 **Assinaturas & Limites**: Integração completa com **Stripe** (via Webhooks), validando o limite máximo de empresas, colaboradores permitidas pelo plano escolhido.
- 📧 **Sistema de E-mails**: Infraestrutura transacional pronta com providers plugáveis (**Resend** em Produção e **Ethereal Nodemailer** em modo de Desenvolvimento) isolada com templates HTML centralizados.
- ⚡ **Alta Performance**: Core 100% construído sobre o ecossistema Fastify.
- 🛡️ **Validação Robusta**: Validação estrita de todos os dados de entrada/saída HTTP diretamente acoplada aos schemas usando **Zod**.
- 📖 **Documentação Automática**: Swagger e Swagger UI já configurados e funcionando para testar todos os endpoints.
- 📊 **Testes Unitários**: Cobertura massiva e rápida dos Use Cases utilizando In-Memory Databases pelo **Vitest**.

<br><br>

## 🚀 Tecnologias Utilizadas

| Tecnologia | Finalidade |
|------------|-----------|
| **Node.js 22+** | Runtime de execução |
| **TypeScript** | Controle de tipagem e segurança em tempo de transpilação |
| **Fastify** | Framework web ultrarrápido |
| **Prisma ORM** | Construção das Migrations, Interface e Modelagem (PostgreSQL) |
| **Zod** | Validação de esquemas e proteção |
| **dotenv** | Gerenciamento de variáveis de ambiente |
| **Vitest** | Engine de Testes Unitários e UI de Coverage |
| **Stripe** | Plataforma global de Assinaturas e Webhooks B2B |
| **Resend & Nodemailer** | Disparo de E-mails de Onboarding e Senhas |

<br><br>

## 📁 Estrutura e Arquitetura

O projeto isola totalmente os Casos de Uso (*Regras de Negócio Puras*) dos Controladores (*Mecanismo de Entrega Web*) e Repositórios (*Infraestrutura Prática*):

```
api-backend/
├── 📁 prisma/                 # Schema do Banco de Dados e Migrations (PostgreSQL)
├── 📁 src/
│   ├── 📁 env/                # Schema global de validação do `.env`
│   ├── 📁 http/               # Controllers, Middlewares e Rotas Fastify
│   ├── 📁 providers/          # Serviços Externos (ex: MailProviders, Stripe, Templates)
│   ├── 📁 repositories/       # Contratos Inteface e Acessos ao Banco (Prisma/Mocked)
│   ├── 📁 use-cases/          # Regras de Negócio Core (separadas por domínio)
│   ├── 🚀 app.ts              # Setup do Fastify (Swagger, RateLimit, Error Handling)
│   └── 🌐 server.ts           # Ponto de entrada - Servidor HTTP
|── 🧪.env                     # Arquivo de variáveis de ambiente
├── 📄 package.json            # Scripts de execução e dependências
├── ⚙️ tsconfig.json           # Configuração do TypeScript
├── 🔧 .eslintrc.json          # Regras do ESLint (Import sorting, formatação)
├── 📦 .npmrc                  # Trava para instalar dependências em versões exatas
├── 📖 README.md               # Documentação do projeto
└── 🔒 .gitignore              # Arquivos ignorados pelo Git
|── stripe-cli                 # Stripe CLI para testes locais
|── vite.config.ts             # Configuração do Vitest para reconheça os atalho
```

## ⚙️ Configuração & Instalação

### Pré-requisitos
- **Node.js** v22 ou superior
- Instalação limpa do **Docker** e **Docker Compose**
- Contas no **Stripe** e **Resend** (Opções gratuitas atendem muito bem testes)

### 1. Inicializando
```bash
npm i
```

### 2. Variáveis de Ambiente
Ajuste o arquivo `.env` na raiz do projeto:
```env
# Ambiente de desenvolvimento
NODE_ENV=dev

# Porta do servidor
PORT=3333

# Criptografia global
JWT_SECRET="SuaChaveSecreta"

# DB
DATABASE_URL="postgresql://docker:docker@localhost:5432/apisolid?schema=public"

# Integrações
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
RESEND_API_KEY="re_..."
```

### 3. Banco de Dados
A API já possui um `docker-compose.yml` pré-configurado com PostgreSQL:
```bash
# Sobe o container Postgres em Background
docker compose up -d
```

### PRISMA
Execute os comando para gerar as migrate e criaçao das tabelas
```bash
npx prisma generate
npx prisma migrate dev
```

## 🏃‍♂️ Como Executar

### 🚀 Ambientes Locais (Desenvolvimento)
```bash
npm run dev
```

Quando iniciado com sucesso, você verá a mensagem:
```
✅ HTTP Server Online! 🚀
```
O servidor será iniciado em modo de desenvolvimento com hot-reload na porta 3333.

<br><br>

### 📖 Documentação da API (Swagger)
Com o servidor rodando, acesse a rota `/docs` no seu navegador para visualizar e testar interativamente todos os endpoints catalogados:
```
http://localhost:3333/docs
```

<br>

### 💳 Simulando Webhooks do Stripe Localmente
Para testar o recebimento de eventos do Stripe (como assinaturas pagas ou falhas), instale e utilize a [Stripe CLI](https://docs.stripe.com/stripe-cli/):
```bash
stripe listen --forward-to localhost:3333/webhooks/stripe

ou 
./stripe-cli login
```
> **Nota**: Ao rodar o comando acima pela primeira vez, o Stripe CLI gerará uma chave de webhook local temporária (`whsec_...`). Copie essa chave e cole no seu `.env` preenchendo o valor de `STRIPE_WEBHOOK_SECRET` para que a rotas validem as chamadas locais!

<br>

### 🏭 Ambientes Produtivos
Geração de binários buildados via `tsup`:
```bash
# Compilar o projeto
npm run build
 
# Executar versão compilada
npm start
```

<br>

## 🧪 Suíte de Testes Unitários
Nosso repositório é testável em milissegundos sem a necessidade de conexões ativas de Cloud usando vitest mock pattern.

| Comando Base | Efeito |
|---------|-----------|
| `npm run test` | Varre e testa a aplicação por completo uma unidade vez |
| `npm run test:watch` | Rodagem silenciosa acompanhando novos códigos salvos |
| `npm run test:ui` | Visual gráfico maravilhoso no navegador sobre os cenários |
| `npm run test:coverage` | Exibe se faltam "linhas de código" não testadas pelo Dev |

<br>

## 🛠️ Qualidade de Código Integrada
Atualmente nosso workflow é protegido e padronizado por:
1. **Automação NPM Exato** (`.npmrc` trava dependências sem breaking changes ao instalar novos pacotes).
```bash
# Instala com versão exata (sem ^ ou ~)
npm install nome-do-pacote

# Para atualizar uma dependência específica
npm install nome-do-pacote@versao-especifica
```

**Exemplo de package.json com versões exatas:**
```json
{
  "dependencies": {
    "fastify": "5.5.0",        // Versão exata
    "zod": "4.0.17"           // Sem ^ ou ~
  }
}
```

2. **ESLint Rigoroso** apontando cheiros ruins no código baseado em padrões de código e importações sempre alfanumérico agrupadas (`eslint-plugin-simple-import-sort`).
```bash
# Verificar problemas de linting
npx eslint src/ --ext .ts

# Corrigir automaticamente problemas de ordenação
npx eslint src/ --ext .ts --fix
```

<br><br>

## 📝 Características Técnicas
### **TypeScript**
- ✅ **Strict Mode** - Tipagem rigorosa para maior segurança
- ✅ **ES Modules** - Uso de módulos ES6+
- ✅ **Path Mapping** - Aliases para importações (`@/*`)

<br><br>

## Configurações de Qualidade de Código
#### --ESLint com Import Sorting
O projeto utiliza `eslint-plugin-simple-import-sort` para manter a organização dos imports:

```json
{
  "plugins": ["simple-import-sort"],
  "rules": {
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error"
  }
}
```
**Benefícios:**
- 📦 **Ordenação automática** de imports por categoria
- 🎯 **Consistência** no estilo de código
- 🔄 **Prevenção de conflitos** em merge
- ⚡ **Melhor legibilidade** do código

#### --Controle de Versões Exatas (.npmrc)
O arquivo `.npmrc` garante que as versões dos pacotes sejam fixas:

```ini
# Serve para manter as versões exatas dos pacotes instalados no package.json
save-exact=true
```
**Benefícios:**
- 🔒 **Ambientes idênticos** - Todos os desenvolvedores usam exatamente as mesmas versões
- 🛡️ **Prevenção de quebras** - Evita que atualizações automáticas quebrem o projeto
- 🎯 **Builds consistentes** - Mesmos resultados em diferentes ambientes
- 🔄 **Controle total** - Você decide quando atualizar cada dependência


<br><br><br>

## 🤝 Contribuindo
1. Faça o seu `fork` deste repositório
2. Crie uma branch para a nova incrível feature (`git checkout -b feature/MinhaInovacao`)
3. Efetue commit e rode os lint/tests (`git commit -m 'feat: Novo sistema adicionado'`)
4. Empurre! (`git push origin feature/MinhaInovacao`)
5. Abra o Pull Request!

## 📄 Licença
Acesso Livre: **ISC License**. Empreste, refatore e lucre!
