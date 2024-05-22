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

Em sistemas modernos, as arquiteturas tendem a se tornar mais complexas, granulares e distribuídas. Neste contexto, os API Gateways surgem solução para um problema muito grande, que é a interface consistente para acessar diversos componentes através de um único ponto de contato. 

Um API Gateway é uma **camada de abstração entre os clientes e os serviços**, oferecendo uma **interface única** e **roteamento entre vários serviços**. Ele atua como um **centralizador de comunicações síncronas** entre os microserviços de um ambiente específico. O API Gateway recebe todas as chamadas de API, as encaminha para os serviços internos apropriados com base em regras predefinidas (como basepaths e métodos), e depois retorna as respostas dos serviços aos clientes solicitantes.

Muito além de apenas ser um centralizador de requisições, o padrão de design de API Gateway envolve uma série de funcionalidades críticas, como **roteamento de requisições**, **autenticação**, **autorização**, **processamento de políticas de segurança**, **rate limit** e **transformação dos payloads** que estão sendo trafegadas, podendo modificar o request e o response quando necessário. Esse tipo de abordagem facilita diversas funções, como roteamento de requisições com base em regras e padrões de acesso, autenticação e autorização, limitação de taxa de uso entre outras coisas que diferenciam os Gateways de [Load Balancers e Proxies Reversos]() convencionais. 

Importante ressaltar que os Gateways por padrão se baseiam em ser intermediários primariamente de [API's REST]().

## O problema que os API Gateways resolvem?

Imagine que você contrata um serviço de terceiros que disponibiliza uma série de funcionalidades através de sua API. Este parceiro possui diversos microserviços em sua estrutura interna. Para consumir essas funcionalidades, **você precisaria conhecer cada microserviço e suas URLs específicas. Isso pode ser um grande problema**.

Gerenciar as rotas de acesso para cada microserviço interno, que são responsáveis por diferentes domínios e funções, e muitas vezes são mantidos por equipes diferentes, é desnecessário e complicado para o cliente.

É aí que o API Gateway se torna útil. Com uma **única URL de acesso e suas rotas**, o API Gateway **abstrai a complexidade dos microserviços internos**. Assim, os clientes não precisam conhecer os detalhes dos microserviços responsáveis por cada requisição. Esse gerenciamento fica a cargo das equipes técnicas, que são as únicas que realmente precisam dessas informações.


<br>

# API Gateways em Arquiteturas de Microserviços

Em arquiteturas baseadas em microserviços, que podem envolver dezenas ou centenas de serviços distintos, os API Gateways simplificam a interação dos clientes com esses serviços. Eles abstraem a complexidade do backend, proporcionando um ponto de entrada único e coeso para todos os serviços disponíveis.

Ao oferecer um único ponto de entrada para todas as chamadas de API, os API Gateways reduzem a complexidade para os clientes. Isso significa que os clientes não precisam saber onde cada serviço está localizado ou como eles estão divididos internamente.

Basicamente, os API Gateways encapsulam a complexidade dos sistemas distribuídos e expõem endpoints simplificados. Eles podem agrupar vários endpoints e redirecionar as solicitações para diferentes microserviços e sistemas, tudo através de um único ponto de contato.

![API Gateway](/assets/images/system-design/api-gateway.png)

Esse tipo de arquitetura te permite fazer com que cada requisição feita para um `recurso` ou `método` da API descrita no Gateway, seja encaminhado pora um microserviço diferente. Esse tipo de flexibilidade é muito interessante para solucionar problemas de governança e organização de produtos oferecidos internamente ou externamente.  

<br>

# Componentes e Arquitetura de um API Gateway

Esta seção descreve os principais componentes e a estrutura arquitetônica de um API Gateway, destacando como cada parte contribui para a eficiência, segurança e escalabilidade da aplicação. Um API Gateway típico é composto por vários componentes e funcionalidades que trabalham juntos para processar as requisições, como por exemplo **roteamento de requisições**, centralizador de autenticação e autorização, limitador de trafego e mecanismo de throttling, modificação de mensagens e gerenciamento de cachings.

## Roteamento de requisições

O roteamente de requisições centralizada é a funcionalidade central dos padrões de design de API Gateway. Ele permite que com base em informações fornecidas pelo cliente através do próprio protocolo HTTP, que normalmente não conhece diretamente os microserviços que existem atrás do API Gateway, o roteamento para o microserviço responsável seja feito de forma correta. 

## Autenticação e autorização

A **Autenticação é o processo de verificar a identidade do usuário**, enquanto a **autorização determina quais recursos ou serviços o usuário pode acessar**, baseado em suas permissões. Basicamente **Autenticação diz ao sistema quem você é**, enquanto **Autorização diz ao sistema o que você pode fazer**. Muitos API Gateways fornecem uma forma única de validar esse tipo de controle de acesso de forma centralizada para que não seja necessário implementar esse processo em todos os microserviços que recebem as requisições diretamente. Abstrair a autenticação e autorização diretamente no API Gateway nos proporciona um oportunidade de escalabilidade e clareza arquitetural. 

Em muitos casos os API Gateways precisam contar com um servidor de identidade externo para se integrar. 

### Bearer JSON Web Tokens (JWT)

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

