---
layout: post
image: assets/images/system-design/escalabilidade-capa.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - API Gateways
---

<br>

# Definindo API Gateways

Em sistemas modernos, as arquiteturas tendem a se tornar mais complexas, granulares e distribuídas. Neste contexto, os API Gateways surgem como uma solução para um problema significativo: fornecer uma interface consistente para acessar diversos componentes através de um único ponto de contato.

Um API Gateway é uma **camada de abstração entre os clientes e os serviços**, oferecendo uma **interface única** e **roteamento entre vários serviços**. Ele atua como um **centralizador de comunicações síncronas** entre os microserviços de um ambiente específico. O API Gateway recebe todas as chamadas de API, as encaminha para os serviços internos apropriados com base em regras predefinidas (como basepaths e métodos) e depois retorna as respostas dos serviços aos clientes solicitantes. 

Visto como um padrão, ele busca unificar as comunicações entre cliente e servidor através de um único ponto de contato conhecido, centralizando funcionalidades comuns entre eles, como autenticação, autorização, cache, firewalls, rate limits, etc.

Importante ressaltar que os Gateways, por padrão, são intermediários primariamente de APIs REST.


## O problema que os API Gateways resolvem?

Vamos propor um cenário. Em um backend monolítico, em ambientes modernos, se os clientes precisassem recuperar alguns dados ou consumir serviços dessa aplicação, eles fariam uma chamada de API para a URL do backend, e um balanceador de carga que responderia primariamente pelo endereço encaminharia a requisição para um dos nodes disponíveis na sua lista de hosts. Até aí, nada novo. 

// IMAGEM DE API'S DE BACKEND

Partindo para um paralelo com microserviços, a dinâmica é praticamente a mesma, porém o cliente efetuaria a chamada diretamente para o microserviço responsável pela especificidade da sua solicitação, diversificando as opções de chamadas entre várias URLs diferentes.

Vamos melhorar um pouco o cenário, onde todos esses endpoints precisam ser públicos, pois os clientes são Single Page Applications, Aplicações Mobile ou Integrações de Terceiros.

// IMAGEM DE API'S DE BACKEND MICROSERVICOS

A necessidade de disponibilizá-los publicamente se tornaria algo complexo, uma vez que ficaria a cargo dos clientes conhecer todos os endpoints disponíveis e gerenciar cada um deles com documentações e URLs individuais. Além disso, haveria a dificuldade de implementação de mecanismos de segurança pelos times internos, como gestão de autenticação e autorização, onde seria necessário garantir que todos eles implementassem esses mecanismos da mesma forma, assegurando os mesmos padrões de segurança.

Ainda podemos expandir esse cenário para o ciclo de vida da aplicação, onde seria necessária a substituição de um desses serviços por uma solução mais moderna, desativando o antigo. O esforço para fazer essa mudança iria muito além dos times de tecnologia responsáveis, levando trabalho adicional para os clientes de integração.

Os API Gateways resolvem esse tipo de cenário, pois encapsulam os sistemas internos de um produto ou domínio e fornecem meios de lidar com cada um dos serviços através de seus endpoints.

<br>

# API Gateways em Arquiteturas de Microserviços

Como abordado, em arquiteturas baseadas em microserviços que podem envolver dezenas ou centenas de serviços distintos, os API Gateways simplificam a interação dos clientes com esses serviços. Eles abstraem a complexidade do backend, proporcionando um ponto de entrada único e coeso para todos os serviços disponíveis, e pois isso reduzem a complexidade para os clientes. Isso significa que os clientes não precisam saber onde cada serviço está localizado ou como eles estão divididos internamente.

Basicamente, os API Gateways encapsulam a complexidade dos sistemas distribuídos e expõem endpoints simplificados. Eles podem agrupar vários endpoints e redirecionar as solicitações para diferentes microserviços e sistemas, tudo através de um único ponto de contato.

