-- Criação da tabela de clientes
CREATE TABLE cliente (
  id SERIAL PRIMARY KEY,            -- Identificador único do cliente
  nome VARCHAR(100) NOT NULL,       -- Nome completo do cliente
  email VARCHAR(100) UNIQUE NOT NULL -- E-mail do cliente (deve ser único)
);

-- Criação da tabela de categorias de produto
CREATE TABLE categoria (
  id SERIAL PRIMARY KEY,            -- Identificador único da categoria
  nome VARCHAR(50) NOT NULL         -- Nome da categoria
);

-- Criação da tabela de produtos
CREATE TABLE produto (
  id SERIAL PRIMARY KEY,            -- Identificador único do produto
  nome VARCHAR(100) NOT NULL,       -- Nome do produto
  preco NUMERIC(10,2) NOT NULL,     -- Preço do produto
  categoria_id INT NOT NULL,        -- Chave estrangeira para categoria
  CONSTRAINT fk_produto_categoria
    FOREIGN KEY(categoria_id)
      REFERENCES categoria(id)
);

-- Criação da tabela de pedidos
CREATE TABLE pedido (
  id SERIAL PRIMARY KEY,            -- Identificador único do pedido
  data TIMESTAMP WITHOUT TIME ZONE NOT NULL,  -- Data e hora do pedido
  cliente_id INT NOT NULL,          -- Chave estrangeira para cliente
  CONSTRAINT fk_pedido_cliente
    FOREIGN KEY(cliente_id)
      REFERENCES cliente(id)
);

-- Criação da tabela de itens de pedido
CREATE TABLE item_pedido (
  pedido_id INT NOT NULL,           -- Referência ao pedido
  produto_id INT NOT NULL,          -- Referência ao produto
  quantidade INT NOT NULL,          -- Quantidade solicitada
  PRIMARY KEY(pedido_id, produto_id),
  CONSTRAINT fk_itempedido_pedido
    FOREIGN KEY(pedido_id)
      REFERENCES pedido(id),
  CONSTRAINT fk_itempedido_produto
    FOREIGN KEY(produto_id)
      REFERENCES produto(id)
);
