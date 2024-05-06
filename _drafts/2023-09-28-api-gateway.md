---
layout: post
image: assets/images/system-design/escalabilidade-capa.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - API Gateways
---

# Definindo API Gateways 

Em sistemas modernos, as arquiteturas tendem a se tornar mais complexas, granulares e distribuídas. Neste contexto, os API Gateways surgem solução para um problema muito grande, que é a interface consistente para acessar diversos componentes distribuídos. 

Um API Gateway é, fundamentalmente, uma **camada de abstração que fica entre os clientes e os serviços**, fornecendo uma **interface única** e **roteamento entre um ou vários serviços responsáveis por suas rotas**. Um API Gateway pode ser interpretado como um **centralizador de comunicações sincronas entre os diversos microserviços existentes de um determinado ambiente**. Ele recebe todas as chamadas de API, as encaminha para os serviços internos apropriados se baseando em regras predefinidas como basepaths e métodos, e em seguida, retorna as respostas dos serviços ao cliente solicitante. 

O padrão de design de API Gateway envolve uma série de funcionalidades críticas, como **roteamento de requisições**, **autenticação**, **autorização**, **processamento de políticas de segurança**, **rate limit** e **transformação dos payloads** que estão sendo trafegadas, podendo modificar o request e o response quando necessário. Esse tipo de abordagem facilita diversas funções, como roteamento de requisições com base em regras e padrões de acesso, autenticação e autorização, limitação de taxa de uso entre outras coisas que diferenciam os Gateways de [Load Balancers e Proxies Reversos]() convencionais. 

<br>

# API Gateways em Arquiteturas de Microserviços

Em arquiteturas baseadas em microserviços, que podem envolver dezenas ou até centenas de serviços distintos, os API Gateways **simplificam a interação dos clientes com uma quantidade alta de serviços**. Eles abstraem a complexidade dos serviços de backend, proporcionando **um ponto de entrada único e coeso** entre vários serviços que possam existir em seus backends. Ao oferecer um ponto de entrada único para todas as chamadas de API, os API Gateways **reduzem a complexidade para os clientes, que não precisam saber sobre a localização ou a divisão dos serviços internos**. Em linhas gerais, os API Gateways encapsulam a complexidade da distribuição de sistemas e expõe endpoints simplificados, podendo agrupar vários endpoints e redirecioná-los entre vários microserviços e sistemas através de um ponto único de contato. 

![API Gateway](/assets/images/system-design/api-gateway.png)

<br>

# Componentes e Arquitetura de um API Gateway

Esta seção descreve os principais componentes e a estrutura arquitetônica de um API Gateway, destacando como cada parte contribui para a eficiência, segurança e escalabilidade da aplicação. Um API Gateway típico é composto por vários componentes e funcionalidades que trabalham juntos para processar as requisições, como por exemplo **roteamento de requisições**, centralizador de autenticação e autorização, limitador de trafego e mecanismo de throttling, modificação de mensagens e gerenciamento de cachings.

## Roteamento de requisições

O roteamente de requisições centralizada é a funcionalidade central dos padrões de design de API Gateway. Ele permite que com base em informações fornecidas pelo cliente através do próprio protocolo HTTP, que normalmente não conhece diretamente os microserviços que existem atrás do API Gateway, o roteamento para o microserviço responsável seja feito de forma correta. 

## Autenticação e autorização.

## Limitação de taxa (Rate Limiting) e Throttling

## Balanceamento de Carga 

## Gerenciamento de APIs e Versionamento

## Monitoramento e Análise de APIs

# Tecnologias e Ferramentas de API Gateway

## Cloud Providers 

## Kong 

## Envoy Based Solutions



### Referências

[What Is an API Gateway?](https://www.nginx.com/learn/api-gateway/)