![API Gateway](/assets/images/system-design/api-gateway.png)

Esse tipo de arquitetura te permite fazer com que cada requisição feita para um `recurso` ou `método` da API descrita no Gateway, seja encaminhado pora um microserviço diferente. Esse tipo de flexibilidade é muito interessante para solucionar problemas de governança e organização de produtos oferecidos internamente ou externamente. Essa abordagem pode facilitar tanto em casos mais simples, quanto pra casos de roteamento mais complexos.  

![API Gateway](/assets/images/system-design/api-gateway-1.png)
> API Gateway redirecionando tráfego para diversos microserviços com base no path-prefix

![API Gateway](/assets/images/system-design/api-gateway-2.png)
> API Gateway redirecionando tráfego para diversos microserviços com base em regras mais específicas de método e path

<br>

# Componentes e Arquitetura de um API Gateway

Esta seção descreve os principais componentes e a estrutura arquitetônica de um API Gateway, destacando como cada parte contribui para a eficiência, segurança e escalabilidade da aplicação. Um API Gateway típico é composto por vários componentes e funcionalidades que trabalham juntos para processar as requisições, como por exemplo **roteamento de requisições**, centralizador de autenticação e autorização, limitador de trafego e mecanismo de throttling, modificação de mensagens e gerenciamento de cachings.

## Roteamento de requisições

O roteamente de requisições centralizada é a funcionalidade central dos padrões de design de API Gateway. Ele permite que com base em informações fornecidas pelo cliente através do próprio protocolo HTTP, que normalmente não conhece diretamente os microserviços que existem atrás do API Gateway, o roteamento para o microserviço responsável seja feito de forma correta. 

## Autenticação e autorização

A **Autenticação é o processo de verificar a identidade do usuário**, enquanto a **autorização determina quais recursos ou serviços o usuário pode acessar**, baseado em suas permissões. Basicamente, **autenticação diz ao sistema quem você é**, enquanto **autorização diz ao sistema o que você pode fazer**. Muitos API Gateways fornecem uma forma centralizada de validar esse tipo de controle de acesso, eliminando a necessidade de implementar esses processos em todos os microserviços que recebem as requisições diretamente. Abstrair a autenticação e autorização diretamente no API Gateway nos proporciona uma oportunidade de escalabilidade e clareza arquitetural.

Em muitos casos, os API Gateways precisam contar com um servidor de identidade externo para se integrar com provedores de autenticação e autorização.


### Bearer JSON Web Tokens (JWT)

Os Bearer JSON Web Tokens, ou JWT, são tokens que representam uma série de informações que podem ser lidas e validadas entre cliente e servidor. Os JWTs são uma forma eficiente e performática de implementar capacidades de autenticação e autorização em API's Stateless. Os JWTs possuem informações autocontidas, ou seja, quando abertos, possuem todas as informações necessárias para autenticar os usuários.

Os Tokens JWT são compostos por três partes: o **Header**, que contém informações sobre o token, como o **algoritmo utilizado para a assinatura**; o **Payload**, que contém as declarações e informações abertas do usuário, além de metadados importantes para facilitar a integração com o servidor; e a **Signature**, ou assinatura, que é uma **hash gerada pelo servidor no momento da criação do token, baseada em seu conteúdo, garantindo que nenhum atributo ou informação foi alterado**. Tanto o header quanto o payload são codificados em base64 para facilitar o tráfego através de um cabeçalho HTTP, e a assinatura é criada com base nesses valores utilizando algoritmos como HMAC ou uma chave Privada RSA. Todos os campos são separados por um ponto (`.`) e enviados via header no formato:

Abaixo temos um exemplo:

```bash
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJGaWRlbGlzc2F1cm8iLCJpYXQiOjE3MTY4NTM5MDUsImV4cCI6MTc0ODM4OTkwNSwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6Ik1hdGhldXMiLCJTdXJuYW1lIjoiRmlkZWxpcyIsIkVtYWlsIjoibWF0aGV1c0BmaWRlbGlzc2F1cm8uZGV2IiwiUm9sZSI6WyJNYW5hZ2VyIiwiQWRtaW4iXX0.K1i9STmcgsq4LnamxuJUrZYkXYscVTk23JnTukcScAk
```

