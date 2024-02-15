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

Em sistemas modernos, as arquiteturas se tendem a se tornar mais complexas, granulares e distribuídas. Neste contexto, os API Gateways surgem como componentes de grande valor.

Um API Gateway é, fundamentalmente, uma **camada de abstração que fica entre os clientes e os serviços**, fornecendo uma **interface única e roteamento entre um ou vários serviços responsáveis por suas rotas**. Ele recebe todas as chamadas de API, as encaminha para os serviços internos apropriados e, em seguida, retorna as respostas dos serviços ao cliente solicitante. Este processo envolve uma série de funcionalidades críticas, como **roteamento de requisições**, **autenticação**, **autorização**, **processamento de políticas de segurança**, **rate limit** e **transformação dos payloads** que estão sendo trafegadas, podendo modificar o request e o response quando necessário. Esse tipo de abordagem facilita diversas funções, como roteamento de requisições, autenticação e autorização, limitação de taxa, balanceamento de carga, e muito mais. 


# API Gateways em Arquiteturas de Microserviços

Em arquiteturas baseadas em microserviços, que podem envolver dezenas ou até centenas de serviços distintos, os API Gateways **simplificam a interação dos clientes com a aplicação**. Eles abstraem a complexidade dos serviços de backend, proporcionando** um ponto de entrada único e coeso**. Ao oferecer um ponto de entrada único para todas as chamadas de API, os API Gateways **reduzem a complexidade para os clientes, que não precisam saber sobre a localização ou a divisão dos serviços internos**. Em linhas gerais, os API Gateways encapsulam a complexidade da distribuição de sistemas e expõe endpoints simplificados, podendo agrupar vários endpoints e redirecioná-los entre vários microserviços e sistemas através de um ponto único de contato.


# Componentes e Arquitetura de um API Gateway

Esta seção descreve os principais componentes e a estrutura arquitetônica de um API Gateway, destacando como cada parte contribui para a eficiência, segurança e escalabilidade da aplicação. Um API Gateway típico é composto por vários componentes e funcionalidades que trabalham juntos para processar as requisições, como por exemplo **roteamento de requisições**, centralizador de autenticação e autorização, limitador de trafego e mecanismo de throttling, modificação de mensagens e gerenciamento de cachings.

## Roteamento de requisições

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

