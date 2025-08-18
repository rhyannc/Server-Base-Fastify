
Uma Base para API moderna e robusta, construída com TypeScript e Fastify, oferecendo alta performance e escalabilidade.

## 📋 Descrição

Este projeto é uma API RESTful desenvolvida para gerenciar operações de locação. A aplicação utiliza tecnologias modernas de desenvolvimento web, oferecendo uma base sólida e escalável para sistemas de locação com foco em performance e manutenibilidade.

### ✨ Características Principais
- ⚡ **Alta Performance** - Fastify como framework web
- 🔒 **Type Safety** - TypeScript com modo strict
- 🛡️ **Validação Robusta** - Zod para schemas e validação
- 🔄 **Hot Reload** - Desenvolvimento com recarregamento automático
- 📦 **Build Otimizado** - tsup para produção
- 🎯 **ESLint** - Padrões de código consistentes

## 🚀 Tecnologias Utilizadas

### **Backend**
| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **Node.js** | 22+ | Runtime JavaScript |
| **TypeScript** | 5.9.2 | Linguagem de programação tipada |
| **Fastify** | 5.5.0 | Framework web rápido e eficiente |
| **Zod** | 4.0.17 | Validação de esquemas e tipos |
| **dotenv** | 17.2.1 | Gerenciamento de variáveis de ambiente |

### **Desenvolvimento**
| Ferramenta | Versão | Descrição |
|------------|--------|-----------|
| **tsx** | 4.20.4 | Executor TypeScript para desenvolvimento |
| **tsup** | 8.5.0 | Bundler para produção |
| **ESLint** | 2.2.2 | Linter com configuração Rocketseat |
| **eslint-plugin-simple-import-sort** | 12.1.1 | Plugin para ordenação automática de imports |
| **@types/node** | 24.3.0 | Tipos TypeScript para Node.js |

## 📁 Estrutura do Projeto

```
api-locacao/
├── 📁 src/
│   ├── 🚀 app.ts          # Configuração principal do Fastify
│   ├── 🌐 server.ts       # Servidor HTTP
│   ├── 🧪 teste.ts        # Arquivo de testes
│   └── 📁 env/
│       └── ⚙️ index.ts    # Configuração de variáveis de ambiente
├── 📄 package.json        # Dependências e scripts
├── ⚙️ tsconfig.json       # Configuração TypeScript
├── 🔧 .eslintrc.json      # Configuração do ESLint
├── 📦 .npmrc              # Configuração do npm (versões exatas)
├── 📖 README.md          # Documentação do projeto
└── 🔒 .gitignore         # Arquivos ignorados pelo Git
```

## ⚙️ Configuração

### Pré-requisitos
- **Node.js** 22 ou superior
- **npm** ou **yarn**
- **Git**

### 🛠️ Instalação

1. **Clone o repositório:**
```bash
git clone [url-do-repositorio]
cd api-locacao
```

2. **Instale as dependências:**
```bash
npm install
# ou
yarn install
```

3. **Configure as variáveis de ambiente:**
Crie um arquivo `.env` na raiz do projeto:
```env
# Ambiente de execução
NODE_ENV=dev

# Porta do servidor
PORT=3333
```

## 🏃‍♂️ Como Executar

### 🚀 Desenvolvimento
```bash
npm run dev
```
O servidor será iniciado em modo de desenvolvimento com hot-reload na porta 3333.

### 🏭 Produção
```bash
# Compilar o projeto
npm run build

# Executar versão compilada
npm start
```

## 🔧 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor em modo desenvolvimento com hot-reload |
| `npm run build` | Compila o projeto para produção usando tsup |
| `npm start` | Executa a versão compilada em produção |

## 🛠️ Ferramentas de Qualidade

### **ESLint com Import Sorting**
O projeto está configurado para ordenar automaticamente os imports. Para corrigir problemas de ordenação:

```bash
# Verificar problemas de linting
npx eslint src/ --ext .ts

# Corrigir automaticamente problemas de ordenação
npx eslint src/ --ext .ts --fix
```

### **Controle de Versões**
Com o `.npmrc` configurado, ao instalar novos pacotes:

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

## 🌐 Endpoints

A API está configurada para rodar na porta **3333** por padrão.

### Status do Servidor
Quando iniciado com sucesso, você verá a mensagem:
```
✅ HTTP Server Online! 🚀
```

## 🛡️ Validação de Ambiente

O projeto utiliza Zod para validar as variáveis de ambiente, garantindo que:
- `NODE_ENV` seja 'dev', 'test' ou 'production'
- `PORT` seja um número válido (padrão: 3333)

## 📝 Características Técnicas

### **TypeScript**
- ✅ **Strict Mode** - Tipagem rigorosa para maior segurança
- ✅ **ES Modules** - Uso de módulos ES6+
- ✅ **Path Mapping** - Aliases para importações (`@/*`)
- ✅ **Node.js 22** - Suporte às funcionalidades mais recentes

### **🔧 Configurações de Qualidade de Código**

#### **ESLint com Import Sorting**
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

#### **Controle de Versões Exatas (.npmrc)**
O arquivo `.npmrc` garante que as versões dos pacotes sejam fixas:

```ini
# Serve para manter as versões exatas dos pacotes instalados no package.json
save-exact=true
```

**Benefícios:**
- 🔒 **Estabilidade** - Evita atualizações automáticas que quebrem a aplicação
- 🛡️ **Reprodutibilidade** - Mesmo comportamento em diferentes ambientes
- 📋 **Controle** - Você decide quando atualizar dependências
- 🚫 **Prevenção** de bugs causados por mudanças em dependências

### **Desenvolvimento**
- ✅ **Hot Reload** - Recarregamento automático durante desenvolvimento
- ✅ **Environment Validation** - Validação automática de variáveis de ambiente
- ✅ **ESLint** - Padrões de código consistentes
- ✅ **Import Sorting** - Ordenação automática de imports com `eslint-plugin-simple-import-sort`
- ✅ **Exact Versions** - Controle de versões exatas com `.npmrc`
- ✅ **Source Maps** - Debugging facilitado

### **Performance**
- ✅ **Fastify** - Framework otimizado para alta performance
- ✅ **Tree Shaking** - Eliminação de código não utilizado
- ✅ **ESM** - Módulos nativos do Node.js

## 🔮 Roadmap

### 🎯 Funcionalidades Planejadas
- [ ] **Rotas de CRUD** para locações
- [ ] **Autenticação e autorização** (JWT)
- [ ] **Integração com banco de dados** (PostgreSQL/MongoDB)
- [ ] **Documentação da API** (Swagger/OpenAPI)
- [ ] **Testes automatizados** (Jest/Vitest)
- [ ] **Middleware de logging** (Pino)
- [ ] **Monitoramento** (Health checks)
- [ ] **Rate limiting** e segurança
- [ ] **Docker** para containerização
- [ ] **CI/CD** pipeline

### 🏗️ Arquitetura Futura
```
src/
├── 📁 routes/          # Rotas da API
├── 📁 controllers/     # Controladores
├── 📁 services/        # Lógica de negócio
├── 📁 models/          # Modelos de dados
├── 📁 middleware/      # Middlewares customizados
├── 📁 utils/           # Utilitários
└── 📁 tests/           # Testes automatizados
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença **ISC**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## DOCKER

Para executar o Banco de dados deve se usar o Docker e rodar o camando 
docker compose up -d

## PRISMA
Executar o comando abaixo para criar as tablas
npx prisma migrate dev