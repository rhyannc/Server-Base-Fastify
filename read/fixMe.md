Validaçao final de alt dados de company com usage de plano(remocao de qtd)


-Middleware de permissão para colaboradores
-Middleware de permissão para Plano

-se o plano mudar tem que fazer as pliticas de alteracaoes. 

TRIAL -> ACTIVE -> CPNY_ATIVO
TRIAL -> EXPIRED -> CPNY_FROZEN

ATIVO -> CANCELLED -> CPNY_ARCHIVED
ATIVO -> VENCIDO -> CPNY_FROZEN

CANCELLED -> ATIVO -> CPNY_ATIVO
VENCIDO   -> ATIVO -> CPNY_ATIVO
 