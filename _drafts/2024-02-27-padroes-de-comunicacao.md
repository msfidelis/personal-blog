---
layout: post
image: assets/images/system-design/protocolos.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Padrões de Comunicação Sincronos, REST, gRPC, Websockets
---


# REST (Representational State Transfer)

O **REST**, ou **Representational State Transfer**, é um estilo **arquitetônico para sistemas distribuídos** que presa pela simplicidade da comunicação entre componentes na internet ou em redes internas de microserviços. Definido por Roy Fielding em sua tese de doutorado em 2000, REST não é um protocolo ou padrão, mas um conjunto de princípios arquitetônicos usados para projetar sistemas distribuídos escaláveis, confiáveis e de fácil manutenção. Os serviços que seguem os princípios REST são conhecidos como RESTful.

O REST é construído usando referências e recursos do protocolo HTTP, definindo papeis e responsabilidades de cliente-servidor e busca estabelecer uma interface de um cliente com os dados e ações de um sistema. 

Ele utiliza métodos HTTP para definir ações, como **GET, POST, PUT, DELETE e PATCH**, para realizar operações CRUD **(Criar, Ler, Atualizar, Deletar)** em recursos identificados por URI's. Esses recursos são representações de entidades ou objetos do domínio da aplicação.

#### Utilização de Métodos HTTP para Representar Ações

Os métodos HTTP, também conhecidos como "verbos", definem ações que podem ser realizadas sobre os recursos. Eles permitem uma interação semântica com os recursos, onde cada método tem um propósito específico:

| Método  | Descrição                                                                                                                                 | Idempotência |
|---------|--------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| GET     | Utilizado para **recuperar a representação de um recurso sem modificá-lo**. É seguro e **idempotente**, o que significa que várias **requisições idênticas devem ter o mesmo efeito que uma única requisição.** | Sim          |
| POST    | Empregado para **criar um novo recurso**. **Não é idempotente**, pois realizar várias requisições POST pode criar múltiplos recursos.                                                              | Não          |
| PUT     | Utilizado para **atualizar um recurso existente ou criar um novo se ele não existir**, no URI especificado. **É idempotente**, então **múltiplas requisições idênticas terão o mesmo efeito sobre a entidade**.   | Sim          |
| DELETE  | Empregado para **remover um recurso**. É **idempotente, pois deletar um recurso várias vezes tem o mesmo efeito que deletá-lo uma única vez**.                                                      | Sim          |
| PATCH   | Utilizado para **aplicar atualizações parciais a um recurso**. Ao contrário do PUT, que substitui o recurso inteiro, o **PATCH modifica apenas as partes especificadas**. É idempotente, pois a execução sob o mesmo recurso tende a gerar sempre o mesmo efeito e gerar o mesmo resultado. | Sim          |

<br>

#### Métodos HTTP nas URI's e Entidades

As URIs são utilizadas para identificar os recursos de forma única. Em uma API RESTful, as URIs são projetadas para serem intuitivas e descritivas, facilitando o entendimento e a navegação pelos recursos disponíveis. A estrutura de uma URI em REST reflete a organização dos recursos e suas relações.

As URIs quando olhadas no modelo REST, devem se referir a recursos e entidades,  e não às ações que serão realizadas diretamentesobre eles. Por exemplo, o path `/users` para acessar recursos do usuário combinado com o método `GET`, e não um basepath imperativo como `/getUsers`.

A URI de determinadas entidades devem refletir a estrutura hierárquica dos recursos. Por exemplo, `/users/123/posts` pode representar os posts do usuário com ID 123.

Devem se utilizar querystrings como parametros de consulta para filtrar recursos ou modificar a saída de uma chamada REST. Por exemplo, `/users?active=true` para filtrar apenas usuários ativos ou `/users/123/posts?tag=system-design` para filtrar os posts do usuário com a tag `system-design`. 

Considerando uma API para um portal de notícias ou blog, aqui estão exemplos de como os métodos HTTP e as URIs podem ser utilizados para interagir com os recursos:

| Ação                          | Método | Endpoint     |
|-------------------------------|--------|--------------|
| Listar todos os posts         | GET    | `/posts`     |
| Obter um post específico      | GET    | `/posts/1`   |
| Criar um novo post            | POST   | `/posts`     |
| Atualizar um post existente   | PUT    | `/posts/1`   |
| Deletar um post               | DELETE | `/posts/1`   |
| Atualizar parte de um post    | PATCH  | `/posts/1`    |


<br>

#### Status Codes de Resposta e Padrões do REST

Os códigos de status de resposta HTTP são recursos importantes para implementacões RESTful, pois são usados como convenção para indicar informações de estado das respostas de uma  solicitação. Ele abre o leque das classes dando funcionalidades e representatividade a elas perante uma solicitação.  

Os status codes mais utilizados em implementações RESTFul são os seguintes: 

| Código                    | Descrição                                                                                 |
|---------------------------|-------------------------------------------------------------------------------------------|
| 200 OK                    | Solicitação bem-sucedida para GET, PUT ou POST sem criação de recurso.                    |
| 201 Created               | Nova criação de recurso resultante de uma solicitação POST.                               |
| 202 Accepted              | Solicitação aceita para processamento; conclusão pendente.                                |
| 204 No Content            | Solicitação bem-sucedida sem conteúdo para retornar. Comum após DELETE.                   |
| 400 Bad Request           | Erro de cliente devido a sintaxe ou formato inválido.                                     |
| 401 Unauthorized          | Falha ou necessidade de autenticação.                                                     |
| 403 Forbidden             | Servidor recusa a solicitação, apesar de compreendê-la.                                   |
| 404 Not Found             | Recurso solicitado não encontrado.                                                        |
| 405 Method Not Allowed    | Método conhecido pelo servidor, mas desativado.                                           |
| 500 Internal Server Error | Falha genérica do servidor.                                                               |
| 503 Service Unavailable   | Servidor indisponível, geralmente por manutenção ou sobrecarga.                           |
| 504 Gateway Timeout       | Tempo limite atingido por um servidor gateway ou proxy sem resposta do servidor upstream. |


#### Comunicação Stateless 

No REST, cada requisição do cliente para o servidor deve conter todas as informações necessárias para entender e completar a requisição. O servidor não armazena nenhum estado da sessão do cliente. 

#### Camadas 

A arquitetura em camadas permite que intermediários (como proxies e gateways) facilitem ou melhorem a comunicação entre o cliente e o servidor, promovendo a segurança, o balanceamento de carga e a capacidade de cache. Combinando o conceito e viabilidade de camadas com o padrão stateless, o padrão se torna muito poderoso e escalável. 

#### Cache 

As respostas do servidor devem ser explícitas quanto à sua cacheabilidade para evitar a reutilização de dados obsoletos ou inapropriados, melhorando a eficiência e a escalabilidade.

### RPC (Remote Procedure Call)

### gRPC (google Remote Procedure Call)

### Websockets

### GraphQL


<br>



<br>

# Protocolos em Arquiteturas em Operações Sincronas e Assincronas


<br>

# Considerações de Segurança


### Referências


[HTTP Status](https://www.httpstatus.com.br/)

[HTTP Cats](https://http.cat/)

[Qual é a diferença entre gRPC e REST?](https://aws.amazon.com/pt/compare/the-difference-between-grpc-and-rest/)