Decodificando cada um dos campos, ou *"abrindo o JWT"*, podemos ver todas as informações que foram utilizadas para gerar o mesmo, incluindo a assinatura gerada pelo servidor. Se qualquer informação for alterada, o algoritmo usado para gerar o token não irá validar a autenticidade do mesmo.

```bash
❯ echo "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9" | base64 --decode
{"typ":"JWT","alg":"HS256"}
```

```bash
❯ echo "eyJpc3MiOiJGaWRlbGlzc2F1cm8iLCJpYXQiOjE3MTY4NTM5MDUsImV4cCI6MTc0ODM4OTkwNSwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6Ik1hdGhldXMiLCJTdXJuYW1lIjoiRmlkZWxpcyIsIkVtYWlsIjoibWF0aGV1c0BmaWRlbGlzc2F1cm8uZGV2IiwiUm9sZSI6WyJNYW5hZ2VyIiwiQWRtaW4iXX0" | base64 --decode
{"iss":"Fidelissauro","iat":1716853905,"exp":1748389905,"aud":"www.example.com","sub":"jrocket@example.com","GivenName":"Matheus","Surname":"Fidelis","Email":"matheus@fidelissauro.dev","Role":["Manager","Admin"]}
```

```bash
❯ echo "K1i9STmcgsq4LnamxuJUrZYkXYscVTk23JnTukcScAk" | base64 --decode
+X�I9��ʸ.v���T��$]�U96ܙӺ

```

É importante ressaltar que todas as informações utilizadas para compor o JWT podem ser facilmente abertas ao decodificar o base64, então é altamente não recomendado utilizar dados sensíveis para gerar os mesmos.

### OAuth 2.0 & OpenID Connect

### Basic Auth

### Certificados de Cliente e mTLS

### SAML (Security Assertation Markup Language)

### API Keys Customizadas


## Limitação de taxa (Rate Limiting) e Throttling

Limitação de taxa (Rate Limiting) é o processo de **restringir o número de solicitações que um usuário pode fazer a um serviço em um período específico**. Essa é uma estratégia muito valiosa para prevenir abusos de uso e proteger os recursos do backend de saturarem e atuar além da capacidade disponível sem ferir a qualidade. Imagine que você conhece as limitações do serviço de compra de pacotes de backend que responde no basepath `/pacote`. Você sabe que seu serviço atende sem degradar até 100 requisições por segundo e esse é o gargalo limitador desse backend. Você pode utilizar o Rate Limit para segurar as demais requisições que ultrapassarem os 100 TPS no Gateway e evitar passar o volume sobressalente para o serviço. 

O Throttling é a **prática de controlar a quantidade de recursos usados por uma aplicação ou cliente**, geralmente diminuindo ou bloqueando a taxa de solicitações permitidas quando a mesma é ultrapassada. Pode ser consequencia do Rate Limit quando o mesmo é ultrapassado. O throttling pode ser implementado de forma temporária, até que o serviço do backend seja estabilizado. 


## Gerenciamento de APIs e Versionamento

O gerenciamento de APIs envolve a criação, publicação, manutenção e monitoração das APIs. O versionamento é a prática de gerenciar mudanças nas APIs, permitindo que múltiplas versões de uma API coexistam para suportar diferentes clientes e casos de uso ao longo do tempo.

## Monitoramento e Análise de APIs

# Tecnologias e Ferramentas de API Gateway

## Cloud Providers 

## Kong 

## Envoy Based Solutions



### Referências

[What Is an API Gateway?](https://www.nginx.com/learn/api-gateway/)

[JWT Introduction](https://jwt.io/introduction)

