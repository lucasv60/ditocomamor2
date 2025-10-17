# Migração para Vercel + Supabase + Mercado Pago

## 📋 Visão Geral da Migração

Este projeto foi migrado de Railway/Cloudinary para uma arquitetura moderna usando:
- **Vercel**: Hospedagem e funções serverless
- **Supabase**: Banco de dados PostgreSQL, Auth e Storage
- **Mercado Pago**: Processamento de pagamentos com IPN/Webhooks

## 🚀 Principais Mudanças

### 1. **Banco de Dados**
- **Antes**: Prisma + SQLite (Railway)
- **Depois**: Supabase PostgreSQL com Row Level Security (RLS)

### 2. **Armazenamento de Arquivos**
- **Antes**: Cloudinary
- **Depois**: Supabase Storage (memories-photos bucket)

### 3. **Fluxo de Pagamento**
- **Antes**: Pagamento direto sem verificação assíncrona
- **Depois**: Fluxo assíncrono com IPN do Mercado Pago

### 4. **URLs das Páginas**
- **Antes**: `/{pageName}` (qualquer usuário)
- **Depois**: `/memory/{slug}` (apenas após pagamento confirmado)

## 🛠️ Configuração Necessária

### 1. **Supabase Setup**
```bash
# 1. Criar projeto no Supabase
# 2. Executar o SQL schema em: database-schema.sql
# 3. Configurar Storage Bucket: memories-photos
# 4. Obter credenciais e configurar em .env
```

### 2. **Variáveis de Ambiente**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=your-access-token

# Vercel
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

### 3. **Mercado Pago Webhook**
- Configurar IPN URL: `https://your-app.vercel.app/api/mercadopago-ipn`
- Usar o mesmo access token configurado nas variáveis

## 📊 Estrutura da Tabela `memories`

```sql
CREATE TABLE memories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    love_letter_content TEXT NOT NULL,
    relationship_start_date DATE NOT NULL,
    photos_urls JSONB,
    youtube_music_url TEXT,
    payment_status ENUM ('pending', 'paid', 'failed', 'abandoned') DEFAULT 'pending',
    preference_id TEXT,
    payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔄 Fluxo de Dados Atualizado

### 1. **Criação da Memória**
1. Usuário preenche formulário
2. Fotos são enviadas para Supabase Storage
3. Registro criado com `payment_status = 'pending'`
4. Preferência de pagamento criada no Mercado Pago
5. Usuário redirecionado para pagamento

### 2. **Confirmação de Pagamento**
1. Mercado Pago envia notificação IPN
2. Sistema verifica detalhes do pagamento
3. Status atualizado para `'paid'` se aprovado
4. Página `/memory/{slug}` liberada

### 3. **Acesso à Página**
- Apenas páginas com `payment_status = 'paid'` são acessíveis
- URLs seguem padrão `/memory/{slug}`
- Páginas não encontradas retornam 404

## 🧹 Limpeza Automática

### Função de Limpeza
```sql
CREATE OR REPLACE FUNCTION cleanup_abandoned_memories()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM memories
    WHERE payment_status = 'pending'
    AND created_at < NOW() - INTERVAL '24 hours';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
```

### Como Executar
```bash
# Verificar quantas memórias serão limpas
curl https://your-app.vercel.app/api/cleanup-abandoned

# Executar limpeza (com autenticação)
curl -X POST https://your-app.vercel.app/api/cleanup-abandoned \
  -H "Authorization: Bearer your-admin-token"
```

## 🔒 Segurança

### Row Level Security (RLS)
- Políticas configuradas para permitir apenas leitura de memórias pagas
- Operações de escrita restritas ao service role

### Autenticação
- Endpoints de administração protegidos
- Uploads de arquivos validados
- Tokens de acesso seguros

## 🚀 Deploy no Vercel

### 1. **Conectar Repositório**
```bash
# Vercel CLI
vercel --prod
```

### 2. **Configurar Environment Variables**
- Adicionar todas as variáveis no dashboard do Vercel
- Configurar domains customizados se necessário

### 3. **Database Connection**
- Supabase connection string já configurada
- Connection pooling automático

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de Upload de Fotos**
   - Verificar bucket `memories-photos` no Supabase
   - Confirmar políticas de storage

2. **IPN não Funcionando**
   - Verificar URL do webhook no Mercado Pago
   - Checar logs do Vercel Functions

3. **Página não Carrega**
   - Confirmar `payment_status = 'paid'`
   - Verificar slug único

### Logs e Debug
```bash
# Vercel logs
vercel logs

# Supabase logs
# Acessar dashboard do Supabase > Logs
```

## 📈 Melhorias Implementadas

- ✅ **Segurança**: RLS e validações robustas
- ✅ **Performance**: Serverless functions otimizadas
- ✅ **Escalabilidade**: Supabase para crescimento
- ✅ **Confiabilidade**: IPN para confirmação assíncrona
- ✅ **Manutenibilidade**: Código limpo e bem documentado

## 🎯 Próximos Passos

1. **Monitoramento**: Configurar analytics e error tracking
2. **Backup**: Estratégia de backup do Supabase
3. **CDN**: Otimizar delivery de imagens
4. **Cache**: Implementar cache para páginas públicas
5. **SEO**: Meta tags dinâmicas para memórias

---

**Status**: ✅ Migração Completa
**Data**: Outubro 2024
**Versão**: 2.0.0