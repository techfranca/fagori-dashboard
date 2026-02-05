# Franca Dashboard

Dashboard de Performance de Campanhas para a Franca Assessoria.

![Franca Logo](https://via.placeholder.com/200x100/7DE08D/081534?text=FRANCA)

## Funcionalidades

- **Autenticação com Google** via Firebase Auth
- **Dashboard por empresa**: Houston Academy, Trevo Barbearia, Trevo Tabacaria, Miguel
- **Métricas principais**: Compras, Leads, Visitas ao Perfil
- **Métricas secundárias**: Seguidores, Impressões
- **Seção de Insights**: Pontos de Progresso, Pontos Positivos, Focos do Próximo Mês
- **Importação de planilha XLSX** para atualizar dados
- **Exportação em PDF** para compartilhar com clientes
- **Controle de acesso**: Admins podem editar, outros usuários apenas visualizam

## Requisitos

- Node.js 18+
- Conta no Firebase com projeto configurado

## Configuração do Firebase

### 1. Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Siga as instruções para criar o projeto

### 2. Configurar Authentication

1. No menu lateral, clique em **Authentication**
2. Clique em "Começar"
3. Na aba "Sign-in method", habilite **Google**
4. Configure o email de suporte e salve

### 3. Configurar Firestore

1. No menu lateral, clique em **Firestore Database**
2. Clique em "Criar banco de dados"
3. Selecione "Começar no modo de teste" (ou configure regras depois)
4. Escolha a região mais próxima

### 4. Obter Credenciais

1. Vá em **Configurações do Projeto** (ícone de engrenagem)
2. Role até "Seus apps" e clique em **Web** (</>)
3. Registre o app com um nome (ex: "franca-dashboard")
4. Copie as credenciais do `firebaseConfig`

### 5. Configurar Regras do Firestore

Vá em Firestore > Regras e adicione:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Dashboard data - anyone authenticated can read, only admins can write
    match /dashboard/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.email in ['gabriel@franca.com']; // Adicione emails de admin
    }
  }
}
```

## Instalação

### 1. Clone ou extraia o projeto

```bash
unzip franca-dashboard.zip
cd franca-dashboard
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais do Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id

# Emails autorizados (separados por vírgula)
NEXT_PUBLIC_AUTHORIZED_EMAILS=gabriel@franca.com,cliente@email.com

# Emails com acesso admin
NEXT_PUBLIC_ADMIN_EMAILS=gabriel@franca.com
```

### 4. Execute em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Deploy

### Vercel (Recomendado)

1. Faça push do código para o GitHub
2. Acesse [Vercel](https://vercel.com)
3. Importe o repositório
4. Configure as variáveis de ambiente na Vercel
5. Deploy!

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## Formato da Planilha XLSX

A planilha deve conter as seguintes colunas:

| Coluna | Descrição |
|--------|-----------|
| Nome da campanha | (ignorado) |
| Tipo de resultado | "Compras no site", "Leads no site" ou "Visitas ao perfil do Instagram" |
| Resultados | Número de resultados |
| Custo por resultado | Valor em R$ |
| Valor usado (BRL) | Investimento da campanha |
| Seguidores no Instagram | Novos seguidores |
| Início dos relatórios | Data de início |
| Término dos relatórios | Data final |
| Impressões | Número de impressões |

## Estrutura do Projeto

```
franca-dashboard/
├── app/
│   ├── dashboard/
│   │   └── page.tsx      # Página principal do dashboard
│   ├── login/
│   │   └── page.tsx      # Página de login
│   ├── globals.css       # Estilos globais
│   ├── layout.tsx        # Layout principal
│   └── page.tsx          # Redirect inicial
├── components/
│   ├── CompanyNav.tsx    # Navegação por empresa
│   ├── DashboardFooter.tsx
│   ├── DashboardHeader.tsx
│   ├── FrancaLogo.tsx    # Logo SVG
│   ├── InsightsSection.tsx
│   ├── MetricCard.tsx    # Cards de métricas
│   ├── SecondaryCard.tsx
│   └── UploadModal.tsx
├── contexts/
│   └── AuthContext.tsx   # Contexto de autenticação
├── lib/
│   ├── firebase.ts       # Config do Firebase
│   └── utils.ts          # Utilitários e tipos
├── public/
│   └── favicon.ico
├── .env.local.example
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json
```

## Suporte

Desenvolvido para Franca Assessoria.

---

**Franca Assessoria** • Vendendo mais para você
