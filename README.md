# Avalia.Serv — React + Spring Boot

Reescrita do Avalia.Serv em duas partes: uma API REST em Spring Boot e um front-end React (JavaScript).
A identidade visual original foi mantida — tipografia Sora, gradiente índigo/azul e tema claro/escuro.

```
avalia-serv/
├── back/     API Spring Boot 3.3 (Java 17, JPA, JWT, H2/Postgres)
└── front/    React 18 + Vite + React Router
```

## Como rodar

### Back-end

```bash
cd back
./mvnw spring-boot:run        # ou: mvn spring-boot:run
```

- API em `http://localhost:8080`
- Banco H2 em arquivo (`back/data/`), console em `http://localhost:8080/h2-console`
- Os seis profissionais de demonstração são criados na primeira execução
- Para PostgreSQL: `mvn spring-boot:run -Dspring-boot.run.profiles=postgres`

Em produção, defina a chave do JWT:

```bash
export AVALIASERV_JWT_SECRET="uma-chave-aleatoria-com-32-ou-mais-caracteres"
```

### Front-end

```bash
cd front
npm install
npm run dev     # http://localhost:5173
```

O Vite faz proxy de `/api` para `localhost:8080`. Para apontar para outra API, copie `.env.example`
para `.env` e ajuste `VITE_API_URL`.

## O que mudou em relação à versão em JavaScript puro

| Antes | Agora |
|---|---|
| `localStorage` como banco | JPA + H2/PostgreSQL |
| Senha em texto puro | BCrypt |
| Sessão no `localStorage` | JWT com expiração de 24h |
| Código de recuperação exposto na tela | Token com validade de 15 min no servidor |
| Chat lido do `localStorage` por polling local | Mensagens no servidor, salas canônicas, polling de 4s |
| `innerHTML` + `sanitize()` manual | React escapa o conteúdo por padrão |
| Módulos IIFE em um arquivo | Componentes, contexts e cliente HTTP separados |

## Endpoints

### Autenticação — `/api/auth` (público)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/signup` | Cria conta de cliente ou profissional; devolve token |
| POST | `/login` | Autentica e devolve token |
| POST | `/forgot-password` | Gera código de 6 dígitos (15 min) |
| POST | `/verify-token` | Confere o código |
| POST | `/reset-password` | Define a nova senha |

### Usuário — `/api/users`
`GET /me` · `PUT /me` · `DELETE /me`

### Profissionais — `/api/professionals`
`GET /` (filtros `q`, `category`, `city`, `availability`) · `GET /{id}` · `POST /{id}/reviews`

### Solicitações — `/api/requests`
`POST /` · `GET /mine` · `GET /open?category=` · `GET /{id}` · `PATCH /{id}/close` · `DELETE /{id}`

### Chat — `/api/chat`
`GET /conversations` · `GET /messages?with={email}` · `POST /messages`

### Favoritos — `/api/favorites`
`GET /` · `GET /ids` · `POST /{profileId}/toggle`

Todas as rotas fora de `/api/auth` e do `GET /api/professionals` exigem o cabeçalho
`Authorization: Bearer <token>`.

## Pontos em aberto para produção

- **Envio de e-mail**: o código de recuperação hoje volta no campo `devToken` da resposta, para
  facilitar os testes. Antes de publicar, troque por `spring-boot-starter-mail` e remova o campo.
- **Fotos**: são gravadas como data URI na coluna `photo`. Para volume maior, migre para S3 ou
  disco com URL pública.
- **Chat**: o polling de 4 segundos resolve para poucos usuários. WebSocket (STOMP) é o próximo passo.
- **WhatsApp do suporte e chave PIX**: ainda estão com valores de exemplo em `FloatingActions.jsx`.
- **Migrações**: `ddl-auto: update` serve ao desenvolvimento; use Flyway ou Liquibase em produção.
# AvaliaServv
